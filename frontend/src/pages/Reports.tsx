import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { CalendarDays, Loader2, Download } from 'lucide-react';

const COLORS = ['hsl(38,70%,50%)', 'hsl(340,55%,55%)', 'hsl(160,50%,45%)', 'hsl(250,50%,55%)', 'hsl(20,70%,50%)', 'hsl(200,60%,50%)'];

const Reports = () => {
  const [data, setData] = useState<any>(null);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    api.getReports(params).then(setData).catch(() => { }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchReports(); }, []);

  const salesmanData = (data?.by_salesman || []).map((s: any) => ({
    ...s,
    name: s.salesman_name,
  }));

  const summaryCards = data ? [
    { label: 'Total Sales', value: formatINR(data.total_sales) },
    { label: 'Total Commission', value: formatINR(data.total_commission) },
    { label: 'Total Transactions', value: data.total_transactions || data.sales_count || 0 },
  ] : [];

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const res = await fetch('/api/export/excel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          start_date: fromDate || undefined,
          end_date: toDate || undefined,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || 'Export failed');
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sales_report_${fromDate || 'all'}_to_${toDate || 'all'}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">Analytics & insights</p>
        </div>
      </div>

      {/* Date Filters + Export */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label htmlFor="report-from" className="text-xs text-muted-foreground mb-1 block">From</label>
          <input id="report-from" name="report-from" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background/50 input-glow text-sm" />
        </div>
        <div>
          <label htmlFor="report-to" className="text-xs text-muted-foreground mb-1 block">To</label>
          <input id="report-to" name="report-to" type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background/50 input-glow text-sm" />
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={fetchReports} className="px-6 py-2.5 rounded-xl gold-shine text-white text-sm font-medium flex items-center gap-2">
          <CalendarDays size={16} /> Generate
        </motion.button>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExportExcel} disabled={exporting} className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium flex items-center gap-2 disabled:opacity-50">
          <Download size={16} /> {exporting ? 'Exporting...' : 'Download Excel'}
        </motion.button>
      </motion.div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : (
        <>
          {/* Summary */}
          <div className="grid sm:grid-cols-3 gap-5 mb-8">
            {summaryCards.map((c, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center hover-lift">
                <p className="text-sm text-muted-foreground">{c.label}</p>
                <p className="text-2xl font-bold mt-1 font-['Playfair_Display']">{c.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 font-['Playfair_Display']">Commission by Salesman</h2>
              <div className="h-72">
                {salesmanData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data for selected period</div>
                ) : (
                  <ResponsiveContainer>
                    <BarChart data={salesmanData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(38,20%,88%)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(30,10%,45%)" />
                      <YAxis tick={{ fontSize: 11 }} stroke="hsl(30,10%,45%)" />
                      <Tooltip contentStyle={{ background: 'hsl(40,25%,99%)', border: '1px solid hsl(38,20%,88%)', borderRadius: 12 }} />
                      <Bar dataKey="total_commission" fill="hsl(38,70%,50%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <h2 className="text-lg font-semibold mb-4 font-['Playfair_Display']">Sales Distribution</h2>
              <div className="h-72">
                {salesmanData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">No data for selected period</div>
                ) : (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={salesmanData} dataKey="total_sales" nameKey="name" cx="50%" cy="50%" outerRadius={100} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                        {salesmanData.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: 'hsl(40,25%,99%)', border: '1px solid hsl(38,20%,88%)', borderRadius: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>
          </div>

          {/* Salesman Summary Table */}
          {salesmanData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card overflow-hidden">
              <div className="p-6 border-b border-border">
                <h2 className="text-lg font-semibold font-['Playfair_Display']">Salesman-wise Summary</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-accent/50">
                      <th className="text-left px-6 py-3 font-medium text-muted-foreground">Salesman</th>
                      <th className="text-right px-6 py-3 font-medium text-muted-foreground">Total Sales</th>
                      <th className="text-right px-6 py-3 font-medium text-muted-foreground">Discount</th>
                      <th className="text-right px-6 py-3 font-medium text-muted-foreground">Net Amount</th>
                      <th className="text-right px-6 py-3 font-medium text-muted-foreground">Commission</th>
                      <th className="text-center px-6 py-3 font-medium text-muted-foreground">Bills</th>
                      <th className="text-center px-6 py-3 font-medium text-muted-foreground">Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salesmanData.map((s: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                        <td className="px-6 py-4 font-medium">{s.name}</td>
                        <td className="px-6 py-4 text-right">{formatINR(s.total_sales)}</td>
                        <td className="px-6 py-4 text-right">{formatINR(s.total_discount)}</td>
                        <td className="px-6 py-4 text-right">{formatINR(s.total_net)}</td>
                        <td className="px-6 py-4 text-right font-medium text-primary">{formatINR(s.total_commission)}</td>
                        <td className="px-6 py-4 text-center">{s.transaction_count}</td>
                        <td className="px-6 py-4 text-center">{s.days_worked}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;
