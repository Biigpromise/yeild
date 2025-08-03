
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { pointCalculationService } from "../pointCalculationService";

export interface AutoProcessingRule {
  id: string;
  taskType: string;
  conditions: {
    minEvidenceLength?: number;
    requiredKeywords?: string[];
    autoApproveTimeLimit?: number; // minutes
    qualityThreshold?: number;
  };
  autoApprove: boolean;
  defaultQualityScore: number;
}

export const automatedTaskProcessingService = {
  // Default auto-processing rules
  getDefaultRules(): AutoProcessingRule[] {
    return [
      {
        id: "social_media_follow",
        taskType: "social_media",
        conditions: {
          minEvidenceLength: 20,
          requiredKeywords: ["followed", "subscribe", "like"],
          autoApproveTimeLimit: 30,
          qualityThreshold: 70
        },
        autoApprove: true,
        defaultQualityScore: 80
      },
      {
        id: "app_download",
        taskType: "app_testing",
        conditions: {
          minEvidenceLength: 15,
          requiredKeywords: ["downloaded", "installed", "app"],
          autoApproveTimeLimit: 60,
          qualityThreshold: 75
        },
        autoApprove: true,
        defaultQualityScore: 85
      },
      {
        id: "survey_completion",
        taskType: "survey",
        conditions: {
          minEvidenceLength: 50,
          autoApproveTimeLimit: 15,
          qualityThreshold: 90
        },
        autoApprove: true,
        defaultQualityScore: 90
      }
    ];
  },

  // Check if a submission meets auto-approval criteria
  canAutoApprove(submission: any, task: any): { canApprove: boolean; qualityScore: number; reasons: string[] } {
    const rules = this.getDefaultRules();
    const rule = rules.find(r => r.taskType === task.task_type);
    
    if (!rule || !rule.autoApprove) {
      return { canApprove: false, qualityScore: 0, reasons: ["No auto-approval rule found"] };
    }

    const reasons: string[] = [];
    let qualityScore = rule.defaultQualityScore;

    // Check minimum evidence length
    if (rule.conditions.minEvidenceLength && submission.evidence.length < rule.conditions.minEvidenceLength) {
      reasons.push(`Evidence too short (${submission.evidence.length} < ${rule.conditions.minEvidenceLength})`);
      return { canApprove: false, qualityScore: 0, reasons };
    }

    // Check required keywords
    if (rule.conditions.requiredKeywords) {
      const evidenceLower = submission.evidence.toLowerCase();
      const foundKeywords = rule.conditions.requiredKeywords.filter(keyword => 
        evidenceLower.includes(keyword.toLowerCase())
      );
      
      if (foundKeywords.length === 0) {
        reasons.push(`No required keywords found: ${rule.conditions.requiredKeywords.join(', ')}`);
        return { canApprove: false, qualityScore: 0, reasons };
      }
      
      // Adjust quality score based on keyword matches
      const keywordRatio = foundKeywords.length / rule.conditions.requiredKeywords.length;
      qualityScore = Math.floor(qualityScore * (0.7 + 0.3 * keywordRatio));
    }

    // Check submission timing
    if (rule.conditions.autoApproveTimeLimit) {
      const submissionTime = new Date(submission.submitted_at);
      const minutesAgo = (Date.now() - submissionTime.getTime()) / (1000 * 60);
      
      if (minutesAgo > rule.conditions.autoApproveTimeLimit) {
        reasons.push(`Submission too old (${Math.floor(minutesAgo)} minutes)`);
        return { canApprove: false, qualityScore: 0, reasons };
      }
    }

    // Check if evidence file exists (bonus points)
    if (submission.evidence_file_url) {
      qualityScore += 10;
      reasons.push("Evidence file provided (+10 quality)");
    }

    // Check quality threshold
    if (rule.conditions.qualityThreshold && qualityScore < rule.conditions.qualityThreshold) {
      reasons.push(`Quality score too low (${qualityScore} < ${rule.conditions.qualityThreshold})`);
      return { canApprove: false, qualityScore, reasons };
    }

    reasons.push(`Auto-approved with quality score: ${qualityScore}`);
    return { canApprove: true, qualityScore, reasons };
  },

  // Process pending submissions for auto-approval
  async processAutomaticApprovals(): Promise<{ processed: number; approved: number; errors: string[] }> {
    try {
      console.log('Starting automatic approval process...');
      
      // Get pending submissions with task details
      const { data: submissions, error: submissionError } = await supabase
        .from('task_submissions')
        .select(`
          *,
          tasks!task_id!inner(*)
        `)
        .eq('status', 'pending')
        .order('submitted_at', { ascending: true })
        .limit(50); // Process in batches

      if (submissionError) {
        console.error('Error fetching submissions:', submissionError);
        return { processed: 0, approved: 0, errors: [submissionError.message] };
      }

      if (!submissions || submissions.length === 0) {
        console.log('No pending submissions found');
        return { processed: 0, approved: 0, errors: [] };
      }

      let processed = 0;
      let approved = 0;
      const errors: string[] = [];

      for (const submission of submissions) {
        try {
          processed++;
          const task = submission.tasks;
          
          // Check if can auto-approve
          const approval = this.canAutoApprove(submission, task);
          
          if (approval.canApprove) {
            console.log(`Auto-approving submission ${submission.id} with quality ${approval.qualityScore}`);
            
            // Get user profile for point calculation
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('level, tasks_completed, points')
              .eq('id', submission.user_id)
              .single();

            if (profileError) {
              console.error('Error fetching profile:', profileError);
              errors.push(`Profile error for ${submission.id}: ${profileError.message}`);
              continue;
            }

            // Calculate points with quality score
            const pointFactors = {
              basePoints: task.points,
              difficulty: task.difficulty || 'medium',
              userLevel: profile?.level || 1,
              tasksCompletedToday: 0,
              totalTasksCompleted: profile?.tasks_completed || 0,
              taskCategory: task.category || 'general',
              qualityScore: approval.qualityScore
            };

            const pointResult = await pointCalculationService.calculateEconomicPoints(
              submission.user_id,
              task.id,
              pointFactors
            );

            // Update submission status
            const { error: updateError } = await supabase
              .from('task_submissions')
              .update({
                status: 'approved',
                admin_notes: `Auto-approved: ${approval.reasons.join('; ')}`,
                reviewed_at: new Date().toISOString(),
                calculated_points: pointResult.finalPoints,
                point_breakdown: pointResult.breakdown,
                point_explanation: pointResult.explanation.join('\n')
              })
              .eq('id', submission.id);

            if (updateError) {
              console.error('Error updating submission:', updateError);
              errors.push(`Update error for ${submission.id}: ${updateError.message}`);
              continue;
            }

            // Award points to user
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({
                points: profile.points + pointResult.finalPoints,
                tasks_completed: profile.tasks_completed + 1,
                updated_at: new Date().toISOString()
              })
              .eq('id', submission.user_id);

            if (profileUpdateError) {
              console.error('Error updating profile:', profileUpdateError);
              errors.push(`Profile update error for ${submission.id}: ${profileUpdateError.message}`);
              continue;
            }

            // Record point transaction
            await supabase
              .from('point_transactions')
              .insert({
                user_id: submission.user_id,
                points: pointResult.finalPoints,
                transaction_type: 'task_completion',
                reference_id: task.id,
                description: `Auto-approved: ${task.title} (Quality: ${approval.qualityScore})`
              });

            approved++;
            console.log(`Successfully auto-approved submission ${submission.id}`);
          } else {
            console.log(`Submission ${submission.id} requires manual review: ${approval.reasons.join('; ')}`);
          }
        } catch (error) {
          console.error(`Error processing submission ${submission.id}:`, error);
          errors.push(`Processing error for ${submission.id}: ${error.message}`);
        }
      }

      console.log(`Auto-approval process completed: ${approved}/${processed} approved`);
      return { processed, approved, errors };
    } catch (error) {
      console.error('Error in automatic approval process:', error);
      return { processed: 0, approved: 0, errors: [error.message] };
    }
  },

  // Check for tasks that need admin attention
  getFlagged: async () => {
    const { data, error } = await supabase
      .from('task_submissions')
      .select(`
        *,
        tasks!inner(*),
        profiles!inner(name, email)
      `)
      .eq('status', 'flagged')
      .order('submitted_at', { ascending: true });

    if (error) {
      console.error('Error fetching flagged submissions:', error);
      return [];
    }

    return data || [];
  },

  // Bulk approve multiple submissions
  async bulkApprove(submissionIds: string[], qualityScore: number = 80): Promise<boolean> {
    try {
      for (const submissionId of submissionIds) {
        const { data: submission, error: fetchError } = await supabase
          .from('task_submissions')
          .select(`
            *,
            tasks!task_id!inner(*)
          `)
          .eq('id', submissionId)
          .single();

        if (fetchError || !submission) {
          console.error(`Error fetching submission ${submissionId}:`, fetchError);
          continue;
        }

        // Use the same approval logic as auto-approval
        const approval = { canApprove: true, qualityScore, reasons: ['Bulk approved by admin'] };
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('level, tasks_completed, points')
          .eq('id', submission.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          continue;
        }

        // Calculate points
        const pointFactors = {
          basePoints: submission.tasks.points,
          difficulty: submission.tasks.difficulty || 'medium',
          userLevel: profile?.level || 1,
          tasksCompletedToday: 0,
          totalTasksCompleted: profile?.tasks_completed || 0,
          taskCategory: submission.tasks.category || 'general',
          qualityScore: approval.qualityScore
        };

        const pointResult = await pointCalculationService.calculateEconomicPoints(
          submission.user_id,
          submission.tasks.id,
          pointFactors
        );

        // Update submission
        await supabase
          .from('task_submissions')
          .update({
            status: 'approved',
            admin_notes: approval.reasons.join('; '),
            reviewed_at: new Date().toISOString(),
            calculated_points: pointResult.finalPoints,
            point_breakdown: pointResult.breakdown,
            point_explanation: pointResult.explanation.join('\n')
          })
          .eq('id', submissionId);

        // Award points
        await supabase
          .from('profiles')
          .update({
            points: profile.points + pointResult.finalPoints,
            tasks_completed: profile.tasks_completed + 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', submission.user_id);

        // Record transaction
        await supabase
          .from('point_transactions')
          .insert({
            user_id: submission.user_id,
            points: pointResult.finalPoints,
            transaction_type: 'task_completion',
            reference_id: submission.tasks.id,
            description: `Bulk approved: ${submission.tasks.title} (Quality: ${approval.qualityScore})`
          });
      }

      return true;
    } catch (error) {
      console.error('Error in bulk approval:', error);
      return false;
    }
  }
};
