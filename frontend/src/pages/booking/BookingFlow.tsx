import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate, Navigate } from "react-router-dom";
import { Navbar } from "@/components/common/Navbar";
import { ServiceSelection } from "@/components/booking/ServiceSelection";
import { DateTimeSelection } from "@/components/booking/DateTimeSelection";
import { CustomerInfo } from "@/components/booking/CustomerInfo";
import { BookingSummary } from "@/components/booking/BookingSummary"; // ✅ 用回 Summary（只做展示）

import { useBookingStore } from "@/stores/bookingStore";
import { Progress } from "@/components/ui/progress";
import type { Service } from "@/types";

const steps = [
  { id: 1, title: "Select Services", component: ServiceSelection },
  { id: 2, title: "Date & Time", component: DateTimeSelection },
  { id: 3, title: "Your Info", component: CustomerInfo },
  { id: 4, title: "Review", component: BookingSummary }, // ✅ Step 4 只展示，提交去 /book/confirm
];

export default function BookingFlow() {
  const [currentStep, setCurrentStep] = useState(1);
  const location = useLocation();
  const navigate = useNavigate();
  const injectedRef = useRef(false);

  const { setSelectedServices, setSelectedTimeSlot, setSelectedDate, setSelectedTechnician } =
    useBookingStore();

  // ✅ 从 /services 进来，预选 service，并清理后续选择
  useEffect(() => {
    if (injectedRef.current) return;

    const pre = (location.state as any)?.preselectedService as Service | undefined;
    if (pre?.id) {
      setSelectedServices([pre]);
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      setSelectedTechnician(null);
    }

    injectedRef.current = true;
  }, [location.state, setSelectedServices, setSelectedDate, setSelectedTimeSlot, setSelectedTechnician]);

  // ✅ 支持从其他页面回到 /book 并指定 step（例如 confirm 页 Edit → step 3）
  useEffect(() => {
    const step = (location.state as any)?.step;
    if (typeof step === "number" && step >= 1 && step <= steps.length) {
      setCurrentStep(step);
    }
  }, [location.state]);

  const currentStepData = useMemo(() => steps.find((s) => s.id === currentStep), [currentStep]);
  const StepComponent = currentStepData?.component;

  const progress = (currentStep / steps.length) * 100;

  const nextStep = () => {
    // ✅ 最后一步：跳到独立 confirm 页面提交
    if (currentStep === steps.length) {
      navigate("/book/confirm");
      return;
    }
    setCurrentStep((s) => Math.min(s + 1, steps.length));
  };

  const prevStep = () => {
    setCurrentStep((s) => Math.max(s - 1, 1));
  };

  if (!StepComponent || !currentStepData) {
    return <Navigate to="/book" replace />;
  }

  // ✅ 只有 ServiceSelection 需要 preselectedService props
  const preselectedService = (location.state as any)?.preselectedService as Service | undefined;

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
            {currentStep === 1 ? (
              <ServiceSelection onNext={nextStep} preselectedService={preselectedService} />
            ) : currentStep === 2 ? (
              <DateTimeSelection
                onNext={nextStep}
                onPrev={prevStep}
                currentStep={currentStep}
                totalSteps={steps.length}
              />
            ) : currentStep === 3 ? (
              <CustomerInfo
                onNext={nextStep}
                onPrev={prevStep}
                currentStep={currentStep}
                totalSteps={steps.length}
              />
            ) : (
              <BookingSummary
                onNext={nextStep}  // ✅ 这里 next 会跳 /book/confirm
                onPrev={prevStep}
                currentStep={currentStep}
                totalSteps={steps.length}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
