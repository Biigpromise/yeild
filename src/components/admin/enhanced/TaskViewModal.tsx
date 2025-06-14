
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const TaskViewModal = ({ task, open, onClose }: {
  task: any,
  open: boolean,
  onClose: () => void
}) => {
  if (!task) return null;
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{task.title}</DialogTitle>
          <DialogDescription className="mb-2">{task.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm">
          <div>
            <span className="font-medium">Category:</span> {task.category || "N/A"}
          </div>
          <div>
            <span className="font-medium">Points:</span> {task.points}
          </div>
          <div>
            <span className="font-medium">Difficulty:</span>
            <Badge className="ml-2">{task.difficulty}</Badge>
          </div>
          <div>
            <span className="font-medium">Status:</span>
            <Badge className="ml-2">{task.status}</Badge>
          </div>
          <div>
            <span className="font-medium">Created:</span> {task.created_at ? new Date(task.created_at).toLocaleString() : "N/A"}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
