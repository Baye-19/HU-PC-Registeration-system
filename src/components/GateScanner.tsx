import React, { useState, useRef, useEffect } from 'react';
import { api } from '../services/api';
import { VerificationResponse, Gate, SecurityEvent } from '../types';
import {
  Camera,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRightCircle,
  ArrowLeftCircle,
  ShieldAlert,
  Laptop as LaptopIcon,
  RefreshCw,
  Info
} from 'lucide-react';

interface GateScannerProps {
  currentGate: Gate;
  onMovementLogged?: (event: SecurityEvent) => void;
}

export const GateScanner: React.FC<GateScannerProps> = ({ currentGate, onMovementLogged }) => {
  const [searchMethod, setSearchMethod] = useState<'CAMERA' | 'MANUAL'>('CAMERA');
  const [identifierInput, setIdentifierInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Movement Action States
  const [movementLoading, setMovementLoading] = useState(false);
  const [consecutiveWarning, setConsecutiveWarning] = useState<string | null>(null);
  const [pendingMovementType, setPendingMovementType] = useState<'IN' | 'OUT' | null>(null);
  const [movementSuccessMsg, setMovementSuccessMsg] = useState<string | null>(null);
  const [overrideConsecutive, setOverrideConsecutive] = useState(false);
  const [movementNotes, setMovementNotes] = useState('');

  // Camera State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Start Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err: any) {
      setCameraError(err.message || 'Unable to access camera. Please check permissions or use manual search.');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };

  useEffect(() => {
    if (searchMethod === 'CAMERA') {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [searchMethod]);

  // Execute Verification
  const executeVerification = async (params: { qrToken?: string; identifier?: string }) => {
    setLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);
    setConsecutiveWarning(null);
    setMovementSuccessMsg(null);

    try {
      const res = await api.verifyDevice(params);
      setVerificationResult(res);
      if (res.outcome === 'REPORTED_LOST') {
        // Play subtle warning audio feedback
        try {
          const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2874/2874-preview.mp3');
          audio.volume = 0.5;
          audio.play();
        } catch {
          // ignore
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Verification service error');
    } finally {
      setLoading(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifierInput.trim()) return;
    executeVerification({ identifier: identifierInput.trim() });
  };

  // Record Movement (IN or OUT)
  const handleRecordMovement = async (type: 'IN' | 'OUT', forceOverride = false) => {
    if (!verificationResult?.laptop) return;

    setMovementLoading(true);
    setConsecutiveWarning(null);
    setMovementSuccessMsg(null);

    try {
      const event = await api.recordMovement({
        laptopId: verificationResult.laptop.id,
        gateId: currentGate.id,
        movementType: type,
        verificationMethod: searchMethod === 'CAMERA' ? 'QR_SCAN' : 'MANUAL_SEARCH',
        verificationResult: verificationResult.outcome,
        notes: movementNotes || undefined,
        overrideConsecutive: forceOverride || overrideConsecutive
      });

      setMovementSuccessMsg(`Successfully recorded movement: ${type} at ${currentGate.name}`);
      setConsecutiveWarning(null);
      setPendingMovementType(null);
      setOverrideConsecutive(false);
      setMovementNotes('');

      // Update local verification result state
      setVerificationResult(prev => {
        if (!prev || !prev.laptop) return prev;
        return {
          ...prev,
          laptop: {
            ...prev.laptop,
            currentMovementStatus: type,
            lastMovementDate: event.timestamp,
            lastMovementGate: currentGate.name
          },
          previousMovement: {
            status: type,
            timestamp: event.timestamp,
            gateName: currentGate.name
          }
        };
      });

      if (onMovementLogged) {
        onMovementLogged(event);
      }
    } catch (err: any) {
      if (err.message && err.message.includes('CONSECUTIVE_MOVEMENT_WARNING')) {
        setConsecutiveWarning(
          `Warning: This laptop is already recorded as "${type}". Duplicate consecutive ${type} requires supervisor confirmation.`
        );
        setPendingMovementType(type);
      } else {
        setErrorMsg(err.message || 'Failed to record movement');
      }
    } finally {
      setMovementLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Method Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Gate Verification Terminal
          </h2>
          <p className="text-xs text-slate-500">
            Active Gate: <span className="font-semibold text-slate-800">{currentGate.name}</span> ({currentGate.code})
          </p>
        </div>

        <div className="flex items-center rounded-lg bg-slate-100 p-1 text-xs font-medium w-full sm:w-auto">
          <button
            onClick={() => setSearchMethod('CAMERA')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              searchMethod === 'CAMERA' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5 text-blue-600" />
            <span>QR Scanner</span>
          </button>
          <button
            onClick={() => setSearchMethod('MANUAL')}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              searchMethod === 'MANUAL' ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Search className="w-3.5 h-3.5 text-slate-600" />
            <span>Manual ID / S/N</span>
          </button>
        </div>
      </div>

      {/* Verification Inputs Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Camera or Manual Search Input */}
        <div className="lg:col-span-5 space-y-4">
          {searchMethod === 'CAMERA' ? (
            <div className="bg-slate-900 rounded-xl p-4 text-white shadow-md relative overflow-hidden">
              <div className="flex items-center justify-between mb-3 text-xs text-slate-300">
                <span className="font-semibold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Optical QR Reader
                </span>
                <button
                  onClick={startCamera}
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                >
                  <RefreshCw className="w-3 h-3" />
                  Restart Camera
                </button>
              </div>

              {/* Video Feed / Viewfinder */}
              <div className="relative aspect-4/3 bg-black rounded-lg overflow-hidden flex items-center justify-center border border-slate-700">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${cameraActive ? 'block' : 'hidden'}`}
                />

                {!cameraActive && (
                  <div className="p-6 text-center text-slate-400 text-xs">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    {cameraError ? (
                      <p className="text-amber-400">{cameraError}</p>
                    ) : (
                      <p>Initializing camera viewport...</p>
                    )}
                  </div>
                )}

                {/* Reticle Overlay */}
                {cameraActive && (
                  <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                    <div className="w-48 h-48 border-2 border-blue-400/80 rounded-lg relative">
                      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-blue-400"></div>
                      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-blue-400"></div>
                      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-blue-400"></div>
                      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-blue-400"></div>
                      <div className="w-full h-0.5 bg-blue-400/60 absolute top-1/2 -translate-y-1/2 animate-pulse"></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Quick-Test Tokens (Convenience for testing without camera) */}
              <div className="mt-4 pt-3 border-t border-slate-800">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>Quick Test Registered Tokens:</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px]">
                  <button
                    onClick={() => executeVerification({ qrToken: 'cg_tok_4a8f9b2c1d0e3f4a5b6c7d8e9f0a1b2c' })}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-left truncate text-emerald-400 font-mono"
                  >
                    ✓ Abebe (Dell)
                  </button>
                  <button
                    onClick={() => executeVerification({ qrToken: 'cg_tok_7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f' })}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-left truncate text-emerald-400 font-mono"
                  >
                    ✓ Abebe (HP)
                  </button>
                  <button
                    onClick={() => executeVerification({ qrToken: 'cg_tok_9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e' })}
                    className="p-1.5 bg-red-950/80 hover:bg-red-900/80 rounded border border-red-700 text-left truncate text-red-300 font-mono"
                  >
                    ⚠ Selam (STOLEN!)
                  </button>
                  <button
                    onClick={() => executeVerification({ qrToken: 'cg_invalid_token_xyz' })}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded border border-slate-700 text-left truncate text-slate-400 font-mono"
                  >
                    ✗ Invalid Token
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-semibold text-slate-900">
                Manual Hardware Identifier Search
              </h3>
              <p className="text-xs text-slate-500">
                Lookup registered laptop by unique PC ID (e.g. CG-LPT-000001) or manufacturer serial number.
              </p>

              <form onSubmit={handleManualSearch} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    PC ID or Serial Number
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="e.g. CG-LPT-000001 or SN-DL-882914"
                      value={identifierInput}
                      onChange={e => setIdentifierInput(e.target.value)}
                      className="w-full px-3.5 py-2 pl-9 text-xs font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !identifierInput.trim()}
                  className="w-full py-2 px-4 bg-[#0B2A63] hover:bg-[#0E3B85] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? 'Searching...' : 'Verify Device'}
                </button>
              </form>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 space-y-1">
                <span className="font-medium text-slate-700">Sample Identifiers:</span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => {
                      setIdentifierInput('CG-LPT-000001');
                      executeVerification({ identifier: 'CG-LPT-000001' });
                    }}
                    className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200"
                  >
                    CG-LPT-000001
                  </button>
                  <button
                    onClick={() => {
                      setIdentifierInput('CG-LPT-000003');
                      executeVerification({ identifier: 'CG-LPT-000003' });
                    }}
                    className="font-mono text-[10px] bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded hover:bg-red-100"
                  >
                    CG-LPT-000003 (Stolen)
                  </button>
                  <button
                    onClick={() => {
                      setIdentifierInput('SN-DL-882914');
                      executeVerification({ identifier: 'SN-DL-882914' });
                    }}
                    className="font-mono text-[10px] bg-slate-100 px-2 py-0.5 rounded hover:bg-slate-200"
                  >
                    SN-DL-882914
                  </button>
                </div>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right Column: Verification Results & Movement Action */}
        <div className="lg:col-span-7">
          {verificationResult ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Header Banner based on Outcome */}
              {verificationResult.outcome === 'VALID' && (
                <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-6 h-6 text-emerald-100" />
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">VERIFIED: AUTHORIZED DEVICE</h3>
                      <p className="text-xs text-emerald-100">{verificationResult.message}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-emerald-700/80 rounded border border-emerald-400">
                    VALID
                  </span>
                </div>
              )}

              {verificationResult.outcome === 'REPORTED_LOST' && (
                <div className="bg-red-600 text-white p-4 flex items-center justify-between animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <ShieldAlert className="w-7 h-7 text-white" />
                    <div>
                      <h3 className="font-bold text-base tracking-wide uppercase">
                        CRITICAL ALERT: STOLEN / MISSING DEVICE!
                      </h3>
                      <p className="text-xs text-red-100 font-medium">
                        Detain device and escort individual to Campus Police Union immediately!
                      </p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-black/40 rounded border border-white">
                    STOP
                  </span>
                </div>
              )}

              {verificationResult.outcome === 'SUSPENDED' && (
                <div className="bg-amber-600 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className="w-6 h-6 text-amber-100" />
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">REGISTRATION SUSPENDED</h3>
                      <p className="text-xs text-amber-100">{verificationResult.message}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-amber-700/80 rounded border border-amber-400">
                    SUSPENDED
                  </span>
                </div>
              )}

              {verificationResult.outcome === 'REVOKED' && (
                <div className="bg-slate-800 text-white p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <XCircle className="w-6 h-6 text-red-400" />
                    <div>
                      <h3 className="font-bold text-sm tracking-wide">REGISTRATION REVOKED</h3>
                      <p className="text-xs text-slate-300">{verificationResult.message}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 text-xs font-mono font-bold bg-red-950 rounded border border-red-700">
                    REVOKED
                  </span>
                </div>
              )}

              {verificationResult.outcome === 'NOT_FOUND' && (
                <div className="p-8 text-center text-slate-600 space-y-3">
                  <XCircle className="w-12 h-12 text-slate-400 mx-auto" />
                  <h4 className="text-base font-bold text-slate-800">Unregistered Device</h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    This laptop token or serial number does not exist in the Hawassa University laptop registry.
                    Student must register at the Security Police Union office.
                  </p>
                </div>
              )}

              {/* Device and Student Details */}
              {verificationResult.laptop && (
                <div className="p-4 sm:p-6 space-y-4 sm:space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 pb-4 border-b border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Assigned PC ID
                      </span>
                      <span className="font-mono font-bold text-slate-900 text-sm">
                        {verificationResult.laptop.pcId}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Registered Student
                      </span>
                      <span className="font-semibold text-slate-900">
                        {verificationResult.student?.fullName || verificationResult.laptop.studentName}
                      </span>
                      <span className="font-mono text-slate-500 block text-[11px]">
                        {verificationResult.student?.studentId || verificationResult.laptop.studentIdNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Department & Faculty
                      </span>
                      <span className="text-slate-800 font-medium truncate block">
                        {verificationResult.student?.department}
                      </span>
                      <span className="text-slate-500 text-[11px] truncate block">
                        {verificationResult.student?.faculty}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Hardware Make / Model
                      </span>
                      <div className="flex items-center gap-1 font-semibold text-slate-800">
                        <LaptopIcon className="w-3.5 h-3.5 text-blue-600" />
                        <span>{verificationResult.laptop.brand} {verificationResult.laptop.model}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Manufacturer Serial No.
                      </span>
                      <span className="font-mono text-slate-700">
                        {verificationResult.laptop.serialNumber}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Current Movement State
                      </span>
                      <span
                        className={`inline-block font-mono font-bold px-2 py-0.5 rounded text-[11px] ${
                          verificationResult.laptop.currentMovementStatus === 'IN'
                            ? 'bg-blue-100 text-blue-800'
                            : verificationResult.laptop.currentMovementStatus === 'OUT'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {verificationResult.laptop.currentMovementStatus}
                      </span>
                    </div>
                  </div>

                  {/* Active Lost Report Details (if applicable) */}
                  {verificationResult.activeLostReport && (
                    <div className="p-3.5 bg-red-50 border border-red-300 rounded-lg text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-red-800">
                        <span>Incident: {verificationResult.activeLostReport.incidentType}</span>
                        <span>Date: {new Date(verificationResult.activeLostReport.incidentDate).toLocaleDateString()}</span>
                      </div>
                      <p className="text-red-700">
                        <span className="font-semibold">Reported Location:</span> {verificationResult.activeLostReport.incidentLocation}
                      </p>
                      <p className="text-red-600 italic">"{verificationResult.activeLostReport.description}"</p>
                      <p className="text-red-800 font-semibold pt-1">
                        Emergency Contact: {verificationResult.activeLostReport.contactPhone}
                      </p>
                    </div>
                  )}

                  {/* Movement Logging Controls */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
                        Record Gate Movement
                      </h4>
                      <span className="text-[11px] text-slate-500 font-mono">
                        Gate: {currentGate.code}
                      </span>
                    </div>

                    {/* Consecutive Warning Prompt */}
                    {consecutiveWarning && (
                      <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-2">
                        <p className="text-amber-800 font-medium">{consecutiveWarning}</p>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1.5 text-xs text-amber-900 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={overrideConsecutive}
                              onChange={e => setOverrideConsecutive(e.target.checked)}
                              className="rounded border-amber-400 text-amber-600 focus:ring-amber-500"
                            />
                            <span>Authorize consecutive {pendingMovementType} override</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {movementSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-lg text-xs text-emerald-800 font-medium flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{movementSuccessMsg}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <button
                        onClick={() => handleRecordMovement('IN')}
                        disabled={movementLoading}
                        className={`py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors ${
                          verificationResult.laptop.currentMovementStatus === 'OUT' || overrideConsecutive
                            ? 'bg-blue-600 hover:bg-blue-700 text-white'
                            : 'bg-blue-500/80 text-white'
                        }`}
                      >
                        <ArrowRightCircle className="w-4 h-4" />
                        Log Entrance (IN)
                      </button>

                      <button
                        onClick={() => handleRecordMovement('OUT')}
                        disabled={movementLoading}
                        className={`py-3 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors ${
                          verificationResult.laptop.currentMovementStatus === 'IN' || overrideConsecutive
                            ? 'bg-amber-600 hover:bg-amber-700 text-white'
                            : 'bg-amber-500/80 text-white'
                        }`}
                      >
                        <ArrowLeftCircle className="w-4 h-4" />
                        Log Exit (OUT)
                      </button>
                    </div>

                    <div>
                      <input
                        type="text"
                        placeholder="Optional officer notes (e.g., student bag inspected, accompanying visitor)..."
                        value={movementNotes}
                        onChange={e => setMovementNotes(e.target.value)}
                        className="w-full text-xs px-3 py-1.5 border border-slate-300 rounded-md bg-white focus:outline-hidden"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center min-h-[380px]">
              <LaptopIcon className="w-12 h-12 text-slate-300 mb-3" />
              <h4 className="text-sm font-semibold text-slate-700 mb-1">
                Awaiting Gate Scan or Manual Search
              </h4>
              <p className="text-xs text-slate-400 max-w-sm">
                Aim the device QR sticker at the camera or enter the PC ID in the manual search box.
                The laptop ownership and security clearance will verify instantaneously.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
