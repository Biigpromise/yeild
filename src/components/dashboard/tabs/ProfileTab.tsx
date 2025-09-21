import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ProfileBirdDisplay } from '@/components/profile/ProfileBirdDisplay';
import { UserProfileBirds } from '@/components/community/UserProfileBirds';
import { 
  User, 
  Wallet, 
  Settings, 
  Users, 
  Gift,
  CreditCard,
  Eye,
  Edit3,
  Copy,
  Check
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateReferralLink } from '@/config/app';

interface ProfileTabProps {
  userProfile?: any;
  userStats?: {
    points: number;
    level: number;
    tasksCompleted: number;
    referrals: number;
    followers: number;
    following: number;
  };
}

export const ProfileTab: React.FC<ProfileTabProps> = ({ userProfile, userStats }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState({
    name: userProfile?.name || '',
    bio: userProfile?.bio || '',
  });
  const [copiedReferral, setCopiedReferral] = useState(false);
  const { user } = useAuth();

  const handleSaveProfile = () => {
    // TODO: Implement profile update
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const copyReferralCode = () => {
    if (userProfile?.referral_code) {
      const referralLink = generateReferralLink(userProfile.referral_code);
      navigator.clipboard.writeText(referralLink);
      setCopiedReferral(true);
      toast.success('Referral link copied!');
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  const walletStats = [
    {
      title: 'Available Points',
      value: userStats?.points || 0,
      icon: Wallet,
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Total Earned',
      value: userStats?.points || 0, // TODO: Get actual total earned
      icon: CreditCard,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center lg:text-left"
      >
        <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Your Profile
        </h1>
        <p className="text-muted-foreground mt-2">
          Manage your account, wallet, and settings
        </p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Information
                  </CardTitle>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    {isEditing ? 'Save' : 'Edit'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16">
                    <UserProfileBirds 
                      points={userStats?.points || 0}
                      tasksCompleted={userStats?.tasksCompleted || 0}
                      level={userStats?.level || 1}
                      activeReferrals={userStats?.referrals || 0}
                      compact={true}
                    />
                  </div>
                  <div>
                    <Badge variant="secondary">Level {userStats?.level || 1}</Badge>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div>
                    <Label>Full Name</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.name}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Your full name"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {userProfile?.name || user?.email?.split('@')[0] || 'User'}
                      </p>
                    )}
                  </div>

                  <div>
                    <Label>Email</Label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {user?.email}
                    </p>
                  </div>

                  <div>
                    <Label>Bio</Label>
                    {isEditing ? (
                      <Input
                        value={editedProfile.bio}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                        placeholder="Tell us about yourself"
                      />
                    ) : (
                      <p className="text-sm text-muted-foreground mt-1">
                        {userProfile?.bio || 'No bio added yet'}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Wallet */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-green-600" />
                  Wallet
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {walletStats.map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.title} className={`${stat.bgColor} rounded-lg p-4 text-center`}>
                        <Icon className={`h-5 w-5 ${stat.color} mx-auto mb-2`} />
                        <p className={`text-xl font-bold ${stat.color}`}>{stat.value.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{stat.title}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full">
                    <Eye className="h-4 w-4 mr-2" />
                    View Transaction History
                  </Button>
                  <Button variant="outline" className="w-full">
                    <CreditCard className="h-4 w-4 mr-2" />
                    Withdraw Funds
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Tasks Completed</span>
                  <span className="font-medium">{userStats?.tasksCompleted || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Referrals</span>
                  <span className="font-medium">{userStats?.referrals || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Followers</span>
                  <span className="font-medium">{userStats?.followers || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Following</span>
                  <span className="font-medium">{userStats?.following || 0}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Bird Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <ProfileBirdDisplay 
              userId={user?.id || ''}
              activeReferrals={userStats?.referrals || 0}
              totalReferrals={userStats?.referrals || 0}
            />
          </motion.div>

          {/* Referral */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Gift className="h-5 w-5 text-primary" />
                  Referral Program
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Invite friends and earn bonus points for each successful referral!
                </p>
                
                <div className="space-y-2">
                  <Label>Your Referral Code</Label>
                  <div className="flex gap-2">
                    <Input
                      value={userProfile?.referral_code || 'Loading...'}
                      readOnly
                      className="text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={copyReferralCode}
                    >
                      {copiedReferral ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                <div className="bg-primary/5 rounded-lg p-3">
                  <div className="text-center">
                    <Users className="h-6 w-6 text-primary mx-auto mb-1" />
                    <p className="text-sm font-medium">{userStats?.referrals || 0} Friends Referred</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Quick Settings */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Settings className="h-5 w-5" />
                  Quick Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Change Password
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Notification Settings
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Privacy Settings
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start text-destructive">
                  Delete Account
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};