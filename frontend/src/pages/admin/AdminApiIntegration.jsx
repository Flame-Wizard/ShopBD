import React, { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle, ExternalLink, Globe, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const ANALYTICS_API_KEY = import.meta.env.VITE_ANALYTICS_API_KEY || 'shopbd_analytics_api_key_bizanolytics_2024';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const SALES_ENDPOINT = `${BASE_URL}/api/analytics/sales`;
const BIZANOLYTICS_URL = 'https://bizanolytics.vercel.app/integrations/ecommerce';

export default function AdminApiIntegration() {
  const [showKey, setShowKey] = useState(false);
  const [copiedField, setCopiedField] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const copy = (value, field) => {
    navigator.clipboard.writeText(value);
    setCopiedField(field);
    toast.success('Copied!');
    setTimeout(() => setCopiedField(''), 2000);
  };

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(SALES_ENDPOINT, {
        headers: { Authorization: `Bearer ${ANALYTICS_API_KEY}` },
      });
      const data = await res.json();
      setTestResult(data.success ? 'ok' : 'error');
      if (data.success) toast.success(`✅ Working! ${data.count} sales rows ready.`);
      else toast.error('API responded but returned an error.');
    } catch {
      setTestResult('error');
      toast.error('Could not reach the API. Is your backend running?');
    }
    setTesting(false);
  };

  const CopyBtn = ({ value, field }) => (
    <button
      onClick={() => copy(value, field)}
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
      style={{ background: copiedField === field ? 'rgba(16,185,129,0.15)' : 'rgba(100,116,139,0.2)', color: copiedField === field ? '#34d399' : '#94a3b8' }}
    >
      {copiedField === field ? <CheckCircle size={12} /> : <Copy size={12} />}
      {copiedField === field ? 'Copied!' : 'Copy'}
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bizanolytics Integration</h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect ShopBD to Bizanolytics using <strong className="text-slate-200">"Your Website"</strong> tab — paste the two values below.
        </p>
      </div>

      {/* Visual Guide Card */}
      <div className="admin-card space-y-5">

        {/* Step indicator */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
            <Globe size={20} className="text-sky-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">In Bizanolytics → Integrations → <span className="text-sky-400">Your Website</span></p>
            <p className="text-xs text-slate-500">Fill in the two fields below, then click "Connect &amp; Import"</p>
          </div>
          <a
            href={BIZANOLYTICS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-lg transition-all"
          >
            Open <ExternalLink size={11} />
          </a>
        </div>

        <hr className="border-slate-700/50" />

        {/* Field 1: API Endpoint URL */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Field 1 — API Endpoint URL
            </label>
            <CopyBtn value={SALES_ENDPOINT} field="url" />
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50">
            <span className="text-xs text-slate-500 font-mono">🔗</span>
            <code className="flex-1 text-sm font-mono text-sky-300 break-all">{SALES_ENDPOINT}</code>
          </div>
          <p className="text-xs text-slate-500 pl-1">Paste this into the <span className="text-slate-300">"API Endpoint URL"</span> field in Bizanolytics.</p>
        </div>

        {/* Field 2: Bearer Token */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Field 2 — Bearer Token
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showKey ? <EyeOff size={12} /> : <Eye size={12} />}
                {showKey ? 'Hide' : 'Show'}
              </button>
              <CopyBtn value={ANALYTICS_API_KEY} field="key" />
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/50">
            <span className="text-xs text-slate-500">🔑</span>
            <code className="flex-1 text-sm font-mono text-yellow-300 break-all">
              {showKey ? ANALYTICS_API_KEY : '•'.repeat(ANALYTICS_API_KEY.length)}
            </code>
          </div>
          <p className="text-xs text-slate-500 pl-1">Paste this into the <span className="text-slate-300">"Bearer Token"</span> field in Bizanolytics.</p>
        </div>

        {/* Test Button */}
        <button
          onClick={handleTest}
          disabled={testing}
          className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 border ${
            testResult === 'ok'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              : testResult === 'error'
              ? 'bg-red-500/10 border-red-500/30 text-red-400'
              : 'bg-slate-700/40 border-slate-600/50 text-slate-200 hover:bg-slate-700/70'
          }`}
        >
          {testing ? (
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : testResult === 'ok' ? (
            <CheckCircle size={16} />
          ) : null}
          {testing ? 'Testing connection...' : testResult === 'ok' ? 'Connection Verified! API is working ✓' : '🔌 Test Connection'}
        </button>
      </div>

      {/* Step-by-step guide */}
      <div className="admin-card space-y-4">
        <h3 className="font-bold text-slate-100 text-sm flex items-center gap-2">
          <ArrowRight size={15} className="text-sky-400" /> Step-by-step
        </h3>
        <ol className="space-y-3">
          {[
            { n: 1, text: <>Go to <a href={BIZANOLYTICS_URL} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">bizanolytics.vercel.app/integrations/ecommerce</a></> },
            { n: 2, text: 'Click the "Your Website" tab.' },
            { n: 3, text: <><strong className="text-slate-200">API Endpoint URL:</strong> paste the URL from Field 1 above.</> },
            { n: 4, text: <><strong className="text-slate-200">Bearer Token:</strong> paste the key from Field 2 above.</> },
            { n: 5, text: 'Click "Connect & Import" — Bizanolytics will pull all your sales data instantly.' },
          ].map(({ n, text }) => (
            <li key={n} className="flex items-start gap-3">
              <span className="w-6 h-6 rounded-full bg-sky-500/15 border border-sky-500/25 text-sky-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {n}
              </span>
              <p className="text-sm text-slate-400 leading-relaxed">{text}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Data columns */}
      <div className="px-4 py-3 rounded-xl bg-slate-800/40 border border-slate-700/30 space-y-2">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">📊 Data Bizanolytics will receive</p>
        <div className="flex flex-wrap gap-2">
          {['Date', 'Product_Name', 'Category', 'Location', 'Sales_Channel', 'Units_Sold', 'Revenue_BDT', 'Cost_Price', 'Current_Stock'].map(col => (
            <span key={col} className="text-xs font-mono px-2 py-1 rounded-lg bg-slate-700/50 text-slate-300 border border-slate-600/30">
              {col}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}
