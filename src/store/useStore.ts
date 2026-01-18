import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '@/lib/api';

interface User {
  username: string;
  auth: string;
  avatar: string;
}

type ChatStatus = 'idle' | 'searching' | 'connected' | 'disconnected';

interface ChatState {
  // Auth
  user: User | null;
  authToken: string | null;
  isAuthenticated: boolean;
  
  // Chat
  chatStatus: ChatStatus;
  messages: Message[];
  partnerName: string | null;
  partnerIdentifier: string | null;
  messageshash: string | null;
  notifierHash: string | null;
  newMessagesT: number | null;
  
  // Actions
  setUser: (user: User, authToken: string) => void;
  logout: () => void;
  setChatStatus: (status: ChatStatus) => void;
  setPartner: (name: string, identifier: string) => void;
  addMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  updatePollState: (hash: string, notifierHash?: string, newMessagesT?: number) => void;
  resetChat: () => void;
}

export const useStore = create<ChatState>()(
  persist(
    (set) => ({
      // Initial state
      user: null,
      authToken: null,
      isAuthenticated: false,
      chatStatus: 'idle',
      messages: [],
      partnerName: null,
      partnerIdentifier: null,
      messageshash: null,
      notifierHash: null,
      newMessagesT: null,
      
      // Actions
      setUser: (user, authToken) => set({
        user,
        authToken,
        isAuthenticated: true,
      }),
      
      logout: () => set({
        user: null,
        authToken: null,
        isAuthenticated: false,
        chatStatus: 'idle',
        messages: [],
        partnerName: null,
        partnerIdentifier: null,
      }),
      
      setChatStatus: (status) => set({ chatStatus: status }),
      
      setPartner: (name, identifier) => set({
        partnerName: name,
        partnerIdentifier: identifier,
        chatStatus: 'connected',
      }),
      
      addMessages: (newMessages) => set((state) => {
        // Filter duplicates based on time and message content
        const existingKeys = new Set(
          state.messages.map((m) => `${m.time}-${m.message}`)
        );
        const uniqueNew = newMessages.filter(
          (m) => !existingKeys.has(`${m.time}-${m.message}`)
        );
        return { messages: [...state.messages, ...uniqueNew] };
      }),
      
      clearMessages: () => set({ messages: [] }),
      
      updatePollState: (hash, notifierHash, newMessagesT) => set({
        messageshash: hash,
        notifierHash,
        newMessagesT,
      }),
      
      resetChat: () => set({
        chatStatus: 'idle',
        messages: [],
        partnerName: null,
        partnerIdentifier: null,
        messageshash: null,
        notifierHash: null,
        newMessagesT: null,
      }),
    }),
    {
      name: 'chatiefy-storage',
      partialize: (state) => ({
        user: state.user,
        authToken: state.authToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
