"use client";
import React, { useState } from 'react';

export function BMSModule() {
  const [zones, setZones] = useState([
    { id: 'zoneA', name: 'Lobby Zone A', current: 22.4, target: 22.0 },
    { id: 'zoneB', name: 'Executive Suite Floor 5', current: 23.8, target: 23.0 },
    { id: 'zoneC', name: 'Server Core Basement', current: 18.2, target: 18.0 },
  ]);

  const [lighting, setLighting] = useState({
    mainEntrance: true,
    parkingB1: true,
    rooftopGarden: false,
    perimeterFencing: true,
  });

  const changeTemp = (id, delta) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, target: +(z.target + delta).toFixed(1) } : z));
  };

  const toggleLight = (key) => {
    setLighting(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const activeLights = Object.values(lighting).filter(v => v).length;

  return (
    <div className="h-full flex flex-col gap-6 w-full animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-indigo-800/30 pb-5">
        <div>
          <h3 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
            <span className="p-2 bg-indigo-900/40 rounded-xl border border-indigo-700/50 shadow-inner text-2xl">🏗️</span> 
            Sekyu <span className="text-indigo-400 font-medium">(BMS)</span>
          </h3>
          <p className="text-sm text-indigo-300/70 mt-1.5 font-medium">Supervisory control for HVAC, energy sub-metering, and emergency systems</p>
        </div>
        <div className="px-4 py-2 bg-[#13172e]/80 border border-emerald-500/30 rounded-xl flex items-center gap-3 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Main Grid Synced</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Power Supply", value: "230V Stable", color: "text-emerald-400", glow: "bg-emerald-500/10" },
          { label: "Water Pressure", value: "62.4 PSI", color: "text-white", glow: "bg-blue-500/10" },
          { label: "Active Lights", value: `${activeLights} / 4`, color: "text-amber-400", glow: "bg-amber-500/10" },
          { label: "Fire Loop Status", value: "ARMED", color: "text-emerald-400", glow: "bg-emerald-500/10" }
        ].map((stat, idx) => (
          <div key={idx} className="bg-gradient-to-br from-[#13172e]/90 to-[#090b14]/90 border border-indigo-800/40 rounded-2xl p-5 shadow-lg relative overflow-hidden group hover:border-indigo-500/50 transition-colors">
            <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.glow} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`}></div>
            <div className="relative z-10">
              <div className="text-[10px] text-indigo-400/80 font-bold uppercase tracking-widest mb-1.5">{stat.label}</div>
              <div className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow">
        {/* HVAC Climate Control */}
        <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl flex flex-col shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-800/40 bg-[#13172e]/40">
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
              <span className="text-lg leading-none mb-1">❄️</span> Zone HVAC Control
            </h4>
          </div>
          <div className="p-6 space-y-5 flex-grow">
            {zones.map(zone => (
              <div key={zone.id} className="p-4 bg-[#13172e]/80 border border-indigo-800/30 rounded-xl flex justify-between items-center group hover:border-indigo-600/50 transition-colors shadow-sm">
                <div>
                  <div className="text-base font-bold text-white mb-1">{zone.name}</div>
                  <div className="text-xs font-medium text-indigo-400 flex items-center gap-1.5">
                    Sensor Reading: <span className="text-white font-mono bg-[#090b14] px-1.5 py-0.5 rounded">{zone.current}°C</span>
                  </div>
                </div>
                {/* Custom Digital Stepper */}
                <div className="flex items-center bg-[#060810] border border-indigo-700/60 rounded-lg p-1 shadow-inner">
                  <button onClick={() => changeTemp(zone.id, -0.5)} className="w-8 h-8 flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-800/60 rounded-md font-bold transition-all">-</button>
                  <div className="px-4 text-white font-mono text-sm font-bold min-w-[70px] text-center tracking-wider">{zone.target.toFixed(1)}°C</div>
                  <button onClick={() => changeTemp(zone.id, 0.5)} className="w-8 h-8 flex items-center justify-center text-indigo-300 hover:text-white hover:bg-indigo-800/60 rounded-md font-bold transition-all">+</button>
                </div>
              </div>
            ))}
            <p className="text-[11px] text-indigo-400/60 mt-6 italic text-center font-medium">Compressor will engage automatically when variance exceeds 0.5°C threshold.</p>
          </div>
        </div>

        {/* Lighting Relays */}
        <div className="bg-[#0b0e1b]/80 backdrop-blur-md border border-indigo-800/40 rounded-2xl flex flex-col shadow-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-indigo-800/40 bg-[#13172e]/40">
            <h4 className="text-xs font-bold text-indigo-200 uppercase tracking-widest flex items-center gap-2">
              <span className="text-lg leading-none mb-1">💡</span> Lighting Relay Controllers
            </h4>
          </div>
          <div className="p-6 space-y-4 flex-grow">
            {[
              { id: 'mainEntrance', label: 'Main Entrance & Facade LED' },
              { id: 'parkingB1', label: 'Parking Basement Level 1' },
              { id: 'rooftopGarden', label: 'Rooftop Garden Pathway Lights' },
              { id: 'perimeterFencing', label: 'Perimeter Security Floodlights' },
            ].map(relay => (
              <div key={relay.id} className="p-4 bg-[#13172e]/80 border border-indigo-800/30 rounded-xl flex justify-between items-center hover:border-indigo-600/50 transition-colors shadow-sm">
                <span className="text-sm font-bold text-white">{relay.label}</span>
                {/* Custom Sleek Toggle */}
                <button
                  onClick={() => toggleLight(relay.id)}
                  className={`w-14 h-7 rounded-full transition-all duration-300 relative p-1 shadow-inner ${lighting[relay.id] ? 'bg-emerald-500 border border-emerald-400' : 'bg-[#090b14] border border-indigo-700'}`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform duration-300 shadow-md ${lighting[relay.id] ? 'translate-x-7' : 'translate-x-0'}`} />
                </button>
              </div>
            ))}
            <p className="text-[11px] text-indigo-400/60 mt-6 italic text-center font-medium">Circuits automatically follow daylight harvesting profiles unless manually overridden.</p>
          </div>
        </div>
      </div>
    </div>
  );
}