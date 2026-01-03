"use client";

import { motion } from "framer-motion";
import { ArrowUpRight, Code2, PenTool, TrendingUp, Users } from "lucide-react";

const POSITIONS = [
    {
        department: "Engineering",
        title: "Full Stack Engineer",
        type: "Remote",
        icon: Code2
    },
    {
        department: "Engineering",
        title: "Backend Engineer",
        type: "Remote",
        icon: Code2
    },
    {
        department: "Design",
        title: "Product Designer",
        type: "Remote / Hybrid",
        icon: PenTool
    }
];

export default function CareersPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 sm:px-12 md:px-20 text-center overflow-hidden">
                {/* Ambient background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-8">
                        Build The Future <br /> <span className="text-accent">Of Dining</span>
                    </h1>
                    <div className="max-w-2xl mx-auto space-y-6 text-lg md:text-xl text-muted-foreground leading-relaxed">
                        <p>
                            We’re designing an ecosystem where food, tech, and opportunity work together. Impact matters. Craft matters. People matter.
                        </p>
                        <p>
                            Our culture empowers builders. Real ownership, honest feedback, playful curiosity, and room to experiment responsibly. You’ll ship meaningful work fast.
                        </p>
                    </div>
                </motion.div>
            </section>

            {/* Divider */}
            <div className="w-full max-w-7xl mx-auto h-px bg-surface-stroke my-12" />

            {/* Open Roles */}
            <section className="max-w-4xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="mb-12 text-center"
                >
                    <h2 className="text-2xl font-semibold text-white mb-4">Open Roles</h2>
                    <p className="text-muted">If you love solving human problems at scale, join us.</p>
                </motion.div>

                <div className="space-y-4">
                    {POSITIONS.map((role, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="group flex items-center justify-between p-6 rounded-2xl bg-surface hover:bg-surface-elevated border border-surface-stroke hover:border-accent/30 transition-all cursor-pointer"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-surface-highlight flex items-center justify-center text-accent">
                                    <role.icon size={20} />
                                </div>
                                <div>
                                    <h3 className="font-medium text-white group-hover:text-accent transition-colors">{role.title}</h3>
                                    <p className="text-sm text-muted">{role.department} · {role.type}</p>
                                </div>
                            </div>
                            <div className="text-muted-strong group-hover:translate-x-1 transition-transform group-hover:text-accent">
                                <ArrowUpRight size={20} />
                            </div>
                        </motion.div>
                    ))}
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-16 text-center"
                >
                    <button className="px-8 py-3 rounded-full bg-foreground text-background font-semibold hover:bg-white/90 transition-colors">
                        Apply Now
                    </button>
                    <p className="mt-4 text-sm text-muted">Remote-friendly, collaborative, and ambitious.</p>
                </motion.div>
            </section>
        </div>
    );
}
