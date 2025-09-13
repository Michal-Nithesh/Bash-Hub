import React from "react";
import { useNavigate } from "react-router-dom";

const HelpCentre: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Help Centre</h1>
        <p className="mb-4 text-center text-lg">Welcome to the Help Centre! Here you can find answers to common questions and get support.</p>
        <ul className="list-disc pl-6 mb-6">
          <li>How to use the platform</li>
          <li>Account and profile management</li>
          <li>Contacting support</li>
          <li>Frequently Asked Questions (FAQ)</li>
        </ul>
        <div className="text-center mb-4">
          <a href="/contact" className="btn btn-primary">Contact Support</a>
        </div>
        <button
          type="button"
          className="btn btn-secondary w-full"
          onClick={() => navigate(-1)}
        >
          Back
        </button>
      </div>
    </div>
  );
};

export default HelpCentre;
