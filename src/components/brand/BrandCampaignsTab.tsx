
import React from "react";
import { useBrandCampaigns } from "@/hooks/useBrandCampaigns";
import { LoadingState } from "@/components/ui/loading-state";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";

export const BrandCampaignsTab: React.FC = () => {
    const { campaigns, loading } = useBrandCampaigns();

    if (loading) {
        return <LoadingState text="Loading your campaigns..." />;
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Your Campaigns</CardTitle>
                    <CardDescription>View and manage your marketing campaigns.</CardDescription>
                </div>
                <Button disabled>
                    <PlusCircle className="mr-2 h-4 w-4" /> Create Campaign
                </Button>
            </CardHeader>
            <CardContent>
                {campaigns.length > 0 ? (
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Points</TableHead>
                                <TableHead>Expires</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {campaigns.map(campaign => (
                                <TableRow key={campaign.id}>
                                    <TableCell className="font-medium">{campaign.title}</TableCell>
                                    <TableCell><Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>{campaign.status}</Badge></TableCell>
                                    <TableCell>{campaign.points}</TableCell>
                                    <TableCell>{campaign.expires_at ? new Date(campaign.expires_at).toLocaleDateString() : 'N/A'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">No campaigns yet</h3>
                        <p className="text-muted-foreground">Click "Create Campaign" to get started.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
