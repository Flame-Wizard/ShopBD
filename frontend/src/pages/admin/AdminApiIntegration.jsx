import React, { useState } from 'react';
import { Plug, Eye, EyeOff, CheckCircle, XCircle, Copy, ExternalLink, Download } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const ANALYTICS_API_KEY = import.meta.env.VITE_ANALYTICS_API_KEY || 'shopbd_analytics_api_key_bizanolytics_2024';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const BIZANOLYTICS_ENDPOINTS = [
  { name: 'Sales Data (Main)', endpoint: '/api/analytics/sales', desc: 'All sales rows: Date, Product_Name, Category, Location, Sales_Channel, Units_Sold, Revenue_BDT, Cost_Price, Current_Stock' },
  { name: 'Overview / KPIs', endpoint: '/api/analytics/overview', desc: 'Total revenue, orders, customers, pending orders' },
  { name: 'Revenue Trend', endpoint: '/api/analytics/revenue-trend?period=daily&days=30', desc: 'Daily/weekly/monthly revenue data' },
  { name: 'Top Products', endpoint: '/api/analytics/top-products?limit=10', desc: 'Best-selling products with revenue' },
  { name: 'Sales by Category', endpoint: '/api/analytics/by-category', desc: 'Revenue grouped by product category' },
  { name: 'Sales by Location', endpoint: '/api/analytics/by-location', desc: 'Revenue grouped by Bangladesh district/city' },
  { name: 'Sales by Channel', endpoint: '/api/analytics/by-channel', desc: 'Revenue by Online Store, Daraz, Facebook Shop, etc.' },
  { name: 'Inventory Status', endpoint: '/api/analytics/inventory', desc: 'Product stock levels and cost prices' },
];

export default function AdminApiIntegration() {
  const [showKey, setShowKey] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [importToken, setImportToken] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [importing, setImporting] = useState(false);
  const [preview, setPreview] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testStatus, setTestStatus] = useState({});

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const testEndpoint = async (endpoint) => {
    setTestStatus(s => ({ ...s, [endpoint]: 'testing' }));
    try {
      const url = `${BASE_URL}${endpoint}`;
      const res = await fetch(url, { headers: { 'x-api-key': ANALYTICS_API_KEY } });
      const data = await res.json();
      setTestStatus(s => ({ ...s, [endpoint]: data.success ? 'ok' : 'error' }));
    } catch {
      setTestStatus(s => ({ ...s, [endpoint]: 'error' }));
    }
  };

  const handlePreview = async () => {
    if (!importUrl) { toast.error('Enter API URL'); return; }
    setImporting(true);
    try {
      const { data } = await api.post('/products/import', { apiUrl: importUrl, bearerToken: importToken, save: false });
      setPreview(data.preview || []);
      setPreviewOpen(true);
      toast.success(`Fetched ${data.preview?.length} products`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch');
    }
    setImporting(false);
  };

  const handleImport = async () => {
    setSaving(true);
    try {
      const { data } = await api.post('/products/import', { apiUrl: importUrl, bearerToken: importToken, save: true });
      toast.success(data.message);
      setPreviewOpen(false);
      setPreview([]);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Import failed');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-white">API Integration</h1>
        <p className="text-slate-400 text-sm">Connect your Bizanolytics dashboard or import products from external APIs.</p>
      </div>

      {/* Bizanolytics Connection */}
      <div className="admin-card space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Plug size={20} className="text-emerald-400" />
          </div>
          <div>
            <h2 className="font-bold text-slate-100">🔗 Bizanolytics Integration</h2>
            <p className="text-xs text-slate-400">Connect your Bizanolytics website to ShopBD's analytics API</p>
          </div>
          <span className="badge-green ml-auto text-xs">Ready</span>
        </div>

        {/* Connection Details */}
        <div className="p-4 bg-slate-700/50 rounded-xl space-y-3 text-sm">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-slate-400">Base URL:</span>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <code className="text-sky-400 bg-slate-900 px-3 py-1 rounded-lg font-mono text-xs">{BASE_URL}/api/analytics</code>
              <button onClick={() => copyToClipboard(`${BASE_URL}/api/analytics`)} className="btn-icon text-slate-400 hover:text-sky-400"><Copy size={14} /></button>
            </div>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-slate-400">Auth Header:</span>
            <code className="text-emerald-400 bg-slate-900 px-3 py-1 rounded-lg font-mono text-xs">x-api-key: YOUR_KEY</code>
          </div>
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <span className="text-slate-400">API Key:</span>
            <div className="flex items-center gap-2 flex-1 justify-end">
              <code className="text-yellow-400 bg-slate-900 px-3 py-1 rounded-lg font-mono text-xs">
                {showKey ? ANALYTICS_API_KEY : '•'.repeat(20)}
              </code>
              <button onClick={() => setShowKey(!showKey)} className="btn-icon text-slate-400">
                {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
              <button onClick={() => copyToClipboard(ANALYTICS_API_KEY)} className="btn-icon text-slate-400 hover:text-sky-400"><Copy size={14} /></button>
            </div>
          </div>
        </div>

        {/* Required Columns */}
        <div className="p-4 bg-blue-900/20 rounded-xl border border-blue-700/30">
          <p className="text-sm font-medium text-blue-300 mb-2">📊 Required Columns (available in /api/analytics/sales):</p>
          <div className="flex flex-wrap gap-2">
            {['Date', 'Product_Name', 'Category', 'Location', 'Sales_Channel', 'Units_Sold', 'Revenue_BDT', 'Cost_Price', 'Current_Stock'].map(col => (
              <span key={col} className="badge-blue text-xs px-2 py-1">{col}</span>
            ))}
          </div>
        </div>

        {/* Endpoints */}
        <div>
          <h3 className="font-semibold text-slate-200 mb-3">Available Endpoints</h3>
          <div className="space-y-2">
            {BIZANOLYTICS_ENDPOINTS.map(({ name, endpoint, desc }) => (
              <div key={endpoint} className="flex items-start gap-3 p-3 bg-slate-700/50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200">{name}</p>
                  <code className="text-xs text-sky-400 font-mono">{endpoint}</code>
                  <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button onClick={() => copyToClipboard(`${BASE_URL}${endpoint}`)} className="btn-icon text-slate-400 hover:text-sky-400"><Copy size={13} /></button>
                  <button
                    onClick={() => testEndpoint(endpoint)}
                    className="btn-sm btn-secondary text-xs py-1 px-2"
                  >
                    {testStatus[endpoint] === 'testing' ? '...' : 'Test'}
                  </button>
                  {testStatus[endpoint] === 'ok' && <CheckCircle size={14} className="text-emerald-400" />}
                  {testStatus[endpoint] === 'error' && <XCircle size={14} className="text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Connect Guide */}
        <div className="p-4 bg-slate-700/30 rounded-xl">
          <h3 className="font-semibold text-slate-200 mb-3">Quick Connect Guide for Bizanolytics</h3>
          <div className="space-y-2 text-sm text-slate-300">
            <p>1. In Bizanolytics, go to <strong>Data Sources → Add New</strong></p>
            <p>2. Select <strong>REST API</strong> as the data source type</p>
            <p>3. Enter Base URL: <code className="text-sky-400 bg-slate-900 px-1 rounded">{BASE_URL}/api/analytics/sales</code></p>
            <p>4. Add Header: <code className="text-emerald-400 bg-slate-900 px-1 rounded">x-api-key: {showKey ? ANALYTICS_API_KEY : '****'}</code></p>
            <p>5. Map fields: <code className="text-yellow-400 bg-slate-900 px-1 rounded">data</code> array contains your required columns</p>
          </div>
        </div>
      </div>

      {/* Import Products from External API */}
      <div className="admin-card space-y-4">
        <h2 className="font-bold text-slate-100">📥 Import Products from External API</h2>
        <p className="text-slate-400 text-sm">Fetch products from WooCommerce, Shopify, or any REST API and import them into ShopBD.</p>

        <div className="grid gap-4">
          <div>
            <label className="label">API Endpoint URL</label>
            <input
              value={importUrl}
              onChange={e => setImportUrl(e.target.value)}
              className="input"
              placeholder="https://your-site.com/wp-json/wc/v3/products"
            />
          </div>
          <div>
            <label className="label">Bearer Token (optional)</label>
            <div className="relative">
              <input
                value={importToken}
                onChange={e => setImportToken(e.target.value)}
                type={showToken ? 'text' : 'password'}
                className="input pr-12"
                placeholder="your-api-token (leave empty if not required)"
              />
              <button onClick={() => setShowToken(!showToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200">
                {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button onClick={handlePreview} disabled={importing} className="btn-primary flex items-center gap-2 w-fit">
            {importing ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <ExternalLink size={16} />}
            {importing ? 'Fetching...' : 'Connect & Preview'}
          </button>
        </div>

        {/* Preview Table */}
        {previewOpen && preview.length > 0 && (
          <div className="animate-slide-down">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-slate-200">Preview ({preview.length} products)</h3>
              <button onClick={handleImport} disabled={saving} className="btn-success flex items-center gap-2">
                <Download size={16} /> {saving ? 'Importing...' : `Import All (${preview.length})`}
              </button>
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-700">
              <table className="w-full text-sm">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th className="admin-th">Image</th>
                    <th className="admin-th">Name</th>
                    <th className="admin-th">Price</th>
                    <th className="admin-th hidden sm:table-cell">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {preview.slice(0, 10).map((p, i) => (
                    <tr key={i} className="admin-table-row">
                      <td className="admin-td">
                        {p.images?.[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                      </td>
                      <td className="admin-td font-medium text-slate-200">{p.name}</td>
                      <td className="admin-td text-emerald-400 font-bold">৳{p.price?.toLocaleString()}</td>
                      <td className="admin-td hidden sm:table-cell">{p.stock}</td>
                    </tr>
                  ))}
                  {preview.length > 10 && <tr><td colSpan={4} className="admin-td text-center text-slate-400">...and {preview.length - 10} more</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
