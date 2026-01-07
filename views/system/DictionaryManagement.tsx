
import React, { useState, useMemo } from 'react';
import { 
    Book, 
    Plus, 
    Trash2, 
    Edit3, 
    Search, 
    ChevronRight,
    Save,
    X,
    MoreVertical,
    Layers,
    GitBranch,
    ArrowRight,
    Check,
    Globe,
    MapPin,
    Footprints
} from 'lucide-react';
import { useDictionary } from '../../contexts/DictionaryContext';

interface DictionaryItem {
    label: string;
    value: string;
    color?: string;
    code?: string; // Used for Parent Group in pipelines (Foundation/Location/LastMile)
}

const CATEGORY_LABELS: Record<string, string> = {
    'pipeline_hierarchy': '产线与工序 (Pipeline)',
    'data_type': '数据类型 (Data Type)',
    'task_priority': '任务优先级 (Priority)',
    'asset_status': '资源状态 (Asset Status)'
};

const COLOR_OPTIONS = ['blue', 'emerald', 'amber', 'rose', 'purple', 'indigo', 'cyan', 'slate'];

const PIPELINE_GROUPS = [
    { id: 'Foundation', label: '基础地理 (Foundation)', icon: Globe, color: 'text-indigo-600' },
    { id: 'Location', label: '地点与地址 (Location)', icon: MapPin, color: 'text-emerald-600' },
    { id: 'LastMile', label: '末端场景 (Last Mile)', icon: Footprints, color: 'text-amber-600' },
];

// --- Sub-Component: Generic Editor ---

const GenericDictionaryEditor = ({ category }: { category: string }) => {
    const { dictionary, updateDictionary } = useDictionary();
    const currentItems = dictionary[category] || [];
    
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<DictionaryItem>({ label: '', value: '', color: 'slate', code: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [newItem, setNewItem] = useState<DictionaryItem>({ label: '', value: '', color: 'slate', code: '' });

    const handleSaveNew = () => {
        if (!newItem.label || !newItem.value) return;
        updateDictionary(category, [...currentItems, newItem]);
        setIsAdding(false);
        setNewItem({ label: '', value: '', color: 'slate', code: '' });
    };

    const handleUpdate = (index: number) => {
        const newItems = [...currentItems];
        newItems[index] = editForm;
        updateDictionary(category, newItems);
        setEditingIndex(null);
    };

    const handleDelete = (index: number) => {
        if(!confirm('确认删除此条目吗？')) return;
        const newItems = [...currentItems];
        newItems.splice(index, 1);
        updateDictionary(category, newItems);
    };

    const startEdit = (index: number, item: DictionaryItem) => {
        setEditingIndex(index);
        setEditForm({ ...item });
    };

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 shrink-0">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 capitalize">{CATEGORY_LABELS[category] || category}</h3>
                    <p className="text-xs text-slate-500">配置该分类下的枚举值</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" /> 添加条目
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                        <tr>
                            <th className="px-4 py-3 rounded-l-lg">Label (显示名)</th>
                            <th className="px-4 py-3">Value (存储值)</th>
                            <th className="px-4 py-3">Color Tag</th>
                            <th className="px-4 py-3">Code (Extra)</th>
                            <th className="px-4 py-3 rounded-r-lg text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isAdding && (
                            <tr className="bg-primary-50/30">
                                <td className="px-4 py-3">
                                    <input autoFocus type="text" placeholder="Label" className="w-full bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary-500" value={newItem.label} onChange={e => setNewItem({...newItem, label: e.target.value})} />
                                </td>
                                <td className="px-4 py-3">
                                    <input type="text" placeholder="Value" className="w-full bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary-500" value={newItem.value} onChange={e => setNewItem({...newItem, value: e.target.value})} />
                                </td>
                                <td className="px-4 py-3">
                                    <select className="bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none" value={newItem.color} onChange={e => setNewItem({...newItem, color: e.target.value})}>
                                        <option value="slate">Slate</option>
                                        <option value="blue">Blue</option>
                                        <option value="emerald">Emerald</option>
                                        <option value="rose">Rose</option>
                                        <option value="amber">Amber</option>
                                        <option value="purple">Purple</option>
                                    </select>
                                </td>
                                <td className="px-4 py-3">
                                    <input type="text" placeholder="Code" className="w-full bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-primary-500" value={newItem.code} onChange={e => setNewItem({...newItem, code: e.target.value})} />
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <div className="flex justify-end gap-2">
                                        <button onClick={handleSaveNew} className="p-1.5 bg-primary-600 text-white rounded hover:bg-primary-700"><Save className="w-3.5 h-3.5"/></button>
                                        <button onClick={() => setIsAdding(false)} className="p-1.5 bg-slate-200 text-slate-600 rounded hover:bg-slate-300"><X className="w-3.5 h-3.5"/></button>
                                    </div>
                                </td>
                            </tr>
                        )}
                        {currentItems.map((item, index) => (
                            <tr key={index} className="hover:bg-slate-50 group transition-colors">
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {editingIndex === index ? (
                                        <input type="text" className="w-full bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none" value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} />
                                    ) : item.label}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                                    {editingIndex === index ? (
                                        <input type="text" className="w-full bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none" value={editForm.value} onChange={e => setEditForm({...editForm, value: e.target.value})} />
                                    ) : item.value}
                                </td>
                                <td className="px-4 py-3">
                                    {editingIndex === index ? (
                                        <select className="bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none" value={editForm.color} onChange={e => setEditForm({...editForm, color: e.target.value})}>
                                            <option value="slate">Slate</option>
                                            <option value="blue">Blue</option>
                                            <option value="emerald">Emerald</option>
                                            <option value="rose">Rose</option>
                                            <option value="amber">Amber</option>
                                            <option value="purple">Purple</option>
                                        </select>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full bg-${item.color}-500`}></div>
                                            <span className="text-xs text-slate-500 capitalize">{item.color}</span>
                                        </div>
                                    )}
                                </td>
                                <td className="px-4 py-3 font-mono text-slate-500 text-xs">
                                    {editingIndex === index ? (
                                        <input type="text" className="w-full bg-white border border-primary-200 rounded px-2 py-1 text-sm outline-none" value={editForm.code} onChange={e => setEditForm({...editForm, code: e.target.value})} />
                                    ) : (item.code || '-')}
                                </td>
                                <td className="px-4 py-3 text-right">
                                    {editingIndex === index ? (
                                        <div className="flex justify-end gap-2">
                                            <button onClick={() => handleUpdate(index)} className="text-emerald-600 hover:bg-emerald-50 p-1.5 rounded"><Save className="w-4 h-4"/></button>
                                            <button onClick={() => setEditingIndex(null)} className="text-slate-400 hover:bg-slate-100 p-1.5 rounded"><X className="w-4 h-4"/></button>
                                        </div>
                                    ) : (
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => startEdit(index, item)} className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 p-1.5 rounded transition-colors"><Edit3 className="w-4 h-4"/></button>
                                            <button onClick={() => handleDelete(index)} className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 rounded transition-colors"><Trash2 className="w-4 h-4"/></button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {currentItems.length === 0 && !isAdding && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <Book className="w-12 h-12 mb-3 opacity-20" />
                        <p className="text-sm">暂无数据条目</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- Sub-Component: Pipeline Hierarchy Editor ---

const PipelineHierarchyEditor = () => {
    const { dictionary, updateDictionary } = useDictionary();
    const pipelines = dictionary['pipeline'] || [];
    const subPipelines = dictionary['sub_pipeline'] || [];

    const [selectedPipelineId, setSelectedPipelineId] = useState<string | null>(pipelines.length > 0 ? pipelines[0].value : null);
    
    // --- Pipeline CRUD ---
    const [isAddingPipeline, setIsAddingPipeline] = useState(false);
    const [newPipeline, setNewPipeline] = useState<DictionaryItem>({ label: '', value: '', color: 'blue', code: 'Foundation' });

    const handleAddPipeline = () => {
        if (!newPipeline.label || !newPipeline.value) return;
        updateDictionary('pipeline', [...pipelines, newPipeline]);
        setIsAddingPipeline(false);
        setSelectedPipelineId(newPipeline.value);
        setNewPipeline({ label: '', value: '', color: 'blue', code: 'Foundation' });
    };

    const handleDeletePipeline = (val: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if(!confirm('删除产线将同步删除其下的所有工序，确认吗？')) return;
        updateDictionary('pipeline', pipelines.filter(p => p.value !== val));
        updateDictionary('sub_pipeline', subPipelines.filter(sp => sp.code !== val));
        if (selectedPipelineId === val) setSelectedPipelineId(null);
    };

    // --- Sub-Pipeline CRUD ---
    const [isAddingSub, setIsAddingSub] = useState(false);
    const [newSub, setNewSub] = useState<DictionaryItem>({ label: '', value: '', color: 'slate' });

    const currentSubPipelines = subPipelines.filter(sp => sp.code === selectedPipelineId);

    const handleAddSub = () => {
        if (!newSub.label || !newSub.value || !selectedPipelineId) return;
        const itemWithCode = { ...newSub, code: selectedPipelineId };
        updateDictionary('sub_pipeline', [...subPipelines, itemWithCode]);
        setIsAddingSub(false);
        setNewSub({ label: '', value: '', color: 'slate' });
    };

    const handleDeleteSub = (val: string) => {
        if(!confirm('确认删除此工序吗？')) return;
        updateDictionary('sub_pipeline', subPipelines.filter(sp => sp.value !== val));
    };

    return (
        <div className="flex-1 flex h-full overflow-hidden">
            {/* Left: Pipelines */}
            <div className="w-1/3 border-r border-slate-200 flex flex-col bg-slate-50/50">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Layers className="w-4 h-4 text-indigo-600"/> 产线 (Pipelines)
                    </h3>
                    <button onClick={() => setIsAddingPipeline(true)} className="p-1.5 hover:bg-slate-100 rounded text-slate-500"><Plus className="w-4 h-4"/></button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                    {/* Render Groups */}
                    {PIPELINE_GROUPS.map(group => {
                        const groupPipelines = pipelines.filter(p => p.code === group.id);
                        if (groupPipelines.length === 0 && !isAddingPipeline) return null;

                        return (
                            <div key={group.id}>
                                <div className="flex items-center gap-2 px-2 mb-2">
                                    <group.icon className={`w-3.5 h-3.5 ${group.color}`} />
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.label}</h4>
                                </div>
                                <div className="space-y-2">
                                    {groupPipelines.map(p => (
                                        <div 
                                            key={p.value}
                                            onClick={() => setSelectedPipelineId(p.value)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${
                                                selectedPipelineId === p.value 
                                                ? 'bg-white border-primary-500 shadow-md ring-1 ring-primary-500 z-10' 
                                                : 'bg-white border-slate-200 hover:border-primary-300'
                                            }`}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div className="font-bold text-slate-800">{p.label}</div>
                                                <div className={`w-2 h-2 rounded-full bg-${p.color}-500`}></div>
                                            </div>
                                            <div className="text-xs text-slate-400 font-mono mt-1">{p.value}</div>
                                            
                                            <button 
                                                onClick={(e) => handleDeletePipeline(p.value, e)}
                                                className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}

                    {/* Pipelines with no group or unknown group */}
                    {pipelines.filter(p => !p.code || !PIPELINE_GROUPS.find(g => g.id === p.code)).length > 0 && (
                        <div>
                            <div className="px-2 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">未分类 (Other)</div>
                            <div className="space-y-2">
                                {pipelines.filter(p => !p.code || !PIPELINE_GROUPS.find(g => g.id === p.code)).map(p => (
                                    <div 
                                        key={p.value}
                                        onClick={() => setSelectedPipelineId(p.value)}
                                        className={`p-3 rounded-xl border cursor-pointer transition-all group relative ${
                                            selectedPipelineId === p.value 
                                            ? 'bg-white border-primary-500 shadow-md ring-1 ring-primary-500 z-10' 
                                            : 'bg-white border-slate-200 hover:border-primary-300'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <div className="font-bold text-slate-800">{p.label}</div>
                                            <div className={`w-2 h-2 rounded-full bg-${p.color}-500`}></div>
                                        </div>
                                        <div className="text-xs text-slate-400 font-mono mt-1">{p.value}</div>
                                        <button onClick={(e) => handleDeletePipeline(p.value, e)} className="absolute top-2 right-2 p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {isAddingPipeline && (
                        <div className="p-3 rounded-xl border border-slate-200 bg-white shadow-lg space-y-3 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">所属大类</label>
                                <select 
                                    className="w-full text-sm px-2 py-1.5 rounded border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all"
                                    value={newPipeline.code}
                                    onChange={e => setNewPipeline({...newPipeline, code: e.target.value})}
                                >
                                    {PIPELINE_GROUPS.map(g => (
                                        <option key={g.id} value={g.id}>{g.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">产线名称</label>
                                <input 
                                    autoFocus 
                                    type="text" 
                                    placeholder="e.g. 供水管网" 
                                    className="w-full text-sm px-2 py-1.5 rounded border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition-all" 
                                    value={newPipeline.label} 
                                    onChange={e => setNewPipeline({...newPipeline, label: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">唯一标识 (ID)</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. WaterNetwork" 
                                    className="w-full text-sm px-2 py-1.5 rounded border border-slate-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none font-mono transition-all" 
                                    value={newPipeline.value} 
                                    onChange={e => setNewPipeline({...newPipeline, value: e.target.value})} 
                                />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1.5 block">颜色标识</label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map(c => (
                                        <button 
                                            key={c}
                                            onClick={() => setNewPipeline({...newPipeline, color: c})}
                                            className={`w-5 h-5 rounded-full bg-${c}-500 transition-all ${newPipeline.color === c ? 'ring-2 ring-offset-1 ring-slate-400 scale-110' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                                        />
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button onClick={() => setIsAddingPipeline(false)} className="flex-1 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded hover:bg-slate-200 transition-colors">取消</button>
                                <button onClick={handleAddPipeline} disabled={!newPipeline.label || !newPipeline.value} className="flex-1 py-1.5 bg-primary-600 text-white text-xs font-bold rounded hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm">添加产线</button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Right: Sub-Pipelines */}
            <div className="flex-1 flex flex-col bg-white">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center h-[57px]">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <GitBranch className="w-4 h-4 text-slate-500"/> 
                        {selectedPipelineId ? `子工序 (${pipelines.find(p=>p.value===selectedPipelineId)?.label})` : '子工序 (Sub-Pipelines)'}
                    </h3>
                    {selectedPipelineId && (
                        <button 
                            onClick={() => setIsAddingSub(true)}
                            className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                        >
                            <Plus className="w-3.5 h-3.5" /> 新增工序
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {!selectedPipelineId ? (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <ArrowRight className="w-8 h-8 mb-2 opacity-20" />
                            <p className="text-sm">请在左侧选择一个产线以配置工序</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {isAddingSub && (
                                <div className="p-3 rounded-lg border border-primary-200 bg-primary-50/30 mb-3 animate-in fade-in slide-in-from-top-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <input autoFocus type="text" placeholder="工序名称" className="flex-1 text-sm px-2 py-1.5 rounded border border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none" value={newSub.label} onChange={e => setNewSub({...newSub, label: e.target.value})} />
                                        <input type="text" placeholder="Value (ID)" className="w-32 text-sm px-2 py-1.5 rounded border border-slate-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none font-mono" value={newSub.value} onChange={e => setNewSub({...newSub, value: e.target.value})} />
                                    </div>
                                    <div className="flex justify-end gap-2">
                                        <button onClick={() => setIsAddingSub(false)} className="text-xs text-slate-500 hover:text-slate-700 font-medium px-2 py-1">取消</button>
                                        <button onClick={handleAddSub} disabled={!newSub.label || !newSub.value} className="bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded hover:bg-primary-700 shadow-sm disabled:opacity-50">保存</button>
                                    </div>
                                </div>
                            )}

                            {currentSubPipelines.map((sp, idx) => (
                                <div key={sp.value} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-100 rounded-lg group hover:border-primary-200 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <span className="bg-white border border-slate-200 text-slate-400 font-mono text-[10px] w-6 h-6 flex items-center justify-center rounded">
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <div className="font-bold text-slate-700 text-sm">{sp.label}</div>
                                            <div className="text-xs text-slate-400 font-mono">{sp.value}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => handleDeleteSub(sp.value)}
                                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {currentSubPipelines.length === 0 && !isAddingSub && (
                                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-xl text-slate-400 text-sm">
                                    该产线暂无工序配置
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Main Component ---

const DictionaryManagement = () => {
    const { dictionary } = useDictionary();
    const [selectedCategory, setSelectedCategory] = useState<string>('pipeline_hierarchy');

    // Dynamically build category list, excluding raw pipeline tables
    const sidebarCategories = useMemo(() => {
        const keys = Object.keys(dictionary).filter(k => k !== 'pipeline' && k !== 'sub_pipeline');
        return ['pipeline_hierarchy', ...keys];
    }, [dictionary]);

    return (
        <div className="h-full flex flex-col relative bg-slate-50">
            <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600 border border-indigo-100">
                        <Book className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 leading-tight">字典管理</h2>
                        <p className="text-xs text-slate-500">全局枚举值与配置参数管理</p>
                    </div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden px-6 pb-6 pt-4 gap-6">
                {/* Left: Category List */}
                <aside className="w-64 glass-panel rounded-xl flex flex-col shrink-0 bg-white">
                    <div className="p-4 border-b border-slate-100">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">字典分类</h3>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="搜索分类..." 
                                className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-primary-100"
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {sidebarCategories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium flex justify-between items-center transition-colors ${
                                    selectedCategory === cat 
                                    ? 'bg-primary-50 text-primary-700' 
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                            >
                                <span className="capitalize truncate">{CATEGORY_LABELS[cat] || cat}</span>
                                {selectedCategory === cat && <ChevronRight className="w-4 h-4" />}
                            </button>
                        ))}
                    </div>
                    <div className="p-3 border-t border-slate-100">
                        <button className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-xs font-bold border border-slate-200 border-dashed flex items-center justify-center gap-2">
                            <Plus className="w-3.5 h-3.5" /> 新增分类
                        </button>
                    </div>
                </aside>

                {/* Right: Dictionary Items or Specialized Editor */}
                <main className="flex-1 glass-panel rounded-xl flex flex-col bg-white overflow-hidden shadow-sm">
                    {selectedCategory === 'pipeline_hierarchy' ? (
                        <PipelineHierarchyEditor />
                    ) : (
                        <GenericDictionaryEditor category={selectedCategory} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default DictionaryManagement;
