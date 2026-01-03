"use client";

import StepContainer from "./StepContainer";
import { motion } from "framer-motion";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";

interface LocationStepProps {
    value: string;
    onChange: (val: string) => void;
    onNext: () => void;
    onBack: () => void;
}

export default function LocationStep({ value, onChange, onNext, onBack }: LocationStepProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleUseCurrentLocation = () => {
        setLoading(true);
        setError(null);

        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    // Using OpenStreetMap Nominatim API for reverse geocoding
                    const response = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                        {
                            headers: {
                                'User-Agent': 'FoodieApp/1.0' // Required by Nominatim
                            }
                        }
                    );
                    const data = await response.json();

                    if (data && data.address) {
                        const city = data.address.city || data.address.town || data.address.village || data.address.county;
                        const state = data.address.state;
                        const formattedAddress = [city, state].filter(Boolean).join(", ");
                        onChange(formattedAddress);
                    } else {
                        // Fallback if address parsing fails
                        onChange(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
                    }
                } catch (err) {
                    console.error("Failed to fetch address", err);
                    setError("Failed to get address details");
                } finally {
                    setLoading(false);
                }
            },
            (err) => {
                console.error("Geolocation error", err);
                let errorMessage = "Failed to get location";
                if (err.code === err.PERMISSION_DENIED) {
                    errorMessage = "Location permission denied";
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    errorMessage = "Location unavailable";
                } else if (err.code === err.TIMEOUT) {
                    errorMessage = "Location request timed out";
                }
                setError(errorMessage);
                setLoading(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    return (
        <StepContainer
            title="Where are you?"
            subtitle="To find chefs near you."
            onBack={onBack}
        >
            <div className="mt-8 relative">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative"
                >
                    <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-neutral-500" size={24} />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => {
                            onChange(e.target.value);
                            setError(null);
                        }}
                        placeholder="City, Neighborhood, or Zip"
                        className={`w-full bg-white/5 border ${error ? "border-red-500/50" : "border-white/10"} rounded-2xl py-6 pl-14 pr-4 text-xl text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#ff7642] focus:ring-1 focus:ring-[#ff7642] transition-colors`}
                    />
                </motion.div>

                <div className="flex flex-col items-start mt-4">
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        onClick={handleUseCurrentLocation}
                        disabled={loading}
                        className="flex items-center text-[#ff7642] text-sm font-medium hover:text-[#ff8b5f] transition-colors px-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Navigation size={16} className={`mr-2 ${loading ? "animate-spin" : ""}`} />
                        {loading ? "Getting location..." : "Use my current location"}
                    </motion.button>

                    {error && (
                        <span className="text-red-500 text-xs mt-2 ml-2 px-2">
                            {error}
                        </span>
                    )}
                </div>
            </div>

            <div className="mt-auto pt-20">
                <button
                    onClick={onNext}
                    disabled={!value || loading}
                    className={`w-full py-4 rounded-full font-medium text-lg transition-all ${value
                        ? "bg-[#ff7642] text-white shadow-lg hover:shadow-orange-500/25"
                        : "bg-white/10 text-white/40 cursor-not-allowed"
                        }`}
                >
                    Continue
                </button>
            </div>
        </StepContainer>
    );
}
