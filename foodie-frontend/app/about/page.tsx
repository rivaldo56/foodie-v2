"use client";

import { motion } from "framer-motion";
import { ArrowRight, UtensilsCrossed, ChefHat } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 sm:px-12 md:px-20 lg:px-32 overflow-hidden">
                {/* Subtle Ambient Background */}
                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-10 bg-[radial-gradient(circle_at_50%_0%,var(--accent),transparent_70%)]" />

                <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-surface border border-surface-stroke text-accent text-sm font-medium tracking-wide mb-6">
                            <UtensilsCrossed size={14} />
                            <span>THE VISION</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white leading-[1.1]">
                            Built For Dreamers <br /> <span className="text-accent italic">Who Cook</span>
                        </h1>
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-3xl mx-auto px-6 text-lg md:text-xl leading-relaxed text-muted-foreground space-y-12">
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                >
                    <span className="text-white font-medium">Foodie wasn’t born in a boardroom.</span> It grew from kitchens where dreams were cooking quietly. We saw incredible chefs hustling for inconsistent jobs, underpaid in restaurants, and underestimated everywhere else. At the same time, people wanted dining experiences that felt personal, intimate, and unforgettable.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                >
                    So we built Foodie as more than a booking app. It’s a runway. Young chefs finally earn fairly, choose their schedules, and build real portfolios with real clients. <span className="text-accent font-medium">Freedom. Confidence. Exposure.</span> Diners get curated menus, storytelling on plates, and unforgettable evenings at home.
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.4 }}
                >
                    Our dream is simple but bold: turn culinary talent into opportunity. A world where cooking funds futures, builds independence, and lifts communities. The future is plated.
                </motion.p>

                {/* Hero Illustration / Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="my-16 relative rounded-3xl overflow-hidden aspect-video bg-surface-elevated border border-surface-stroke hover-glow group transition-all"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-surface to-surface-elevated flex items-center justify-center">
                        <div className="text-center p-8">
                            <div className="w-20 h-20 rounded-full bg-surface-highlight flex items-center justify-center mx-auto mb-6 text-accent">
                                <ChefHat className="w-10 h-10" />
                            </div>
                            <p className="text-sm text-muted uppercase tracking-widest font-semibold">Intimate Dining Experience</p>
                        </div>
                    </div>
                </motion.div>

                {/* CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.6 }}
                    className="flex justify-center pt-8"
                >
                    <Link href="/discover">
                        <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-accent text-white hover:bg-accent-strong shadow-glow">
                            Explore Chefs
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
