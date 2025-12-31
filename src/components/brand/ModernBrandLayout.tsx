import React, { useState } from 'react';
import { SidebarProvider, useSidebar } from '@/components/ui/sidebar';
import { BrandSidebar } from './dashboard/BrandSidebar';
import { ModernNavHeader } from '@/components/navigation/ModernNavHeader';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, LayoutDashboard, Target, Store, Users, Palette, Wallet, BarChart3, Settings, HelpCircle, LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ModernBrandLayoutProps {
  children: React.ReactNode;
  profile?: any;
  wallet?: any;
}

const mobileNavItems = [
  { title: "Dashboard", url: "/brand-dashboard", icon: LayoutDashboard },
  { title: "Campaigns", url: "/brand-dashboard/campaigns", icon: Target },
  { title: "Marketplace", url: "/brand-dashboard/marketplace", icon: Store },
  { title: "Audience", url: "/brand-dashboard/audience", icon: Users },
  { title: "Creative Studio", url: "/brand-dashboard/creative", icon: Palette },
  { title: "Financial Hub", url: "/brand-dashboard/finance", icon: Wallet },
  { title: "Analytics", url: "/brand-dashboard/analytics", icon: BarChart3 },
  { title: "Settings", url: "/brand-dashboard/settings", icon: Settings },
  { title: "Help", url: "/brand-dashboard/support", icon: HelpCircle },
];

export const ModernBrandLayout: React.FC<ModernBrandLayoutProps> = ({
  children,
  profile,
  wallet
}) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out successfully");
      navigate("/auth");
    } catch (error: any) {
      toast.error("Error signing out: " + error.message);
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-col w-full bg-background">
        {/* Navigation Header with Mobile Menu */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/10 to-primary/5 lg:hidden">
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="default" size="sm" className="gap-2 shadow-md">
                <Menu className="h-5 w-5" />
                <span className="font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <div className="flex flex-col h-full">
                <div className="p-4 border-b border-border bg-primary/5">
                  <h2 className="text-lg font-semibold">YIELD Brand</h2>
                  <p className="text-sm text-muted-foreground">{profile?.company_name || 'Brand Dashboard'}</p>
                </div>
                
                {wallet && (
                  <div className="px-4 py-3 border-b border-border bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Wallet Balance</span>
                      <span className="font-semibold">₦{wallet.balance?.toLocaleString() || '0'}</span>
                    </div>
                  </div>
                )}
                
                <nav className="flex-1 overflow-y-auto py-4">
                  {mobileNavItems.map((item) => (
                    <NavLink
                      key={item.title}
                      to={item.url}
                      onClick={() => setMobileMenuOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
                        isActive 
                          ? "bg-primary text-primary-foreground" 
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                    </NavLink>
                  ))}
                </nav>
                
                <div className="p-4 border-t border-border">
                  <Button 
                    variant="outline" 
                    className="w-full text-destructive border-destructive/30 hover:bg-destructive/10"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleSignOut();
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
          
          <span className="font-semibold text-lg">YIELD Brand</span>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Desktop Header */}
        <div className="hidden lg:block">
          <ModernNavHeader
            unreadCount={unreadCount}
            onUnreadCountChange={setUnreadCount}
            title="YIELD Brand"
            showSearch={false}
          />
        </div>
        
        <div className="flex flex-1">
          {/* Desktop Sidebar - hidden on mobile */}
          <div className="hidden lg:block">
            <BrandSidebar profile={profile} wallet={wallet} />
          </div>
          
          <main className="flex-1 overflow-y-auto bg-muted/30 pb-20 lg:pb-6">
            <div className="w-full px-3 py-4 sm:px-6 sm:py-6 lg:container lg:mx-auto lg:max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};