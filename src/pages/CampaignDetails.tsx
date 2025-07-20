import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Calendar, Users, Target, DollarSign } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { CampaignFundingForm } from '@/components/payments/CampaignFundingForm';

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  funded_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  target_audience: any;
  requirements: any;
  brand_id: string;
  created_at: string;
  updated_at: string;
}

export const CampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      loadCampaign();
    }
  }, [id]);

  useEffect(() => {
    // Check for funding success from URL params
    if (searchParams.get('funding') === 'success') {
      toast({
        title: "Funding Successful!",
        description: "Your campaign funding has been processed successfully",
      });
    }
  }, [searchParams, toast]);

  const loadCampaign = async () => {
    if (!id) return;

    try {
      const { data, error } = await supabase
        .from('campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      setCampaign(data);
    } catch (error) {
      console.error('Error loading campaign:', error);
      toast({
        title: "Error",
        description: "Failed to load campaign details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Campaign Not Found</h1>
          <p className="text-muted-foreground mb-6">
            The campaign you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const fundingProgress = (campaign.funded_amount / campaign.budget) * 100;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
            {campaign.status}
          </Badge>
        </div>

        {/* Campaign Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">{campaign.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground text-lg">{campaign.description}</p>

            {/* Campaign Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <DollarSign className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold">₦{campaign.budget.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Budget</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Target className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold">₦{campaign.funded_amount.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Funded</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold">{new Date(campaign.start_date).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">Start Date</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <Calendar className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                <div className="font-semibold">{new Date(campaign.end_date).toLocaleDateString()}</div>
                <div className="text-sm text-muted-foreground">End Date</div>
              </div>
            </div>

            {/* Funding Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Funding Progress</span>
                <span>{fundingProgress.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(fundingProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="funding">Funding</TabsTrigger>
            <TabsTrigger value="requirements">Requirements</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Target Audience</h4>
                  {campaign.target_audience ? (
                    <div className="space-y-2">
                      {Object.entries(campaign.target_audience).map(([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key.replace('_', ' ')}:</span>
                          <span>{Array.isArray(value) ? value.join(', ') : String(value)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specific target audience defined</p>
                  )}
                </div>

                <div>
                  <h4 className="font-medium mb-2">Campaign Timeline</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created:</span>
                      <p>{new Date(campaign.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Updated:</span>
                      <p>{new Date(campaign.updated_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="funding" className="space-y-6">
            {user ? (
              <CampaignFundingForm 
                campaign={campaign} 
                onFundingComplete={() => {
                  loadCampaign();
                  toast({
                    title: "Funding Successful",
                    description: "Thank you for funding this campaign!",
                  });
                }}
              />
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <h3 className="font-semibold mb-2">Login Required</h3>
                  <p className="text-muted-foreground mb-4">
                    Please log in to fund this campaign
                  </p>
                  <Button onClick={() => window.location.href = '/auth'}>
                    Login to Fund Campaign
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Requirements</CardTitle>
              </CardHeader>
              <CardContent>
                {campaign.requirements ? (
                  <div className="space-y-4">
                    {Object.entries(campaign.requirements).map(([key, value]) => (
                      <div key={key}>
                        <h4 className="font-medium mb-2 capitalize">{key.replace('_', ' ')}</h4>
                        <div className="text-sm text-muted-foreground">
                          {Array.isArray(value) ? (
                            <ul className="list-disc list-inside space-y-1">
                              {value.map((item, index) => (
                                <li key={index}>{String(item)}</li>
                              ))}
                            </ul>
                          ) : (
                            <p>{String(value)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specific requirements defined for this campaign</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};