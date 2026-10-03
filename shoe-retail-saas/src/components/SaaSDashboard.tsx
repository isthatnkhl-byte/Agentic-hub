import React, { useState } from 'react';
import { 
  Shoe, 
  SaaSMetric 
} from '../types';
import { 
  SAAS_METRICS, 
  SAAS_REVENUE_CHART_DATA, 
  WAREHOUSE_INVENTORY, 
  RETURN_REASONS_BREAKDOWN 
} from '../data/mockData';
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  ShieldCheck, 
  Repeat, 
  Box, 
  Warehouse, 
  AlertTriangle, 
  Layers, 
  CheckCircle2, 
  Sliders, 
  RefreshCw,
  Plus,
  ArrowUpRight,
  TrendingDown
} from 'lucide-react';
import { formatCurrency, formatNumber } from '../utils/helpers';

interface SaaSDashboardProps {
  shoes: Shoe[];
  onUpdateShoePrice: (shoeId: string, newPrice: number) => void;
  onLaunchCustomizer: (shoe: Shoe) => void;
}

export const SaaSDashboard: React.FC<SaaSDashboardProps> = ({
  shoes,
  onUpdateShoePrice,
  onLaunchCustomizer,
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<'7D' | '30D' | '90D' | '1Y'>('30D');
  const [editingShoeId, setEditingShoeId] = useState<string | null>(null);
  const [tempPrice, setTempPrice] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'sizing-ai' | 'skus'>('overview');

  const chartData = SAAS_REVENUE_CHART_DATA[chartTimeframe];
  const maxRevenue = Math.max(...chartData.map((d) => d.revenue));

  const handleStartEdit = (shoe: Shoe) => {
    setEditingShoeId(shoe.id);
    setTempPrice(shoe.price);
  };

  const handleSavePrice = (shoeId: string) => {
    onUpdateShoePrice(shoeId, tempPrice);
    setEditingShoeId(null);
  };

  return (
    <div className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 animate-fadeIn">
      
      {/* Brand SaaS Command Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-blue-400 uppercase tracking-wider mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Retail OS & Omni-Channel Command Center</span>
          </div>
          <h2 className="font-display text-3xl font-extrabold text-white tracking-tight">
            Footwear Brand Operations Suite
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time telemetry, 3D configurator conversion, AI sizing vision reduction, and inventory routing.
          </p>
        </div>

        {/* Dashboard Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-950 border border-slate-800">
          {[
            { id: 'overview', label: 'Executive KPIs', icon: BarChart3 },
            { id: 'inventory', label: 'Warehouse & Sizes', icon: Warehouse },
            { id: 'sizing-ai', label: 'Fit AI Analytics', icon: ShieldCheck },
            { id: 'skus', label: 'SKU & Margins', icon: Box },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {SAAS_METRICS.map((metric) => (
          <div
            key={metric.title}
            className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-xl relative overflow-hidden group hover:border-slate-700 transition-all shadow-xl"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-medium text-slate-300">{metric.title}</span>
              <span className={`flex items-center text-[11px] font-bold font-mono px-2 py-0.5 rounded-full ${
                metric.isPositive 
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
              }`}>
                {metric.change}
              </span>
            </div>

            <div className="font-display font-black text-3xl text-white tracking-tight">
              {metric.value}
            </div>

            <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
              <span>{metric.timeframe}</span>
              <span className="text-[10px] text-blue-400 font-mono">Live Sync</span>
            </div>

            {/* Subdued background accent glow */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
          </div>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & REVENUE CHARTS */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Dynamic SVG Revenue Chart */}
          <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-display font-bold text-lg text-white">
                  Footwear Gross Merchandise Volume (GMV)
                </h3>
                <p className="text-xs text-slate-400">
                  Consolidated revenue across 3D Customizer, direct drops, and wholesale partners
                </p>
              </div>

              {/* Timeframe Switcher */}
              <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 self-start">
                {(['7D', '30D', '90D', '1Y'] as const).map((tf) => (
                  <button
                    key={tf}
                    type="button"
                    onClick={() => setChartTimeframe(tf)}
                    className={`px-3 py-1.5 text-xs font-mono font-semibold rounded-lg transition-all ${
                      chartTimeframe === tf
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>

            {/* SVG Visual Bar/Area Chart */}
            <div className="h-64 flex items-end gap-3 pt-6 pb-2 px-2 border-b border-slate-800">
              {chartData.map((item, idx) => {
                const heightPct = Math.max(15, Math.round((item.revenue / maxRevenue) * 100));
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 z-20 px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-700 text-[10px] text-white whitespace-nowrap shadow-xl pointer-events-none">
                      <div className="font-bold text-cyan-400">{formatCurrency(item.revenue)}</div>
                      <div className="text-slate-400">{item.units} pairs sold</div>
                    </div>

                    {/* Bar */}
                    <div 
                      className="w-full rounded-t-xl bg-gradient-to-t from-blue-700/60 via-blue-500 to-cyan-400 group-hover:from-blue-600 group-hover:to-cyan-300 transition-all duration-300 shadow-lg shadow-blue-500/10 cursor-pointer"
                      style={{ height: `${heightPct}%` }}
                    />

                    {/* X-axis Label */}
                    <span className="text-[11px] font-mono text-slate-400 group-hover:text-white">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick Metrics Footer */}
            <div className="grid grid-cols-3 gap-4 text-center pt-2">
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Period Revenue</span>
                <span className="font-display font-bold text-base text-white">
                  {formatCurrency(chartData.reduce((acc, d) => acc + d.revenue, 0))}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Total Units Shipped</span>
                <span className="font-display font-bold text-base text-white">
                  {formatNumber(chartData.reduce((acc, d) => acc + d.units, 0))} pairs
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 block uppercase font-mono">Avg Retail Margin</span>
                <span className="font-display font-bold text-base text-emerald-400">
                  63.8%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Sizing Return Reduction ROI */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>AI Sizing Impact</span>
              </div>
              <h3 className="font-display font-bold text-lg text-white">
                Logistics Capital Saved
              </h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                By deploying computer vision 3D foot scanning, STRIDE eliminated the typical 22% footwear return rate down to an ultra-low 2.4%.
              </p>
            </div>

            {/* Big Stat Box */}
            <div className="p-5 rounded-2xl bg-gradient-to-tr from-emerald-950/40 via-slate-950 to-slate-950 border border-emerald-500/30 text-center space-y-1">
              <span className="text-xs text-slate-400 uppercase font-mono">Net Reverse Logistics Savings</span>
              <div className="font-display font-black text-3xl sm:text-4xl text-emerald-400">
                $184,200
              </div>
              <span className="text-[11px] text-slate-300 block">
                Saved across 4,920 orders this fiscal quarter
              </span>
            </div>

            {/* Return Reasons Breakdown */}
            <div className="space-y-2.5">
              <span className="text-xs font-semibold text-slate-300 block">Top Return Reasons YoY</span>
              {RETURN_REASONS_BREAKDOWN.slice(0, 3).map((item) => (
                <div key={item.reason} className="text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span className="truncate pr-2">{item.reason}</span>
                    <span className="font-mono text-emerald-400">{item.delta}</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
              <span>Model Confidence Index</span>
              <span className="font-mono text-emerald-400 font-bold">99.2% Validated</span>
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: WAREHOUSE & INVENTORY SIZES */}
      {activeTab === 'inventory' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Warehouses Table */}
          <div className="lg:col-span-7 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Global Fulfillment Hubs</h3>
                <p className="text-xs text-slate-400">Real-time inventory levels across automated fulfillment centers</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20">
                4 Hubs Synced
              </span>
            </div>

            <div className="space-y-3">
              {WAREHOUSE_INVENTORY.map((hub) => (
                <div key={hub.location} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-white">{hub.location}</span>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      hub.status === 'Optimal'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {hub.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                    <div>
                      <span className="block text-[10px] text-slate-500">In Stock</span>
                      <span className="font-mono text-white font-bold">{formatNumber(hub.inStock)} pairs</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Reserved for Drops</span>
                      <span className="font-mono text-slate-300">{formatNumber(hub.reserved)} pairs</span>
                    </div>
                    <div>
                      <span className="block text-[10px] text-slate-500">Capacity</span>
                      <span className="font-mono text-cyan-400">{hub.capacityPct}%</span>
                    </div>
                  </div>

                  {/* Progress Meter */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${hub.capacityPct > 85 ? 'bg-amber-400' : 'bg-blue-500'}`}
                      style={{ width: `${hub.capacityPct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Size Curve Distribution */}
          <div className="lg:col-span-5 p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-5">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Size Demand Bell Curve</h3>
              <p className="text-xs text-slate-400">AI prediction curve prevents overstocking edge sizes</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="text-xs text-slate-300 font-semibold mb-2">
                Inventory Run for AeroPulse X1 (US Sizes):
              </div>
              
              <div className="grid grid-cols-6 gap-2 text-center">
                {Object.entries(shoes[0].stockPerSize).map(([size, count]) => {
                  const isLow = count <= 6;
                  return (
                    <div 
                      key={size}
                      className={`p-2 rounded-xl border text-xs ${
                        isLow
                          ? 'bg-rose-950/30 border-rose-500/40 text-rose-300'
                          : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                    >
                      <span className="block font-bold text-white font-mono">US {size}</span>
                      <span className={`text-[10px] font-mono ${isLow ? 'text-rose-400 font-bold' : 'text-slate-400'}`}>
                        {count} left
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Auto-Reorder trigger recommended for US 10.5 & 13 to avoid stockouts.</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* TAB 3: FIT AI VISION ANALYTICS */}
      {activeTab === 'sizing-ai' && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-white">
                SmartFit™ Vision Model Telemetry
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Neural network regression trained on 45,000 3D foot volumetric scans
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-emerald-400">Zero-Shot Inference Ready</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">Scans Conducted (30 Days)</div>
              <div className="font-display font-black text-2xl text-white">38,410</div>
              <div className="text-[11px] text-emerald-400 font-mono">+42% user engagement</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">First-Time Fit Accuracy</div>
              <div className="font-display font-black text-2xl text-cyan-400">97.6%</div>
              <div className="text-[11px] text-slate-400 font-mono">0.4mm mean deviation</div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400">Exchange Reduction Savings</div>
              <div className="font-display font-black text-2xl text-emerald-400">$214,000</div>
              <div className="text-[11px] text-slate-400 font-mono">Net operational gain</div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SKU CATALOG & PRICING MANAGER */}
      {activeTab === 'skus' && (
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-display font-bold text-lg text-white">Active Shoe SKUs & Margin Manager</h3>
              <p className="text-xs text-slate-400">Adjust MSRP prices in real-time, inspect gross profit margins, and test 3D models</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                  <th className="pb-3">Model Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">Retail Price</th>
                  <th className="pb-3">Gross Margin</th>
                  <th className="pb-3">Lifetime Sold</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {shoes.map((shoe) => (
                  <tr key={shoe.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-4">
                      <div className="font-bold text-white text-xs">{shoe.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{shoe.badge || 'Standard SKU'}</div>
                    </td>
                    <td className="py-4 font-mono text-blue-400">{shoe.category}</td>
                    <td className="py-4">
                      {editingShoeId === shoe.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={tempPrice}
                            onChange={(e) => setTempPrice(Number(e.target.value))}
                            className="w-20 px-2 py-1 bg-slate-950 border border-blue-500 rounded text-xs text-white font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => handleSavePrice(shoe.id)}
                            className="p-1 rounded bg-blue-600 text-white"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-white">{formatCurrency(shoe.price)}</span>
                          <button
                            type="button"
                            onClick={() => handleStartEdit(shoe)}
                            className="text-slate-500 hover:text-blue-400 text-[10px]"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="py-4 font-mono text-emerald-400 font-bold">{shoe.margin}% Margin</td>
                    <td className="py-4 font-mono text-slate-300">{formatNumber(shoe.totalSold)} pairs</td>
                    <td className="py-4">
                      <button
                        type="button"
                        onClick={() => onLaunchCustomizer(shoe)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 text-[11px] font-medium transition-colors"
                      >
                        <Layers className="w-3 h-3" />
                        <span>Open 3D</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
