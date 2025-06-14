
import React from 'react';
import { AdminAccessHelper } from '@/components/AdminAccessHelper';

const AdminSetup = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Admin Setup</h1>
          <p className="text-muted-foreground">
            Configure admin access for your account
          </p>
        </div>
        <AdminAccessHelper />
      </div>
    </div>
  );
};

export default AdminSetup;
