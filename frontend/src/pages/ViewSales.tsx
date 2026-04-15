import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Download, Trash2, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

const ViewSales = () => {
  const { toast } = useToast();
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [salesmanFilter, setSalesmanFilter] = useState('');
  const [salesmen, setSalesmen] = useState<any[]>([]);

  const fetchSales = () => {
    setLoading(true);
    const params: Record<string, string> = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (salesmanFilter) params.salesman = salesmanFilter;
    api.getSales(params).then(r => { setSales(r.sales || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSales();
    api.getSalesmen().then(r => setSalesmen(r.salesmen || r || [])).catch(() => {});
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this sale?')) return;
    try {
      await api.deleteSale(id);
      toast({ title: 'Deleted', description: 'Sale removed' });
      fetchSales();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  const handleExport = async () => {
    const params: Record<string, string> = {};
    if (fromDate) params.from_date = fromDate;
    if (toDate) params.to_date = toDate;
    if (salesmanFilter) params.salesman = salesmanFilter;
    const res = await api.exportSales(params);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sales_export.xlsx';
    a.click();
  };

  const filtered = sales.filter(s =>
    !search || (s.bill_no && s.bill_no.toLowerCase().includes(search.toLowerCase())) ||
    (s.salesman_name && s.salesman_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Sales Records</h1>
          <p className="text-muted-foreground mt-1">View and manage all sales</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleExport} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-primary text-primary text-sm font-medium hover:bg-primary/5 transition-colors">
          <Download size={16} /> Export
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search bill no or salesman..." className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background/50 input-glow text-sm" />
          </div>
          <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background/50 input-glow text-sm" />
          <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background/50 input-glow text-sm" />
          <select value={salesmanFilter} onChange={e => setSalesmanFilter(e.target.value)} className="px-4 py-2.5 rounded-xl border border-border bg-background/50 input-glow text-sm">
            <option value="">All Salesmen</option>
            {salesmen.map((s: any) => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
          </select>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={fetchSales} className="px-5 py-2.5 rounded-xl gold-shine text-white text-sm font-medium">
            <Filter size={16} />
          </motion.button>
        </div>
      </motion.div>

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-accent/50">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Bill No</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Date</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Salesman</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Sales ₹</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Discount ₹</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Net ₹</th>
                <th className="text-right px-5 py-3 font-medium text-muted-foreground">Commission</th>
                <th className="text-center px-5 py-3 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-12"><Loader2 className="animate-spin mx-auto text-primary" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No sales found</td></tr>
              ) : (
                filtered.map((s: any, i: number) => (
                  <motion.tr
                    key={s.id || i}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 hover:bg-accent/30 transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium">{s.bill_no}</td>
                    <td className="px-5 py-3.5 text-muted-foreground">{s.date}</td>
                    <td className="px-5 py-3.5">{s.salesman_name}</td>
                    <td className="px-5 py-3.5 text-right">{formatINR(s.sales_amt)}</td>
                    <td className="px-5 py-3.5 text-right">{formatINR(s.discount_amt)}</td>
                    <td className="px-5 py-3.5 text-right font-medium">{formatINR(s.net_amount)}</td>
                    <td className="px-5 py-3.5 text-right font-medium text-primary">{formatINR(s.total_commission)}</td>
                    <td className="px-5 py-3.5 text-center">
                      <button onClick={() => handleDelete(s.id)} className="text-muted-foreground hover:text-destructive transition-colors p-1">
                        <Trash2 size={15} />
                      </button>
                    </td>
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

export default ViewSales;
