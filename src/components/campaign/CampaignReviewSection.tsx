import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Check, Clock, DollarSign, Users, Target, Calendar, Image, Link, FileText } from 'lucide-react';

interface CampaignReviewSectionProps {
  formData: any;
  onSubmit: () => void;
  loading: boolean;
}

export const CampaignReviewSection: React.FC<CampaignReviewSectionProps> = ({
  formData,
  onSubmit,
  loading
}) => {
  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'NGN' ? '₦' : '$';
    return `${symbol}${amount.toLocaleString()}`;
  };

  const estimatedReach = Math.floor(formData.budget * (formData.currency === 'NGN' ? 0.01 : 15));
  const estimatedTasks = Math.floor(formData.budget * (formData.currency === 'NGN' ? 0.005 : 7));

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Review Your Campaign</h2>
        <p className="text-muted-foreground">
          Please review all details before submitting your campaign for approval
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Basic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Basic Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Campaign Title</div>
              <div className="text-base font-semibold">{formData.title}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Category</div>
              <Badge variant="secondary">{formData.category}</Badge>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Description</div>
              <div className="text-sm">{formData.description}</div>
            </div>
            {formData.logo_url && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Campaign Logo</div>
                <img 
                  src={formData.logo_url} 
                  alt="Campaign logo" 
                  className="w-16 h-16 object-contain border border-border rounded"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget & Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Budget & Timeline
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Budget</div>
                <div className="text-lg font-bold">{formatCurrency(formData.budget, formData.currency)}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Funding Source</div>
                <Badge variant={formData.funding_source === 'wallet' ? 'default' : 'secondary'}>
                  {formData.funding_source === 'wallet' ? 'Wallet' : 'Direct Payment'}
                </Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Start Date</div>
                <div className="text-sm">{formData.start_date || 'Not specified'}</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">End Date</div>
                <div className="text-sm">{formData.end_date || 'Not specified'}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Targeting */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Target Audience
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">Age Range</div>
                <div className="text-sm">{formData.target_demographics.ageRange} years</div>
              </div>
              <div>
                <div className="text-sm font-medium text-muted-foreground">Gender</div>
                <div className="text-sm">{formData.target_demographics.gender}</div>
              </div>
            </div>
            {formData.target_demographics.location.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Locations</div>
                <div className="flex flex-wrap gap-1">
                  {formData.target_demographics.location.map((location: string) => (
                    <Badge key={location} variant="outline" className="text-xs">
                      {location}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {formData.target_demographics.interests.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Interests</div>
                <div className="flex flex-wrap gap-1">
                  {formData.target_demographics.interests.map((interest: string) => (
                    <Badge key={interest} variant="outline" className="text-xs">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Campaign Brief */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Campaign Brief
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="text-sm font-medium text-muted-foreground">Main Brief</div>
              <div className="text-sm">{formData.brief.mainBrief || 'Not provided'}</div>
            </div>
            {formData.brief.objectives.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Objectives</div>
                <ul className="text-sm space-y-1">
                  {formData.brief.objectives.map((objective: string, index: number) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="h-3 w-3 text-green-500" />
                      {objective}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {formData.brief.deliverables.length > 0 && (
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-2">Deliverables</div>
                <div className="space-y-1">
                  {formData.brief.deliverables.map((deliverable: any, index: number) => (
                    <div key={index} className="text-xs p-2 bg-muted rounded">
                      <div className="font-medium">{deliverable.type}</div>
                      <div>Quantity: {deliverable.quantity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Estimated Impact */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Estimated Campaign Impact
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">{estimatedReach.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Estimated Reach</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">{estimatedTasks.toLocaleString()}+</div>
              <div className="text-sm text-muted-foreground">Expected Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">24-48h</div>
              <div className="text-sm text-muted-foreground">Approval Time</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* What Happens Next */}
      <Card>
        <CardHeader>
          <CardTitle>What Happens Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <div className="font-medium">Campaign Submission</div>
                <div className="text-sm text-muted-foreground">Your campaign is submitted for review</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <div className="font-medium">Admin Review</div>
                <div className="text-sm text-muted-foreground">Our team reviews your campaign (24-48 hours)</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <div className="font-medium">Campaign Goes Live</div>
                <div className="text-sm text-muted-foreground">Once approved, participants can start working on your tasks</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                4
              </div>
              <div>
                <div className="font-medium">Track Progress</div>
                <div className="text-sm text-muted-foreground">Monitor submissions and approve completed tasks</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button 
          onClick={onSubmit} 
          disabled={loading}
          size="lg"
          className="w-full max-w-md"
        >
          {loading ? (
            <>
              <Clock className="h-4 w-4 mr-2 animate-spin" />
              Creating Campaign...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Submit Campaign for Approval
            </>
          )}
        </Button>
      </div>
    </div>
  );
};