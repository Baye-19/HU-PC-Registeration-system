import React, { useEffect, useState } from 'react';
import { Laptop } from '../types';
import { generateQrDataUrl, downloadDataUrl } from '../utils/qr';
import { Printer, Download, ShieldCheck, Laptop as LaptopIcon, X } from 'lucide-react';

interface PrintableCardProps {
  laptop: Laptop;
  onClose?: () => void;
}

export const PrintableCard: React.FC<PrintableCardProps> = ({ laptop, onClose }) => {
  const [qrUrl, setQrUrl] = useState<string>('');
  const [mode, setMode] = useState<'CARD' | 'STICKER'>('CARD');

  useEffect(() => {
    generateQrDataUrl(laptop.qrToken).then(url => setQrUrl(url));
  }, [laptop.qrToken]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQr = () => {
    if (qrUrl) {
      downloadDataUrl(qrUrl, `${laptop.pcId}_QR_Code.png`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-2 sm:p-4 overflow-y-auto backdrop-blur-xs">
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
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Download</span> QR
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
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
        <div className="p-3 sm:p-8 flex justify-center bg-slate-100/50 overflow-x-auto">
          {mode === 'CARD' ? (
            /* OFFICIAL UNIVERSITY LAPTOP PASS CARD */
            <div
              id="printable-laptop-card"
              className="w-full max-w-[520px] bg-white rounded-xl border-2 border-slate-800 shadow-lg p-4 sm:p-6 relative overflow-hidden"
              style={{ minHeight: '300px' }}
            >
              {/* Card Header with Official University Emblem */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-[#0B2A63] relative z-10">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white p-0.5 shadow-xs border-2 border-[#F59E0B] flex items-center justify-center shrink-0">
                    <img
                      src="/assets/aistudio/image_3d6f99fa.png"
                      alt="Hawassa University Official Seal"
                      className="w-full h-full object-contain rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-[#0B2A63]">
                      ሀዋሳ ዩኒቨርሲቲ · Hawassa University
                    </h3>
                    <p className="text-[10px] sm:text-[11px] font-semibold text-[#0284C7]">
                      Campus Police Union & Security Directorate
                    </p>
                    <p className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wider font-medium">
                      Automated Laptop Gate Clearance Pass
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 sm:px-2.5 py-0.5 text-[9px] sm:text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                    AUTHORIZED
                  </span>
                  <p className="text-[9px] sm:text-[10px] text-slate-700 mt-1 font-mono font-bold">
                    {laptop.pcId}
                  </p>
                </div>
              </div>

              {/* Main Card Body */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pt-3 sm:pt-4">
                {/* Left: Device & Owner Details */}
                <div className="sm:col-span-2 space-y-2 text-xs">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Student Owner
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      {laptop.studentName}
                    </span>
                    <span className="text-slate-600 block text-[11px] font-mono">
                      ID: {laptop.studentIdNumber}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase block">
                        Department
                      </span>
                      <span className="text-slate-800 font-medium truncate block">
                        {laptop.department}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] font-semibold text-slate-400 uppercase block">
                        Faculty / Institute
                      </span>
                      <span className="text-slate-800 font-medium truncate block">
                        {laptop.faculty}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Device Specification
                    </span>
                    <div className="flex items-center gap-1.5 font-semibold text-slate-900">
                      <LaptopIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span>{laptop.brand} {laptop.model}</span>
                    </div>
                    <p className="text-[10px] text-slate-600 font-mono mt-0.5">
                      S/N: {laptop.serialNumber}
                    </p>
                    {laptop.color && (
                      <p className="text-[10px] text-slate-500">
                        Color: {laptop.color} {laptop.os ? `· OS: ${laptop.os}` : ''}
                      </p>
                    )}
                  </div>
                </div>

                {/* Right: Security QR Code */}
                <div className="sm:col-span-1 flex flex-col items-center justify-between text-center pt-3 sm:pt-0 border-t sm:border-t-0 sm:pl-2 sm:border-l border-slate-200">
                  <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR Code for ${laptop.pcId}`}
                        className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                      />
                    ) : (
                      <div className="w-24 h-24 sm:w-28 sm:h-28 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
                        Generating...
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-1">
                    Scan at Gate Terminal
                  </span>
                  <div className="flex items-center gap-1 text-[8px] text-slate-400 font-mono">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>Cryptographic Token</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[9px] text-slate-500">
                <div>
                  <span>Issued: {new Date(laptop.createdAt).toLocaleDateString()}</span>
                  <span className="mx-1.5">·</span>
                  <span>Hawassa Main Campus</span>
                </div>
                <div className="font-mono font-medium text-slate-700">
                  {laptop.pcId}
                </div>
              </div>

              {/* Security Cut-Out Line Watermark */}
              <div className="absolute bottom-1 right-2 text-[7px] text-slate-300 uppercase tracking-widest font-mono pointer-events-none">
                CAMPUSGUARD SECURE PASS
              </div>
            </div>
          ) : (
            /* ADHESIVE STICKER FORMAT (For Laptop Bottom / Bezel) */
            <div
              id="printable-laptop-sticker"
              className="w-full max-w-[360px] bg-white rounded-lg border-2 border-dashed border-[#0B2A63] p-3.5 sm:p-4 shadow-md"
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
