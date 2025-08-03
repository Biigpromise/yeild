import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Palette, Brush, Square, Circle, Type, Undo, Redo, Trash2, Download, Share2 } from 'lucide-react';
import { toast } from 'sonner';

interface WhiteboardProps {
  chatId: string;
  onSave?: (imageData: string) => void;
}

interface DrawingPath {
  id: string;
  points: { x: number; y: number }[];
  color: string;
  width: number;
  tool: 'pen' | 'brush' | 'rect' | 'circle' | 'text';
  text?: string;
}

const COLORS = [
  '#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', 
  '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000'
];

const BRUSH_SIZES = [2, 5, 10, 15, 20];

export const CollaborativeWhiteboard: React.FC<WhiteboardProps> = ({ chatId, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'brush' | 'rect' | 'circle' | 'text'>('pen');
  const [currentColor, setCurrentColor] = useState('#000000');
  const [currentWidth, setCurrentWidth] = useState(5);
  const [paths, setPaths] = useState<DrawingPath[]>([]);
  const [undoStack, setUndoStack] = useState<DrawingPath[][]>([]);
  const [redoStack, setRedoStack] = useState<DrawingPath[][]>([]);
  const [currentPath, setCurrentPath] = useState<DrawingPath | null>(null);

  const getCanvasPoint = useCallback((e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }, []);

  const startDrawing = useCallback((e: React.MouseEvent) => {
    const point = getCanvasPoint(e);
    const newPath: DrawingPath = {
      id: Date.now().toString(),
      points: [point],
      color: currentColor,
      width: currentWidth,
      tool: currentTool
    };
    
    setCurrentPath(newPath);
    setIsDrawing(true);
  }, [getCanvasPoint, currentColor, currentWidth, currentTool]);

  const draw = useCallback((e: React.MouseEvent) => {
    if (!isDrawing || !currentPath) return;
    
    const point = getCanvasPoint(e);
    setCurrentPath(prev => prev ? {
      ...prev,
      points: [...prev.points, point]
    } : null);
  }, [isDrawing, currentPath, getCanvasPoint]);

  const stopDrawing = useCallback(() => {
    if (currentPath && isDrawing) {
      setUndoStack(prev => [...prev, paths]);
      setPaths(prev => [...prev, currentPath]);
      setRedoStack([]);
    }
    setIsDrawing(false);
    setCurrentPath(null);
  }, [currentPath, isDrawing, paths]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw completed paths
    paths.forEach(path => {
      if (path.points.length < 2) return;

      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(path.points[0].x, path.points[0].y);
      
      for (let i = 1; i < path.points.length; i++) {
        ctx.lineTo(path.points[i].x, path.points[i].y);
      }
      
      ctx.stroke();
    });

    // Draw current path
    if (currentPath && currentPath.points.length > 1) {
      ctx.strokeStyle = currentPath.color;
      ctx.lineWidth = currentPath.width;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      ctx.beginPath();
      ctx.moveTo(currentPath.points[0].x, currentPath.points[0].y);
      
      for (let i = 1; i < currentPath.points.length; i++) {
        ctx.lineTo(currentPath.points[i].x, currentPath.points[i].y);
      }
      
      ctx.stroke();
    }
  }, [paths, currentPath]);

  React.useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  const undo = () => {
    if (undoStack.length > 0) {
      setRedoStack(prev => [paths, ...prev]);
      const previousState = undoStack[undoStack.length - 1];
      setPaths(previousState);
      setUndoStack(prev => prev.slice(0, -1));
    }
  };

  const redo = () => {
    if (redoStack.length > 0) {
      setUndoStack(prev => [...prev, paths]);
      const nextState = redoStack[0];
      setPaths(nextState);
      setRedoStack(prev => prev.slice(1));
    }
  };

  const clear = () => {
    setUndoStack(prev => [...prev, paths]);
    setPaths([]);
    setRedoStack([]);
  };

  const saveWhiteboard = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL('image/png');
    onSave?.(imageData);
    
    // Create download link
    const link = document.createElement('a');
    link.download = `whiteboard_${chatId}_${Date.now()}.png`;
    link.href = imageData;
    link.click();
    
    toast.success('Whiteboard saved!');
  };

  const shareWhiteboard = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>(resolve => 
        canvas.toBlob(resolve, 'image/png')
      );
      
      if (!blob) throw new Error('Failed to create image');

      if (navigator.share) {
        await navigator.share({
          title: 'Shared Whiteboard',
          files: [new File([blob], 'whiteboard.png', { type: 'image/png' })]
        });
      } else {
        // Fallback: copy image data
        const imageData = canvas.toDataURL();
        await navigator.clipboard.writeText(`Whiteboard: ${imageData}`);
        toast.success('Whiteboard copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing whiteboard:', error);
      toast.error('Failed to share whiteboard');
    }
  };

  return (
    <Card className="border-border bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Collaborative Whiteboard
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/50 rounded-lg">
          {/* Tools */}
          <div className="flex gap-1">
            <Button
              variant={currentTool === 'pen' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('pen')}
            >
              <Brush className="h-4 w-4" />
            </Button>
            <Button
              variant={currentTool === 'brush' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCurrentTool('brush')}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>

          {/* Colors */}
          <div className="flex gap-1">
            {COLORS.map(color => (
              <button
                key={color}
                className={`w-6 h-6 rounded border-2 ${
                  currentColor === color ? 'border-foreground' : 'border-border'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setCurrentColor(color)}
              />
            ))}
          </div>

          {/* Brush Sizes */}
          <div className="flex gap-1">
            {BRUSH_SIZES.map(size => (
              <Button
                key={size}
                variant={currentWidth === size ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentWidth(size)}
                className="w-8 h-8 p-0"
              >
                <div
                  className="bg-current rounded-full"
                  style={{ 
                    width: Math.min(size, 16), 
                    height: Math.min(size, 16) 
                  }}
                />
              </Button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex gap-1 ml-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={undo}
              disabled={undoStack.length === 0}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={redo}
              disabled={redoStack.length === 0}
            >
              <Redo className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clear}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={saveWhiteboard}
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={shareWhiteboard}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Canvas */}
        <div className="border border-border rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full h-auto cursor-crosshair bg-white"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
          />
        </div>

        {/* Info */}
        <div className="text-xs text-muted-foreground text-center">
          Click and drag to draw • Use toolbar to change tools and colors • Save or share your creations
        </div>
      </CardContent>
    </Card>
  );
};