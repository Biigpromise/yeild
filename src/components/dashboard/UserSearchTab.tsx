
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Search, Users, Trophy, Star } from 'lucide-react';
import { useCommunityProfiles } from '@/hooks/useCommunityProfiles';
import { CompactBirdBatch } from '@/components/ui/CompactBirdBatch';

export const UserSearchTab = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const { profiles, loading } = useCommunityProfiles();
  
  const filteredProfiles = profiles.filter(profile => 
    profile.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    profile.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading community profiles...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Community Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative mb-6">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="grid gap-4">
            {filteredProfiles.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No users found matching your search.' : 'No community profiles available.'}
              </div>
            ) : (
              filteredProfiles.map((profile) => (
                <Card key={profile.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={profile.profile_picture_url} />
                        <AvatarFallback>
                          {profile.name?.charAt(0)?.toUpperCase() || profile.email?.charAt(0)?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-semibold">
                            {profile.name || 'Anonymous User'}
                          </h3>
                          <CompactBirdBatch count={profile.tasks_completed} className="scale-75" />
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {profile.email}
                        </p>
                        {profile.bio && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {profile.bio}
                          </p>
                        )}
                      </div>
                      
                      <div className="text-right space-y-1">
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Trophy className="h-3 w-3" />
                          {profile.points} pts
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Level {profile.level}
                        </Badge>
                        <div className="text-xs text-muted-foreground">
                          {profile.tasks_completed} tasks completed
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
