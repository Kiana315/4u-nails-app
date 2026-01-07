import { useEffect, useRef, useState } from "react";
import { useLocation, Navigate } from "react-router-dom";
import { Navbar } from "@/components/common/Navbar";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { CustomerInfo } from "@/components/booking/CustomerInfo";
import BookingConfirm from "@/pages/booking/BookingConfirm"; // ✅ 改：最终确认页（提交 API）

import { useBookingStore } from "@/stores/bookingStore";
import { Progress } from "@/components/ui/progress";

const steps = [
  { id: 1, title: "Select Services", component: ServiceSelection },
  { id: 2, title: "Date & Time", component: DateTimeSelection },
  { id: 3, title: "Your Info", component: CustomerInfo },
  { id: 4, title: "Review", component: BookingConfirm }, // ✅ 改：从 BookingSummary 换成 BookingConfirm
];

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const injectedRef = useRef(false);

  const preselectedService = (location.state as any)?.preselectedService;

  const currentStepData = steps.find((step) => step.id === currentStep);
  const StepComponent = currentStepData?.component;

  const progress = (currentStep / steps.length) * 100;

  const { setSelectedServices, setSelectedTimeSlot, setSelectedDate, setSelectedTechnician } =
    useBookingStore();

  // ✅ 从 /services 进来，预选 service，并清理后续选择
  useEffect(() => {
    if (injectedRef.current) return;

    const pre = (location.state as any)?.preselectedService;
    if (pre?.id) {
      setSelectedServices([pre]);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSelectedTechnician(null);
    }

    injectedRef.current = true;
  }, [location.state, setSelectedServices, setSelectedDate, setSelectedTimeSlot, setSelectedTechnician]);

  const nextStep = () => {
    if (currentStep < steps.length) setCurrentStep((s) => s + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep((s) => s - 1);
  };

  if (!StepComponent || !currentStepData) {
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
                <div key={step.id} className={step.id <= currentStep ? "text-primary" : ""}>
                  {step.title}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            <StepComponent
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
