import { useState, useEffect } from 'react';
import AdminLayout from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { getAllPickupSlots, createPickupSlot, updateSlotCapacity, deletePickupSlot } from '@/db/api';
import type { PickupSlot } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/db/supabase';
import { format, addDays } from 'date-fns';

export default function SlotManagement() {
  const [slots, setSlots] = useState<PickupSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<PickupSlot | null>(null);
  const [newSlot, setNewSlot] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time_slot: '09:00',
    max_capacity: 10,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSlots();
    
    // Subscribe to real-time updates
    const channel = supabase
      .channel('slot_management_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pickup_slots',
        },
        () => {
          loadSlots();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const nextWeek = format(addDays(new Date(), 7), 'yyyy-MM-dd');
      const data = await getAllPickupSlots(today, nextWeek);
      setSlots(data);
    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: 'Error',
        description: 'Failed to load pickup slots',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlot = async () => {
    try {
      await createPickupSlot(newSlot.date, newSlot.time_slot, newSlot.max_capacity);
      toast({
        title: 'Success',
        description: 'Pickup slot created successfully',
      });
      setDialogOpen(false);
      setNewSlot({
        date: format(new Date(), 'yyyy-MM-dd'),
        time_slot: '09:00',
        max_capacity: 10,
      });
      loadSlots();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create pickup slot',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateCapacity = async (slotId: string, newCapacity: number) => {
    try {
      await updateSlotCapacity(slotId, newCapacity);
      toast({
        title: 'Success',
        description: 'Slot capacity updated successfully',
      });
      loadSlots();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update slot capacity',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;
    
    try {
      await deletePickupSlot(slotId);
      toast({
        title: 'Success',
        description: 'Pickup slot deleted successfully',
      });
      loadSlots();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete pickup slot',
        variant: 'destructive',
      });
    }
  };

  const getUtilizationColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 100) return 'destructive';
    if (percentage >= 80) return 'secondary';
    return 'default';
  };

  const groupSlotsByDate = () => {
    const grouped: Record<string, PickupSlot[]> = {};
    slots.forEach(slot => {
      if (!grouped[slot.date]) {
        grouped[slot.date] = [];
      }
      grouped[slot.date].push(slot);
    });
    return grouped;
  };

  const groupedSlots = groupSlotsByDate();

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Pickup Slot Management</h1>
            <p className="text-muted-foreground mt-1">
              Manage pickup time slots and capacity
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadSlots}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slot
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Pickup Slot</DialogTitle>
                  <DialogDescription>
                    Add a new time slot for order pickups
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newSlot.date}
                      onChange={(e) => setNewSlot({ ...newSlot, date: e.target.value })}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="time">Time Slot</Label>
                    <Input
                      id="time"
                      type="time"
                      value={newSlot.time_slot}
                      onChange={(e) => setNewSlot({ ...newSlot, time_slot: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Max Capacity</Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={newSlot.max_capacity}
                      onChange={(e) => setNewSlot({ ...newSlot, max_capacity: parseInt(e.target.value) })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSlot}>
                    Create Slot
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Slots</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{slots.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {slots.filter(s => s.is_available).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Fully Booked</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {slots.filter(s => !s.is_available).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {slots.reduce((sum, s) => sum + s.current_bookings, 0)}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Slots by Date */}
        {loading ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">Loading slots...</p>
            </CardContent>
          </Card>
        ) : Object.keys(groupedSlots).length === 0 ? (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-muted-foreground">No pickup slots found</p>
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedSlots).map(([date, dateSlots]) => (
            <Card key={date}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                </CardTitle>
                <CardDescription>
                  {dateSlots.length} time slots available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Bookings</TableHead>
                      <TableHead>Capacity</TableHead>
                      <TableHead>Utilization</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dateSlots.map((slot) => (
                      <TableRow key={slot.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            {slot.time_slot}
                          </div>
                        </TableCell>
                        <TableCell>{slot.current_bookings}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min="1"
                            value={slot.max_capacity}
                            onChange={(e) => handleUpdateCapacity(slot.id, parseInt(e.target.value))}
                            className="w-20"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-full bg-secondary rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  slot.current_bookings >= slot.max_capacity
                                    ? 'bg-destructive'
                                    : slot.current_bookings >= slot.max_capacity * 0.8
                                    ? 'bg-yellow-500'
                                    : 'bg-primary'
                                }`}
                                style={{
                                  width: `${Math.min((slot.current_bookings / slot.max_capacity) * 100, 100)}%`,
                                }}
                              />
                            </div>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {Math.round((slot.current_bookings / slot.max_capacity) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getUtilizationColor(slot.current_bookings, slot.max_capacity)}>
                            {slot.is_available ? 'Available' : 'Fully Booked'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteSlot(slot.id)}
                            disabled={slot.current_bookings > 0}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </AdminLayout>
  );
}
