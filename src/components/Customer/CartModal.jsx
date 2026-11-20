import React, { useState } from 'react';
import { X, Trash2, Plus, Minus, ChefHat, Sparkles, ShoppingBag, Bell, CheckSquare, Users, Copy, Check, FileText } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { VegBadge } from '../Common/VegBadge';
import { api } from '../../services/api';

export const CartModal = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    removeFromCart,
    updateQuantity,
    subtotal,
    gst,
    grandTotal,
    clearCart
  } = useCart();

  const [cookingInstructions, setCookingInstructions] = useState('');
  const [tableInput, setTableInput] = useState('');
  const [isCallingWaiter, setIsCallingWaiter] = useState(false);
  const [waiterCalledSuccess, setWaiterCalledSuccess] = useState(false);
  const [showWaiterSlip, setShowWaiterSlip] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isCartOpen) return null;

  const handleCallWaiter = async () => {
    setIsCallingWaiter(true);
    try {
      // Send a waiter assistance request to server
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: tableInput.trim() || 'Dine-In Guest',
          customerNotes: `[WAITER CALL FOR ORDER]: ${cookingInstructions || 'Ready to order'}`,
          items: cartItems,
          subtotal,
          tax: gst,
          totalAmount: grandTotal
        })
      });

      setWaiterCalledSuccess(true);
      setTimeout(() => {
        setWaiterCalledSuccess(false);
      }, 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsCallingWaiter(false);
    }
  };

  const handleCopySummary = () => {
    const text = `*Hotel Kubera (Eluru) - My Order Selection*\n` +
      cartItems.map(i => `• ${i.quantity}x ${i.name} (${i.servingSize || 'Serves 1-2'}) - ₹${i.price * i.quantity}`).join('\n') +
      `\n\nEstimated Bill: ₹${grandTotal} (incl. 5% GST)` +
      (cookingInstructions ? `\nNotes: ${cookingInstructions}` : '');

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white border-t sm:border border-stone-200 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col z-10">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-kubera-burgundy">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-serif font-bold text-slate-900">
                My Menu Selection & Bill Estimator
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                Shortlisted dishes to show your captain/waiter
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-stone-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 flex-1">
          {cartItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 space-y-3">
              <div className="w-16 h-16 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-2xl">
                📋
              </div>
              <p className="text-sm font-semibold text-slate-700">No dishes shortlisted yet.</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Tap <strong>"+ Add to Selection"</strong> on any dish to shortlist it and calculate your estimated bill.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="mt-2 px-4 py-2 rounded-xl bg-kubera-burgundy text-white text-xs font-semibold"
              >
                Browse Menu Dishes
              </button>
            </div>
          ) : (
            <>
              {/* Informative Guidance Banner */}
              <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/90 text-amber-900 text-xs flex items-start gap-2">
                <ChefHat className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-bold block text-slate-900">Ordering at Hotel Kubera:</span>
                  <p className="text-[11px] leading-relaxed text-amber-950">
                    Review your shortlisted dishes below. When you are ready, show this screen to your waiter to take your order, or click <strong>"Call Waiter to Table"</strong>.
                  </p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <VegBadge isVeg={item.isVeg} size="sm" />
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                          {item.name}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="font-extrabold text-kubera-burgundy">
                            ₹{item.price * item.quantity}
                          </span>
                          <span className="text-slate-400 font-normal">
                            (₹{item.price} each)
                          </span>
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-amber-800 bg-amber-100/60 px-1.5 py-0.2 rounded font-semibold">
                            <Users className="w-2.5 h-2.5" /> {item.servingSize || 'Serves 1-2'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <div className="flex items-center bg-white border border-stone-200 rounded-lg p-0.5 shadow-xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-stone-100 text-xs transition-colors"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-stone-100 text-xs transition-colors"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1"
                        title="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Special Cooking Instructions */}
              <div className="space-y-1 pt-1">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  Special Cooking Instructions / Preferences
                </label>
                <textarea
                  value={cookingInstructions}
                  onChange={(e) => setCookingInstructions(e.target.value)}
                  placeholder="e.g. Less spicy for kids, extra lemon & onions, serve soup first..."
                  rows={2}
                  className="w-full p-2.5 text-xs rounded-xl bg-stone-50 border border-stone-200 focus:bg-white focus:border-kubera-burgundy focus:outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* Bill Breakdown */}
              <div className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Estimated Dishes Total</span>
                  <span className="text-slate-900 font-semibold">₹{subtotal}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>GST (5% Restaurant Tax)</span>
                  <span className="text-slate-900 font-semibold">₹{gst}</span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between items-center text-sm font-bold text-slate-900">
                  <span>Estimated Total Bill</span>
                  <span className="text-base font-extrabold text-kubera-burgundy">
                    ₹{grandTotal}
                  </span>
                </div>
              </div>

              {/* Waiter Call Notification Banner */}
              {waiterCalledSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Captain / Server has been notified! They will attend your table shortly.</span>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && (
          <div className="p-4 border-t border-stone-200 bg-white space-y-2.5">
            {/* Optional Table Input for Calling Server */}
            <div className="flex gap-2">
              <input
                type="text"
                value={tableInput}
                onChange={(e) => setTableInput(e.target.value)}
                placeholder="Table No. (Optional)"
                className="w-32 p-2 text-xs rounded-xl bg-stone-50 border border-stone-200 text-slate-800 focus:bg-white"
              />
              <button
                onClick={handleCallWaiter}
                disabled={isCallingWaiter}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs border border-stone-300 transition-all flex items-center justify-center gap-1.5"
              >
                <Bell className="w-3.5 h-3.5 text-amber-700" />
                <span>{isCallingWaiter ? 'Calling Server...' : 'Call Waiter to Table'}</span>
              </button>
            </div>

            {/* Main Action: Show Slip or Copy */}
            <div className="flex gap-2">
              <button
                onClick={() => setShowWaiterSlip(true)}
                className="flex-1 py-3 px-4 rounded-xl bg-kubera-burgundy hover:bg-kubera-maroon text-white font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                <CheckSquare className="w-4 h-4 text-amber-200" />
                <span>Show Order Slip to Waiter</span>
              </button>

              <button
                onClick={handleCopySummary}
                className="p-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-700 border border-stone-200 transition-colors"
                title="Copy selection list"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-400">
              Hotel Kubera • Orders are confirmed in-person by your dining captain.
            </p>
          </div>
        )}
      </div>

      {/* Full-Screen Waiter Slip Modal */}
      {showWaiterSlip && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-sm bg-white border border-stone-300 rounded-3xl shadow-2xl p-6 text-slate-900">
            <button
              onClick={() => setShowWaiterSlip(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center pb-3 border-b border-stone-200 mb-4">
              <h3 className="font-serif font-bold text-lg text-kubera-burgundy">HOTEL KUBERA</h3>
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                GUEST ORDER SELECTION SLIP
              </p>
              {tableInput && (
                <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-stone-100 text-xs font-bold text-slate-800">
                  Table: {tableInput}
                </span>
              )}
            </div>

            <div className="space-y-2 mb-4 max-h-60 overflow-y-auto no-scrollbar">
              {cartItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 border-b border-stone-100 text-xs sm:text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center font-bold text-kubera-burgundy text-xs">
                      {item.quantity}
                    </span>
                    <span className="font-semibold text-slate-800">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-700">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            {cookingInstructions && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 mb-4">
                <strong>Cooking Note:</strong> {cookingInstructions}
              </div>
            )}

            <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold mb-4">
              <span>Estimated Bill:</span>
              <span className="text-base text-kubera-burgundy font-extrabold">₹{grandTotal}</span>
            </div>

            <button
              onClick={() => setShowWaiterSlip(false)}
              className="w-full py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs"
            >
              Done / Return to Menu
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
