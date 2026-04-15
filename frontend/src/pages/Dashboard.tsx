import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, ShoppingBag, Award, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

interface Stats {
  total_sales: number;
  total_commission: number;
  sales_count: number;
  avg_commission: number;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getDashboardStats().catch(() => null),
      api.getSales({ limit: '10' }).catch(() => ({ sales: [] })),
    ]).then(([s, sl]) => {
      setStats(s);
      setSales(sl?.sales || []);
      setLoading(false);
    });
  }, []);

  const statCards = stats ? [
    { label: 'Total Sales', value: formatINR(stats.total_sales), icon: DollarSign, color: 'text-primary' },
    { label: 'Commission', value: formatINR(stats.total_commission), icon: Award, color: 'text-secondary' },
    { label: 'Sales Count', value: stats.sales_count.toLocaleString(), icon: ShoppingBag, color: 'text-emerald-500' },
    { label: 'Avg Commission', value: formatINR(stats.avg_commission), icon: TrendingUp, color: 'text-violet-500' },
  ] : [];

  const chartData = sales.slice().reverse().map((s: any, i: number) => ({
    name: s.bill_no || `#${i + 1}`,
    amount: s.sales_amt || 0,
    commission: s.total_commission || 0,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-8 h-8 border-3 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to DreamGirl CRM</p>
      </div>

      {/* Stat Cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((card, i) => (
          <motion.div key={i} variants={item} className="glass-card p-6 hover-lift group cursor-default">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{card.label}</p>
                <p className="text-3xl font-bold mt-1 font-mono tracking-tight">{card.value}</p>
              </div>
              <div className={`p-3 rounded-xl bg-accent ${card.color}`}>
                <card.icon size={20} />
              </div>
            </div>
            <div className="flex items-center gap-1 mt-3 text-xs text-emerald-500">
              <ArrowUpRight size={12} />
              <span>Trending up</span>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-8">
        <h2 className="text-lg font-semibold mb-4 font-['Playfair_Display']">Sales Trend</h2>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(38, 70%, 50%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(38, 70%, 50%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(38, 20%, 88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(30, 10%, 45%)" />
              <Tooltip
                contentStyle={{ background: 'hsl(40, 25%, 99%)', border: '1px solid hsl(38, 20%, 88%)', borderRadius: 12 }}
              />
              <Area type="monotone" dataKey="amount" stroke="hsl(38, 70%, 50%)" fillOpacity={1} fill="url(#colorAmt)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Sales */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
        <div className="p-6 border-b border-border">
          <h2 className="text-lg font-semibold font-['Playfair_Display']">Recent Sales</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/50">
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Bill No</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-6 py-3 font-medium text-muted-foreground">Salesman</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Amount</th>
                <th className="text-right px-6 py-3 font-medium text-muted-foreground">Commission</th>
              </tr>
            </thead>
            <tbody>
              {sales.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No sales yet</td></tr>
              ) : (
                sales.map((s: any, i: number) => (
                  <motion.tr
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.05 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium">{s.bill_no}</td>
                    <td className="px-6 py-4 text-muted-foreground">{s.date}</td>
                    <td className="px-6 py-4">{s.salesman_name}</td>
                    <td className="px-6 py-4 text-right font-medium">{formatINR(s.sales_amt)}</td>
                    <td className="px-6 py-4 text-right font-medium text-primary">{formatINR(s.total_commission)}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
