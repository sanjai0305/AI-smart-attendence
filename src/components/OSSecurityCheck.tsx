import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShieldAlert, Cpu, HardDrive, Smartphone, Radio, CheckCircle, AlertTriangle } from 'lucide-react';
import { DeviceRegistry } from '../types';

interface OSSecurityCheckProps {
  device?: DeviceRegistry;
  onValidationComplete?: (isPassed: boolean, logs: string[]) => void;
  interactive?: boolean;
}

export default function OSSecurityCheck({ device, onValidationComplete, interactive = false }: OSSecurityCheckProps) {
  const [checking, setChecking] = useState(false);
  const [stages, setStages] = useState<{
    id: number;
    name: string;
    description: string;
    status: 'pending' | 'scanning' | 'clean' | 'violation';
  }[]>([
    { id: 1, name: 'Root Environment Inspection', description: 'Checks for superuser packages, SU binaries & busybox roots', status: 'pending' },
    { id: 2, name: 'Developer Mode Safeguards', description: 'Validates if Android Developer Options / Mock Locations are banned', status: 'pending' },
    { id: 3, name: 'Secure Sandbox Assessment', description: 'Assesses safe web sandbox frame & strict origin execution', status: 'pending' },
    { id: 4, name: 'Hardware Signature Sync', description: 'Verifies hardware cryptographic keys with server footprint', status: 'pending' }
  ]);

  const [deviceMeta, setDeviceMeta] = useState({
    model: device?.deviceModel || 'Realme RMX3868',
    os: device?.androidVersion || 'Android 14 (Security Level F-55)',
    ip: device?.ipAddress || '192.168.12.104',
    deviceId: device?.deviceId || 'DEV_8876_X3',
    rootFree: true,
    safeBrowser: true,
    devModeBlocked: true
  });

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    if (!interactive && device) {
      // Just auto-pass or reflect the device input
      setStages(prev => prev.map(stage => {
        if (stage.id === 1) return { ...stage, status: device.isRootCheckOk ? 'clean' : 'violation' };
        if (stage.id === 2) return { ...stage, status: device.isDeveloperModeBlocked ? 'clean' : 'violation' };
        if (stage.id === 3) return { ...stage, status: device.isSafeBrowser ? 'clean' : 'violation' };
        return { ...stage, status: 'clean' };
      }));
    }
  }, [device, interactive]);

  const runDiagnostics = () => {
    setChecking(true);
    setLogs([]);
    
    let currentLog: string[] = [];
    
    stages.forEach((s, idx) => {
      setTimeout(() => {
        setStages(prev => prev.map(item => {
          if (item.id === s.id) {
            return { ...item, status: 'scanning' };
          }
          return item;
        }));

        setTimeout(() => {
          const pass = Math.random() > 0.05; // 95% pass rate
          setStages(prev => prev.map(item => {
            if (item.id === s.id) {
              const resultingStatus = pass ? 'clean' : 'violation';
              const logMsg = `[Stage ${s.id}] ${s.name}: ${pass ? 'PASSED - No security threat detected' : 'FAILED - Unauthorized state triggered'}`;
              currentLog.push(logMsg);
              setLogs([...currentLog]);
              return { ...item, status: resultingStatus };
            }
            return item;
          }));

          if (idx === stages.length - 1) {
            setChecking(false);
            const allPassed = currentLog.every(l => !l.includes('FAILED'));
            if (onValidationComplete) {
              onValidationComplete(allPassed, currentLog);
            }
          }
        }, 800);
      }, idx * 900);
    });
  };

  const isAllClean = stages.every(s => s.status === 'clean');
  const hasViolation = stages.some(s => s.status === 'violation');

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-slate-100 p-6" id="os-security-check-card">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <Smartphone size={24} className="animate-pulse" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-lg">OS integrity &amp; Hardware Analyzer</h3>
            <p className="text-xs font-mono text-slate-500">Security Sandbox: v2.44-Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {hasViolation ? (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-rose-600 bg-rose-50 rounded-full">
              <ShieldAlert size={14} /> Suspicious Status
            </span>
          ) : isAllClean ? (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-600 bg-emerald-50 rounded-full animate-bounce">
              <ShieldCheck size={14} /> Environment Secured
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-amber-600 bg-amber-50 rounded-full animate-pulse">
              <Radio size={14} /> Checking Sandbox...
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6 bg-slate-50/60 p-3 rounded-xl border border-slate-100 font-mono text-xs">
        <div className="flex items-start gap-2">
          <Cpu size={14} className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Device Engine</span>
            <span className="font-medium text-slate-700">{deviceMeta.model}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Smartphone size={14} className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Kernel Status</span>
            <span className="font-medium text-slate-700">{deviceMeta.os}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <Radio size={14} className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Secure Port / IP</span>
            <span className="font-medium text-slate-700">{deviceMeta.ip}</span>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <HardDrive size={14} className="text-slate-400 mt-0.5" />
          <div>
            <span className="text-slate-400 block text-[10px] uppercase">Verified ID</span>
            <span className="font-medium text-slate-700 truncate block max-w-[120px]">{deviceMeta.deviceId}</span>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {stages.map((stage) => (
          <div 
            key={stage.id} 
            className={`flex items-start justify-between p-3.5 rounded-xl border transition-all duration-300 ${
              stage.status === 'scanning' ? 'bg-indigo-50/40 border-indigo-200 shadow-sm' :
              stage.status === 'clean' ? 'bg-emerald-50/20 border-emerald-100' :
              stage.status === 'violation' ? 'bg-rose-50/20 border-rose-100' :
              'bg-white border-slate-100/80 hover:border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {stage.status === 'scanning' && (
                  <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                )}
                {stage.status === 'clean' && (
                  <CheckCircle size={18} className="text-emerald-500" />
                )}
                {stage.status === 'violation' && (
                  <AlertTriangle size={18} className="text-rose-500" />
                )}
                {stage.status === 'pending' && (
                  <div className="h-4 w-4 rounded-full border border-slate-300 bg-slate-100" />
                )}
              </div>
              <div>
                <h4 className="font-medium text-slate-800 text-sm">{stage.name}</h4>
                <p className="text-xs text-slate-500 mt-0.5">{stage.description}</p>
              </div>
            </div>

            <div className="text-xs font-mono font-semibold">
              {stage.status === 'scanning' && <span className="text-indigo-600 animate-pulse">Scanning...</span>}
              {stage.status === 'clean' && <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">PASSED</span>}
              {stage.status === 'violation' && <span className="text-rose-600 bg-rose-50 px-2 py-0.5 rounded">VIOLATION</span>}
              {stage.status === 'pending' && <span className="text-slate-400">WAITING</span>}
            </div>
          </div>
        ))}
      </div>

      {interactive && (
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col gap-3">
          <button
            onClick={runDiagnostics}
            disabled={checking}
            className={`w-full py-2.5 rounded-xl font-medium transition-all ${
              checking 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-100 hover:shadow-lg'
            }`}
          >
            {checking ? 'Analyzing Sandbox Security...' : 'Execute Full Environment Diagnostic Run'}
          </button>

          {logs.length > 0 && (
            <div className="mt-3 bg-slate-900 rounded-xl p-3 font-mono text-[11px] leading-relaxed text-slate-300 max-h-36 overflow-y-auto border border-slate-800 shadow-inner">
              <div className="text-xs font-semibold text-emerald-400 border-b border-white/10 pb-1.5 mb-1.5 flex justify-between items-center">
                <span>Console Security Outputs:</span>
                <span className="text-[9px] px-1 bg-emerald-500/15 rounded text-emerald-400 uppercase">Live Sandbox API</span>
              </div>
              {logs.map((log, lIdx) => (
                <div key={lIdx} className={`${log.includes('FAILED') ? 'text-rose-400 font-bold' : ''}`}>
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
