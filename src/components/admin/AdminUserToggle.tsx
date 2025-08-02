
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate, useLocation } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Shield, User, Crown } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';

export const AdminUserToggle = () => {
  const { userRole } = useUserRole();
  const navigate = useNavigate();
  const location = useLocation();
  const [isToggling, setIsToggling] = useState(false);
  
  // Only show for admin users
  if (userRole !== 'admin') return null;
  
  const isAdminView = location.pathname.includes('/admin');
  
  const handleToggle = async () => {
    setIsToggling(true);
    
    // Add a small delay for smooth transition
    setTimeout(() => {
      if (isAdminView) {
        navigate('/dashboard');
      } else {
        navigate('/admin');
      }
      setIsToggling(false);
    }, 200);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border backdrop-blur-sm">
      {/* Role Indicator - Clickable */}
      <div className="flex items-center gap-2 cursor-pointer" onClick={handleToggle}>
        <div className="p-2 bg-primary/10 rounded-lg">
          <Crown className="h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-medium text-muted-foreground">Current View</span>
          <div className="flex items-center gap-2">
            <Badge 
              variant={isAdminView ? "default" : "secondary"}
              className={cn(
                "text-xs cursor-pointer hover:opacity-80 transition-opacity",
                isAdminView && "bg-primary text-primary-foreground"
              )}
            >
              {isAdminView ? (
                <>
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </>
              ) : (
                <>
                  <User className="h-3 w-3 mr-1" />
                  User
                </>
              )}
            </Badge>
          </div>
        </div>
      </div>

      {/* Toggle Switch */}
      <div className="flex items-center gap-3 pl-3 border-l border-border">
        <div className="flex items-center gap-2 text-sm">
          <User className={cn(
            "h-4 w-4 transition-colors",
            !isAdminView ? "text-primary" : "text-muted-foreground"
          )} />
          <Switch
            checked={isAdminView}
            onCheckedChange={handleToggle}
            disabled={isToggling}
            className="data-[state=checked]:bg-primary"
          />
          <Shield className={cn(
            "h-4 w-4 transition-colors",
            isAdminView ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        <Button
          onClick={handleToggle}
          disabled={isToggling}
          variant="outline"
          size="sm"
          className="h-8 text-xs hover:bg-primary/10"
        >
          {isToggling ? (
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Switch to {isAdminView ? 'User' : 'Admin'}
            </>
          )}
        </Button>
      </div>
    </div>
  );
};
