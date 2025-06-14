
import React from "react";
import { Input } from "@/components/ui/input";

interface TaskFilterBarProps {
  searchTerm: string;
  statusFilter: string;
  onSearchChange: (val: string) => void;
  onStatusFilterChange: (val: string) => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({
  searchTerm,
  statusFilter,
  onSearchChange,
  onStatusFilterChange
}) => (
  <div className="flex gap-4">
    <Input
      placeholder="Search tasks..."
      value={searchTerm}
      onChange={(e) => onSearchChange(e.target.value)}
      className="max-w-sm"
    />
    <select
      value={statusFilter}
      onChange={(e) => onStatusFilterChange(e.target.value)}
      className="px-3 py-2 border rounded-md"
    >
      <option value="all">All Status</option>
      <option value="active">Active</option>
      <option value="draft">Draft</option>
      <option value="paused">Paused</option>
      <option value="completed">Completed</option>
    </select>
  </div>
);
