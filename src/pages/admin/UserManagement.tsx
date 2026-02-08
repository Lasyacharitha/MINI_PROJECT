import { useEffect, useState } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { getAllProfiles, updateProfile, getWhitelist, addEmailToWhitelist, removeEmailFromWhitelist } from '@/db/api';
import type { Profile, UserRole, EmailWhitelist } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export default function UserManagement() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [whitelist, setWhitelist] = useState<EmailWhitelist[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [usersData, whitelistData] = await Promise.all([
      getAllProfiles(),
      getWhitelist(),
    ]);
    setUsers(usersData);
    setWhitelist(whitelistData);
    setLoading(false);
  };

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const updated = await updateProfile(userId, { role: newRole });
    if (updated) {
      toast({ title: 'User role updated successfully' });
      loadData();
    } else {
      toast({ title: 'Failed to update user role', variant: 'destructive' });
    }
  };

  const handleAddToWhitelist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newEmail.endsWith('@srit.ac.in')) {
      toast({ title: 'Invalid email. Must end with @srit.ac.in', variant: 'destructive' });
      return;
    }

    const added = await addEmailToWhitelist(newEmail, user.id);
    if (added) {
      toast({ title: 'Email added to whitelist successfully' });
      setNewEmail('');
      setDialogOpen(false);
      loadData();
    } else {
      toast({ title: 'Failed to add email to whitelist', variant: 'destructive' });
    }
  };

  const handleRemoveFromWhitelist = async (id: string) => {
    if (confirm('Are you sure you want to remove this email from whitelist?')) {
      const removed = await removeEmailFromWhitelist(id);
      if (removed) {
        toast({ title: 'Email removed from whitelist' });
        loadData();
      }
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-muted-foreground">Manage users and email whitelist</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Registered Users</h2>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map(profile => (
                    <TableRow key={profile.id}>
                      <TableCell className="font-medium">{profile.full_name || 'N/A'}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>{profile.phone || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {profile.role.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.is_verified ? 'default' : 'secondary'}>
                          {profile.is_verified ? 'Verified' : 'Unverified'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={profile.role}
                          onValueChange={(value) => handleRoleChange(profile.id, value as UserRole)}
                          disabled={profile.id === user?.id}
                        >
                          <SelectTrigger className="w-36">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="kitchen_staff">Kitchen Staff</SelectItem>
                            <SelectItem value="cashier">Cashier</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Email Whitelist</h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Email
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add Email to Whitelist</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddToWhitelist} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">SRIT Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="student@srit.ac.in"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit">Add</Button>
                      <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
            <div className="space-y-2">
              {whitelist.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <span>{item.email}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFromWhitelist(item.id)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              {whitelist.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No emails in whitelist</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
