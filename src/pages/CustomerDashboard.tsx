import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  User, 
  Settings, 
  ShoppingBag, 
  Star,
  Phone,
  Mail,
  Camera,
  Eye,
  Edit,
  X
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EnhancedCalendar from '@/components/customer/EnhancedCalendar';
import CustomerStatus from '@/components/customer/CustomerStatus';
// Try both import methods to ensure compatibility
import AppointmentDetailsDialog from '@/components/customer/AppointmentDetailsDialog';
import PurchaseHistory from '@/components/customer/PurchaseHistory';
import AppointmentRescheduleDialog from '@/components/customer/AppointmentRescheduleDialog';
import ProfileEditDialog from '@/components/customer/ProfileEditDialog';
import ShopDialog from '@/components/booking/shop-dialog';
import CustomerCalendarView from '@/components/customer/CustomerCalendarView';
import { AppointmentBookingDialog } from '@/components/booking/appointment-booking-dialog';

// Mock data
const mockAppointments = [
  {
    id: 1,
    date: '2024-01-16',
    time: '14:30',
    service: 'Damenschnitt + Coloring',
    stylist: 'Vanessa',
    duration: '120 min',
    price: 180,
    status: 'confirmed'
  },
  {
    id: 2,
    date: '2024-02-05',
    time: '10:00',
    service: 'Herrenschnitt',
    stylist: 'Marco',
    duration: '45 min',
    price: 45,
    status: 'pending'
  }
];

const CustomerDashboard = () => {
  const navigate = useNavigate();
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showAppointmentDetails, setShowAppointmentDetails] = useState(false);
  const [showRescheduleDialog, setShowRescheduleDialog] = useState(false);
  const [showRescheduleConfirm, setShowRescheduleConfirm] = useState(false);
  const [showPurchaseHistory, setShowPurchaseHistory] = useState(false);
  const [showProfileEditDialog, setShowProfileEditDialog] = useState(false);
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const handleAppointmentDetails = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowAppointmentDetails(true);
  };

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment);
    setShowRescheduleConfirm(true);
  };

  const handleConfirmReschedule = () => {
    setShowRescheduleConfirm(false);
    setShowBookingDialog(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Schnittwerk</h1>
          </div>
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
          >
            Zur Hauptseite
          </Button>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Übersicht</TabsTrigger>
            <TabsTrigger value="appointments">Termine</TabsTrigger>
            <TabsTrigger value="purchases">Käufe</TabsTrigger>
            <TabsTrigger value="shop">Shop</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="calendar">Kalender</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Customer Status - moved to top */}
            <CustomerStatus />

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="border-l-4 border-l-primary">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Nächster Termin</p>
                      <p className="text-sm font-bold">16.01.2024 14:30</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Clock className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Termine gesamt</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-green-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Star className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Treuepunkte</p>
                      <p className="text-2xl font-bold">1,420 Punkte</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-l-4 border-l-yellow-500">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <User className="w-5 h-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Letzter Besuch</p>
                      <p className="text-sm font-bold">18.12.2023</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Next Appointment */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Nächster Termin
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-semibold text-lg">Damenschnitt + Coloring</h3>
                      <p className="text-muted-foreground">Mit Vanessa</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Bestätigt</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <p className="text-muted-foreground">Datum</p>
                      <p className="font-medium">16.01.2024</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Zeit</p>
                      <p className="font-medium">14:30</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Dauer</p>
                      <p className="font-medium">120 min</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Preis</p>
                      <p className="font-medium">ca CHF 180</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleAppointmentDetails(mockAppointments[0])}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Details
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleReschedule(mockAppointments[0])}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Verschieben
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Calendar className="h-8 w-8 mx-auto mb-3 text-blue-600" />
                  <h3 className="font-semibold mb-2 text-blue-800">Neuer Termin</h3>
                  <p className="text-sm text-blue-600 mb-4">Buchen Sie Ihren nächsten Besuch</p>
                  <AppointmentBookingDialog>
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Termin buchen
                    </Button>
                  </AppointmentBookingDialog>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <ShoppingBag className="h-8 w-8 mx-auto mb-3 text-green-600" />
                  <h3 className="font-semibold mb-2 text-green-800">Produkte kaufen</h3>
                  <p className="text-sm text-green-600 mb-4">Entdecken Sie unsere Produktpalette</p>
                  <ShopDialog>
                    <Button className="bg-green-600 hover:bg-green-700">
                      Zum Shop
                    </Button>
                  </ShopDialog>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  Meine Termine
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockAppointments.map((appointment) => (
                    <div key={appointment.id} className="border border-border p-4 rounded-lg">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{appointment.service}</h4>
                          <p className="text-muted-foreground">Mit {appointment.stylist}</p>
                        </div>
                        <Badge variant={appointment.status === 'confirmed' ? 'default' : 'secondary'}>
                          {appointment.status === 'confirmed' ? 'Bestätigt' : 'Ausstehend'}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <p className="text-muted-foreground">Datum</p>
                          <p className="font-medium">{appointment.date}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Zeit</p>
                          <p className="font-medium">{appointment.time}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Dauer</p>
                          <p className="font-medium">{appointment.duration}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Preis</p>
                          <p className="font-medium">ca CHF {appointment.price}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleAppointmentDetails(appointment)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleReschedule(appointment)}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Verschieben
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="purchases">
            <PurchaseHistory />
          </TabsContent>

          <TabsContent value="shop">
            <ShopDialog>
              <div />
            </ShopDialog>
            <div className="mt-4">
              <ShopDialog>
                <Button className="w-full">
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Zum Shop
                </Button>
              </ShopDialog>
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            {/* Customer Status in Profile */}
            <CustomerStatus showInProfile />

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Persönliche Informationen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="text-base">Sarah Müller</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">E-Mail</label>
                    <p className="text-base">sarah.mueller@email.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Telefon</label>
                    <p className="text-base">+41 79 123 45 67</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Mitglied seit</label>
                    <p className="text-base">Januar 2023</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowProfileEditDialog(true)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Profil bearbeiten
                </Button>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Einstellungen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bevorzugter Stylist</label>
                  <p className="text-base">Vanessa (Inhaberin)</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Bevorzugte Termine</label>
                  <p className="text-base">Nachmittags (14:00 - 17:00)</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">E-Mail Benachrichtigungen</label>
                  <p className="text-base">Aktiviert</p>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setShowProfileEditDialog(true)}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Einstellungen ändern
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <CustomerCalendarView 
              onAppointmentDetails={handleAppointmentDetails}
              onReschedule={handleReschedule}
            />
          </TabsContent>
        </Tabs>

        {showAppointmentDetails && selectedAppointment && (
          <AppointmentDetailsDialog
            isOpen={showAppointmentDetails}
            onClose={() => setShowAppointmentDetails(false)}
            appointment={selectedAppointment}
            onReschedule={() => {
              setShowAppointmentDetails(false);
              setShowBookingDialog(true);
            }}
          />
        )}

      <AppointmentRescheduleDialog
        isOpen={showRescheduleDialog}
        onClose={() => setShowRescheduleDialog(false)}
        appointment={selectedAppointment}
      />

      <ProfileEditDialog
        isOpen={showProfileEditDialog}
        onClose={() => setShowProfileEditDialog(false)}
      />

      {showBookingDialog && (
        <AppointmentBookingDialog>
          <div />
        </AppointmentBookingDialog>
      )}

      <AlertDialog open={showRescheduleConfirm} onOpenChange={setShowRescheduleConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Termin verschieben</AlertDialogTitle>
            <AlertDialogDescription>
              Möchten Sie diesen Termin wirklich verschieben? Sie können anschließend einen neuen Termin auswählen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmReschedule}>
              Ja, verschieben
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
};

export default CustomerDashboard;