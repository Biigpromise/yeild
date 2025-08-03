import { supabase } from '@/integrations/supabase/client';

export interface TaskSourceMetrics {
  taskSource: string;
  totalTasks: number;
  activeTasks: number;
  completedTasks: number;
  totalBudget: number;
  totalPointsAwarded: number;
  avgCompletionRate: number;
  avgTaskValue: number;
  userEngagement: number;
}

export interface TaskSourceAnalytics {
  metrics: TaskSourceMetrics[];
  trends: {
    platform: TaskSourceMetrics[];
    brandCampaign: TaskSourceMetrics[];
  };
  performance: {
    bestPerforming: string;
    totalValue: number;
    completionRates: Record<string, number>;
  };
}

export const taskSourceAnalyticsService = {
  async getTaskSourceAnalytics(dateRange: { start: Date; end: Date }): Promise<TaskSourceAnalytics> {
    try {
      // Get task source analytics data
      const { data: analyticsData, error: analyticsError } = await supabase
        .from('task_source_analytics')
        .select('*')
        .gte('date', dateRange.start.toISOString().split('T')[0])
        .lte('date', dateRange.end.toISOString().split('T')[0])
        .order('date', { ascending: true });

      if (analyticsError) throw analyticsError;

      // Get current task metrics
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          task_source,
          status,
          points,
          original_budget,
          created_at,
          task_submissions!inner(status)
        `);

      if (tasksError) throw tasksError;

      // Process analytics data
      const platformMetrics = this.calculateMetrics(analyticsData?.filter(d => d.task_source === 'platform') || []);
      const brandMetrics = this.calculateMetrics(analyticsData?.filter(d => d.task_source === 'brand_campaign') || []);

      // Calculate current metrics from tasks
      const currentMetrics = this.calculateCurrentMetrics(tasksData || []);

      const analytics: TaskSourceAnalytics = {
        metrics: [
          {
            taskSource: 'platform',
            ...platformMetrics,
            ...currentMetrics.platform
          },
          {
            taskSource: 'brand_campaign',
            ...brandMetrics,
            ...currentMetrics.brandCampaign
          }
        ],
        trends: {
          platform: analyticsData?.filter(d => d.task_source === 'platform').map(d => ({
            taskSource: 'platform',
            totalTasks: d.total_tasks,
            activeTasks: d.active_tasks,
            completedTasks: d.completed_tasks,
            totalBudget: d.total_budget,
            totalPointsAwarded: d.total_points_awarded,
            avgCompletionRate: d.completed_tasks / Math.max(d.total_tasks, 1) * 100,
            avgTaskValue: d.total_budget / Math.max(d.total_tasks, 1),
            userEngagement: d.completed_tasks
          })) || [],
          brandCampaign: analyticsData?.filter(d => d.task_source === 'brand_campaign').map(d => ({
            taskSource: 'brand_campaign',
            totalTasks: d.total_tasks,
            activeTasks: d.active_tasks,
            completedTasks: d.completed_tasks,
            totalBudget: d.total_budget,
            totalPointsAwarded: d.total_points_awarded,
            avgCompletionRate: d.completed_tasks / Math.max(d.total_tasks, 1) * 100,
            avgTaskValue: d.total_budget / Math.max(d.total_tasks, 1),
            userEngagement: d.completed_tasks
          })) || []
        },
        performance: {
          bestPerforming: platformMetrics.avgCompletionRate > brandMetrics.avgCompletionRate ? 'platform' : 'brand_campaign',
          totalValue: platformMetrics.totalBudget + brandMetrics.totalBudget,
          completionRates: {
            platform: platformMetrics.avgCompletionRate,
            brand_campaign: brandMetrics.avgCompletionRate
          }
        }
      };

      return analytics;
    } catch (error) {
      console.error('Error fetching task source analytics:', error);
      throw error;
    }
  },

  calculateMetrics(data: any[]): Partial<TaskSourceMetrics> {
    if (!data.length) {
      return {
        totalTasks: 0,
        activeTasks: 0,
        completedTasks: 0,
        totalBudget: 0,
        totalPointsAwarded: 0,
        avgCompletionRate: 0,
        avgTaskValue: 0,
        userEngagement: 0
      };
    }

    const latest = data[data.length - 1];
    return {
      totalTasks: latest.total_tasks,
      activeTasks: latest.active_tasks,
      completedTasks: latest.completed_tasks,
      totalBudget: latest.total_budget,
      totalPointsAwarded: latest.total_points_awarded,
      avgCompletionRate: latest.completed_tasks / Math.max(latest.total_tasks, 1) * 100,
      avgTaskValue: latest.total_budget / Math.max(latest.total_tasks, 1),
      userEngagement: latest.completed_tasks
    };
  },

  calculateCurrentMetrics(tasks: any[]) {
    const platformTasks = tasks.filter(t => t.task_source === 'platform');
    const brandTasks = tasks.filter(t => t.task_source === 'brand_campaign');

    return {
      platform: {
        totalTasks: platformTasks.length,
        activeTasks: platformTasks.filter(t => t.status === 'active').length,
        completedTasks: platformTasks.filter(t => 
          t.task_submissions?.some((s: any) => s.status === 'approved')
        ).length,
        totalBudget: platformTasks.reduce((sum, t) => sum + (t.points || 0), 0),
        totalPointsAwarded: platformTasks.reduce((sum, t) => 
          sum + (t.task_submissions?.filter((s: any) => s.status === 'approved').length * (t.points || 0)), 0
        )
      },
      brandCampaign: {
        totalTasks: brandTasks.length,
        activeTasks: brandTasks.filter(t => t.status === 'active').length,
        completedTasks: brandTasks.filter(t => 
          t.task_submissions?.some((s: any) => s.status === 'approved')
        ).length,
        totalBudget: brandTasks.reduce((sum, t) => sum + (t.original_budget || t.points || 0), 0),
        totalPointsAwarded: brandTasks.reduce((sum, t) => 
          sum + (t.task_submissions?.filter((s: any) => s.status === 'approved').length * (t.points || 0)), 0
        )
      }
    };
  },

  async getTaskSourceComparison() {
    try {
      const { data, error } = await supabase
        .from('task_source_analytics')
        .select('*')
        .order('date', { ascending: false })
        .limit(2);

      if (error) throw error;

      if (!data || data.length < 2) return null;

      const latest = data[0];
      const previous = data[1];

      return {
        platform: {
          current: latest.task_source === 'platform' ? latest : previous,
          growth: this.calculateGrowth(
            latest.task_source === 'platform' ? latest : previous,
            latest.task_source === 'platform' ? previous : latest
          )
        },
        brandCampaign: {
          current: latest.task_source === 'brand_campaign' ? latest : previous,
          growth: this.calculateGrowth(
            latest.task_source === 'brand_campaign' ? latest : previous,
            latest.task_source === 'brand_campaign' ? previous : latest
          )
        }
      };
    } catch (error) {
      console.error('Error getting task source comparison:', error);
      return null;
    }
  },

  calculateGrowth(current: any, previous: any) {
    if (!previous || !current) return 0;
    return ((current.completed_tasks - previous.completed_tasks) / Math.max(previous.completed_tasks, 1)) * 100;
  }
};