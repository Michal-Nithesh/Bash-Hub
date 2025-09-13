import React, { useState } from 'react';
import { Chatbot } from '@/components/Chatbot';

export const AiTutor: React.FC = () => {
  const [initialMessage, setInitialMessage] = useState<string>('');

  return (
    <div className="h-screen">
      {/* Full page chatbot */}
      <Chatbot
        fullPage={true}
        initialMessage={initialMessage}
      />
    </div>
  );
};

export default AiTutor;