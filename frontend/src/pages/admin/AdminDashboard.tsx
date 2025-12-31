import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from "@/hooks/use-toast";
import { Calendar, Users, Clock, Plus, HandHeart, LogOut } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { auth } from "@/lib/api";

// Mock data for dashboard
const mockStats = {
  todayBookings: 12,
  pendingBookings: 5,
  revenue: 1250,
  completedServices: 28,
};

const mockTodayAppointments = [
  {
    id: '1',
    time: '9:00 AM',
    customer: 'Sarah Johnson',
    service: 'Gel Manicure',
    status: 'confirmed',
    technician: 'Maria',
  },
  {
    id: '2',
    time: '10:30 AM',
    customer: 'Emily Davis',
    service: 'Spa Pedicure',
    status: 'in-progress',
    technician: 'Sofia',
  },
  {
    id: '3',
    time: '12:00 PM',
    customer: 'Jessica Chen',
    service: 'Nail Art',
    status: 'pending',
    technician: 'Ana',
  },
  {
    id: '4',
    time: '2:00 PM',
    customer: 'Amanda Wilson',
    service: 'Classic Manicure',
    status: 'confirmed',
    technician: 'Maria',
  },
];



export default function AdminDashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    auth.logout();

    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
      duration: 3000,
    });

    navigate("/login", { replace: true });
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-success text-success-foreground';
      case 'in-progress': return 'bg-warning text-warning-foreground';
      case 'pending': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-8">
          <div>
            <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's your salon overview for today.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="btn-hero hover:translate-y-0">
              <Plus className="w-4 h-4 mr-2" />
              Quick Booking
            </Button>

            <Button variant='outline' onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Today's Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{mockStats.todayBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-foreground">{mockStats.pendingBookings}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elegant">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-foreground">{mockStats.completedServices}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Today's Appointments */}
          <div className="lg:col-span-2">
            <Card className="card-elegant-no-hover">
              <CardHeader>
                <CardTitle>Today's Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTodayAppointments.map((appointment) => (
                    <div 
                      key={appointment.id}
                      className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-sm font-medium text-foreground min-w-[80px]">
                          {appointment.time}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{appointment.customer}</p>
                          <p className="text-sm text-muted-foreground">{appointment.service}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-sm text-muted-foreground">
                          {appointment.technician}
                        </span>
                        <Badge className={getStatusColor(appointment.status)}>
                          {appointment.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <Card className="card-elegant-no-hover">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Plus className="w-4 h-4 mr-2" />
                  New Appointment
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Schedule
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/admin/technicians")}>
                  <Users className="w-4 h-4 mr-2" />
                  Manage Staff
                </Button>
                <Button className="w-full justify-start" variant="outline" onClick={() => navigate("/admin/services")}>
                  <HandHeart className="w-4 h-4 mr-2" />
                  Manage Services
                </Button>
              </CardContent>
            </Card>

            {/* TODO: Phase 2 Features */}
            <Card className="card-elegant-no-hover mt-6">
              <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>• Customer reviews & ratings</p>
                <p>• Inventory management</p>
                <p>• Marketing campaigns</p>
                <p>• Advanced analytics</p>
                <p>• Mobile staff app</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}