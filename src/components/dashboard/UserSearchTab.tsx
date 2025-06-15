
import React, { useState, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { userService, UserProfile } from '@/services/userService';
import { PublicProfileModal } from '@/components/PublicProfileModal';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type SearchedUser = Pick<UserProfile, 'id' | 'name' | 'profile_picture_url'>;

export const UserSearchTab = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchedUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setSearched(true);
    const users = await userService.searchUsers(query);
    setResults(users);
    setLoading(false);
  };

  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Find Other Users
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              type="text"
              placeholder="Search by name..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-sm"
            />
            <Button type="submit" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Searching...' : 'Search'}
            </Button>
          </form>

          <div className="space-y-4">
            {loading && (
              <>
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                    </div>
                  </div>
                ))}
              </>
            )}
            {!loading && searched && results.length === 0 && (
              <p className="text-muted-foreground text-center py-4">
                No users found for "{query}".
              </p>
            )}
            {!loading && results.length > 0 && (
              <ul className="space-y-3">
                {results.map((user) => (
                  <li
                    key={user.id}
                    onClick={() => handleUserClick(user.id)}
                    className="flex items-center gap-4 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                  >
                    <Avatar>
                      <AvatarImage src={user.profile_picture_url || undefined} alt={user.name} />
                      <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
      <PublicProfileModal
        userId={selectedUserId}
        isOpen={!!selectedUserId}
        onOpenChange={(isOpen) => !isOpen && setSelectedUserId(null)}
      />
    </>
  );
};
