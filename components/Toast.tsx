'use client';

import { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export default function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
    }[type];

    const icon = {
        success: '✓',
        error: '✗',
        info: 'ℹ',
    }[type];

    return (
        <div className={`fixed bottom-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-slide-up`}>
            <span className="text-xl">{icon}</span>
            <span>{message}</span>
            <button onClick={onClose} className="ml-2 hover:opacity-80">
                ✕
            </button>
        </div>
    );
}