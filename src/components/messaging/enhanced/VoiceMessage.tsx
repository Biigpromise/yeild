import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Mic, MicOff, Play, Pause, Square, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceMessageProps {
  onSendVoice: (audioBlob: Blob, duration: number) => void;
  disabled?: boolean;
}

interface VoicePlayerProps {
  audioUrl: string;
  duration: number;
  transcript?: string;
}

export const VoiceRecorder: React.FC<VoiceMessageProps> = ({
  onSendVoice,
  disabled = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout>();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setDuration(0);

      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Could not access microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        intervalRef.current = setInterval(() => {
          setDuration(prev => prev + 1);
        }, 1000);
      } else {
        mediaRecorderRef.current.pause();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const discardRecording = () => {
    stopRecording();
    setAudioBlob(null);
    setDuration(0);
  };

  const sendVoiceMessage = () => {
    if (audioBlob && duration > 0) {
      onSendVoice(audioBlob, duration);
      setAudioBlob(null);
      setDuration(0);
    }
  };

  const playPreview = () => {
    if (audioBlob && !audioRef.current) {
      const url = URL.createObjectURL(audioBlob);
      audioRef.current = new Audio(url);
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        if (audioRef.current) {
          URL.revokeObjectURL(audioRef.current.src);
          audioRef.current = null;
        }
      };
    }

    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (audioBlob) {
    // Preview mode
    return (
      <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={playPreview}
          className="h-8 w-8 p-0"
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium">Voice message</span>
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={discardRecording}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          onClick={sendVoiceMessage}
          size="sm"
          className="h-8 px-3"
        >
          Send
        </Button>
      </div>
    );
  }

  if (isRecording) {
    // Recording mode
    return (
      <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
        <Button
          variant="ghost"
          size="sm"
          onClick={pauseRecording}
          className="h-8 w-8 p-0"
        >
          {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
        </Button>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              {isPaused ? 'Paused' : 'Recording'}
            </span>
            <span className="text-xs text-muted-foreground">{formatTime(duration)}</span>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={discardRecording}
          className="h-8 w-8 p-0 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <Button
          onClick={stopRecording}
          size="sm"
          className="h-8 w-8 p-0"
        >
          <Square className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  // Default state
  return (
    <Button
      onClick={startRecording}
      disabled={disabled}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
    >
      <Mic className="h-4 w-4" />
    </Button>
  );
};

export const VoicePlayer: React.FC<VoicePlayerProps> = ({
  audioUrl,
  duration,
  transcript
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateProgress = () => {
        const current = audio.currentTime;
        const total = audio.duration || duration;
        setCurrentTime(current);
        setProgress((current / total) * 100);
      };

      const onEnded = () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
      };

      audio.addEventListener('timeupdate', updateProgress);
      audio.addEventListener('ended', onEnded);

      return () => {
        audio.removeEventListener('timeupdate', updateProgress);
        audio.removeEventListener('ended', onEnded);
      };
    }
  }, [audioUrl, duration]);

  const togglePlay = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
    }

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg max-w-xs">
      <Button
        variant="ghost"
        size="sm"
        onClick={togglePlay}
        className="h-8 w-8 p-0 flex-shrink-0"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 bg-primary rounded-full" />
          <span className="text-xs font-medium">Voice message</span>
        </div>
        
        <Progress value={progress} className="h-1 mb-1" />
        
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        {transcript && (
          <div className="mt-2 text-xs text-muted-foreground italic">
            "{transcript}"
          </div>
        )}
      </div>
    </div>
  );
};