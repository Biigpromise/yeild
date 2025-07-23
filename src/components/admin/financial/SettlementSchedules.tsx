import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Plus, 
  Play, 
  Pause, 
  Edit, 
  Clock,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

interface SettlementSchedule {
  id: string;
  schedule_name: string;
  frequency: string;
  day_of_week: number;
  day_of_month: number;
  time_of_day: string;
  minimum_amount: number;
  is_active: boolean;
  last_run: string;
  next_run: string;
}

export const SettlementSchedules: React.FC = () => {
  const [schedules, setSchedules] = useState<SettlementSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<SettlementSchedule | null>(null);

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('settlement_schedules')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSchedules(data || []);
    } catch (error) {
      console.error('Error loading schedules:', error);
      toast.error('Failed to load settlement schedules');
    } finally {
      setLoading(false);
    }
  };

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    try {
      const { error } = await supabase
        .from('settlement_schedules')
        .update({ is_active: !isActive })
        .eq('id', scheduleId);

      if (error) throw error;

      setSchedules(schedules.map(schedule =>
        schedule.id === scheduleId 
          ? { ...schedule, is_active: !isActive }
          : schedule
      ));

      toast.success(`Schedule ${!isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      console.error('Error toggling schedule:', error);
      toast.error('Failed to update schedule');
    }
  };

  const runScheduleNow = async (scheduleId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('process-settlements', {
        body: { scheduleId, manualTrigger: true }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(data.message);
        loadSchedules();
      } else {
        toast.error(data.error || 'Settlement failed');
      }
    } catch (error) {
      console.error('Error running schedule:', error);
      toast.error('Failed to run settlement');
    }
  };

  const getFrequencyBadge = (frequency: string) => {
    const colors = {
      daily: 'bg-green-100 text-green-800',
      weekly: 'bg-blue-100 text-blue-800',
      monthly: 'bg-purple-100 text-purple-800'
    };
    
    return (
      <Badge className={colors[frequency as keyof typeof colors] || 'bg-gray-100 text-gray-800'}>
        {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
      </Badge>
    );
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Settlement Schedules
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Schedule
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingSchedule ? 'Edit Schedule' : 'Create New Schedule'}
                  </DialogTitle>
                </DialogHeader>
                <ScheduleForm 
                  schedule={editingSchedule}
                  onSave={() => {
                    setDialogOpen(false);
                    setEditingSchedule(null);
                    loadSchedules();
                  }}
                  onCancel={() => {
                    setDialogOpen(false);
                    setEditingSchedule(null);
                  }}
                />
              </DialogContent>
            </Dialog>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Schedule Name</TableHead>
                  <TableHead>Frequency</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Min Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last/Next Run</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.id}>
                    <TableCell className="font-medium">
                      {schedule.schedule_name}
                    </TableCell>
                    <TableCell>
                      {getFrequencyBadge(schedule.frequency)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {schedule.time_of_day}
                      </div>
                    </TableCell>
                    <TableCell>
                      {formatCurrency(schedule.minimum_amount)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={schedule.is_active}
                          onCheckedChange={() => toggleSchedule(schedule.id, schedule.is_active)}
                        />
                        <span className="text-sm">
                          {schedule.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {schedule.last_run && (
                          <div className="text-muted-foreground">
                            Last: {formatDistanceToNow(new Date(schedule.last_run), { addSuffix: true })}
                          </div>
                        )}
                        {schedule.next_run && (
                          <div>
                            Next: {formatDistanceToNow(new Date(schedule.next_run), { addSuffix: true })}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => runScheduleNow(schedule.id)}
                          disabled={!schedule.is_active}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingSchedule(schedule);
                            setDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {schedules.length === 0 && !loading && (
            <div className="text-center py-8 text-muted-foreground">
              No settlement schedules configured
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ScheduleForm: React.FC<{
  schedule: SettlementSchedule | null;
  onSave: () => void;
  onCancel: () => void;
}> = ({ schedule, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    schedule_name: schedule?.schedule_name || '',
    frequency: schedule?.frequency || 'daily',
    time_of_day: schedule?.time_of_day || '09:00',
    minimum_amount: schedule?.minimum_amount || 5000,
    day_of_week: schedule?.day_of_week || 1,
    day_of_month: schedule?.day_of_month || 1
  });

  const handleSave = async () => {
    try {
      const scheduleData = {
        ...formData,
        is_active: true
      };

      const { error } = schedule 
        ? await supabase
            .from('settlement_schedules')
            .update(scheduleData)
            .eq('id', schedule.id)
        : await supabase
            .from('settlement_schedules')
            .insert([scheduleData]);

      if (error) throw error;

      toast.success(`Schedule ${schedule ? 'updated' : 'created'} successfully`);
      onSave();
    } catch (error) {
      console.error('Error saving schedule:', error);
      toast.error('Failed to save schedule');
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="schedule_name">Schedule Name</Label>
        <Input
          id="schedule_name"
          value={formData.schedule_name}
          onChange={(e) => setFormData({ ...formData, schedule_name: e.target.value })}
          placeholder="e.g., Daily Settlement"
        />
      </div>

      <div>
        <Label htmlFor="frequency">Frequency</Label>
        <select
          id="frequency"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          className="w-full px-3 py-2 border rounded-md"
        >
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div>
        <Label htmlFor="time_of_day">Time</Label>
        <Input
          id="time_of_day"
          type="time"
          value={formData.time_of_day}
          onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="minimum_amount">Minimum Amount (₦)</Label>
        <Input
          id="minimum_amount"
          type="number"
          value={formData.minimum_amount}
          onChange={(e) => setFormData({ ...formData, minimum_amount: Number(e.target.value) })}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          {schedule ? 'Update' : 'Create'} Schedule
        </Button>
      </div>
    </div>
  );
};