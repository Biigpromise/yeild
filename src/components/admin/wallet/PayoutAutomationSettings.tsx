
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";

export type AutomationSetting = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
};

type PayoutAutomationSettingsProps = {
  settings: AutomationSetting[];
  onToggleAutomation: (id: string) => void;
};

export const PayoutAutomationSettings: React.FC<PayoutAutomationSettingsProps> = ({ 
  settings, 
  onToggleAutomation 
}) => {
  const { toast } = useToast();
  
  const toggleAutomation = (id: string) => {
    onToggleAutomation(id);
    
    const setting = settings.find(s => s.id === id);
    if (setting) {
      toast({
        title: setting.enabled ? "Automation Disabled" : "Automation Enabled",
        description: `${setting.name} has been ${setting.enabled ? 'disabled' : 'enabled'}`,
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payout Automation Settings</CardTitle>
        <CardDescription>Configure how payouts are automatically processed when tasks are completed</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {settings.map(setting => (
            <div key={setting.id} className="flex items-center justify-between p-4 border rounded-md">
              <div className="space-y-0.5">
                <h3 className="text-base font-medium">{setting.name}</h3>
                <p className="text-sm text-muted-foreground">{setting.description}</p>
              </div>
              <Switch 
                checked={setting.enabled}
                onCheckedChange={() => toggleAutomation(setting.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
