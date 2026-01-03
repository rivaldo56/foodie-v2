"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck } from "lucide-react";

interface AccordionItemProps {
    title: string;
    content: string;
    isOpen: boolean;
    onClick: () => void;
}

const AccordionItem = ({ title, content, isOpen, onClick }: AccordionItemProps) => {
    return (
        <div
            className={`border rounded-2xl overflow-hidden mb-4 transition-all duration-300 ${isOpen ? 'bg-surface-elevated border-accent/20' : 'bg-surface border-surface-stroke'}`}
        >
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
            >
                <span className={`text-lg font-medium transition-colors ${isOpen ? "text-accent" : "text-white"}`}>
                    {title}
                </span>
                <ChevronDown
                    className={`w-5 h-5 text-muted transition-transform duration-300 ${isOpen ? "rotate-180 text-accent" : ""}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className="px-6 pb-6 text-muted-foreground leading-relaxed border-t border-surface-stroke pt-4 mt-[-10px]">
                            {content}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const SECTIONS = [
    {
        title: "Respectful Communication",
        content: "Diners agree to treat chefs and their staff with respect. Harassment, discrimination, or abusive behavior will not be tolerated. We foster a community of mutual appreciation."
    },
    {
        title: "Secure Payments",
        content: "All payments are processed securely through Foodie. Full payment is required to confirm bookings. We hold funds until the service is complete to ensure fairness for both parties."
    },
    {
        title: "Fair Bookings & Cancellations",
        content: "Cancellations made 48 hours prior to the event are fully refundable. Late cancellations may incur a fee to compensate the chef for reserved time and ingredient preparation."
    },
    {
        title: "Chef Standards",
        content: "Chefs commit to professional standards, food safety compliance, reliability, and quality service. Every dish should reflect the passion and skill advertised on their profile."
    },
    {
        title: "Liability & Safety",
        content: "Foodie connects independent chefs with customers. While we vet chefs, dining experiences happen in private homes. Users are responsible for a safe environment."
    }
];

export default function TermsPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <section className="pt-32 pb-16 px-6 max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-surface-highlight text-accent mb-6">
                        <ShieldCheck size={24} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Trust Makes <span className="text-accent">Everything Work</span>
                    </h1>
                    <div className="max-w-2xl mx-auto space-y-4 text-muted-foreground">
                        <p>
                            Our terms exist to protect diners, chefs, and the platform. Foodie connects independent chefs with customers and clarity keeps experiences smooth.
                        </p>
                        <p className="text-sm">
                            Terms may evolve as we grow. Using Foodie means you accept the latest version.
                        </p>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    {SECTIONS.map((section, index) => (
                        <AccordionItem
                            key={index}
                            title={section.title}
                            content={section.content}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </motion.div>

                <div className="mt-12 text-center text-sm text-muted">
                    <p>Simple language. No intimidation. If unsure, <a href="#" className="underline text-accent hover:text-white transition-colors">reach out</a>.</p>
                </div>
            </section>
        </div>
    );
}
