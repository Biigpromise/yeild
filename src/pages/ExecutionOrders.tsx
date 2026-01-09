import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useOperatorRank } from '@/hooks/useOperatorRank';
import { supabase } from '@/integrations/supabase/client';
import { 
  Search, 
  Target, 
  Trophy, 
  ArrowLeft, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  Zap,
  Shield,
  AlertTriangle,
  FileCheck,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { ExecutionOrder, ExecutionOrderTemplate } from '@/types/execution';

interface ExecutionOrderWithTemplate extends ExecutionOrder {
  template: ExecutionOrderTemplate;
}

const ExecutionOrders: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentRank, operatorStats } = useOperatorRank();
  
  const [orders, setOrders] = useState<ExecutionOrderWithTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('available');
  const [userSubmissions, setUserSubmissions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadOrders();
    loadUserSubmissions();
  }, []);

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('execution_orders')
        .select(`
          *,
          template:execution_order_templates(*)
        `)
        .eq('status', 'active')
        .eq('admin_approval_status', 'approved')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as ExecutionOrderWithTemplate[]);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast.error('Failed to load execution orders');
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubmissions = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('execution_submissions')
        .select('order_id')
        .eq('operator_id', user.id);

      if (error) throw error;
      setUserSubmissions(new Set(data?.map(s => s.order_id) || []));
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const canAccessOrder = (order: ExecutionOrderWithTemplate): boolean => {
    if (!currentRank) return false;
    return currentRank.rank_level >= (order.template?.min_rank_level || 1);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty?.toLowerCase()) {
      case 'basic':
        return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'standard':
        return 'bg-blue-500/10 text-blue-600 border-blue-500/20';
      case 'priority':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'high-value':
        return 'bg-purple-500/10 text-purple-600 border-purple-500/20';
      case 'audit':
        return 'bg-red-500/10 text-red-600 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.title.toLowerCase().includes(searchTerm.toLowerCase());
    const isSubmitted = userSubmissions.has(order.id);
    
    if (activeTab === 'available') {
      return matchesSearch && !isSubmitted && order.completed_quantity < order.target_quantity;
    } else if (activeTab === 'submitted') {
      return matchesSearch && isSubmitted;
    }
    return matchesSearch;
  });

  const handleOrderClick = (order: ExecutionOrderWithTemplate) => {
    if (!canAccessOrder(order)) {
      toast.error(`You need ${order.template?.name || 'higher'} rank to access this order`);
      return;
    }
    navigate(`/execution-orders/${order.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading execution orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 border-b">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative w-full mx-auto px-4 py-8 sm:py-12">
          <div className="flex items-center justify-between mb-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/dashboard')} 
              className="flex items-center gap-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Target className="h-8 w-8 text-primary" />
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
                Execution Orders
              </h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Complete verified executions to earn credits. Higher ranks unlock more valuable orders.
            </p>
            
            {/* Operator Stats Summary */}
            <div className="flex items-center justify-center gap-4 pt-4">
              <Badge variant="secondary" className="flex items-center gap-2 px-3 py-1.5">
                <Shield className="h-4 w-4" />
                {currentRank?.name || 'Unranked'}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                <Zap className="h-4 w-4" />
                {operatorStats?.execution_credits_balance || 0} Credits
              </Badge>
              <Badge variant="outline" className="flex items-center gap-2 px-3 py-1.5">
                <CheckCircle className="h-4 w-4" />
                {operatorStats?.verified_executions || 0} Verified
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-6 space-y-6 max-w-7xl mx-auto">
        {/* Search */}
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search execution orders..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="available" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Available Orders
            </TabsTrigger>
            <TabsTrigger value="submitted" className="flex items-center gap-2">
              <FileCheck className="h-4 w-4" />
              My Submissions
            </TabsTrigger>
          </TabsList>

          <TabsContent value="available" className="space-y-4 mt-6">
            {filteredOrders.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-semibold mb-2">No Available Orders</h3>
                  <p className="text-muted-foreground">
                    Check back later for new execution orders.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredOrders.map(order => {
                  const canAccess = canAccessOrder(order);
                  const spotsLeft = order.target_quantity - order.completed_quantity;
                  
                  return (
                    <Card 
                      key={order.id} 
                      className={`group cursor-pointer transition-all duration-300 hover:shadow-lg ${
                        canAccess 
                          ? 'hover:scale-105 hover:border-primary/50' 
                          : 'opacity-60'
                      }`}
                      onClick={() => handleOrderClick(order)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between mb-2">
                          <Badge className={getDifficultyColor(order.template?.difficulty_level || '')}>
                            {order.template?.difficulty_level}
                          </Badge>
                          {!canAccess && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Lock className="h-3 w-3" />
                              Locked
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors">
                          {order.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {order.template?.description}
                        </p>
                        
                        {/* Order Info */}
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Payout:</span>
                            <span className="font-bold text-primary">
                              {order.operator_payout} credits
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Spots Left:</span>
                            <span className={spotsLeft < 10 ? 'text-destructive font-bold' : ''}>
                              {spotsLeft} / {order.target_quantity}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Verification:</span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {order.verification_window_hours}h window
                            </span>
                          </div>
                        </div>

                        {/* Required Proofs */}
                        {order.template?.required_proof_types && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground mb-2">Required Proofs:</p>
                            <div className="flex flex-wrap gap-1">
                              {order.template.required_proof_types.slice(0, 3).map((proof, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {proof.replace('_', ' ')}
                                </Badge>
                              ))}
                              {order.template.required_proof_types.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{order.template.required_proof_types.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}

                        <Button 
                          className="w-full" 
                          disabled={!canAccess}
                        >
                          {canAccess ? (
                            <>
                              <Sparkles className="h-4 w-4 mr-2" />
                              Start Execution
                            </>
                          ) : (
                            <>
                              <Lock className="h-4 w-4 mr-2" />
                              Rank Required: Level {order.template?.min_rank_level}
                            </>
                          )}
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="submitted" className="space-y-4 mt-6">
            <Card>
              <CardContent className="p-12 text-center">
                <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Your Submissions</h3>
                <p className="text-muted-foreground">
                  Your submitted executions will appear here.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Card */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold mb-2">Execution Order Rules</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• All submissions require proof of completion</li>
                  <li>• Credits are held for 7 days before release</li>
                  <li>• Failed verifications affect your success rate</li>
                  <li>• YEILD has final authority on all verifications</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutionOrders;
