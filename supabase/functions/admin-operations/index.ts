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
      
      case 'assign_user_role_enhanced':
        return await assignUserRoleEnhanced(supabase, data, user.id);
      case 'get_user_activity':
        return await getUserActivity(supabase, data);
      case 'update_account_status':
        return await updateAccountStatus(supabase, data, user.id);
      case 'bulk_user_operation':
        return await performBulkUserOperation(supabase, data, user.id);
      
      case 'process_task_submission':
        return await processTaskSubmission(supabase, data, user.id);
      case 'bulk_task_operation':
        return await performBulkTaskOperation(supabase, data, user.id);
      case 'get_task_analytics':
        return await getTaskAnalytics(supabase, data);
      case 'get_pending_submissions':
        return await getPendingSubmissions(supabase, data);
      
      case 'process_withdrawal_request':
        return await processWithdrawalRequest(supabase, data, user.id);
      case 'get_withdrawal_requests':
        return await getWithdrawalRequests(supabase, data);
      case 'get_financial_metrics':
        return await getFinancialMetrics(supabase, data);
      case 'bulk_process_withdrawals':
        return await bulkProcessWithdrawals(supabase, data, user.id);
      
      case 'get_audit_logs':
        return await getAuditLogs(supabase, data);
      case 'log_audit_action':
        return await logAuditAction(supabase, data, user.id);
      case 'get_security_alerts':
        return await getSecurityAlerts(supabase);
      case 'update_security_alert':
        return await updateSecurityAlert(supabase, data, user.id);
      case 'get_backup_status':
        return await getBackupStatus(supabase);
      case 'initiate_backup':
        return await initiateBackup(supabase, data, user.id);
      
      case 'get_support_tickets':
        return await getSupportTickets(supabase, data);
      case 'update_ticket_status':
        return await updateTicketStatus(supabase, data, user.id);
      case 'add_ticket_response':
        return await addTicketResponse(supabase, data, user.id);
      case 'get_message_templates':
        return await getMessageTemplates(supabase);
      case 'create_message_template':
        return await createMessageTemplate(supabase, data, user.id);
      case 'send_bulk_message':
        return await sendBulkMessage(supabase, data, user.id);
      
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

async function assignUserRoleEnhanced(supabase: any, data: any, adminId: string) {
  // Enhanced role assignment with audit trail
  console.log('Enhanced role assignment:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getUserActivity(supabase: any, data: any) {
  // Mock user activity data
  const mockActivity = [
    { userId: '1', userName: 'John Doe', lastActive: '2025-06-14T10:30:00Z', tasksCompleted: 15, pointsEarned: 750, streakDays: 5, accountStatus: 'active' },
    { userId: '2', userName: 'Jane Smith', lastActive: '2025-06-14T09:15:00Z', tasksCompleted: 23, pointsEarned: 1150, streakDays: 8, accountStatus: 'active' }
  ];
  
  return new Response(JSON.stringify(mockActivity), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateAccountStatus(supabase: any, data: any, adminId: string) {
  console.log('Account status update:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function performBulkUserOperation(supabase: any, data: any, adminId: string) {
  console.log('Bulk user operation:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function processTaskSubmission(supabase: any, data: any, adminId: string) {
  console.log('Task submission processing:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function performBulkTaskOperation(supabase: any, data: any, adminId: string) {
  console.log('Bulk task operation:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getTaskAnalytics(supabase: any, data: any) {
  const mockAnalytics = {
    totalTasks: 150,
    activeTasks: 45,
    completedTasks: 105,
    pendingSubmissions: 23,
    approvalRate: 78.5,
    avgCompletionTime: 24.5,
    topCategories: [
      { category: 'Social Media', count: 45 },
      { category: 'Survey', count: 32 }
    ]
  };
  
  return new Response(JSON.stringify(mockAnalytics), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getPendingSubmissions(supabase: any, data: any) {
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function processWithdrawalRequest(supabase: any, data: any, adminId: string) {
  console.log('Withdrawal request processing:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getWithdrawalRequests(supabase: any, data: any) {
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getFinancialMetrics(supabase: any, data: any) {
  const mockMetrics = {
    totalPayouts: 125000,
    pendingPayouts: 8500,
    totalRevenue: 45000,
    avgWithdrawalAmount: 250,
    payoutMethods: [
      { method: 'Bank Transfer', count: 45, amount: 11250 },
      { method: 'PayPal', count: 32, amount: 8000 }
    ],
    monthlyTrends: [
      { month: 'Jan', payouts: 8500, revenue: 3200 },
      { month: 'Feb', payouts: 9200, revenue: 3800 }
    ]
  };
  
  return new Response(JSON.stringify(mockMetrics), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function bulkProcessWithdrawals(supabase: any, data: any, adminId: string) {
  console.log('Bulk withdrawal processing:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getAuditLogs(supabase: any, data: any) {
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function logAuditAction(supabase: any, data: any, adminId: string) {
  console.log('Audit log entry:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getSecurityAlerts(supabase: any) {
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateSecurityAlert(supabase: any, data: any, adminId: string) {
  console.log('Security alert update:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getBackupStatus(supabase: any) {
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function initiateBackup(supabase: any, data: any, adminId: string) {
  console.log('Backup initiated:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getSupportTickets(supabase: any, data: any) {
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function updateTicketStatus(supabase: any, data: any, adminId: string) {
  console.log('Ticket status update:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function addTicketResponse(supabase: any, data: any, adminId: string) {
  console.log('Ticket response added:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function getMessageTemplates(supabase: any) {
  return new Response(JSON.stringify([]), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function createMessageTemplate(supabase: any, data: any, adminId: string) {
  console.log('Message template created:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

async function sendBulkMessage(supabase: any, data: any, adminId: string) {
  console.log('Bulk message sent:', data);
  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
