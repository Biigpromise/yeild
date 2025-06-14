
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { adminSecurityService, AuditLog, SecurityAlert, BackupStatus } from "@/services/admin/adminSecurityService";
import { Shield, AlertTriangle, Database, Download, Play } from "lucide-react";

export const AdminSecurity = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [backupStatus, setBackupStatus] = useState<BackupStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [logs, alerts, backups] = await Promise.all([
        adminSecurityService.getAuditLogs(),
        adminSecurityService.getSecurityAlerts(),
        adminSecurityService.getBackupStatus()
      ]);
      
      setAuditLogs(logs);
      setSecurityAlerts(alerts);
      setBackupStatus(backups);
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAlertStatusUpdate = async (alertId: string, status: string) => {
    const success = await adminSecurityService.updateAlertStatus(alertId, status);
    if (success) {
      loadSecurityData();
    }
  };

  const handleInitiateBackup = async (type: 'database' | 'files' | 'configuration') => {
    const success = await adminSecurityService.initiateBackup(type);
    if (success) {
      loadSecurityData();
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading security data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityAlerts.filter(a => a.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Security incidents</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditLogs.length}</div>
            <p className="text-xs text-muted-foreground">Last 24 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Backup</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backupStatus.length > 0 ? '✓' : '✗'}
            </div>
            <p className="text-xs text-muted-foreground">
              {backupStatus.length > 0 ? 'Completed' : 'No backups'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="backups">Backup Management</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle>Security Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Severity</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.type}</TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(alert.severity)}>
                          {alert.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>{alert.description}</TableCell>
                      <TableCell>{new Date(alert.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Badge variant={alert.status === 'active' ? 'destructive' : 'default'}>
                          {alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {alert.status === 'active' && (
                          <Button
                            size="sm"
                            onClick={() => handleAlertStatusUpdate(alert.id, 'investigating')}
                          >
                            Investigate
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit">
          <Card>
            <CardHeader>
              <CardTitle>Audit Logs</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Resource</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>IP Address</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {auditLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                      <TableCell>{log.ipAddress || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups">
          <Card>
            <CardHeader>
              <CardTitle>Backup Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Button onClick={() => handleInitiateBackup('database')} className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Backup Database
                </Button>
                <Button onClick={() => handleInitiateBackup('files')} className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Backup Files
                </Button>
                <Button onClick={() => handleInitiateBackup('configuration')} className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Backup Config
                </Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Size</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {backupStatus.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell className="font-medium">{backup.type}</TableCell>
                      <TableCell>
                        <Badge variant={backup.status === 'completed' ? 'default' : 'secondary'}>
                          {backup.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(backup.startedAt).toLocaleString()}</TableCell>
                      <TableCell>
                        {backup.completedAt ? new Date(backup.completedAt).toLocaleString() : 'In progress'}
                      </TableCell>
                      <TableCell>{backup.size || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
