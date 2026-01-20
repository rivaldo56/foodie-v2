'use client';

import { useState } from 'react';
import { Sparkles, ChefHat, Calendar, Star, ArrowRight } from 'lucide-react';
import RotatingCarousel from '@/components/RotatingCarousel';
import Link from 'next/link';

export default function LandingPage() {
  const [email, setEmail] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0b0908] via-[#1a1412] to-[#120b0b] text-white overflow-hidden">
      {/* Navigation */}
      <nav className="relative z-50 border-b border-white/5 bg-black/20 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ChefHat className="h-7 w-7 text-orange-500" />
            <span className="text-xl font-semibold">Foodie</span>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/auth" 
              className="text-sm text-white/70 hover:text-white transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div className="space-y-8">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-orange-400 backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Exclusive Culinary Experiences
              </div>

              {/* Headline */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight">
                  Private Chef
                  <br />
                  <span className="bg-gradient-to-r from-orange-400 via-orange-500 to-amber-500 bg-clip-text text-transparent">
                    Experiences
                  </span>
                  <br />
                  Delivered
                </h1>
                <p className="text-lg text-white/70 max-w-xl leading-relaxed">
                  Discover world-class chefs ready to create unforgettable dining moments in the comfort of your home. From intimate dinners to grand celebrations.
                </p>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {[
                  { icon: ChefHat, label: 'Curated Chefs', desc: 'Handpicked professionals' },
                  { icon: Calendar, label: 'Easy Booking', desc: 'Reserve in minutes' },
                  { icon: Star, label: 'Premium Quality', desc: '5-star experiences' },
                  { icon: Sparkles, label: 'Personalized', desc: 'Tailored to your taste' },
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-sm transition hover:border-orange-500/20 hover:bg-white/10"
                  >
                    <div className="rounded-lg bg-orange-500/10 p-2">
                      <feature.icon className="h-5 w-5 text-orange-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{feature.label}</p>
                      <p className="text-xs text-white/60">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:shadow-xl hover:shadow-orange-500/40 hover:scale-[1.02]"
                >
                  Book Your Chef
                  <ArrowRight className="h-5 w-5" />
                </Link>
                <Link
                  href="/chefs"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold backdrop-blur-sm transition hover:bg-white/10 hover:border-white/30"
                >
                  Browse Chefs
                </Link>
              </div>

              {/* Social Proof */}
              <div className="flex items-center gap-6 pt-4 text-sm text-white/60">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-10 w-10 rounded-full border-2 border-[#1a1412] bg-gradient-to-br from-orange-400 to-orange-600"
                    />
                  ))}
                </div>
                <p>
                  <span className="font-semibold text-white">2,500+</span> amazing experiences delivered
                </p>
              </div>
            </div>

            {/* Right: Rotating Carousel */}
            <div className="relative">
              <RotatingCarousel />
              
              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 h-72 w-72 rounded-full bg-orange-500/20 blur-[120px] pointer-events-none" />
              <div className="absolute -bottom-10 -left-10 h-64 w-64 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative border-t border-white/5 bg-black/20 backdrop-blur-xl py-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid sm:grid-cols-3 gap-8 text-center">
            {[
              { value: '150+', label: 'Expert Chefs' },
              { value: '2,500+', label: 'Bookings Completed' },
              { value: '4.9/5', label: 'Average Rating' },
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <p className="text-4xl font-bold bg-gradient-to-r from-orange-400 to-amber-500 bg-clip-text text-transparent">
                  {stat.value}
                </p>
                <p className="text-sm text-white/60">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative border-t border-white/5 py-8 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-white/50">
            <p>© 2026 Foodie. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="hover:text-white transition">Privacy</Link>
              <Link href="/terms" className="hover:text-white transition">Terms</Link>
              <Link href="/contact" className="hover:text-white transition">Contact</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
