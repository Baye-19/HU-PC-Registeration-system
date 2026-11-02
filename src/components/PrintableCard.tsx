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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Controls (Hidden in Print) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div>
            <h2 className="text-base font-semibold text-slate-900">
              Printable Verification Label & Pass
            </h2>
            <p className="text-xs text-slate-500">
              Official asset identification pass issued by Hawassa University Police Union & ICT Security
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center rounded-lg bg-slate-200 p-0.5 text-xs font-medium">
              <button
                onClick={() => setMode('CARD')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  mode === 'CARD' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ID Pass Card
              </button>
              <button
                onClick={() => setMode('STICKER')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  mode === 'STICKER' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Adhesive Sticker
              </button>
            </div>
            <button
              onClick={handleDownloadQr}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              <Download className="w-3.5 h-3.5" />
              Download QR
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Pass
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Printable Content Body */}
        <div className="p-8 flex justify-center bg-slate-100/50">
          {mode === 'CARD' ? (
            /* OFFICIAL UNIVERSITY LAPTOP PASS CARD */
            <div
              id="printable-laptop-card"
              className="w-[520px] bg-white rounded-xl border-2 border-slate-800 shadow-lg p-6 relative overflow-hidden"
              style={{ minHeight: '320px' }}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between pb-3 border-b-2 border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#142B4A] flex items-center justify-center text-white font-bold text-sm shadow-xs border border-amber-400">
                    HU
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      Hawassa University
                    </h3>
                    <p className="text-[11px] font-semibold text-blue-700">
                      Campus Police Union & Security Office
                    </p>
                    <p className="text-[9px] text-slate-500 uppercase tracking-wider">
                      Automated Laptop Gate Clearance Pass
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 rounded border border-emerald-300">
                    AUTHORIZED
                  </span>
                  <p className="text-[9px] text-slate-500 mt-1 font-mono">
                    ID: {laptop.pcId}
                  </p>
                </div>
              </div>

              {/* Main Card Body */}
              <div className="grid grid-cols-3 gap-4 pt-4">
                {/* Left: Device & Owner Details */}
                <div className="col-span-2 space-y-2 text-xs">
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
                <div className="col-span-1 flex flex-col items-center justify-between text-center pl-2 border-l border-slate-200">
                  <div className="p-1.5 bg-white border border-slate-300 rounded-lg shadow-2xs">
                    {qrUrl ? (
                      <img
                        src={qrUrl}
                        alt={`QR Code for ${laptop.pcId}`}
                        className="w-28 h-28 object-contain"
                      />
                    ) : (
                      <div className="w-28 h-28 bg-slate-100 flex items-center justify-center text-xs text-slate-400">
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
              className="w-[360px] bg-white rounded-lg border-2 border-dashed border-slate-800 p-4 shadow-md"
            >
              <div className="flex items-center justify-between border-b pb-2 mb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">
                    Hawassa University
                  </h4>
                  <p className="text-[9px] text-blue-700 font-semibold">
                    Campus Police Registered Asset
                  </p>
                </div>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-1.5 py-0.5 rounded border">
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
