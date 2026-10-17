'use client';

import React, { useEffect, useState } from 'react';
import { useStore } from '@/context/StoreContext';

export default function Toast() {
  const { toast } = useStore();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!toast) return;
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 2600);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  return (
    <div className={`toast ${visible ? 'show' : ''}`} role="status" aria-live="polite">
      {toast.emoji} {toast.message}
    </div>
  );
}
