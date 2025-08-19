import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Image, Video, FileText, Download, Eye } from 'lucide-react';

export const BrandCreativeStudio = () => {
  const [selectedTab, setSelectedTab] = useState('assets');

  const assets = [
    {
      id: '1',
      name: 'Brand Logo V2.png',
      type: 'image',
      size: '2.4 MB',
      uploadedAt: '2024-01-15',
      url: '/placeholder-logo.png'
    },
    {
      id: '2',
      name: 'Product Demo Video.mp4',
      type: 'video',
      size: '45.2 MB',
      uploadedAt: '2024-01-14',
      url: '/placeholder-video.mp4'
    },
    {
      id: '3',
      name: 'Campaign Brief Template.pdf',
      type: 'document',
      size: '890 KB',
      uploadedAt: '2024-01-12',
      url: '/placeholder-doc.pdf'
    }
  ];

  const templates = [
    {
      id: '1',
      name: 'Social Media Campaign',
      description: 'Standard template for social media campaigns',
      category: 'Social Media',
      usageCount: 12
    },
    {
      id: '2',
      name: 'Influencer Collaboration',
      description: 'Template for influencer partnership campaigns',
      category: 'Influencer',
      usageCount: 8
    },
    {
      id: '3',
      name: 'Product Launch',
      description: 'Comprehensive product launch campaign template',
      category: 'Product',
      usageCount: 5
    }
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Creative Studio</h1>
        <Button className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Asset
        </Button>
      </div>

      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={selectedTab === 'assets' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('assets')}
        >
          Brand Assets
        </Button>
        <Button
          variant={selectedTab === 'templates' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('templates')}
        >
          Templates
        </Button>
        <Button
          variant={selectedTab === 'guidelines' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setSelectedTab('guidelines')}
        >
          Brand Guidelines
        </Button>
      </div>

      {selectedTab === 'assets' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map((asset) => (
            <Card key={asset.id}>
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  {getFileIcon(asset.type)}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{asset.name}</h3>
                    <p className="text-sm text-muted-foreground">{asset.size}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    Uploaded {asset.uploadedAt}
                  </span>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'templates' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => (
            <Card key={template.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <Badge variant="secondary">{template.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">{template.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Used {template.usageCount} times
                  </span>
                  <Button size="sm">Use Template</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedTab === 'guidelines' && (
        <Card>
          <CardHeader>
            <CardTitle>Brand Guidelines</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Brand Colors</h3>
              <div className="flex space-x-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary rounded-lg mb-2"></div>
                  <span className="text-sm">Primary</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-secondary rounded-lg mb-2"></div>
                  <span className="text-sm">Secondary</span>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-accent rounded-lg mb-2"></div>
                  <span className="text-sm">Accent</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Typography</h3>
              <div className="space-y-2">
                <div className="text-3xl font-bold">Heading 1</div>
                <div className="text-xl font-semibold">Heading 2</div>
                <div className="text-base">Body text example</div>
                <div className="text-sm text-muted-foreground">Caption text</div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Voice & Tone</h3>
              <Textarea
                placeholder="Describe your brand's voice and tone guidelines..."
                className="min-h-[100px]"
              />
            </div>

            <Button>Save Guidelines</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};