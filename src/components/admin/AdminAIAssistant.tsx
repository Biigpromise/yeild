import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Mic, 
  MicOff, 
  Send, 
  Bot, 
  X, 
  Minimize2, 
  Maximize2,
  Volume2,
  VolumeX,
  Sparkles
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  action?: string;
  target?: string;
  parameters?: any;
  confidence?: number;
  suggestions?: string[];
}

interface AdminAIAssistantProps {
  onNavigate?: (section: string) => void;
  onExecuteAction?: (action: string, parameters: any) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const AdminAIAssistant: React.FC<AdminAIAssistantProps> = ({
  onNavigate,
  onExecuteAction,
  isOpen,
  onToggle
}) => {
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hi! I'm your AI admin assistant. I can help you navigate the dashboard, manage users, analyze data, and perform quick actions. Try saying 'Show me pending tasks' or 'Find user statistics'.",
      timestamp: new Date(),
      confidence: 1.0,
      suggestions: [
        "Show me pending tasks",
        "Navigate to user management", 
        "What's the platform activity?",
        "Create a new announcement"
      ]
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSpeakingEnabled, setIsSpeakingEnabled] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const processAIResponse = async (message: string) => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('admin-ai-assistant', {
        body: { 
          message,
          context: 'admin',
          action_type: 'query'
        }
      });

      if (error) throw error;

      const aiMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: data.response,
        timestamp: new Date(),
        action: data.action,
        target: data.target,
        parameters: data.parameters,
        confidence: data.confidence,
        suggestions: data.suggestions
      };

      setMessages(prev => [...prev, aiMessage]);

      // Execute actions based on AI response
      if (data.action === 'navigate' && data.target && onNavigate) {
        onNavigate(data.target);
        toast.success(`Navigating to ${data.target}`);
      } else if (data.action === 'execute' && onExecuteAction) {
        onExecuteAction(data.target, data.parameters);
      }

      // Speak the response if enabled
      if (isSpeakingEnabled && data.response) {
        await speakText(data.response);
      }

    } catch (error) {
      console.error('AI Assistant error:', error);
      toast.error('AI Assistant encountered an error');
      
      const errorMessage: AIMessage = {
        id: Date.now().toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again or type your request.",
        timestamp: new Date(),
        confidence: 0.0
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice: 'alloy' }
      });

      if (error) throw error;

      const audio = new Audio();
      audio.src = `data:audio/mp3;base64,${data.audioContent}`;
      audio.play();
    } catch (error) {
      console.error('Text-to-speech error:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageText = inputText;
    setInputText('');

    await processAIResponse(messageText);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started...');
    } catch (error) {
      console.error('Recording error:', error);
      toast.error('Could not start recording');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Processing voice command...');
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    try {
      setIsLoading(true);
      
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(',')[1];
        
        const { data, error } = await supabase.functions.invoke('speech-to-text', {
          body: { audio: base64Audio }
        });

        if (error) throw error;

        const transcript = data.text;
        if (transcript) {
          const userMessage: AIMessage = {
            id: Date.now().toString(),
            type: 'user',
            content: `🎙️ ${transcript}`,
            timestamp: new Date()
          };

          setMessages(prev => [...prev, userMessage]);
          await processAIResponse(transcript);
        }
      };
    } catch (error) {
      console.error('Voice processing error:', error);
      toast.error('Could not process voice input');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = async (suggestion: string) => {
    const userMessage: AIMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: suggestion,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await processAIResponse(suggestion);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-96 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px]'} shadow-xl border-primary/20`}>
        <CardHeader className="pb-2 bg-primary/5">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bot className="h-5 w-5 text-primary" />
              AI Assistant
              <Sparkles className="h-4 w-4 text-yellow-500" />
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSpeakingEnabled(!isSpeakingEnabled)}
                className="h-8 w-8 p-0"
              >
                {isSpeakingEnabled ? (
                  <Volume2 className="h-4 w-4" />
                ) : (
                  <VolumeX className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-8 w-8 p-0"
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minimize2 className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex flex-col h-full p-0">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.type === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-sm">{message.content}</div>
                      
                      {message.confidence !== undefined && (
                        <Badge 
                          variant="secondary" 
                          className="mt-2 text-xs"
                        >
                          {Math.round(message.confidence * 100)}% confident
                        </Badge>
                      )}

                      {message.suggestions && message.suggestions.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {message.suggestions.map((suggestion, index) => (
                            <Button
                              key={index}
                              variant="outline"
                              size="sm"
                              className="text-xs h-6"
                              onClick={() => handleSuggestionClick(suggestion)}
                            >
                              {suggestion}
                            </Button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted p-3 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Bot className="h-4 w-4 animate-pulse" />
                        <span className="text-sm">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </ScrollArea>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask me anything about admin tasks..."
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="flex-1"
                />
                <Button
                  onClick={isRecording ? stopRecording : startRecording}
                  variant={isRecording ? "destructive" : "outline"}
                  size="icon"
                  disabled={isLoading}
                >
                  {isRecording ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim() || isLoading}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};