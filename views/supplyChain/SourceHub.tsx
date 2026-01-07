import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Database, 
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
  List,
  ChevronLeft,
  ChevronRight,
  Edit2,
  Save,
  Plus,
  AlertCircle
} from 'lucide-react';
import { useDictionary } from '../../contexts/DictionaryContext';

// --- Types ---

type AssetStatus = 'cataloged' | 'triaging' | 'unprocessed';

interface SourceAsset {
  id: string;
  name: string;
  thumbnailColor: string; // Mock thumbnail
  type: string[]; // Support multiple types
  status: AssetStatus;
  resolution?: string;
  source: string;
  date: string;
  lastUpdated: string; // New field
  size: string;
  sizeBytes: number; // For stats
  tags: string[];
  location?: { x: number; y: number };
}

// --- Mock Data ---

const BASE_ASSETS: SourceAsset[] = [
  { id: 'A-001', name: 'Sat_Img_2023_Q3_RegionA.tiff', thumbnailColor: 'bg-slate-200', type: ['Satellite'], status: 'cataloged', resolution: '0.5m', source: 'Sentinel-2', date: '2023-10-01', lastUpdated: '2023-10-01 14:30', size: '4.2 TB', sizeBytes: 4200, tags: ['Raw', 'Cloud<5%'], location: {x: 25, y: 40} },
  { id: 'A-002', name: 'City_Dashcam_Log_A12.mp4', thumbnailColor: 'bg-slate-800', type: ['StreetView'], status: 'triaging', resolution: '4K', source: 'Fleet-A', date: '2023-10-02', lastUpdated: '2023-10-03 09:15', size: '128 GB', sizeBytes: 128, tags: ['Traffic', 'Signs'], location: {x: 30, y: 45} },
  { id: 'A-003', name: 'Gov_Doc_2023_104.pdf', thumbnailColor: 'bg-rose-50', type: ['GovDoc'], status: 'unprocessed', source: 'GovPortal', date: '2023-10-05', lastUpdated: '2023-10-05 11:00', size: '2.4 MB', sizeBytes: 0.002, tags: ['Admin', 'Policy'], location: {x: 70, y: 65} },
  { id: 'A-004', name: 'Drone_Survey_Block_7.las', thumbnailColor: 'bg-emerald-100', type: ['Drone'], status: 'cataloged', resolution: '0.1m', source: 'DJI-Ent', date: '2023-10-06', lastUpdated: '2023-10-07 16:45', size: '8.5 GB', sizeBytes: 8.5, tags: ['LiDAR', 'Construction'], location: {x: 55, y: 20} },
  { id: 'A-005', name: 'Web_Crawl_POI_Yelp.json', thumbnailColor: 'bg-amber-50', type: ['WebCrawl'], status: 'cataloged', source: 'Spider-V2', date: '2023-10-07', lastUpdated: '2023-10-08 08:20', size: '450 MB', sizeBytes: 0.45, tags: ['POI', 'Retail'] },
  { id: 'A-006', name: 'Sat_Img_2023_Q3_RegionB.tiff', thumbnailColor: 'bg-slate-200', type: ['Satellite'], status: 'unprocessed', resolution: '0.5m', source: 'Sentinel-2', date: '2023-10-08', lastUpdated: '2023-10-08 13:10', size: '3.8 TB', sizeBytes: 3800, tags: ['Raw'], location: {x: 80, y: 50} },
  { id: 'A-007', name: 'Street_View_Sector_9.mp4', thumbnailColor: 'bg-slate-700', type: ['StreetView'], status: 'cataloged', resolution: '4K', source: 'Fleet-B', date: '2023-10-09', lastUpdated: '2023-10-10 10:05', size: '64 GB', sizeBytes: 64, tags: ['Roads'], location: {x: 78, y: 55} },
  { id: 'A-008', name: 'Official_Plan_Amendment.pdf', thumbnailColor: 'bg-rose-50', type: ['GovDoc'], status: 'triaging', source: 'CityHall', date: '2023-10-10', lastUpdated: '2023-10-11 15:30', size: '5.1 MB', sizeBytes: 0.005, tags: ['Zoning'], location: {x: 72, y: 68} },
];

// Generate more data for pagination demo
const INITIAL_MOCK_ASSETS: SourceAsset[] = Array.from({ length: 3 }).flatMap((_, i) => 
    BASE_ASSETS.map((asset, j) => ({
        ...asset,
        id: `${asset.id}-${i}`,
        name: i === 0 ? asset.name : asset.name.replace('.', `_v${i}.`),
        date: `2023-10-${10 + i + j}`,
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
    
    // Count types (an asset can have multiple types)
    const typeCount = assets.reduce((acc, curr) => {
        curr.type.forEach(t => {
            acc[t] = (acc[t] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 shrink-0">
            <div className="glass-panel p-4 rounded-xl flex items-center justify-between">
                <div>
                    <div className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">当前视图总数</div>
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
                    <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">类型分布</span>
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

const UploadModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const [activeTab, setActiveTab] = useState<'file' | 'db' | 'ftp'>('file');
    const [syncPeriod, setSyncPeriod] = useState('hourly'); // Restored state

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-[600px] rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[80vh]">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-primary-600"/> 上传资料
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="flex border-b border-slate-100">
                    <button onClick={() => setActiveTab('file')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'file' ? 'border-primary-600 text-primary-700 bg-primary-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        <FileUp className="w-4 h-4" /> 本地文件
                    </button>
                    <button onClick={() => setActiveTab('db')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'db' ? 'border-primary-600 text-primary-700 bg-primary-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        <Database className="w-4 h-4" /> 数据库
                    </button>
                    <button onClick={() => setActiveTab('ftp')} className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors flex items-center justify-center gap-2 ${activeTab === 'ftp' ? 'border-primary-600 text-primary-700 bg-primary-50/30' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        <Cloud className="w-4 h-4" /> FTP/S3
                    </button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto">
                    {activeTab === 'file' && (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 flex flex-col items-center justify-center text-center hover:border-primary-400 hover:bg-primary-50/10 transition-colors cursor-pointer group">
                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-slate-400 group-hover:text-primary-500">
                                <FolderOpen className="w-8 h-8" />
                            </div>
                            <h4 className="text-base font-bold text-slate-700 mb-1">点击或拖拽文件至此</h4>
                            <p className="text-xs text-slate-500 max-w-xs">支持 .tiff, .las, .shp, .pdf, .mp4 等格式。单文件最大 50GB。</p>
                        </div>
                    )}

                    {activeTab === 'db' && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Host</label>
                                    <input type="text" placeholder="127.0.0.1" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Port</label>
                                    <input type="text" placeholder="5432" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Database Name</label>
                                <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Table / Query</label>
                                <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500 font-mono" placeholder="SELECT * FROM raw_data LIMIT 100"></textarea>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> 数据同步周期 (Sync Frequency)
                                </label>
                                <select 
                                    value={syncPeriod}
                                    onChange={(e) => setSyncPeriod(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                    <option value="once">仅一次 (One-time)</option>
                                    <option value="realtime">实时同步 (Real-time)</option>
                                    <option value="hourly">每小时 (Hourly)</option>
                                    <option value="daily">每天 (Daily)</option>
                                    <option value="weekly">每周 (Weekly)</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {activeTab === 'ftp' && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Protocol</label>
                                <select className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500">
                                    <option>S3 Bucket</option>
                                    <option>SFTP</option>
                                    <option>FTP</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-slate-500 block mb-1">Endpoint / Bucket URL</label>
                                <input type="text" placeholder="s3://my-bucket/raw-data" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Access Key / User</label>
                                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1">Secret Key / Pass</label>
                                    <input type="password" className="w-full bg-slate-50 border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500" />
                                </div>
                            </div>
                            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <label className="text-xs font-bold text-slate-600 block mb-1.5 flex items-center gap-1">
                                    <RefreshCw className="w-3 h-3" /> 数据同步周期 (Sync Frequency)
                                </label>
                                <select 
                                    value={syncPeriod}
                                    onChange={(e) => setSyncPeriod(e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded p-2 text-sm outline-none focus:ring-1 focus:ring-primary-500"
                                >
                                    <option value="once">仅一次 (One-time)</option>
                                    <option value="realtime">实时同步 (Real-time)</option>
                                    <option value="hourly">每小时 (Hourly)</option>
                                    <option value="daily">每天 (Daily)</option>
                                    <option value="weekly">每周 (Weekly)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 text-slate-700 font-bold rounded-lg hover:bg-slate-50 transition-colors text-sm">取消</button>
                    <button onClick={onClose} className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg shadow-md shadow-primary-200 transition-colors text-sm flex items-center gap-2">
                        {activeTab === 'file' ? '开始上传' : '测试连接'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DetailDrawer = ({ asset, onClose, onUpdate }: { asset: SourceAsset, onClose: () => void, onUpdate: (updatedAsset: SourceAsset) => void }) => {
    const { dictionary } = useDictionary();
    const dictionaryTypes = dictionary['data_type'] || [];
    const [isEditingType, setIsEditingType] = useState(false);
    const [editedTypes, setEditedTypes] = useState<string[]>(asset.type);

    // Reset edited types when asset changes
    useEffect(() => {
        setEditedTypes(asset.type);
        setIsEditingType(false);
    }, [asset]);

    const handleSaveType = () => {
        onUpdate({ ...asset, type: editedTypes });
        setIsEditingType(false);
    };

    const toggleType = (typeValue: string) => {
        setEditedTypes(prev => {
            if (prev.includes(typeValue)) {
                return prev.filter(t => t !== typeValue);
            } else {
                return [...prev, typeValue];
            }
        });
    };

    return (
        <div className="absolute inset-0 z-50 bg-black/20 backdrop-blur-[1px] flex justify-end">
            <div className="w-[800px] bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="h-16 border-b border-slate-200 flex items-center justify-between px-6 bg-slate-50">
                     <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg border ${asset.type.includes('GovDoc') ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-100 border-slate-200 text-slate-600'}`}>
                             {/* Use first type icon or generic */}
                             {React.createElement(ASSET_TYPE_ICONS[asset.type[0]] || FileText, { className: "w-5 h-5" })}
                         </div>
                         <div>
                             <h3 className="font-bold text-slate-900 leading-tight">{asset.name}</h3>
                             <p className="text-xs text-slate-500 font-mono">{asset.id} • {asset.size}</p>
                         </div>
                     </div>
                     <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                         <X className="w-5 h-5" />
                     </button>
                </div>
                <div className="flex-1 flex overflow-hidden">
                    <div className="flex-1 bg-slate-900 relative flex items-center justify-center overflow-hidden">
                        <div className="text-white text-sm">Preview Placeholder</div>
                    </div>
                    <div className="w-80 border-l border-slate-200 bg-white flex flex-col overflow-y-auto">
                         <div className="p-6">
                             {/* Data Type Edit Section */}
                             <div className="mb-6">
                                 <div className="flex justify-between items-center mb-2">
                                     <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                         <FileType className="w-4 h-4 text-slate-400" /> 数据类型
                                     </h4>
                                     {!isEditingType ? (
                                         <button onClick={() => setIsEditingType(true)} className="p-1 text-slate-400 hover:text-primary-600 rounded hover:bg-slate-100 transition-colors">
                                             <Edit2 className="w-3.5 h-3.5" />
                                         </button>
                                     ) : (
                                         <div className="flex gap-2">
                                             <button onClick={() => setIsEditingType(false)} className="text-xs text-slate-500 hover:text-slate-700">Cancel</button>
                                             <button onClick={handleSaveType} className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1">
                                                 <Save className="w-3 h-3" /> Save
                                             </button>
                                         </div>
                                     )}
                                 </div>
                                 
                                 {isEditingType ? (
                                     <div className="space-y-1.5 border border-slate-200 p-2 rounded-lg bg-slate-50/50">
                                         {dictionaryTypes.map(dt => (
                                             <label key={dt.value} className="flex items-center gap-2 cursor-pointer hover:bg-white p-1 rounded transition-colors">
                                                 <input 
                                                     type="checkbox" 
                                                     checked={editedTypes.includes(dt.value)}
                                                     onChange={() => toggleType(dt.value)}
                                                     className="rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                                                 />
                                                 <span className="text-sm text-slate-700">{dt.label}</span>
                                             </label>
                                         ))}
                                     </div>
                                 ) : (
                                     <div className="flex flex-wrap gap-2">
                                         {asset.type.map(t => {
                                             const dictItem = dictionaryTypes.find(d => d.value === t);
                                             const label = dictItem?.label || t;
                                             const color = dictItem?.color || 'slate';
                                             return (
                                                 <span key={t} className={`px-2 py-1 rounded text-xs border bg-${color}-50 text-${color}-700 border-${color}-200 flex items-center gap-1`}>
                                                     {label}
                                                 </span>
                                             );
                                         })}
                                         {asset.type.length === 0 && <span className="text-xs text-slate-400 italic">Unclassified</span>}
                                     </div>
                                 )}
                             </div>

                             <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                 <Tag className="w-4 h-4 text-slate-400" /> 元数据 (Metadata)
                             </h4>
                             <div className="space-y-3">
                                 <div>
                                     <span className="text-xs font-bold text-slate-500 uppercase block mb-1">标签</span>
                                     <div className="flex flex-wrap gap-2">
                                         {asset.tags.map(t => (
                                             <span key={t} className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-xs border border-slate-200">{t}</span>
                                         ))}
                                     </div>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- New Components for Batch Actions ---

const BatchTagModal = ({ isOpen, onClose, onApply, count }: { isOpen: boolean, onClose: () => void, onApply: (tag: string) => void, count: number }) => {
    const [tag, setTag] = useState('');
    const suggestedTags = ['High Quality', 'Cloudy', 'Urgent', 'Reviewed'];

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-96 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-900 mb-2">批量打标 (Batch Tag)</h3>
                <p className="text-sm text-slate-500 mb-4">为选中的 <span className="font-bold text-primary-600">{count}</span> 个项添加标签。</p>
                
                <input 
                    type="text" 
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="输入新标签..." 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100 mb-3"
                    autoFocus
                />
                
                <div className="flex flex-wrap gap-2 mb-6">
                    {suggestedTags.map(t => (
                        <button key={t} onClick={() => setTag(t)} className="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-xs text-slate-600 transition-colors">
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-bold">取消</button>
                    <button onClick={() => onApply(tag)} disabled={!tag} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-bold shadow-md shadow-primary-200">
                        确认添加
                    </button>
                </div>
            </div>
        </div>
    );
};

const BatchPushModal = ({ isOpen, onClose, onConfirm, count }: { isOpen: boolean, onClose: () => void, onConfirm: (pipeline: string) => void, count: number }) => {
    const [pipeline, setPipeline] = useState('Road');

    if (!isOpen) return null;

    return (
        <div className="absolute inset-0 z-[60] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white w-96 rounded-2xl shadow-2xl p-6 animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-900 mb-2">投递至产线 (Dispatch)</h3>
                <p className="text-sm text-slate-500 mb-4">将 <span className="font-bold text-primary-600">{count}</span> 个资源项推送至生产流水线。</p>
                
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase block mb-1.5">目标产线</label>
                        <select 
                            value={pipeline} 
                            onChange={(e) => setPipeline(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm outline-none focus:ring-2 focus:ring-primary-100"
                        >
                            <option value="Road">路网产线 (Road Pipeline)</option>
                            <option value="POI">POI 产线 (POI Pipeline)</option>
                            <option value="Admin">行政区划 (Admin Pipeline)</option>
                        </select>
                    </div>
                    <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                        <div className="text-xs text-blue-700">
                            投递后，资源状态将变更为 "分诊中 (Triaging)"，并自动触发对应产线的预处理任务。
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-50 rounded-lg text-sm font-bold">取消</button>
                    <button onClick={() => onConfirm(pipeline)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg text-sm font-bold shadow-md shadow-primary-200 flex items-center gap-2">
                        <Send className="w-4 h-4" /> 立即投递
                    </button>
                </div>
            </div>
        </div>
    );
};

const Toast = ({ message, type }: { message: string, type: 'success' | 'info' }) => {
    return (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-[70] animate-in slide-in-from-top-4 fade-in duration-300">
            <div className={`px-4 py-3 rounded-xl shadow-lg border flex items-center gap-3 ${
                type === 'success' ? 'bg-white border-emerald-100 text-emerald-700' : 'bg-white border-blue-100 text-blue-700'
            }`}>
                {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <div className="w-5 h-5 rounded-full border-2 border-current border-t-transparent animate-spin" />}
                <span className="font-bold text-sm">{message}</span>
            </div>
        </div>
    );
};

const SourceHub = () => {
  const { dictionary } = useDictionary();
  const [assets, setAssets] = useState<SourceAsset[]>(INITIAL_MOCK_ASSETS);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeAsset, setActiveAsset] = useState<SourceAsset | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'list' | 'map'>('card');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  
  // New States for Batch Actions
  const [isBatchTagOpen, setIsBatchTagOpen] = useState(false);
  const [isBatchPushOpen, setIsBatchPushOpen] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  
  // Initialize filter state based on dictionary
  const dictionaryTypes = dictionary['data_type'] || [];
  const [filterType, setFilterType] = useState<Record<string, boolean>>({});

  // Effect to sync new dictionary items to filter state (default checked)
  useEffect(() => {
      setFilterType(prev => {
          const next = { ...prev };
          dictionaryTypes.forEach(item => {
              if (next[item.value] === undefined) {
                  next[item.value] = true;
              }
          });
          return next;
      });
  }, [dictionaryTypes]);

  // Reset page when filter changes
  useEffect(() => {
      setCurrentPage(1);
  }, [filterType]);

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

  // Batch Action Handlers
  const handleBatchDownload = () => {
      setNotification({ message: `Starting download for ${selectedIds.size} files...`, type: 'info' });
      setTimeout(() => setNotification(null), 3000);
      setSelectedIds(new Set()); 
  };

  const handleBatchTag = (newTag: string) => {
      setAssets(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, tags: [...a.tags, newTag] } : a));
      setNotification({ message: `Added tag "${newTag}" to ${selectedIds.size} items`, type: 'success' });
      setIsBatchTagOpen(false);
      setSelectedIds(new Set());
      setTimeout(() => setNotification(null), 3000);
  };

  const handleBatchPush = (pipeline: string) => {
      setAssets(prev => prev.map(a => selectedIds.has(a.id) ? { ...a, status: 'triaging' } : a));
      setNotification({ message: `Successfully dispatched ${selectedIds.size} items to ${pipeline}`, type: 'success' });
      setIsBatchPushOpen(false);
      setSelectedIds(new Set());
      setTimeout(() => setNotification(null), 3000);
  };

  // Filter Logic: Asset is shown if ANY of its types matches a selected filter
  const filteredAssets = assets.filter(a => {
      if (a.type.length === 0) return true; // Show unclassified or decide policy
      return a.type.some(t => filterType[t]);
  });

  const totalPages = Math.ceil(filteredAssets.length / ITEMS_PER_PAGE);
  const paginatedAssets = filteredAssets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div className="h-full flex flex-col relative">
      {activeAsset && <DetailDrawer asset={activeAsset} onClose={() => setActiveAsset(null)} onUpdate={handleUpdateAsset} />}
      <UploadModal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} />
      
      {/* Batch Modals & Notifications */}
      <BatchTagModal isOpen={isBatchTagOpen} onClose={() => setIsBatchTagOpen(false)} onApply={handleBatchTag} count={selectedIds.size} />
      <BatchPushModal isOpen={isBatchPushOpen} onClose={() => setIsBatchPushOpen(false)} onConfirm={handleBatchPush} count={selectedIds.size} />
      {notification && <Toast message={notification.message} type={notification.type} />}

      <div className="flex-1 flex gap-6 min-h-0">
          {/* Left: Filter Sidebar */}
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
                              <input 
                                type="checkbox" 
                                checked={filterType[item.value] || false} 
                                onChange={e => setFilterType({...filterType, [item.value]: e.target.checked})}
                                className="peer h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 transition-all"
                              />
                              <span className="text-sm text-slate-600 group-hover:text-slate-900">{item.label}</span>
                          </label>
                      ))}
                  </div>
              </div>

              <div className="glass-panel p-4 rounded-xl">
                  <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
                      <MapIcon className="w-3 h-3" /> 空间框选
                  </h4>
                  <div className="h-32 bg-slate-100 rounded border border-slate-200 relative overflow-hidden group cursor-crosshair">
                      <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center opacity-40 grayscale group-hover:grayscale-0 transition-all"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                          <button className="bg-white/90 backdrop-blur text-slate-600 text-xs px-3 py-1.5 rounded-full border border-slate-200 shadow-sm font-medium hover:bg-white hover:text-primary-600 transition-colors">
                              绘制区域
                          </button>
                      </div>
                  </div>
              </div>
          </aside>

          {/* Right: Grid/Map */}
          <div className="flex-1 flex flex-col min-h-0">
             <StatDashboard assets={filteredAssets} />

             {/* Toolbar */}
             <div className="flex justify-between items-center mb-4 shrink-0">
                 <div className="relative flex-1 max-w-lg">
                      <input 
                          type="text" 
                          placeholder="搜索文件名、元数据或输入语义描述..." 
                          className="w-full pl-10 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-100 focus:border-primary-500 outline-none shadow-sm"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-primary-600" title="Visual Search">
                          <Camera className="w-4 h-4" />
                      </button>
                  </div>
                  <div className="flex gap-3">
                        <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                            <button 
                                onClick={() => setViewMode('card')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                    viewMode === 'card' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <LayoutGrid className="w-3.5 h-3.5" /> 卡片
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                    viewMode === 'list' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <List className="w-3.5 h-3.5" /> 列表
                            </button>
                            <button 
                                onClick={() => setViewMode('map')}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                                    viewMode === 'map' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <MapIcon className="w-3.5 h-3.5" /> 地图
                            </button>
                        </div>
                        <button className="flex items-center gap-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm">
                            <Link className="w-3 h-3" /> 接入流媒体
                        </button>
                        <button 
                            onClick={() => setIsUploadOpen(true)}
                            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm shadow-primary-200"
                        >
                            <Upload className="w-3 h-3" /> 上传资料
                        </button>
                  </div>
             </div>

             <main className="flex-1 overflow-hidden relative rounded-xl border border-slate-200 shadow-sm bg-slate-50 flex flex-col">
                  {viewMode === 'card' && (
                      <div className="flex-1 overflow-y-auto p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4">
                              {paginatedAssets.map(asset => {
                                  // Use the icon of the first type, or fallback
                                  const mainType = asset.type[0];
                                  const Icon = ASSET_TYPE_ICONS[mainType] || FileText;
                                  const isSelected = selectedIds.has(asset.id);
                                  
                                  return (
                                      <div 
                                        key={asset.id} 
                                        className={`glass-panel rounded-xl overflow-hidden group hover:shadow-lg transition-all duration-300 relative bg-white ${isSelected ? 'ring-2 ring-primary-500 border-primary-500' : 'border-slate-200'}`}
                                      >
                                          <button onClick={() => toggleSelection(asset.id)} className="absolute top-3 left-3 z-10 text-white hover:scale-110 transition-transform">
                                              {isSelected ? <CheckSquare className="w-5 h-5 text-primary-500 bg-white rounded shadow-sm" /> : <Square className="w-5 h-5 text-slate-400/80 hover:text-white drop-shadow-md" />}
                                          </button>

                                          <div className={`h-32 w-full ${asset.thumbnailColor} relative cursor-pointer`} onClick={() => setActiveAsset(asset)}>
                                              <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors"></div>
                                              <span className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-bold uppercase shadow-sm border ${
                                                  asset.status === 'cataloged' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                  asset.status === 'triaging' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                                                  'bg-slate-100 text-slate-600 border-slate-200'
                                              }`}>{asset.status === 'cataloged' ? '已编目' : asset.status === 'triaging' ? '分诊中' : '未处理'}</span>
                                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 backdrop-blur rounded-full flex items-center justify-center text-slate-700 group-hover:scale-110 transition-transform"><Icon className="w-5 h-5" /></div>
                                          </div>

                                          <div className="p-4">
                                              <h3 className="font-bold text-slate-900 text-sm truncate pr-2" title={asset.name}>{asset.name}</h3>
                                              <div className="flex gap-1 mt-2 mb-1 flex-wrap h-5 overflow-hidden">
                                                  {asset.type.map(t => {
                                                      const dictItem = dictionaryTypes.find(d => d.value === t);
                                                      return (
                                                          <span key={t} className={`text-[10px] px-1.5 rounded border ${dictItem?.color ? `bg-${dictItem.color}-50 text-${dictItem.color}-700 border-${dictItem.color}-200` : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                              {dictItem?.label || t}
                                                          </span>
                                                      )
                                                  })}
                                              </div>
                                              <div className="grid grid-cols-2 gap-y-1 gap-x-2 text-xs text-slate-500 my-2">
                                                  <span className="font-mono">{asset.resolution || '-'}</span><span className="text-right">{asset.source}</span>
                                                  <span>{asset.date}</span><span className="text-right">{asset.size}</span>
                                              </div>
                                              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                                                  <button onClick={() => setActiveAsset(asset)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors"><Eye className="w-3 h-3" /> 预览</button>
                                                  <button onClick={() => setActiveAsset(asset)} className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium transition-colors" title="View Lineage"><GitFork className="w-3 h-3" /> 血缘</button>
                                                  <button className="p-1.5 rounded bg-slate-50 hover:bg-primary-50 text-slate-400 hover:text-primary-600 transition-colors" title="Force Triage"><Play className="w-3 h-3" /></button>
                                              </div>
                                          </div>
                                      </div>
                                  );
                              })}
                          </div>
                      </div>
                  )}

                  {viewMode === 'list' && (
                      <div className="flex-1 overflow-auto">
                          <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-bold sticky top-0 z-10 shadow-sm">
                                  <tr>
                                      <th className="px-6 py-4 w-12 text-center">
                                          <Square className="w-4 h-4 text-slate-400" />
                                      </th>
                                      <th className="px-6 py-4">文件名</th>
                                      <th className="px-6 py-4">类型</th>
                                      <th className="px-6 py-4">分辨率</th>
                                      <th className="px-6 py-4">来源</th>
                                      <th className="px-6 py-4">采集时间</th>
                                      <th className="px-6 py-4">最后更新</th>
                                      <th className="px-6 py-4">大小</th>
                                      <th className="px-6 py-4">状态</th>
                                      <th className="px-6 py-4 text-right">操作</th>
                                  </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100">
                                  {paginatedAssets.map((asset) => {
                                      const mainType = asset.type[0];
                                      const Icon = ASSET_TYPE_ICONS[mainType] || FileText;
                                      const isSelected = selectedIds.has(asset.id);
                                      return (
                                          <tr key={asset.id} className="hover:bg-slate-50 group transition-colors">
                                              <td className="px-6 py-4 text-center">
                                                  <button onClick={() => toggleSelection(asset.id)}>
                                                      {isSelected ? <CheckSquare className="w-4 h-4 text-primary-600" /> : <Square className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />}
                                                  </button>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <div className="flex items-center gap-3">
                                                      <div className={`p-2 rounded bg-slate-100 text-slate-600`}>
                                                          <Icon className="w-4 h-4" />
                                                      </div>
                                                      <span className="font-bold text-slate-900">{asset.name}</span>
                                                  </div>
                                              </td>
                                              <td className="px-6 py-4">
                                                  <div className="flex flex-wrap gap-1 max-w-[150px]">
                                                      {asset.type.map(t => {
                                                          const dictItem = dictionaryTypes.find(d => d.value === t);
                                                          return (
                                                              <span key={t} className={`text-[10px] px-1.5 py-0.5 rounded border ${dictItem?.color ? `bg-${dictItem.color}-50 text-${dictItem.color}-700 border-${dictItem.color}-200` : 'bg-slate-50 text-slate-600 border-slate-200'}`}>
                                                                  {dictItem?.label || t}
                                                              </span>
                                                          )
                                                      })}
                                                  </div>
                                              </td>
                                              <td className="px-6 py-4 font-mono text-slate-500 text-xs">{asset.resolution || '-'}</td>
                                              <td className="px-6 py-4 text-slate-600">{asset.source}</td>
                                              <td className="px-6 py-4 font-mono text-slate-500 text-xs">{asset.date}</td>
                                              <td className="px-6 py-4 font-mono text-slate-500 text-xs">{asset.lastUpdated}</td>
                                              <td className="px-6 py-4 font-mono text-slate-500 text-xs">{asset.size}</td>
                                              <td className="px-6 py-4">
                                                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                                                      asset.status === 'cataloged' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                                      asset.status === 'triaging' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                      'bg-slate-50 text-slate-600 border-slate-200'
                                                  }`}>
                                                      {asset.status === 'cataloged' ? '已编目' : asset.status === 'triaging' ? '分诊中' : '未处理'}
                                                  </span>
                                              </td>
                                              <td className="px-6 py-4 text-right">
                                                  <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                      <button onClick={() => setActiveAsset(asset)} className="text-slate-500 hover:text-primary-600 text-xs font-bold">预览</button>
                                                      <button className="text-slate-500 hover:text-primary-600 text-xs font-bold">血缘</button>
                                                  </div>
                                              </td>
                                          </tr>
                                      );
                                  })}
                              </tbody>
                          </table>
                      </div>
                  )}

                  {viewMode === 'map' && (
                      <div className="absolute inset-0 bg-slate-100 relative group overflow-hidden">
                          <div className="absolute inset-0 bg-[url('https://upload.wikimedia.org/wikipedia/commons/thumb/e/ec/World_map_blank_without_borders.svg/2000px-World_map_blank_without_borders.svg.png')] bg-cover bg-center opacity-60 grayscale"></div>
                          {/* Map Markers */}
                          {paginatedAssets.filter(a => a.location).map(asset => (
                              <div 
                                key={asset.id} 
                                onClick={() => setActiveAsset(asset)}
                                className="absolute -ml-3 -mt-6 cursor-pointer group/marker z-10 hover:z-20 transition-transform hover:scale-110" 
                                style={{ left: `${asset.location!.x}%`, top: `${asset.location!.y}%` }}
                              >
                                  <div className="flex flex-col items-center">
                                      <div className="bg-white px-2 py-1 rounded shadow-md text-[10px] font-bold whitespace-nowrap mb-1 opacity-0 group-hover/marker:opacity-100 transition-opacity pointer-events-none">
                                          {asset.name}
                                      </div>
                                      <MapPin className="w-6 h-6 text-primary-600 drop-shadow-md fill-white" />
                                  </div>
                              </div>
                          ))}
                          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-slate-200 text-xs font-bold text-slate-500">
                              Displaying {paginatedAssets.length} assets
                          </div>
                      </div>
                  )}

                  {/* Pagination Footer (Visible for Card & List views) */}
                  {(viewMode === 'card' || viewMode === 'list') && (
                      <div className="h-14 border-t border-slate-200 bg-white flex items-center justify-between px-6 shrink-0">
                          <div className="text-xs text-slate-500">
                              Showing <span className="font-bold text-slate-900">{(currentPage - 1) * ITEMS_PER_PAGE + 1}</span> to <span className="font-bold text-slate-900">{Math.min(currentPage * ITEMS_PER_PAGE, filteredAssets.length)}</span> of <span className="font-bold text-slate-900">{filteredAssets.length}</span> entries
                          </div>
                          <div className="flex items-center gap-2">
                              <button 
                                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                  disabled={currentPage === 1}
                                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <ChevronLeft className="w-4 h-4" />
                              </button>
                              <div className="flex items-center gap-1">
                                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                      <button 
                                          key={page}
                                          onClick={() => setCurrentPage(page)}
                                          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                                              currentPage === page 
                                              ? 'bg-primary-600 text-white' 
                                              : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                                          }`}
                                      >
                                          {page}
                                      </button>
                                  ))}
                              </div>
                              <button 
                                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                  disabled={currentPage === totalPages}
                                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <ChevronRight className="w-4 h-4" />
                              </button>
                          </div>
                      </div>
                  )}
              </main>
          </div>
      </div>

      {/* Floating Batch Actions Bar */}
      {selectedIds.size > 0 && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-4 z-40">
              <span className="font-bold text-sm bg-slate-700 px-2 py-0.5 rounded-md">已选择 {selectedIds.size} 项</span>
              <div className="h-4 w-px bg-slate-700"></div>
              <button onClick={handleBatchDownload} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"><Download className="w-4 h-4" /> 批量下载</button>
              <button onClick={() => setIsBatchTagOpen(true)} className="flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"><Tag className="w-4 h-4" /> 批量标签</button>
              <button onClick={() => setIsBatchPushOpen(true)} className="flex items-center gap-2 text-sm font-bold text-primary-400 hover:text-primary-300 transition-colors"><Send className="w-4 h-4" /> 投递至产线</button>
              <button onClick={() => setSelectedIds(new Set())} className="ml-2 p-1 hover:bg-slate-800 rounded-full"><X className="w-4 h-4 text-slate-500" /></button>
          </div>
      )}
    </div>
  );
};

export default SourceHub;