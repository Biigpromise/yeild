import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AIResponse {
  response: string;
  action: string;
  target: string | null;
  parameters: any;
  confidence: number;
  suggestions: string[];
}

export const useAdminAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const sendMessage = useCallback(async (message: string): Promise<AIResponse | null> => {
    setIsLoading(true);
    
    try {
      console.log('Sending message to AI:', message);
      
      const { data, error } = await supabase.functions.invoke('admin-ai-assistant', {
        body: { 
          message,
          context: 'admin',
          action_type: 'query'
        }
      });

      if (error) {
        console.error('AI Assistant error:', error);
        throw error;
      }

      console.log('AI Response received:', data);
      return data;

    } catch (error) {
      console.error('Error communicating with AI:', error);
      toast.error('Failed to communicate with AI assistant');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const transcribeAudio = useCallback(async (audioBlob: Blob): Promise<string | null> => {
    try {
      console.log('Transcribing audio...');
      
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onloadend = async () => {
          try {
            const base64Audio = (reader.result as string).split(',')[1];
            
            const { data, error } = await supabase.functions.invoke('speech-to-text', {
              body: { audio: base64Audio }
            });

            if (error) throw error;
            resolve(data.text);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(audioBlob);
      });

    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe audio');
      return null;
    }
  }, []);

  const speakText = useCallback(async (text: string, voice: string = 'alloy'): Promise<void> => {
    try {
      console.log('Converting text to speech...');
      
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { text, voice }
      });

      if (error) throw error;

      const audio = new Audio();
      audio.src = `data:audio/mp3;base64,${data.audioContent}`;
      await audio.play();

    } catch (error) {
      console.error('Error with text-to-speech:', error);
      // Don't show error toast for TTS failures as they're not critical
    }
  }, []);

  const startVoiceRecording = useCallback(async (): Promise<{
    stop: () => Promise<string | null>;
    cancel: () => void;
  }> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      
      const audioChunks: Blob[] = [];
      setIsRecording(true);

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunks.push(event.data);
        }
      };

      mediaRecorder.start(100); // Collect data every 100ms

      const stop = async (): Promise<string | null> => {
        return new Promise((resolve) => {
          mediaRecorder.onstop = async () => {
            setIsRecording(false);
            stream.getTracks().forEach(track => track.stop());
            
            if (audioChunks.length > 0) {
              const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
              const transcript = await transcribeAudio(audioBlob);
              resolve(transcript);
            } else {
              resolve(null);
            }
          };
          
          mediaRecorder.stop();
        });
      };

      const cancel = () => {
        setIsRecording(false);
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
      };

      return { stop, cancel };

    } catch (error) {
      console.error('Error starting voice recording:', error);
      toast.error('Could not access microphone');
      setIsRecording(false);
      throw error;
    }
  }, [transcribeAudio]);

  return {
    sendMessage,
    transcribeAudio,
    speakText,
    startVoiceRecording,
    isLoading,
    isRecording
  };
};