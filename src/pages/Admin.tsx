import React, { useState, useEffect } from "react";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { EnhancedUserManagementSystem } from "@/components/admin/enhanced/EnhancedUserManagementSystem";
import { EnhancedTaskManagement } from "@/components/admin/enhanced/EnhancedTaskManagement";
import { AdminWallet } from "@/components/admin/AdminWallet";
import { AdminFinancialManagement } from "@/components/admin/AdminFinancialManagement";
import { AdminReferrals } from "@/components/admin/AdminReferrals";
import { AdminStreaks } from "@/components/admin/AdminStreaks";
import { AdminBrands } from "@/components/admin/AdminBrands";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminSupport } from "@/components/admin/AdminSupport";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminAnnouncements } from "@/components/admin/AdminAnnouncements";
import { AdminSecurity } from "@/components/admin/AdminSecurity";
import { AdminCommunication } from "@/components/admin/AdminCommunication";
import { AdminContentManagement } from "@/components/admin/AdminContentManagement";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  DollarSign,
  Award,
  Medal,
  Flag,
  Bell,
  BarChart2,
  HeadsetIcon,
  Settings,
  Menu,
  X,
  Megaphone,
  Shield,
  MessageSquare,
  Database
} from "lucide-react";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Listen for navigation events from child components
    const handleNavigateToSubmissions = () => setActiveSection("tasks");
    const handleNavigateToCreateTask = () => setActiveSection("tasks");

    window.addEventListener('navigateToSubmissions', handleNavigateToSubmissions);
    window.addEventListener('navigateToCreateTask', handleNavigateToCreateTask);

    return () => {
      window.removeEventListener('navigateToSubmissions', handleNavigateToSubmissions);
      window.removeEventListener('navigateToCreateTask', handleNavigateToCreateTask);
    };
  }, []);

  // Map of sections to their component - Updated to use enhanced user management
  const sectionComponents = {
    dashboard: <AdminOverview />,
    users: <EnhancedUserManagementSystem />,
    tasks: <EnhancedTaskManagement />,
    wallet: <AdminWallet />,
    referrals: <AdminReferrals />,
    streaks: <AdminStreaks />,
    brands: <AdminBrands />,
    notifications: <AdminNotifications />,
    announcements: <AdminAnnouncements />,
    analytics: <AdminAnalytics />,
    support: <AdminSupport />,
    settings: <AdminSettings />,
    security: <AdminSecurity />,
    communication: <AdminCommunication />,
    content: <AdminContentManagement />
  };

  // Enhanced navigation items with all new sections
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "tasks", label: "Tasks", icon: ClipboardList },
    { id: "wallet", label: "Financial", icon: Wallet },
    { id: "referrals", label: "Referral Levels", icon: Award },
    { id: "streaks", label: "Streaks", icon: Medal },
    { id: "brands", label: "Brands", icon: Flag },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "communication", label: "Communication", icon: MessageSquare },
    { id: "content", label: "Content", icon: Database },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
    { id: "security", label: "Security", icon: Shield },
    { id: "support", label: "Support", icon: HeadsetIcon },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar toggle */}
      <button 
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-primary text-primary-foreground shadow-md"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>
      
      {/* Enhanced Sidebar */}
      <div 
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:static lg:translate-x-0 z-40 w-64 h-full transition-transform duration-300 ease-in-out border-r border-border bg-card flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold text-yellow-500">YEILD Admin Pro</h1>
          <p className="text-xs text-muted-foreground mt-1">Comprehensive Management System</p>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          <ul className="space-y-1.5">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-md transition-colors ${
                    activeSection === item.id
                      ? "bg-yellow-500/15 text-yellow-500 font-medium"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        
        {/* Quick Stats in Sidebar */}
        <div className="p-4 border-t border-border">
          <div className="text-xs text-muted-foreground mb-2">System Status</div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Server</span>
              <span className="text-green-500">Online</span>
            </div>
            <div className="flex justify-between text-xs">
              <span>Database</span>
              <span className="text-green-500">Connected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pl-0 lg:pl-64">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                {navItems.find(item => item.id === activeSection)?.label || "Admin Dashboard"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Comprehensive platform management and analytics
              </p>
            </div>
            <div className="flex gap-2 md:gap-4">
              <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-md border border-border bg-card hover:bg-muted text-sm">
                Broadcast
              </button>
              <button className="px-3 py-1.5 md:px-4 md:py-2 rounded-md bg-yellow-500 text-white hover:bg-yellow-600 text-sm">
                Account
              </button>
            </div>
          </div>
          
          {/* Dynamic Content */}
          <div className="bg-card rounded-lg shadow-sm p-4 md:p-6">
            {sectionComponents[activeSection]}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;
