
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Sparkles, 
  Zap, 
  Target, 
  Users, 
  ArrowRight,
  Plus,
  Wand2
} from 'lucide-react';

interface CreateCampaignDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const campaignTypes = [
  {
    id: 'simplified',
    title: 'Standard Campaign',
    description: 'Streamlined 3-step process with all essential features',
    icon: Target,
    features: ['3 simple steps', 'Logo upload', 'Smart targeting', 'Quick approval'],
    route: '/brand-dashboard/campaigns/create',
    recommended: true
  },
  {
    id: 'quick',
    title: 'Quick Campaign',
    description: 'Single-page creation for immediate deployment',
    icon: Zap,
    features: ['One-page setup', 'Logo upload', 'Smart defaults', 'Instant submit'],
    route: '/brand-dashboard/campaigns/create-quick',
    recommended: false
  },
  {
    id: 'enhanced',
    title: 'Advanced Campaign',
    description: 'Full-featured campaign with media management and detailed targeting',
    icon: Sparkles,
    features: ['Advanced targeting', 'Media upload', 'Social links', 'Detailed analytics'],
    route: '/brand-dashboard/campaigns/create-enhanced',
    recommended: false
  }
];

export const CreateCampaignDialog: React.FC<CreateCampaignDialogProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handleCampaignTypeSelect = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader className="text-center pb-6">
          <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Create New Campaign
          </DialogTitle>
          <DialogDescription className="text-lg text-muted-foreground">
            Choose the perfect campaign creation experience for your needs
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3 max-h-[60vh] overflow-y-auto">
          {campaignTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <Card 
                key={type.id} 
                className={`relative cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  type.recommended 
                    ? 'ring-2 ring-primary bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20' 
                    : 'hover:border-primary/30'
                }`}
                onClick={() => handleCampaignTypeSelect(type.route)}
              >
                {type.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                      <Wand2 className="h-3 w-3" />
                      Recommended
                    </div>
                  </div>
                )}
                
                <CardContent className="p-6 h-full flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      type.recommended 
                        ? 'bg-primary/20 text-primary' 
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-foreground">
                        {type.title}
                      </h3>
                    </div>
                  </div>

                  <p className="text-muted-foreground text-sm mb-4 flex-1">
                    {type.description}
                  </p>

                  <div className="space-y-2 mb-6">
                    <h4 className="text-sm font-medium text-foreground">Features:</h4>
                    <ul className="space-y-1">
                      {type.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <Button 
                    className={`w-full ${
                      type.recommended 
                        ? 'bg-primary hover:bg-primary/90' 
                        : 'bg-secondary hover:bg-secondary/80'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCampaignTypeSelect(type.route);
                    }}
                  >
                    <span className="flex items-center gap-2">
                      {type.recommended ? 'Start Creating' : 'Choose This Option'}
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="flex justify-center pt-6 border-t">
          <Button variant="outline" onClick={onClose} className="min-w-32">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
