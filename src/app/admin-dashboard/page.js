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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateRole',
          userId,
          newRole
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update user role');
      }

      // Refresh the users list
      fetchUsers();
      // Optional: Replace native alert with a custom toast notification later
      alert(`User role successfully updated to ${newRole.toUpperCase()}`);
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const getRoleBadgeColor = (role) => {
    return role === 'admin' 
      ? 'bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30' 
      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  };

  const handleLogout = () => {
    // Perform any logout logic here, then redirect
    window.location.href = "/";
  };

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
    <div className="relative min-h-screen text-gray-100 font-sans selection:bg-fuchsia-500/30 selection:text-fuchsia-100 py-12">
      <ParticleBackground />

      {/* Logout Confirmation Modal */}
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

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 z-10">
        
        {/* Header */}
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-end">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-blue-400">Admin Command</span>
            </h1>
            <p className="text-indigo-300/80">Manage operators and platform permissions.</p>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            className="mt-4 md:mt-0 px-5 py-2.5 bg-[#13172e]/80 hover:bg-[#1a1f3c]/80 text-indigo-200 text-sm font-semibold rounded-lg border border-indigo-700/50 transition-all hover:shadow-[0_0_15px_rgba(99,102,241,0.2)] cursor-pointer"
          >
            Log Out
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-[#13172e]/80 backdrop-blur-md rounded-2xl border border-indigo-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-6">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide">Total Users</h3>
            <p className="text-4xl font-bold text-white mt-3">{users.length}</p>
          </div>
          <div className="bg-[#13172e]/80 backdrop-blur-md rounded-2xl border border-indigo-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-6 group">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide group-hover:text-fuchsia-400 transition-colors">Admins</h3>
            <p className="text-4xl font-bold text-fuchsia-400 mt-3 drop-shadow-[0_0_10px_rgba(232,121,249,0.3)]">
              {users.filter(user => user.role === 'admin').length}
            </p>
          </div>
          <div className="bg-[#13172e]/80 backdrop-blur-md rounded-2xl border border-indigo-800/50 shadow-[0_8px_30px_rgba(0,0,0,0.5)] p-6 group">
            <h3 className="text-sm font-bold text-indigo-300 uppercase tracking-wide group-hover:text-blue-400 transition-colors">Customers</h3>
            <p className="text-4xl font-bold text-blue-400 mt-3 drop-shadow-[0_0_10px_rgba(96,165,250,0.3)]">
              {users.filter(user => user.role === 'customer').length}
            </p>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-[#13172e]/80 backdrop-blur-md border border-indigo-800/50 rounded-2xl shadow-[0_0_40px_rgba(217,70,239,0.15)] overflow-hidden">
          <div className="px-6 py-5 border-b border-indigo-800/50 flex justify-between items-center bg-[#090b14]/50">
            <h3 className="text-lg font-bold text-white">Operator Roster</h3>
            <div className="text-xs font-mono text-indigo-400/60 bg-indigo-950/50 px-3 py-1 rounded border border-indigo-900/50">LIVE_SYNC_ACTIVE</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-indigo-800/30 text-left">
              <thead className="bg-[#090b14]/30">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">User</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Joined</th>
                  <th className="px-6 py-4 text-xs font-bold text-indigo-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-indigo-800/30 bg-transparent">
                {users.map((user) => (
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
                    <td className="px-6 py-5 whitespace-nowrap text-sm text-indigo-300/80">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap text-sm font-medium">
                      <select
                        value={user.role}
                        onChange={(e) => updateUserRole(user.id, e.target.value)}
                        className="bg-[#090b14] border border-indigo-700 rounded-lg px-3 py-2 text-sm text-indigo-200 focus:outline-none focus:border-fuchsia-500 focus:ring-1 focus:ring-fuchsia-500 transition-colors cursor-pointer"
                      >
                        <option value="customer">Customer</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-16">
              <div className="text-indigo-400/60 mb-2">No operators found in database.</div>
              <div className="w-16 h-1 bg-indigo-900/50 mx-auto rounded-full"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}