
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, CheckCircle, TrendingUp } from "lucide-react";

interface TaskOverviewStatsProps {
  activeTasksCount: number;
  pendingSubmissionsCount: number;
  totalSubmissions: number;
  approvalRate: number;
}

export const TaskOverviewStats: React.FC<TaskOverviewStatsProps> = ({
  activeTasksCount,
  pendingSubmissionsCount,
  totalSubmissions,
  approvalRate
}) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-lg">
            <Clock className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Active Tasks</p>
            <p className="text-2xl font-bold">{activeTasksCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-orange-100 rounded-lg">
            <Users className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Pending Reviews</p>
            <p className="text-2xl font-bold">{pendingSubmissionsCount}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <CheckCircle className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total Submissions</p>
            <p className="text-2xl font-bold">{totalSubmissions}</p>
          </div>
        </div>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-lg">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Approval Rate</p>
            <p className="text-2xl font-bold">{approvalRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  </div>
);
