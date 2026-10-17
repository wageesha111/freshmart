'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CATEGORIES } from '@/data/products';
import { Product } from '@/types';

interface AdminOrder {
  id: string;
  date: string;
  total: number;
  slot: string;
  status: string;
  userEmail?: string;
  customerName?: string;
  customerPhone?: string;
  deliveryAddress?: string;
  city?: string;
  pincode?: string;
  paymentMethod?: string;
  items: Array<{
    id: number;
    name: string;
    price: number;
    qty: number;
    image?: string;
  }>;
}

// Curated high-resolution supermarket product photos
const PRODUCT_IMAGE_PRESETS = [
  { label: 'Fresh Apples', url: '/products/prod_1.jpg' },
  { label: 'Organic Spinach', url: '/products/prod_2.jpg' },
  { label: 'Cavendish Bananas', url: '/products/prod_3.jpg' },
  { label: 'Vine Tomatoes', url: '/products/prod_4.jpg' },
  { label: 'Farm Fresh Milk', url: '/products/prod_5.jpg' },
  { label: 'Green Broccoli', url: '/products/prod_6.jpg' },
  { label: 'Artisan Bread', url: '/products/prod_7.jpg' },
  { label: 'Strawberries', url: '/products/prod_8.jpg' },
  { label: 'Citrus Juice', url: '/products/prod_9.jpg' },
  { label: 'Greek Yogurt', url: '/products/prod_10.jpg' },
  { label: 'Hass Avocados', url: '/products/prod_11.jpg' },
  { label: 'Sweet Carrots', url: '/products/prod_12.jpg' },
];

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'inventory' | 'customers'>('overview');
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Orders filtering
  const [orderFilterStatus, setOrderFilterStatus] = useState<string>('all');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Inventory filtering & modals
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [isSubmittingProduct, setIsSubmittingProduct] = useState(false);

  // Edit Product Modal State
  const [editingProduct, setEditingProduct] = useState<{
    id: number;
    name: string;
    category: string;
    price: string;
    originalPrice: string;
    unit: string;
    badge: string;
    image: string;
  } | null>(null);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [isUpdatingProduct, setIsUpdatingProduct] = useState(false);

  // New Product Form State (strictly image-based, zero emojis)
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'fruits',
    price: '',
    originalPrice: '',
    unit: '1 kg',
    image: '/products/prod_1.jpg',
    badge: 'organic',
  });

  // Image Upload & Source Selector State
  const [addImageTab, setAddImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [editImageTab, setEditImageTab] = useState<'upload' | 'preset' | 'url'>('upload');
  const [isUploadingAddImage, setIsUploadingAddImage] = useState(false);
  const [isUploadingEditImage, setIsUploadingEditImage] = useState(false);

  const handleFileUpload = async (file: File, isEdit: boolean) => {
    if (!file) return;

    if (isEdit) setIsUploadingEditImage(true);
    else setIsUploadingAddImage(true);

    try {
      // 1. Instant local preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        if (isEdit) {
          setEditingProduct((prev) => (prev ? { ...prev, image: dataUrl } : prev));
        } else {
          setNewProduct((prev) => ({ ...prev, image: dataUrl }));
        }
      };
      reader.readAsDataURL(file);

      // 2. Upload to server (/api/upload -> public/uploads)
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });
      const data = await res.json();
      if (data.success && data.url) {
        if (isEdit) {
          setEditingProduct((prev) => (prev ? { ...prev, image: data.url } : prev));
        } else {
          setNewProduct((prev) => ({ ...prev, image: data.url }));
        }
        showToast('Image uploaded successfully');
      }
    } catch (err) {
      console.error('File upload error:', err);
      showToast('Image loaded locally');
    } finally {
      if (isEdit) setIsUploadingEditImage(false);
      else setIsUploadingAddImage(false);
    }
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Orders
  const fetchOrders = async () => {
    setLoadingOrders(true);
    try {
      const res = await fetch('/api/orders?admin=true');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setOrders(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch admin orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Products
  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        setProducts(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchProducts();
  }, []);

  // Update Order Status
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrderId(orderId);
    try {
      const res = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: orderId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        showToast(`Order #${orderId} marked as "${newStatus}"`);
      } else {
        showToast('Failed to update order status');
      }
    } catch (err) {
      console.error('Failed to update order status:', err);
      showToast('Error updating order status');
    } finally {
      setUpdatingOrderId(null);
    }
  };

  // Create Product (Add to Store)
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      showToast('Please fill in product name and sale price');
      return;
    }

    setIsSubmittingProduct(true);
    try {
      const salePrice = parseFloat(newProduct.price);
      const origPrice = newProduct.originalPrice ? parseFloat(newProduct.originalPrice) : salePrice;
      const discount = origPrice > salePrice ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;

      const payload = {
        name: newProduct.name.trim(),
        category: newProduct.category,
        price: salePrice,
        originalPrice: origPrice,
        original_price: origPrice,
        discount,
        unit: newProduct.unit.trim() || '1 kg',
        image: newProduct.image.trim() || '/products/prod_1.jpg',
        badge: newProduct.badge === 'none' ? null : newProduct.badge,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setProducts((prev) => [data.data, ...prev]);
        showToast(`Added "${newProduct.name}" to catalog`);
        setIsAddProductOpen(false);
        setNewProduct({
          name: '',
          category: 'fruits',
          price: '',
          originalPrice: '',
          unit: '1 kg',
          image: '/products/prod_1.jpg',
          badge: 'organic',
        });
        // Dispatches event so storefront live sync updates immediately
        window.dispatchEvent(new Event('freshmart-products-updated'));
      } else {
        showToast('Failed to add product');
      }
    } catch (err) {
      console.error('Error adding product:', err);
      showToast('Error adding product');
    } finally {
      setIsSubmittingProduct(false);
    }
  };

  // Open Edit Product Modal
  const openEditModal = (p: Product) => {
    const img = p.image || '/products/prod_1.jpg';
    setEditingProduct({
      id: p.id,
      name: p.name,
      category: p.category,
      price: p.price.toString(),
      originalPrice: p.originalPrice ? p.originalPrice.toString() : p.price.toString(),
      unit: p.unit || '1 kg',
      badge: p.badge || 'none',
      image: img,
    });
    if (img.startsWith('/uploads/') || img.startsWith('data:')) {
      setEditImageTab('upload');
    } else if (img.startsWith('http')) {
      setEditImageTab('url');
    } else {
      setEditImageTab('preset');
    }
    setIsEditProductOpen(true);
  };

  // Update Product (Edit product details)
  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name || !editingProduct.price) {
      showToast('Please fill in product name and sale price');
      return;
    }

    setIsUpdatingProduct(true);
    try {
      const salePrice = parseFloat(editingProduct.price);
      const origPrice = editingProduct.originalPrice ? parseFloat(editingProduct.originalPrice) : salePrice;
      const discount = origPrice > salePrice ? Math.round(((origPrice - salePrice) / origPrice) * 100) : 0;

      const payload = {
        name: editingProduct.name.trim(),
        category: editingProduct.category,
        price: salePrice,
        originalPrice: origPrice,
        original_price: origPrice,
        discount,
        unit: editingProduct.unit.trim(),
        badge: editingProduct.badge === 'none' ? null : editingProduct.badge,
        image: editingProduct.image.trim() || '/products/prod_1.jpg',
      };

      const res = await fetch(`/api/products/${editingProduct.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setProducts((prev) =>
          prev.map((p) => (p.id === editingProduct.id ? { ...p, ...payload } : p))
        );
        showToast(`Updated "${editingProduct.name}" successfully`);
        setIsEditProductOpen(false);
        setEditingProduct(null);

        // Auto-recorrect in storefront instantly
        window.dispatchEvent(new Event('freshmart-products-updated'));
      } else {
        showToast('Failed to update product');
      }
    } catch (err) {
      console.error('Error updating product:', err);
      showToast('Error updating product');
    } finally {
      setIsUpdatingProduct(false);
    }
  };

  // Delete Product
  const handleDeleteProduct = async (productId: number, productName: string) => {
    if (!confirm(`Are you sure you want to remove "${productName}" from the store catalog?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p.id !== productId));
        showToast(`Product "${productName}" deleted`);
        window.dispatchEvent(new Event('freshmart-products-updated'));
      } else {
        showToast('Failed to delete product');
      }
    } catch (err) {
      console.error('Error deleting product:', err);
      showToast('Error deleting product');
    }
  };

  // Export Orders CSV
  const exportOrdersCSV = () => {
    if (orders.length === 0) {
      showToast('No orders to export');
      return;
    }

    const headers = [
      'Order ID',
      'Date',
      'Customer Name',
      'Customer Phone',
      'User Email',
      'Delivery Address',
      'City',
      'Pincode',
      'Delivery Slot',
      'Payment Method',
      'Items Count',
      'Total (INR)',
      'Status',
    ];

    const rows = orders.map((o) => [
      `"${o.id}"`,
      `"${o.date}"`,
      `"${o.customerName || ''}"`,
      `"${o.customerPhone || ''}"`,
      `"${o.userEmail || ''}"`,
      `"${(o.deliveryAddress || '').replace(/"/g, '""')}"`,
      `"${o.city || ''}"`,
      `"${o.pincode || ''}"`,
      `"${o.slot || ''}"`,
      `"${o.paymentMethod || ''}"`,
      o.items ? o.items.reduce((sum, item) => sum + item.qty, 0) : 0,
      Number(o.total).toFixed(2),
      `"${o.status}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `freshmart_orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Orders exported to CSV');
  };

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (orderFilterStatus !== 'all') {
        const s = o.status.toLowerCase();
        if (orderFilterStatus === 'processing' && !s.includes('process') && !s.includes('place') && !s.includes('pack')) return false;
        if (orderFilterStatus === 'out for delivery' && !s.includes('out')) return false;
        if (orderFilterStatus === 'delivered' && !s.includes('deliver')) return false;
        if (orderFilterStatus === 'cancelled' && !s.includes('cancel')) return false;
      }
      if (orderSearchQuery.trim()) {
        const q = orderSearchQuery.toLowerCase();
        const matchId = o.id.toLowerCase().includes(q);
        const matchName = (o.customerName || '').toLowerCase().includes(q);
        const matchPhone = (o.customerPhone || '').toLowerCase().includes(q);
        const matchEmail = (o.userEmail || '').toLowerCase().includes(q);
        const matchAddress = (o.deliveryAddress || '').toLowerCase().includes(q);
        const matchCity = (o.city || '').toLowerCase().includes(q);
        return matchId || matchName || matchPhone || matchEmail || matchAddress || matchCity;
      }
      return true;
    });
  }, [orders, orderFilterStatus, orderSearchQuery]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (productCategoryFilter !== 'all' && p.category !== productCategoryFilter) {
        return false;
      }
      if (productSearchQuery.trim()) {
        const q = productSearchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, productCategoryFilter, productSearchQuery]);

  // Unique Customers calculation
  const customerList = useMemo(() => {
    const map = new Map<string, { email: string; name: string; phone: string; city: string; orderCount: number; totalSpent: number }>();
    orders.forEach((o) => {
      const email = o.userEmail || o.customerPhone || 'guest';
      const existing = map.get(email) || {
        email: o.userEmail || '—',
        name: o.customerName || 'Customer',
        phone: o.customerPhone || '—',
        city: o.city || 'Local Area',
        orderCount: 0,
        totalSpent: 0,
      };
      existing.orderCount += 1;
      existing.totalSpent += Number(o.total) || 0;
      if (o.customerName && existing.name === 'Customer') existing.name = o.customerName;
      if (o.customerPhone && existing.phone === '—') existing.phone = o.customerPhone;
      if (o.city && existing.city === 'Local Area') existing.city = o.city;
      map.set(email, existing);
    });
    return Array.from(map.values());
  }, [orders]);

  // Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const pendingOrders = orders.filter((o) => !o.status.toLowerCase().includes('deliver') && !o.status.toLowerCase().includes('cancel')).length;
  const deliveredOrders = orders.filter((o) => o.status.toLowerCase().includes('deliver')).length;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', color: '#0f172a', fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif', paddingBottom: '90px' }}>
      
      {/* Toast Alert */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#f8fafc',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            zIndex: 9999,
            fontWeight: 600,
            fontSize: '0.88rem',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Navbar: Translucent Frosted Glass */}
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderBottom: '1px solid rgba(226, 232, 240, 0.8)',
          position: 'sticky',
          top: 0,
          zIndex: 50,
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        }}
      >
        <div
          style={{
            maxWidth: '1360px',
            margin: '0 auto',
            padding: '12px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          {/* Logo & Status Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#15803d',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 8px rgba(21, 128, 61, 0.25)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
                <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
              </svg>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h1 style={{ fontSize: '1.18rem', fontWeight: 800, margin: 0, color: '#0f172a', letterSpacing: '-0.025em' }}>
                  FreshMart Store Hub
                </h1>
                <span
                  style={{
                    background: '#ecfdf5',
                    color: '#047857',
                    border: '1px solid #a7f3d0',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                  }}
                >
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                  Live Dispatch
                </span>
              </div>
              <p style={{ fontSize: '0.78rem', color: '#64748b', margin: 0, letterSpacing: '-0.01em' }}>
                Operations, Orders & Dynamic Catalog
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setIsAddProductOpen(true)}
              style={{
                padding: '8px 16px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: '9px',
                background: '#15803d',
                color: '#ffffff',
                border: 'none',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'transform 100ms ease, background 150ms ease',
              }}
              onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.97)')}
              onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add Product
            </button>

            <button
              onClick={exportOrdersCSV}
              style={{
                padding: '8px 14px',
                borderRadius: '9px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>

            <button
              onClick={() => {
                fetchOrders();
                fetchProducts();
                showToast('Catalog & orders synchronized');
              }}
              style={{
                padding: '8px 14px',
                borderRadius: '9px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
              Sync
            </button>

            <Link
              href="/"
              style={{
                padding: '8px 16px',
                borderRadius: '9px',
                background: '#0f172a',
                color: '#ffffff',
                fontSize: '0.84rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Storefront
            </Link>
          </div>
        </div>

        {/* Tab Navigation Track */}
        <div style={{ background: '#f8fafc', borderTop: '1px solid #e2e8f0', padding: '0 24px' }}>
          <div style={{ maxWidth: '1360px', margin: '0 auto', display: 'flex', gap: '8px' }}>
            {[
              {
                id: 'overview',
                label: 'Overview',
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                  </svg>
                ),
              },
              {
                id: 'orders',
                label: `Orders (${orders.length})`,
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="m7.5 4.27 9 5.15" />
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                ),
              },
              {
                id: 'inventory',
                label: `Inventory (${products.length})`,
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
                    <line x1="7" y1="7" x2="7.01" y2="7" />
                  </svg>
                ),
              },
              {
                id: 'customers',
                label: `Customers (${customerList.length})`,
                icon: (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                ),
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '11px 16px',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: 'none',
                  borderBottom: activeTab === tab.id ? '2.5px solid #15803d' : '2.5px solid transparent',
                  color: activeTab === tab.id ? '#15803d' : '#64748b',
                  background: 'transparent',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  transition: 'all 0.15s ease',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ maxWidth: '1360px', margin: '28px auto', padding: '0 24px' }}>
        
        {/* ====================================================
            TAB 1: OVERVIEW & ANALYTICS
           ==================================================== */}
        {activeTab === 'overview' && (
          <div>
            {/* 4 Top KPI Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '18px', marginBottom: '28px' }}>
              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Gross Sales
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#ecfdf5', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="5" width="20" height="14" rx="2" />
                      <line x1="2" y1="10" x2="22" y2="10" />
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#15803d', margin: '8px 0', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                  ₹{totalRevenue.toFixed(2)}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Average order: <strong style={{ color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>₹{avgOrderValue.toFixed(2)}</strong>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Orders
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '8px 0', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                  {orders.length}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Delivered successfully: <strong style={{ color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>{deliveredOrders}</strong>
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Pending Dispatches
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="1" y="3" width="15" height="13" />
                      <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                      <circle cx="5.5" cy="18.5" r="2.5" />
                      <circle cx="18.5" cy="18.5" r="2.5" />
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#d97706', margin: '8px 0', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                  {pendingOrders}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#b45309' }}>
                  Active items in warehouse queue
                </div>
              </div>

              <div style={{ background: '#ffffff', padding: '22px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Catalog SKUs
                  </span>
                  <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#f1f5f9', color: '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m2 7 10-5 10 5-10 5Z" />
                      <path d="m2 17 10 5 10-5" />
                      <path d="m2 12 10 5 10-5" />
                    </svg>
                  </div>
                </div>
                <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#0f172a', margin: '8px 0', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em' }}>
                  {products.length}
                </div>
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>
                  Spread across <strong>8 Aisles</strong>
                </div>
              </div>
            </div>

            {/* Middle Grid: Pipeline & Category Health */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginBottom: '28px' }}>
              {/* Delivery Pipeline */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
                  Doorstep Delivery Pipeline
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {[
                    { label: 'Placed & Received', count: orders.filter((o) => o.status.toLowerCase().includes('place') || o.status.toLowerCase().includes('process')).length, color: '#3b82f6' },
                    { label: 'Packed & Picked', count: orders.filter((o) => o.status.toLowerCase().includes('pack')).length, color: '#f59e0b' },
                    { label: 'Out for Delivery', count: orders.filter((o) => o.status.toLowerCase().includes('out')).length, color: '#8b5cf6' },
                    { label: 'Successfully Delivered', count: deliveredOrders, color: '#16a34a' },
                  ].map((pipe) => {
                    const pct = orders.length > 0 ? (pipe.count / orders.length) * 100 : 0;
                    return (
                      <div key={pipe.label}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', marginBottom: '4px' }}>
                          <span style={{ fontWeight: 600, color: '#334155' }}>{pipe.label}</span>
                          <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>{pipe.count} ({pct.toFixed(0)}%)</span>
                        </div>
                        <div style={{ width: '100%', height: '7px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: pipe.color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Category Inventory Breakdown */}
              <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: '#0f172a' }}>
                  Catalog Breakdown by Aisle
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {CATEGORIES.slice(0, 6).map((cat) => {
                    const count = products.filter((p) => p.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        style={{
                          background: '#f8fafc',
                          padding: '12px 14px',
                          borderRadius: '10px',
                          border: '1px solid #e2e8f0',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1e293b' }}>{cat.name}</span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 700, fontVariantNumeric: 'tabular-nums', background: '#ffffff', padding: '2px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Recent Orders Quick Feed */}
            <div style={{ background: '#ffffff', padding: '24px', borderRadius: '16px', border: '1px solid rgba(15,23,42,0.08)', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>
                  Recent Orders Feed
                </h3>
                <button
                  onClick={() => setActiveTab('orders')}
                  style={{ fontSize: '0.84rem', fontWeight: 600, color: '#15803d', background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  Manage all orders
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

              {orders.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px', color: '#64748b', fontSize: '0.88rem' }}>
                  No customer orders recorded yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {orders.slice(0, 5).map((o) => (
                    <div
                      key={o.id}
                      style={{
                        padding: '12px 16px',
                        background: '#f8fafc',
                        borderRadius: '10px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ fontWeight: 700, color: '#15803d', fontSize: '0.92rem', fontVariantNumeric: 'tabular-nums' }}>#{o.id}</span>
                        <div>
                          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{o.customerName || o.userEmail || 'Customer'}</div>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{o.city || 'Doorstep delivery'} • {o.items ? o.items.length : 0} items</div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <span style={{ fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#0f172a', fontSize: '0.92rem' }}>
                          ₹{Number(o.total).toFixed(2)}
                        </span>
                        <span
                          style={{
                            padding: '3px 9px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background: o.status.toLowerCase().includes('deliver') ? '#ecfdf5' : '#fef3c7',
                            color: o.status.toLowerCase().includes('deliver') ? '#047857' : '#b45309',
                            border: `1px solid ${o.status.toLowerCase().includes('deliver') ? '#a7f3d0' : '#fde68a'}`,
                          }}
                        >
                          {o.status}
                        </span>
                        <button
                          onClick={() => setActiveTab('orders')}
                          style={{
                            padding: '5px 12px',
                            borderRadius: '7px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================
            TAB 2: ORDERS & DISPATCH HUB
           ==================================================== */}
        {activeTab === 'orders' && (
          <div>
            {/* Filter and Search Bar */}
            <div
              style={{
                background: '#ffffff',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
              }}
            >
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {[
                  { id: 'all', label: 'All Orders' },
                  { id: 'processing', label: 'Placed / Packing' },
                  { id: 'out for delivery', label: 'Out for Delivery' },
                  { id: 'delivered', label: 'Delivered' },
                  { id: 'cancelled', label: 'Cancelled' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setOrderFilterStatus(tab.id)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '8px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      border: '1px solid',
                      cursor: 'pointer',
                      borderColor: orderFilterStatus === tab.id ? '#15803d' : '#e2e8f0',
                      background: orderFilterStatus === tab.id ? '#f0fdf4' : '#ffffff',
                      color: orderFilterStatus === tab.id ? '#15803d' : '#64748b',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div style={{ position: 'relative', minWidth: '280px' }}>
                <input
                  type="text"
                  placeholder="Search order ID, customer, address..."
                  value={orderSearchQuery}
                  onChange={(e) => setOrderSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 14px 8px 34px',
                    borderRadius: '9px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    outline: 'none',
                  }}
                />
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }}
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
              </div>
            </div>

            {/* Orders Listing */}
            {loadingOrders ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '0.88rem' }}>
                Loading customer delivery orders...
              </div>
            ) : filteredOrders.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>No matching orders found</h3>
                <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                  Adjust the status filter or search parameters.
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    style={{
                      background: '#ffffff',
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Order Top Bar */}
                    <div
                      style={{
                        padding: '12px 18px',
                        background: '#f8fafc',
                        borderBottom: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontWeight: 700, fontSize: '0.98rem', color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
                          #{order.id}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>• {order.date}</span>
                        <span
                          style={{
                            padding: '2px 9px',
                            borderRadius: '999px',
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            background:
                              order.status.toLowerCase().includes('deliver')
                                ? '#ecfdf5'
                                : order.status.toLowerCase().includes('out')
                                ? '#eff6ff'
                                : order.status.toLowerCase().includes('cancel')
                                ? '#fef2f2'
                                : '#fef3c7',
                            color:
                              order.status.toLowerCase().includes('deliver')
                                ? '#047857'
                                : order.status.toLowerCase().includes('out')
                                ? '#1d4ed8'
                                : order.status.toLowerCase().includes('cancel')
                                ? '#dc2626'
                                : '#b45309',
                            border: `1px solid ${
                              order.status.toLowerCase().includes('deliver')
                                ? '#a7f3d0'
                                : order.status.toLowerCase().includes('out')
                                ? '#bfdbfe'
                                : order.status.toLowerCase().includes('cancel')
                                ? '#fecaca'
                                : '#fde68a'
                            }`,
                          }}
                        >
                          {order.status}
                        </span>
                      </div>

                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', fontVariantNumeric: 'tabular-nums' }}>
                        Total: ₹{Number(order.total).toFixed(2)}
                      </div>
                    </div>

                    {/* Order Body Details Grid */}
                    <div style={{ padding: '18px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                      {/* Customer & Delivery Address */}
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px', letterSpacing: '0.5px' }}>
                          Customer & Delivery Address
                        </div>
                        <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#0f172a' }}>
                          {order.customerName || order.userEmail || 'Customer'}
                        </div>

                        {order.customerPhone ? (
                          <div style={{ marginTop: '4px' }}>
                            <a
                              href={`tel:${order.customerPhone}`}
                              style={{
                                color: '#15803d',
                                fontWeight: 600,
                                textDecoration: 'none',
                                fontSize: '0.84rem',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                              </svg>
                              {order.customerPhone}
                            </a>
                          </div>
                        ) : (
                          <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                            Phone not provided
                          </div>
                        )}

                        <div style={{ fontSize: '0.84rem', color: '#334155', marginTop: '6px', lineHeight: 1.5 }}>
                          <div>{order.deliveryAddress || 'Standard doorstep address'}</div>
                          <div style={{ color: '#64748b' }}>{order.city || 'Local area'}, {order.pincode || '400001'}</div>
                        </div>

                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '8px' }}>
                          Slot: <span style={{ color: '#0f172a', fontWeight: 500 }}>{order.slot || 'Standard Express'}</span> • Pay: <span style={{ color: '#0f172a', fontWeight: 500 }}>{order.paymentMethod || 'Online'}</span>
                        </div>
                      </div>

                      {/* Ordered Items List */}
                      <div>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, textTransform: 'uppercase', color: '#64748b', marginBottom: '6px', letterSpacing: '0.5px' }}>
                          Package Items ({order.items ? order.items.length : 0})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                          {(order.items || []).map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                fontSize: '0.84rem',
                                padding: '4px 0',
                                borderBottom: '1px solid #f1f5f9',
                              }}
                            >
                              <span style={{ fontWeight: 500, color: '#1e293b' }}>
                                {item.qty} × {item.name}
                              </span>
                              <span style={{ color: '#64748b', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                                ₹{(item.price * item.qty).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Order Action Dispatch Controls */}
                    <div
                      style={{
                        padding: '10px 18px',
                        background: '#f8fafc',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                        Email: <span style={{ color: '#0f172a' }}>{order.userEmail || 'Guest'}</span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '0.76rem', fontWeight: 600, color: '#64748b' }}>
                          Dispatch Status:
                        </span>

                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Packed')}
                          disabled={updatingOrderId === order.id}
                          style={{
                            padding: '5px 12px',
                            background: order.status === 'Packed' ? '#fef3c7' : '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '7px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: '#b45309',
                            cursor: 'pointer',
                          }}
                        >
                          Pack
                        </button>

                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Out for Delivery')}
                          disabled={updatingOrderId === order.id}
                          style={{
                            padding: '5px 12px',
                            background: order.status === 'Out for Delivery' ? '#eff6ff' : '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '7px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: '#1d4ed8',
                            cursor: 'pointer',
                          }}
                        >
                          Out for Delivery
                        </button>

                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 'Delivered')}
                          disabled={updatingOrderId === order.id}
                          style={{
                            padding: '5px 12px',
                            background: order.status === 'Delivered' ? '#ecfdf5' : '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '7px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: '#047857',
                            cursor: 'pointer',
                          }}
                        >
                          Delivered
                        </button>

                        <button
                          onClick={() => window.print()}
                          style={{
                            padding: '5px 10px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '7px',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            color: '#334155',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="6 9 6 2 18 2 18 9" />
                            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                            <rect x="6" y="14" width="12" height="8" />
                          </svg>
                          Print
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 3: INVENTORY & CATALOG (WITH EDIT FUNCTION)
           ==================================================== */}
        {activeTab === 'inventory' && (
          <div>
            {/* Filter and Search Bar */}
            <div
              style={{
                background: '#ffffff',
                padding: '14px 18px',
                borderRadius: '14px',
                border: '1px solid #e2e8f0',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px',
                boxShadow: '0 1px 3px rgba(15,23,42,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <select
                  value={productCategoryFilter}
                  onChange={(e) => setProductCategoryFilter(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    outline: 'none',
                    background: '#fff',
                    color: '#334155',
                  }}
                >
                  <option value="all">All Aisles</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <div style={{ position: 'relative', minWidth: '240px' }}>
                  <input
                    type="text"
                    placeholder="Search product name or SKU..."
                    value={productSearchQuery}
                    onChange={(e) => setProductSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 14px 8px 32px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.84rem',
                      outline: 'none',
                    }}
                  />
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>

              <button
                onClick={() => setIsAddProductOpen(true)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add SKU
              </button>
            </div>

            {loadingProducts ? (
              <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b', fontSize: '0.88rem' }}>
                Loading inventory catalog...
              </div>
            ) : filteredProducts.length === 0 ? (
              <div style={{ background: '#ffffff', padding: '50px 20px', borderRadius: '16px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 6px 0' }}>No products match filter</h3>
                <p style={{ color: '#64748b', fontSize: '0.86rem', margin: 0 }}>
                  Add a new product or reset your search query.
                </p>
              </div>
            ) : (
              <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,0.03)' }}>
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '12px 18px' }}>Product</th>
                        <th style={{ padding: '12px 16px' }}>Aisle</th>
                        <th style={{ padding: '12px 16px' }}>Price</th>
                        <th style={{ padding: '12px 16px' }}>MRP</th>
                        <th style={{ padding: '12px 16px' }}>Unit</th>
                        <th style={{ padding: '12px 16px' }}>Badge</th>
                        <th style={{ padding: '12px 16px' }}>Status</th>
                        <th style={{ padding: '12px 18px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProducts.map((p) => (
                        <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, border: '1px solid #e2e8f0' }}>
                              {p.image ? (
                                <Image src={p.image} alt={p.name} width={38} height={38} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                              ) : (
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                  <circle cx="8.5" cy="8.5" r="1.5" />
                                  <polyline points="21 15 16 10 5 21" />
                                </svg>
                              )}
                            </div>
                            <div>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>{p.name}</div>
                              <div style={{ fontSize: '0.72rem', color: '#64748b', fontVariantNumeric: 'tabular-nums' }}>SKU #{p.id}</div>
                            </div>
                          </td>

                          <td style={{ padding: '10px 16px', textTransform: 'capitalize', color: '#334155' }}>
                            {p.category}
                          </td>

                          <td style={{ padding: '10px 16px', fontWeight: 700, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{p.price.toFixed(2)}
                          </td>

                          <td style={{ padding: '10px 16px', color: '#94a3b8', textDecoration: p.originalPrice > p.price ? 'line-through' : 'none', fontVariantNumeric: 'tabular-nums' }}>
                            {p.originalPrice ? `₹${p.originalPrice.toFixed(2)}` : '—'}
                          </td>

                          <td style={{ padding: '10px 16px', color: '#64748b' }}>
                            {p.unit || 'Standard'}
                          </td>

                          <td style={{ padding: '10px 16px' }}>
                            {p.badge ? (
                              <span style={{ padding: '2px 8px', borderRadius: '5px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', background: p.badge === 'organic' ? '#ecfdf5' : '#fee2e2', color: p.badge === 'organic' ? '#047857' : '#dc2626', border: `1px solid ${p.badge === 'organic' ? '#a7f3d0' : '#fecaca'}` }}>
                                {p.badge}
                              </span>
                            ) : (
                              <span style={{ color: '#cbd5e1' }}>—</span>
                            )}
                          </td>

                          <td style={{ padding: '10px 16px' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.78rem', color: '#047857', fontWeight: 500 }}>
                              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }}></span>
                              In Stock
                            </span>
                          </td>

                          <td style={{ padding: '10px 18px', textAlign: 'right' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                              {/* Edit Button */}
                              <button
                                onClick={() => openEditModal(p)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  color: '#334155',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                                </svg>
                                Edit
                              </button>

                              {/* Delete Button */}
                              <button
                                onClick={() => handleDeleteProduct(p.id, p.name)}
                                style={{
                                  padding: '5px 10px',
                                  borderRadius: '6px',
                                  background: '#fff',
                                  border: '1px solid #fee2e2',
                                  color: '#dc2626',
                                  fontSize: '0.76rem',
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '4px',
                                }}
                              >
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ====================================================
            TAB 4: CUSTOMERS DIRECTORY
           ==================================================== */}
        {activeTab === 'customers' && (
          <div>
            <div style={{ background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(15,23,42,0.03)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Registered Customers & Delivery Accounts
                  </h3>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '2px 0 0 0' }}>
                    Extracted from live orders and checkout sessions
                  </p>
                </div>
                <span style={{ background: '#f8fafc', padding: '4px 10px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600, color: '#334155', border: '1px solid #e2e8f0' }}>
                  {customerList.length} Accounts
                </span>
              </div>

              {customerList.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#64748b', fontSize: '0.88rem' }}>
                  No customer profiles registered yet.
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontWeight: 600, fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                        <th style={{ padding: '12px 18px' }}>Customer Name</th>
                        <th style={{ padding: '12px 16px' }}>Email</th>
                        <th style={{ padding: '12px 16px' }}>Phone</th>
                        <th style={{ padding: '12px 16px' }}>Primary City</th>
                        <th style={{ padding: '12px 16px' }}>Orders Placed</th>
                        <th style={{ padding: '12px 18px', textAlign: 'right' }}>Total Spend</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerList.map((c, i) => (
                        <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px 18px', fontWeight: 600, color: '#0f172a' }}>
                            {c.name}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#334155' }}>
                            {c.email}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748b' }}>
                            {c.phone}
                          </td>
                          <td style={{ padding: '12px 16px', color: '#64748b' }}>
                            {c.city}
                          </td>
                          <td style={{ padding: '12px 16px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                            {c.orderCount}
                          </td>
                          <td style={{ padding: '12px 18px', textAlign: 'right', fontWeight: 700, color: '#15803d', fontVariantNumeric: 'tabular-nums' }}>
                            ₹{c.totalSpent.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ====================================================
          MODAL: ADD NEW PRODUCT (WITH IMAGE SELECTOR & LIVE PREVIEW)
         ==================================================== */}
      {isAddProductOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Add Product to Catalog
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  New items immediately appear across all store aisles
                </p>
              </div>
              <button
                onClick={() => setIsAddProductOpen(false)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Dragonfruit, Hass Avocado"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Aisle Category *
                  </label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Unit / Quantity *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 500g, 1 kg, 6 pcs"
                    value={newProduct.unit}
                    onChange={(e) => setNewProduct({ ...newProduct, unit: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 89"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="e.g. 119"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Badge Tag
                </label>
                <select
                  value={newProduct.badge}
                  onChange={(e) => setNewProduct({ ...newProduct, badge: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                >
                  <option value="organic">Organic</option>
                  <option value="new">New Arrival</option>
                  <option value="sale">Special Sale</option>
                  <option value="none">No Badge</option>
                </select>
              </div>

              {/* Product Image Selection Hub */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Product Imagery
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Upload your own or choose a preset
                  </span>
                </div>

                {/* 3 Source Switcher Tabs */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setAddImageTab('upload')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: addImageTab === 'upload' ? '#ffffff' : 'transparent',
                      color: addImageTab === 'upload' ? '#0f172a' : '#64748b',
                      boxShadow: addImageTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Own Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddImageTab('preset')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: addImageTab === 'preset' ? '#ffffff' : 'transparent',
                      color: addImageTab === 'preset' ? '#0f172a' : '#64748b',
                      boxShadow: addImageTab === 'preset' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddImageTab('url')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: addImageTab === 'url' ? '#ffffff' : 'transparent',
                      color: addImageTab === 'url' ? '#0f172a' : '#64748b',
                      boxShadow: addImageTab === 'url' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Image URL
                  </button>
                </div>

                {/* TAB 1: UPLOAD OWN IMAGE */}
                {addImageTab === 'upload' && (
                  <div>
                    {newProduct.image && (newProduct.image.startsWith('/uploads/') || newProduct.image.startsWith('data:')) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #86efac', position: 'relative', flexShrink: 0, background: '#fff' }}>
                          <Image src={newProduct.image} alt="Uploaded product" width={56} height={56} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Admin Image Attached
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                            Ready for storefront catalog
                          </div>
                        </div>
                        <label style={{ padding: '6px 12px', borderRadius: '7px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                          Change Photo
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], false);
                          }} />
                        </label>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px 16px',
                          borderRadius: '12px',
                          border: '2px dashed #cbd5e1',
                          background: '#f8fafc',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#15803d'; e.currentTarget.style.background = '#f0fdf4'; }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.background = '#f8fafc';
                          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], false);
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', marginBottom: '3px' }}>
                          {isUploadingAddImage ? 'Uploading image...' : 'Click to browse or drop product image'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Upload any JPG, PNG, WebP or camera photo
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], false);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* TAB 2: SUPERMARKET PRESETS */}
                {addImageTab === 'preset' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                      {PRODUCT_IMAGE_PRESETS.map((item) => {
                        const isSelected = newProduct.image === item.url;
                        return (
                          <button
                            key={item.url}
                            type="button"
                            onClick={() => setNewProduct({ ...newProduct, image: item.url })}
                            title={item.label}
                            style={{
                              position: 'relative',
                              aspectRatio: '1 / 1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isSelected ? '2.5px solid #15803d' : '1px solid #e2e8f0',
                              padding: 0,
                              cursor: 'pointer',
                              background: '#f8fafc',
                            }}
                          >
                            <Image src={item.url} alt={item.label} width={60} height={60} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '2px', right: '2px', background: '#15803d', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: CUSTOM IMAGE URL */}
                {addImageTab === 'url' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Paste image link (https://... or /products/...)"
                      value={newProduct.image}
                      onChange={(e) => setNewProduct({ ...newProduct, image: e.target.value })}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                    />
                    {newProduct.image && (
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                        <Image src={newProduct.image} alt="Preview" width={38} height={38} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer', fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProduct}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isSubmittingProduct ? 'Saving...' : 'Add to Catalog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================
          MODAL: EDIT PRODUCT DETAILS (ZERO EMOJIS, IMAGE SELECTOR)
         ==================================================== */}
      {isEditProductOpen && editingProduct && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: '20px',
              maxWidth: '560px',
              width: '100%',
              padding: '24px 28px',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
              border: '1px solid rgba(226, 232, 240, 0.8)',
              maxHeight: '92vh',
              overflowY: 'auto',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.02em' }}>
                  Edit Product Details
                </h3>
                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                  Updates reflect instantly across Admin Hub and Storefront
                </p>
              </div>
              <button
                onClick={() => {
                  setIsEditProductOpen(false);
                  setEditingProduct(null);
                }}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '30px', height: '30px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Aisle Category *
                  </label>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Unit / Quantity *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.unit}
                    onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Sale Price (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                    Original MRP (₹)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingProduct.originalPrice}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#334155', marginBottom: '5px' }}>
                  Badge Tag
                </label>
                <select
                  value={editingProduct.badge}
                  onChange={(e) => setEditingProduct({ ...editingProduct, badge: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.88rem', outline: 'none', background: '#fff' }}
                >
                  <option value="organic">Organic</option>
                  <option value="new">New Arrival</option>
                  <option value="sale">Special Sale</option>
                  <option value="none">No Badge</option>
                </select>
              </div>

              {/* Product Image Selection Hub */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                    Product Photo
                  </label>
                  <span style={{ fontSize: '0.72rem', color: '#64748b' }}>
                    Upload your own or choose a preset
                  </span>
                </div>

                {/* 3 Source Switcher Tabs */}
                <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '8px', padding: '3px', marginBottom: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setEditImageTab('upload')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: editImageTab === 'upload' ? '#ffffff' : 'transparent',
                      color: editImageTab === 'upload' ? '#0f172a' : '#64748b',
                      boxShadow: editImageTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '5px',
                    }}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Upload Own Image
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditImageTab('preset')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: editImageTab === 'preset' ? '#ffffff' : 'transparent',
                      color: editImageTab === 'preset' ? '#0f172a' : '#64748b',
                      boxShadow: editImageTab === 'preset' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Presets
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditImageTab('url')}
                    style={{
                      flex: 1,
                      padding: '6px 10px',
                      borderRadius: '6px',
                      border: 'none',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      background: editImageTab === 'url' ? '#ffffff' : 'transparent',
                      color: editImageTab === 'url' ? '#0f172a' : '#64748b',
                      boxShadow: editImageTab === 'url' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                    }}
                  >
                    Image URL
                  </button>
                </div>

                {/* TAB 1: UPLOAD OWN IMAGE */}
                {editImageTab === 'upload' && (
                  <div>
                    {editingProduct.image && (editingProduct.image.startsWith('/uploads/') || editingProduct.image.startsWith('data:')) ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '8px', overflow: 'hidden', border: '1px solid #86efac', position: 'relative', flexShrink: 0, background: '#fff' }}>
                          <Image src={editingProduct.image} alt="Uploaded product" width={56} height={56} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            Admin Image Attached
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '2px' }}>
                            Will replace storefront image upon saving
                          </div>
                        </div>
                        <label style={{ padding: '6px 12px', borderRadius: '7px', background: '#ffffff', border: '1px solid #cbd5e1', fontSize: '0.76rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                          Change Photo
                          <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], true);
                          }} />
                        </label>
                      </div>
                    ) : (
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: '24px 16px',
                          borderRadius: '12px',
                          border: '2px dashed #cbd5e1',
                          background: '#f8fafc',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                        }}
                        onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#15803d'; e.currentTarget.style.background = '#f0fdf4'; }}
                        onDragLeave={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = '#cbd5e1'; e.currentTarget.style.background = '#f8fafc'; }}
                        onDrop={(e) => {
                          e.preventDefault();
                          e.currentTarget.style.borderColor = '#cbd5e1';
                          e.currentTarget.style.background = '#f8fafc';
                          if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0], true);
                        }}
                      >
                        <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#ecfdf5', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                        </div>
                        <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0f172a', marginBottom: '3px' }}>
                          {isUploadingEditImage ? 'Uploading image...' : 'Click to browse or drop new product image'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                          Upload any JPG, PNG, WebP or camera photo
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) handleFileUpload(e.target.files[0], true);
                          }}
                        />
                      </label>
                    )}
                  </div>
                )}

                {/* TAB 2: SUPERMARKET PRESETS */}
                {editImageTab === 'preset' && (
                  <div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
                      {PRODUCT_IMAGE_PRESETS.map((item) => {
                        const isSelected = editingProduct.image === item.url;
                        return (
                          <button
                            key={item.url}
                            type="button"
                            onClick={() => setEditingProduct({ ...editingProduct, image: item.url })}
                            title={item.label}
                            style={{
                              position: 'relative',
                              aspectRatio: '1 / 1',
                              borderRadius: '8px',
                              overflow: 'hidden',
                              border: isSelected ? '2.5px solid #15803d' : '1px solid #e2e8f0',
                              padding: 0,
                              cursor: 'pointer',
                              background: '#f8fafc',
                            }}
                          >
                            <Image src={item.url} alt={item.label} width={60} height={60} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                            {isSelected && (
                              <div style={{ position: 'absolute', top: '2px', right: '2px', background: '#15803d', color: '#fff', borderRadius: '50%', width: '15px', height: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="20 6 9 17 4 12" />
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* TAB 3: CUSTOM IMAGE URL */}
                {editImageTab === 'url' && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      placeholder="Paste image link (https://... or /products/...)"
                      value={editingProduct.image}
                      onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                      style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '0.82rem', outline: 'none' }}
                    />
                    {editingProduct.image && (
                      <div style={{ width: '38px', height: '38px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1', flexShrink: 0 }}>
                        <Image src={editingProduct.image} alt="Preview" width={38} height={38} style={{ objectFit: 'cover', width: '100%', height: '100%' }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditProductOpen(false);
                    setEditingProduct(null);
                  }}
                  style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', fontWeight: 600, cursor: 'pointer', fontSize: '0.86rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingProduct}
                  style={{
                    flex: 2,
                    padding: '10px',
                    borderRadius: '8px',
                    fontWeight: 600,
                    fontSize: '0.86rem',
                    background: '#15803d',
                    color: '#ffffff',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {isUpdatingProduct ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
