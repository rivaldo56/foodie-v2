"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingService, ClientOnboardingData } from "@/services/onboarding.service";
import { useToast } from "@/contexts/ToastContext";

import WelcomeStep from "./_components/WelcomeStep";
import MotivationStep from "./_components/MotivationStep";
import TasteProfileStep from "./_components/TasteProfileStep";
import AllergiesStep from "./_components/AllergiesStep";
import PartySizeStep from "./_components/PartySizeStep";
import BudgetStep from "./_components/BudgetStep";
import LocationStep from "./_components/LocationStep";
import VibeStep from "./_components/VibeStep";
import CompletionStep from "./_components/CompletionStep";
import ProgressBar from "./_components/ProgressBar";

export type OnboardingData = {
    motivation: string[];
    tastes: string[];
    allergies: string[];
    allergiesDetails: string;
    partySize: string;
    budget: string;
    location: string;
    vibes: string[];
};

const STEPS_COUNT = 9;

export default function OnboardingPage() {
    const router = useRouter();
    const { user, isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<OnboardingData>({
        motivation: [],
        tastes: [],
        allergies: [],
        allergiesDetails: "",
        partySize: "",
        budget: "",
        location: "",
        vibes: [],
    });

    useEffect(() => {
        const init = async () => {
            if (!isAuthenticated) {
                // Wait for auth to be determined or handle redirect?
                // AuthContext handles protected route logic usually, but here we can double check
                return;
            }

            // Enforce Role-Based Access
            if (user?.role === 'chef') {
                router.replace('/chef-onboarding');
                return;
            }

            try {
                // Optionally fetch existing data if re-entering
                const statusRes = await onboardingService.getStatus();
                if (statusRes.data?.onboarding_status === 'complete') {
                    router.replace('/client/home');
                    return;
                }
                
                // Use GET instead of empty PATCH to fetch data
                const dataRes = await onboardingService.getClientData();

                if (dataRes.data) {
                    const serverData = dataRes.data;
                    setData(prev => ({
                        ...prev,
                        motivation: serverData.occasion_types || [],
                        tastes: serverData.preferred_cuisines || [],
                        allergies: serverData.allergies || [],
                        // allergiesDetails not separate in backend model yet, maybe append to allergies or ignored
                        partySize: serverData.dining_frequency || "", // Mapping mismatch? Model has dining_frequency
                        budget: serverData.budget_range || "",
                        location: serverData.location || "",
                        vibes: serverData.dietary_preferences || [] // Mapping mismatch? 
                    }));
                }

                setLoading(false);
            } catch (error) {
                console.error("Failed to load onboarding data", error);
                setLoading(false);
            }
        };

        if (isAuthenticated) {
            init();
        } else {
            // Maybe set loading false to show content (Welcome step) or let AuthContext handle
            setLoading(false);
        }
    }, [isAuthenticated, router]);

    const saveDataToBackend = async (newData: OnboardingData) => {
        // Map frontend state to backend model keys
        const payload: ClientOnboardingData = {
            occasion_types: newData.motivation,
            preferred_cuisines: newData.tastes,
            allergies: newData.allergies,
            allergies_details: newData.allergiesDetails,
            budget_range: newData.budget,
            location: newData.location,
            dining_frequency: newData.partySize,
            dietary_preferences: newData.vibes
        };

        try {
            await onboardingService.saveClientData(payload);
        } catch (error) {
            console.error("Failed to save progress", error);
            // Soft fail
        }
    };

    const nextStep = () => {
        saveDataToBackend(data);
        setCurrentStep((prev) => Math.min(prev + 1, STEPS_COUNT));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const updateData = (key: keyof OnboardingData, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const handleComplete = async () => {
        try {
            const res = await onboardingService.completeOnboarding();
            if (res.data?.next_screen) {
                router.push(res.data.next_screen);
            } else {
                router.push('/client/home');
            }
        } catch (error) {
            console.error("Completion failed", error);
            showToast("Failed to complete onboarding", "error");
        }
    };

    if (loading) return <div className="min-h-screen bg-[#0f1012]" />;

    return (
        <div className="min-h-screen w-full bg-[#0f1012] text-[#f9fafb] overflow-hidden flex flex-col items-center justify-center relative font-sans">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-[#ff7642] opacity-[0.08] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-blue-500 opacity-[0.05] blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-md px-6 py-8 relative z-10 flex flex-col h-screen md:h-auto md:min-h-[600px]">
                {/* Progress Bar (Skipped on Welcome (1) and Completion (9)) */}
                {currentStep > 1 && currentStep < 9 && (
                    <ProgressBar current={currentStep - 1} total={STEPS_COUNT - 2} />
                )}

                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <WelcomeStep key="step1" onNext={nextStep} />
                        )}
                        {currentStep === 2 && (
                            <MotivationStep
                                key="step2"
                                value={data.motivation}
                                onChange={(val) => updateData("motivation", val)}
                                onNext={nextStep}
                            />
                        )}
                        {currentStep === 3 && (
                            <TasteProfileStep
                                key="step3"
                                value={data.tastes}
                                onChange={(val) => updateData("tastes", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 4 && (
                            <AllergiesStep
                                key="step4"
                                value={data.allergies}
                                details={data.allergiesDetails}
                                onChange={(val) => updateData("allergies", val)}
                                onDetailsChange={(val) => updateData("allergiesDetails", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 5 && (
                            <PartySizeStep
                                key="step5"
                                value={data.partySize}
                                onChange={(val) => updateData("partySize", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 6 && (
                            <BudgetStep
                                key="step6"
                                value={data.budget}
                                onChange={(val) => updateData("budget", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 7 && (
                            <LocationStep
                                key="step7"
                                value={data.location}
                                onChange={(val) => updateData("location", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 8 && (
                            <VibeStep
                                key="step8"
                                value={data.vibes}
                                onChange={(val) => updateData("vibes", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 9 && (
                            <CompletionStep key="step9" onNext={handleComplete} />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
