import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { 
  Users, 
  Copy, 
  Share2, 
  Gift,
  TrendingUp,
  Award,
  Star
} from "lucide-react";
import { ReferralProgressBanner } from "@/components/referral/ReferralProgressBanner";

type ReferralTier = {
  name: string;
  minReferrals: number;
  bonusMultiplier: number;
  color: string;
  icon: React.ReactNode;
};

type ReferredUser = {
  id: string;
  name: string;
  avatar?: string;
  joinDate: Date;
  pointsEarned: number;
  status: "active" | "inactive";
};

const referralTiers: ReferralTier[] = [
  {
    name: "Bronze",
    minReferrals: 0,
    bonusMultiplier: 1.0,
    color: "bg-amber-100 text-amber-800",
    icon: <Award className="h-4 w-4" />
  },
  {
    name: "Silver",
    minReferrals: 5,
    bonusMultiplier: 1.2,
    color: "bg-gray-100 text-gray-800",
    icon: <Award className="h-4 w-4" />
  },
  {
    name: "Gold",
    minReferrals: 15,
    bonusMultiplier: 1.5,
    color: "bg-yellow-100 text-yellow-800",
    icon: <Award className="h-4 w-4" />
  },
  {
    name: "Platinum",
    minReferrals: 30,
    bonusMultiplier: 2.0,
    color: "bg-purple-100 text-purple-800",
    icon: <Star className="h-4 w-4" />
  }
];

const mockReferredUsers: ReferredUser[] = [
  {
    id: "1",
    name: "Alex Johnson",
    avatar: "",
    joinDate: new Date(2024, 11, 15),
    pointsEarned: 250,
    status: "active"
  },
  {
    id: "2",
    name: "Maria Garcia",
    avatar: "",
    joinDate: new Date(2024, 11, 10),
    pointsEarned: 420,
    status: "active"
  },
  {
    id: "3",
    name: "David Kim",
    avatar: "",
    joinDate: new Date(2024, 10, 28),
    pointsEarned: 180,
    status: "inactive"
  }
];

export const ReferralSystem = () => {
  const [referralCode] = useState("YIELD2024ABC");
  const [totalReferrals] = useState(3);
  const [totalEarnings] = useState(1250);
  const [currentTier] = useState(referralTiers[0]);

  // Define referral milestones - adjust as desired!
  const referralMilestones = [
    { required: 1, reward: "50 bonus pts" },
    { required: 3, reward: "Silver Tier & 200 pts" },
    { required: 5, reward: "Gold Tier & 500 pts" },
    { required: 15, reward: "Gold Gift Box" },
    { required: 30, reward: "Platinum VIP" }
  ];

  // Find the next milestone for the user
  const nextMilestone = referralMilestones.find(
    (m) => m.required > totalReferrals
  ) || null;

  const referralLink = `https://yield-app.com/signup?ref=${referralCode}`;

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast.success("Referral link copied to clipboard!");
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: "Join YIELD and earn rewards!",
        text: "Sign up for YIELD using my referral link and we both get bonus points!",
        url: referralLink,
      });
    } else {
      copyReferralLink();
    }
  };

  const getCurrentTierProgress = () => {
    const nextTier = referralTiers.find(tier => tier.minReferrals > totalReferrals);
    if (!nextTier) return { current: 100, needed: 0, nextTier: null };
    
    const progress = (totalReferrals / nextTier.minReferrals) * 100;
    const needed = nextTier.minReferrals - totalReferrals;
    
    return { current: progress, needed, nextTier };
  };

  const tierProgress = getCurrentTierProgress();

  return (
    <div className="space-y-6">
      {/* New Referral Progress Banner */}
      <ReferralProgressBanner
        referralCode={referralCode}
        currentReferrals={totalReferrals}
        nextMilestone={nextMilestone}
        onCopy={copyReferralLink}
        onShare={shareReferralLink}
      />

      {/* Referral Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
                <p className="text-2xl font-bold">{totalReferrals}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Gift className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <p className="text-2xl font-bold">{totalEarnings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bonus Multiplier</p>
                <p className="text-2xl font-bold">{currentTier.bonusMultiplier}x</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Tier & Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Referral Tier Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm">Current Tier:</span>
              <Badge className={currentTier.color}>
                {currentTier.icon}
                <span className="ml-1">{currentTier.name}</span>
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground">
              {currentTier.bonusMultiplier}x bonus multiplier
            </div>
          </div>

          {tierProgress.nextTier && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {tierProgress.nextTier.name}</span>
                <span>{tierProgress.needed} more referrals needed</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${Math.min(tierProgress.current, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Tier Benefits */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {referralTiers.map((tier) => (
              <div 
                key={tier.name}
                className={`p-3 rounded-lg border-2 ${
                  tier.name === currentTier.name 
                    ? 'border-primary bg-primary/5' 
                    : totalReferrals >= tier.minReferrals 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="text-center">
                  <Badge className={tier.color}>
                    {tier.icon}
                    <span className="ml-1">{tier.name}</span>
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    {tier.minReferrals}+ referrals
                  </p>
                  <p className="text-sm font-medium">{tier.bonusMultiplier}x bonus</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Referral Link */}
      <Card>
        <CardHeader>
          <CardTitle>Share Your Referral Link</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input 
              value={referralLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button onClick={copyReferralLink} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={shareReferralLink}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Share this link with friends and earn <strong>50 bonus points</strong> for each successful referral!
          </p>
        </CardContent>
      </Card>

      {/* Referred Users */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockReferredUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Joined {user.joinDate.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <Badge variant={user.status === "active" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {user.pointsEarned} pts earned
                  </p>
                </div>
              </div>
            ))}
            {mockReferredUsers.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet. Start sharing your link!</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
