import React, { useState, useRef, useEffect } from 'react';
import { Send, Upload, Bot, User, FileText, Loader2, X, Minimize2, Maximize2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { chatbotService } from '@/lib/chatbotService';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'file' | 'analysis';
  fileInfo?: {
    name: string;
    size: number;
    type: string;
  };
}

interface ChatbotProps {
  isMinimized?: boolean;
  onToggleMinimize?: () => void;
  onClose?: () => void;
  initialMessage?: string;
  fullPage?: boolean; // New prop to control full page mode
}

export const Chatbot: React.FC<ChatbotProps> = ({ 
  isMinimized = false, 
  onToggleMinimize, 
  onClose, 
  initialMessage,
  fullPage = false 
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm your AI assistant. I can help you with questions, analyze files, and provide academic support. How can I assist you today?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{ springBoot: boolean; gemini: boolean } | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Handle initial message
  useEffect(() => {
    if (initialMessage && initialMessage.trim()) {
      setInputMessage(initialMessage);
    }
  }, [initialMessage]);

  // Check backend health on component mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await chatbotService.checkBackendHealth();
        setConnectionStatus(health);
      } catch (error) {
        console.error('Health check failed:', error);
        setConnectionStatus({ springBoot: false, gemini: false });
      }
    };
    
    checkHealth();
  }, []);

  // Auto scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const generateMessageId = () => {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  };

  const addMessage = (content: string, sender: 'user' | 'bot', type: 'text' | 'file' | 'analysis' = 'text', fileInfo?: any) => {
    const newMessage: Message = {
      id: generateMessageId(),
      content,
      sender,
      timestamp: new Date(),
      type,
      fileInfo
    };
    setMessages(prev => [...prev, newMessage]);
    return newMessage;
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    
    // Add user message
    addMessage(userMessage, 'user');
    setIsLoading(true);

    try {
      const botResponse = await chatbotService.sendChatMessage(userMessage);
      addMessage(botResponse, 'bot');
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      addMessage(`I apologize, but I encountered an error: ${errorMessage}`, 'bot');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
      
      // Add file message
      addMessage(
        `Uploaded file: ${file.name}`,
        'user',
        'file',
        {
          name: file.name,
          size: file.size,
          type: file.type
        }
      );
    }
  };

  const analyzeFile = async () => {
    if (!uploadedFile || isAnalyzing) return;

    setIsAnalyzing(true);
    
    // Add analyzing message
    addMessage('Analyzing your file...', 'bot', 'analysis');

    try {
      const analysisResult = await chatbotService.analyzeFile(uploadedFile);
      addMessage(analysisResult, 'bot', 'analysis');
      
      // Clear uploaded file
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('File analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during file analysis.';
      addMessage(`File analysis failed: ${errorMessage}`, 'bot');
      
      // Clear uploaded file on error
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const renderMessage = (message: Message) => {
    const isUser = message.sender === 'user';
    
    return (
      <div key={message.id} className={`flex gap-3 mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
        {!isUser && (
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-primary" />
          </div>
        )}
        
        <div className={`max-w-[80%] ${isUser ? 'order-first' : ''}`}>
          <div className={`rounded-lg px-3 py-2 ${
            isUser 
              ? 'bg-primary text-primary-foreground ml-auto' 
              : 'bg-muted'
          }`}>
            {message.type === 'file' && message.fileInfo && (
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{message.fileInfo.name}</span>
                <Badge variant="outline" className="text-xs">
                  {formatFileSize(message.fileInfo.size)}
                </Badge>
              </div>
            )}
            
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            
            {message.type === 'analysis' && (
              <Badge variant="secondary" className="mt-2">
                <Bot className="w-3 h-3 mr-1" />
                AI Analysis
              </Badge>
            )}
          </div>
          
          <div className={`text-xs text-muted-foreground mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
        
        {isUser && (
          <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
            <User className="w-4 h-4 text-accent" />
          </div>
        )}
      </div>
    );
  };

  if (isMinimized && !fullPage) {
    return (
      <Card className="fixed bottom-4 right-4 w-80 shadow-lg border-2 z-50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bot className="w-4 h-4 text-primary" />
              AI Assistant
            </CardTitle>
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" onClick={onToggleMinimize} className="p-1 h-6 w-6">
                <Maximize2 className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={onClose} className="p-1 h-6 w-6">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pb-3">
          <p className="text-xs text-muted-foreground">Click to expand and start chatting</p>
        </CardContent>
      </Card>
    );
  }

  // Full page layout
  if (fullPage) {
    return (
      <div className="h-full w-full flex flex-col bg-background">
        {/* Header */}
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-semibold">AI Assistant</h1>
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>
            {connectionStatus && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus.springBoot ? 'bg-green-500' : 'bg-red-500'}`} title={`Spring Boot: ${connectionStatus.springBoot ? 'Connected' : 'Disconnected'}`} />
                  <span className="text-xs text-muted-foreground">Backend</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className={`w-2 h-2 rounded-full ${connectionStatus.gemini ? 'bg-green-500' : 'bg-yellow-500'}`} title={`Gemini AI: ${connectionStatus.gemini ? 'Connected' : 'Limited'}`} />
                  <span className="text-xs text-muted-foreground">AI</span>
                </div>
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Ask questions, upload files for analysis, or get academic help
          </p>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="max-w-[80%]">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* File Upload Section */}
        {uploadedFile && (
          <div className="border-t bg-muted/50 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4" />
                <span className="text-sm font-medium">{uploadedFile.name}</span>
                <Badge variant="outline" className="text-xs">
                  {formatFileSize(uploadedFile.size)}
                </Badge>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setUploadedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 h-6 w-6 ml-auto"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
              <Button
                size="sm"
                onClick={analyzeFile}
                disabled={isAnalyzing}
                className="w-full"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  'Analyze File'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t bg-background p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex gap-3">
              <div className="flex-1">
                <Textarea
                  placeholder="Type your message..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={isLoading}
                  className="min-h-0 resize-none"
                  rows={3}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isLoading}
                  className="px-4"
                >
                  <Send className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="px-4"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
            />
            
            <div className="text-xs text-muted-foreground mt-2 text-center">
              Press Enter to send, Shift+Enter for new line
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Original floating window layout
  return (
    <Card className="fixed bottom-4 right-4 w-96 h-[600px] shadow-lg border-2 z-50 flex flex-col">
      <CardHeader className="pb-2 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            AI Assistant
            {isLoading && <Loader2 className="w-4 h-4 animate-spin text-primary" />}
          </CardTitle>
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={onToggleMinimize} className="p-1 h-8 w-8">
              <Minimize2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={onClose} className="p-1 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Ask questions, upload files for analysis, or get academic help
          </p>
          {connectionStatus && (
            <div className="flex items-center gap-1">
              <div className={`w-2 h-2 rounded-full ${connectionStatus.springBoot ? 'bg-green-500' : 'bg-red-500'}`} title={`Spring Boot: ${connectionStatus.springBoot ? 'Connected' : 'Disconnected'}`} />
              <div className={`w-2 h-2 rounded-full ${connectionStatus.gemini ? 'bg-green-500' : 'bg-yellow-500'}`} title={`Gemini AI: ${connectionStatus.gemini ? 'Connected' : 'Limited'}`} />
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="max-w-[80%]">
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* File Upload Section */}
        {uploadedFile && (
          <div className="p-3 bg-muted/50 border-t">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">{uploadedFile.name}</span>
              <Badge variant="outline" className="text-xs">
                {formatFileSize(uploadedFile.size)}
              </Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setUploadedFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
                className="p-1 h-6 w-6 ml-auto"
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
            <Button
              size="sm"
              onClick={analyzeFile}
              disabled={isAnalyzing}
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : (
                'Analyze File'
              )}
            </Button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-3 border-t bg-background">
          <div className="flex gap-2">
            <div className="flex-1">
              <Textarea
                placeholder="Type your message..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={isLoading}
                className="min-h-0 resize-none"
                rows={2}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-3"
              >
                <Send className="w-4 h-4" />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="px-3"
              >
                <Upload className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept=".txt,.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
          />
          
          <div className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </CardContent>
    </Card>
  );
};