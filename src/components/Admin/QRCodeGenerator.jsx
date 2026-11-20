import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { QrCode, Printer, Download, Copy, Check, ExternalLink, Globe, Sparkles } from 'lucide-react';

export const QRCodeGenerator = () => {
  const [selectedTable, setSelectedTable] = useState('all');
  const [menuUrl, setMenuUrl] = useState(() => {
    return window.location.origin;
  });
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Compute final QR target URL (with optional table tag for dine-in guests)
  const finalQrUrl = selectedTable === 'all' 
    ? menuUrl 
    : `${menuUrl}${menuUrl.includes('?') ? '&' : '?'}table=${selectedTable}`;

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
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header & Quick Action Card */}
      <div className="p-5 sm:p-6 rounded-2xl bg-white border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-kubera-burgundy/10 border border-kubera-burgundy/20 flex items-center justify-center text-kubera-burgundy shrink-0">
              <QrCode className="w-5 h-5 text-kubera-burgundy" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-slate-900">
                Digital QR Code & Table Standee Generator
              </h2>
              <p className="text-xs text-slate-500">
                Direct QR generator for guest tables. Instant scan opens your digital menu without any app.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.open(finalQrUrl, '_blank')}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-600" />
              <span>Preview Menu</span>
            </button>
            <button
              onClick={copyUrl}
              className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-600" />}
              <span>{copied ? 'Link Copied!' : 'Copy Link'}</span>
            </button>
          </div>
        </div>

        {/* Direct Controls Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
          {/* Menu URL Field */}
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-slate-500" />
              <span>Menu Base URL (Production or Custom Domain)</span>
            </label>
            <input
              type="text"
              value={menuUrl}
              onChange={(e) => setMenuUrl(e.target.value)}
              placeholder="https://hotelkubera.com"
              className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-slate-900 text-xs sm:text-sm font-mono focus:bg-white focus:border-kubera-burgundy"
            />
          </div>

          {/* Table Assignment Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-kubera-gold" />
              <span>Table Standee Assignment</span>
            </label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-slate-900 text-xs sm:text-sm font-semibold focus:bg-white focus:border-kubera-burgundy"
            >
              <option value="all">General Menu (All Tables)</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 16].map((num) => (
                <option key={num} value={String(num).padStart(2, '0')}>
                  Table {String(num).padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Action Buttons Strip */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-stone-100">
          <p className="text-[11px] text-slate-500 font-mono text-center sm:text-left truncate max-w-md">
            Encoded QR Destination: <strong className="text-kubera-burgundy">{finalQrUrl}</strong>
          </p>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={downloadQR}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 border border-stone-200 text-slate-800 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4 text-slate-700" />
              <span>Download PNG</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-initial py-2.5 px-5 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all"
            >
              <Printer className="w-4 h-4 text-amber-200" />
              <span>Print Table Standee</span>
            </button>
          </div>
        </div>
      </div>

      {/* Standee Preview Container */}
      <div className="flex justify-center p-2 sm:p-4">
        {/* Printable Standee Card */}
        <div
          id="printable-qr-standee"
          className="w-full max-w-sm rounded-3xl p-6 sm:p-8 bg-[#FFFDF9] border-2 border-kubera-burgundy shadow-xl relative text-center overflow-hidden"
        >
          {/* Ornate corner accents */}
          <div className="absolute top-2.5 left-2.5 w-6 h-6 border-t-2 border-l-2 border-amber-600"></div>
          <div className="absolute top-2.5 right-2.5 w-6 h-6 border-t-2 border-r-2 border-amber-600"></div>
          <div className="absolute bottom-2.5 left-2.5 w-6 h-6 border-b-2 border-l-2 border-amber-600"></div>
          <div className="absolute bottom-2.5 right-2.5 w-6 h-6 border-b-2 border-r-2 border-amber-600"></div>

          {/* Table badge if specific table is chosen */}
          {selectedTable !== 'all' && (
            <div className="inline-block mx-auto mb-3 px-3 py-0.5 rounded-full bg-kubera-burgundy text-white text-[11px] font-bold tracking-wider uppercase">
              Table {selectedTable}
            </div>
          )}

          {/* Hotel Kubera Logo Crest */}
          <div className="w-20 h-20 mx-auto rounded-full p-0.5 bg-gradient-to-tr from-kubera-gold via-amber-300 to-kubera-burgundy shadow-sm overflow-hidden mb-3">
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

          <h3 className="font-serif font-bold text-2xl tracking-wider text-kubera-burgundy">
            HOTEL KUBERA
          </h3>
          <p className="text-[10px] sm:text-xs text-amber-800 uppercase tracking-widest font-bold mb-4">
            Eluru • Taste the Wealth of Flavours
          </p>

          {/* QR Code Container */}
          <div className="p-3.5 bg-white rounded-2xl shadow-sm mx-auto w-fit mb-4 border border-stone-200">
            {qrDataUrl && (
              <img
                src={qrDataUrl}
                alt="Hotel Kubera QR Menu"
                className="w-52 h-52 mx-auto"
              />
            )}
          </div>

          <p className="text-xs sm:text-sm font-bold text-slate-800 mb-1">
            Scan with your camera to view our digital menu
          </p>
          <p className="text-[10px] sm:text-[11px] text-slate-500 mb-4 font-medium">
            No app download required • Instant high-speed access
          </p>

          {/* Footer note */}
          <div className="pt-3 border-t border-amber-200/60 text-[10px] text-slate-600 font-medium">
            Authentic Andhra & Multi-Cuisine Delicacies
          </div>
        </div>
      </div>
    </div>
  );
};
