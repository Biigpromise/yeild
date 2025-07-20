
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface AuthGuardOptions {
  requireAuth?: boolean;
  requiredRole?: string;
  redirectTo?: string;
}

export class AuthGuard {
  static async checkAccess(options: AuthGuardOptions = {}): Promise<boolean> {
    const { requireAuth = true, requiredRole, redirectTo = '/login' } = options;

    try {
      if (!requireAuth) {
        return true;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth check error:', error);
        toast.error('Authentication error');
        if (redirectTo) {
          window.location.href = redirectTo;
        }
        return false;
      }

      if (!user) {
        toast.error('Please sign in to access this page');
        if (redirectTo) {
          window.location.href = redirectTo;
        }
        return false;
      }

      if (requiredRole) {
        const { data: roles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Role check error:', roleError);
          toast.error('Permission check failed');
          return false;
        }

        const hasRole = roles?.some(r => r.role === requiredRole);
        if (!hasRole) {
          toast.error(`Access denied. ${requiredRole} role required.`);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Auth guard error:', error);
      toast.error('Access check failed');
      return false;
    }
  }

  static async requireAdmin(): Promise<boolean> {
    return this.checkAccess({ 
      requireAuth: true, 
      requiredRole: 'admin',
      redirectTo: '/login'
    });
  }

  static async requireBrand(): Promise<boolean> {
    return this.checkAccess({ 
      requireAuth: true, 
      requiredRole: 'brand',
      redirectTo: '/login'
    });
  }
}
