
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle, Users, Heart, Share2 } from 'lucide-react';

export const SocialTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Social Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Social Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Users className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold text-blue-600">0</div>
              <div className="text-sm text-blue-500">Followers</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Heart className="h-8 w-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-green-500">Following</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Share2 className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <div className="text-2xl font-bold text-purple-600">0</div>
              <div className="text-sm text-purple-500">Posts</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Features Coming Soon */}
      <Card>
        <CardContent className="p-8 text-center">
          <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">Social Features Coming Soon</h3>
          <p className="text-muted-foreground mb-4">
            Connect with other users, share your achievements, and build your network.
          </p>
          <Button disabled>
            Join Beta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
