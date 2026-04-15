import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, Loader2, X } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

const Salesmen = () => {
  const { toast } = useToast();
  const [salesmen, setSalesmen] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchSalesmen = () => {
    setLoading(true);
    api.getSalesmen().then(r => { setSalesmen(r.salesmen || r || []); setLoading(false); }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchSalesmen(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    setAdding(true);
    try {
      await api.addSalesman(newName.trim());
      toast({ title: 'Success', description: `${newName} added` });
      setNewName('');
      setShowModal(false);
      fetchSalesmen();
    } catch {
      toast({ title: 'Error', description: 'Failed to add', variant: 'destructive' });
    }
    setAdding(false);
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await api.deleteSalesman(id);
      toast({ title: 'Deleted', description: `${name} removed` });
      fetchSalesmen();
    } catch {
      toast({ title: 'Error', description: 'Failed to delete', variant: 'destructive' });
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Salesmen</h1>
          <p className="text-muted-foreground mt-1">Manage your sales team</p>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowModal(true)} className="flex items-center gap-2 px-5 py-2.5 rounded-xl gold-shine text-white text-sm font-medium shadow-lg shadow-primary/25">
          <Plus size={16} /> Add Salesman
        </motion.button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={32} /></div>
      ) : salesmen.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-16 text-center">
          <Users size={48} className="mx-auto mb-4 text-muted-foreground/30" />
          <p className="text-muted-foreground">No salesmen yet. Add your first one!</p>
        </motion.div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {salesmen.map((s: any, i: number) => (
            <motion.div
              key={s.id || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-card p-6 hover-lift group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-white font-semibold text-sm">
                    {s.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold">{s.name}</p>
                    <p className="text-xs text-muted-foreground">Salesperson</p>
                  </div>
                </div>
                <button onClick={() => handleDelete(s.id, s.name)} className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-1.5">
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="glass-card-strong p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold font-['Playfair_Display']">Add Salesman</h2>
                <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
              </div>
              <form onSubmit={handleAdd} className="space-y-5">
                <input type="text" value={newName} onChange={e => setNewName(e.target.value)} placeholder="Salesman name" className="w-full px-4 py-3 rounded-xl border border-border bg-background/50 input-glow text-sm" autoFocus required />
                <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }} type="submit" disabled={adding} className="w-full py-3 rounded-xl gold-shine text-white font-semibold text-sm disabled:opacity-70">
                  {adding ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Add Salesman'}
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Salesmen;
