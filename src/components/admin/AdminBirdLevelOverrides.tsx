
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Search, Crown, Zap } from 'lucide-react';
import { BirdBadge } from '@/components/referral/BirdBadge';
import { BIRD_LEVELS } from '@/services/userService';

interface AdminBirdLevelOverridesProps {
  onOverride?: (userId: string, newLevel: string) => void;
}

export const AdminBirdLevelOverrides: React.FC<AdminBirdLevelOverridesProps> = ({
  onOverride
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<string>('');
  const [reason, setReason] = useState('');

  const handleOverride = () => {
    if (!selectedUser || !selectedLevel || !reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // In a real implementation, this would call an API
    toast.success(
      <div className="flex items-center gap-2">
        <Crown className="h-5 w-5 text-yellow-600" />
        <div>
          <p className="font-semibold">Bird Level Override Applied</p>
          <p className="text-sm">User promoted to {selectedLevel}</p>
        </div>
      </div>
    );

    onOverride?.(selectedUser, selectedLevel);
    
    // Reset form
    setSelectedUser('');
    setSelectedLevel('');
    setReason('');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Bird Level Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search User</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Enter username or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Select Bird Level</label>
              <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose bird level..." />
                </SelectTrigger>
                <SelectContent>
                  {BIRD_LEVELS.map((level) => (
                    <SelectItem key={level.name} value={level.name}>
                      <div className="flex items-center gap-2">
                        <BirdBadge birdLevel={level} size="sm" />
                        <span>{level.name} ({level.minReferrals}+ referrals)</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Override Reason</label>
            <Input
              placeholder="Enter reason for manual override..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleOverride}
            className="w-full"
            disabled={!selectedUser || !selectedLevel || !reason.trim()}
          >
            Apply Bird Level Override
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Bird Level System Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {BIRD_LEVELS.map((level) => (
              <div key={level.name} className="text-center p-4 border rounded-lg">
                <BirdBadge birdLevel={level} size="lg" showName />
                <div className="mt-2 text-sm text-muted-foreground">
                  <p>{level.minReferrals}+ referrals</p>
                  <p>{level.minPoints}+ points</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
