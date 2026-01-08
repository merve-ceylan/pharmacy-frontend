'use client';

import { ToastProvider } from '@/contexts/ToastContext';
import { ReactNode } from 'react';

export default function Providers({ children }: { children: ReactNode }) {
    return (
        <ToastProvider>
            {children}
        </ToastProvider>
    );
}