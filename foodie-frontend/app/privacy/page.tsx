"use client";

import { motion } from "framer-motion";
import { Lock, Settings, FileText, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <section className="pt-32 pb-20 px-6 max-w-3xl mx-auto text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-surface-elevated border border-surface-stroke text-accent mb-8 shadow-glow"
                >
                    <Lock size={32} />
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-5xl md:text-6xl font-bold text-white mb-8"
                >
                    Your Data. <span className="text-accent">Respected.</span>
                </motion.h1>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6 text-lg text-muted-foreground leading-relaxed"
                >
                    <p>
                        We only collect what helps Foodie function safely: account details, bookings, payments, and performance insights. <span className="text-white font-medium">No surprise tracking.</span>
                    </p>
                    <p>
                        Data is encrypted, access-controlled, and reviewed regularly. Partners only receive what’s necessary to process payments, messaging, or analytics.
                    </p>
                    <p>
                        You control your data. Update, export, or delete your account any time. Privacy should feel clear and honest.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4"
                >
                    <Button variant="outline" className="rounded-full h-12 px-6 border-surface-stroke hover:border-accent hover:text-accent bg-surface">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Privacy Settings
                    </Button>
                    <Button variant="ghost" className="rounded-full h-12 px-6 text-muted hover:text-white hover:bg-transparent">
                        <FileText className="w-4 h-4 mr-2" />
                        Read Full Policy
                    </Button>
                </motion.div>
            </section>

            {/* Trust Grid */}
            <section className="max-w-5xl mx-auto px-6 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        {
                            icon: Lock,
                            title: "Bank-Grade Encryption",
                            desc: "All financial and personal data is encrypted at rest and in transit."
                        },
                        {
                            icon: Database,
                            title: "Minimal Retention",
                            desc: "We don't keep data longer than we need to. History is yours."
                        },
                        {
                            icon: Settings,
                            title: "Total Control",
                            desc: "Opt out of marketing, export your history, or go ghost mode anytime."
                        }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + (i * 0.1) }}
                            className="p-6 rounded-2xl bg-surface border border-surface-stroke text-center md:text-left hover:border-surface-highlight transition-colors"
                        >
                            <item.icon className="w-8 h-8 text-accent mb-4 mx-auto md:mx-0" />
                            <h3 className="text-white font-medium mb-2">{item.title}</h3>
                            <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
}
