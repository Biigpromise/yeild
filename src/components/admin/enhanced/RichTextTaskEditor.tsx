
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Bold, Italic, List, Link2, Eye } from "lucide-react";
import DOMPurify from 'dompurify';

interface RichTextTaskEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
}

export const RichTextTaskEditor: React.FC<RichTextTaskEditorProps> = ({
  value,
  onChange,
  label = "Task Description"
}) => {
  const [isPreview, setIsPreview] = useState(false);
  const [selectedText, setSelectedText] = useState("");

  const insertFormatting = (before: string, after: string = "") => {
    const textarea = document.getElementById('rich-text-editor') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertFormatting("**", "**")
    },
    {
      icon: Italic,
      label: "Italic", 
      action: () => insertFormatting("*", "*")
    },
    {
      icon: List,
      label: "List",
      action: () => insertFormatting("\n- ")
    },
    {
      icon: Link2,
      label: "Link",
      action: () => insertFormatting("[", "](url)")
    }
  ];

  const renderPreview = (text: string) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" class="text-blue-500 underline">$1</a>')
      .replace(/\n- /g, '\n• ')
      .split('\n')
      .map(line => `<p class="mb-2">${line}</p>`)
      .join('');
    
    // Sanitize HTML to prevent XSS attacks
    return DOMPurify.sanitize(html);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <Label>{label}</Label>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Markdown Supported
            </Badge>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => setIsPreview(!isPreview)}
            >
              <Eye className="h-3 w-3 mr-1" />
              {isPreview ? "Edit" : "Preview"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isPreview && (
          <div className="flex items-center gap-1 p-2 border rounded-md bg-muted/50">
            {formatButtons.map((button, index) => (
              <Button
                key={index}
                type="button"
                size="sm"
                variant="ghost"
                onClick={button.action}
                title={button.label}
                className="h-8 w-8 p-0"
              >
                <button.icon className="h-3 w-3" />
              </Button>
            ))}
          </div>
        )}
        
        {isPreview ? (
          <div 
            className="min-h-[120px] p-3 border rounded-md bg-background prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
          />
        ) : (
          <Textarea
            id="rich-text-editor"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter task description... You can use **bold**, *italic*, [links](url), and - bullet points"
            rows={6}
            className="resize-none"
          />
        )}
        
        <div className="text-xs text-muted-foreground">
          <p className="mb-1">Formatting tips:</p>
          <ul className="space-y-1">
            <li>• **text** for <strong>bold</strong></li>
            <li>• *text* for <em>italic</em></li>
            <li>• [text](url) for links</li>
            <li>• - text for bullet points</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
