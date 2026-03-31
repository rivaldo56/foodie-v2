"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { onboardingService, ChefOnboardingData } from "@/services/onboarding.service";
import { useToast } from "@/contexts/ToastContext";

import WelcomeChefStep from "./_components/WelcomeChefStep";
import CulinaryPathStep from "./_components/CulinaryPathStep";
import SkillsStep from "./_components/SkillsStep";
import ExperienceStep from "./_components/ExperienceStep";
import PortfolioStep from "./_components/PortfolioStep";
import AvailabilityStep from "./_components/AvailabilityStep";
import PricingStep from "./_components/PricingStep";
import CertificationsStep from "./_components/CertificationsStep";
import IdentityStep from "./_components/IdentityStep";
import FinalSetupStep from "./_components/FinalSetupStep";
import ChefProgressBar from "./_components/ChefProgressBar";

export type ChefOnboardingDataState = {
    paths: string[];
    skills: string[];
    signatureStyle: string;
    experienceLevel: string;
    availability: string[];
    pricing: string;
    certifications: string[];
    identityVerified: boolean;
};

const STEPS_COUNT = 10;

export default function ChefOnboardingPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();
    const { showToast } = useToast();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ChefOnboardingDataState>({
        paths: [],
        skills: [],
        signatureStyle: "",
        experienceLevel: "",
        availability: [],
        pricing: "Fair Market",
        certifications: [],
        identityVerified: false,
    });

    useEffect(() => {
        const init = async () => {
            // Enforce Role-Based Access
            if (user?.role === 'client') {
                router.replace('/onboarding');
                return;
            }

            try {
                const statusRes = await onboardingService.getStatus();
                if (statusRes.data?.onboarding_status === 'complete') {
                    router.replace('/chef/dashboard');
                    return;
                }

                // Use GET instead of empty PATCH to fetch data
                const dataRes = await onboardingService.getChefData();
                if (dataRes.data) {
                    const serverData = dataRes.data;
                    setData(prev => ({
                        ...prev,
                        paths: serverData.culinary_paths || [],
                        skills: serverData.specialties || [],
                        experienceLevel: serverData.experience_level || "",
                        availability: serverData.availability_options || [],
                        pricing: serverData.pricing_tier || "Fair Market",
                        certifications: serverData.certifications || [],
                        identityVerified: serverData.identity_verification_status === 'verified'
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
            setLoading(false);
        }
    }, [isAuthenticated, router]);

    const saveDataToBackend = async (newData: ChefOnboardingDataState) => {
        const payload: ChefOnboardingData = {
            culinary_paths: newData.paths,
            specialties: newData.skills,
            experience_level: newData.experienceLevel,
            availability_options: newData.availability,
            pricing_tier: newData.pricing,
            certifications: newData.certifications,
            identity_verification_status: newData.identityVerified ? 'verified' : 'pending'
        };

        try {
            await onboardingService.saveChefData(payload);
        } catch (error) {
            console.error("Failed to save progress", error);
        }
    };

    const nextStep = () => {
        saveDataToBackend(data);
        setCurrentStep((prev) => Math.min(prev + 1, STEPS_COUNT));
    };

    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

    const saveAndExit = () => {
        saveDataToBackend(data);
        showToast("Progress saved", "success");
        // Optionally redirect or just stay
    };

    const updateData = (key: keyof ChefOnboardingDataState, value: any) => {
        setData((prev) => ({ ...prev, [key]: value }));
    };

    const handleComplete = async () => {
        try {
            const res = await onboardingService.completeOnboarding();
            if (res.data?.next_screen) {
                router.push(res.data.next_screen);
            } else {
                router.push('/chef/dashboard');
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
                <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#ffb703] opacity-[0.06] blur-[120px] rounded-full" />
                <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-[#ff7642] opacity-[0.08] blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-md px-6 py-8 relative z-10 flex flex-col h-screen md:h-auto md:min-h-[600px]">
                {/* Header: Progress or Save Button */}
                <div className="flex justify-between items-center mb-6 h-8">
                    {currentStep > 1 && currentStep < 10 && (
                        <div className="w-full mr-4">
                            <ChefProgressBar current={currentStep - 1} total={STEPS_COUNT - 2} />
                        </div>
                    )}
                    {currentStep < 10 && (
                        <button
                            onClick={saveAndExit}
                            className="text-xs font-medium text-neutral-500 hover:text-white transition-colors whitespace-nowrap ml-auto"
                        >
                            Save & Continue Later
                        </button>
                    )}
                </div>

                <div className="flex-1 flex flex-col justify-center">
                    <AnimatePresence mode="wait">
                        {currentStep === 1 && (
                            <WelcomeChefStep key="step1" onNext={nextStep} />
                        )}
                        {currentStep === 2 && (
                            <CulinaryPathStep
                                key="step2"
                                value={data.paths}
                                onChange={(val) => updateData("paths", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 3 && (
                            <SkillsStep
                                key="step3"
                                value={data.skills}
                                signature={data.signatureStyle}
                                onChange={(val) => updateData("skills", val)}
                                onSignatureChange={(val) => updateData("signatureStyle", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 4 && (
                            <ExperienceStep
                                key="step4"
                                value={data.experienceLevel}
                                onChange={(val) => updateData("experienceLevel", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 5 && (
                            <PortfolioStep
                                key="step5"
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 6 && (
                            <AvailabilityStep
                                key="step6"
                                value={data.availability}
                                onChange={(val) => updateData("availability", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 7 && (
                            <PricingStep
                                key="step7"
                                value={data.pricing}
                                onChange={(val) => updateData("pricing", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 8 && (
                            <CertificationsStep
                                key="step8"
                                value={data.certifications}
                                onChange={(val) => updateData("certifications", val)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 9 && (
                            <IdentityStep
                                key="step9"
                                verified={data.identityVerified}
                                onVerify={() => updateData("identityVerified", true)}
                                onNext={nextStep}
                                onBack={prevStep}
                            />
                        )}
                        {currentStep === 10 && (
                            <FinalSetupStep key="step10" onNext={handleComplete} />
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}
