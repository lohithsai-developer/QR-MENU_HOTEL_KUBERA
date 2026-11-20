import React, { useState, useEffect } from 'react';
import { ChefHat, Clock, CheckCircle2, Volume2, VolumeX, RefreshCw, Printer, User } from 'lucide-react';
import { api } from '../../services/api';
import { VegBadge } from '../Common/VegBadge';

export const LiveOrdersFeed = () => {
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [tableFilter, setTableFilter] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [lastOrderCount, setLastOrderCount] = useState(0);

  const fetchOrders = async () => {
    try {
      const res = await api.getOrders({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        tableNumber: tableFilter ? tableFilter : undefined
      });
      if (res.success && res.data) {
        setOrders(res.data);

        // Check if new orders arrived to play alert sound
        const pendingCount = res.data.filter(o => o.status === 'pending').length;
        if (soundEnabled && pendingCount > lastOrderCount && lastOrderCount !== 0) {
          playOrderChime();
        }
        setLastOrderCount(pendingCount);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 6000);
    return () => clearInterval(interval);
  }, [statusFilter, tableFilter]);

  const playOrderChime = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch (e) {
      // Audio autoplay might be restricted by browser
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const res = await api.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        setOrders(prev =>
          prev.map(o => (o.id === orderId || o._id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const printKOT = (order) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>KOT - Table ${order.tableNumber} - #${order.orderNumber}</title>
          <style>
            body { font-family: monospace; padding: 20px; max-width: 300px; margin: auto; }
            h2, h3 { text-align: center; margin: 4px 0; }
            .divider { border-bottom: 1px dashed #000; margin: 10px 0; }
            .item-row { display: flex; justify-content: space-between; margin: 4px 0; }
            .instructions { background: #eee; padding: 5px; margin: 8px 0; font-size: 11px; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <h2>HOTEL KUBERA (ELURU)</h2>
          <h3>KITCHEN ORDER TICKET (KOT)</h3>
          <div class="divider"></div>
          <div><strong>Table: ${order.tableNumber}</strong></div>
          <div>Order: #${order.orderNumber}</div>
          <div>Time: ${new Date(order.createdAt).toLocaleTimeString()}</div>
          <div class="divider"></div>
          <div class="bold">ITEMS:</div>
          ${order.items
            .map(
              item => `
            <div class="item-row">
              <span>${item.quantity}x ${item.name}</span>
              <span>₹${item.price * item.quantity}</span>
            </div>
            ${item.specialInstructions ? `<div class="instructions">Note: ${item.specialInstructions}</div>` : ''}
          `
            )
            .join('')}
          <div class="divider"></div>
          ${order.customerNotes ? `<div class="instructions"><strong>Special Instructions:</strong><br>${order.customerNotes}</div>` : ''}
          <div class="item-row bold">
            <span>TOTAL AMOUNT:</span>
            <span>₹${order.totalAmount}</span>
          </div>
          <div class="divider"></div>
          <p style="text-align: center; font-size: 10px;">Taste the Wealth of Flavours</p>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const preparingCount = orders.filter(o => o.status === 'preparing').length;

  return (
    <div className="space-y-3 sm:space-y-4">
      {/* Top Filter & Action Strip */}
      <div className="p-3 sm:p-4 rounded-2xl bg-white border border-stone-200 shadow-2xs space-y-2.5">
        {/* Row 1: Status Filters - Smooth Horizontal Scroll on Mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {[
            { id: 'all', label: 'All Orders', count: orders.length },
            { id: 'pending', label: 'Pending', count: pendingCount, pulse: pendingCount > 0 },
            { id: 'preparing', label: 'Cooking', count: preparingCount },
            { id: 'completed', label: 'Served' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                statusFilter === tab.id
                  ? 'bg-kubera-burgundy text-white shadow-2xs'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200/70 border border-stone-200/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    tab.pulse
                      ? 'bg-amber-400 text-slate-900 animate-pulse'
                      : 'bg-stone-200 text-slate-700'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Row 2: Table filter + Chime sound toggle + Manual Refresh */}
        <div className="flex items-center gap-2 pt-1 border-t border-stone-100">
          <input
            type="text"
            value={tableFilter}
            onChange={e => setTableFilter(e.target.value)}
            placeholder="Filter Table (e.g. 04)"
            className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-kubera-burgundy"
          />

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1 shrink-0 ${
              soundEnabled
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-stone-50 border-stone-200 text-slate-400'
            }`}
            title={soundEnabled ? 'Chime sound enabled' : 'Chime sound muted'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          <button
            onClick={fetchOrders}
            className="p-2 rounded-xl bg-stone-50 border border-stone-200 hover:border-kubera-burgundy text-slate-600 hover:text-kubera-burgundy transition-colors shrink-0"
            title="Refresh Orders"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Orders Grid */}
      {orders.length === 0 ? (
        <div className="py-16 text-center rounded-3xl bg-white border border-stone-200 shadow-xs space-y-3">
          <div className="w-14 h-14 mx-auto rounded-full bg-stone-100 flex items-center justify-center text-2xl">
            🍽️
          </div>
          <h3 className="text-base font-serif font-bold text-slate-800">No Orders in this View</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            New customer orders scanned from table QR codes will instantly pop up here in real-time.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map(order => {
            const isPending = order.status === 'pending';
            const isPreparing = order.status === 'preparing';
            const isCompleted = order.status === 'completed';

            return (
              <div
                key={order.id || order._id}
                className={`rounded-2xl overflow-hidden bg-white border flex flex-col justify-between transition-all duration-300 shadow-card-subtle ${
                  isPending
                    ? 'border-amber-300 ring-1 ring-amber-200 bg-amber-50/10'
                    : isPreparing
                    ? 'border-blue-300 ring-1 ring-blue-100 bg-blue-50/10'
                    : 'border-stone-200'
                }`}
              >
                {/* Order Card Header */}
                <div className="p-3.5 border-b border-stone-200 bg-stone-50/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-xl bg-kubera-burgundy text-white font-extrabold text-sm shadow-xs">
                      Table {order.tableNumber}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-700">
                      #{order.orderNumber}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isPending
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                        : isPreparing
                        ? 'bg-blue-100 text-blue-900 border border-blue-300'
                        : isCompleted
                        ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border border-rose-300'
                    }`}
                  >
                    {isPending ? 'Pending' : isPreparing ? 'Cooking' : isCompleted ? 'Completed' : 'Cancelled'}
                  </span>
                </div>

                {/* Customer info & Time */}
                <div className="px-3.5 pt-2 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-amber-600" />
                    {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {order.customerName && order.customerName !== 'Guest' && (
                    <span className="flex items-center gap-1 text-slate-700 font-semibold">
                      <User className="w-3 h-3 text-slate-400" />
                      {order.customerName}
                    </span>
                  )}
                </div>

                {/* Items Ordered List */}
                <div className="p-3.5 space-y-2 flex-1">
                  <div className="space-y-1.5 max-h-48 overflow-y-auto no-scrollbar">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-start justify-between gap-2 p-2 rounded-xl bg-stone-50 border border-stone-200/80 text-xs"
                      >
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <VegBadge isVeg={item.isVeg} size="sm" className="mt-0.5 shrink-0" />
                          <div>
                            <span className="font-semibold text-slate-900">
                              {item.quantity}x {item.name}
                            </span>
                            {item.specialInstructions && (
                              <p className="text-[10px] text-amber-800 italic">
                                Note: {item.specialInstructions}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="font-extrabold text-kubera-burgundy whitespace-nowrap">
                          ₹{item.price * item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Special Customer Notes */}
                  {order.customerNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-1.5">
                      <ChefHat className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold block text-[10px] uppercase tracking-wide text-amber-800">
                          Cooking Note:
                        </span>
                        <span>{order.customerNotes}</span>
                      </div>
                    </div>
                  )}

                  {/* Total & Tax breakdown */}
                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Total (incl. 5% GST):</span>
                    <span className="text-sm font-extrabold text-kubera-burgundy">
                      ₹{order.totalAmount}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 border-t border-stone-200 bg-stone-50/60 flex items-center gap-1.5">
                  {isPending && (
                    <button
                      onClick={() => handleStatusUpdate(order.id || order._id, 'preparing')}
                      className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Start Preparing</span>
                    </button>
                  )}

                  {isPreparing && (
                    <button
                      onClick={() => handleStatusUpdate(order.id || order._id, 'completed')}
                      className="flex-1 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs active:scale-95 flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Mark Served</span>
                    </button>
                  )}

                  <button
                    onClick={() => printKOT(order)}
                    className="p-2 rounded-xl bg-white hover:bg-stone-100 text-slate-700 border border-stone-200 transition-colors shadow-2xs"
                    title="Print Kitchen Ticket (KOT)"
                  >
                    <Printer className="w-4 h-4" />
                  </button>

                  {!isCompleted && order.status !== 'cancelled' && (
                    <button
                      onClick={() => handleStatusUpdate(order.id || order._id, 'cancelled')}
                      className="py-2 px-2.5 rounded-xl bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-700 border border-stone-200 text-xs transition-colors"
                      title="Cancel order"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
