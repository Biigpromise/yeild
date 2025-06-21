
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
import { supabase } from '@/integrations/supabase/client';

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
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [applying, setApplying] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast.error('Please enter a search term');
      return;
    }

    setSearching(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, name, email, active_referrals_count, points')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
        .limit(10);

      if (error) throw error;
      
      setSearchResults(data || []);
      if (!data || data.length === 0) {
        toast.info('No users found matching your search');
      }
    } catch (error) {
      console.error('Error searching users:', error);
      toast.error('Failed to search users');
    } finally {
      setSearching(false);
    }
  };

  const handleOverride = async () => {
    if (!selectedUser || !selectedLevel || !reason.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setApplying(true);
    try {
      // Find the selected user's info
      const selectedUserInfo = searchResults.find(user => user.id === selectedUser);
      if (!selectedUserInfo) {
        toast.error('Selected user not found');
        return;
      }

      // Update user's referral count to match the bird level requirements
      const birdLevel = BIRD_LEVELS.find(level => level.name === selectedLevel);
      if (!birdLevel) {
        toast.error('Invalid bird level selected');
        return;
      }

      // Update the user's active referrals count to meet the requirement
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          active_referrals_count: Math.max(selectedUserInfo.active_referrals_count, birdLevel.minReferrals),
          points: Math.max(selectedUserInfo.points, birdLevel.minPoints)
        })
        .eq('id', selectedUser);

      if (updateError) throw updateError;

      // Log the override action
      const { error: logError } = await supabase
        .from('user_activity_log')
        .insert({
          user_id: selectedUser,
          activity_type: 'bird_level_override',
          activity_data: {
            new_level: selectedLevel,
            reason: reason,
            admin_override: true,
            previous_referrals: selectedUserInfo.active_referrals_count,
            previous_points: selectedUserInfo.points,
            new_referrals: Math.max(selectedUserInfo.active_referrals_count, birdLevel.minReferrals),
            new_points: Math.max(selectedUserInfo.points, birdLevel.minPoints)
          }
        });

      if (logError) console.error('Error logging override:', logError);

      toast.success(
        <div className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="font-semibold">Bird Level Override Applied</p>
            <p className="text-sm">{selectedUserInfo.name || selectedUserInfo.email} promoted to {selectedLevel}</p>
          </div>
        </div>
      );

      onOverride?.(selectedUser, selectedLevel);
      
      // Reset form
      setSelectedUser('');
      setSelectedLevel('');
      setReason('');
      setSearchTerm('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error applying bird level override:', error);
      toast.error('Failed to apply bird level override');
    } finally {
      setApplying(false);
    }
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
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Enter username or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={searching}>
                  {searching ? 'Searching...' : 'Search'}
                </Button>
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

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Select User</label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {searchResults.map((user) => (
                  <div 
                    key={user.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedUser === user.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{user.name || 'No name'}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{user.active_referrals_count} referrals</p>
                        <p className="text-sm text-gray-600">{user.points} points</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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
            disabled={!selectedUser || !selectedLevel || !reason.trim() || applying}
          >
            {applying ? 'Applying Override...' : 'Apply Bird Level Override'}
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
