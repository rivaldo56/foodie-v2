"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion, AnimatePresence } from "framer-motion";
import { FileCheck2, Upload, X, CheckCircle2, AlertCircle } from "lucide-react";
import { useRef, useState } from "react";
import { onboardingService } from "@/services/onboarding.service";

interface DocUpload {
  name: string;
  fileName: string;
  url: string;
}

interface CertificationsStepProps {
  value: DocUpload[];
  onChange: (val: DocUpload[]) => void;
  onNext: () => void;
  onBack: () => void;
}

const REQUIRED_DOCS = [
  { id: "food_handling", label: "Food Handling Certificate", icon: "🍽️" },
  { id: "kitchen_safety", label: "Kitchen Safety Training", icon: "🔥" },
  { id: "first_aid", label: "First Aid / CPR", icon: "🏥" },
  { id: "degree", label: "Culinary Degree / Diploma", icon: "🎓" },
];

export default function CertificationsStep({ value, onChange, onNext, onBack }: CertificationsStepProps) {
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [uploading, setUploading] = useState<Record<string, boolean>>({});

  const getUpload = (id: string) => value.find((v) => v.name === id);

  const handleFileChange = async (id: string, label: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(prev => ({ ...prev, [id]: true }));
    try {
      const res = await onboardingService.uploadFile(file, 'certifications');
      if (res.data?.url) {
        const updated = value.filter((v) => v.name !== id);
        onChange([...updated, { name: id, fileName: file.name, url: res.data.url }]);
      }
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setUploading(prev => ({ ...prev, [id]: false }));
    }
  };

  const removeUpload = (id: string) => {
    onChange(value.filter((v) => v.name !== id));
  };

  const allUploaded = REQUIRED_DOCS.every((doc) => getUpload(doc.id));

  return (
    <ChefStepContainer
      title="Credentials"
      subtitle="Upload your culinary certifications to build trust."
      onBack={onBack}
    >
      <div className="space-y-4 mt-6">
        {REQUIRED_DOCS.map((doc, index) => {
          const upload = getUpload(doc.id);
          const isUploaded = !!upload;
          const isUploading = uploading[doc.id];

          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className={`relative rounded-3xl overflow-hidden transition-all duration-500 border group ${
                isUploaded 
                  ? "border-[#ffb703]/40 bg-gradient-to-br from-[#ffb703]/10 to-transparent shadow-[0_0_25px_rgba(255,183,3,0.05)]" 
                  : "border-white/5 bg-white/5 hover:border-white/20 hover:bg-white/10"
              }`}
            >
              <div className="flex items-center gap-4 p-5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 shadow-inner transition-all duration-500 ${
                    isUploaded ? "bg-[#ffb703] text-black scale-105" : "bg-white/5 text-white/30"
                  }`}
                >
                  {isUploading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : isUploaded ? (
                    <CheckCircle2 size={24} strokeWidth={2.5} />
                  ) : (
                    <span className="grayscale group-hover:grayscale-0 transition-all">{doc.icon}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-base font-bold tracking-tight ${isUploaded ? "text-white" : "text-white/60 group-hover:text-white"}`}>
                    {doc.label}
                  </p>
                  {isUploaded ? (
                    <p className="text-xs text-[#ffb703]/60 truncate mt-0.5 font-medium">{upload.fileName}</p>
                  ) : (
                    <p className="text-[10px] text-white/20 uppercase tracking-[0.15em] font-black mt-1">Pending Upload</p>
                  )}
                </div>

                {isUploaded ? (
                  <button
                    onClick={() => removeUpload(doc.id)}
                    className="p-2.5 rounded-xl text-white/20 hover:text-red-400 bg-white/5 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
                  >
                    <X size={18} />
                  </button>
                ) : (
                  <button
                    disabled={isUploading}
                    onClick={() => fileRefs.current[doc.id]?.click()}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-[#ff7642]/30 text-[#ff7642] hover:bg-[#ff7642] hover:text-white transition-all shadow-lg shadow-orange-500/5 disabled:opacity-50"
                  >
                    <Upload size={14} />
                    {isUploading ? "..." : "Upload"}
                  </button>
                )}
              </div>

              <input
                ref={(el) => { fileRefs.current[doc.id] = el; }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileChange(doc.id, doc.label, e)}
              />
            </motion.div>
          );
        })}
      </div>


      <AnimatePresence>
        {!allUploaded && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex items-start gap-4 px-6 py-4 rounded-[1.5rem] bg-[#ffb703]/5 border border-[#ffb703]/10"
          >
            <AlertCircle size={20} className="text-[#ffb703]/70 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[#ffb703]/60 font-medium leading-relaxed">
              We need all 4 documents to verify your expertise. This ensures the highest standards for our foodies.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-auto mb-8 pt-6">
        <motion.button
          whileHover={allUploaded ? { scale: 1.02 } : {}}
          whileTap={allUploaded ? { scale: 0.98 } : {}}
          onClick={allUploaded ? onNext : undefined}
          disabled={!allUploaded}
          className={`w-full py-5 rounded-full font-black text-lg transition-all duration-500 shadow-2xl ${
            allUploaded 
              ? "bg-gradient-to-r from-[#ff7642] to-[#ffb703] text-black shadow-orange-500/20" 
              : "bg-white/5 text-white/10 border border-white/5 cursor-not-allowed"
          }`}
        >
          {allUploaded ? "Continue" : `Add ${REQUIRED_DOCS.length - value.length} more`}

        </motion.button>
      </div>

    </ChefStepContainer>
  );
}
