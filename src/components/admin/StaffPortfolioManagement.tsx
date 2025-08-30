import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  Upload, 
  Image as ImageIcon, 
  Trash2,
  Edit,
  Star
} from 'lucide-react';
import { toast } from 'sonner';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  category?: string;
  featured: boolean;
  staffId: string;
}

interface Staff {
  id: string;
  name: string;
  imageUrl?: string;
}

const StaffPortfolioManagement = () => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<string>('');
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    featured: false
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    fetchStaff();
  }, []);

  useEffect(() => {
    if (selectedStaff) {
      fetchPortfolioItems(selectedStaff);
    }
  }, [selectedStaff]);

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
        if (data.length > 0 && !selectedStaff) {
          setSelectedStaff(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const fetchPortfolioItems = async (staffId: string) => {
    try {
      const response = await fetch(`/api/admin/staff/${staffId}/portfolio`, {
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setPortfolioItems(data);
      }
    } catch (error) {
      console.error('Error fetching portfolio items:', error);
    }
  };

  const handleCreatePortfolioItem = async () => {
    if (!selectedFile || !selectedStaff) {
      toast.error('Bitte wählen Sie ein Bild und einen Mitarbeiter aus');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedFile);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('featured', formData.featured.toString());

      const response = await fetch(`/api/admin/staff/${selectedStaff}/portfolio`, {
        method: 'POST',
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success('Portfolio-Element erstellt!');
        setIsCreateDialogOpen(false);
        setFormData({ title: '', description: '', category: '', featured: false });
        setSelectedFile(null);
        fetchPortfolioItems(selectedStaff);
      } else {
        toast.error('Fehler beim Erstellen des Portfolio-Elements');
      }
    } catch (error) {
      console.error('Error creating portfolio item:', error);
      toast.error('Fehler beim Erstellen des Portfolio-Elements');
    }
  };

  const handleUploadStaffImage = async () => {
    if (!selectedFile || !selectedStaff) {
      toast.error('Bitte wählen Sie ein Bild und einen Mitarbeiter aus');
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('image', selectedFile);

      const response = await fetch(`/api/admin/staff/${selectedStaff}/upload`, {
        method: 'POST',
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        },
        body: formDataToSend
      });

      if (response.ok) {
        toast.success('Mitarbeiterbild hochgeladen!');
        setIsUploadDialogOpen(false);
        setSelectedFile(null);
        fetchStaff();
      } else {
        toast.error('Fehler beim Hochladen des Bildes');
      }
    } catch (error) {
      console.error('Error uploading staff image:', error);
      toast.error('Fehler beim Hochladen des Bildes');
    }
  };

  const handleDeletePortfolioItem = async (itemId: string) => {
    if (!confirm('Möchten Sie dieses Portfolio-Element wirklich löschen?')) return;

    try {
      const response = await fetch(`/api/admin/staff/${selectedStaff}/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: {
          'x-user-role': 'admin',
          'x-user-email': 'admin@dev.local',
          'x-tenant-id': 't_dev'
        }
      });

      if (response.ok) {
        toast.success('Portfolio-Element gelöscht!');
        fetchPortfolioItems(selectedStaff);
      } else {
        toast.error('Fehler beim Löschen des Portfolio-Elements');
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
      toast.error('Fehler beim Löschen des Portfolio-Elements');
    }
  };

  const selectedStaffMember = staff.find(s => s.id === selectedStaff);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Staff Portfolio Management</h2>
        <div className="flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Upload className="w-4 h-4 mr-2" />
                Mitarbeiterbild
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Mitarbeiterbild hochladen</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="staff-select">Mitarbeiter</Label>
                  <Select value={selectedStaff} onValueChange={setSelectedStaff}>
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
                  <Label htmlFor="staff-image">Bild</Label>
                  <Input
                    id="staff-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button onClick={handleUploadStaffImage} className="w-full">
                  Bild hochladen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Portfolio-Element
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Neues Portfolio-Element</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="z.B. Balayage Transformation"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Beschreibung</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Beschreibung der Arbeit..."
                  />
                </div>
                <div>
                  <Label htmlFor="category">Kategorie</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="z.B. Haarschnitt, Coloration"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={formData.featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                  />
                  <Label htmlFor="featured">Als Featured markieren</Label>
                </div>
                <div>
                  <Label htmlFor="portfolio-image">Bild</Label>
                  <Input
                    id="portfolio-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </div>
                <Button onClick={handleCreatePortfolioItem} className="w-full">
                  Portfolio-Element erstellen
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="w-1/4">
          <Card>
            <CardHeader>
              <CardTitle>Mitarbeiter</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {staff.map((member) => (
                  <Button
                    key={member.id}
                    variant={selectedStaff === member.id ? "default" : "outline"}
                    className="w-full justify-start"
                    onClick={() => setSelectedStaff(member.id)}
                  >
                    {member.imageUrl && (
                      <img 
                        src={member.imageUrl} 
                        alt={member.name}
                        className="w-6 h-6 rounded-full mr-2 object-cover"
                      />
                    )}
                    {member.name}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex-1">
          {selectedStaffMember && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5" />
                  Portfolio - {selectedStaffMember.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {portfolioItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Noch keine Portfolio-Elemente vorhanden
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {portfolioItems.map((item) => (
                      <Card key={item.id} className="overflow-hidden">
                        <div className="relative">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title}
                            className="w-full h-48 object-cover"
                          />
                          {item.featured && (
                            <div className="absolute top-2 right-2">
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            </div>
                          )}
                          <div className="absolute top-2 left-2 flex gap-1">
                            <Button variant="secondary" size="sm">
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => handleDeletePortfolioItem(item.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                        <CardContent className="p-3">
                          <h4 className="font-medium">{item.title}</h4>
                          {item.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </p>
                          )}
                          {item.category && (
                            <div className="mt-2">
                              <span className="text-xs bg-muted px-2 py-1 rounded">
                                {item.category}
                              </span>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffPortfolioManagement;
