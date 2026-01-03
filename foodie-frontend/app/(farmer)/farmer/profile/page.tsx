'use client';

import { User, MapPin, Phone, Mail, Edit } from 'lucide-react';

export default function FarmerProfilePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-white">My Profile</h1>
                <button className="flex items-center gap-2 px-4 py-2 bg-surface-elevated border border-white/10 rounded-xl hover:bg-white/5 transition text-sm">
                    <Edit className="h-4 w-4" />
                    Edit Profile
                </button>
            </div>

            <div className="bg-surface-elevated rounded-2xl border border-white/5 p-6 space-y-6">
                <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-green-500/20 flex items-center justify-center text-green-500">
                        <User className="h-10 w-10" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold text-white">Green Valley Farm</h2>
                        <p className="text-muted">Verified Farmer</p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 bg-surface rounded-xl border border-white/5 flex items-center gap-3">
                        <MapPin className="h-5 w-5 text-muted" />
                        <div>
                            <p className="text-xs text-muted">Location</p>
                            <p className="text-white">Kiambu, Kenya</p>
                        </div>
                    </div>
                    <div className="p-4 bg-surface rounded-xl border border-white/5 flex items-center gap-3">
                        <Phone className="h-5 w-5 text-muted" />
                        <div>
                            <p className="text-xs text-muted">Phone</p>
                            <p className="text-white">+254 712 345 678</p>
                        </div>
                    </div>
                    <div className="p-4 bg-surface rounded-xl border border-white/5 flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted" />
                        <div>
                            <p className="text-xs text-muted">Email</p>
                            <p className="text-white">farmer@greenvalley.com</p>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-medium text-muted mb-2">Bio</h3>
                    <p className="text-white text-sm leading-relaxed">
                        We are dedicated to providing the freshest organic produce to local chefs and families.
                        Our farm follows sustainable practices to ensure quality and environmental care.
                    </p>
                </div>
            </div>
        </div>
    );
}
