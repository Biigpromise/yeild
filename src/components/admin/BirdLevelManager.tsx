import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Pencil, Save, X } from 'lucide-react';
import { toast } from 'sonner';

interface BirdLevel {
  id: number;
  name: string;
  icon: string;
  emoji: string;
  min_referrals: number;
  min_points: number;
  description: string;
  color: string;
  benefits: string[];
  animation_type: string;
  glow_effect: boolean;
}

export const BirdLevelManager: React.FC = () => {
  const [birdLevels, setBirdLevels] = useState<BirdLevel[]>([]);
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBirdLevels();
  }, []);

  const loadBirdLevels = async () => {
    try {
      const { data, error } = await supabase
        .from('bird_levels')
        .select('*')
        .order('min_referrals', { ascending: true });

      if (error) throw error;
      setBirdLevels(data || []);
    } catch (error) {
      console.error('Error loading bird levels:', error);
      toast.error('Failed to load bird levels');
    } finally {
      setLoading(false);
    }
  };

  const updateBirdLevel = async (level: BirdLevel) => {
    try {
      const { error } = await supabase
        .from('bird_levels')
        .update({
          name: level.name,
          min_referrals: level.min_referrals,
          min_points: level.min_points,
          description: level.description,
          color: level.color,
          benefits: level.benefits,
          animation_type: level.animation_type,
          glow_effect: level.glow_effect
        })
        .eq('id', level.id);

      if (error) throw error;
      
      toast.success('Bird level updated successfully');
      setEditingLevel(null);
      loadBirdLevels();
    } catch (error) {
      console.error('Error updating bird level:', error);
      toast.error('Failed to update bird level');
    }
  };

  if (loading) {
    return <div className="animate-pulse h-64 bg-muted rounded-lg" />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bird Level Management</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {birdLevels.map((level) => (
            <div key={level.id} className="p-4 border rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{level.emoji}</span>
                  <div>
                    <h3 className="font-semibold">{level.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {level.min_referrals} referrals, {level.min_points} points
                    </p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingLevel(editingLevel === level.id ? null : level.id)}
                >
                  {editingLevel === level.id ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
                </Button>
              </div>

              {editingLevel === level.id && (
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label>Min Referrals</Label>
                    <Input
                      type="number"
                      value={level.min_referrals}
                      onChange={(e) => setBirdLevels(levels => 
                        levels.map(l => l.id === level.id 
                          ? { ...l, min_referrals: parseInt(e.target.value) || 0 }
                          : l
                        )
                      )}
                    />
                  </div>
                  <div>
                    <Label>Min Points</Label>
                    <Input
                      type="number"
                      value={level.min_points}
                      onChange={(e) => setBirdLevels(levels => 
                        levels.map(l => l.id === level.id 
                          ? { ...l, min_points: parseInt(e.target.value) || 0 }
                          : l
                        )
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <Button
                      onClick={() => updateBirdLevel(level)}
                      className="w-full"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mt-2">
                {level.benefits.map((benefit, index) => (
                  <Badge key={index} variant="secondary">{benefit}</Badge>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};