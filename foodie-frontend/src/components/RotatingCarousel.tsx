'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

const DISHES = [
  { id: 1, src: '/carousel/dish-1.png', alt: 'Seared Wagyu Steak' },
  { id: 2, src: '/carousel/dish-2.png', alt: 'Handmade Pasta with Burrata' },
  { id: 3, src: '/carousel/dish-3.png', alt: 'Grilled Salmon with Citrus' },
  { id: 4, src: '/carousel/dish-4.png', alt: 'Artisan Charcuterie' },
  { id: 5, src: '/carousel/dish-5.png', alt: 'Molten Chocolate Fondant' },
  { id: 6, src: '/carousel/dish-6.png', alt: 'Premium Sushi Platter' },
];

const FLOATING_ELEMENTS = [
  { id: 1, content: '🌿', x: 15, y: 20, duration: 12 },
  { id: 2, content: '•', x: 75, y: 35, duration: 8 },
  { id: 3, content: '🌿', x: 25, y: 70, duration: 10 },
  { id: 4, content: '✨', x: 85, y: 60, duration: 14 },
  { id: 5, content: '•', x: 45, y: 15, duration: 9 },
  { id: 6, content: '🍃', x: 65, y: 80, duration: 11 },
];

export default function RotatingCarousel() {
  const [rotation, setRotation] = useState(0);
  const totalDishes = DISHES.length;
  const angleStep = 360 / totalDishes;

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.3) % 360);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  const getPlateStyle = (index: number) => {
    const angle = (index * angleStep + rotation) % 360;
    const angleRad = (angle * Math.PI) / 180;
    
    // Calculate position on circular orbit
    const radius = 180;
    const x = Math.sin(angleRad) * radius;
    const z = Math.cos(angleRad) * radius - radius;
    
    // Depth calculation (0 = back, 1 = front)
    const depth = (Math.cos(angleRad) + 1) / 2;
    
    // Scale based on depth (70% at back, 100% at front)
    const scale = 0.7 + (depth * 0.3);
    
    // Opacity based on depth (30% at back, 100% at front)
    const opacity = 0.3 + (depth * 0.7);
    
    // Blur based on depth (8px at back, 0px at front)
    const blur = (1 - depth) * 8;
    
    // Brightness for atmospheric effect (darker at back)
    const brightness = 0.6 + (depth * 0.4);
    
    // Z-index to ensure proper layering
    const zIndex = Math.floor(depth * 100);

    return {
      transform: `translate3d(${x}px, 0, ${z}px) scale(${scale})`,
      opacity,
      filter: `blur(${blur}px) brightness(${brightness})`,
      zIndex,
      transition: 'filter 0.3s ease-out, opacity 0.3s ease-out',
    };
  };

  return (
    <div className="relative w-full h-full min-h-[500px] overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0908] via-[#1a1412] to-[#120b0b] border border-orange-500/20 shadow-[0_0_60px_rgba(251,146,60,0.15)]">
      {/* Atmospheric overlay */}
      <div className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/60 pointer-events-none" />
      
      {/* Warm glow effect */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-gradient-to-b from-orange-900/10 to-transparent pointer-events-none blur-3xl" />
      
      {/* Floating elements with parallax */}
      <div className="absolute inset-0 pointer-events-none">
        {FLOATING_ELEMENTS.map((elem) => (
          <div
            key={elem.id}
            className="absolute text-orange-200/20"
            style={{
              left: `${elem.x}%`,
              top: `${elem.y}%`,
              animation: `float-parallax ${elem.duration}s ease-in-out infinite`,
              animationDelay: `${elem.id * 0.5}s`,
            }}
          >
            {elem.content}
          </div>
        ))}
      </div>

      {/* 3D Carousel Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div 
          className="relative w-full h-full flex items-center justify-center"
          style={{
            perspective: '1200px',
            perspectiveOrigin: '50% 50%',
          }}
        >
          <div className="relative w-[320px] h-[320px]" style={{ transformStyle: 'preserve-3d' }}>
            {DISHES.map((dish, index) => (
              <div
                key={dish.id}
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  ...getPlateStyle(index),
                  transformStyle: 'preserve-3d',
                }}
              >
                <div className="relative w-64 h-64 rounded-full shadow-2xl">
                  {/* Warm rim lighting effect */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400/30 via-transparent to-transparent pointer-events-none" />
                  
                  <Image
                    src={dish.src}
                    alt={dish.alt}
                    fill
                    className="object-cover rounded-full"
                    sizes="256px"
                    priority={index === 0}
                  />
                  
                  {/* Candlelight glow on front plates */}
                  <div 
                    className="absolute inset-0 rounded-full pointer-events-none"
                    style={{
                      background: 'radial-gradient(circle at 30% 30%, rgba(251,146,60,0.15) 0%, transparent 60%)',
                      mixBlendMode: 'screen',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom shadow vignette */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />
      
      <style jsx>{`
        @keyframes float-parallax {
          0%, 100% {
            transform: translateY(0) translateX(0) rotate(0deg);
          }
          25% {
            transform: translateY(-15px) translateX(10px) rotate(5deg);
          }
          50% {
            transform: translateY(-8px) translateX(-5px) rotate(-3deg);
          }
          75% {
            transform: translateY(-20px) translateX(8px) rotate(4deg);
          }
        }
      `}</style>
    </div>
  );
}
