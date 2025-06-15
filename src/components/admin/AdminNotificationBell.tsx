
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Flag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

type AdminNotification = {
    id: string;
    message: string;
    link_to: string | null;
    is_read: boolean;
    created_at: string;
};

export const AdminNotificationBell = () => {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchNotifications();

        const channel = supabase
            .channel('admin-notifications-realtime')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'admin_notifications' },
                (payload) => {
                    const newNotification = payload.new as AdminNotification;
                    setNotifications(prev => [newNotification, ...prev]);
                    if (!newNotification.is_read) {
                        setUnreadCount(prev => prev + 1);
                    }
                    toast.info(newNotification.message, {
                        action: {
                            label: "View",
                            onClick: () => handleNotificationClick(newNotification, true)
                        }
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchNotifications = async () => {
        const { data, error } = await supabase
            .from('admin_notifications')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(20);

        if (error) {
            console.error("Error fetching admin notifications:", error);
            toast.error("Failed to load notifications.");
        } else if (data) {
            setNotifications(data);
            setUnreadCount(data.filter(n => !n.is_read).length);
        }
    };

    const handleNotificationClick = async (notification: AdminNotification, fromToast = false) => {
        if (!notification.is_read) {
            const { error } = await supabase
                .from('admin_notifications')
                .update({ is_read: true })
                .eq('id', notification.id);

            if (error) {
                console.error("Error marking notification as read:", error);
            } else {
                setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, is_read: true } : n));
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        }
        if (notification.link_to) {
            navigate(notification.link_to);
        }
        setIsOpen(false);
    };

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="outline" size="icon" className="relative h-9 w-9">
                    <Bell className="h-4 w-4" />
                    {unreadCount > 0 && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-xs">
                            {unreadCount}
                        </Badge>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 font-medium border-b">Notifications</div>
                <div className="max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">No new notifications.</p>
                    ) : (
                        notifications.map(n => (
                            <div
                                key={n.id}
                                className={`flex items-start gap-3 p-3 border-b border-border/50 cursor-pointer hover:bg-muted ${!n.is_read ? 'bg-primary/10' : ''}`}
                                onClick={() => handleNotificationClick(n)}
                            >
                                <div className="mt-1 flex-shrink-0">
                                    <Flag className="h-5 w-5 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className={`text-sm ${!n.is_read ? 'font-semibold' : ''}`}>{n.message}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
};
