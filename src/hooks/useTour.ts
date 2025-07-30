import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TourState {
  tourCompleted: boolean;
  tourStep: number;
  isLoading: boolean;
}

export const useTour = () => {
  const { user } = useAuth();
  const [tourState, setTourState] = useState<TourState>({
    tourCompleted: false,
    tourStep: 0,
    isLoading: true
  });

  useEffect(() => {
    if (user) {
      loadTourState();
    } else {
      setTourState({ tourCompleted: false, tourStep: 0, isLoading: false });
    }
  }, [user]);

  const loadTourState = async () => {
    if (!user) return;

    try {
      setTourState(prev => ({ ...prev, isLoading: true }));

      const { data, error } = await supabase
        .from('user_tours')
        .select('tour_completed, tour_step')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error loading tour state:', error);
        return;
      }

      if (data) {
        setTourState({
          tourCompleted: data.tour_completed || false,
          tourStep: data.tour_step || 0,
          isLoading: false
        });
      } else {
        // Initialize tour for new user
        await supabase
          .from('user_tours')
          .insert({
            user_id: user.id,
            tour_completed: false,
            tour_step: 0
          });
        
        setTourState({
          tourCompleted: false,
          tourStep: 0,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error loading tour state:', error);
      setTourState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const completeTour = async () => {
    if (!user) return;

    try {
      // First update the database using UPDATE instead of UPSERT to avoid constraint issues
      const { error } = await supabase
        .from('user_tours')
        .update({
          tour_completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);

      if (error) {
        console.error('Error completing tour:', error);
        // Force state update even if database update fails to unblock UI
        setTourState(prev => ({ ...prev, tourCompleted: true }));
        return;
      }

      // Only update state after successful database update
      setTourState(prev => ({ ...prev, tourCompleted: true }));
    } catch (error) {
      console.error('Error completing tour:', error);
      // Force state update to unblock UI
      setTourState(prev => ({ ...prev, tourCompleted: true }));
    }
  };

  const resetTour = async () => {
    if (!user) return;

    try {
      await supabase
        .from('user_tours')
        .upsert({
          user_id: user.id,
          tour_completed: false,
          tour_step: 0,
          completed_at: null,
          updated_at: new Date().toISOString()
        });

      setTourState({
        tourCompleted: false,
        tourStep: 0,
        isLoading: false
      });
    } catch (error) {
      console.error('Error resetting tour:', error);
    }
  };

  return {
    ...tourState,
    completeTour,
    resetTour,
    shouldShowTour: !tourState.isLoading && !tourState.tourCompleted
  };
};