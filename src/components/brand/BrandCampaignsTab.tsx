
import React from "react";
import { useBrandCampaigns } from "@/hooks/useBrandCampaigns";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreVertical, Edit, DollarSign } from "lucide-react";
import { CampaignFormDialog } from "./CampaignFormDialog";
import { CampaignFundingDialog } from "./CampaignFundingDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { BrandCampaign } from "@/hooks/useBrandCampaigns";

export const BrandCampaignsTab: React.FC = () => {
    const { campaigns, loading, refreshCampaigns } = useBrandCampaigns();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [isFundingOpen, setIsFundingOpen] = React.useState(false);
    const [editingCampaign, setEditingCampaign] = React.useState<BrandCampaign | null>(null);
    const [fundingCampaign, setFundingCampaign] = React.useState<BrandCampaign | null>(null);

    const handleCreateClick = () => {
        setEditingCampaign(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (campaign: BrandCampaign) => {
        setEditingCampaign(campaign);
        setIsFormOpen(true);
    };

    const handleFundClick = (campaign: BrandCampaign) => {
        setFundingCampaign(campaign);
        setIsFundingOpen(true);
    };

    const handleSave = () => {
        refreshCampaigns();
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'paused': return 'bg-yellow-100 text-yellow-800';
            case 'completed': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return <LoadingState text="Loading your campaigns..." />;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Your Campaigns</CardTitle>
                    <CardDescription>Create and manage your marketing campaigns. Minimum budget is $10.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-end mb-4">
                        <Button onClick={handleCreateClick}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
                        </Button>
                    </div>
                    {campaigns.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Budget</TableHead>
                                    <TableHead>Funded</TableHead>
                                    <TableHead>Created</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map(campaign => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">{campaign.title}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(campaign.status)}>
                                                {campaign.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>${campaign.budget.toFixed(2)}</TableCell>
                                        <TableCell>${campaign.funded_amount.toFixed(2)}</TableCell>
                                        <TableCell>{new Date(campaign.created_at).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem onClick={() => handleEditClick(campaign)}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleFundClick(campaign)}>
                                                        <DollarSign className="mr-2 h-4 w-4" />
                                                        Add Funding
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                        <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                            <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                            <p className="text-muted-foreground mb-4">Create your first campaign to start engaging with users. Minimum budget is $10.</p>
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <CampaignFormDialog
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                onCampaignSaved={handleSave}
                campaign={editingCampaign}
            />
            
            <CampaignFundingDialog
                open={isFundingOpen}
                onOpenChange={setIsFundingOpen}
                campaign={fundingCampaign}
                onFundingComplete={handleSave}
            />
        </>
    );
}
