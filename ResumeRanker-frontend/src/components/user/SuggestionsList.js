import React from "react";

const SuggestionsList = ({ suggestions }) => {
  // Ensure suggestions exist, or use an empty array
  const links = suggestions || [];

  return (
    <div className="container container-sm shadow p-3">
      <h4>Interview Preparation Videos:</h4>
      <ul className="list-group">
        {links.length > 0 ? (
          links.map((link, index) => (
            <li key={index} className="list-group-item">
              <a href={link} target="_blank" rel="noopener noreferrer">
                {link}
              </a>
            </li>
          ))
        ) : (
          <li className="list-group-item">No suggestions available</li>
        )}
      </ul>
    </div>
  );
};

export default SuggestionsList;
