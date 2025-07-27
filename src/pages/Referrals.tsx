
import React from 'react';
import { EnhancedReferralSystem } from '@/components/referral/EnhancedReferralSystem';

const Referrals: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto p-4">
        <EnhancedReferralSystem />
      </div>
    </div>
  );
};

export default Referrals;
