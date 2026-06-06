import React, { useState } from 'react';
import { Eye, EyeOff, Copy, CheckCircle, ExternalLink, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const ANALYTICS_API_KEY = import.meta.env.VITE_ANALYTICS_API_KEY || 'shopbd_analytics_api_key_bizanolytics_2024';
const BASE_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
const SALES_ENDPOINT = `${BASE_URL}/api/analytics/sales`;
const BIZANOLYTICS_URL = 'https://bizanolytics.vercel.app/integrations/ecommerce';

export default function AdminApiIntegration() {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null); // null | 'ok' | 'error'

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(''), 2000);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(SALES_ENDPOINT, {
        headers: { 'x-api-key': ANALYTICS_API_KEY },
      });
      const data = await res.json();
      setTestResult(data.success ? 'ok' : 'error');
      if (data.success) toast.success('Connection successful! API is live.');
      else toast.error('API responded but returned an error.');
    } catch {
      setTestResult('error');
      toast.error('Could not reach the API. Is the backend running?');
    }
    setTesting(false);
  };

  const CopyButton = ({ value, label }) => (
    <button
      onClick={() => copyToClipboard(value, label)}
      className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white text-xs font-medium transition-all duration-150"
    >
      {copied === label ? <CheckCircle size={13} className="text-emerald-400" /> : <Copy size={13} />}
      {copied === label ? 'Copied!' : 'Copy'}
    </button>
  );

  return (
    <div className="space-y-6 max-w-2xl animate-fade-in">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Bizanolytics Integration</h1>
        <p className="text-slate-400 text-sm mt-1">
          Connect ShopBD to your Bizanolytics dashboard with a single API key.
        </p>
      </div>

      {/* Main Integration Card */}
      <div className="admin-card space-y-6">

        {/* Header */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500/20 to-emerald-500/20 border border-sky-500/20 flex items-center justify-center flex-shrink-0">
            <Zap size={22} className="text-sky-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-slate-100 text-lg">Your Integration Key</h2>
            <p className="text-xs text-slate-400">Paste this key into Bizanolytics to connect your store data</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Active
          </span>
        </div>

        {/* API Key Display */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">API Key</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowKey(!showKey)}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                {showKey ? <EyeOff size={13} /> : <Eye size={13} />}
                {showKey ? 'Hide' : 'Reveal'}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <code className="flex-1 text-sm font-mono text-yellow-300 bg-transparent overflow-hidden text-ellipsis whitespace-nowrap">
              {showKey ? ANALYTICS_API_KEY : '•'.repeat(ANALYTICS_API_KEY.length)}
            </code>
            <CopyButton value={ANALYTICS_API_KEY} label="apikey" />
          </div>

          <div className="pt-2 border-t border-slate-700/50 space-y-2">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <span className="text-xs text-slate-500">Data Endpoint</span>
              <div className="flex items-center gap-2 min-w-0">
                <code className="text-xs text-sky-400 font-mono truncate max-w-[260px]">{SALES_ENDPOINT}</code>
                <CopyButton value={SALES_ENDPOINT} label="endpoint" />
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500">Auth Header</span>
              <code className="text-xs text-slate-300 font-mono bg-slate-800 px-2 py-0.5 rounded">
                x-api-key: &lt;your-key&gt;
              </code>
            </div>
          </div>
        </div>

        {/* Test + Open Bizanolytics */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-150 border ${
              testResult === 'ok'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : testResult === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-slate-700/50 border-slate-600 text-slate-200 hover:bg-slate-700'
            }`}
          >
            {testing ? (
              <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : testResult === 'ok' ? (
              <CheckCircle size={16} />
            ) : (
              <ShieldCheck size={16} />
            )}
            {testing ? 'Testing...' : testResult === 'ok' ? 'Connection Verified!' : 'Test Connection'}
          </button>

          <a
            href={BIZANOLYTICS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 flex-1 py-2.5 px-4 rounded-xl font-medium text-sm bg-sky-500 hover:bg-sky-400 text-white transition-all duration-150"
          >
            Open Bizanolytics
            <ExternalLink size={15} />
          </a>
        </div>
      </div>

      {/* How to Connect Steps */}
      <div className="admin-card space-y-4">
        <h3 className="font-bold text-slate-100 flex items-center gap-2">
          <ArrowRight size={16} className="text-sky-400" />
          How to Connect
        </h3>
        <ol className="space-y-4">
          {[
            {
              step: '1',
              title: 'Open Bizanolytics',
              desc: <>Go to <a href={BIZANOLYTICS_URL} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline font-medium">bizanolytics.vercel.app/integrations/ecommerce</a></>,
            },
            {
              step: '2',
              title: 'Select ShopBD / Custom API',
              desc: 'Choose the E-commerce integration option and select "Custom API" or "ShopBD".',
            },
            {
              step: '3',
              title: 'Paste your API Key',
              desc: 'Copy the API key shown above and paste it into the API Key field in Bizanolytics.',
            },
            {
              step: '4',
              title: 'Connect & Sync',
              desc: 'Click Connect. Bizanolytics will automatically pull your sales, inventory and revenue data.',
            },
          ].map(({ step, title, desc }) => (
            <li key={step} className="flex items-start gap-4">
              <span className="w-7 h-7 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {step}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-200">{title}</p>
                <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Data Columns Info */}
      <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-700/20 space-y-2">
        <p className="text-xs font-semibold text-blue-300 uppercase tracking-wider">📊 Data Columns Provided</p>
        <div className="flex flex-wrap gap-2">
          {['Date', 'Product_Name', 'Category', 'Location', 'Sales_Channel', 'Units_Sold', 'Revenue_BDT', 'Cost_Price', 'Current_Stock'].map(col => (
            <span key={col} className="text-xs font-mono px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-300 border border-blue-700/30">
              {col}
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-500 pt-1">All required columns for Bizanolytics are included in the API response.</p>
      </div>

    </div>
  );
}
