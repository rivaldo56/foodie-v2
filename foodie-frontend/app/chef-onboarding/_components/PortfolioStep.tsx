"use client";

import ChefStepContainer from "./ChefStepContainer";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Plus, ImageIcon } from "lucide-react";
import { useRef, useState } from "react";
import { onboardingService } from "@/services/onboarding.service";

interface PhotoFile {
  id: number;
  fileName: string;
  url: string;
  preview: string;
}

interface PortfolioStepProps {
  onNext: () => void;
  onBack: () => void;
  value?: string[];
  onChange?: (urls: string[]) => void;
}

const MAX_PHOTOS = 8;

export default function PortfolioStep({ onNext, onBack, value = [], onChange }: PortfolioStepProps) {
  const [photos, setPhotos] = useState<PhotoFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    const newPhotos: PhotoFile[] = [...photos];

    try {
      for (const file of files) {
        if (newPhotos.length >= MAX_PHOTOS) break;
        
        const res = await onboardingService.uploadFile(file, 'portfolio');
        if (res.data?.url) {
          newPhotos.push({
            id: Date.now() + Math.random(),
            fileName: file.name,
            url: res.data.url,
            preview: res.data.url,
          });
        }
      }
      setPhotos(newPhotos);
      onChange?.(newPhotos.map((p) => p.url));
    } catch (error) {
      console.error("Portfolio upload failed", error);
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const removePhoto = (id: number) => {
    const next = photos.filter((p) => p.id !== id);
    setPhotos(next);
    onChange?.(next.map((p) => p.url));
  };

  const canAddMore = photos.length < MAX_PHOTOS;


  return (
    <ChefStepContainer
      title="Show your craft."
      subtitle={`Display your best dishes to build trust with clients. (${photos.length}/${MAX_PHOTOS})`}
      onBack={onBack}
    >
      <div className="mt-6 mb-8 relative">
        {/* Drop zone — only show if no photos yet */}
        <AnimatePresence>
          {photos.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => fileInputRef.current?.click()}
              whileHover={{ scale: 1.01, borderColor: "rgba(255,183,3,0.4)" }}
              whileTap={{ scale: 0.99 }}
              className="w-full h-56 rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all border-2 border-dashed border-white/10 bg-white/5 group relative overflow-hidden"
            >
              {/* Animated background glow for drop zone */}
              <div className="absolute inset-0 bg-[#ffb703]/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 bg-[#ffb703]/10 text-[#ffb703] relative z-10 group-hover:scale-110 transition-transform">
                <Upload size={28} strokeWidth={1.5} />
              </div>
              <p className="text-white text-lg font-semibold mb-1 relative z-10">Select your photos</p>
              <p className="text-white/30 text-sm font-light relative z-10">High quality images work best</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photo grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            <AnimatePresence>
              {photos.map((photo) => (
                <motion.div
                  key={photo.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.7 }}
                  className="relative aspect-square rounded-[1.5rem] overflow-hidden group border border-white/5"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.preview}
                    alt={photo.fileName}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  {/* Hover overlay with a glass look */}
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                    <button
                      onClick={(e) => { e.stopPropagation(); removePhoto(photo.id); }}
                      className="p-3 rounded-full bg-white/10 border border-white/20 text-white hover:bg-red-500 hover:border-red-500 transition-all"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add more button in the grid */}
              {canAddMore && (
                <motion.button
                  key="add-more"
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-[1.5rem] flex flex-col items-center justify-center gap-1.5 transition-all border border-dashed border-white/20 bg-white/5 hover:bg-white/10 hover:border-[#ffb703]/40 group"
                >
                  <Plus size={24} className="text-white/20 group-hover:text-[#ffb703] transition-colors" />
                  <span className="text-[10px] uppercase tracking-widest font-bold text-white/10 group-hover:text-white/40">Add</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        )}

        {photos.length > 0 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                    className="h-full bg-gradient-to-r from-[#ffb703] to-[#ff7642]"
                    initial={{ width: 0 }}
                    animate={{ width: `${(photos.length / MAX_PHOTOS) * 100}%` }}
                />
            </div>
            <span className="text-[10px] font-bold text-white/20 uppercase tracking-widest">{photos.length} / {MAX_PHOTOS}</span>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFiles}
        />
      </div>

      <div className="mt-auto mb-6">
        <motion.button
          whileHover={photos.length > 0 ? { scale: 1.02 } : {}}
          whileTap={photos.length > 0 ? { scale: 0.98 } : {}}
          disabled={uploading}
          onClick={onNext}
          className={`w-full py-5 rounded-full font-bold text-lg transition-all duration-500 relative overflow-hidden ${
            photos.length > 0
              ? "bg-gradient-to-r from-[#ffb703] to-[#ff9500] text-black shadow-2xl shadow-yellow-500/10"
              : "bg-white/5 text-white/20 border border-white/5"
          }`}
        >
          {uploading ? (
             <div className="flex items-center justify-center gap-3">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-black border-t-transparent rounded-full" />
                <span>Uploading...</span>
             </div>
          ) : (
            photos.length > 0 ? `Showcase ${photos.length} Masterpiece${photos.length !== 1 ? "s" : ""}` : "Skip for now"
          )}
        </motion.button>
      </div>

    </ChefStepContainer>
  );
}
