import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Image, Video, Upload, Download, Eye, Trash2 } from 'lucide-react';

export const BrandContentTab: React.FC = () => {
  const [uploading, setUploading] = useState(false);

  // Mock data - replace with real data from API
  const contentLibrary = [
    {
      id: '1',
      name: 'Brand Logo.png',
      type: 'image',
      size: '245 KB',
      uploadedAt: '2024-01-15',
      campaigns: ['Summer Sale', 'Winter Collection'],
    },
    {
      id: '2',
      name: 'Product Demo.mp4',
      type: 'video',
      size: '12.5 MB',
      uploadedAt: '2024-01-18',
      campaigns: ['Product Launch'],
    },
    {
      id: '3',
      name: 'Campaign Guidelines.pdf',
      type: 'document',
      size: '890 KB',
      uploadedAt: '2024-01-20',
      campaigns: [],
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image':
        return <Image className="h-8 w-8 text-blue-500" />;
      case 'video':
        return <Video className="h-8 w-8 text-purple-500" />;
      case 'document':
        return <FileText className="h-8 w-8 text-green-500" />;
      default:
        return <FileText className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setUploading(true);
    // TODO: Implement file upload
    setTimeout(() => {
      setUploading(false);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Content Library</h2>
          <p className="text-muted-foreground">Manage your campaign assets and content</p>
        </div>
        <div className="relative">
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            accept="image/*,video/*,.pdf,.doc,.docx"
          />
          <Button disabled={uploading}>
            <Upload className="h-4 w-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload Content'}
          </Button>
        </div>
      </div>

      {/* Content Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Image className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Images</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Video className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">3</p>
                <p className="text-sm text-muted-foreground">Videos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-border bg-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <FileText className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Library */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle>Your Content</CardTitle>
        </CardHeader>
        <CardContent>
          {contentLibrary.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No content uploaded yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {contentLibrary.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    {getFileIcon(item.type)}
                    <div>
                      <h4 className="font-medium text-foreground">{item.name}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>{item.size}</span>
                        <span>•</span>
                        <span>Uploaded {item.uploadedAt}</span>
                      </div>
                      {item.campaigns.length > 0 && (
                        <div className="flex gap-1 mt-1">
                          {item.campaigns.map((campaign) => (
                            <Badge key={campaign} variant="outline" className="text-xs">
                              {campaign}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};