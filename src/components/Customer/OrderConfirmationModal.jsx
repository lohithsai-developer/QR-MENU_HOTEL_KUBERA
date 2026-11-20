import React from 'react';
import { CheckCircle2, Clock, X } from 'lucide-react';

export const OrderConfirmationModal = ({ order, isOpen, onClose }) => {
  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity" onClick={onClose} />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white border border-stone-200 rounded-3xl shadow-2xl p-6 z-10 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-stone-100"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 mx-auto rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        {/* Header */}
        <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">
          Order Confirmed
        </span>
        <h2 className="text-xl font-serif font-bold text-slate-900 mt-2 mb-1">
          Thank You for Dining with Us!
        </h2>
        <p className="text-xs text-slate-500 mb-4">
          Your order has been transmitted directly to Hotel Kubera's kitchen station.
        </p>

        {/* Order Details Badge */}
        <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 mb-4 text-left">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-2 border-b border-stone-200">
            <span>Order Number:</span>
            <span className="font-mono font-bold text-kubera-burgundy text-sm">
              #{order.orderNumber}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 py-2 border-b border-stone-200">
            <span>Table:</span>
            <span className="font-bold text-slate-900">Table {order.tableNumber}</span>
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 pt-2">
            <span>Estimated Prep Time:</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> 15-20 Mins
            </span>
          </div>
        </div>

        {/* Real-Time Kitchen Progress Steps */}
        <div className="py-2 mb-4">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2 px-1">
            <span className="text-emerald-700 font-bold">1. Received</span>
            <span className={order.status === 'preparing' || order.status === 'completed' ? 'text-amber-700 font-bold' : ''}>
              2. Cooking
            </span>
            <span className={order.status === 'completed' ? 'text-emerald-700 font-bold' : ''}>
              3. Served
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden p-0.5 border border-stone-200">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
              style={{
                width:
                  order.status === 'completed'
                    ? '100%'
                    : order.status === 'preparing'
                    ? '65%'
                    : '33%'
              }}
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white text-xs sm:text-sm font-bold shadow-xs transition-all"
          >
            Add More Dishes
          </button>
        </div>
      </div>
    </div>
  );
};
