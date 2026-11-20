import React from 'react';
import { X, MapPin, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const TableSelectorModal = () => {
  const { tableNumber, setTableNumber, isTableModalOpen, setIsTableModalOpen } = useCart();

  if (!isTableModalOpen) return null;

  // Preset tables 1 through 16 + Takeaway
  const tables = Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'));

  const handleSelect = (num) => {
    setTableNumber(num);
    setIsTableModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsTableModalOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-sm bg-white border border-stone-200 rounded-3xl shadow-2xl p-5 z-10">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-kubera-burgundy">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-sm text-slate-900">Select Your Table</h3>
              <p className="text-[11px] text-slate-500">Hotel Kubera Dining Hall</p>
            </div>
          </div>
          <button
            onClick={() => setIsTableModalOpen(false)}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 mb-3">
          Select the table number printed on your table's wooden standee or scan code:
        </p>

        {/* Table Grid */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {tables.map((num) => {
            const isSelected = tableNumber === num;
            return (
              <button
                key={num}
                onClick={() => handleSelect(num)}
                className={`py-2.5 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center gap-0.5 border ${
                  isSelected
                    ? 'bg-kubera-burgundy text-white border-kubera-maroon shadow-xs scale-102'
                    : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-kubera-burgundy hover:bg-stone-100'
                }`}
              >
                <span>T-{num}</span>
                {isSelected && <Check className="w-3 h-3 text-amber-200" />}
              </button>
            );
          })}
        </div>

        {/* Takeaway Option */}
        <button
          onClick={() => handleSelect('Takeaway')}
          className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-2 ${
            tableNumber === 'Takeaway'
              ? 'bg-kubera-burgundy text-white border-kubera-maroon shadow-xs'
              : 'bg-stone-50 text-slate-700 border-stone-200 hover:border-kubera-burgundy'
          }`}
        >
          🥡 Takeaway / Parcel Counter
        </button>
      </div>
    </div>
  );
};
