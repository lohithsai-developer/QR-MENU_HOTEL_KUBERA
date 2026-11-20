import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, Download, Copy, Check, ExternalLink } from 'lucide-react';

export const QRCodeGenerator = () => {
  const [selectedTable, setSelectedTable] = useState('all');
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Automatically use current origin
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://hotelkuberaqrmenu.vercel.app';

  // Compute final QR target URL (with optional table tag for dine-in guests)
  const finalQrUrl = selectedTable === 'all' 
    ? baseUrl 
    : `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}table=${selectedTable}`;

  useEffect(() => {
    generateQRCode();
  }, [finalQrUrl]);

  const generateQRCode = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(finalQrUrl, {
        width: 360,
        margin: 2,
        color: {
          dark: '#1E293B',
          light: '#FFFFFF'
        },
        errorCorrectionLevel: 'H'
      });
      setQrDataUrl(dataUrl);
    } catch (err) {
      console.error('QR code generation failed:', err);
    }
  };

  const downloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    const filename = selectedTable === 'all' 
      ? 'Hotel-Kubera-Menu-QR.png' 
      : `Hotel-Kubera-Table-${selectedTable}-QR.png`;
    link.download = filename;
    link.href = qrDataUrl;
    link.click();
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(finalQrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-sm mx-auto space-y-4 pb-12 overflow-x-hidden">
      {/* Compact Table Selector Bar */}
      <div className="flex items-center justify-between gap-2 p-2.5 rounded-2xl bg-white border border-stone-200 shadow-2xs">
        <label className="text-xs font-bold text-slate-700 pl-1 shrink-0">
          Target Table:
        </label>
        <select
          value={selectedTable}
          onChange={(e) => setSelectedTable(e.target.value)}
          className="flex-1 max-w-[200px] p-1.5 rounded-xl bg-stone-50 border border-stone-200 text-slate-900 text-xs font-semibold focus:bg-white focus:border-kubera-burgundy"
        >
          <option value="all">General Menu (All Tables)</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16].map((num) => (
            <option key={num} value={String(num).padStart(2, '0')}>
              Table {String(num).padStart(2, '0')}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={copyUrl}
          className="p-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 text-xs font-semibold shrink-0 transition-colors"
          title="Copy Link"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
        </button>
      </div>

      {/* Printable Luxury Standee Card */}
      <div
        id="printable-qr-standee"
        className="w-full rounded-3xl p-6 sm:p-7 bg-[#FFFDF9] border-2 border-kubera-burgundy shadow-lg relative text-center overflow-hidden"
      >
        {/* Ornate corner accents */}
        <div className="absolute top-2.5 left-2.5 w-5 h-5 border-t-2 border-l-2 border-amber-600"></div>
        <div className="absolute top-2.5 right-2.5 w-5 h-5 border-t-2 border-r-2 border-amber-600"></div>
        <div className="absolute bottom-2.5 left-2.5 w-5 h-5 border-b-2 border-l-2 border-amber-600"></div>
        <div className="absolute bottom-2.5 right-2.5 w-5 h-5 border-b-2 border-r-2 border-amber-600"></div>

        {/* Table badge if specific table is chosen */}
        {selectedTable !== 'all' ? (
          <div className="inline-block mx-auto mb-2.5 px-3 py-0.5 rounded-full bg-kubera-burgundy text-white text-[11px] font-bold tracking-wider uppercase shadow-2xs">
            Table {selectedTable}
          </div>
        ) : (
          <div className="inline-block mx-auto mb-2 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-bold tracking-wider uppercase">
            Official Guest Menu
          </div>
        )}

        {/* Hotel Kubera Logo Crest */}
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-kubera-gold via-amber-300 to-kubera-burgundy shadow-sm overflow-hidden mb-2.5">
          <img
            src="/kubera-logo.jpg"
            alt="Hotel Kubera Crest"
            className="w-full h-full object-cover rounded-full bg-white"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = 'https://images.unsplash.com/photo-1544025162-d76694265947?w=100&auto=format&fit=crop&q=80';
            }}
          />
        </div>

        <h3 className="font-serif font-bold text-xl sm:text-2xl tracking-wider text-kubera-burgundy leading-tight">
          HOTEL KUBERA
        </h3>
        <p className="text-[10px] sm:text-xs text-amber-800 uppercase tracking-widest font-bold mb-3">
          Eluru • Taste the Wealth of Flavours
        </p>

        {/* QR Code Container */}
        <div className="p-3 bg-white rounded-2xl shadow-sm mx-auto w-fit mb-3 border border-stone-200">
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="Hotel Kubera QR Menu"
              className="w-44 h-44 sm:w-52 sm:h-52 mx-auto"
            />
          )}
        </div>

        <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
          Scan with camera to view menu
        </p>
        <p className="text-[10px] text-slate-500 mb-3 font-medium">
          No app download required • Instant access
        </p>

        {/* Footer note */}
        <div className="pt-2.5 border-t border-amber-200/60 text-[10px] text-slate-600 font-medium truncate">
          {finalQrUrl}
        </div>
      </div>

      {/* Direct Action Buttons Under Standee */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          onClick={downloadQR}
          className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 border border-stone-200 text-slate-800 text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Download PNG</span>
        </button>
        <button
          onClick={handlePrint}
          className="py-2.5 px-3 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs font-bold shadow-2xs flex items-center justify-center gap-1.5 transition-all"
        >
          <Printer className="w-3.5 h-3.5 text-amber-200" />
          <span>Print Standee</span>
        </button>
      </div>
    </div>
  );
};
