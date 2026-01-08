import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { OperatorRank, OperatorStats } from '@/types/execution';

// Default operator ranks aligned with YEILD spec
const DEFAULT_OPERATOR_RANKS: OperatorRank[] = [
  {
    id: 1,
    rank_level: 1,
    name: 'Dove',
    emoji: '🕊️',
    icon: 'Bird',
    color: '#9CA3AF',
    description: 'Entry-level operator. Access to basic social executions only.',
    min_verified_executions: 0,
    min_success_rate: 0,
    allowed_template_codes: ['EO-001'],
    decay_rate_percent: 15,
    penalty_multiplier: 1.0,
    benefits: ['Access to EO-001 (Social Placement)', 'Standard verification times']
  },
  {
    id: 2,
    rank_level: 2,
    name: 'Hawk',
    emoji: '🦅',
    icon: 'Bird',
    color: '#3B82F6',
    description: 'Proven operator. Expanded execution access.',
    min_verified_executions: 10,
    min_success_rate: 80,
    allowed_template_codes: ['EO-001', 'EO-003'],
    decay_rate_percent: 12,
    penalty_multiplier: 1.5,
    benefits: ['Access to EO-001, EO-003', 'Priority support']
  },
  {
    id: 3,
    rank_level: 3,
    name: 'Eagle',
    emoji: '🦅',
    icon: 'Bird',
    color: '#8B5CF6',
    description: 'Trusted operator. Full digital execution access.',
    min_verified_executions: 50,
    min_success_rate: 85,
    allowed_template_codes: ['EO-001', 'EO-003', 'EO-004', 'EO-006'],
    decay_rate_percent: 10,
    penalty_multiplier: 2.0,
    benefits: ['Access to all digital EOs', 'Faster verification', 'Higher value orders']
  },
  {
    id: 4,
    rank_level: 4,
    name: 'Falcon',
    emoji: '🦅',
    icon: 'Bird',
    color: '#F59E0B',
    description: 'Elite operator. Offline execution cleared.',
    min_verified_executions: 150,
    min_success_rate: 90,
    allowed_template_codes: ['EO-001', 'EO-002', 'EO-003', 'EO-004', 'EO-006'],
    decay_rate_percent: 8,
    penalty_multiplier: 2.5,
    benefits: ['Offline execution access', 'Premium order priority', 'Dedicated support']
  },
  {
    id: 5,
    rank_level: 5,
    name: 'Phoenix',
    emoji: '🔥',
    icon: 'Flame',
    color: '#EF4444',
    description: 'Audit-level operator. Highest trust clearance.',
    min_verified_executions: 500,
    min_success_rate: 95,
    allowed_template_codes: ['EO-001', 'EO-002', 'EO-003', 'EO-004', 'EO-006', 'AUDIT'],
    decay_rate_percent: 5,
    penalty_multiplier: 3.0,
    benefits: ['All execution types', 'Audit & pilot access', 'VIP treatment']
  }
];

export interface NextOperatorRank extends OperatorRank {
  executions_needed: number;
  success_rate_needed: number;
}

export const useOperatorRank = () => {
  const { user } = useAuth();
  const [currentRank, setCurrentRank] = useState<OperatorRank | null>(null);
  const [nextRank, setNextRank] = useState<NextOperatorRank | null>(null);
  const [operatorStats, setOperatorStats] = useState<OperatorStats>({
    operator_rank_level: 1,
    verified_executions: 0,
    failed_executions: 0,
    execution_success_rate: 0,
    execution_credits_balance: 0,
    execution_credits_pending: 0,
    execution_credits_lifetime: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate current rank based on stats
  const getCurrentRank = (stats: OperatorStats): OperatorRank => {
    let currentLevel = DEFAULT_OPERATOR_RANKS[0];
    for (const rank of DEFAULT_OPERATOR_RANKS) {
      if (
        stats.verified_executions >= rank.min_verified_executions &&
        stats.execution_success_rate >= rank.min_success_rate
      ) {
        currentLevel = rank;
      } else {
        break;
      }
    }
    return currentLevel;
  };

  // Calculate next rank and requirements
  const getNextRank = (stats: OperatorStats): NextOperatorRank | null => {
    for (const rank of DEFAULT_OPERATOR_RANKS) {
      if (
        stats.verified_executions < rank.min_verified_executions ||
        stats.execution_success_rate < rank.min_success_rate
      ) {
        return {
          ...rank,
          executions_needed: Math.max(0, rank.min_verified_executions - stats.verified_executions),
          success_rate_needed: Math.max(0, rank.min_success_rate - stats.execution_success_rate)
        };
      }
    }
    return null; // Already at max rank
  };

  // Check if operator can access a specific template
  const canAccessTemplate = (templateCode: string): boolean => {
    if (!currentRank) return false;
    return currentRank.allowed_template_codes.includes(templateCode);
  };

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchOperatorRank = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch operator stats from profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            operator_rank_level,
            verified_executions,
            failed_executions,
            execution_success_rate,
            last_execution_at,
            execution_credits_balance,
            execution_credits_pending,
            execution_credits_lifetime
          `)
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching operator stats:', profileError);
          // Use default stats
          const defaultStats: OperatorStats = {
            operator_rank_level: 1,
            verified_executions: 0,
            failed_executions: 0,
            execution_success_rate: 0,
            execution_credits_balance: 0,
            execution_credits_pending: 0,
            execution_credits_lifetime: 0
          };
          setOperatorStats(defaultStats);
          setCurrentRank(getCurrentRank(defaultStats));
          setNextRank(getNextRank(defaultStats));
          return;
        }

        const stats: OperatorStats = {
          operator_rank_level: profile?.operator_rank_level || 1,
          verified_executions: profile?.verified_executions || 0,
          failed_executions: profile?.failed_executions || 0,
          execution_success_rate: profile?.execution_success_rate || 0,
          last_execution_at: profile?.last_execution_at,
          execution_credits_balance: profile?.execution_credits_balance || 0,
          execution_credits_pending: profile?.execution_credits_pending || 0,
          execution_credits_lifetime: profile?.execution_credits_lifetime || 0
        };

        setOperatorStats(stats);

        // Try to fetch ranks from database
        try {
          const { data: ranksData } = await supabase
            .from('operator_ranks')
            .select('*')
            .order('rank_level', { ascending: true });

          if (ranksData && ranksData.length > 0) {
            // Use database ranks
            const dbRanks = ranksData as OperatorRank[];
            
            // Find current rank
            let current = dbRanks[0];
            for (const rank of dbRanks) {
              if (
                stats.verified_executions >= rank.min_verified_executions &&
                stats.execution_success_rate >= rank.min_success_rate
              ) {
                current = rank;
              } else {
                break;
              }
            }
            setCurrentRank(current);

            // Find next rank
            for (const rank of dbRanks) {
              if (
                stats.verified_executions < rank.min_verified_executions ||
                stats.execution_success_rate < rank.min_success_rate
              ) {
                setNextRank({
                  ...rank,
                  executions_needed: Math.max(0, rank.min_verified_executions - stats.verified_executions),
                  success_rate_needed: Math.max(0, rank.min_success_rate - stats.execution_success_rate)
                });
                break;
              }
            }
          } else {
            // Fallback to default ranks
            setCurrentRank(getCurrentRank(stats));
            setNextRank(getNextRank(stats));
          }
        } catch {
          // Fallback to default ranks
          setCurrentRank(getCurrentRank(stats));
          setNextRank(getNextRank(stats));
        }

      } catch (err) {
        console.error('Error in fetchOperatorRank:', err);
        setError('Failed to load operator rank data');
        
        const defaultStats: OperatorStats = {
          operator_rank_level: 1,
          verified_executions: 0,
          failed_executions: 0,
          execution_success_rate: 0,
          execution_credits_balance: 0,
          execution_credits_pending: 0,
          execution_credits_lifetime: 0
        };
        setOperatorStats(defaultStats);
        setCurrentRank(getCurrentRank(defaultStats));
        setNextRank(getNextRank(defaultStats));
      } finally {
        setLoading(false);
      }
    };

    fetchOperatorRank();
  }, [user]);

  return {
    currentRank,
    nextRank,
    operatorStats,
    loading,
    error,
    canAccessTemplate,
    allRanks: DEFAULT_OPERATOR_RANKS
  };
};

// Re-export for backward compatibility
export { DEFAULT_OPERATOR_RANKS };
