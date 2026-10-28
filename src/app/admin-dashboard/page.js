'use client';

import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { 
  LayoutDashboard, Users, ShieldAlert, MessageSquare, 
  Settings, LogOut, Plus, Trash2, Mail, Eye, 
  CheckCircle, XCircle, Search, CreditCard, Filter, AlertTriangle,
  Server, Activity, Lock, Database, Power,
  Megaphone, Send, Upload, Loader2, Download
} from 'lucide-react';

// --- Particle Network Background Component ---
const ParticleBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let particles = [];

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initParticles();
    };

    class Particle {
      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.vx = (Math.random() - 0.5) * 1;
        this.vy = (Math.random() - 0.5) * 1;
        this.radius = Math.random() * 1.5 + 0.5;
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
        if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(167, 139, 250, 0.6)';
        ctx.fill();
      }
    }

    const initParticles = () => {
      particles = [];
      const numParticles = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 15000), 120);
      for (let i = 0; i < numParticles; i++) {
        particles.push(new Particle());
      }
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 150) {
            ctx.beginPath();
            const opacity = 1 - distance / 150;
            ctx.strokeStyle = `rgba(129, 140, 248, ${opacity * 0.4})`;
            ctx.lineWidth = 1;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[-1] bg-[#090b14] overflow-hidden pointer-events-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="absolute top-[10%] left-[10%] w-[40vw] h-[40vw] rounded-full bg-fuchsia-600/10 blur-[120px] animate-pulse" style={{ animationDuration: '6s' }}></div>
      <div className="absolute bottom-[10%] right-[10%] w-[40vw] h-[40vw] rounded-full bg-blue-600/5 blur-[120px] animate-pulse" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
    </div>
  );
};

const ALL_MODULES = [
  { id: "overview", label: "Command Overview", shortName: "HOME" },
  { id: "hms", label: "Frontdesk (HMS)", shortName: "HMS", price: 8500 },
  { id: "pms", label: "Landlord (PMS)", shortName: "PMS", price: 11500 },
  { id: "hvms", label: "Butler (HVMS)", shortName: "HVMS", price: 5500 },
  { id: "bms", label: "Sekyu (BMS)", shortName: "BMS", price: 14500 },
  { id: "iot", label: "Housekeeper (IoT)", shortName: "IoT", price: 17000 },
];

const formatPHP = (amount) => {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
};

/**
 * Phone photos are 5-10 MB and Vercel rejects bodies over 4.5 MB.
 * Shrink anything large to a 1600px JPEG before it leaves the browser.
 * GIFs are left alone so animations survive.
 */
const compressImage = (file) =>
  new Promise((resolve) => {
    if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.size < 600 * 1024) {
      resolve(file);
      return;
    }

    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(1, 1600 / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);

      canvas.toBlob(
        (blob) =>
          resolve(
            blob
              ? new File([blob], `${file.name.replace(/\.[^.]+$/, '')}.jpg`, { type: 'image/jpeg' })
              : file
          ),
        'image/jpeg',
        0.85
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(file);
    };

    img.src = url;
  });

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('overview'); 
  
  // Settings & System State
  const [systemLogs, setSystemLogs] = useState([]);
  const [platformSettings, setPlatformSettings] = useState({
    maintenanceMode: false,
    allowSignups: true,
    require2FA: true,
    emailAlerts: true
  });
  const [settingsLoading, setSettingsLoading] = useState(false);

  // Account security (change password)
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwStatus, setPwStatus] = useState({ type: '', message: '' });

  // Modal States
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); 
  const [subscriptionToCancel, setSubscriptionToCancel] = useState(null);
  const [viewSubModal, setViewSubModal] = useState(null);
  const [viewInquiryModal, setViewInquiryModal] = useState(null);
  const [emailReplyModal, setEmailReplyModal] = useState(null);
  const [thread, setThread] = useState([]);
  const [threadLoading, setThreadLoading] = useState(false);
  const [addAdminModal, setAddAdminModal] = useState(false);

  // Filters & Processing
  const [processingId, setProcessingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [subFilter, setSubFilter] = useState('all');
  const [inquiriesFilter, setInquiriesFilter] = useState('All');
  const [inquiryAudience, setInquiryAudience] = useState('all'); // all | customer | prospect

  // Gate: no admin dashboard renders until the one-time code is confirmed.
  const [gate, setGate] = useState('checking'); // checking | code | ready | denied
  const [gateCode, setGateCode] = useState('');
  const [gateMessage, setGateMessage] = useState('');
  const [adminEmail, setAdminEmail] = useState('');

  // Email campaigns
  const [campaignDraft, setCampaignDraft] = useState({ subject: '', body: '', images: [] });
  const [campaignAudience, setCampaignAudience] = useState('customers'); // customers | prospects | all | custom
  const [campaignAudiences, setCampaignAudiences] = useState({ customers: [], prospects: [] });
  const [campaignSelected, setCampaignSelected] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [campaignAudienceSearch, setCampaignAudienceSearch] = useState('');
  const [campaignLoading, setCampaignLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [campaignError, setCampaignError] = useState('');
  const [campaignNotice, setCampaignNotice] = useState('');
  const [campaignProgress, setCampaignProgress] = useState(null); // { total, sent, failed, phase }
  const [confirmCampaign, setConfirmCampaign] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const checkAccess = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        window.location.href = '/';
        return;
      }

      setAdminEmail(session.user?.email || '');

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (cancelled) return;

      if (profile?.role !== 'admin') {
        setGateMessage('This account does not have administrator access.');
        setGate('denied');
        return;
      }

      const res = await fetch('/api/auth/verify-admin-code', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      const status = await res.json();

      if (cancelled) return;
      setGate(status.requiresVerification ? 'code' : 'ready');
    };

    checkAccess();
    return () => { cancelled = true; };
  }, []);

  const handleUnlockAdmin = async (e) => {
    e.preventDefault();
    setGateMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await fetch('/api/auth/verify-admin-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ code: gateCode }),
      });
      const data = await res.json();

      if (!res.ok) {
        setGateMessage(data.message || 'Could not verify the code.');
        return;
      }

      setGate('ready');
    } catch (err) {
      setGateMessage('Connection error. Please try again.');
    }
  };

  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('all');
    setSubFilter('all');
    setInquiriesFilter('All');
    setInquiryAudience('all');
  }, [activeTab]);

  useEffect(() => {
    fetchUsers();
    fetchInquiries();
    fetchAuditLogs();
    fetchPlatformSettings();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch users');
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInquiries = async () => {
    try {
      const response = await fetch('/api/admin/inquiries');
      const data = await response.json();
      if (response.ok) setInquiries(data.inquiries || []);
    } catch (err) {
      console.error('Failed to fetch inquiries:', err);
    }
  };


  // --- EMAIL CAMPAIGNS ---

  const authHeaders = async (json = true) => {
    const { data: { session } } = await supabase.auth.getSession();
    const headers = {};
    if (json) headers['Content-Type'] = 'application/json';
    if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
    return headers;
  };

  const allCampaignPeople = [
    ...campaignAudiences.customers,
    ...campaignAudiences.prospects,
  ];

  const campaignRecipients =
    campaignAudience === 'customers'
      ? campaignAudiences.customers
      : campaignAudience === 'prospects'
        ? campaignAudiences.prospects
        : campaignAudience === 'all'
          ? allCampaignPeople
          : allCampaignPeople.filter((person) => campaignSelected.includes(person.email));

  const campaignPeopleQuery = campaignAudienceSearch.trim().toLowerCase();
  const campaignPeopleShown = allCampaignPeople.filter(
    (person) =>
      !campaignPeopleQuery ||
      person.email.includes(campaignPeopleQuery) ||
      (person.name || '').toLowerCase().includes(campaignPeopleQuery) ||
      (person.company || '').toLowerCase().includes(campaignPeopleQuery)
  );

  const fetchCampaigns = async () => {
    try {
      const res = await fetch('/api/admin/campaigns', { headers: await authHeaders(false) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Could not load campaigns.');
      setCampaignAudiences({
        customers: data.customers || [],
        prospects: data.prospects || [],
      });
      setCampaigns(data.campaigns || []);
    } catch (err) {
      setCampaignError(err.message);
    }
  };

  useEffect(() => {
    if (activeTab === 'campaigns' && gate === 'ready') fetchCampaigns();
  }, [activeTab, gate]);

  const toggleCampaignPerson = (email) => {
    setCampaignSelected((prev) =>
      prev.includes(email) ? prev.filter((item) => item !== email) : [...prev, email]
    );
  };

  const toggleAllShown = () => {
    const shownEmails = campaignPeopleShown.map((person) => person.email);
    const everyShownSelected = shownEmails.every((email) => campaignSelected.includes(email));

    setCampaignSelected((prev) =>
      everyShownSelected
        ? prev.filter((email) => !shownEmails.includes(email))
        : Array.from(new Set([...prev, ...shownEmails]))
    );
  };

  const handleCampaignImages = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;

    setCampaignError('');
    setUploadingImage(true);

    try {
      const room = Math.max(0, 6 - campaignDraft.images.length);

      for (const file of files.slice(0, room)) {
        if (!file.type.startsWith('image/')) {
          setCampaignError('Only image files can be attached.');
          continue;
        }

        const prepared = await compressImage(file);
        const form = new FormData();
        form.append('file', prepared);

        const res = await fetch('/api/admin/campaigns/upload', {
          method: 'POST',
          headers: await authHeaders(false),
          body: form,
        });
        const data = await res.json();

        if (!res.ok) {
          setCampaignError(data.message || 'Image upload failed.');
          continue;
        }

        setCampaignDraft((prev) => ({ ...prev, images: [...prev.images, data.url] }));
      }

      if (files.length > room) setCampaignError('A campaign can include up to 6 images.');
    } catch (err) {
      setCampaignError(err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSendTest = async () => {
    setCampaignError('');
    setCampaignNotice('');

    if (!campaignDraft.subject.trim() || !campaignDraft.body.trim()) {
      setCampaignError('Add a subject line and a message before sending a test.');
      return;
    }

    setCampaignLoading(true);

    try {
      const res = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers: await authHeaders(),
        body: JSON.stringify({
          action: 'test',
          to: adminEmail,
          subject: campaignDraft.subject,
          body: campaignDraft.body,
          imageUrls: campaignDraft.images,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Test send failed.');
      setCampaignNotice(`Test email sent to ${data.to}.`);
    } catch (err) {
      setCampaignError(err.message);
    } finally {
      setCampaignLoading(false);
    }
  };

  const handleSendCampaign = async () => {
    setConfirmCampaign(false);
    setCampaignError('');
    setCampaignNotice('');

    if (!campaignRecipients.length) {
      setCampaignError('Choose at least one recipient.');
      return;
    }

    setCampaignProgress({ phase: 'preparing', total: 0, sent: 0, failed: 0 });

    try {
      const headers = await authHeaders();

      const prepRes = await fetch('/api/admin/campaigns', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          action: 'prepare',
          subject: campaignDraft.subject,
          body: campaignDraft.body,
          imageUrls: campaignDraft.images,
          audience: campaignAudience,
          emails: campaignSelected,
        }),
      });
      const prep = await prepRes.json();
      if (!prepRes.ok) throw new Error(prep.message || 'Could not prepare the campaign.');

      const { campaignId, total } = prep;
      setCampaignProgress({ phase: 'sending', total, sent: 0, failed: 0 });

      let remaining = total;
      let guard = 0;

      while (remaining > 0 && guard < 200) {
        guard += 1;

        let batch = null;
        let lastError = '';

        for (let attempt = 0; attempt < 3 && !batch; attempt += 1) {
          try {
            const res = await fetch('/api/admin/campaigns', {
              method: 'POST',
              headers,
              body: JSON.stringify({ action: 'sendBatch', campaignId, limit: 20 }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Batch failed.');
            batch = data;
          } catch (err) {
            lastError = err.message;
            await new Promise((resolve) => setTimeout(resolve, 1200 * (attempt + 1)));
          }
        }

        if (!batch) {
          throw new Error(`Stopped after ${total - remaining} of ${total}. ${lastError}`);
        }

        remaining = batch.remaining;
        setCampaignProgress({
          phase: batch.done ? 'done' : 'sending',
          total,
          sent: batch.sent,
          failed: batch.failed,
        });

        if (!batch.done) await new Promise((resolve) => setTimeout(resolve, 700));
      }

      setCampaignNotice('Campaign finished. See the delivery counts below.');
      setCampaignDraft({ subject: '', body: '', images: [] });
      setCampaignSelected([]);
      fetchCampaigns();
    } catch (err) {
      setCampaignError(err.message);
      setCampaignProgress(null);
      fetchCampaigns();
    }
  };

  const fetchAuditLogs = async () => {
    const mockLogs = [
      { id: 1, action: "System Boot", details: "Core services initialized", time: new Date(Date.now() - 3600000).toLocaleTimeString(), type: "info" },
      { id: 2, action: "Failed Login Attempt", details: "Invalid credentials from IP 192.168.1.45", time: new Date(Date.now() - 1800000).toLocaleTimeString(), type: "warning" },
      { id: 3, action: "Database Backup", details: "Automated snapshot completed successfully", time: new Date(Date.now() - 900000).toLocaleTimeString(), type: "success" }
    ];
    setSystemLogs(mockLogs);
  };

  const fetchPlatformSettings = async () => {
    try {
      // Syncs toggles with your Supabase database
      const { data } = await supabase.from('system_settings').select('*').single();
      if (data) {
        setPlatformSettings({
          maintenanceMode: data.maintenance_mode,
          allowSignups: data.allow_signups,
          require2FA: data.require_2fa,
          emailAlerts: data.email_alerts
        });
      }
    } catch (err) {
      console.error('No settings table found yet.', err);
    }
  };

  // --- UPDATED: SECURE GLOBAL TOGGLES & EMAIL NOTIFICATIONS ---
  const handleToggleSetting = async (settingKey) => {
    setSettingsLoading(true);
    const newValue = !platformSettings[settingKey];
    
    // Optimistic UI update
    setPlatformSettings(prev => ({ ...prev, [settingKey]: newValue }));

    try {
      // 1. Map camelCase to snake_case for DB
      const dbKeyMap = {
        maintenanceMode: 'maintenance_mode',
        allowSignups: 'allow_signups',
        require2FA: 'require_2fa',
        emailAlerts: 'email_alerts'
      };

      // 2. Update Database via Supabase
      await supabase.from('system_settings').update({ [dbKeyMap[settingKey]]: newValue }).eq('id', 1);

      // 3. Trigger Customer Emails if Maintenance Mode is Activated
      if (settingKey === 'maintenanceMode') {
        if (newValue === true) {
          const customers = users.filter(u => u.role === 'customer');
          const { data: { session } } = await supabase.auth.getSession();
          const authHeaders = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session?.access_token}`
          };
          
          // Dispatch emails asynchronously so it doesn't freeze the dashboard
          Promise.allSettled(customers.map(customer => 
            fetch('/api/admin/send-email', {
              method: 'POST',
              headers: authHeaders,
              body: JSON.stringify({
                to: customer.email,
                subject: "SYSTEM ALERT: Scheduled Maintenance Notification",
                message: `Hello ${customer.first_name || 'Customer'},\n\nThis is an automated alert from Brains Central Command.\n\nThe platform has been placed into Maintenance Mode by our engineering team. During this time, some SaaS modules and integrations may experience brief interruptions or degraded performance.\n\nWe apologize for any inconvenience and will notify you once full system stability is restored.\n\nRegards,\nThe Brains Tech Team`
              })
            })
          ));
          alert("Maintenance Mode Activated! Alert emails are being dispatched to all active customers.");
        } else {
          alert("Maintenance Mode Deactivated. Systems returned to normal operation.");
        }
      }

      // Log the configuration change
      setSystemLogs(prev => [
        { 
          id: Date.now(), 
          action: "Config Update", 
          details: `${settingKey} set to ${newValue}`, 
          time: new Date().toLocaleTimeString(), 
          type: "warning" 
        },
        ...prev
      ]);
    } catch (err) {
      setPlatformSettings(prev => ({ ...prev, [settingKey]: !newValue }));
      alert("Failed to update system setting.");
    } finally {
      setSettingsLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    setProcessingId('creating-admin');
    
    const email = e.target.email.value;
    const firstName = e.target.firstName.value;
    const lastName = e.target.lastName.value;
    
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'createAdmin',
          email,
          firstName,
          lastName
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to create admin account.");

      alert(data.message || "Administrator created. A one-time access code has been emailed to them.");
      setAddAdminModal(false);
      fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAndDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      setProcessingId(userToDelete.id);
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId: userToDelete.id }),
      });
      setUserToDelete(null); 
      fetchUsers(); 
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const confirmAndCancelSubscription = async () => {
    if (!subscriptionToCancel) return;
    try {
      setProcessingId(subscriptionToCancel.id);
      await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancelSubscription', userId: subscriptionToCancel.id }),
      });
      setSubscriptionToCancel(null); 
      fetchUsers(); 
    } catch (err) {
      alert(`Error canceling subscription: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleTrialAction = async (userId, email, name, action) => {
    try {
      setProcessingId(userId);
      await fetch('/api/admin/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, name, action }),
      });
      fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleViewSubscription = async (user, moduleId) => {
    const fullMod = ALL_MODULES.find(m => m.id === moduleId);
    setViewSubModal({ user, module: fullMod, billingInfo: null, loading: true });
    try {
      const res = await fetch(`/api/user/billing?userId=${user.id}`);
      const data = await res.json();
      setViewSubModal({ user, module: fullMod, billingInfo: data, loading: false });
    } catch (err) {
      setViewSubModal({ user, module: fullMod, billingInfo: null, loading: false, error: true });
    }
  };

  const fetchThread = async (inquiryId) => {
    setThreadLoading(true);
    try {
      const res = await fetch(`/api/admin/inquiries?id=${encodeURIComponent(inquiryId)}`);
      const data = await res.json();
      if (res.ok) setThread(data.messages || []);
    } catch (err) {
      console.error('Failed to load thread:', err);
    } finally {
      setThreadLoading(false);
    }
  };

  const openInquiry = (inq) => {
    setViewInquiryModal(inq);
    setThread([]);
    fetchThread(inq.id);
  };

  const toggleInquiryStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Pending' ? 'Contacted' : 'Pending';
    setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
    try {
      await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', id, newStatus })
      });
    } catch (err) {
      setInquiries(prev => prev.map(inq => inq.id === id ? { ...inq, status: currentStatus } : inq));
    }
  };

  const deleteInquiry = async (id) => {
    const previousInquiries = [...inquiries];
    setInquiries(prev => prev.filter(inq => inq.id !== id));
    try {
      await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id })
      });
    } catch (err) {
      setInquiries(previousInquiries);
    }
  };

  const handleSendEmailReply = async (e) => {
    e.preventDefault();
    setProcessingId('email-sending');

    const fileInput = e.target.attachment.files[0];
    let attachmentData = null;

    if (fileInput) {
      const toBase64 = file => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]); 
        reader.onerror = error => reject(error);
      });
      
      const base64Content = await toBase64(fileInput);
      attachmentData = {
        filename: fileInput.name,
        base64Content: base64Content
      };
    }

    const inquiry = emailReplyModal;

    const payload = {
      action: 'reply',
      inquiryId: inquiry.id,
      subject: e.target.subject.value,
      message: e.target.message.value,
      attachment: attachmentData
    };

    try {
      const res = await fetch('/api/admin/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send email');

      setEmailReplyModal(null);
      await fetchInquiries();
      // Reopen the thread so the sent reply is visible in context.
      openInquiry({ ...inquiry, status: 'Contacted' });
    } catch (err) {
      alert(`Error sending email: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPwStatus({ type: '', message: '' });

    const { current, next, confirm } = pwForm;

    if (next.length < 8) {
      setPwStatus({ type: 'error', message: 'New password must be at least 8 characters.' });
      return;
    }
    if (next !== confirm) {
      setPwStatus({ type: 'error', message: 'The new passwords do not match.' });
      return;
    }
    if (next === current) {
      setPwStatus({ type: 'error', message: 'Choose a password different from your temporary one.' });
      return;
    }

    setPwSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) throw new Error('Your session expired. Please sign in again.');

      // Re-authenticate first. updateUser() alone does not ask for the current
      // password, so anyone with a borrowed tab could otherwise take the account.
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: current,
      });
      if (authError) throw new Error('Your current password is incorrect.');

      const { error: updateError } = await supabase.auth.updateUser({ password: next });
      if (updateError) throw updateError;

      // Fire-and-forget confirmation email, scoped to the new session.
      const { data: { session: fresh } } = await supabase.auth.getSession();
      fetch('/api/auth/password-changed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${fresh?.access_token}`,
        },
      }).catch(() => {});

      setPwForm({ current: '', next: '', confirm: '' });
      setPwStatus({
        type: 'success',
        message: 'Password updated. Use it the next time you sign in.',
      });
    } catch (err) {
      setPwStatus({ type: 'error', message: err.message || 'Could not update the password.' });
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  const displayedUsers = users.filter(user => {
    if (activeTab === 'admins' && user.role !== 'admin') return false;
    if (activeTab === 'customers' && user.role !== 'customer') return false;
    
    if (activeTab === 'customers') {
      if (statusFilter !== 'all' && (user.status || 'new') !== statusFilter) return false;
      if (subFilter === 'subscribed' && (!user.subscribed_modules || user.subscribed_modules.length === 0)) return false;
      if (subFilter === 'unsubscribed' && (user.subscribed_modules && user.subscribed_modules.length > 0)) return false;
    }
    
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      if (!fullName.includes(query) && !(user.email || '').toLowerCase().includes(query) && !(user.company || '').toLowerCase().includes(query)) return false;
    }
    return true;
  });

  const exportCustomersCsv = () => {
    if (displayedUsers.length === 0) return;

    const columns = [
      ['First Name', (u) => u.first_name],
      ['Last Name', (u) => u.last_name],
      ['Email', (u) => u.email],
      ['Company', (u) => u.company],
      ['Role', (u) => u.role],
      ['Status', (u) => u.status || 'new'],
      ['Subscribed Modules', (u) => (u.subscribed_modules || []).join('; ')],
      ['Email Confirmed', (u) => (u.email_confirmed ? 'Yes' : 'No')],
      ['Last Sign In', (u) => (u.last_sign_in ? new Date(u.last_sign_in).toLocaleString() : '')],
      ['Created At', (u) => (u.created_at ? new Date(u.created_at).toLocaleString() : '')],
    ];

    const escapeCell = (value) => {
      let text = value === null || value === undefined ? '' : String(value);
      // Keep spreadsheet apps from evaluating a cell as a formula.
      if (/^[=+\-@]/.test(text)) text = "'" + text;
      return '"' + text.replace(/"/g, '""') + '"';
    };

    const lines = [
      columns.map(([label]) => escapeCell(label)).join(','),
      ...displayedUsers.map((user) => columns.map(([, read]) => escapeCell(read(user))).join(',')),
    ];

    const blob = new Blob(['\uFEFF', lines.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const customerInquiryCount = inquiries.filter((inq) => inq.is_customer).length;
  const prospectInquiryCount = inquiries.length - customerInquiryCount;

  const displayedInquiries = inquiries.filter(inq => {
    if (inquiriesFilter !== 'All' && inq.type !== inquiriesFilter) return false;
    if (inquiryAudience === 'customer' && !inq.is_customer) return false;
    if (inquiryAudience === 'prospect' && inq.is_customer) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      return (inq.name && inq.name.toLowerCase().includes(query)) || 
             (inq.email && inq.email.toLowerCase().includes(query)) || 
             (inq.company && inq.company.toLowerCase().includes(query)) || 
             (inq.subject && inq.subject.toLowerCase().includes(query));
    }
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b14]">
        <ParticleBackground />
        <div className="text-lg text-indigo-400 animate-pulse z-10 font-mono tracking-widest">
          ESTABLISHING SECURE CONNECTION...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b14]">
        <ParticleBackground />
        <div className="bg-[#13172e]/90 border border-red-500/50 p-8 rounded-xl z-10 text-center shadow-[0_0_30px_rgba(239,68,68,0.15)]">
          <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <div className="text-red-400 font-bold text-xl mb-2">SYSTEM ERROR</div>
          <div className="text-indigo-200">{error}</div>
          <button onClick={fetchUsers} className="mt-6 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-800/50 px-6 py-2 rounded transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (gate !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090b14] p-4 font-sans text-gray-100">
        {gate === 'checking' && (
          <div className="text-indigo-400 animate-pulse font-mono tracking-widest text-sm">
            Verifying administrator access...
          </div>
        )}

        {gate === 'denied' && (
          <div className="w-full max-w-md bg-[#13172e] border border-red-500/40 rounded-2xl p-8 text-center">
            <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Access denied</h2>
            <p className="text-xs text-indigo-300/80 mb-6">{gateMessage}</p>
            <button onClick={handleLogout} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl transition-colors">
              Back to Sign In
            </button>
          </div>
        )}

        {gate === 'code' && (
          <form onSubmit={handleUnlockAdmin} className="w-full max-w-md bg-[#13172e] border border-fuchsia-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.2)]">
            <div className="w-14 h-14 bg-fuchsia-500/10 border border-fuchsia-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Lock className="w-7 h-7 text-fuchsia-400" />
            </div>
            <h2 className="text-xl font-bold text-white text-center mb-2">Administrator verification</h2>
            <p className="text-xs text-indigo-300/80 text-center mb-6 leading-relaxed">
              Enter the one-time code sent to your email. This is required once, then your email and password are enough.
            </p>

            {gateMessage && (
              <p className="mb-4 text-center text-xs font-semibold text-red-400">{gateMessage}</p>
            )}

            <input
              type="text"
              inputMode="numeric"
              autoComplete="off"
              maxLength={10}
              required
              autoFocus
              value={gateCode}
              onChange={(e) => setGateCode(e.target.value.replace(/\D/g, '').slice(0, 10))}
              className="w-full bg-[#090b14] border border-fuchsia-800/60 rounded-xl px-4 py-3 text-center text-xl font-mono tracking-[0.3em] text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50"
              placeholder="••••••••"
            />

            <button type="submit" className="w-full mt-5 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-3 rounded-xl transition-all active:scale-95">
              Unlock Dashboard
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-transparent text-gray-100 font-sans selection:bg-fuchsia-500/30">
      <ParticleBackground />

      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className="w-20 lg:w-72 flex-shrink-0 bg-[#060810]/80 border-r border-indigo-900/50 backdrop-blur-xl flex flex-col z-20 transition-all duration-300">
        <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-indigo-900/50">
          <img src="/brains-logo.png" alt="Brains" className="h-8 w-auto hidden lg:block" />
          <ShieldAlert className="w-8 h-8 text-fuchsia-500 lg:hidden" />
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3 lg:px-4">
          <div className="hidden lg:block text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest px-4 pb-2">Platform</div>
          
          <button onClick={() => setActiveTab('overview')} className={`flex items-center gap-4 px-3 py-3 lg:px-4 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-fuchsia-600/20 border border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'text-indigo-300 hover:bg-[#13172e]/80 hover:text-white'}`}>
            <LayoutDashboard className="w-6 h-6" strokeWidth={1.5} />
            <span className="hidden lg:block font-semibold">Overview</span>
          </button>

          <div className="hidden lg:block text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest px-4 pt-4 pb-2">User Management</div>

          <button onClick={() => setActiveTab('admins')} className={`flex items-center gap-4 px-3 py-3 lg:px-4 rounded-xl transition-all ${activeTab === 'admins' ? 'bg-fuchsia-600/20 border border-fuchsia-500/50 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]' : 'text-indigo-300 hover:bg-[#13172e]/80 hover:text-white'}`}>
            <ShieldAlert className="w-6 h-6" strokeWidth={1.5} />
            <span className="hidden lg:block font-semibold">Administrators</span>
          </button>
          
          <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-4 px-3 py-3 lg:px-4 rounded-xl transition-all ${activeTab === 'customers' ? 'bg-blue-600/20 border border-blue-500/50 text-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.15)]' : 'text-indigo-300 hover:bg-[#13172e]/80 hover:text-white'}`}>
            <Users className="w-6 h-6" strokeWidth={1.5} />
            <span className="hidden lg:block font-semibold">Customers</span>
          </button>

          <button onClick={() => setActiveTab('inquiries')} className={`flex items-center justify-between px-3 py-3 lg:px-4 rounded-xl transition-all ${activeTab === 'inquiries' ? 'bg-emerald-600/20 border border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'text-indigo-300 hover:bg-[#13172e]/80 hover:text-white'}`}>
            <div className="flex items-center gap-4">
              <MessageSquare className="w-6 h-6" strokeWidth={1.5} />
              <span className="hidden lg:block font-semibold">Inquiries</span>
            </div>
            {inquiries.filter(i => i.status === 'Pending').length > 0 && (
              <span className="hidden lg:flex w-5 h-5 items-center justify-center bg-emerald-500 text-white text-[10px] font-bold rounded-full">
                {inquiries.filter(i => i.status === 'Pending').length}
              </span>
            )}
          </button>

          <div className="hidden lg:block text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest px-4 pt-4 pb-2">Growth</div>

          <button onClick={() => setActiveTab('campaigns')} className={`flex items-center justify-between px-3 py-3 lg:px-4 rounded-xl transition-all ${activeTab === 'campaigns' ? 'bg-rose-600/20 border border-rose-500/50 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.15)]' : 'text-indigo-300 hover:bg-[#13172e]/80 hover:text-white'}`}>
            <div className="flex items-center gap-4">
              <Megaphone className="w-6 h-6" strokeWidth={1.5} />
              <span className="hidden lg:block font-semibold">Email Campaigns</span>
            </div>
          </button>

          <div className="hidden lg:block text-[10px] font-bold text-indigo-400/60 uppercase tracking-widest px-4 pt-4 pb-2">System</div>

          <button onClick={() => setActiveTab('settings')} className={`flex items-center gap-4 px-3 py-3 lg:px-4 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600/20 border border-indigo-500/50 text-white shadow-[0_0_15px_rgba(99,102,241,0.15)]' : 'text-indigo-300 hover:bg-[#13172e]/80 hover:text-white'}`}>
            <Settings className="w-6 h-6" strokeWidth={1.5} />
            <span className="hidden lg:block font-semibold">Settings</span>
          </button>
        </div>

        <div className="p-4 border-t border-indigo-900/50">
          <button onClick={() => setShowLogoutConfirm(true)} className="flex items-center justify-center lg:justify-start gap-4 w-full px-3 py-3 lg:px-4 text-indigo-300 hover:text-fuchsia-400 transition-colors rounded-xl hover:bg-indigo-900/30">
            <LogOut className="w-6 h-6" strokeWidth={1.5} />
            <span className="hidden lg:block font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <header className="h-20 flex items-center justify-between px-8 border-b border-indigo-900/50 bg-[#090b14]/50 backdrop-blur-sm">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide uppercase">Admin Command</h1>
            <p className="text-xs text-indigo-400 font-mono hidden sm:block">Access Level: Tier 1 Security</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">System Online</span>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 connector-scrollbar">
          
          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="animate-fadeIn max-w-[1600px] mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#13172e]/80 backdrop-blur-md rounded-2xl border border-fuchsia-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-6 flex items-center justify-between hover:border-fuchsia-500 transition-colors cursor-pointer" onClick={() => setActiveTab('admins')}>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Total Admins</h3>
                    <p className="text-4xl font-black text-fuchsia-400">{users.filter(u => u.role === 'admin').length}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-fuchsia-500/10 border border-fuchsia-500/20 flex items-center justify-center text-fuchsia-400"><ShieldAlert className="w-8 h-8" strokeWidth={1.5}/></div>
                </div>
                
                <div className="bg-[#13172e]/80 backdrop-blur-md rounded-2xl border border-blue-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-6 flex items-center justify-between hover:border-blue-500 transition-colors cursor-pointer" onClick={() => setActiveTab('customers')}>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Active Customers</h3>
                    <p className="text-4xl font-black text-blue-400">{users.filter(u => u.role === 'customer').length}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400"><Users className="w-8 h-8" strokeWidth={1.5}/></div>
                </div>

                <div className="bg-[#13172e]/80 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-6 flex items-center justify-between hover:border-emerald-500 transition-colors cursor-pointer" onClick={() => setActiveTab('inquiries')}>
                  <div>
                    <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-wide mb-2">Pending Inquiries</h3>
                    <p className="text-4xl font-black text-emerald-400">{inquiries.filter(i => i.status === 'Pending').length}</p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400"><MessageSquare className="w-8 h-8" strokeWidth={1.5}/></div>
                </div>
              </div>

              <div className="bg-[#13172e]/50 border border-indigo-800/30 rounded-2xl p-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <ShieldAlert className="w-16 h-16 text-indigo-500/40 mx-auto mb-4" strokeWidth={1} />
                  <h3 className="text-xl font-bold text-white mb-2">System Metrics Active</h3>
                  <p className="text-indigo-300/80 text-sm max-w-md mx-auto">Select a module from the sidebar to manage users, update permissions, or process incoming inquiries.</p>
                </div>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="animate-fadeIn max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Platform Controls & Health */}
              <div className="lg:col-span-1 space-y-8">
                
                {/* Account Security: change temporary password */}
                <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-fuchsia-500/10 rounded-full blur-[50px] pointer-events-none"></div>

                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-1 flex items-center gap-2 relative z-10">
                    <Lock className="w-4 h-4 text-fuchsia-400" /> Account Security
                  </h3>
                  <p className="text-[11px] text-indigo-400/80 mb-5 relative z-10">
                    Replace the temporary password you were issued after signing in.
                  </p>

                  <form onSubmit={handleChangePassword} className="space-y-3 relative z-10">
                    {[
                      { key: 'current', label: 'Current / Temporary Password', autoComplete: 'current-password' },
                      { key: 'next', label: 'New Password', autoComplete: 'new-password' },
                      { key: 'confirm', label: 'Confirm New Password', autoComplete: 'new-password' },
                    ].map((field) => (
                      <div key={field.key}>
                        <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                          {field.label}
                        </label>
                        <input
                          type="password"
                          required
                          minLength={field.key === 'current' ? undefined : 8}
                          autoComplete={field.autoComplete}
                          value={pwForm[field.key]}
                          onChange={(e) => setPwForm((prev) => ({ ...prev, [field.key]: e.target.value }))}
                          className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50"
                          placeholder="••••••••"
                        />
                      </div>
                    ))}

                    {pwStatus.message && (
                      <div className={`text-[11px] font-semibold rounded-lg px-3 py-2 border ${pwStatus.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
                        {pwStatus.message}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={pwSaving}
                      className="w-full bg-fuchsia-600 hover:bg-fuchsia-500 text-white font-bold py-2.5 rounded-xl text-sm transition-all active:scale-95 disabled:opacity-50"
                    >
                      {pwSaving ? 'Updating...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* System Health Module */}
                <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[50px] pointer-events-none"></div>
                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" /> System Health
                  </h3>
                  
                  <div className="space-y-5 relative z-10">
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-indigo-200 font-semibold flex items-center gap-2"><Database className="w-3.5 h-3.5" /> Supabase Edge</span>
                        <span className="text-emerald-400 font-mono">14ms ping</span>
                      </div>
                      <div className="w-full bg-[#090b14] rounded-full h-1.5 border border-indigo-900/50">
                        <div className="bg-emerald-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ width: '98%' }}></div>
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-indigo-200 font-semibold flex items-center gap-2"><Server className="w-3.5 h-3.5" /> Vercel Compute</span>
                        <span className="text-emerald-400 font-mono">Optimal</span>
                      </div>
                      <div className="w-full bg-[#090b14] rounded-full h-1.5 border border-indigo-900/50">
                        <div className="bg-emerald-500 h-1.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" style={{ width: '85%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Core Settings Toggles */}
                <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Power className="w-4 h-4 text-fuchsia-400" /> Global Controls
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-[#090b14]/50 border border-indigo-800/30 rounded-xl">
                      <div>
                        <div className="text-sm font-bold text-white">Maintenance Mode</div>
                        <div className="text-[10px] text-indigo-400">Lock out non-admin users</div>
                      </div>
                      <button 
                        disabled={settingsLoading}
                        onClick={() => handleToggleSetting('maintenanceMode')}
                        className={`w-12 h-6 rounded-full transition-all duration-300 relative p-1 shadow-inner ${platformSettings.maintenanceMode ? 'bg-amber-500 border border-amber-400' : 'bg-[#13172e] border border-indigo-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${platformSettings.maintenanceMode ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-[#090b14]/50 border border-indigo-800/30 rounded-xl">
                      <div>
                        <div className="text-sm font-bold text-white">Allow Public Signups</div>
                        <div className="text-[10px] text-indigo-400">Accept new SaaS trials</div>
                      </div>
                      <button 
                        disabled={settingsLoading}
                        onClick={() => handleToggleSetting('allowSignups')}
                        className={`w-12 h-6 rounded-full transition-all duration-300 relative p-1 shadow-inner ${platformSettings.allowSignups ? 'bg-emerald-500 border border-emerald-400' : 'bg-[#13172e] border border-indigo-700'}`}
                      >
                        <div className={`w-4 h-4 bg-white rounded-full transition-transform duration-300 shadow-md ${platformSettings.allowSignups ? 'translate-x-6' : 'translate-x-0'}`} />
                      </button>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Security & Audit Logs */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Security Configurations */}
                <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-6 shadow-xl">
                  <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-blue-400" /> Security Policies
                  </h3>
                  
                  <div className="grid sm:grid-cols-2 gap-4">
                    <label className="flex items-start gap-3 p-4 bg-[#090b14]/50 border border-indigo-800/30 rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors group">
                      <input 
                        type="checkbox" 
                        checked={platformSettings.require2FA} 
                        onChange={() => handleToggleSetting('require2FA')}
                        className="mt-1 w-4 h-4 accent-blue-500" 
                      />
                      <div>
                        <span className="text-sm font-bold text-white block">Require 2FA</span>
                        <span className="text-xs text-indigo-400 block mt-1 leading-relaxed">Force all Administrators to use an authenticator app.</span>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 p-4 bg-[#090b14]/50 border border-indigo-800/30 rounded-xl cursor-pointer hover:border-blue-500/50 transition-colors group">
                      <input 
                        type="checkbox" 
                        checked={platformSettings.emailAlerts} 
                        onChange={() => handleToggleSetting('emailAlerts')}
                        className="mt-1 w-4 h-4 accent-blue-500" 
                      />
                      <div>
                        <span className="text-sm font-bold text-white block">IP Anomaly Alerts</span>
                        <span className="text-xs text-indigo-400 block mt-1 leading-relaxed">Email tier-1 admins upon login from unknown networks.</span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Live Audit Log Ledger */}
                <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl flex flex-col shadow-xl overflow-hidden h-[400px]">
                  <div className="px-6 py-4 border-b border-indigo-800/50 bg-[#090b14]/50 flex justify-between items-center">
                    <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-widest flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-fuchsia-400" /> System Audit Ledger
                    </h3>
                    <span className="text-[10px] font-mono text-indigo-400 bg-[#13172e] px-2 py-1 rounded border border-indigo-800/50">LIVE</span>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-2 connector-scrollbar">
                    {systemLogs.length > 0 ? (
                      <div className="space-y-1">
                        {systemLogs.map((log) => (
                          <div key={log.id} className="flex items-start gap-3 p-3 hover:bg-[#090b14]/40 rounded-lg transition-colors border border-transparent hover:border-indigo-800/30">
                            <span className="text-[10px] font-mono text-indigo-400/60 min-w-[70px] mt-0.5">{log.time}</span>
                            <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                              log.type === 'error' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]' :
                              log.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]' :
                              log.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]' :
                              'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]'
                            }`}></span>
                            <div>
                              <p className="text-sm font-bold text-indigo-100">{log.action}</p>
                              <p className="text-xs text-indigo-400/80 mt-0.5">{log.details}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-sm text-indigo-400/60 italic">
                        No recent system events detected.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* EMAIL CAMPAIGNS TAB */}
          {activeTab === 'campaigns' && (
            <div className="animate-fadeIn max-w-[1600px] mx-auto space-y-6">

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-3">
                    <Megaphone className="w-7 h-7 text-rose-400" /> Email Campaigns
                  </h2>
                  <p className="text-sm text-indigo-300/80 mt-1">
                    Compose one professional email and send it to the customers and prospects you choose.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-300 font-bold">
                    {campaignAudiences.customers.length} customers
                  </span>
                  <span className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 font-bold">
                    {campaignAudiences.prospects.length} prospects
                  </span>
                </div>
              </div>

              {campaignError && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/40 rounded-xl px-4 py-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-200">{campaignError}</p>
                </div>
              )}

              {campaignNotice && (
                <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/40 rounded-xl px-4 py-3">
                  <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-200">{campaignNotice}</p>
                </div>
              )}

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                {/* COMPOSER */}
                <div className="xl:col-span-2 bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
                  <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
                    <Mail className="w-5 h-5 text-rose-400" /> Compose
                  </h3>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Subject line</label>
                      <input
                        type="text"
                        maxLength={200}
                        value={campaignDraft.subject}
                        onChange={(e) => setCampaignDraft((prev) => ({ ...prev, subject: e.target.value }))}
                        placeholder="e.g. New: Housekeeper IoT automation for your properties"
                        className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-2.5 text-sm text-white placeholder-indigo-500/50 focus:outline-none focus:border-rose-500/50"
                      />
                      <div className="text-right text-[10px] text-indigo-500 mt-1">{campaignDraft.subject.length}/200</div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Message</label>
                      <textarea
                        rows={12}
                        value={campaignDraft.body}
                        onChange={(e) => setCampaignDraft((prev) => ({ ...prev, body: e.target.value }))}
                        placeholder={"Hi there,\n\nWe build systems for hotels, landlords and property teams..."}
                        className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-3 text-sm text-white placeholder-indigo-500/50 focus:outline-none focus:border-rose-500/50 leading-relaxed"
                      />
                      <p className="text-[10px] text-indigo-500 mt-1">
                        Plain text. Leave a blank line between paragraphs — it is rendered as a styled email.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">
                        Images ({campaignDraft.images.length}/6)
                      </label>

                      <label
                        className={'flex items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 transition-all ' +
                          (uploadingImage || campaignDraft.images.length >= 6
                            ? 'border-indigo-800/60 bg-[#090b14]/30 cursor-not-allowed opacity-60'
                            : 'border-indigo-700/70 bg-[#090b14]/60 hover:border-rose-500/60 cursor-pointer')}
                      >
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          disabled={uploadingImage || campaignDraft.images.length >= 6}
                          onChange={(e) => {
                            handleCampaignImages(e.target.files);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                        {uploadingImage ? (
                          <Loader2 className="w-5 h-5 text-rose-400 animate-spin" />
                        ) : (
                          <Upload className="w-5 h-5 text-rose-400" />
                        )}
                        <span className="text-xs text-indigo-300">
                          {uploadingImage ? 'Uploading...' : 'Upload product shots or screenshots (JPG, PNG, WebP)'}
                        </span>
                      </label>

                      {campaignDraft.images.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                          {campaignDraft.images.map((url) => (
                            <div key={url} className="relative group rounded-xl overflow-hidden border border-indigo-800/60 bg-[#090b14]">
                              <img src={url} alt="" className="w-full h-24 object-cover" />
                              <button
                                type="button"
                                onClick={() => setCampaignDraft((prev) => ({ ...prev, images: prev.images.filter((item) => item !== url) }))}
                                className="absolute top-1.5 right-1.5 bg-[#090b14]/90 border border-red-500/50 text-red-400 rounded-full p-1 hover:bg-red-500 hover:text-white transition-all"
                                title="Remove image"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* AUDIENCE */}
                <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.4)] flex flex-col">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" /> Audience
                  </h3>

                  <div className="space-y-2">
                    {[
                      { id: 'customers', label: 'Existing customers', desc: 'Accounts in your customer database', count: campaignAudiences.customers.length },
                      { id: 'prospects', label: 'Potential customers', desc: 'Inquiries with no account yet', count: campaignAudiences.prospects.length },
                      { id: 'all', label: 'Everyone', desc: 'Customers plus prospects', count: campaignAudiences.customers.length + campaignAudiences.prospects.length },
                      { id: 'custom', label: 'Choose specific people', desc: 'Pick recipients one by one', count: campaignSelected.length }
                    ].map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setCampaignAudience(option.id)}
                        className={'w-full text-left rounded-xl border p-3 transition-all ' +
                          (campaignAudience === option.id
                            ? 'border-rose-500/60 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.12)]'
                            : 'border-indigo-800/60 bg-[#090b14]/50 hover:border-indigo-600')}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-white">{option.label}</span>
                          <span className="text-xs font-black text-rose-300">{option.count}</span>
                        </div>
                        <p className="text-[11px] text-indigo-400/80 mt-0.5">{option.desc}</p>
                      </button>
                    ))}
                  </div>

                  {campaignAudience === 'custom' && (
                    <div className="mt-3 border border-indigo-800/60 rounded-xl overflow-hidden">
                      <div className="p-2 border-b border-indigo-800/60 bg-[#090b14]/60 space-y-2">
                        <input
                          type="text"
                          value={campaignAudienceSearch}
                          onChange={(e) => setCampaignAudienceSearch(e.target.value)}
                          placeholder="Search name, email, company..."
                          className="w-full bg-[#090b14] border border-indigo-700/60 rounded-lg px-3 py-1.5 text-xs text-white placeholder-indigo-500/60 focus:outline-none focus:border-rose-500/50"
                        />
                        <button
                          type="button"
                          onClick={toggleAllShown}
                          className="text-[10px] font-bold uppercase tracking-widest text-rose-300 hover:text-rose-200"
                        >
                          {campaignPeopleShown.every((person) => campaignSelected.includes(person.email)) ? 'Clear shown' : 'Select all shown'}
                        </button>
                      </div>

                      <div className="max-h-64 overflow-y-auto connector-scrollbar divide-y divide-indigo-800/40">
                        {campaignPeopleShown.map((person) => (
                          <label key={person.email} className="flex items-start gap-2.5 p-2.5 hover:bg-indigo-900/30 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={campaignSelected.includes(person.email)}
                              onChange={() => toggleCampaignPerson(person.email)}
                              className="mt-0.5 accent-rose-500"
                            />
                            <span className="min-w-0">
                              <span className="block text-xs text-white truncate">{person.name || person.email}</span>
                              <span className="block text-[10px] text-indigo-400 truncate">
                                {person.email} · {person.kind === 'customer' ? 'Customer' : person.source}
                              </span>
                            </span>
                          </label>
                        ))}
                        {campaignPeopleShown.length === 0 && (
                          <div className="p-4 text-center text-[11px] text-indigo-400/60">No matches.</div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-auto pt-5">
                    <div className="flex items-end justify-between mb-3">
                      <span className="text-xs text-indigo-300">Recipients selected</span>
                      <span className="text-2xl font-black text-white">{campaignRecipients.length}</span>
                    </div>

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleSendTest}
                        disabled={campaignLoading || uploadingImage || campaignProgress?.phase === 'sending'}
                        className="w-full flex items-center justify-center gap-2 border border-indigo-700 hover:border-indigo-500 text-indigo-200 hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                      >
                        {campaignLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                        Send test to {adminEmail || 'me'}
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmCampaign(true)}
                        disabled={campaignLoading || uploadingImage || !campaignRecipients.length || campaignProgress?.phase === 'sending'}
                        className="w-full flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-500 text-white px-4 py-3 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(244,63,94,0.25)] active:scale-95 transition-all disabled:opacity-50"
                      >
                        <Send className="w-4 h-4" /> Send Campaign
                      </button>
                    </div>

                    {campaignProgress && (
                      <div className="mt-4 rounded-xl border border-rose-500/40 bg-rose-500/5 p-4">
                        {campaignProgress.phase === 'preparing' ? (
                          <div className="flex items-center gap-2 text-xs text-rose-200">
                            <Loader2 className="w-4 h-4 animate-spin" /> Preparing the recipient list...
                          </div>
                        ) : (
                          <>
                            <div className="flex justify-between text-[11px] font-bold text-rose-200 mb-2">
                              <span>{campaignProgress.phase === 'done' ? 'Campaign complete' : 'Sending...'}</span>
                              <span>{campaignProgress.sent + campaignProgress.failed} / {campaignProgress.total}</span>
                            </div>
                            <div className="h-2 rounded-full bg-[#090b14] overflow-hidden">
                              <div
                                className="h-full bg-rose-500 transition-all"
                                style={{ width: (campaignProgress.total ? Math.round(((campaignProgress.sent + campaignProgress.failed) / campaignProgress.total) * 100) : 0) + '%' }}
                              />
                            </div>
                            <div className="mt-2 flex justify-between text-[10px]">
                              <span className="text-emerald-400">{campaignProgress.sent} delivered</span>
                              <span className="text-red-400">{campaignProgress.failed} failed</span>
                            </div>
                            {campaignProgress.phase === 'done' && (
                              <button
                                type="button"
                                onClick={() => setCampaignProgress(null)}
                                className="mt-3 text-[11px] font-bold text-indigo-300 hover:text-white"
                              >
                                Dismiss
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* HISTORY */}
              <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                <div className="px-6 py-4 border-b border-indigo-800/50 bg-[#090b14]/50">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-rose-400" /> Recent Campaigns
                  </h3>
                </div>

                <div className="overflow-x-auto connector-scrollbar">
                  <table className="min-w-full divide-y divide-indigo-800/30 text-left">
                    <thead className="bg-[#090b14]/50">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Audience</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Recipients</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Delivered</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Failed</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Sent</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-800/30">
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="hover:bg-indigo-900/20 transition-colors">
                          <td className="px-6 py-4 text-sm text-white font-medium max-w-xs truncate">{campaign.subject}</td>
                          <td className="px-6 py-4 text-xs text-indigo-300">
                            {campaign.audience === 'customers' ? 'Existing customers'
                              : campaign.audience === 'prospects' ? 'Potential customers'
                              : campaign.audience === 'all' ? 'Everyone' : 'Selected people'}
                          </td>
                          <td className="px-6 py-4 text-sm text-indigo-200">{campaign.recipient_count}</td>
                          <td className="px-6 py-4 text-sm text-emerald-400 font-bold">{campaign.sent_count}</td>
                          <td className="px-6 py-4 text-sm text-red-400 font-bold">{campaign.failed_count}</td>
                          <td className="px-6 py-4">
                            <span className={'inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ' +
                              (campaign.status === 'sent'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : campaign.status === 'cancelled'
                                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30')}>
                              {campaign.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-indigo-400">
                            {new Date(campaign.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      {campaigns.length === 0 && (
                        <tr>
                          <td colSpan={7} className="px-6 py-10 text-center text-indigo-400/60 text-sm">
                            No campaigns yet. Your first send will appear here.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* SHARED TABLE CONTAINER FOR ADMINS, CUSTOMERS, INQUIRIES */}
          {['admins', 'customers', 'inquiries'].includes(activeTab) && (
            <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.3)] overflow-hidden max-w-[1600px] mx-auto animate-fadeIn flex flex-col max-h-full">
              
              {/* Toolbar */}
              <div className="px-6 py-4 border-b border-indigo-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090b14]/50">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  {activeTab === 'admins' && <><ShieldAlert className="w-5 h-5 text-fuchsia-400"/> Administrator Roster</>}
                  {activeTab === 'customers' && <><Users className="w-5 h-5 text-blue-400"/> Customer Database</>}
                  {activeTab === 'inquiries' && <><MessageSquare className="w-5 h-5 text-emerald-400"/> Form Submissions</>}
                </h3>
                
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-indigo-500" />
                    </div>
                    <input 
                      type="text" 
                      placeholder="Search..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-[#090b14]/80 border border-indigo-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-indigo-500/60 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 w-full transition-all"
                    />
                  </div>

                  {activeTab === 'admins' && (
                    <button 
                      onClick={() => setAddAdminModal(true)}
                      className="bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(217,70,239,0.3)] active:scale-95 whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4"/> Add Admin
                    </button>
                  )}

                  {activeTab === 'customers' && (
                    <>
                      <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="bg-[#090b14]/80 border border-indigo-700/50 rounded-lg px-4 py-2 text-sm text-indigo-200 focus:outline-none focus:border-blue-500/50 cursor-pointer w-full sm:w-36 transition-all outline-none"
                      >
                        <option value="all">All Statuses</option>
                        <option value="new">New Account</option>
                        <option value="pending">Pending Trial</option>
                        <option value="active">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>

                      <select 
                        value={subFilter}
                        onChange={(e) => setSubFilter(e.target.value)}
                        className="bg-[#090b14]/80 border border-indigo-700/50 rounded-lg px-4 py-2 text-sm text-indigo-200 focus:outline-none focus:border-blue-500/50 cursor-pointer w-full sm:w-44 transition-all outline-none"
                      >
                        <option value="all">All Subscriptions</option>
                        <option value="subscribed">Subscribed</option>
                        <option value="unsubscribed">Not Subscribed</option>
                      </select>

                      <button
                        onClick={exportCustomersCsv}
                        disabled={displayedUsers.length === 0}
                        title="Exports the current filtered view"
                        className="bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-700/50 text-sm font-bold py-2 px-4 rounded-lg flex items-center gap-2 transition-all active:scale-95 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Download className="w-4 h-4"/> Export CSV
                      </button>
                    </>
                  )}

                  {activeTab === 'inquiries' && (
                    <>
                      <div className="flex bg-[#090b14]/80 border border-indigo-700/50 rounded-lg p-1 w-full sm:w-auto">
                        {[
                          { id: 'all', label: 'All', count: inquiries.length },
                          { id: 'customer', label: 'Customers', count: customerInquiryCount },
                          { id: 'prospect', label: 'Prospects', count: prospectInquiryCount }
                        ].map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setInquiryAudience(option.id)}
                            className={'flex-1 sm:flex-none px-3 py-1.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all ' +
                              (inquiryAudience === option.id
                                ? 'bg-emerald-600/30 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.15)]'
                                : 'text-indigo-300 hover:text-white')}
                          >
                            {option.label} <span className="opacity-60">{option.count}</span>
                          </button>
                        ))}
                      </div>

                      <select 
                        value={inquiriesFilter}
                        onChange={(e) => setInquiriesFilter(e.target.value)}
                        className="bg-[#090b14]/80 border border-indigo-700/50 rounded-lg px-4 py-2 text-sm text-indigo-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer w-full sm:w-44 transition-all outline-none"
                      >
                        <option value="All">All Categories</option>
                        <option value="SaaS Trial">SaaS Trial</option>
                        <option value="Connector Trial">Connector Trial</option>
                        <option value="Agency Service">Agency Service</option>
                        <option value="Hardware">Hardware</option>
                        <option value="Consultation">Consultation</option>
                      </select>
                    </>
                  )}
                </div>
              </div>
              
              {/* Table Data */}
              <div className="overflow-x-auto flex-1 connector-scrollbar">
                <table className="min-w-full divide-y divide-indigo-800/30 text-left">
                  
                  {['admins', 'customers'].includes(activeTab) && (
                    <thead className="bg-[#090b14]/50 sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Contact</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Role</th>
                        
                        {activeTab === 'customers' && (
                          <>
                            <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Subscription</th>
                          </>
                        )}
                        
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Joined</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                  )}

                  {activeTab === 'inquiries' && (
                    <thead className="bg-[#090b14]/50 sticky top-0 z-10 backdrop-blur-md">
                      <tr>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Received</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Requester</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Subject</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                  )}

                  <tbody className="divide-y divide-indigo-800/30 bg-transparent">
                    
                    {['admins', 'customers'].includes(activeTab) && displayedUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-indigo-900/20 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-white">{user.first_name} {user.last_name}</div>
                          <div className="text-xs text-indigo-400/70 font-mono mt-1">ID: {user.id.substring(0, 8)}...</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm text-indigo-200 flex items-center gap-2">
                            <Mail className="w-3 h-3 opacity-50"/> {user.email}
                          </div>
                          <div className="text-xs text-indigo-400/70 mt-1 uppercase tracking-wider">
                            {user.company || 'Independent'}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${user.role === 'admin' ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
                            {user.role}
                          </span>
                        </td>
                        
                        {activeTab === 'customers' && (
                          <>
                            <td className="px-6 py-5 whitespace-nowrap">
                              {user.status === 'pending' ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING</span>
                              ) : user.status === 'active' ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">APPROVED</span>
                              ) : user.status === 'rejected' ? (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-red-500/20 text-red-400 border border-red-500/30">REJECTED</span>
                              ) : (
                                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">NEW</span>
                              )}
                            </td>
                            
                            <td className="px-6 py-5 whitespace-nowrap">
                              {user.subscribed_modules && user.subscribed_modules.length > 0 ? (
                                <div className="flex flex-wrap gap-1.5 max-w-[150px]">
                                  {user.subscribed_modules.map(mod => {
                                    const fullMod = ALL_MODULES.find(m => m.id === mod);
                                    return (
                                      <button 
                                        key={mod}
                                        onClick={() => handleViewSubscription(user, mod)}
                                        className="px-2 py-1 rounded text-[10px] font-bold bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 hover:bg-fuchsia-500/40 transition-colors cursor-pointer"
                                        title={`View ${fullMod?.shortName} Details`}
                                      >
                                        {fullMod?.shortName || mod.toUpperCase()}
                                      </button>
                                    );
                                  })}
                                </div>
                              ) : (
                                <span className="text-indigo-400/50 text-[10px] font-bold italic border border-indigo-800/30 px-3 py-1 rounded-full">NONE</span>
                              )}
                            </td>
                          </>
                        )}

                        <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-300/80">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-sm font-medium text-right">
                          <div className="flex items-center justify-end gap-2">
                            
                            {activeTab === 'customers' && user.status === 'pending' && (
                              <div className="flex gap-2 mr-2">
                                <button onClick={() => handleTrialAction(user.id, user.email, user.first_name, 'approve')} disabled={processingId === user.id} className="bg-emerald-600/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-400 hover:text-white text-xs font-bold py-1.5 px-3 rounded transition-all disabled:opacity-50 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> APP</button>
                                <button onClick={() => handleTrialAction(user.id, user.email, user.first_name, 'reject')} disabled={processingId === user.id} className="bg-red-600/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 hover:text-white text-xs font-bold py-1.5 px-3 rounded transition-all disabled:opacity-50 flex items-center gap-1"><XCircle className="w-3 h-3"/> REJ</button>
                              </div>
                            )}

                            {/* Removed role select to explicitly disable Admin <-> Customer swaps */}

                            {activeTab === 'customers' && user.subscribed_modules && user.subscribed_modules.length > 0 && (
                              <button 
                                onClick={() => setSubscriptionToCancel({ id: user.id, name: user.first_name })}
                                disabled={processingId === user.id}
                                className="bg-[#090b14] hover:bg-amber-900/30 border border-amber-900/50 text-amber-500/80 hover:text-amber-400 p-1.5 rounded-lg transition-all disabled:opacity-50"
                                title="Cancel Active Subscription"
                              >
                                <CreditCard className="w-4 h-4"/>
                              </button>
                            )}

                            <button 
                              onClick={() => setUserToDelete({ id: user.id, name: user.first_name })}
                              disabled={processingId === user.id}
                              className="bg-[#090b14] hover:bg-red-900/30 border border-red-900/50 text-red-500/70 hover:text-red-400 p-1.5 rounded-lg transition-all disabled:opacity-50"
                              title="Delete Account"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                    {/* INQUIRIES ROWS */}
                    {activeTab === 'inquiries' && displayedInquiries.map((inq) => (
                      <tr key={inq.id} className="hover:bg-indigo-900/20 transition-colors">
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="text-sm font-bold text-white">{new Date(inq.created_at || inq.date).toLocaleDateString()}</div>
                          <div className="text-xs text-indigo-400/70 font-mono mt-1">{new Date(inq.created_at || inq.date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-white">{inq.name}</span>
                            <span className={'inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ' +
                              (inq.is_customer
                                ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                : 'bg-amber-500/20 text-amber-300 border-amber-500/30')}>
                              {inq.is_customer ? 'Customer' : 'Prospect'}
                            </span>
                          </div>
                          <div className="text-xs text-indigo-300 mt-1 flex items-center gap-1.5"><Mail className="w-3 h-3 opacity-50"/> {inq.email}</div>
                          {inq.company && <div className="text-[10px] text-indigo-400/60 font-mono mt-1 uppercase">{inq.company}</div>}
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            inq.type.includes('Hardware') ? 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' :
                            inq.type.includes('Trial') ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                            'bg-fuchsia-500/20 text-fuchsia-400 border-fuchsia-500/30'
                          }`}>
                            {inq.type}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="text-sm font-bold text-indigo-100">{inq.subject}</div>
                          <div className="text-xs text-indigo-300/80 mt-1 truncate max-w-[200px]">{inq.details || <span className="italic opacity-50">No additional details</span>}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            {inq.message_count > 0 && (
                              <span className="text-[10px] text-indigo-400/70">{inq.message_count} {inq.message_count === 1 ? "reply" : "replies"}</span>
                            )}
                            {inq.awaiting_reply && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                New reply
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            inq.status === 'Pending' ? 'bg-amber-500/20 text-amber-400 border-amber-500/30' : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}>
                            {inq.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openInquiry(inq)} className="bg-emerald-600/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-400 hover:text-white p-1.5 rounded-lg transition-all" title="Read Full Message">
                              <Eye className="w-4 h-4" />
                            </button>
                            <button onClick={() => setEmailReplyModal(inq)} className="bg-blue-600/20 hover:bg-blue-500/40 border border-blue-500/50 text-blue-400 hover:text-white p-1.5 rounded-lg transition-all" title="Reply via Email">
                              <Mail className="w-4 h-4" />
                            </button>
                            <button onClick={() => toggleInquiryStatus(inq.id, inq.status)} className={`p-1.5 rounded-lg transition-all border ${inq.status === 'Pending' ? 'bg-emerald-600/20 border-emerald-500/50 text-emerald-400' : 'bg-amber-600/20 border-amber-500/50 text-amber-400'}`} title="Toggle Status">
                              <CheckCircle className="w-4 h-4" />
                            </button>
                            <button onClick={() => deleteInquiry(inq.id)} className="bg-[#090b14] hover:bg-red-900/30 border border-red-900/50 text-red-500/70 hover:text-red-400 p-1.5 rounded-lg transition-all" title="Delete Request">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}

                  </tbody>
                </table>
              </div>

              {/* Empty States */}
              {['admins', 'customers'].includes(activeTab) && displayedUsers.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-indigo-400/60 mb-2">No users found matching your filters.</div>
                  <div className="w-16 h-1 bg-indigo-900/50 mx-auto rounded-full mt-4"></div>
                </div>
              )}
              {activeTab === 'inquiries' && displayedInquiries.length === 0 && (
                <div className="text-center py-16">
                  <div className="text-emerald-400/60 mb-2">No inquiries found matching your filters.</div>
                  <div className="w-16 h-1 bg-emerald-900/50 mx-auto rounded-full mt-4"></div>
                </div>
              )}

            </div>
          )}
        </div>
      </main>

      {/* --- CAMPAIGN CONFIRM MODAL --- */}
      {confirmCampaign && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setConfirmCampaign(false)}></div>
          <div className="relative w-full max-w-md bg-[#13172e] border border-rose-500/50 rounded-2xl p-8 z-10 shadow-[0_0_40px_rgba(244,63,94,0.25)]">
            <Megaphone className="w-12 h-12 text-rose-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Send this campaign?</h3>
            <p className="text-sm text-indigo-300/80 mb-2">
              <strong className="text-white">{campaignDraft.subject || 'Untitled campaign'}</strong> will be sent to{' '}
              <strong className="text-rose-300">{campaignRecipients.length}</strong>{' '}
              {campaignRecipients.length === 1 ? 'recipient' : 'recipients'}.
            </p>
            <p className="text-xs text-indigo-400 mb-6">
              Emails cannot be recalled once sent. Send yourself a test first if you are unsure.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleSendCampaign}
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-sm shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
              >
                Send now
              </button>
              <button
                onClick={() => setConfirmCampaign(false)}
                className="flex-1 bg-[#090b14] border border-indigo-700 text-indigo-200 font-bold py-2.5 rounded-xl text-sm hover:border-indigo-500 transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD ADMIN MODAL --- */}
      {addAdminModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setAddAdminModal(false)}></div>
          <form onSubmit={handleCreateAdmin} className="relative w-full max-w-md bg-[#13172e] border border-fuchsia-500/50 rounded-2xl p-6 md:p-8 z-10 shadow-[0_0_40px_rgba(217,70,239,0.25)]">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-2">
              <ShieldAlert className="w-6 h-6 text-fuchsia-500"/> Add Administrator
            </h3>
            <p className="text-xs text-indigo-300/80 mb-6">Create a new admin account. A secure temporary password and a one-time access code will be emailed to them. They must enter the code once before the dashboard unlocks.</p>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">First Name</label>
                  <input name="firstName" required className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Last Name</label>
                  <input name="lastName" required className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Corporate Email</label>
                <input name="email" type="email" required className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-fuchsia-500/50" />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-indigo-800/50 flex gap-3 justify-end">
               <button type="button" onClick={() => setAddAdminModal(false)} className="px-5 py-2.5 text-sm font-bold text-indigo-300 hover:text-white transition-colors">Cancel</button>
               <button type="submit" disabled={processingId === 'creating-admin'} className="bg-fuchsia-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-fuchsia-500/25 active:scale-95 transition-all disabled:opacity-50">
                 {processingId === 'creating-admin' ? 'Creating...' : 'Create & Send Email'}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* --- INQUIRY READER MODAL --- */}
      {viewInquiryModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setViewInquiryModal(null)}></div>
          <div className="relative w-full max-w-2xl bg-[#13172e] border border-emerald-500/50 rounded-2xl p-6 md:p-8 z-10 shadow-[0_0_40px_rgba(16,185,129,0.25)] flex flex-col max-h-[90vh]">
            
            <div className="flex justify-between items-start mb-6 border-b border-indigo-800/50 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-6 h-6 text-emerald-400" /> Incoming Request
                </h3>
                <p className="text-xs text-indigo-300/80 mt-1">Sent: {new Date(viewInquiryModal.created_at || viewInquiryModal.date).toLocaleString()}</p>
              </div>
              <button onClick={() => setViewInquiryModal(null)} className="text-indigo-400 hover:text-white"><XCircle className="w-6 h-6" /></button>
            </div>

            <div className="overflow-y-auto pr-2 space-y-4 text-sm flex-1 connector-scrollbar">
              <div className="bg-[#060810]/50 border border-indigo-800/50 rounded-xl p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">From</span>
                    <div className="text-white font-medium">{viewInquiryModal.name}</div>
                    <div className="text-indigo-300 text-xs">{viewInquiryModal.email}</div>
                    <span className={'inline-flex items-center mt-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider border ' +
                      (viewInquiryModal.is_customer
                        ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/30')}>
                      {viewInquiryModal.is_customer ? 'Existing customer' : 'Potential customer'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Company / Type</span>
                    <div className="text-white font-medium">{viewInquiryModal.company || 'N/A'}</div>
                    <div className="text-indigo-300 text-xs">{viewInquiryModal.type}</div>
                  </div>
                </div>
              </div>
              <div className="bg-[#090b14]/50 border border-indigo-800/50 rounded-xl p-4">
                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Subject</span>
                 <div className="text-base font-bold text-indigo-100">{viewInquiryModal.subject}</div>
              </div>
              <div className="bg-[#090b14]/50 border border-indigo-800/50 rounded-xl p-4 min-h-[150px]">
                 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest block mb-2">Message Details</span>
                 <div className="text-indigo-200 whitespace-pre-wrap leading-relaxed">{viewInquiryModal.details || <span className="italic opacity-50">No additional details provided.</span>}</div>
              </div>

              {/* CONVERSATION THREAD */}
              <div className="bg-[#090b14]/50 border border-indigo-800/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Conversation</span>
                  {threadLoading && <span className="text-[10px] text-indigo-400 animate-pulse">Loading...</span>}
                  {!threadLoading && thread.length > 0 && (
                    <span className="text-[10px] text-indigo-400/70">{thread.length} {thread.length === 1 ? "reply" : "replies"}</span>
                  )}
                </div>

                <div className="space-y-3">
                  {thread.map((msg) => {
                    const outbound = msg.direction === 'outbound';
                    return (
                      <div key={msg.id} className="flex gap-3">
                        <div className={`w-7 h-7 rounded-full border flex items-center justify-center shrink-0 ${outbound ? "bg-blue-500/20 border-blue-500/40" : "bg-emerald-500/20 border-emerald-500/40"}`}>
                          <Mail className={`w-3.5 h-3.5 ${outbound ? "text-blue-400" : "text-emerald-400"}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${outbound ? "text-blue-400" : "text-emerald-400"}`}>
                              {outbound ? 'Brains Team' : (viewInquiryModal.name || 'Customer')}
                            </span>
                            <span className="text-[10px] text-indigo-400/70">{new Date(msg.created_at).toLocaleString()}</span>
                          </div>
                          <div className={`text-xs whitespace-pre-wrap leading-relaxed rounded-lg p-3 border ${outbound ? "bg-blue-500/5 border-blue-500/20 text-indigo-100" : "bg-emerald-500/5 border-emerald-500/20 text-indigo-200"}`}>
                            {msg.body}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {!threadLoading && thread.length === 0 && (
                    <div className="text-[11px] text-indigo-400/60 italic">No replies yet. Your response will appear here.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-indigo-800/50 flex gap-3 justify-end">
               <button onClick={() => setViewInquiryModal(null)} className="px-5 py-2.5 text-sm font-bold text-indigo-300 hover:text-white">Close</button>
               <button 
                 onClick={() => { setEmailReplyModal(viewInquiryModal); setViewInquiryModal(null); }} 
                 className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/25 active:scale-95 flex items-center gap-2"
               >
                 <Mail className="w-4 h-4"/> Reply via Email
               </button>
            </div>
          </div>
        </div>
      )}

      {/* --- EMAIL REPLY MODAL --- */}
      {emailReplyModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setEmailReplyModal(null)}></div>
          <form onSubmit={handleSendEmailReply} className="relative w-full max-w-2xl bg-gradient-to-b from-[#13172e] to-[#090b14] border border-blue-500/50 rounded-2xl p-6 md:p-8 z-10 shadow-[0_0_40px_rgba(59,130,246,0.25)] flex flex-col">
            <div className="flex justify-between items-start mb-6 border-b border-indigo-800/50 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Mail className="w-6 h-6 text-blue-400" /> Draft Reply
                </h3>
                <p className="text-xs text-indigo-300/80 mt-1">Directly email <span className="font-bold text-white">{emailReplyModal.name}</span></p>
              </div>
              <button type="button" onClick={() => setEmailReplyModal(null)} className="text-indigo-400 hover:text-white"><XCircle className="w-6 h-6"/></button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">To</label>
                <input name="toEmail" readOnly value={emailReplyModal.email} className="w-full bg-[#060810]/50 border border-indigo-800/80 rounded-xl px-4 py-2.5 text-sm text-indigo-300 cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Subject</label>
                <input name="subject" defaultValue={`Re: ${emailReplyModal.subject}`} required className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500/50" />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Message Body</label>
                <textarea name="message" required rows="6" placeholder="Type your response here..." className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50"></textarea>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-1.5">Attach File</label>
                <input name="attachment" type="file" className="w-full bg-[#090b14] border border-indigo-700/80 rounded-xl px-4 py-2 text-sm text-indigo-300 file:bg-blue-600/20 file:text-blue-400 file:border-0 file:rounded-full file:px-4 file:py-1 file:mr-4 file:text-xs file:font-bold" />
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-indigo-800/50 flex gap-3 justify-end">
               <button type="button" onClick={() => setEmailReplyModal(null)} className="px-5 py-2.5 text-sm font-bold text-indigo-300 hover:text-white">Cancel</button>
               <button type="submit" disabled={processingId === 'email-sending'} className="bg-blue-600 text-white px-8 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:shadow-blue-500/25 active:scale-95 disabled:opacity-50">
                 {processingId === 'email-sending' ? 'Sending...' : 'Send Email'}
               </button>
            </div>
          </form>
        </div>
      )}

      {/* --- VIEW SUBSCRIPTION MODAL --- */}
      {viewSubModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setViewSubModal(null)}></div>
          <div className="relative w-full max-w-lg bg-[#13172e] border border-fuchsia-500/50 rounded-2xl p-6 md:p-8 z-10 shadow-[0_0_40px_rgba(217,70,239,0.25)] flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-start mb-6 border-b border-indigo-800/50 pb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{viewSubModal.module?.label}</h3>
                <p className="text-xs text-indigo-300/80 mt-1">Subscription details for <span className="font-bold text-white">{viewSubModal.user?.first_name} {viewSubModal.user?.last_name}</span></p>
              </div>
              <button onClick={() => setViewSubModal(null)} className="text-indigo-400 hover:text-white"><XCircle className="w-6 h-6"/></button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 connector-scrollbar">
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-[#090b14]/50 border border-indigo-800/50 rounded-lg p-4">
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Monthly Cost</div>
                  <div className="text-lg font-bold text-emerald-400">{formatPHP(viewSubModal.module?.price)}</div>
                </div>
                <div className="bg-[#090b14]/50 border border-indigo-800/50 rounded-lg p-4">
                  <div className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">Purchase Date</div>
                  <div className="text-sm font-bold text-indigo-100">{new Date(viewSubModal.user?.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-3">Billing & Invoices</h4>
              {viewSubModal.loading ? (
                <div className="text-center py-8 text-indigo-400 animate-pulse text-xs font-mono">Fetching history...</div>
              ) : viewSubModal.error ? (
                <div className="text-center py-8 text-red-400 text-xs">Failed to load billing history.</div>
              ) : viewSubModal.billingInfo?.invoices?.length > 0 ? (
                <div className="space-y-3">
                  {viewSubModal.billingInfo.invoices.map(inv => (
                    <div key={inv.id} className="bg-[#090b14]/40 border border-indigo-800/30 rounded p-3 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-white">{inv.description}</div>
                        <div className="text-[10px] text-indigo-400">{new Date(inv.created_at).toLocaleDateString()}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-emerald-400">{formatPHP(inv.amount)}</div>
                        <div className="text-[10px] text-indigo-300 uppercase">{inv.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 bg-[#090b14]/20 border border-dashed border-indigo-800/30 rounded text-xs text-indigo-400/60">No invoices recorded for this user.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODALS --- */}
      {subscriptionToCancel && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setSubscriptionToCancel(null)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-amber-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(245,158,11,0.25)] z-10 text-center">
            <CreditCard className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Cancel Subscription</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Are you sure you want to forcibly cancel all active modules for <strong className="text-white">{subscriptionToCancel.name}</strong>?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={confirmAndCancelSubscription} disabled={processingId === subscriptionToCancel.id} className="flex-1 bg-amber-600 text-white font-bold py-2 rounded-lg">{processingId === subscriptionToCancel.id ? '...' : 'Confirm'}</button>
              <button onClick={() => setSubscriptionToCancel(null)} className="flex-1 bg-[#090b14] border border-indigo-700 text-indigo-200 font-bold py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setUserToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-red-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.25)] z-10 text-center">
            <Trash2 className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Are you sure you want to permanently delete <strong className="text-white">{userToDelete.name}</strong>?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={confirmAndDeleteUser} disabled={processingId === userToDelete.id} className="flex-1 bg-red-600 text-white font-bold py-2 rounded-lg">{processingId === userToDelete.id ? '...' : 'Delete'}</button>
              <button onClick={() => setUserToDelete(null)} className="flex-1 bg-[#090b14] border border-indigo-700 text-indigo-200 font-bold py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-indigo-800/50 rounded-2xl p-8 z-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Are you sure you want to log out of Central Command?</p>
            <div className="flex gap-4 justify-center">
              <button onClick={handleLogout} className="flex-1 bg-fuchsia-600 text-white font-bold py-2 rounded-lg">Yes</button>
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-[#090b14] border border-indigo-700 text-indigo-200 font-bold py-2 rounded-lg">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}