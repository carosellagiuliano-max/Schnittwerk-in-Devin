import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Users, 
  Calendar, 
  Trash2,
  Edit
} from 'lucide-react';
import { toast } from 'sonner';

interface GroupBooking {
  id: string;
  name: string;
  description?: string;
  maxSize: number;
  createdAt: string;
  bookings: any[];
}

const GroupBookingManagement = () => {
  const [groupBookings, setGroupBookings] = useState<GroupBooking[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    maxSize: 4
  });

  useEffect(() => {
    fetchGroupBookings();
  }, []);

  const fetchGroupBookings = async () => {
    try {
      const response = await fetch('/api/admin/group-bookings', {
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setGroupBookings(data);
      }
    } catch (error) {
      console.error('Error fetching group bookings:', error);
    }
  };

  const handleCreateGroupBooking = async () => {
    try {
      const response = await fetch('/api/admin/group-bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Gruppenbuchung erstellt!');
        setIsCreateDialogOpen(false);
        setFormData({ name: '', description: '', maxSize: 4 });
        fetchGroupBookings();
      } else {
        toast.error('Fehler beim Erstellen der Gruppenbuchung');
      }
    } catch (error) {
      console.error('Error creating group booking:', error);
      toast.error('Fehler beim Erstellen der Gruppenbuchung');
    }
  };

  const handleDeleteGroupBooking = async (id: string) => {
    if (!confirm('Möchten Sie diese Gruppenbuchung wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/admin/group-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });

      if (response.ok) {
        toast.success('Gruppenbuchung gelöscht!');
        fetchGroupBookings();
      } else {
        toast.error('Fehler beim Löschen der Gruppenbuchung');
      }
    } catch (error) {
      console.error('Error deleting group booking:', error);
      toast.error('Fehler beim Löschen der Gruppenbuchung');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gruppenbuchungen</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neue Gruppenbuchung
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Neue Gruppenbuchung erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="z.B. Junggesellinnenabschied"
                />
              </div>
              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optionale Beschreibung..."
                />
              </div>
              <div>
                <Label htmlFor="maxSize">Maximale Teilnehmerzahl</Label>
                <Input
                  id="maxSize"
                  type="number"
                  min="2"
                  max="20"
                  value={formData.maxSize}
                  onChange={(e) => setFormData({ ...formData, maxSize: parseInt(e.target.value) })}
                />
              </div>
              <Button onClick={handleCreateGroupBooking} className="w-full">
                Gruppenbuchung erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {groupBookings.map((groupBooking) => (
          <Card key={groupBooking.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {groupBooking.name}
                  </CardTitle>
                  {groupBooking.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {groupBooking.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteGroupBooking(groupBooking.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {groupBooking.bookings.length} / {groupBooking.maxSize} Teilnehmer
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(groupBooking.createdAt).toLocaleDateString('de-DE')}
                </div>
              </div>
              
              {groupBooking.bookings.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Buchungen:</h4>
                  <div className="space-y-2">
                    {groupBooking.bookings.map((booking, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <div>
                          <span className="font-medium">{booking.customerEmail}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            {booking.service?.name} - {booking.staff?.name}
                          </span>
                        </div>
                        <Badge variant={booking.status === 'CONFIRMED' ? 'default' : 'secondary'}>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GroupBookingManagement;
