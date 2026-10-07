"use client";
import React, { useState } from 'react';

export function IoTModule() {
  const [devices, setDevices] = useState([
    { id: 'TH-8842-A', name: 'Thermostat Zone B', type: 'Thermostat', icon: '🌡️', status: 'Offline', battery: 84, latency: null },
    { id: 'LK-1192-B', name: 'Smart Lock Room 402', type: 'Lock', icon: '🔒', status: 'Online', battery: 12, latency: '42ms' },
    { id: 'LS-0021-C', name: 'Leak Sensor Boiler', type: 'Sensor', icon: '💧', status: 'Online', battery: 89, latency: '35ms' },
    { id: 'CM-9011-D', name: 'Lobby Perimeter Cam', type: 'Camera', icon: '📹', status: 'Online', battery: 100, latency: '19ms' },
    { id: 'MT-4401-E', name: 'Submeter Generator B', type: 'Meter', icon: '⚡', status: 'Online', battery: 95, latency: '28ms' },
  ]);
  const [filter, setFilter] = useState('All');
  const [activeMessage, setActiveMessage] = useState('');

  const pingDevice = (id) => {
    setActiveMessage(`Pinging node ${id}...`);
    setTimeout(() => {
      const pingVal = `${Math.floor(20 + Math.random() * 40)}ms`;
      setDevices(prev => prev.map(d => d.id === id ? { ...d, status: 'Online', latency: pingVal } : d));
      setActiveMessage(`Node ${id} responded in ${pingVal}`);
      setTimeout(() => setActiveMessage(''), 3000);
    }, 600);
  };

  const dispatchBatteryService = (id) => {
    setActiveMessage(`Maintenance ticket queued for ${id}`);
    setTimeout(() => setActiveMessage(''), 3000);
  };

  const filteredDevices = filter === 'All' ? devices :
    filter === 'Offline' ? devices.filter(d => d.status === 'Offline') :
    devices.filter(d => d.battery <= 20);

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/50 shadow-inner text-2xl">📡</span> 
            Housekeeper <span className="text-indigo-400 font-medium">(IoT)</span>
          </h3>
          <p className="text-sm text-indigo-300/70 mt-1.5 font-medium">Smart locks, sub-meters, environmental sensors, and telemetry gateways</p>
        </div>
        {activeMessage && (
          <div className="px-5 py-2.5 bg-cyan-950/60 border border-cyan-500/50 rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.2)] animate-pulse flex items-center gap-3">
            <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
            <span className="text-xs font-mono font-bold text-cyan-300 tracking-wide">{activeMessage}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Online Sensors", value: devices.filter(d => d.status === 'Online').length, color: "text-white", glow: "bg-blue-500/10" },
          { label: "Offline Nodes", value: devices.filter(d => d.status === 'Offline').length, color: "text-red-400", glow: "bg-red-500/10" },
          { label: "Low Battery (≤20%)", value: devices.filter(d => d.battery <= 20).length, color: "text-amber-400", glow: "bg-amber-500/10" },
          { label: "Mesh Protocol", value: "MQTT / Zigbee", color: "text-emerald-400", glow: "bg-emerald-500/10", textClass: "text-xl" } // Adjust text size for long text
        ].map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-[#13172e]/90 to-[#090b14]/90 border border-indigo-800/40 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.glow} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1.5">{stat.label}</div>
              <div className={`${stat.textClass || 'text-3xl'} font-black ${stat.color} tracking-tight`}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl overflow-hidden flex flex-col shadow-xl flex-grow relative">
        <div className="px-6 py-4 border-b border-indigo-800/40 flex justify-between items-center bg-[#13172e]/40">
          <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
            <span className="text-lg leading-none mb-1">🔗</span> Device Nodes Registry
          </h4>
          <div className="flex gap-1.5 p-1 bg-[#090b14]/80 rounded-lg border border-indigo-800/30">
            {['All', 'Offline', 'Low Battery'].map(st => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${filter === st ? 'bg-cyan-600 text-white shadow-md' : 'text-indigo-400 hover:text-white hover:bg-indigo-800/40'}`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 overflow-y-auto flex-grow connector-scrollbar">
          {filteredDevices.map(device => (
            <div key={device.id} className="bg-[#13172e]/60 border border-indigo-800/30 hover:border-indigo-500/50 rounded-2xl p-5 flex flex-col justify-between shadow-lg transition-all group">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#090b14] border border-indigo-700/50 flex items-center justify-center text-xl shadow-inner group-hover:border-cyan-500/50 transition-colors">
                      {device.icon}
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white mb-0.5">{device.name}</h5>
                      <span className="text-[10px] font-mono font-semibold text-indigo-400/60 bg-[#090b14] px-1.5 py-0.5 rounded">{device.id}</span>
                    </div>
                  </div>
                  <span className={`w-3 h-3 rounded-full mt-1 ${device.status === 'Online' ? 'bg-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)] animate-pulse'}`} />
                </div>

                <div className="mt-6 bg-[#090b14]/50 p-3 rounded-xl border border-indigo-900/30">
                  <div className="flex justify-between text-[10px] font-bold tracking-wider mb-2">
                    <span className="text-indigo-300">BATTERY</span>
                    <span className={device.battery <= 20 ? 'text-amber-400' : 'text-emerald-400'}>{device.battery}%</span>
                  </div>
                  <div className="w-full bg-[#13172e] rounded-full h-2 shadow-inner">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${device.battery <= 20 ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.6)]' : 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.6)]'}`} 
                      style={{ width: `${device.battery}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-indigo-800/30 flex gap-2">
                <button 
                  onClick={() => pingDevice(device.id)} 
                  className="flex-1 bg-indigo-600/20 hover:bg-cyan-600 border border-indigo-600/50 hover:border-cyan-500 text-indigo-200 hover:text-white text-xs font-bold py-2 rounded-lg transition-all shadow-sm"
                >
                  Ping {device.latency && <span className="font-mono text-[10px] opacity-80 ml-1">({device.latency})</span>}
                </button>
                {device.battery <= 20 && (
                  <button 
                    onClick={() => dispatchBatteryService(device.id)} 
                    className="flex-1 bg-amber-600/20 hover:bg-amber-500 border border-amber-500/50 text-amber-400 hover:text-white text-xs font-bold py-2 rounded-lg transition-all shadow-sm"
                  >
                    Replace Bat
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredDevices.length === 0 && <div className="col-span-full text-center py-12 text-sm font-medium text-indigo-400/60">No devices match the current filter.</div>}
        </div>
      </div>
    </div>
  );
}