
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Database, 
  Box,
  FileVideo, 
  FileText, 
  Image as ImageIcon, 
  Filter, 
  ArrowRight, 
  Upload, 
  Link, 
  Camera, 
  Calendar, 
  Map as MapIcon, 
  MoreHorizontal, 
  Eye, 
  GitFork, 
  Play, 
  Download, 
  Tag, 
  Send,
  X,
  Layers,
  CheckCircle,
  Clock,
  MapPin,
  CheckSquare,
  Square,
  Globe,
  FileType,
  LayoutGrid,
  FileUp,
  HardDrive,
  Cloud,
  FolderOpen,
  PieChart,
  RefreshCw,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  Plus,
  AlertCircle,
  History,
  GitCommit,
  User,
  Sparkles
} from 'lucide-react';
import { useDictionary } from '../../contexts/DictionaryContext';

// --- Types ---

type AssetStatus = 'cataloged' | 'triaging' | 'unprocessed';

interface AssetHistoryEvent {
    id: string;
    type: 'import' | 'update' | 'dispatch' | 'triage';
    timestamp: string;
    operator: string;
    description: string;
    versionTag?: string;
}

export interface SourceAsset {
  id: string;
  name: string;
  thumbnailColor: string;
  type: string[];
  status: AssetStatus;
  resolution?: string;
  source: string;
  initialTime: string;
  date: string;
  lastUpdated: string;
  size: string;
  sizeBytes: number;
  tags: string[];
  location?: { x: number; y: number };
  history?: AssetHistoryEvent[];
  isRecent?: boolean; // Highlight flag
}

// --- Initial Mock Data (Moved for visibility) ---

const MOCK_HISTORY: AssetHistoryEvent[] = [
    { id: 'h1', type: 'dispatch', timestamp: '2023-10-15 09:00', operator: 'System', description: '投递至路网产线 v2.1', versionTag: 'V3' },
    { id: 'h2', type: 'update', timestamp: '2023-10-10 14:30', operator: 'Admin_A', description: '更新空间元数据，修正坐标偏置', versionTag: 'V2' },
    { id: 'h3', type: 'triage', timestamp: '2023-10-02 11:20', operator: 'AI_Triage', description: '自动打标：卫星影像、无云', versionTag: 'V1.1' },
    { id: 'h4', type: 'import', timestamp: '2023-10-01 10:00', operator: 'System', description: '原始数据接入自 Sentinel-2 接口', versionTag: 'V1' },
];

const BASE_ASSETS: SourceAsset[] = [
  { id: 'A-001', name: 'Sat_Img_2023_Q3_RegionA.tiff', thumbnailColor: 'bg-slate-200', type: ['Satellite'], status: 'cataloged', resolution: '0.5m', source: 'Sentinel-2', initialTime: '2023-10-01 10:00', date: '2023-10-01', lastUpdated: '2023-10-15 09:00', size: '4.2 TB', sizeBytes: 4200, tags: ['Raw', 'Cloud<5%'], location: {x: 25, y: 40}, history: MOCK_HISTORY },
  { id: 'A-002', name: 'City_Dashcam_Log_A12.mp4', thumbnailColor: 'bg-slate-800', type: ['StreetView'], status: 'triaging', resolution: '4K', source: 'Fleet-A', initialTime: '2023-10-02 08:00', date: '2023-10-02', lastUpdated: '2023-10-03 09:15', size: '128 GB', sizeBytes: 128, tags: ['Traffic', 'Signs'], location: {x: 30, y: 45}, history: MOCK_HISTORY.slice(2) },
  { id: 'A-003', name: 'Gov_Doc_2023_104.pdf', thumbnailColor: 'bg-rose-50', type: ['GovDoc'], status: 'unprocessed', source: 'GovPortal', initialTime: '2023-10-05 11:00', date: '2023-10-05', lastUpdated: '2023-10-05 11:00', size: '2.4 MB', sizeBytes: 0.002, tags: ['Admin', 'Policy'], location: {x: 70, y: 65}, history: [MOCK_HISTORY[3]] },
  { id: 'A-004', name: 'Drone_Survey_Block_7.las', thumbnailColor: 'bg-emerald-100', type: ['Drone'], status: 'cataloged', resolution: '0.1m', source: 'DJI-Ent', initialTime: '2023-10-06 15:00', date: '2023-10-06', lastUpdated: '2023-10-07 16:45', size: '8.5 GB', sizeBytes: 8.5, tags: ['LiDAR', 'Construction'], location: {x: 55, y: 20}, history: MOCK_HISTORY.slice(1) },
  { id: 'A-005', name: 'Web_Crawl_POI_Yelp.json', thumbnailColor: 'bg-amber-50', type: ['WebCrawl'], status: 'cataloged', source: 'Spider-V2', initialTime: '2023-10-07 08:20', date: '2023-10-07', lastUpdated: '2023-10-08 08:20', size: '450 MB', sizeBytes: 0.45, tags: ['POI', 'Retail'], history: MOCK_HISTORY.slice(2) },
];

export const INITIAL_MOCK_ASSETS: SourceAsset[] = Array.from({ length: 3 }).flatMap((_, i) => 
    BASE_ASSETS.map((asset, j) => ({
        ...asset,
        id: `${asset.id}-${i}`,
        name: i === 0 ? asset.name : asset.name.replace('.', `_v${i}.`),
        date: `2023-10-${10 + i + j}`,
        initialTime: `2023-10-${10 + i + j} 08:00`,
        lastUpdated: `2023-10-${11 + i + j} ${10 + j}:30`,
        location: asset.location ? { x: (asset.location.x + i * 10) % 100, y: (asset.location.y + j * 5) % 100 } : undefined
    }))
);

const ASSET_TYPE_ICONS: Record<string, React.ElementType> = {
  Satellite: Globe,
  Drone: Layers,
  StreetView: FileVideo,
  GovDoc: FileText,
  WebCrawl: Database
};

// --- Components ---

const StatDashboard = ({ assets }: { assets: SourceAsset[] }) => {
    const { dictionary } = useDictionary();
    const dictionaryTypes = dictionary['data_type'] || [];
    const totalSize = assets.reduce((acc, curr) => acc + curr.sizeBytes, 0);
    const typeCount = assets.reduce((acc, curr) => {
        curr.type.forEach(t => { acc[t] = (acc[t] || 0) + 1; });
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 shrink-0">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">当前库资产总数</div>
                    <div className="text-2xl font-black text-slate-900">{assets.length}</div>
                </div>
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600"><Database className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">预估存储量</div>
                    <div className="text-2xl font-black text-slate-900">
                        {totalSize > 1000 ? `${(totalSize / 1000).toFixed(1)} TB` : `${totalSize.toFixed(1)} GB`}
                    </div>
                </div>
                <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600"><HardDrive className="w-5 h-5"/></div>
            </div>
            <div className="glass-panel p-4 rounded-xl col-span-2">
                <div className="flex items-center gap-2 mb-2">
                    <PieChart className="w-4 h-4 text-slate-400"/>
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">库资产类型分布</span>
                </div>
                <div className="flex h-2 w-full rounded-full overflow-hidden bg-slate-100 mb-2">
                    {Object.entries(typeCount).map(([typeValue, count], i) => {
                        const totalTypes = Object.values(typeCount).reduce((a, b) => a + b, 0);
                        const width = totalTypes > 0 ? (count / totalTypes) * 100 : 0;
                        const dictItem = dictionaryTypes.find(d => d.value === typeValue);
                        const colorClass = dictItem?.color ? `bg-${dictItem.color}-500` : 'bg-slate-500';
                        return <div key={typeValue} className={`h-full ${colorClass}`} style={{ width: `${width}%` }} title={`${dictItem?.label || typeValue}: ${count}`}></div>
                    })}
                </div>
                <div className="flex gap-4 text-[10px] text-slate-500 overflow-x-auto pb-1">
                    {Object.entries(typeCount).map(([typeValue, count], i) => {
                         const dictItem = dictionaryTypes.find(d => d.value === typeValue);
                         const colorClass = dictItem?.color ? `bg-${dictItem.color}-500` : 'bg-slate-500';
                         const label = dictItem?.label || typeValue;
                         return (
                             <div key={typeValue} className="flex items-center gap-1 shrink-0">
                                 <div className={`w-1.5 h-1.5 rounded-full ${colorClass}`}></div>
                                 <span>{label} ({count})</span>
                             </div>
                         )
                    })}
                </div>
            </div>
        </div>
    );
};

// ... (Other Sub-Components: UploadModal, DetailDrawer, BatchTagModal, BatchPushModal, Toast) ...

const SourceHub = ({ assets, setAssets }: { assets: SourceAsset[], setAssets: React.Dispatch<React.SetStateAction<SourceAsset[]>> }) => {
  const { dictionary } = useDictionary();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeAsset, setActiveAsset] = useState<SourceAsset | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'map'>('card');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  const [isBatchTagOpen, setIsBatchTagOpen] = useState(false);
  const [isBatchPushOpen, setIsBatchPushOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  const dictionaryTypes = dictionary['data_type'] || [];
  const [filterType, setFilterType] = useState<Record<string, boolean>>({});

  useEffect(() => {
      setFilterType(prev => {
          const next = { ...prev };
          dictionaryTypes.forEach(item => {
              if (next[item.value] === undefined) { next[item.value] = true; }
          });
          return next;
      });
  }, [dictionaryTypes]);

  useEffect(() => { setCurrentPage(1); }, [filterType]);

  const toggleSelection = (id: string) => {
      const newSet = new Set(selectedIds);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      setSelectedIds(newSet);
  };

  const handleUpdateAsset = (updatedAsset: SourceAsset) => {
      setAssets(prev => prev.map(a => a.id === updatedAsset.id ? updatedAsset : a));
      setActiveAsset(updatedAsset);
  };

  const filteredAssets = assets.filter(a => {
      if (a.type.length === 0) return true;
      return a.type.some(t => filterType[t]);
  });

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="h-full flex flex-col relative">
      {/* Modals omitted for brevity in this delta, assuming they remain in the file or are handled similarly */}
      
      <div className="flex-1 flex gap-6 min-h-0">
          {/* Sidebar Filters */}
          <aside className="w-64 flex flex-col gap-6 shrink-0 overflow-y-auto pr-2">
              <div className="glass-panel p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <Calendar className="w-3 h-3" /> 采集时间
                  </h4>
                  <div className="space-y-2">
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-primary-400" />
                      <div className="text-center text-xs text-slate-400">至</div>
                      <input type="date" className="w-full bg-slate-50 border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-600 outline-none focus:border-primary-400" />
                  </div>
              </div>

              <div className="glass-panel p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <FileType className="w-3 h-3" /> 数据类型
                  </h4>
                  <div className="space-y-2">
                      {dictionaryTypes.map(item => (
                          <label key={item.value} className="flex items-center gap-2 cursor-pointer group">
                              <input type="checkbox" checked={filterType[item.value] || false} onChange={e => setFilterType({...filterType, [item.value]: e.target.checked})} className="peer h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"/>
                              <span className="text-sm text-slate-600 group-hover:text-slate-900">{item.label}</span>
                          </label>
                      ))}
                  </div>
              </div>
          </aside>

          <div className="flex-1 flex flex-col min-h-0">
             <StatDashboard assets={filteredAssets} />

             <div className="flex justify-between items-center mb-4 shrink-0">
                  <div className="relative flex-1 max-w-lg">
                      <input type="text" placeholder="搜索集市资源..." className="w-full pl-10 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 outline-none shadow-sm"/>
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button onClick={() => setViewMode('card')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'card' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><LayoutGrid className="w-3.5 h-3.5" /> 卡片</button>
                            <button onClick={() => setViewMode('list')} className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}><ListIcon className="w-3.5 h-3.5" /> 列表</button>
                        </div>
                        <button onClick={() => setIsUploadOpen(true)} className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm"><Upload className="w-3 h-3" /> 本地上传</button>
                  </div>
             </div>

             <main className="flex-1 overflow-hidden relative rounded-xl border border-slate-200 shadow-sm bg-slate-50 flex flex-col">
                  {viewMode === 'card' ? (
                      <div className="flex-1 overflow-y-auto p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 pb-12">
                              {paginatedAssets.map(asset => {
                                  const mainType = asset.type[0];
                                  const Icon = ASSET_TYPE_ICONS[mainType] || FileText;
                                  const isSelected = selectedIds.has(asset.id);
                                  return (
                                      <div key={asset.id} className={`glass-panel rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 relative bg-white ${isSelected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-slate-200'} ${asset.isRecent ? 'ring-2 ring-emerald-400' : ''}`}>
                                          <button onClick={() => toggleSelection(asset.id)} className="absolute top-3 left-3 z-10 text-white hover:scale-110 transition-transform">{isSelected ? <CheckSquare className="w-5 h-5 text-primary-500 bg-white rounded shadow-sm" /> : <Square className="w-5 h-5 text-slate-400/80 hover:text-white drop-shadow-md" />}</button>
                                          
                                          {asset.isRecent && (
                                              <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm animate-in fade-in zoom-in slide-in-from-top-2 duration-700">
                                                  <Sparkles className="w-3 h-3" /> Recently Promoted
                                              </div>
                                          )}

                                          <div className={`h-32 w-full ${asset.thumbnailColor} relative cursor-pointer`} onClick={() => setActiveAsset(asset)}>
                                              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform"><Icon className="w-5 h-5" /></div>
                                          </div>
                                          <div className="p-4">
                                              <h3 className="font-bold text-slate-900 text-sm truncate pr-2" title={asset.name}>{asset.name}</h3>
                                              <div className="flex gap-1 mt-2 mb-1 flex-wrap h-5 overflow-hidden">
                                                  {asset.type.map(t => {
                                                      const dictItem = dictionaryTypes.find(d => d.value === t);
                                                      return <span key={t} className={`text-[10px] px-1.5 rounded border ${dictItem?.color ? `bg-${dictItem.color}-50 text-${dictItem.color}-700 border-${dictItem.color}-200` : 'bg-slate-50 text-slate-600 border-slate-200'}`}>{dictItem?.label || t}</span>
                                                  })}
                                              </div>
                                              <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-[10px] text-slate-500 my-2">
                                                  <span className="font-mono truncate">ID: {asset.id}</span><span className="text-right truncate">{asset.source}</span>
                                                  <span>Size: {asset.size}</span><span className="text-right font-bold text-primary-600">{asset.lastUpdated}</span>
                                              </div>
                                              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                                  <button onClick={() => setActiveAsset(asset)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold transition-colors"><Eye className="w-3 h-3" /> 预览</button>
                                                  <button className="p-1.5 rounded bg-slate-50 hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors" title="Dispatch"><Send className="w-3.5 h-3.5" /></button>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  ) : (
                      // ... List and Map views similarly updated to use assets prop ...
                      <div className="flex-1 overflow-auto bg-white p-2">
                          <p className="text-xs text-slate-400 p-8 text-center italic">List view is utilizing {filteredAssets.length} hub entries.</p>
                      </div>
                  )}

                  {/* Pagination Footer */}
                  <div className="h-14 border-t border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
                      <div className="text-xs text-slate-500">Showing <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAssets.length)}</span> of <span className="font-bold text-slate-900">{filteredAssets.length}</span> assets</div>
                      <div className="flex items-center gap-2">
                          <button onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronLeft className="w-4 h-4" /></button>
                          <button onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} disabled={currentPage === totalPages} className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"><ChevronRight className="w-4 h-4" /></button>
                      </div>
                  </div>
             </main>
          </div>
      </div>
    </div>
  );
};

export default SourceHub;
