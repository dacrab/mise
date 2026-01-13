import { useState, useCallback } from 'react';
import { config, type AvatarSize } from './config';

// Hooks
export function useOptimisticToggle(initial: boolean, onToggle: () => Promise<{ error?: unknown }>) {
  const [state, setState] = useState(initial);

  const toggle = useCallback(async () => {
    const prev = state;
    setState(!prev);
    const { error } = await onToggle();
    if (error) setState(prev);
    return { error, reverted: !!error };
  }, [state, onToggle]);

  return [state, toggle] as const;
}

export function useOptimisticCounter(initialValue: number, initialActive: boolean, onToggle: () => Promise<{ error?: unknown }>) {
  const [count, setCount] = useState(initialValue);
  const [active, setActive] = useState(initialActive);

  const toggle = useCallback(async () => {
    const prevCount = count;
    const prevActive = active;
    setActive(!prevActive);
    setCount(prevActive ? prevCount - 1 : prevCount + 1);

    const { error } = await onToggle();
    if (error) {
      setActive(prevActive);
      setCount(prevCount);
    }
    return { error };
  }, [count, active, onToggle]);

  return { count, active, toggle };
}

// Icons
export const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

export const HeartIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
  </svg>
);

export const BookmarkIcon = ({ filled = false }: { filled?: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
    <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
  </svg>
);

export const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
  </svg>
);

export const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
    <path d="M5 12h14"/><path d="M12 5v14"/>
  </svg>
);

export const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
  </svg>
);

// UI Components
export const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="text-xs font-bold uppercase tracking-wider text-gray-500 ml-1">{children}</label>
);

export const SectionHeader = ({ step, title }: { step: number; title: string }) => (
  <h2 className="text-xl font-bold font-serif flex items-center gap-3">
    <span className="w-8 h-8 rounded-full bg-brand-accent text-brand-primary flex items-center justify-center text-sm">{step}</span>
    {title}
  </h2>
);

export const Divider = ({ text }: { text: string }) => (
  <div className="relative py-4">
    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-100" /></div>
    <div className="relative flex justify-center text-xs uppercase">
      <span className="bg-white px-4 text-gray-400 font-medium tracking-widest">{text}</span>
    </div>
  </div>
);

export const Avatar = ({ src, name, size = 'md' }: { src?: string | null; name?: string | null; size?: AvatarSize }) => {
  const sizes = config.avatar;
  if (src) return <img src={src} alt={name || 'User'} className={`${sizes[size]} rounded-full object-cover`} />;
  return <div className={`${sizes[size]} rounded-full bg-brand-accent flex items-center justify-center font-bold text-brand-primary`}>{(name || 'U')[0]}</div>;
};
