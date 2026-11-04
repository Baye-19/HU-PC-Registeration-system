import React, { useEffect, useState, useRef } from 'react';
import { Laptop } from '../types';
import { generateQrDataUrl, downloadDataUrl } from '../utils/qr';
import { Printer, Download, Laptop as LaptopIcon, X, Camera, Upload } from 'lucide-react';

interface PrintableCardProps {
  laptop: Laptop;
  onClose?: () => void;
}

export const PrintableCard: React.FC<PrintableCardProps> = ({ laptop, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [mode, setMode] = useState<'CARD' | 'STICKER'>('CARD');
  const [cardPhoto, setCardPhoto] = useState<string>(
    laptop.studentPhotoUrl ||
    ((laptop.studentName.toLowerCase().includes('gobeze') || laptop.studentName.toLowerCase().includes('zeleke'))
      ? '/assets/aistudio/student_id_photo.png'
      : '')
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Generate unique QR code specifically for this registered device
    const tokenToEncode = laptop.qrToken || `${laptop.pcId}:${laptop.serialNumber}`;
    generateQrDataUrl(tokenToEncode).then(url => setQrUrl(url));
  }, [laptop.qrToken, laptop.pcId, laptop.serialNumber]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (qrUrl) {
      downloadDataUrl(qrUrl, `${laptop.pcId}_QR_Code.png`);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = ev => {
        if (typeof ev.target?.result === 'string') {
          setCardPhoto(ev.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Format issue date in DD/MM/YYYY
  const formatIssueDate = (dateVal?: string | Date) => {
    if (!dateVal) return '04/06/2026';
    try {
      const d = new Date(dateVal);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return '04/06/2026';
    }
  };

  // Student initials for avatar placeholder
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const amharicName = laptop.studentNameAmharic || '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 overflow-y-auto backdrop-blur-xs">
      {/* Print Specific CSS to isolate card */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
          }
          #printable-laptop-card, #printable-laptop-card *,
          #printable-laptop-sticker, #printable-laptop-sticker * {
            visibility: visible !important;
          }
          #printable-laptop-card, #printable-laptop-sticker {
            position: absolute !important;
            left: 50% !important;
            top: 15% !important;
            transform: translate(-50%, 0) !important;
            box-shadow: none !important;
            border: 1.5px solid #0B2A63 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>

      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-4 sm:my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-900">
              Printable Verification Label & Pass
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500">
              Official asset identification pass issued by Hawassa University Police Union & ICT Security
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full sm:w-auto justify-end">
            <div className="flex items-center rounded-lg bg-slate-200 p-0.5 text-xs font-medium">
              <button
                onClick={() => setMode('CARD')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors ${
                  mode === 'CARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ID Pass Card
              </button>
              <button
                onClick={() => setMode('STICKER')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md transition-colors ${
                  mode === 'STICKER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sticker
              </button>
            </div>
            <button
              onClick={handleDownloadQr}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Download</span> QR
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-white bg-[#0B2A63] rounded-lg hover:bg-[#071d47] shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Pass</span>
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1 sm:p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 ml-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-3 sm:p-8 flex justify-center bg-slate-100/60 overflow-x-auto">
          {mode === 'CARD' ? (
            /* OFFICIAL HAWASSA UNIVERSITY LAPTOP PASS CARD (DYNAMICALLY FILLED FROM REGISTRATION) */
            <div
              id="printable-laptop-card"
              className="w-full max-w-[560px] bg-gradient-to-br from-slate-50/80 via-white to-slate-100/90 rounded-2xl border border-slate-300 shadow-xl p-4 sm:p-5 relative overflow-hidden select-none"
              style={{ minHeight: '340px' }}
            >
              {/* Hidden file input for quick photo upload / change */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Subtle Guilloche / Security Background Watermark */}
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.035] bg-[radial-gradient(#0B2A63_1px,transparent_1px)]"
                style={{ backgroundSize: '12px 12px' }}
              />

              {/* Top Header: University Seal + Dual Language Titles */}
              <div className="flex items-center gap-2.5 sm:gap-3.5 pb-2.5 relative z-10">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-white p-0.5 shadow-xs border border-slate-300 flex items-center justify-center shrink-0">
                  <img
                    src="/assets/aistudio/image_3d6f99fa.png"
                    alt="Hawassa University"
                    className="w-full h-full object-contain rounded-full"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-[13px] sm:text-[15px] font-black text-[#0B2A63] tracking-tight uppercase leading-snug">
                    ሀዋሳ ዩኒቨርሲቲ - HAWASSA UNIVERSITY
                  </h3>
                  <p className="text-[11px] sm:text-xs font-semibold text-slate-800 leading-snug">
                    Campus Police Union & Security Directorate
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-slate-600 tracking-wider uppercase leading-snug">
                    AUTOMATED LAPTOP GATE CLEARANCE PASS
                  </p>
                </div>
              </div>

              {/* Horizontal Separator Line spanning across left column to vertical divider */}
              <div className="w-full border-b-[1.5px] border-[#1E3A8A] mb-2.5" />

              {/* Main ID Pass Grid (Left Details + Right Photo & QR) */}
              <div className="grid grid-cols-12 gap-0 relative z-10">
                {/* Left Column (Span 8): Student & Hardware Details Filled from Form */}
                <div className="col-span-8 pr-3.5 space-y-2 border-r-[1.5px] border-[#1E3A8A]">
                  {/* Student Owner Info */}
                  <div>
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      STUDENT OWNER
                    </span>
                    <div className="text-base sm:text-[17px] font-black text-slate-950 tracking-tight leading-tight">
                      {laptop.studentName} {amharicName && <span className="font-normal text-slate-800 ml-1">{amharicName}</span>}
                    </div>
                    <div className="text-xs sm:text-[13px] font-bold text-slate-900 mt-0.5">
                      DEPARTMENT: <span className="text-slate-950 font-bold">{laptop.department || 'Computer Science'}</span>
                    </div>
                  </div>

                  {/* 2-Column: Phone Number & Faculty */}
                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-[#1E3A8A]/30">
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                        PHONE NUMBER (ስልክ)
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-950 font-mono block">
                        {laptop.ownerPhone || '+251 91 123 4567'}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                        FACULTY / INSTITUTE
                      </span>
                      <span className="text-[11px] sm:text-xs font-bold text-slate-950 block truncate">
                        {laptop.faculty || 'Institute of Technology (IoT)'}
                      </span>
                    </div>
                  </div>

                  {/* Device Specification */}
                  <div className="pt-1.5 border-t border-[#1E3A8A]/30">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">
                      DEVICE SPECIFICATION
                    </span>
                    <div className="flex items-center gap-1.5 font-bold text-slate-950 text-xs sm:text-[13px] mt-0.5">
                      <LaptopIcon className="w-3.5 h-3.5 text-slate-800 shrink-0" />
                      <span>{laptop.brand} {laptop.model}</span>
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-900 mt-0.5">
                      S/N: {laptop.serialNumber}
                    </div>
                    <div className="text-[10px] text-slate-600 font-medium">
                      Color: {laptop.color || 'Natural Silver'} - OS: {laptop.os || 'Windows 11 Pro'}
                    </div>
                  </div>

                  {/* Issue Date & Campus */}
                  <div className="pt-1.5 border-t border-[#1E3A8A]/30 text-[9px] sm:text-[10px] font-mono text-slate-700 font-semibold">
                    Issue: {formatIssueDate(laptop.createdAt)} · Hawassa Main Campus
                  </div>
                </div>

                {/* Right Column (Span 4): Passport Photo & QR Code */}
                <div className="col-span-4 pl-3 sm:pl-3.5 flex flex-col items-center justify-between relative">
                  {/* Student ID Portrait Photo */}
                  <div className="w-22 h-28 sm:w-26 sm:h-32 rounded-lg overflow-hidden border border-slate-400/80 bg-slate-200 shadow-2xs shrink-0 relative group">
                    {cardPhoto ? (
                      <img
                        src={cardPhoto}
                        alt={laptop.studentName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center">
                        <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-bold text-sm flex items-center justify-center mb-1">
                          {getInitials(laptop.studentName)}
                        </div>
                        <span className="text-[8px] text-slate-500 font-medium leading-tight">Student ID Photo</span>
                      </div>
                    )}
                    {/* Interactive photo change trigger */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="no-print absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-[9px] font-semibold transition-opacity"
                      title="Upload or Change Photo"
                    >
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>Change Photo</span>
                    </button>
                  </div>

                  {/* Optical QR Code for Gate Scanner */}
                  <div className="mt-2 p-1 bg-white border border-slate-300 rounded shadow-2xs">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`Pass QR ${laptop.pcId}`}
                        className="w-22 h-22 sm:w-26 sm:h-26 object-contain"
                      />
                    ) : (
                      <div className="w-22 h-22 sm:w-26 sm:h-26 bg-slate-100 flex items-center justify-center text-[9px] text-slate-400">
                        Generating...
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Upper Subtle Blue Ink Stamp (Campus Police Clearance) */}
              <div
                className="absolute pointer-events-none select-none z-20"
                style={{
                  right: '25%',
                  top: '40%',
                  transform: 'translate(50%, -50%) rotate(10deg)',
                  opacity: 0.4,
                  mixBlendMode: 'multiply'
                }}
              >
                <svg width="95" height="95" viewBox="0 0 120 120" className="text-[#1D4ED8]">
                  <circle cx="60" cy="60" r="56" fill="none" stroke="#1D4ED8" strokeWidth="1.5" />
                  <circle cx="60" cy="60" r="42" fill="none" stroke="#1D4ED8" strokeWidth="0.8" strokeDasharray="3,2" />
                  <path id="stamp-sub-top" d="M 22,60 A 38,38 0 1,1 98,60" fill="none" />
                  <path id="stamp-sub-bottom" d="M 98,60 A 38,38 0 0,1 22,60" fill="none" />
                  <text fontSize="6.5" fontWeight="bold" fill="#1D4ED8" letterSpacing="0.6">
                    <textPath href="#stamp-sub-top" startOffset="50%" textAnchor="middle">
                      CAMPUS POLICE
                    </textPath>
                  </text>
                  <text fontSize="5.5" fontWeight="bold" fill="#1D4ED8" letterSpacing="0.4">
                    <textPath href="#stamp-sub-bottom" startOffset="50%" textAnchor="middle">
                      GATE CLEARANCE
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* Primary Authentic Hawassa Security Directorate Blue Circular Stamp Overlap */}
              <div
                className="absolute pointer-events-none select-none z-20"
                style={{
                  right: '27%',
                  bottom: '22%',
                  transform: 'translate(50%, 50%) rotate(-8deg)',
                  opacity: 0.85,
                  mixBlendMode: 'multiply'
                }}
              >
                <svg width="125" height="125" viewBox="0 0 140 140">
                  <circle cx="70" cy="70" r="66" fill="none" stroke="#1E40AF" strokeWidth="2" strokeDasharray="6,2" />
                  <circle cx="70" cy="70" r="62" fill="none" stroke="#1E40AF" strokeWidth="1" />
                  <circle cx="70" cy="70" r="44" fill="none" stroke="#1E40AF" strokeWidth="1.2" />

                  <path id="main-stamp-top" d="M 16,70 A 54,54 0 1,1 124,70" fill="none" />
                  <path id="main-stamp-bottom" d="M 124,70 A 54,54 0 0,1 16,70" fill="none" />

                  <text fontSize="7.2" fontWeight="bold" fill="#1E40AF" letterSpacing="0.8">
                    <textPath href="#main-stamp-top" startOffset="50%" textAnchor="middle">
                      ★ HAWASSA UNIVERSITY ★
                    </textPath>
                  </text>
                  <text fontSize="6.4" fontWeight="bold" fill="#1E40AF" letterSpacing="0.6">
                    <textPath href="#main-stamp-bottom" startOffset="50%" textAnchor="middle">
                      SECURITY DIRECTORATE
                    </textPath>
                  </text>

                  {/* Center Hawassa Emblem in Ink */}
                  <g transform="translate(48, 48)">
                    <circle cx="22" cy="22" r="18" fill="#DBEAFE" fillOpacity="0.45" />
                    <image href="/assets/aistudio/image_3d6f99fa.png" x="4" y="4" width="36" height="36" opacity="0.85" />
                  </g>
                </svg>
              </div>
            </div>
          ) : (
            /* ADHESIVE CHASSIS STICKER FORMAT */
            <div
              id="printable-laptop-sticker"
              className="w-full max-w-[360px] bg-white rounded-lg border-2 border-dashed border-[#0B2A63] p-3.5 sm:p-4 shadow-md select-none"
            >
              <div className="flex items-center justify-between border-b-2 border-[#0B2A63]/30 pb-2 mb-2">
                <div className="flex items-center gap-2">
                  <img
                    src="/assets/aistudio/image_3d6f99fa.png"
                    alt="Hawassa Seal"
                    className="w-8 h-8 object-contain rounded-full border border-[#F59E0B]"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2A63] uppercase">
                      Hawassa University
                    </h4>
                    <p className="text-[9px] text-[#0284C7] font-semibold">
                      Campus Police Registered Asset
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-bold bg-blue-50 text-[#0B2A63] px-2 py-0.5 rounded border border-blue-200">
                  {laptop.pcId}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="shrink-0 p-1 border rounded bg-white">
                  {qrUrl && (
                    <img
                      src={qrUrl}
                      alt="Sticker QR"
                      className="w-20 h-20 object-contain"
                    />
                  )}
                </div>
                <div className="text-[10px] space-y-0.5 leading-tight">
                  <p className="font-bold text-slate-900">{laptop.studentName}</p>
                  <p className="text-slate-600 font-mono">ID: {laptop.studentIdNumber}</p>
                  <p className="text-slate-700 font-medium">{laptop.brand} {laptop.model}</p>
                  <p className="text-slate-500 font-mono text-[9px]">S/N: {laptop.serialNumber}</p>
                  <p className="text-[8px] text-slate-400 pt-1">DO NOT REMOVE · PROPERTY OF OWNER</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Instructions Footer */}
        <div className="no-print px-6 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
          <span>Keep this card with your laptop or affix the sticker to the bottom chassis.</span>
          <span className="font-mono text-slate-400">Hawassa University Police Union</span>
        </div>
      </div>
    </div>
  );
};
