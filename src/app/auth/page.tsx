'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from '@/context/StoreContext';

interface PopupModalState {
  isOpen: boolean;
  type: 'no_account' | 'account_exists' | 'invalid_password' | 'error';
  title: string;
  message: string;
  actionText?: string;
  onAction?: () => void;
}

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get('redirect') || '';
  const initialTab = searchParams.get('tab') === 'signup' ? 'signup' : 'signin';

  const { login, showToast, triggerHaptic } = useStore();
  const [tab, setTab] = useState<'signin' | 'signup'>(initialTab);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [popupModal, setPopupModal] = useState<PopupModalState | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchParams.get('tab') === 'signup') {
      setTab('signup');
    }
  }, [searchParams]);

  const handleSuccessfulAuth = (userData: { name: string; email: string }) => {
    login(userData);
    triggerHaptic('success');

    if (redirectParam === 'checkout') {
      showToast(`Welcome ${userData.name}! Resuming your checkout...`, '🛒');
      router.push('/?checkout=true');
    } else {
      showToast(`Welcome ${userData.name}!`, '👋');
      router.push('/');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      showToast('Please enter both email and password', '⚠️');
      triggerHaptic('warning');
      return;
    }

    setLoading(true);

    try {
      if (tab === 'signin') {
        // Sign In Request
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          handleSuccessfulAuth(data.data);
          return;
        }

        // Trigger error pop up modal
        triggerHaptic('error');

        if (data.code === 'USER_NOT_FOUND') {
          setPopupModal({
            isOpen: true,
            type: 'no_account',
            title: 'Account Not Found!',
            message: `No account exists with "${email.trim()}". You must sign up first before signing in!`,
            actionText: 'Sign Up Now →',
            onAction: () => {
              setPopupModal(null);
              setTab('signup');
              setTimeout(() => nameInputRef.current?.focus(), 150);
            },
          });
        } else if (data.code === 'INVALID_PASSWORD') {
          setPopupModal({
            isOpen: true,
            type: 'invalid_password',
            title: 'Incorrect Password',
            message: 'The password you entered is incorrect. Please verify your password and try again.',
            actionText: 'Try Again',
            onAction: () => {
              setPopupModal(null);
              setPassword('');
            },
          });
        } else {
          setPopupModal({
            isOpen: true,
            type: 'error',
            title: 'Sign In Failed',
            message: data.error || 'Failed to sign in. Please check your credentials.',
            actionText: 'Close',
            onAction: () => setPopupModal(null),
          });
        }
      } else {
        // Sign Up Request
        if (!name.trim()) {
          showToast('Please enter your full name', '⚠️');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim(),
            password,
          }),
        });

        const data = await res.json();

        if (res.ok && data.success) {
          showToast('Account created successfully! 🎉', '🌿');
          handleSuccessfulAuth(data.data);
          return;
        }

        triggerHaptic('error');

        if (data.code === 'USER_EXISTS') {
          setPopupModal({
            isOpen: true,
            type: 'account_exists',
            title: 'Account Already Exists!',
            message: `An account with "${email.trim()}" is already registered. Please sign in with your password.`,
            actionText: 'Switch to Sign In →',
            onAction: () => {
              setPopupModal(null);
              setTab('signin');
            },
          });
        } else {
          setPopupModal({
            isOpen: true,
            type: 'error',
            title: 'Registration Error',
            message: data.error || 'Failed to create account. Please try again.',
            actionText: 'Close',
            onAction: () => setPopupModal(null),
          });
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      showToast('Network error. Please try again.', '⚠️');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = (demoName: string, demoEmail: string) => {
    handleSuccessfulAuth({ name: demoName, email: demoEmail });
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--green-50)',
        padding: '24px',
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--glass-bg-sheet)',
          backdropFilter: 'blur(28px) saturate(190%)',
          WebkitBackdropFilter: 'blur(28px) saturate(190%)',
          borderRadius: 'var(--radius-xl)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          boxShadow: '0 24px 70px rgba(0, 0, 0, 0.1)',
          padding: '36px',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <span style={{ fontSize: '2rem' }}>🌿</span>
            <span style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--green-700)' }}>
              FreshMart
            </span>
          </Link>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {tab === 'signin' ? 'Welcome Back!' : 'Create Your Account'}
          </h2>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {redirectParam === 'checkout' ? (
              <span style={{ color: 'var(--primary)', fontWeight: 600 }}>
                🛒 Sign in or register to complete your order
              </span>
            ) : tab === 'signin' ? (
              'Sign in to access your orders and wishlist'
            ) : (
              'Join FreshMart for exclusive member discounts'
            )}
          </p>
        </div>

        {/* Tab switch */}
        <div
          style={{
            display: 'flex',
            background: 'var(--bg-body)',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '24px',
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setTab('signin');
              setPopupModal(null);
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: tab === 'signin' ? '#fff' : 'transparent',
              color: tab === 'signin' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: tab === 'signin' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('signup');
              setPopupModal(null);
            }}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.88rem',
              background: tab === 'signup' ? '#fff' : 'transparent',
              color: tab === 'signup' ? 'var(--primary)' : 'var(--text-secondary)',
              boxShadow: tab === 'signup' ? 'var(--shadow-sm)' : 'none',
              transition: 'var(--transition)',
              cursor: 'pointer',
              border: 'none',
            }}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {tab === 'signup' && (
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                Full Name
              </label>
              <input
                ref={nameInputRef}
                type="text"
                placeholder="Rahul Sharma"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  borderRadius: '10px',
                  border: '1px solid var(--border)',
                  outline: 'none',
                  fontSize: '0.92rem',
                }}
              />
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.92rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '10px',
                border: '1px solid var(--border)',
                outline: 'none',
                fontSize: '0.92rem',
              }}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '13px',
              fontSize: '1rem',
              marginTop: '8px',
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Processing...' : tab === 'signin' ? 'Sign In →' : 'Create Account →'}
          </button>
        </form>

        {/* Quick Demo Login Shortcut */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '10px' }}>
            Quick Demo Profiles (Pre-registered)
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => handleDemoLogin('Rahul Sharma', 'rahul@example.com')}
              style={{
                padding: '6px 12px',
                background: 'var(--green-100)',
                color: 'var(--green-800)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Rahul Sharma
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('Priya Patel', 'priya@example.com')}
              style={{
                padding: '6px 12px',
                background: 'var(--green-100)',
                color: 'var(--green-800)',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Priya Patel
            </button>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link href="/" style={{ color: 'var(--primary)', fontSize: '0.88rem', fontWeight: 600 }}>
            ← Back to Storefront
          </Link>
        </div>
      </div>

      {/* POPUP ERROR MODAL */}
      {popupModal && popupModal.isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '420px',
              backgroundColor: '#ffffff',
              borderRadius: '20px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              padding: '28px',
              textAlign: 'center',
              position: 'relative',
              animation: 'scaleIn 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Modal Icon Badge */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor:
                  popupModal.type === 'no_account'
                    ? '#fef2f2'
                    : popupModal.type === 'account_exists'
                    ? '#eff6ff'
                    : '#fef3c7',
                color:
                  popupModal.type === 'no_account'
                    ? '#dc2626'
                    : popupModal.type === 'account_exists'
                    ? '#2563eb'
                    : '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 16px',
                border:
                  popupModal.type === 'no_account'
                    ? '2px solid #fecaca'
                    : popupModal.type === 'account_exists'
                    ? '2px solid #bfdbfe'
                    : '2px solid #fde68a',
              }}
            >
              {popupModal.type === 'no_account' ? '⚠️' : popupModal.type === 'account_exists' ? '👤' : '🔒'}
            </div>

            <h3
              style={{
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#0f172a',
                marginBottom: '10px',
                fontFamily: 'var(--font-display)',
              }}
            >
              {popupModal.title}
            </h3>

            <p
              style={{
                fontSize: '0.92rem',
                color: '#475569',
                lineHeight: 1.6,
                marginBottom: '24px',
              }}
            >
              {popupModal.message}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {popupModal.actionText && (
                <button
                  type="button"
                  onClick={popupModal.onAction}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--green-600)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.95rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(22, 163, 74, 0.35)',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--green-700)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--green-600)')}
                >
                  {popupModal.actionText}
                </button>
              )}

              <button
                type="button"
                onClick={() => setPopupModal(null)}
                style={{
                  width: '100%',
                  padding: '11px',
                  borderRadius: '12px',
                  backgroundColor: '#f1f5f9',
                  color: '#475569',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>}>
      <AuthForm />
    </Suspense>
  );
}
