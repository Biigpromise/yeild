import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to create an admin client
const getSupabaseAdminClient = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase environment variables are not set.');
  }

  return createClient(supabaseUrl, serviceRoleKey);
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, ...body } = await req.json();
    const supabaseAdmin = getSupabaseAdminClient();
    let data, error;

    console.log(`Admin operation '${action}' invoked with body:`, body);

    switch (action) {
      case 'check_admin_access':
        ({ data, error } = await supabaseAdmin
          .from('user_roles')
          .select('role')
          .eq('user_id', body.user_id)
          .eq('role', 'admin')
          .maybeSingle());
        if (error) throw error;
        return new Response(JSON.stringify({ has_admin_access: !!data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'assign_admin_role':
        ({ data, error } = await supabaseAdmin
          .from('user_roles')
          .insert({ user_id: body.user_id, role: 'admin' })
          .select());
        if (error) {
           if (error.code === '23505') { // duplicate key
             return new Response(JSON.stringify({ success: true, message: 'User is already an admin.' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
             });
           }
           throw error;
        }
        return new Response(JSON.stringify({ success: !!data }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_pending_submissions':
        ({ data, error } = await supabaseAdmin
          .from('task_submissions')
          .select('*, tasks(title, points, category)')
          .eq('status', 'pending')
          .order('submitted_at', { ascending: true }));
        if (error) throw error;
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_dashboard_stats':
        const { count: totalUsers, error: usersError } = await supabaseAdmin.from('profiles').select('id', { count: 'exact', head: true });
        if (usersError) throw usersError;

        const { count: activeTasks, error: tasksError } = await supabaseAdmin.from('tasks').select('id', { count: 'exact', head: true }).eq('status', 'active');
        if (tasksError) throw tasksError;

        const { data: submissionsData, error: submissionsError } = await supabaseAdmin.from('task_submissions').select('status');
        if (submissionsError) throw submissionsError;

        const totalSubmissions = submissionsData.length;
        const pendingSubmissions = submissionsData.filter(s => s.status === 'pending').length;
        const approvedSubmissions = submissionsData.filter(s => s.status === 'approved').length;
        const approvalRate = totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0;
        
        const stats = {
          totalUsers: totalUsers ?? 0,
          activeTasks: activeTasks ?? 0,
          pendingSubmissions: pendingSubmissions,
          totalSubmissions: totalSubmissions,
          approvedSubmissions: approvedSubmissions,
          approvalRate: approvalRate
        };

        return new Response(JSON.stringify(stats), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'get_task_analytics': {
        const { data: tasks, error: tasksError } = await supabaseAdmin.from('tasks').select('status, category');
        if(tasksError) throw tasksError;
        const { data: submissions, error: submissionsError } = await supabaseAdmin.from('task_submissions').select('status, created_at');
        if(submissionsError) throw submissionsError;

        const totalTasks = tasks.length;
        const activeTasks = tasks.filter(t => t.status === 'active').length;
        const completedTasks = tasks.filter(t => t.status === 'completed').length;
        const pendingSubmissions = submissions.filter(s => s.status === 'pending').length;
        const approvedSubmissions = submissions.filter(s => s.status === 'approved').length;
        const totalSubmissions = submissions.length;
        const approvalRate = totalSubmissions > 0 ? (approvedSubmissions / totalSubmissions) * 100 : 0;
        
        const categoryCounts = tasks.reduce((acc, task) => {
            if (task.category) {
              acc[task.category] = (acc[task.category] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>);
        const topCategories = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 5)
            .map(([category, count]) => ({ category, count }));
        
        const recentActivity = submissions
            .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0,5)
            .map(s => ({
                date: new Date(s.created_at).toLocaleDateString(),
                submissions: 1,
                approvals: s.status === 'approved' ? 1 : 0
            }));

        const analytics = {
            totalTasks,
            activeTasks,
            completedTasks,
            pendingSubmissions,
            approvalRate,
            avgCompletionTime: 0,
            topCategories,
            recentActivity
        };

        return new Response(JSON.stringify(analytics), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'process_task_submission': {
          const { submissionId, status, feedback, processedAt } = body.data;
          const { error: updateError } = await supabaseAdmin
              .from('task_submissions')
              .update({ status: status, admin_notes: feedback, reviewed_at: processedAt })
              .eq('id', submissionId);

          if (updateError) throw updateError;
          return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }

      case 'bulk_task_operation': {
        const { taskIds, operation: bulkAction } = body.data;

        if (!taskIds || !Array.isArray(taskIds) || taskIds.length === 0) {
          throw new Error('taskIds must be a non-empty array.');
        }
        
        if (bulkAction === 'delete') {
          const { error: deleteError } = await supabaseAdmin
            .from('tasks')
            .delete()
            .in('id', taskIds);

          if (deleteError) throw deleteError;

          return new Response(JSON.stringify({ success: true, message: `${taskIds.length} tasks deleted.` }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }
        
        return new Response(JSON.stringify({ message: `Bulk action '${bulkAction}' not implemented.` }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 501,
        });
      }

      // Placeholder for other operations to avoid breaking the app
      // I will implement these as we go
      case 'get_all_users':
      case 'update_user_status':
      case 'assign_user_role':
      case 'bulk_update_users':
      case 'get_system_metrics':
      case 'assign_user_role_enhanced':
      case 'get_user_activity':
      case 'search_tasks_enhanced':
        console.warn(`Operation '${action}' is not fully implemented yet.`);
        return new Response(JSON.stringify({
            message: `Operation '${action}' not implemented.`
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 501, // Not Implemented
        });

      default:
        throw new Error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error('Error in admin operations:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
