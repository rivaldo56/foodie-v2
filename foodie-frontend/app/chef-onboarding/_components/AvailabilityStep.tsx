"use client";
import { useState, useEffect } from "react";
import ChefStepContainer from "./ChefStepContainer";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Users, Clock, Bell, Calendar, Zap } from "lucide-react";

interface AvailabilityData {
    city: string;
    state: string;
    travelDistance: number; // km
    guestLimit: number;
    availabilityType: "fully_open" | "casual" | "notice_required"; // notice = 48hrs
    casualDays: string[];
    timeSlots: string[];
    lat?: number;
    lng?: number;
}


interface AvailabilityStepProps {
    value: string[];
    onChange: (val: string[]) => void;
    onNext: () => void;
    onBack: () => void;
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const TIME_SLOTS = ["Morning (6am–12pm)", "Afternoon (12pm–5pm)", "Evening (5pm–10pm)"];
const DISTANCE_OPTIONS = [5, 10, 20, 30, 50, 100];
const GUEST_PRESETS = [1, 5, 10, 20, 50, 100];

export default function AvailabilityStep({ value, onChange, onNext, onBack }: AvailabilityStepProps) {
    // Parse state from the string[] value for backward compat
    const parseValue = (): AvailabilityData => {
        try {
            const raw = value.find((v) => v.startsWith("{"));
            if (raw) return JSON.parse(raw);
        } catch { /* ignore */ }
        return {
            city: "",
            state: "",
            travelDistance: 20,
            guestLimit: 10,
            availabilityType: "notice_required",
            casualDays: [],
            timeSlots: [],
        };
    };

    const data = parseValue();

    const update = (patch: Partial<AvailabilityData>) => {
        const next = { ...data, ...patch };
        onChange([JSON.stringify(next)]);
    };

    const toggleDay = (day: string) => {
        const next = data.casualDays.includes(day)
            ? data.casualDays.filter((d) => d !== day)
            : [...data.casualDays, day];
        update({ casualDays: next });
    };

    const toggleSlot = (slot: string) => {
        const next = data.timeSlots.includes(slot)
            ? data.timeSlots.filter((s) => s !== slot)
            : [...data.timeSlots, slot];
        update({ timeSlots: next });
    };

    const [isDetecting, setIsDetecting] = useState(false);

    const detectLocation = () => {
        if (!navigator.geolocation) return;
        setIsDetecting(true);
        navigator.geolocation.getCurrentPosition(async (pos) => {
            const { latitude, longitude } = pos.coords;
            try {
                // Reverse geocode using OSM Nominatim (free, no key needed for low volume)
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`);
                const data = await res.json();
                const city = data.address?.city || data.address?.town || data.address?.suburb || "";
                const state = data.address?.state || data.address?.county || "";
                
                update({ 
                    lat: latitude, 
                    lng: longitude,
                    city: city || data.data?.city || "",
                    state: state || data.data?.state || ""
                });
            } catch (err) {
                console.error("Geocoding failed", err);
                update({ lat: latitude, lng: longitude });
            } finally {
                setIsDetecting(false);
            }
        }, () => setIsDetecting(false));
    };

    const isValid = data.city.trim().length > 0 && data.state.trim().length > 0;


    return (
        <ChefStepContainer
            title="Availability"
            subtitle="When and where can clients book you?"
            onBack={onBack}
        >
            <div className="space-y-8 mt-6 pb-12">

                {/* Location */}
                <section className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MapPin size={12} className="text-[#ffb703]" /> 
                            Operation Zone
                        </label>
                        <motion.button 
                            whileHover={{ scale: 1.05, color: "#ffb703" }}
                            whileTap={{ scale: 0.95 }}
                            onClick={detectLocation}
                            disabled={isDetecting}
                            className="flex items-center gap-2 text-[10px] font-extrabold text-[#ffb703]/80 transition-colors uppercase tracking-widest disabled:opacity-50 group"
                        >
                            {isDetecting ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-3 h-3 border-2 border-[#ffb703] border-t-transparent rounded-full" />
                            ) : (
                                <Zap size={10} className="group-hover:fill-[#ffb703]" />
                            )}
                            Pin My Site
                        </motion.button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="City"
                                value={data.city}
                                onChange={(e) => update({ city: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl text-base font-medium text-white placeholder:text-white/10 bg-white/5 border border-white/5 focus:outline-none focus:border-[#ffb703]/30 focus:bg-white/10 transition-all"
                            />
                        </div>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="State"
                                value={data.state}
                                onChange={(e) => update({ state: e.target.value })}
                                className="w-full px-5 py-4 rounded-2xl text-base font-medium text-white placeholder:text-white/10 bg-white/5 border border-white/5 focus:outline-none focus:border-[#ffb703]/30 focus:bg-white/10 transition-all"
                            />
                        </div>
                    </div>
                </section>


                {/* Travel Distance */}
                <section className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Zap size={12} className="text-[#ffb703]" /> 
                        Travel Radius
                    </label>
                    <div className="grid grid-cols-3 gap-2 px-1">
                        {DISTANCE_OPTIONS.map((km) => (
                            <button
                                key={km}
                                onClick={() => update({ travelDistance: km })}
                                className={`py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                                    data.travelDistance === km
                                        ? "bg-[#ffb703] text-black shadow-lg shadow-yellow-500/20"
                                        : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                                }`}
                            >
                                {km} km
                            </button>
                        ))}
                    </div>
                </section>

                {/* Guest Limit */}
                <section className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Users size={12} className="text-[#ffb703]" /> 
                        Capacity
                    </label>
                    <div className="grid grid-cols-3 gap-2 px-1">
                        {GUEST_PRESETS.map((n) => (
                            <button
                                key={n}
                                onClick={() => update({ guestLimit: n })}
                                className={`py-4 rounded-2xl text-sm font-bold transition-all duration-300 ${
                                    data.guestLimit === n
                                        ? "bg-[#ffb703] text-black shadow-lg shadow-yellow-500/20"
                                        : "bg-white/5 text-white/40 border border-white/5 hover:bg-white/10"
                                }`}
                            >
                                {n === 100 ? "100+" : n === 1 ? "1:1" : `Up to ${n}`}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Availability Type */}
                <section className="space-y-3">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Bell size={12} className="text-[#ffb703]" /> 
                        Booking Style
                    </label>
                    <div className="space-y-3">
                        {[
                            { id: "fully_open", label: "Instant Book", sub: "Available anytime you're free" },
                            { id: "notice_required", label: "Notice Required", sub: "At least 48 hours in advance" },
                            { id: "casual", label: "Selected Days", sub: "You choose your weekly routine" },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => update({ availabilityType: opt.id as AvailabilityData["availabilityType"] })}
                                className={`w-full flex items-center gap-4 p-5 rounded-3xl text-left transition-all duration-500 border group ${
                                    data.availabilityType === opt.id
                                        ? "border-[#ffb703]/50 bg-gradient-to-br from-[#ffb703]/10 to-transparent shadow-[0_0_30px_rgba(255,183,3,0.05)]"
                                        : "border-white/5 bg-white/5 hover:bg-white/10"
                                }`}
                            >
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                                    data.availabilityType === opt.id ? "bg-[#ffb703] text-black shadow-lg shadow-yellow-500/20" : "bg-white/5 text-white/20"
                                }`}>
                                   {opt.id === "fully_open" ? <Zap size={18} /> : opt.id === "notice_required" ? <Clock size={18} /> : <Calendar size={18} />}
                                </div>
                                <div className="flex-1">
                                    <span className={`text-lg font-bold block ${data.availabilityType === opt.id ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                                        {opt.label}
                                    </span>
                                    <p className={`text-sm font-light ${data.availabilityType === opt.id ? "text-white/40" : "text-white/20"}`}>{opt.sub}</p>
                                </div>
                                {data.availabilityType === opt.id && (
                                    <motion.div layoutId="book-check" className="w-2.5 h-2.5 rounded-full bg-[#ffb703]" />
                                )}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Day-of-week picker — only shown for casual */}
                <AnimatePresence>
                    {data.availabilityType === "casual" && (
                        <motion.section
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="space-y-3"
                        >
                            <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                                <Calendar size={12} className="text-[#ffb703]" /> 
                                Weekly Schedule
                            </label>
                            <div className="grid grid-cols-7 gap-1.5">
                                {DAYS.map((day) => {
                                    const sel = data.casualDays.includes(day);
                                    return (
                                        <button
                                            key={day}
                                            onClick={() => toggleDay(day)}
                                            className={`py-4 rounded-xl text-xs font-black transition-all duration-300 ${
                                                sel
                                                    ? "bg-[#ffb703] text-black shadow-md shadow-yellow-500/20 scale-105"
                                                    : "bg-white/5 text-white/20 border border-white/5"
                                            }`}
                                        >
                                            {day[0]}
                                        </button>
                                    );
                                })}
                            </div>
                        </motion.section>
                    )}
                </AnimatePresence>

                {/* Time slots */}
                <section className="space-y-4">
                    <label className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        <Clock size={12} className="text-[#ffb703]" /> 
                        Preferred Windows
                    </label>
                    <div className="grid grid-cols-1 gap-2.5">
                        {TIME_SLOTS.map((slot) => {
                            const sel = data.timeSlots.includes(slot);
                            return (
                                <button
                                    key={slot}
                                    onClick={() => toggleSlot(slot)}
                                    className={`w-full px-5 py-4 rounded-2xl text-base font-semibold text-left transition-all duration-500 border ${
                                        sel
                                            ? "border-[#ffb703]/30 bg-[#ffb703]/10 text-white shadow-[0_0_20px_rgba(255,183,3,0.05)]"
                                            : "border-white/5 bg-white/5 text-white/30 hover:bg-white/10"
                                    }`}
                                >
                                    <div className="flex justify-between items-center group">
                                        <span>{slot}</span>
                                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${sel ? "border-[#ffb703] bg-[#ffb703]" : "border-white/10"}`}>
                                           {sel && <div className="w-1.5 h-1.5 rounded-full bg-black" />}
                                        </div>
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </section>
            </div>

            <div className="mt-auto mb-10 pt-4">
                <motion.button
                    whileHover={isValid ? { scale: 1.02 } : {}}
                    whileTap={isValid ? { scale: 0.98 } : {}}
                    onClick={isValid ? onNext : undefined}
                    disabled={!isValid}
                    className={`w-full py-5 rounded-full font-black text-lg transition-all duration-500 shadow-2xl ${
                        isValid
                        ? "bg-gradient-to-r from-[#ffb703] to-[#ff9500] text-black shadow-yellow-500/20" 
                        : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
                    }`}
                >
                    {isValid ? "Continue" : "Where are you based?"}
                </motion.button>
            </div>

        </ChefStepContainer>
    );
}
