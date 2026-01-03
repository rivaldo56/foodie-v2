"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, HelpCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

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

const FAQS = [
    {
        title: "How does Foodie actually work?",
        content: "Foodie connects you with professional independent chefs in your area. You browse chefs, view their menus, and book them for private dining experiences at your home. We handle the payments, scheduling, and trust—so you can focus on the food."
    },
    {
        title: "Are the chefs verified?",
        content: "Yes. Every chef on Foodie undergoes a vetting process which includes identity verification, portfolio reviews, and safety checks. We prioritize quality and reliability to ensure you have a safe and exceptional experience."
    },
    {
        title: "What if I have allergies or diet preferences?",
        content: "Communication is key. You can message any chef before booking to discuss dietary restrictions. Most chefs are happy to customize menus for gluten-free, vegan, or allergy-specific needs."
    },
    {
        title: "Is Foodie expensive?",
        content: "We offer a range of options suitable for different budgets, from casual family meals to high-end tasting menus. Prices are transparently set by the chefs themselves, so you always know what you're paying for."
    },
    {
        title: "Can chefs join the platform?",
        content: "Absolutely. We built Foodie to empower culinary talent. If you're a chef looking to build your brand and cook on your own terms, you can apply directly through our 'Careers' page or the 'For Chefs' portal."
    }
];

export default function FAQPage() {
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
                        <HelpCircle size={24} />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
                        Frequently Asked <span className="text-accent">Questions</span>
                    </h1>
                    <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
                        Everything you need to know about booking verification, pricing, and the Foodie experience.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-4"
                >
                    {FAQS.map((faq, index) => (
                        <AccordionItem
                            key={index}
                            title={faq.title}
                            content={faq.content}
                            isOpen={openIndex === index}
                            onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        />
                    ))}
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-20 text-center bg-surface-elevated rounded-3xl p-8 border border-surface-stroke max-w-2xl mx-auto"
                >
                    <h3 className="text-xl font-semibold text-white mb-2">Still need help?</h3>
                    <p className="text-muted mb-6">Our support team is available 24/7 to assist you.</p>
                    <Link href="/support">
                        <Button className="rounded-full px-6 bg-surface border border-surface-stroke hover:bg-surface-highlight hover:text-accent hover:border-accent text-white transition-all">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Contact Support
                        </Button>
                    </Link>
                </motion.div>
            </section>
        </div>
    );
}
