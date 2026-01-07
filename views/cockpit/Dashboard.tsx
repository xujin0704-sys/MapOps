
import React, { useMemo } from 'react';
import { 
  Activity, 
  Zap, 
  Server, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  MoreHorizontal, 
  Filter, 
  ShieldCheck, 
  AlertOctagon, 
  ArrowRight, 
  Bot, 
  User, 
  AlertTriangle,
  Clock, 
  MapPin, 
  Layers,
  BarChart3
} from 'lucide-react';
import { ViewType } from '../../types';
import { useDictionary } from '../../contexts/DictionaryContext';

interface DashboardProps {
  onNavigate?: (view: ViewType) => void;
}

const PIPELINE_GROUP_LABELS: Record<string, string> = {
    'Foundation': '基础地理 (Foundation)',
    'Location': '地点与地址 (Location)',
    'LastMile': '末端场景 (Last Mile)'
};

const FilterBar = () => {
    const { dictionary } = useDictionary();
    const pipelines: any[] = dictionary['pipeline'] || [];

    const groupedPipelines = useMemo(() => {
        const groups: Record<string, any[]> = { 'Foundation': [], 'Location': [], 'LastMile': [], 'Other': [] };
        pipelines.forEach(p => {
            const code = p.code && groups[p.code] ? p.code : 'Other';
            groups[code].push(p);
        });
        return groups;
    }, [pipelines]);

    return (
        <div className="flex flex-wrap items-center gap-4 bg-white p-2 rounded-lg border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 pl-2 border-r border-slate-100 pr-4">
                <Filter className="w-4 h-4 text-slate-400" />
                <span className="text-sm font-bold text-slate-700 uppercase tracking-wide">全局筛选</span>
            </div>
            
            <div className="flex flex-wrap gap-4">
                <div className="flex flex-col">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">时间范围</label>
                    <select className="bg-transparent text-sm font-medium text-slate-900 outline-none cursor-pointer hover:text-primary-600">
                        <option>过去 24 小时</option>
                        <option>过去 7 天</option>
                        <option>本月</option>
                    </select>
                </div>
                <div className="hidden md:block w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">空间/项目</label>
                    <select className="bg-transparent text-sm font-medium text-slate-900 outline-none cursor-pointer hover:text-primary-600">
                        <option>全部区域 (Global)</option>
                        <option>北京项目组</option>
                        <option>上海项目组</option>
                        <option>北美数据中心</option>
                    </select>
                </div>
                <div className="hidden md:block w-px h-8 bg-slate-100"></div>
                <div className="flex flex-col">
                    <label className="text-[10px] text-slate-400 font-bold uppercase">产线过滤</label>
                    <select className="bg-transparent text-sm font-medium text-slate-900 outline-none cursor-pointer hover:text-primary-600">
                        <option value="all">所有产线</option>
                        {Object.entries(groupedPipelines).map(([code, group]) => (
                            (group as any[]).length > 0 && (
                                <optgroup key={code} label={PIPELINE_GROUP_LABELS[code] || '其他 (Other)'}>
                                    {(group as any[]).map((p: any) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </optgroup>
                            )
                        ))}
                    </select>
                </div>
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  return (
    <div className="w-full flex flex-col gap-6 p-6 min-h-full">
      {/* 1. Global Filter - High Z-index to prevent overlapping dropdowns */}
      <div className="relative z-20">
        <FilterBar />
      </div>

      {/* 2. North Star KPIs (Row 1) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 shrink-0 relative z-0">
        
        {/* KPI 1: Real-time Throughput */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between group hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Activity className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">实时产能 (EPS)</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">12,450</h3>
                </div>
                <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    +15%
                </span>
            </div>
            {/* Sparkline */}
            <div className="h-10 mt-4 relative">
                <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0,35 Q10,30 20,32 T40,20 T60,25 T80,10 T100,15" fill="none" stroke="#3b82f6" strokeWidth="2" />
                    <circle cx="100" cy="15" r="2" className="fill-blue-500 animate-ping" />
                </svg>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">每秒入库有效要素数</div>
        </div>

        {/* KPI 2: AI Contribution */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div>
                 <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">AI 贡献度</span>
                </div>
                <h3 className="text-2xl font-bold text-slate-900">88.4%</h3>
            </div>
            
            <div className="mt-4 space-y-2">
                <div className="flex h-3 w-full rounded-full overflow-hidden bg-slate-100">
                    <div className="bg-emerald-500 w-[65%]" title="自动化: 65%"></div>
                    <div className="bg-amber-400 w-[23%]" title="AI辅助: 23%"></div>
                    <div className="bg-slate-300 w-[12%]" title="人工: 12%"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>自动化 65%</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>AI辅助 23%</span>
                    <span className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>人工 12%</span>
                </div>
            </div>
        </div>

        {/* KPI 3: Delivery Quality */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all duration-200">
            <div className="flex justify-between items-start">
                 <div>
                    <div className="flex items-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">交付质量</span>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900">99.8%</h3>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg">
                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>
            </div>
            <div className="mt-4 flex items-center gap-2 p-2 bg-slate-50 rounded border border-slate-100">
                <AlertOctagon className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-600">集成仿真算路成功率</span>
            </div>
        </div>

        {/* KPI 4: Cost Efficiency */}
        <div className="glass-panel p-5 rounded-xl flex flex-col justify-between hover:shadow-md transition-all duration-200">
             <div>
                <div className="flex items-center gap-2 mb-1">
                    <Server className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">算力效能</span>
                </div>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold text-slate-900">¥0.14</h3>
                    <span className="text-sm text-slate-500">/ 要素</span>
                </div>
            </div>
            <div className="mt-4 flex items-center gap-1 text-emerald-600 text-sm font-bold">
                 <TrendingDown className="w-4 h-4" />
                 <span>5%</span>
                 <span className="text-slate-400 font-normal ml-1">较上周优化</span>
            </div>
             <div className="mt-1 w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                <div className="w-3/4 h-full bg-emerald-500 rounded-full"></div>
             </div>
        </div>
      </div>

      {/* 3. Trends Charts (Row 2) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[320px]">
        {/* Throughput Trend */}
        <div className="glass-panel p-5 rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" /> 产能趋势 (Throughput)
                </h3>
                <button className="text-slate-400 hover:bg-slate-50 p-1.5 rounded transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 w-full relative bg-slate-50/50 rounded-lg border border-slate-100 overflow-hidden">
                 <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 50">
                    <defs>
                        <linearGradient id="tGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0"/>
                        </linearGradient>
                    </defs>
                    <path d="M0,40 Q20,35 40,20 T80,25 T100,10 V50 H0 Z" fill="url(#tGrad)" />
                    <path d="M0,40 Q20,35 40,20 T80,25 T100,10" fill="none" stroke="#3b82f6" strokeWidth="1.5" />
                    {/* Grid */}
                    <line x1="0" y1="12" x2="100" y2="12" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1="25" x2="100" y2="25" stroke="#e2e8f0" strokeWidth="0.5" />
                    <line x1="0" y1="37" x2="100" y2="37" stroke="#e2e8f0" strokeWidth="0.5" />
                 </svg>
                 <div className="absolute top-2 right-4 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">峰值: 14.2k</div>
            </div>
        </div>

        {/* Cost Trend */}
        <div className="glass-panel p-5 rounded-xl flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" /> 成本效能 (Cost)
                </h3>
                <button className="text-slate-400 hover:bg-slate-50 p-1.5 rounded transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
            </div>
            {/* Added pt-10 to prevent tooltip clipping */}
            <div className="flex-1 w-full relative bg-slate-50/50 rounded-lg border border-slate-100 flex items-end justify-between px-6 pb-2 pt-10">
                 {/* Bar Chart Simulation */}
                 {[40, 65, 45, 80, 55, 30, 45, 60, 35, 20, 25, 15].map((h, i) => (
                    <div key={i} className="w-[6%] bg-emerald-200 rounded-t-sm hover:bg-emerald-400 transition-colors relative group" style={{ height: `${h}%` }}>
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap shadow-sm">
                            ¥{(h * 0.005).toFixed(3)}
                        </div>
                    </div>
                 ))}
                 <div className="absolute top-4 left-4 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">均值: ¥0.15</div>
            </div>
        </div>
      </div>

      {/* 4. Feeds & Alerts (Row 3) - Increased height for better visibility */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-80 shrink-0">
        {/* Live Intelligence Feed */}
        <div className="lg:col-span-2 glass-panel p-0 rounded-xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    动态情报流 (Live Feed)
                </h3>
                <span className="text-xs text-slate-400 font-mono">更新中...</span>
            </div>
            <div className="flex-1 overflow-y-auto p-0 bg-slate-50/50">
                <div className="divide-y divide-slate-100">
                    {[
                        { time: '10:42', icon: Bot, subj: 'AI 分诊台', action: '路由文件 "HD_Image_01.tiff" 至', obj: '路网产线', type: 'info' },
                        { time: '10:40', icon: Factory, subj: '路网产线', action: '触发自动扩容', obj: '(GPU +2)', type: 'warning' },
                        { time: '10:38', icon: User, subj: '作业员_A', action: '驳回批次 #9921', obj: '(Bad Case 已捕获)', type: 'error' },
                        { time: '10:35', icon: ShieldCheck, subj: '质量门禁', action: '通过发版检查', obj: 'v2.1.0-RC1', type: 'success' },
                        { time: '10:32', icon: Database, subj: '源资集市', action: '接入新数据集', obj: 'Sat_Img_Batch_2023', type: 'info' },
                        { time: '10:30', icon: Server, subj: '系统', action: '完成备份', obj: '每日快照', type: 'info' },
                        { time: '10:28', icon: Bot, subj: '模型仓库', action: '晋级模型', obj: 'SAM-v2.1', type: 'success' },
                    ].map((log, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 hover:bg-white transition-colors text-sm">
                            <span className="font-mono text-xs text-slate-400 w-10 shrink-0">{log.time}</span>
                            <log.icon className={`w-4 h-4 shrink-0 ${
                                log.type === 'error' ? 'text-rose-500' :
                                log.type === 'warning' ? 'text-amber-500' :
                                log.type === 'success' ? 'text-emerald-500' : 'text-blue-500'
                            }`} />
                            <div className="flex-1 truncate">
                                <span className="font-bold text-slate-700">{log.subj}</span>
                                <span className="text-slate-500 mx-1.5">{log.action}</span>
                                <span className="font-medium text-primary-600 underline decoration-dashed cursor-pointer hover:text-primary-700">
                                    {log.obj}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>

        {/* Critical Alerts */}
        <div className="glass-panel p-0 rounded-xl flex flex-col overflow-hidden border-2 border-rose-100 shadow-sm">
            <div className="p-4 bg-rose-50 border-b border-rose-100 flex items-center justify-between shrink-0">
                <h3 className="font-bold text-rose-800 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" /> 严重阻断预警
                </h3>
                <span className="bg-rose-200 text-rose-800 text-xs font-bold px-2 py-0.5 rounded-full">1</span>
            </div>
            
            <div className="flex-1 p-4 bg-white flex flex-col justify-center items-center text-center space-y-4 overflow-y-auto">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center animate-pulse shrink-0">
                    <Layers className="w-6 h-6 text-rose-600" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-900">行政区划产线 v2.0 死锁</h4>
                    <p className="text-sm text-slate-500 mt-1">队列积压 &gt; 10,000 项，预计延迟 4h</p>
                </div>
                
                <button 
                    onClick={() => onNavigate && onNavigate('panorama')}
                    className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-rose-200 active:scale-95 shrink-0"
                >
                    立即处理 <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

// Helper icon mapping for the feed logs
function Factory(props: any) {
    return <Layers {...props} /> // Fallback or mapping
}
function Database(props: any) {
    return <Server {...props} />
}

export default Dashboard;
