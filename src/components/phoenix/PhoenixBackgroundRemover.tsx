import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { removeBackground, loadImage } from '@/utils/backgroundRemoval';
import { toast } from 'sonner';

export const PhoenixBackgroundRemover: React.FC = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const processPhoenixImage = async () => {
    setIsProcessing(true);
    try {
      // Load the current phoenix image
      const response = await fetch('/phoenix-bird.png');
      const blob = await response.blob();
      
      // Load as image element
      const imageElement = await loadImage(blob);
      
      // Remove background
      toast.info('Removing background from phoenix image...');
      const processedBlob = await removeBackground(imageElement);
      
      // Create download link
      const url = URL.createObjectURL(processedBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'phoenix-bird-no-bg.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Background removed successfully! Image downloaded.');
    } catch (error) {
      console.error('Error processing phoenix image:', error);
      toast.error('Failed to remove background from phoenix image.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="text-lg font-semibold mb-2">Phoenix Background Remover</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Remove the background from the current phoenix image to make it more realistic.
      </p>
      <Button 
        onClick={processPhoenixImage} 
        disabled={isProcessing}
        className="w-full"
      >
        {isProcessing ? 'Processing...' : 'Remove Phoenix Background'}
      </Button>
    </div>
  );
};