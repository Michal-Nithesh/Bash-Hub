import React from "react";
import { useNavigate } from "react-router-dom";

const FAQ: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="w-full max-w-2xl bg-card rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">Frequently Asked Questions</h1>
        <ul className="list-disc pl-6 mb-6">
          <li>How do I reset my password?</li>
          <li>How can I contact support?</li>
          <li>Where can I find my certificates?</li>
          <li>How do I join the leaderboard?</li>
        </ul>
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

export default FAQ;
