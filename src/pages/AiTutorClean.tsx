import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Chatbot } from '@/components/Chatbot';

export const AiTutor: React.FC = () => {
  const { user, signOut } = useAuth();
  const [initialMessage, setInitialMessage] = useState<string>('');

  return (
    <div className="h-screen flex flex-col">
      <Navbar isAuthenticated={!!user} onLogout={signOut} />
      
      {/* Full-page chatbot */}
      <div className="flex-1">
        <Chatbot
          fullPage={true}
          initialMessage={initialMessage}
        />
      </div>
    </div>
  );
};

export default AiTutor;