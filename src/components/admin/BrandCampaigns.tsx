
import React, { useState } from "react";
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Plus, 
  Search, 
  Calendar, 
  Target, 
  DollarSign, 
  Users,
  TrendingUp,
  Eye
} from "lucide-react";

export const BrandCampaigns = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const [campaigns, setCampaigns] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('brand_campaigns')
        .select(`
          *,
          brand_profiles!inner(company_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedCampaigns = data?.map(campaign => ({
        id: campaign.id,
        name: campaign.title,
        brand: campaign.brand_profiles?.company_name || 'Unknown Brand',
        status: campaign.status || 'draft',
        budget: campaign.budget || 0,
        spent: campaign.funded_amount || 0,
        impressions: Math.floor(Math.random() * 50000) + 10000, // Mock data
        clicks: Math.floor(Math.random() * 2000) + 500, // Mock data
        conversions: Math.floor(Math.random() * 100) + 20, // Mock data
        startDate: campaign.start_date || campaign.created_at,
        endDate: campaign.end_date || campaign.created_at,
        description: campaign.description
      })) || [];

      setCampaigns(formattedCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredCampaigns = campaigns.filter(campaign =>
    campaign.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    campaign.brand.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Brand Campaigns</h2>
          <p className="text-muted-foreground">
            Manage and monitor brand advertising campaigns 
            {campaigns.length > 0 && ` (${campaigns.length} campaigns)`}
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Create Campaign
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{campaigns.length}</p>
                <p className="text-sm text-muted-foreground">Total Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  ${campaigns.reduce((sum, c) => sum + c.spent, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Spent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.impressions, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Impressions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">
                  {campaigns.reduce((sum, c) => sum + c.conversions, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Total Conversions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All Campaigns</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="paused">Paused</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Campaign Overview</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search campaigns..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Brand</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Budget</TableHead>
                      <TableHead>Spent</TableHead>
                      <TableHead>Impressions</TableHead>
                      <TableHead>Clicks</TableHead>
                      <TableHead>Conversions</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCampaigns.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10} className="text-center py-8">
                          <div className="text-muted-foreground">
                            {campaigns.length === 0 ? 'No campaigns found' : 'No campaigns match your search'}
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredCampaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell className="font-medium">{campaign.name}</TableCell>
                          <TableCell>{campaign.brand}</TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>₦{campaign.budget.toLocaleString()}</TableCell>
                          <TableCell>₦{campaign.spent.toLocaleString()}</TableCell>
                          <TableCell>{campaign.impressions.toLocaleString()}</TableCell>
                          <TableCell>{campaign.clicks.toLocaleString()}</TableCell>
                          <TableCell>{campaign.conversions}</TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <div>{new Date(campaign.startDate).toLocaleDateString()}</div>
                              <div className="text-muted-foreground">to {new Date(campaign.endDate).toLocaleDateString()}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline">View</Button>
                              <Button size="sm" variant="outline">Edit</Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
