import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ChefHat } from 'lucide-react';
import { api } from '../../services/api';

export const RestaurantStats = () => {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    activeTablesCount: 0,
    activeTables: []
  });
  const [allOrders, setAllOrders] = useState([]);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const statsRes = await api.getStats();
        if (statsRes.success) {
          setStats(statsRes.data);
        }
        const ordersRes = await api.getOrders();
        if (ordersRes.success) {
          setAllOrders(ordersRes.data);
        }
      } catch (err) {
        console.error('Failed to load stats:', err);
      }
    };

    loadStats();
    const interval = setInterval(loadStats, 10000);
    return () => clearInterval(interval);
  }, []);

  const tables = Array.from({ length: 16 }, (_, i) => String(i + 1).padStart(2, '0'));

  // Get status for each table
  const getTableStatus = (tableNum) => {
    const activeOrder = allOrders.find(
      (o) =>
        String(o.tableNumber) === String(tableNum) &&
        (o.status === 'pending' || o.status === 'preparing')
    );
    if (!activeOrder) return { status: 'vacant', order: null };
    return { status: activeOrder.status, order: activeOrder };
  };

  return (
    <div className="space-y-6 pb-14 overflow-x-hidden">
      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Revenue */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-card-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Today's Revenue</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
              ₹
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-kubera-burgundy">
            ₹{stats.totalRevenue.toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-emerald-700 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3 h-3" /> Live billing counter
          </span>
        </div>

        {/* Total Orders */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-card-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Total Orders</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              #
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-slate-900">
            {stats.totalOrders}
          </p>
          <span className="text-[10px] text-slate-500 font-medium">All shifts today</span>
        </div>

        {/* Active Tables */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-card-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Active Dining Tables</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-emerald-700">
            {stats.activeTablesCount} / 16
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Currently ordering & dining</span>
        </div>

        {/* Kitchen Load */}
        <div className="p-4 rounded-2xl bg-white border border-stone-200 shadow-card-subtle space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Kitchen Queue</span>
            <ChefHat className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-xl sm:text-2xl font-bold font-serif text-amber-700">
            {stats.pendingOrders + stats.preparingOrders} Orders
          </p>
          <span className="text-[10px] text-amber-800 font-medium">
            {stats.pendingOrders} pending • {stats.preparingOrders} cooking
          </span>
        </div>
      </div>

      {/* Visual Dining Floor Table Map */}
      <div className="p-5 rounded-2xl bg-white border border-stone-200 shadow-card-subtle space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-200 flex-wrap gap-2">
          <div>
            <h3 className="font-serif font-bold text-base text-slate-900">
              Live Restaurant Floor Layout (Tables 01 - 16)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time table occupancy mapped to digital QR menu orders
            </p>
          </div>

          {/* Legends */}
          <div className="flex items-center gap-3 text-xs font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-stone-300"></span>
              <span className="text-slate-600">Vacant</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-amber-800 font-semibold">New Order</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
              <span className="text-blue-800 font-semibold">Cooking</span>
            </div>
          </div>
        </div>

        {/* Tables Grid - Responsive floor grid */}
        <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-8 gap-2.5 sm:gap-3">
          {tables.map((tableNum) => {
            const { status, order } = getTableStatus(tableNum);

            return (
              <div
                key={tableNum}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  status === 'pending'
                    ? 'bg-amber-50 border-amber-300 shadow-xs'
                    : status === 'preparing'
                    ? 'bg-blue-50 border-blue-300 shadow-xs'
                    : 'bg-stone-50 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <div className="text-xs font-serif font-bold text-slate-900 mb-1">
                  Table {tableNum}
                </div>
                <div
                  className={`text-[10px] font-bold uppercase tracking-wider py-0.5 px-1.5 rounded-full inline-block ${
                    status === 'pending'
                      ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                      : status === 'preparing'
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : 'bg-white text-slate-600 border border-stone-200'
                  }`}
                >
                  {status === 'pending' ? 'Ordering' : status === 'preparing' ? 'Cooking' : 'Available'}
                </div>
                {order && (
                  <p className="text-[10px] font-bold text-kubera-burgundy mt-1.5">
                    ₹{order.totalAmount}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
