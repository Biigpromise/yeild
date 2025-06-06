
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check if user is admin
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!userRoles) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { operation, data } = await req.json();

    switch (operation) {
      case 'get_dashboard_stats':
        return await getDashboardStats(supabase);
      
      case 'get_all_users':
        return await getAllUsers(supabase);
      
      case 'update_user_status':
        return await updateUserStatus(supabase, data);
      
      case 'assign_user_role':
        return await assignUserRole(supabase, data, user.id);
      
      case 'get_system_metrics':
        return await getSystemMetrics(supabase);
      
      default:
        return new Response(JSON.stringify({ error: 'Invalid operation' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
  } catch (error) {
    console.error('Admin operations error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});

async function getDashboardStats(supabase: any) {
  try {
    const [
      { count: totalUsers },
      { count: activeTasks },
      { count: pendingSubmissions },
      { count: totalSubmissions },
      { count: approvedSubmissions }
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('tasks').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('task_submissions').select('*', { count: 'exact', head: true }),
      supabase.from('task_submissions').select('*', { count: 'exact', head: true }).eq('status', 'approved')
    ]);

    const stats = {
      totalUsers: totalUsers || 0,
      activeTasks: activeTasks || 0,
      pendingSubmissions: pendingSubmissions || 0,
      totalSubmissions: totalSubmissions || 0,
      approvedSubmissions: approvedSubmissions || 0,
      approvalRate: totalSubmissions > 0 ? Math.round((approvedSubmissions / totalSubmissions) * 100) : 0
    };

    return new Response(JSON.stringify(stats), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    throw error;
  }
}

async function getAllUsers(supabase: any) {
  try {
    const { data: users, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_roles(role)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return new Response(JSON.stringify(users), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting all users:', error);
    throw error;
  }
}

async function updateUserStatus(supabase: any, data: any) {
  try {
    const { userId, status } = data;
    
    // Update user profile status (you might need to add a status column to profiles)
    const { data: updatedUser, error } = await supabase
      .from('profiles')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(updatedUser), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
}

async function assignUserRole(supabase: any, data: any, adminId: string) {
  try {
    const { userId, role } = data;
    
    const { data: userRole, error } = await supabase
      .from('user_roles')
      .upsert({
        user_id: userId,
        role: role,
        assigned_by: adminId
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify(userRole), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error assigning user role:', error);
    throw error;
  }
}

async function getSystemMetrics(supabase: any) {
  try {
    // Get various system metrics
    const [
      { data: recentSignups },
      { data: recentTasks },
      { data: recentSubmissions }
    ] = await Promise.all([
      supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('tasks')
        .select('created_at, points')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false }),
      supabase
        .from('task_submissions')
        .select('submitted_at, status')
        .gte('submitted_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('submitted_at', { ascending: false })
    ]);

    const metrics = {
      recentSignups: recentSignups?.length || 0,
      recentTasks: recentTasks?.length || 0,
      recentSubmissions: recentSubmissions?.length || 0,
      totalPointsAwarded: recentTasks?.reduce((sum, task) => sum + (task.points || 0), 0) || 0
    };

    return new Response(JSON.stringify(metrics), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error getting system metrics:', error);
    throw error;
  }
}
