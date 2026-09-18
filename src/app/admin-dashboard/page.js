'use client';

import { useState, useEffect, useRef } from 'react';

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

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState(null); 
  
  const [activeTab, setActiveTab] = useState('customer');
  const [processingId, setProcessingId] = useState(null);

  // --- NEW: Search & Filter States ---
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Reset filters when switching tabs
  useEffect(() => {
    setSearchQuery('');
    setStatusFilter('all');
  }, [activeTab]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch users');
      }
      
      setUsers(data.users);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateRole', userId, newRole }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update user role');

      fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const confirmAndDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      setProcessingId(userToDelete.id);
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', userId: userToDelete.id }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      setUserToDelete(null); 
      fetchUsers(); 
    } catch (err) {
      alert(`Error deleting user: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleTrialAction = async (userId, email, name, action) => {
    try {
      setProcessingId(userId);
      const response = await fetch('/api/admin/trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, email, name, action }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      fetchUsers();
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' 
      ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' 
      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  };

  const handleLogout = () => {
    window.location.href = "/";
  };

  // --- NEW: Advanced Search & Filter Logic ---
  const displayedUsers = users.filter(user => {
    if (user.role !== activeTab) return false;

    if (activeTab === 'customer' && statusFilter !== 'all') {
      const userStatus = user.status || 'new'; 
      if (userStatus !== statusFilter) return false;
    }

    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
      const email = (user.email || '').toLowerCase();
      const company = (user.company || '').toLowerCase();
      
      if (!fullName.includes(query) && !email.includes(query) && !company.includes(query)) {
        return false;
      }
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
          <div className="text-red-400 font-bold text-xl mb-2">SYSTEM ERROR</div>
          <div className="text-indigo-200">{error}</div>
          <button onClick={fetchUsers} className="mt-6 bg-red-900/30 hover:bg-red-900/50 text-red-200 border border-red-800/50 px-6 py-2 rounded transition-colors">
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-100 py-6 md:py-12">
      <ParticleBackground />

      {/* --- Delete Confirmation Modal --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setUserToDelete(null)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-red-500/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(239,68,68,0.25)] z-10 text-center">
            
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border border-red-500/50 mb-6">
              <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Delete Account</h3>
            <p className="text-sm text-indigo-300/80 mb-6">
              Are you sure you want to permanently delete <strong className="text-white">{userToDelete.name}</strong>? This action cannot be undone.
            </p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={confirmAndDeleteUser}
                disabled={processingId === userToDelete.id}
                className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {processingId === userToDelete.id ? 'Deleting...' : 'Delete'}
              </button>
              <button 
                onClick={() => setUserToDelete(null)}
                className="flex-1 bg-[#090b14] border border-indigo-700 hover:border-indigo-500 text-indigo-200 font-bold py-2 px-4 rounded-lg transition-all active:scale-95"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- Logout Confirmation Modal --- */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#090b14]/80 backdrop-blur-sm cursor-pointer" onClick={() => setShowLogoutConfirm(false)}></div>
          <div className="relative w-full max-w-sm bg-[#13172e] border border-indigo-800/50 rounded-2xl p-8 shadow-[0_0_40px_rgba(217,70,239,0.15)] z-10 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Confirm Logout</h3>
            <p className="text-sm text-indigo-300/80 mb-6">Are you sure you want to log out of Central Command?</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handleLogout}
                className="flex-1 bg-gradient-to-r from-fuchsia-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-all shadow-lg active:scale-95"
              >
                Yes
              </button>
              <button 
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 bg-[#090b14] border border-indigo-700 hover:border-fuchsia-500 text-indigo-200 font-bold py-2 px-4 rounded-lg transition-all active:scale-95"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-[1600px] mx-auto px-4 md:px-8 lg:px-12 z-10">
        
        {/* Header */}
        <div className="mb-8 md:mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-1 md:mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400">Admin Command</span>
            </h1>
            <p className="text-sm md:text-base text-indigo-300/80">Manage operators and platform permissions.</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="px-5 py-2.5 bg-[#13172e]/80 hover:bg-[#1a1f3c]/80 text-indigo-200 text-sm font-semibold rounded-lg border border-indigo-700/50 transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer"
          >
            Log Out
          </button>
        </div>

        {/* Stats Cards - Tab Switchers (Aligned horizontally on mobile) */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 md:gap-6 mb-10">
          <div className="bg-[#13172e]/80 backdrop-blur-md rounded-2xl border border-indigo-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3 md:p-6 flex flex-col justify-center items-center text-center">
            <h3 className="text-[10px] md:text-sm font-bold text-indigo-300 uppercase tracking-wide leading-tight break-words">Total Users</h3>
            <p className="text-xl md:text-4xl font-bold text-white mt-1 md:mt-3">{users.length}</p>
          </div>
          
          <div 
            onClick={() => setActiveTab('admin')}
            className={`bg-[#13172e]/80 backdrop-blur-md rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3 md:p-6 cursor-pointer flex flex-col justify-center items-center text-center transition-all ${
              activeTab === 'admin' 
                ? 'border-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.2)] ring-1 ring-fuchsia-500/50' 
                : 'border-indigo-800/50 hover:border-fuchsia-500/50'
            }`}
          >
            <h3 className={`text-[10px] md:text-sm font-bold uppercase tracking-wide leading-tight break-words transition-colors ${activeTab === 'admin' ? 'text-fuchsia-400' : 'text-indigo-300'}`}>
              Admins
            </h3>
            <p className="text-xl md:text-4xl font-bold text-fuchsia-400 mt-1 md:mt-3 drop-shadow-[0_0_10px_rgba(232,121,249,0.3)]">
              {users.filter(user => user.role === 'admin').length}
            </p>
          </div>

          <div 
            onClick={() => setActiveTab('customer')}
            className={`bg-[#13172e]/80 backdrop-blur-md rounded-2xl border shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-3 md:p-6 cursor-pointer flex flex-col justify-center items-center text-center transition-all ${
              activeTab === 'customer' 
                ? 'border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)] ring-1 ring-blue-500/50' 
                : 'border-indigo-800/50 hover:border-blue-500/50'
            }`}
          >
            <h3 className={`text-[10px] md:text-sm font-bold uppercase tracking-wide leading-tight break-words transition-colors ${activeTab === 'customer' ? 'text-blue-400' : 'text-indigo-300'}`}>
              Customers
            </h3>
            <p className="text-xl md:text-4xl font-bold text-blue-400 mt-1 md:mt-3 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">
              {users.filter(user => user.role === 'customer').length}
            </p>
          </div>
        </div>

        {/* Dynamic Users Table */}
        <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl shadow-[0_0_40px_rgba(217,70,239,0.15)] overflow-hidden">
          
          {/* --- NEW: Search & Filter Header Area --- */}
          <div className="px-6 py-4 border-b border-indigo-800/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-[#090b14]/50">
            <h3 className="text-lg font-bold text-white whitespace-nowrap">
              {activeTab === 'admin' ? 'Administrator Roster' : 'Customer Roster'}
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {/* Search Bar */}
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-indigo-400/70" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#090b14]/80 border border-indigo-700/50 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-indigo-500/60 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 w-full transition-all"
                />
              </div>

              {/* Status Filter (Only visible for Customers) */}
              {activeTab === 'customer' && (
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-[#090b14]/80 border border-indigo-700/50 rounded-lg px-4 py-2 text-sm text-indigo-200 focus:outline-none focus:border-fuchsia-500/50 focus:ring-1 focus:ring-fuchsia-500/50 cursor-pointer w-full sm:w-40 transition-all appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23818cf8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1em' }}
                >
                  <option value="all">All Statuses</option>
                  <option value="new">New Account</option>
                  <option value="pending">Pending Trial</option>
                  <option value="active">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-800/30 text-left">
              <thead className="bg-[#090b14]/30">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Role</th>
                  
                  {activeTab === 'customer' && (
                    <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Status</th>
                  )}
                  
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-800/30 bg-transparent">
                {displayedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-indigo-900/20 transition-colors">
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-bold text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-xs text-indigo-400/70 font-mono mt-1">
                          ID: {user.id.substring(0, 8)}...
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-indigo-200">{user.email}</div>
                      <div className="text-xs mt-1">
                        {user.email_confirmed 
                          ? <span className="text-emerald-400">✓ Verified</span> 
                          : <span className="text-amber-400/80">⚠ Pending</span>}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-200">
                      {user.company || <span className="text-indigo-400/50 italic">None Provided</span>}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getRoleBadgeColor(user.role)}`}>
                        {user.role.toUpperCase()}
                      </span>
                    </td>
                    
                    {activeTab === 'customer' && (
                      <td className="px-6 py-5 whitespace-nowrap">
                        {user.status === 'pending' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">PENDING TRIAL</span>
                        ) : user.status === 'active' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">APPROVED</span>
                        ) : user.status === 'rejected' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">REJECTED</span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">NEW ACCOUNT</span>
                        )}
                      </td>
                    )}

                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-300/80">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        
                        {activeTab === 'customer' && user.status === 'pending' && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => handleTrialAction(user.id, user.email, user.first_name, 'approve')}
                              disabled={processingId === user.id}
                              className="bg-emerald-600/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-400 hover:text-white text-xs font-bold py-1.5 px-3 rounded transition-all disabled:opacity-50"
                            >
                              {processingId === user.id ? '...' : 'APPROVE'}
                            </button>
                            <button 
                              onClick={() => handleTrialAction(user.id, user.email, user.first_name, 'reject')}
                              disabled={processingId === user.id}
                              className="bg-red-600/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 hover:text-white text-xs font-bold py-1.5 px-3 rounded transition-all disabled:opacity-50"
                            >
                              REJECT
                            </button>
                          </div>
                        )}

                        <select
                          value={user.role}
                          onChange={(e) => updateUserRole(user.id, e.target.value)}
                          className="bg-[#090b14] border border-indigo-700 rounded-lg px-3 py-1.5 text-sm text-indigo-200 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-colors cursor-pointer"
                        >
                          <option value="customer">Customer</option>
                          <option value="admin">Admin</option>
                        </select>

                        {/* Delete Button */}
                        <button 
                          onClick={() => setUserToDelete({ id: user.id, name: user.first_name })}
                          disabled={processingId === user.id}
                          className="bg-[#090b14] hover:bg-red-900/30 border border-red-900/50 hover:border-red-500/50 text-red-500/70 hover:text-red-400 text-xs font-bold py-1.5 px-3 rounded-lg transition-all disabled:opacity-50"
                          title="Delete Account"
                        >
                          DELETE
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {displayedUsers.length === 0 && (
            <div className="text-center py-16">
              <div className="text-indigo-400/60 mb-2">No users found matching your filters.</div>
              <div className="w-16 h-1 bg-indigo-900/50 mx-auto rounded-full mt-4"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}