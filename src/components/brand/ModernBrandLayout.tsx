import React, { useState } from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { BrandSidebar } from './dashboard/BrandSidebar';
import { ModernNavHeader } from '@/components/navigation/ModernNavHeader';
import { cn } from '@/lib/utils';

interface ModernBrandLayoutProps {
  children: React.ReactNode;
  profile?: any;
  wallet?: any;
}

export const ModernBrandLayout: React.FC<ModernBrandLayoutProps> = ({
  children,
  profile,
  wallet
}) => {
  const [unreadCount, setUnreadCount] = useState(0);

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Navigation Header */}
        <ModernNavHeader
          unreadCount={unreadCount}
          onUnreadCountChange={setUnreadCount}
          title="YIELD Brand"
          showSearch={false}
        />
        
        <div className="flex flex-1">
          <BrandSidebar profile={profile} wallet={wallet} />
          
          <main className="flex-1 overflow-auto bg-muted/30">
            <div className="container mx-auto p-6 max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};