'use client';

import { Edit, MapPin, Phone, Mail, Globe, ShieldCheck } from 'lucide-react';

export default function BusinessProfilePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">Business Profile</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-white/10 rounded-xl hover:bg-white/5 transition text-sm">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </button>
            </div>

            <div className="bg-surface-elevated rounded-3xl border border-white/10 overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-900 to-blue-600 relative">
                    <div className="absolute -bottom-12 left-6">
                        <div className="h-24 w-24 rounded-2xl bg-surface border-4 border-surface shadow-xl flex items-center justify-center text-3xl font-bold text-white">
                            S
                        </div>
                    </div>
                </div>
                <div className="pt-16 pb-8 px-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                Supplier Name
                                <ShieldCheck className="h-5 w-5 text-blue-400" />
                            </h2>
                            <p className="text-white/60">Premium Food Supplier</p>
                        </div>
                        <div className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-sm font-medium">
                            Verified Supplier
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">Contact Info</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-white/80">
                                    <MapPin className="h-5 w-5 text-white/40" />
                                    <span>Nairobi, Kenya</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/80">
                                    <Phone className="h-5 w-5 text-white/40" />
                                    <span>+254 700 000 000</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/80">
                                    <Mail className="h-5 w-5 text-white/40" />
                                    <span>supplier@example.com</span>
                                </div>
                                <div className="flex items-center gap-3 text-white/80">
                                    <Globe className="h-5 w-5 text-white/40" />
                                    <span>www.supplier.com</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-white/40 uppercase tracking-wider">About</h3>
                            <p className="text-white/70 leading-relaxed">
                                We provide high-quality ingredients to the best chefs in the city. Specialized in organic produce and imported delicacies.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
