'use client';

import { create } from 'zustand';
import type { LeaveTypeConfig } from '@/types/leave';
import { leaveTypesSeed } from '@/mock/leave-type';

const STORAGE_KEY = 'leaveTypesStore.v1';

// tiny id generator without deps
const genId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
  ? crypto.randomUUID()
  : `lt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export type LeaveTypesState = {
  items: LeaveTypeConfig[];
  hydrate: () => void;
  add: (payload: Omit<LeaveTypeConfig, 'id' | 'createdAt' | 'updatedAt'>) => LeaveTypeConfig;
  update: (id: string, patch: Partial<LeaveTypeConfig>) => void;
  remove: (id: string) => void;
  getById: (id: string) => LeaveTypeConfig | undefined;
};

export const useLeaveTypesStore = create<LeaveTypesState>((set, get) => ({
  items: [],
  hydrate: () => {
    if (typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as LeaveTypeConfig[];
        set({ items: parsed });
      } else {
        set({ items: leaveTypesSeed });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(leaveTypesSeed));
      }
    } catch (e) {
      console.error('hydrate error', e);
      set({ items: leaveTypesSeed });
    }
  },
  add: (payload) => {
    const now = new Date().toISOString();
    const newItem: LeaveTypeConfig = { id: genId(), createdAt: now, updatedAt: now, ...payload };
    const items = [newItem, ...get().items];
    set({ items });
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    return newItem;
  },
  update: (id, patch) => {
    const items = get().items.map((it) =>
      it.id === id ? { ...it, ...patch, updatedAt: new Date().toISOString() } : it
    );
    set({ items });
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
  remove: (id) => {
    const items = get().items.filter((it) => it.id !== id);
    set({ items });
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
  getById: (id) => get().items.find((it) => it.id === id),
}));