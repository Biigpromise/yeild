
import React from 'react';
import TaskHistory from "@/components/TaskHistory";

interface HistoryTabProps {
  completedTasks: any[];
  totalPointsEarned: number;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ completedTasks, totalPointsEarned }) => {
  return (
    <TaskHistory
      completedTasks={completedTasks}
      totalPointsEarned={totalPointsEarned}
      totalTasksCompleted={completedTasks.length}
    />
  );
};
