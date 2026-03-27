"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion, AnimatePresence } from "framer-motion";
import { ScanFace, Camera, CheckCircle2, Upload, X, Shield } from "lucide-react";
import { useRef, useState } from "react";
import { onboardingService } from "@/services/onboarding.service";

interface IdentityStepProps {
  verified: boolean;
  onVerify: () => void;
  onNext: () => void;
  onBack: () => void;
}

interface UploadSlot {
  id: "id_doc" | "selfie";
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  accept: string;
}

const SLOTS: UploadSlot[] = [
  {
    id: "id_doc",
    label: "Government ID",
    sublabel: "Passport, National ID, or Driver's License",
    icon: <ScanFace size={22} />,
    accept: ".jpg,.jpeg,.png,.pdf",
  },
  {
    id: "selfie",
    label: "Selfie Photo",
    sublabel: "A clear photo of your face",
    icon: <Camera size={22} />,
    accept: "image/*",
  },
];

export default function IdentityStep({ verified, onVerify, onNext, onBack }: IdentityStepProps) {
  const [uploads, setUploads] = useState<Record<string, { fileName: string; url: string }>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleFileChange = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [id]: true }));
    try {
      // Use 'certifications' type for identity docs too as they go to the same secure folder
      const res = await onboardingService.uploadFile(file, 'certifications');
      if (res.data?.url) {
        const next = { ...uploads, [id]: { fileName: file.name, url: res.data.url } };
        setUploads(next);
        // Mark as verified once both slots are filled
        if (Object.keys(next).length >= 2 && !verified) {
          onVerify();
        }
      }
    } catch (error) {
      console.error("Identity upload failed", error);
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  const removeUpload = (id: string) => {
    const next = { ...uploads };
    delete next[id];
    setUploads(next);
  };


  const allDone = SLOTS.every((s) => !!uploads[s.id]);

  return (
    <ChefStepContainer
      title="Verification"
      subtitle="Verify your identity to unlock booking privileges."
      onBack={onBack}
    >
      <div className="space-y-4 mt-8">
        {SLOTS.map((slot, index) => {
          const upload = uploads[slot.id];
          const done = !!upload;
          const isUploading = uploading[slot.id];

          return (
            <motion.div
              key={slot.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.12 }}
              className={`rounded-3xl p-5 border transition-all duration-700 overflow-hidden relative group ${
                done 
                  ? "border-[#4ade80]/40 bg-gradient-to-br from-[#4ade80]/10 to-transparent shadow-[0_0_20px_rgba(74,222,128,0.05)]" 
                  : "bg-white/5 border-white/5 hover:border-white/10"
              }`}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-inner ${
                    done 
                      ? "bg-[#4ade80] text-black scale-105" 
                      : "bg-white/5 text-white/20"
                  }`}
                >
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : done ? (
                    <CheckCircle2 size={28} strokeWidth={2.5} />
                  ) : (
                    <div className="group-hover:text-[#4ade80] transition-colors">{slot.icon}</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-bold tracking-tight ${done ? "text-white" : "text-white/40 group-hover:text-white"}`}>
                    {slot.label}
                  </p>
                  {done ? (
                    <p className="text-xs text-[#4ade80]/60 truncate mt-0.5 font-medium">{upload.fileName}</p>
                  ) : (
                    <p className="text-[10px] text-white/10 uppercase tracking-[0.2em] font-black mt-1.5">{slot.sublabel}</p>
                  )}
                </div>
                {done ? (
                  <button
                    onClick={() => removeUpload(slot.id)}
                    className="p-3 rounded-2xl text-white/20 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
                  >
                    <X size={18} />
                  </button>
                ) : (
                  <button
                    disabled={isUploading}
                    onClick={() => fileRefs.current[slot.id]?.click()}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest px-5 py-3 rounded-2xl border border-white/10 text-white/80 hover:bg-white hover:text-black transition-all shadow-xl disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {isUploading ? "Wait" : "Upload"}
                  </button>
                )}

              </div>
              <input
                ref={(el) => { fileRefs.current[slot.id] = el; }}
                type="file"
                accept={slot.accept}
                className="hidden"
                onChange={(e) => handleFileChange(slot.id, e)}
              />
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-8 flex items-center gap-4 px-6 py-4 rounded-3xl bg-[#4ade80]/5 border border-[#4ade80]/10 shadow-[0_0_40px_rgba(74,222,128,0.03)]"
          >
            <Shield size={24} className="text-[#4ade80] flex-shrink-0 drop-shadow-[0_0_8px_rgba(74,222,128,0.4)]" />
            <p className="text-xs text-[#4ade80]/60 font-medium leading-relaxed">
              Your identity is protected by military-grade encryption and will be reviewed within 24 hours.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto mb-8 pt-8">
        <motion.button
          whileHover={allDone ? { scale: 1.02 } : {}}
          whileTap={allDone ? { scale: 0.98 } : {}}
          onClick={allDone ? onNext : undefined}
          disabled={!allDone}
          className={`w-full py-5 rounded-full font-black text-lg transition-all duration-500 shadow-2xl ${
            allDone
              ? "bg-gradient-to-r from-[#4ade80] to-[#22c55e] text-[#052e16] shadow-green-500/20"
              : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
          }`}
        >
          {allDone ? "Complete Verification" : "Awaiting Documents"}
        </motion.button>
      </div>

    </ChefStepContainer>
  );
}
