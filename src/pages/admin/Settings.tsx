import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { getAllSessions, updateSession } from '@/db/api';
import type { MenuSession } from '@/types';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const [sessions, setSessions] = useState<MenuSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setLoading(true);
    const sessionsData = await getAllSessions();
    setSessions(sessionsData);
    setLoading(false);
  };

  const handleToggleSession = async (sessionId: string, isActive: boolean) => {
    const updated = await updateSession(sessionId, { is_active: isActive });
    if (updated) {
      toast({ title: `Session ${isActive ? 'activated' : 'deactivated'} successfully` });
      loadSessions();
    } else {
      toast({ title: 'Failed to update session', variant: 'destructive' });
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Settings</h1>
          <p className="text-muted-foreground">Configure canteen settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Meal Sessions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {sessions.map(session => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-semibold">{session.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {session.start_time} - {session.end_time}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label htmlFor={`session-${session.id}`}>
                    {session.is_active ? 'Active' : 'Inactive'}
                  </Label>
                  <Switch
                    id={`session-${session.id}`}
                    checked={session.is_active}
                    onCheckedChange={(checked) => handleToggleSession(session.id, checked)}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Application</span>
              <span className="font-medium">SRIT Canteen Pre-order System</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Email Domain</span>
              <span className="font-medium">@srit.ac.in</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
