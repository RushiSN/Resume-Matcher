import React from "react";
import { Outlet, Navigate } from "react-router-dom";

export const RecruiterProtectedRoutes = () => {
  const auth = localStorage.getItem('recruiter');
  return auth ? <Outlet /> : <Navigate to='/recruiter-login' />;
};

export const UserProtectedRoutes = () => {
  const auth = localStorage.getItem('user');
  return auth ? <Outlet /> : <Navigate to='/user-login' />;
};