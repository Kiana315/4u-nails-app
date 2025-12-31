import { useState } from 'react';
import { useEffect } from "react";
import { useLocation, Navigate } from 'react-router-dom';
import { Navbar } from '@/components/common/Navbar';
import { ServiceSelection } from '@/components/booking/ServiceSelection';
import { DateTimeSelection } from '@/components/booking/DateTimeSelection';
import { CustomerInfo } from '@/components/booking/CustomerInfo';
import { BookingSummary } from '@/components/booking/BookingSummary';
import { useBookingStore } from '@/stores/bookingStore';
import { Progress } from '@/components/ui/progress';

const steps = [
  { id: 1, title: 'Select Services', component: ServiceSelection },
  { id: 2, title: 'Date & Time', component: DateTimeSelection },
  { id: 3, title: 'Your Info', component: CustomerInfo },
  { id: 4, title: 'Review', component: BookingSummary },
];

const CurrentComponent = () => (
  <div style={{ padding: 24 }}>STEP 1 WORKS</div>
);

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const { selectedServices } = useBookingStore();
  const { clearBooking } = useBookingStore();

 
  useEffect(() => {
    clearBooking();
  }, [clearBooking]);

  // Handle preselected service from services page
  const preselectedService = location.state?.preselectedService;

  const currentStepData = steps.find(step => step.id === currentStep);
  const CurrentComponent = currentStepData?.component;
  
  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!CurrentComponent) {
    return <Navigate to="/book" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-20">
        <div className="container mx-auto px-4 py-8">
          {/* Progress Header */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="text-center mb-6">
              <h1 className="font-serif text-3xl font-semibold text-foreground mb-2">
                Book Your Appointment
              </h1>
              <p className="text-muted-foreground">
                Step {currentStep} of {steps.length}: {currentStepData.title}
              </p>
            </div>
            
            <Progress value={progress} className="h-2 mb-4" />
            
            <div className="flex justify-between text-xs text-muted-foreground">
              {steps.map((step) => (
                <div 
                  key={step.id}
                  className={`${
                    step.id <= currentStep ? 'text-primary' : ''
                  }`}
                >
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            <CurrentComponent
              onNext={nextStep}
              onPrev={prevStep}
              currentStep={currentStep}
              totalSteps={steps.length}
              preselectedService={preselectedService}
            />
          </div>
        </div>
      </div>
    </div>
  );
}