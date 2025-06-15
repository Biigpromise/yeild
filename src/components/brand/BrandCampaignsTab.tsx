
import React from "react";
import { useBrandCampaigns } from "@/hooks/useBrandCampaigns";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, MoreVertical, Edit } from "lucide-react";
import { Task } from "@/services/taskService";
import { CampaignFormDialog } from "./CampaignFormDialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

export const BrandCampaignsTab: React.FC = () => {
    const { campaigns, loading, refreshCampaigns } = useBrandCampaigns();
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [editingCampaign, setEditingCampaign] = React.useState<Task | null>(null);

    const handleCreateClick = () => {
        setEditingCampaign(null);
        setIsFormOpen(true);
    };

    const handleEditClick = (campaign: Task) => {
        setEditingCampaign(campaign);
        setIsFormOpen(true);
    };

    const handleSave = () => {
        refreshCampaigns();
    };


    if (loading) {
        return <LoadingState text="Loading your campaigns..." />;
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Your Campaigns</CardTitle>
                    <CardDescription>View and manage your marketing campaigns.</CardDescription>
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
                                    <TableHead>Points</TableHead>
                                    <TableHead>Expires</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {campaigns.map(campaign => (
                                    <TableRow key={campaign.id}>
                                        <TableCell className="font-medium">{campaign.title}</TableCell>
                                        <TableCell><Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>{campaign.status}</Badge></TableCell>
                                        <TableCell>{campaign.points}</TableCell>
                                        <TableCell>{campaign.expires_at ? new Date(campaign.expires_at).toLocaleDateString() : 'N/A'}</TableCell>
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
                            <p className="text-muted-foreground mb-4">Click "Create Campaign" above to get started.</p>
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
        </>
    );
}
