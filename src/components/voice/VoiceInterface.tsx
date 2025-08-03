import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Phone, PhoneOff, MessageSquare, Waves } from 'lucide-react';
import { toast } from 'sonner';
import { RealtimeChat } from '@/utils/RealtimeAudio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VoiceInterfaceProps {
  onSpeakingChange?: (speaking: boolean) => void;
  onTranscriptUpdate?: (transcript: string) => void;
}

const AVAILABLE_VOICES = [
  { id: 'alloy', name: 'Alloy', description: 'Neutral, balanced voice' },
  { id: 'echo', name: 'Echo', description: 'Friendly, warm voice' },
  { id: 'shimmer', name: 'Shimmer', description: 'Gentle, soothing voice' },
  { id: 'sage', name: 'Sage', description: 'Wise, mature voice' },
  { id: 'ballad', name: 'Ballad', description: 'Expressive, dynamic voice' },
  { id: 'coral', name: 'Coral', description: 'Bright, energetic voice' },
  { id: 'ash', name: 'Ash', description: 'Deep, confident voice' },
  { id: 'verse', name: 'Verse', description: 'Melodic, articulate voice' },
];

export const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ 
  onSpeakingChange,
  onTranscriptUpdate 
}) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('alloy');
  const [transcript, setTranscript] = useState('');
  const [conversationLog, setConversationLog] = useState<Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>>([]);
  
  const chatRef = useRef<RealtimeChat | null>(null);

  const handleMessage = (event: any) => {
    console.log('Received message:', event);
    
    // Handle different event types
    switch (event.type) {
      case 'response.audio.delta':
        setIsSpeaking(true);
        onSpeakingChange?.(true);
        break;
        
      case 'response.audio.done':
        setIsSpeaking(false);
        onSpeakingChange?.(false);
        break;
        
      case 'input_audio_buffer.speech_started':
        setIsListening(true);
        break;
        
      case 'input_audio_buffer.speech_stopped':
        setIsListening(false);
        break;
        
      case 'conversation.item.input_audio_transcription.completed':
        const userTranscript = event.transcript;
        setTranscript(userTranscript);
        onTranscriptUpdate?.(userTranscript);
        setConversationLog(prev => [...prev, {
          role: 'user',
          content: userTranscript,
          timestamp: new Date()
        }]);
        break;
        
      case 'response.text.delta':
        // Update assistant response in real-time
        setConversationLog(prev => {
          const updated = [...prev];
          const lastItem = updated[updated.length - 1];
          if (lastItem?.role === 'assistant') {
            lastItem.content += event.delta;
          } else {
            updated.push({
              role: 'assistant',
              content: event.delta,
              timestamp: new Date()
            });
          }
          return updated;
        });
        break;
        
      case 'response.done':
        console.log('Response completed');
        break;
        
      default:
        console.log('Unhandled event type:', event.type);
    }
  };

  const startConversation = async () => {
    setIsLoading(true);
    try {
      const instructions = `You are an AI assistant participating in a community chat. Be conversational, helpful, and engaging. 
      You can help users with questions, provide information, and participate in discussions. 
      Keep your responses natural and conversational. Respond in a friendly, approachable tone.
      You are speaking with users in real-time voice chat, so keep responses concise but thoughtful.`;
      
      chatRef.current = new RealtimeChat(handleMessage);
      await chatRef.current.init(instructions, selectedVoice);
      setIsConnected(true);
      
      toast.success("Voice chat connected! Start speaking to interact with the AI assistant.");
    } catch (error) {
      console.error('Error starting conversation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to start voice conversation');
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    chatRef.current?.disconnect();
    setIsConnected(false);
    setIsSpeaking(false);
    setIsListening(false);
    onSpeakingChange?.(false);
    setConversationLog([]);
    toast.info("Voice conversation ended");
  };

  const sendTextMessage = async (text: string) => {
    if (!chatRef.current || !isConnected) return;
    
    try {
      await chatRef.current.sendMessage(text);
      setConversationLog(prev => [...prev, {
        role: 'user',
        content: text,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  useEffect(() => {
    return () => {
      chatRef.current?.disconnect();
    };
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto border-border bg-card/95 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Waves className="h-5 w-5 text-primary" />
          AI Voice Assistant
          {isConnected && (
            <Badge variant={isSpeaking ? "default" : isListening ? "secondary" : "outline"}>
              {isSpeaking ? "Speaking" : isListening ? "Listening" : "Ready"}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Voice Selection */}
        {!isConnected && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Voice Selection</label>
            <Select value={selectedVoice} onValueChange={setSelectedVoice}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {AVAILABLE_VOICES.map(voice => (
                  <SelectItem key={voice.id} value={voice.id}>
                    <div>
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-sm text-muted-foreground">{voice.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Connection Controls */}
        <div className="flex gap-2">
          {!isConnected ? (
            <Button 
              onClick={startConversation}
              disabled={isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Connecting...
                </>
              ) : (
                <>
                  <Phone className="h-4 w-4 mr-2" />
                  Start Voice Chat
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={endConversation}
              variant="destructive"
              className="flex-1"
            >
              <PhoneOff className="h-4 w-4 mr-2" />
              End Conversation
            </Button>
          )}
        </div>

        {/* Status Indicators */}
        {isConnected && (
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Mic className={`h-4 w-4 ${isListening ? 'text-green-500' : 'text-muted-foreground'}`} />
              <span className="text-sm">
                {isListening ? 'Listening...' : 'Speak to interact'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Waves className={`h-4 w-4 ${isSpeaking ? 'text-blue-500 animate-pulse' : 'text-muted-foreground'}`} />
              <span className="text-sm">
                {isSpeaking ? 'AI Speaking...' : 'AI Ready'}
              </span>
            </div>
          </div>
        )}

        {/* Conversation Log */}
        {conversationLog.length > 0 && (
          <div className="space-y-2 max-h-60 overflow-y-auto">
            <div className="text-sm font-medium">Conversation</div>
            {conversationLog.map((entry, index) => (
              <div 
                key={index}
                className={`p-2 rounded-lg text-sm ${
                  entry.role === 'user' 
                    ? 'bg-primary/10 ml-4' 
                    : 'bg-muted/50 mr-4'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={entry.role === 'user' ? 'default' : 'secondary'} className="text-xs">
                    {entry.role === 'user' ? 'You' : 'AI'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {entry.timestamp.toLocaleTimeString()}
                  </span>
                </div>
                <div>{entry.content}</div>
              </div>
            ))}
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-muted-foreground text-center p-2 bg-muted/20 rounded">
          {isConnected 
            ? "Speak naturally - the AI will respond in real-time. There's no need to wait for prompts."
            : "Click 'Start Voice Chat' to begin a real-time conversation with the AI assistant."
          }
        </div>
      </CardContent>
    </Card>
  );
};