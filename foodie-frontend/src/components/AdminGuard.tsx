'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getCurrentUser } from '@/services/auth.service';
import type { ReactNode } from 'react';

export function AdminGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'allowed' | 'forbidden'>('loading');

  useEffect(() => {
    let mounted = true;

    async function checkUser() {
      try {
        console.log('[AdminGuard] Checking session via Django API...');
        const { data, error, status: apiStatus } = await getCurrentUser();
        
        if (!mounted) return;

        if (error || !data || apiStatus !== 200) {
            console.log('[AdminGuard] No valid session or error', { error, apiStatus });
            setStatus('forbidden');
            return;
        }

        const role = data.role;
        
        console.log('[AdminGuard] User found:', { 
            userId: data.id, 
            role,
        });

        if (role === 'admin') {
           setStatus('allowed');
        } else {
           console.warn('[AdminGuard] Access denied', { role });
           setStatus('forbidden');
        }
      } catch (err) {
        console.error('[AdminGuard] Unexpected error:', err);
        if (mounted) setStatus('forbidden');
      }
    }

    checkUser();

    return () => {
      mounted = false;
    };
  }, []);

  // Separate effect for redirection to avoid blocking the main logic
  useEffect(() => {
    if (status === 'forbidden') {
        const timer = setTimeout(() => {
             router.replace('/auth/login');
        }, 100); 
        return () => clearTimeout(timer);
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0f1012]">
        <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-[#ff7642]" />
            <p className="text-sm text-[#9ca3af] animate-pulse">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (status === 'forbidden') {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-[#0f1012]">
            <div className="flex flex-col items-center gap-4">
                <p className="text-[#ff7642] font-semibold">Access Denied</p>
                <p className="text-sm text-[#9ca3af]">Redirecting to login...</p>
            </div>
        </div>
    );
  }

  return <>{children}</>;
}
