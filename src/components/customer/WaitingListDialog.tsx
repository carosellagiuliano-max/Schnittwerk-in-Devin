import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface WaitingListDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const WaitingListDialog = ({ isOpen, onClose }: WaitingListDialogProps) => {
  const [services, setServices] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    serviceId: '',
    staffId: '',
    customerEmail: '',
    preferredDate: ''
  });

  useEffect(() => {
    if (isOpen) {
      fetchServices();
      fetchStaff();
    }
  }, [isOpen]);

  const fetchServices = async () => {
    try {
      const response = await fetch('/api/services', {
        headers: {
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
      const response = await fetch('/api/staff', {
        headers: {
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

  const handleJoinWaitingList = async () => {
    if (!formData.serviceId || !formData.customerEmail) {
      toast.error('Bitte füllen Sie alle Pflichtfelder aus');
      return;
    }

    try {
      const response = await fetch('/api/waiting-list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 't_dev'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        toast.success('Sie wurden zur Warteliste hinzugefügt!');
        onClose();
        setFormData({
          serviceId: '',
          staffId: '',
          customerEmail: '',
          preferredDate: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.error || 'Fehler beim Hinzufügen zur Warteliste');
      }
    } catch (error) {
      console.error('Error joining waiting list:', error);
      toast.error('Fehler beim Hinzufügen zur Warteliste');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Zur Warteliste hinzufügen
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="customerEmail">E-Mail Adresse *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              placeholder="ihre@email.com"
            />
          </div>

          <div>
            <Label htmlFor="serviceId">Service *</Label>
            <Select value={formData.serviceId} onValueChange={(value) => setFormData({ ...formData, serviceId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Service auswählen" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service) => (
                  <SelectItem key={service.id} value={service.id}>
                    {service.name} - {service.price}€
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="staffId">Bevorzugter Mitarbeiter (optional)</Label>
            <Select value={formData.staffId} onValueChange={(value) => setFormData({ ...formData, staffId: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Kein Mitarbeiter bevorzugt</SelectItem>
                {staff.map((member) => (
                  <SelectItem key={member.id} value={member.id}>
                    {member.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="preferredDate">Bevorzugtes Datum (optional)</Label>
            <Input
              id="preferredDate"
              type="date"
              value={formData.preferredDate}
              onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              <Calendar className="w-4 h-4 inline mr-2" />
              Sie werden benachrichtigt, sobald ein früherer Termin verfügbar wird.
            </p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Abbrechen
            </Button>
            <Button onClick={handleJoinWaitingList} className="flex-1">
              Zur Warteliste hinzufügen
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WaitingListDialog;
