const API_BASE = '/api';

async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    credentials: 'include', // Include cookies for session
  });
  if (!res.ok) throw new Error(`API Error: ${res.status}`);
  return res;
}

export const api = {
  login: (username: string, password: string) =>
    request('/login', { method: 'POST', body: JSON.stringify({ username, password }) }),

  getDashboardStats: () => request('/dashboard/stats').then(r => r.json()),

  getSales: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/sales${q}`).then(r => r.json());
  },

  getNextBillNo: () => request('/sales/next-bill-no').then(r => r.json()),

  calculateSale: (data: { sales_amt: number; discount_amt: number; gr_amt: number; outstanding_amt: number }) =>
    request('/sales/calculate', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),

  submitSale: (data: Record<string, unknown>) =>
    request('/sales', { method: 'POST', body: JSON.stringify(data) }).then(r => r.json()),

  deleteSale: (id: number) =>
    request(`/sales/${id}`, { method: 'DELETE' }),

  exportSales: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetch(`${API_BASE}/sales/export${q}`);
  },

  getReports: (params?: Record<string, string>) => {
    const q = params ? '?' + new URLSearchParams(params).toString() : '';
    return request(`/reports/summary${q}`).then(r => r.json());
  },

  getSalesmen: () => request('/salesmen').then(r => r.json()),

  addSalesman: (name: string) =>
    request('/salesmen', { method: 'POST', body: JSON.stringify({ name }) }).then(r => r.json()),

  deleteSalesman: (id: number) =>
    request(`/salesmen/${id}`, { method: 'DELETE' }),
};
