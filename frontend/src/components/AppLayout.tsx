import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShoppingBag, ClipboardList, BarChart3,
  Users, LogOut, Menu, X, Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import logoImg from '@/assets/dreamgirl-logo.jpeg';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/sales/new', icon: ShoppingBag, label: 'New Sale' },
  { to: '/sales', icon: ClipboardList, label: 'View Sales' },
  { to: '/reports', icon: BarChart3, label: 'Reports' },
  { to: '/salesmen', icon: Users, label: 'Salesmen' },
];

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-sm">
        <div className="p-6 flex items-center gap-3 border-b border-border">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
            <img src={logoImg} alt="DreamGirl" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-lg font-bold gold-text font-['Playfair_Display']">DreamGirl</h1>
            <p className="text-[10px] text-muted-foreground tracking-wider">CRM</p>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <item.icon size={18} />
                {item.label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-border">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all w-full"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20">
            <img src={logoImg} alt="DreamGirl" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold gold-text font-['Playfair_Display']">DreamGirl</span>
        </div>
        <button onClick={() => setSidebarOpen(true)} className="text-foreground">
          <Menu size={24} />
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-card border-r border-border flex flex-col"
            >
              <div className="p-6 flex items-center justify-between border-b border-border">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary/20">
                    <img src={logoImg} alt="DreamGirl" className="w-full h-full object-cover" />
                  </div>
                  <h1 className="text-lg font-bold gold-text font-['Playfair_Display']">DreamGirl</h1>
                </div>
                <button onClick={() => setSidebarOpen(false)}><X size={20} /></button>
              </div>
              <nav className="flex-1 p-4 space-y-1">
                {navItems.map(item => {
                  const active = location.pathname === item.to;
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'
                      }`}
                    >
                      <item.icon size={18} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <div className="p-4 border-t border-border">
                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-destructive w-full">
                  <LogOut size={18} /> Sign Out
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 mt-14 lg:mt-0 overflow-auto">
        <div className="p-6 lg:p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
