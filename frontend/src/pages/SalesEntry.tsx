import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Hash, User, IndianRupee, Calculator, Check, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { formatINR, formatPercent } from '@/lib/format';
import { useToast } from '@/hooks/use-toast';

const SalesEntry = () => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    date: localStorage.getItem('dg_last_date') || new Date().toISOString().split('T')[0],
    bill_no: '',
    salesman_name: '',
    sales_amt: '',
    discount_amt: '',
    gr_amt: '',
    outstanding_amt: '',
  });
  const [calc, setCalc] = useState<any>(null);
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    api.getNextBillNo().then(r => setForm(f => ({ ...f, bill_no: r.next_bill_no || r.bill_no || '' }))).catch(() => { });
    api.getSalesmen().then(r => setSalesmen(r.salesmen || r || [])).catch(() => { });
  }, []);

  const calculateDebounced = useCallback(
    (() => {
      let timer: any;
      return (data: typeof form) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          const sales_amt = parseFloat(data.sales_amt) || 0;
          if (sales_amt <= 0) { setCalc(null); return; }
          api.calculateSale({
            sales_amt,
            discount_amt: parseFloat(data.discount_amt) || 0,
            gr_amt: parseFloat(data.gr_amt) || 0,
            outstanding_amt: parseFloat(data.outstanding_amt) || 0,
          }).then(setCalc).catch(() => { });
        }, 300);
      };
    })(),
    []
  );

  const updateField = (field: string, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);
    if (field === 'date') {
      localStorage.setItem('dg_last_date', value);
    }
    calculateDebounced(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.salesman_name) {
      toast({ title: 'Error', description: 'Please select a salesman', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      await api.submitSale({
        ...form,
        sales_amt: parseFloat(form.sales_amt) || 0,
        discount_amt: parseFloat(form.discount_amt) || 0,
        gr_amt: parseFloat(form.gr_amt) || 0,
        outstanding_amt: parseFloat(form.outstanding_amt) || 0,
      });
      setSubmitted(true);
      toast({ title: 'Success!', description: 'Sale recorded successfully' });
      setTimeout(() => {
        setForm({ date: new Date().toISOString().split('T')[0], bill_no: '', salesman_name: '', sales_amt: '', discount_amt: '', gr_amt: '', outstanding_amt: '' });
        setCalc(null);
        setSubmitted(false);
        api.getNextBillNo().then(r => setForm(f => ({ ...f, bill_no: r.next_bill_no || r.bill_no || '' }))).catch(() => { });
      }, 1500);
    } catch {
      toast({ title: 'Error', description: 'Failed to submit sale', variant: 'destructive' });
    }
    setLoading(false);
  };

  const amtReceived = parseFloat(form.outstanding_amt) || 0;
  const outstandingBal = calc?.outstanding_balance ?? 0;

  const calcItems = calc ? [
    { label: 'Net Amount', value: formatINR(calc.net_amount) },
    { label: 'Amt Received', value: formatINR(amtReceived) },
    { label: 'Outstanding', value: formatINR(outstandingBal), highlight: outstandingBal > 0 },
    { label: 'Discount %', value: formatPercent(calc.discount_percentage) },
    { label: '1% Commission', value: formatINR(calc.commission_1_percent) },
    { label: 'CD Bonus', value: formatINR(calc.cd_bonus_amount), eligible: calc.cd_bonus_eligible },
    { label: 'LT Bonus', value: formatINR(calc.lt_bonus) },
  ] : [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">New Sale Entry</h1>
        <p className="text-muted-foreground mt-1">Record a new sale with real-time commission calculation</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-8">
        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 glass-card p-8 space-y-5"
        >
          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2"><Calendar size={14} /> Date</label>
              <input type="date" value={form.date} onChange={e => updateField('date', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2"><Hash size={14} /> Bill No</label>
              <input type="text" value={form.bill_no} onChange={e => updateField('bill_no', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2"><User size={14} /> Salesman</label>
            <select value={form.salesman_name} onChange={e => updateField('salesman_name', e.target.value)} className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm">
              <option value="">Select Salesman</option>
              {salesmen.map((s: any) => <option key={s.id || s.name} value={s.name}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1.5 flex items-center gap-2"><IndianRupee size={14} /> Sales Amount</label>
            <input type="number" step="0.01" value={form.sales_amt} onChange={e => updateField('sales_amt', e.target.value)} placeholder="₹0.00" className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm" required />
          </div>

          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5">Discount ₹</label>
              <input type="number" step="0.01" value={form.discount_amt} onChange={e => updateField('discount_amt', e.target.value)} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5">GR Amount ₹</label>
              <input type="number" step="0.01" value={form.gr_amt} onChange={e => updateField('gr_amt', e.target.value)} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm" />
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5">Amt Received ₹</label>
              <input type="number" step="0.01" value={form.outstanding_amt} onChange={e => updateField('outstanding_amt', e.target.value)} placeholder="0.00" className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm" />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            type="submit"
            disabled={loading || submitted}
            className="w-full py-3.5 rounded-xl gold-shine text-white font-semibold text-sm shadow-lg shadow-primary/25 disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {submitted ? <><Check size={18} /> Recorded!</> : loading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Sale'}
          </motion.button>
        </motion.form>

        {/* Calculation Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="glass-card p-8 sticky top-8 bg-gradient-to-br from-primary/5 to-secondary/5">
            <div className="flex items-center gap-2 mb-6">
              <Calculator size={18} className="text-primary" />
              <h2 className="text-lg font-semibold font-['Playfair_Display']">Commission Breakdown</h2>
            </div>

            <AnimatePresence mode="wait">
              {calc ? (
                <motion.div key="calc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                  {calcItems.map((c, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex justify-between items-center py-2 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{c.label}</span>
                        {c.eligible !== undefined && c.eligible && (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <Check size={12} className="text-emerald-600" />
                            <span className="text-[10px] text-emerald-600 font-medium">Eligible</span>
                          </div>
                        )}
                        {c.eligible !== undefined && !c.eligible && (
                          <span className="text-[10px] text-muted-foreground/60">Not eligible</span>
                        )}
                      </div>
                      <span className={`text-sm font-semibold font-mono ${c.highlight ? 'text-destructive' : ''}`}>{c.value}</span>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-foreground">Total Commission</span>
                      <span className="text-3xl font-bold gold-text font-mono tracking-tight">{formatINR(calc.total_commission)}</span>
                    </div>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12 text-muted-foreground text-sm">
                  <Calculator size={40} className="mx-auto mb-3 opacity-30" />
                  Enter sale amount to see calculations
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SalesEntry;
