
import React, { useState } from "react";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { AdminUsers } from "@/components/admin/AdminUsers";
import { AdminTasks } from "@/components/admin/AdminTasks";
import { AdminWallet } from "@/components/admin/AdminWallet";
import { AdminReferrals } from "@/components/admin/AdminReferrals";
import { AdminStreaks } from "@/components/admin/AdminStreaks";
import { AdminBrands } from "@/components/admin/AdminBrands";
import { AdminNotifications } from "@/components/admin/AdminNotifications";
import { AdminAnalytics } from "@/components/admin/AdminAnalytics";
import { AdminSupport } from "@/components/admin/AdminSupport";
import { AdminSettings } from "@/components/admin/AdminSettings";
import { AdminAnnouncements } from "@/components/admin/AdminAnnouncements";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Wallet,
  Award,
  Medal,
  Flag,
  Bell,
  BarChart2,
  HeadsetIcon,
  Settings,
  Menu,
  X,
  Megaphone
} from "lucide-react";

const Admin = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Map of sections to their component
  const sectionComponents = {
    dashboard: <AdminOverview />,
    users: <AdminUsers />,
    tasks: <AdminTasks />,
    wallet: <AdminWallet />,
    referrals: <AdminReferrals />,
    streaks: <AdminStreaks />,
    brands: <AdminBrands />,
    notifications: <AdminNotifications />,
    announcements: <AdminAnnouncements />,
    analytics: <AdminAnalytics />,
    support: <AdminSupport />,
    settings: <AdminSettings />
  };

  // Navigation items
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "users", label: "Users", icon: Users },
    { id: "tasks", label: "Tasks", icon: ClipboardList },
    { id: "wallet", label: "Wallet & Payouts", icon: Wallet },
    { id: "referrals", label: "Referral Levels", icon: Award },
    { id: "streaks", label: "Streaks", icon: Medal },
    { id: "brands", label: "Brands", icon: Flag },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "announcements", label: "Announcements", icon: Megaphone },
    { id: "analytics", label: "Analytics", icon: BarChart2 },
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
      
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed lg:static lg:translate-x-0 z-40 w-64 h-full transition-transform duration-300 ease-in-out border-r border-border bg-card flex flex-col shadow-lg`}
      >
        <div className="p-4 border-b border-border">
          <h1 className="text-2xl font-bold text-yellow-500">YEILD Admin</h1>
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
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pl-0 lg:pl-64">
        <div className="p-6 md:p-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold">
              {navItems.find(item => item.id === activeSection)?.label || "Admin Dashboard"}
            </h1>
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
