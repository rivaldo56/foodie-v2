'use client';

import { ArrowRight, TrendingUp, Users, ShieldCheck, Sprout, Store, ChevronRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BusinessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1a0f0f] via-[#1b1814] to-[#0f0c0a] text-white">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-24 lg:py-32">
                <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_top_left,rgba(255,158,90,0.4),transparent_55%)]" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-accent">
                                <Sparkles className="h-4 w-4" />
                                Foodie for Business
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-5xl lg:text-7xl font-semibold tracking-tight mb-6 leading-tight"
                        >
                            Grow your business with <span className="text-accent">Foodie</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="text-lg lg:text-xl text-white/70 mb-10 leading-relaxed max-w-2xl"
                        >
                            Connect directly with top chefs, streamline your logistics, and access a premium market for your high-quality produce.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap gap-4"
                        >
                            <Link
                                href="/register?type=farmer"
                                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-semibold text-white shadow-glow transition hover:bg-accent-strong active:scale-[0.98]"
                            >
                                Join as a Farmer <ArrowRight className="h-5 w-5" />
                            </Link>
                            <Link
                                href="/register?type=business"
                                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-8 py-4 text-base font-semibold text-white/80 backdrop-blur transition hover:border-white/40 active:scale-[0.98]"
                            >
                                Join as a Supplier
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Value Props */}
            <section className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: TrendingUp,
                                title: 'Fair Market Prices',
                                desc: 'Cut out the middlemen. Set your own prices and get paid directly for the quality you provide.',
                                color: 'text-green-400',
                                bg: 'bg-green-500/10'
                            },
                            {
                                icon: Users,
                                title: 'Direct Chef Access',
                                desc: 'Build relationships with professional chefs who value consistency and quality ingredients.',
                                color: 'text-blue-400',
                                bg: 'bg-blue-500/10'
                            },
                            {
                                icon: ShieldCheck,
                                title: 'Guaranteed Payments',
                                desc: 'Secure, timely payments for every order. No more chasing invoices or delayed settlements.',
                                color: 'text-purple-400',
                                bg: 'bg-purple-500/10'
                            }
                        ].map((item, i) => (
                            <div key={i} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur transition hover:border-accent/40 hover:bg-white/10">
                                <div className={`h-14 w-14 rounded-2xl ${item.bg} flex items-center justify-center ${item.color} mb-6`}>
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
                                <p className="text-white/60 leading-relaxed">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* For Farmers */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute right-0 top-1/4 h-96 w-96 rounded-full bg-green-500/10 blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-green-400 mb-6">
                                <Sprout className="h-4 w-4" />
                                For Farmers
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-semibold mb-6">Your farm, your rules.</h2>
                            <p className="text-lg text-white/70 mb-8 leading-relaxed">
                                Foodie gives you the tools to manage your harvest, track inventory, and forecast demand based on real chef needs.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {['Inventory Management Dashboard', 'Real-time Order Notifications', 'Performance Analytics', 'Logistics Support'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/80">
                                        <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register?type=farmer" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-strong transition group">
                                Start selling today <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                        <div className="relative h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur shadow-2xl">
                            <div className="absolute inset-0 flex items-center justify-center text-white/10">
                                <Sprout className="h-32 w-32" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                        </div>
                    </div>
                </div>
            </section>

            {/* For Small Businesses */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute left-0 top-1/4 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <div className="order-2 lg:order-1 relative h-[500px] rounded-[2.5rem] overflow-hidden border border-white/10 bg-white/5 backdrop-blur shadow-2xl">
                            <div className="absolute inset-0 flex items-center justify-center text-white/10">
                                <Store className="h-32 w-32" />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent" />
                        </div>
                        <div className="order-1 lg:order-2">
                            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-blue-400 mb-6">
                                <Store className="h-4 w-4" />
                                For Suppliers
                            </span>
                            <h2 className="text-4xl lg:text-5xl font-semibold mb-6">Scale your distribution.</h2>
                            <p className="text-lg text-white/70 mb-8 leading-relaxed">
                                Whether you sell artisanal cheese, rare spices, or premium meats, Foodie connects you with the chefs who appreciate your craft.
                            </p>
                            <ul className="space-y-4 mb-10">
                                {['Bulk Order Management', 'Automated Invoicing', 'Brand Storytelling', 'Quality Verification Badge'].map((item, i) => (
                                    <li key={i} className="flex items-center gap-3 text-white/80">
                                        <div className="h-6 w-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0 text-accent">
                                            <ChevronRight className="h-4 w-4" />
                                        </div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register?type=business" className="inline-flex items-center gap-2 text-accent font-semibold hover:text-accent-strong transition group">
                                Become a partner <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-32 relative">
                <div className="absolute inset-0 bg-accent/5" />
                <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
                    <h2 className="text-4xl lg:text-5xl font-semibold mb-6">Ready to grow?</h2>
                    <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto">
                        Join thousands of farmers and suppliers powering the next generation of culinary experiences.
                    </p>
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-base font-bold text-black shadow-glow transition hover:bg-gray-100 active:scale-[0.98]"
                    >
                        Get Started Now <ArrowRight className="h-5 w-5" />
                    </Link>
                </div>
            </section>
        </div>
    );
}
