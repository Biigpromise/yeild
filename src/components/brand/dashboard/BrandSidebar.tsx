import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Target,
  Users,
  Palette,
  Wallet,
  BarChart3,
  Settings,
  ChevronDown,
  Bell,
  HelpCircle,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface NavigationItem {
  title: string;
  url: string;
  icon: any;
  badge?: string;
  submenu?: NavigationItem[];
}

const navigationItems: NavigationItem[] = [
  {
    title: "Dashboard",
    url: "/brand-dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Campaign Manager",
    url: "/brand-dashboard/campaigns",
    icon: Target,
    badge: "3",
  },
  {
    title: "Audience Insights",
    url: "/brand-dashboard/audience",
    icon: Users,
  },
  {
    title: "Creative Studio",
    url: "/brand-dashboard/creative",
    icon: Palette,
  },
  {
    title: "Financial Hub",
    url: "/brand-dashboard/finance",
    icon: Wallet,
  },
  {
    title: "Analytics",
    url: "/brand-dashboard/analytics",
    icon: BarChart3,
  },
];

const bottomItems: NavigationItem[] = [
  {
    title: "Help & Support",
    url: "/brand-dashboard/support",
    icon: HelpCircle,
  },
  {
    title: "Settings",
    url: "/brand-dashboard/settings",
    icon: Settings,
  },
];

interface BrandSidebarProps {
  profile?: any;
  wallet?: any;
}

export function BrandSidebar({ profile, wallet }: BrandSidebarProps) {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const collapsed = state === "collapsed";

  const isActive = (path: string) => {
    if (path === "/brand-dashboard") {
      return currentPath === "/brand-dashboard" || currentPath === "/brand-dashboard/";
    }
    return currentPath.startsWith(path);
  };

  const getNavClassName = (path: string) => {
    const active = isActive(path);
    return `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
    }`;
  };

  return (
    <Sidebar
      className={`${
        collapsed ? "w-16" : "w-64"
      } bg-sidebar border-r border-sidebar-border transition-all duration-300`}
      collapsible="icon"
    >
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-sidebar-border">
          {!collapsed && (
            <>
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">B</span>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-sidebar-foreground font-semibold text-sm truncate">
                  {profile?.company_name || "Brand Dashboard"}
                </h2>
                <p className="text-sidebar-foreground/60 text-xs truncate">
                  {profile?.industry || "Professional"}
                </p>
              </div>
            </>
          )}
          <SidebarTrigger className="text-sidebar-foreground/60 hover:text-sidebar-foreground" />
        </div>

        {/* Main Navigation */}
        <SidebarGroup className="flex-1 px-3 py-4">
          <SidebarGroupLabel className="text-sidebar-foreground/60 text-xs font-medium uppercase tracking-wider mb-2">
            {!collapsed && "Main Menu"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && (
                        <>
                          <span className="flex-1 truncate">{item.title}</span>
                          {item.badge && (
                            <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Wallet Quick View */}
        {!collapsed && wallet && (
          <div className="px-3 py-4 border-t border-sidebar-border">
            <div className="bg-sidebar-accent/30 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sidebar-foreground/60 text-xs font-medium">
                  Wallet Balance
                </span>
                <Wallet className="w-4 h-4 text-sidebar-foreground/60" />
              </div>
              <div className="text-sidebar-foreground font-semibold text-sm">
                ₦{wallet.balance?.toLocaleString() || "0.00"}
              </div>
            </div>
          </div>
        )}

        {/* Bottom Navigation */}
        <SidebarGroup className="px-3 py-4 border-t border-sidebar-border">
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {bottomItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="p-0">
                    <NavLink to={item.url} className={getNavClassName(item.url)}>
                      <item.icon className="w-5 h-5 flex-shrink-0" />
                      {!collapsed && <span className="flex-1 truncate">{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}