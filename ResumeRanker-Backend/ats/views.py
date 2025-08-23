import secrets
import string
import base64
import io
from PIL import Image
import pdf2image
from rest_framework.views import APIView
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import google.generativeai as genai
import json
from django.shortcuts import get_object_or_404
from .models import Application, Selection
from .serializers import SelectionSerializer
from django.utils import timezone
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

genai.configure(api_key="AIzaSyB1FAPyb-3z5qeaioaN18SdPt-QrnwrDp8")

def get_gemini_response(input_text, pdf_content, prompt):
    model = genai.GenerativeModel('gemini-1.5-flash')
    response = model.generate_content([input_text, pdf_content[0], prompt])
    return response.text

def input_pdf_setup_from_base64(base64_pdf):
    try:
        # Decode the base64 PDF to bytes
        pdf_bytes = base64.b64decode(base64_pdf)
        # Convert PDF bytes to images
        images = pdf2image.convert_from_bytes(pdf_bytes)
        first_page = images[0]

        # Convert the first page image to bytes
        img_byte_arr = io.BytesIO()
        first_page.save(img_byte_arr, format='JPEG')
        img_byte_arr = img_byte_arr.getvalue()

        # Prepare the pdf_parts
        pdf_parts = [
            {
                "mime_type": "image/jpeg",
                "data": base64.b64encode(img_byte_arr).decode()
            }
        ]
        return pdf_parts
    except Exception as e:
        raise ValueError("Error processing PDF: " + str(e))

def remove_json_code_block(input_string):
    # Check if the input string starts with '```json' and ends with '```'
    if input_string.startswith("```json") and input_string.endswith("```"):
        # Remove the '```json' at the start and '```' at the end
        return input_string[7:-3].strip()  # Removing '```json' (7 characters) and '```' (3 characters)
    else:
        # If the string doesn't match the pattern, return it as is
        return input_string
    
class MatchingRateView(APIView):
    def post(self, request):
        try:
            # Parse the JSON body
            data = json.loads(request.body.decode('utf-8'))
            base64_pdf = data.get('resume')
            job_title = data.get('job_title')
            job_description = data.get('job_description')
            job_skills = data.get('job_skills')
            job_experience = data.get('job_experience')

            if not base64_pdf:
                return JsonResponse({'error': 'No resume provided'}, status=400)

            # Remove data URL prefix if present
            if base64_pdf.startswith("data:application/pdf;base64,"):
                base64_pdf = base64_pdf.split(",")[1]

            input_text = f"""
            {job_title}
            {job_description}
            Skills: {job_skills}
            Experience: {job_experience} Years
            """

            getMatchingRatePrompt = f"""
            You are an experienced ATS (Applicant Tracking System) scanner with a deep understanding of {job_title} and its requirements. 
            Your task is to evaluate the resume against the provided job description. Please provide the percentage only of match between the resume and job requirements as output.
            Only Percentage I want, I want only matching rate. save in your memory. I don't want any other description, I just want the matching rate.
            """

            getSuggestionsPrompt = f"""
            Also Suggest 3 YouTube Video Search Links for example : https://www.youtube.com/results?search_query=java+developer+interview 
            For Interview Preparation Related to {job_description}.
            Key should be only "suggestion" in response with json even dont give ```json.
            Just do not generate json when you are generating the json response.
            the plane response should be there.
            Only Object should be there. NO PREAMBLE.
            """
            
            pdf_content = input_pdf_setup_from_base64(base64_pdf)
            matchingRate = get_gemini_response(input_text, pdf_content, getMatchingRatePrompt)

            suggestions = get_gemini_response(input_text, pdf_content, getSuggestionsPrompt)
            print(suggestions)
            cleanedSuggestions = remove_json_code_block(suggestions)
            print(cleanedSuggestions)

            return JsonResponse({'message': 'File uploaded successfully', 'rate': matchingRate, 'suggestions': cleanedSuggestions})
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)


class GetSelectedApplicants(APIView):
    def get(self, request, job_id):
        try:
            selected_applications = Selection.objects.filter(application__job_id=job_id).values_list('application_id', flat=True)
            return JsonResponse({'application_ids': list(selected_applications)})
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)



class SelectionView(APIView):
    def post(self, request):
        try:
            data = request.data
            application_ids = data.get('application_ids')

            if not application_ids:
                return JsonResponse({'success': False, 'error': 'No application IDs provided'}, status=400)

            new_selections = []
            new_selected_emails = []
            
            for app_id in application_ids:
                application = Application.objects.filter(pk=app_id).first()
                if not application:
                    continue  # Skip if application does not exist

                # Check if application is already selected
                if Selection.objects.filter(application=application.application_id).exists():
                    continue  # Skip already selected applications

                # Generate unique selection ID
                selection_id = ''.join(secrets.choice(string.digits) for _ in range(12))
                
                selection_data = {
                    'selection_id': selection_id,
                    'application': application.application_id,
                    'selection_time': timezone.now(),
                }
                new_selections.append(selection_data)
                new_selected_emails.append(application.user.email)

                # Render email template
                email_html = render_to_string('selection_email.html', {'application_id': app_id})

                # Send email to newly selected applicants
                send_mail(
                    subject='Your Application Selection',
                    message="Your application has been selected!",  # Plain text fallback
                    html_message=email_html,  # HTML email
                    from_email='services.propad@gmail.com',
                    recipient_list=[application.user.email],
                    fail_silently=False,
                )

            if not new_selections:
                return JsonResponse({'success': False, 'message': 'No new applications were selected'}, status=200)

            # Save new selections
            serializer = SelectionSerializer(data=new_selections, many=True)
            if serializer.is_valid():
                serializer.save()
                return JsonResponse({'success': True, 'message': 'Selected successfully', 'selected_emails': new_selected_emails})
            return JsonResponse({'success': False, 'error': serializer.errors}, status=400)

        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=500)

class UnSelectView(APIView):
    
    def post(self, request):
        application_id = request.data.get('application_id')
        try:
            selection = Selection.objects.get(application=application_id)
            print(selection)
            selection.delete()
            return JsonResponse({"message": "Application Unselected successfully"})
        except selection.DoesNotExist:
            return JsonResponse({'success': False, 'error': 'Application not found'}, status=404)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)