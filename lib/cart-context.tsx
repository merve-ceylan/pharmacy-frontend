'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { cartApi } from './api';
import { Cart } from '@/types';

interface CartContextType {
    cart: Cart | null;
    loading: boolean;
    cartCount: number;
    addToCart: (productId: number, quantity: number) => Promise<void>;
    updateQuantity: (itemId: number, quantity: number) => Promise<void>;
    removeItem: (itemId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(false);

    const cartCount = cart?.itemCount || 0;

    useEffect(() => {
        const token = localStorage.getItem('accessToken');
        if (token) {
            refreshCart();
        }
    }, []);

    const refreshCart = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) return;

        setLoading(true);
        try {
            const response = await cartApi.get(1);
            setCart(response.data || response);
        } catch (err) {
            console.error('Sepet yüklenemedi');
        } finally {
            setLoading(false);
        }
    };

    const addToCart = async (productId: number, quantity: number) => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            throw new Error('Giriş yapmalısınız');
        }

        const response = await cartApi.addItem(1, productId, quantity);
        setCart(response.data || response);
    };

    const updateQuantity = async (itemId: number, quantity: number) => {
        const response = await cartApi.updateItem(1, itemId, quantity);
        setCart(response.data || response);
    };

    const removeItem = async (itemId: number) => {
        const response = await cartApi.removeItem(1, itemId);
        setCart(response.data || response);
    };

    const clearCart = async () => {
        await cartApi.clear(1);
        setCart(null);
    };

    return (
        <CartContext.Provider
            value={{
                cart,
                loading,
                cartCount,
                addToCart,
                updateQuantity,
                removeItem,
                clearCart,
                refreshCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}