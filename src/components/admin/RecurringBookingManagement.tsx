import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Plus, 
  Repeat, 
  Calendar, 
  Clock,
  Trash2,
  Pause,
  Play
} from 'lucide-react';
import { toast } from 'sonner';

interface RecurringBooking {
  id: string;
  customerEmail: string;
  frequency: string;
  dayOfWeek?: number;
  timeSlot: string;
  startDate: string;
  endDate?: string;
  active: boolean;
  service: { name: string };
  staff: { name: string };
  bookings: any[];
}

const RecurringBookingManagement = () => {
  const [recurringBookings, setRecurringBookings] = useState<RecurringBooking[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    serviceId: '',
    staffId: '',
    customerEmail: '',
    frequency: 'weekly',
    dayOfWeek: 1,
    timeSlot: '10:00',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchRecurringBookings();
    fetchServices();
    fetchStaff();
  }, []);

  const fetchRecurringBookings = async () => {
    try {
      const response = await fetch('/api/admin/recurring-bookings', {
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setRecurringBookings(data);
      }
    } catch (error) {
      console.error('Error fetching recurring bookings:', error);
    }
  };

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/admin/services', {
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setServices(data);
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/admin/staff', {
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleCreateRecurringBooking = async () => {
    try {
      const response = await fetch('/api/admin/recurring-bookings', {
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
        toast.success('Wiederholungstermin erstellt!');
        setIsCreateDialogOpen(false);
        setFormData({
          serviceId: '',
          staffId: '',
          customerEmail: '',
          frequency: 'weekly',
          dayOfWeek: 1,
          timeSlot: '10:00',
          startDate: '',
          endDate: ''
        });
        fetchRecurringBookings();
      } else {
        toast.error('Fehler beim Erstellen des Wiederholungstermins');
      }
    } catch (error) {
      console.error('Error creating recurring booking:', error);
      toast.error('Fehler beim Erstellen des Wiederholungstermins');
    }
  };

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const response = await fetch(`/api/admin/recurring-bookings/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        },
        body: JSON.stringify({ active })
      });

      if (response.ok) {
        toast.success(active ? 'Wiederholungstermin aktiviert!' : 'Wiederholungstermin pausiert!');
        fetchRecurringBookings();
      } else {
        toast.error('Fehler beim Aktualisieren des Wiederholungstermins');
      }
    } catch (error) {
      console.error('Error updating recurring booking:', error);
      toast.error('Fehler beim Aktualisieren des Wiederholungstermins');
    }
  };

  const handleDeleteRecurringBooking = async (id: string) => {
    if (!confirm('Möchten Sie diesen Wiederholungstermin wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/admin/recurring-bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });

      if (response.ok) {
        toast.success('Wiederholungstermin gelöscht!');
        fetchRecurringBookings();
      } else {
        toast.error('Fehler beim Löschen des Wiederholungstermins');
      }
    } catch (error) {
      console.error('Error deleting recurring booking:', error);
      toast.error('Fehler beim Löschen des Wiederholungstermins');
    }
  };

  const getDayName = (dayOfWeek: number) => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[dayOfWeek];
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wiederholungstermine</h2>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Neuer Wiederholungstermin
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Neuen Wiederholungstermin erstellen</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="customerEmail">Kunden E-Mail</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                  placeholder="kunde@email.com"
                />
              </div>
              <div>
                <Label htmlFor="serviceId">Service</Label>
                <Select value={formData.serviceId} onValueChange={(value) => setFormData({ ...formData, serviceId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service.id} value={service.id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="staffId">Mitarbeiter</Label>
                <Select value={formData.staffId} onValueChange={(value) => setFormData({ ...formData, staffId: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Mitarbeiter auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {staff.map((member) => (
                      <SelectItem key={member.id} value={member.id}>
                        {member.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="frequency">Häufigkeit</Label>
                <Select value={formData.frequency} onValueChange={(value) => setFormData({ ...formData, frequency: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Wöchentlich</SelectItem>
                    <SelectItem value="monthly">Monatlich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="timeSlot">Uhrzeit</Label>
                <Input
                  id="timeSlot"
                  type="time"
                  value={formData.timeSlot}
                  onChange={(e) => setFormData({ ...formData, timeSlot: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="startDate">Startdatum</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Enddatum (optional)</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <Button onClick={handleCreateRecurringBooking} className="w-full">
                Wiederholungstermin erstellen
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {recurringBookings.map((booking) => (
          <Card key={booking.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Repeat className="w-5 h-5" />
                    {booking.customerEmail}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {booking.service.name} - {booking.staff.name}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={booking.active}
                    onCheckedChange={(checked) => handleToggleActive(booking.id, checked)}
                  />
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDeleteRecurringBooking(booking.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Repeat className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.frequency === 'weekly' ? 'Wöchentlich' : 'Monatlich'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span>{booking.timeSlot}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span>{new Date(booking.startDate).toLocaleDateString('de-DE')}</span>
                </div>
                <div>
                  <Badge variant={booking.active ? 'default' : 'secondary'}>
                    {booking.active ? 'Aktiv' : 'Pausiert'}
                  </Badge>
                </div>
              </div>
              
              {booking.bookings.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2">Generierte Termine: {booking.bookings.length}</h4>
                  <div className="text-sm text-muted-foreground">
                    Nächster Termin: {booking.bookings[0] && new Date(booking.bookings[0].startAt).toLocaleDateString('de-DE')}
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

export default RecurringBookingManagement;
