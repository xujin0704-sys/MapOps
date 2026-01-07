import React, { useState, useRef, useEffect } from 'react';
import { 
    Upload, 
    Play, 
    Save, 
    MousePointer2, 
    Type, 
    BoxSelect, 
    Loader2, 
    Plus, 
    Minus, 
    RefreshCw, 
    Settings,
    Image as ImageIcon,
    Trash2,
    Palette,
    X,
    Eraser,
    Layers
} from 'lucide-react';

// --- Mock Data ---

const MOCK_SAMPLES = [
    { id: 'S01', name: '光伏板屋顶', thumbnailUrl: 'https://images.unsplash.com/photo-1617634795446-42ee6385501b?q=80&w=200&h=120&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1617634795446-42ee6385501b?q=80&w=2070&auto=format=fit=crop', hasGroundTruth: true },
    { id: 'S02', name: '城市道路交叉口', thumbnailUrl: 'https://images.unsplash.com/photo-1541560052-774232d37791?q=80&w=200&h=120&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1541560052-774232d37791?q=80&w=1974&auto=format=fit=crop', hasGroundTruth: true },
    { id: 'S03', name: '水体区域', thumbnailUrl: 'https://images.unsplash.com/photo-1552535438-96499a19c506?q=80&w=200&h=120&fit=crop', imageUrl: 'https://images.unsplash.com/photo-1552535438-96499a19c506?q=80&w=2072&auto=format=fit=crop', hasGroundTruth: false },
];

// --- Types ---

type PromptType = 'point' | 'box' | 'scribble';

interface PointPrompt {
    id: string;
    x: number;
    y: number;
    label: 1 | 0; // 1 for positive, 0 for negative
}

interface BoxPrompt {
    id: string;
    x: number;
    y: number;
    w: number;
    h: number;
}

interface ScribblePrompt {
    id: string;
    points: {x: number, y: number}[];
}

// --- Sub-Components ---

const SaveCapabilityModal = ({ onSave, onCancel }: { onSave: (name: string) => void, onCancel: () => void }) => {
    const [name, setName] = useState('光伏板提取器 v1');
    return (
        <div className="absolute inset-0 bg-slate-900/40 z-50 flex items-center justify-center animate-in fade-in-25">
            <div className="bg-white rounded-xl shadow-2xl w-96 p-6 animate-in zoom-in-95">
                <h3 className="text-lg font-bold text-slate-900">保存为新能力</h3>
                <p className="text-sm text-slate-500 mt-1 mb-4">该配置将作为 Adapter 保存到能力中心。</p>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase block mb-1">能力名称</label>
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm text-slate-900 focus:ring-2 focus:ring-primary-100 outline-none" 
                    />
                </div>
                <div className="flex justify-end gap-3 mt-6">
                    <button onClick={onCancel} className="px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-bold rounded-lg border border-slate-200">取消</button>
                    <button onClick={() => onSave(name)} className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-bold rounded-lg">保存</button>
                </div>
            </div>
        </div>
    );
};

const PromptLab = () => {
  const [activeSample, setActiveSample] = useState(MOCK_SAMPLES[0]);
  const [activeTool, setActiveTool] = useState<PromptType>('point');
  
  // Prompts State
  const [points, setPoints] = useState<PointPrompt[]>([]);
  const [box, setBox] = useState<BoxPrompt | null>(null);
  const [scribbles, setScribbles] = useState<ScribblePrompt[]>([]);
  
  // Config State
  const [model, setModel] = useState('SAM 2 (Huge)');
  const [textPrompt, setTextPrompt] = useState('');
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.85);

  // Interaction State
  const [isDrawing, setIsDrawing] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  
  // Result State
  const [isLoading, setIsLoading] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Reset when sample changes
  useEffect(() => {
    resetAllPrompts();
  }, [activeSample]);

  const resetAllPrompts = () => {
    setPoints([]);
    setBox(null);
    setScribbles([]);
    setHasResult(false);
  };

  // --- Interaction Handlers ---

  const getRelativeCoords = (e: React.MouseEvent) => {
      if (!containerRef.current) return { x: 0, y: 0 };
      const rect = containerRef.current.getBoundingClientRect();
      return {
          x: Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width)),
          y: Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
      };
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const { x, y } = getRelativeCoords(e);
    setHasResult(false); // Clear previous result on new interaction

    if (activeTool === 'point') {
        // Points are handled on Click/MouseUp to differentiate from drag, but for simplicity we can use click.
        // Or handle here if we want immediate feedback.
        // Let's rely on onClick for points to handle context menu properly.
        return;
    }

    setIsDrawing(true);
    setDragStart({ x, y });

    if (activeTool === 'box') {
        // Start a new box (replacing old one for this demo version)
        setBox({ id: Date.now().toString(), x, y, w: 0, h: 0 });
    } else if (activeTool === 'scribble') {
        setScribbles(prev => [...prev, { id: Date.now().toString(), points: [{ x, y }] }]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !dragStart) return;
    const { x, y } = getRelativeCoords(e);

    if (activeTool === 'box') {
        setBox(prev => prev ? {
            ...prev,
            x: Math.min(dragStart.x, x),
            y: Math.min(dragStart.y, y),
            w: Math.abs(x - dragStart.x),
            h: Math.abs(y - dragStart.y)
        } : null);
    } else if (activeTool === 'scribble') {
        setScribbles(prev => {
            const newScribbles = [...prev];
            const current = newScribbles[newScribbles.length - 1];
            if (current) {
                current.points.push({ x, y });
            }
            return newScribbles;
        });
    }
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setDragStart(null);
  };

  const handleMouseLeave = () => {
      if (isDrawing) {
          setIsDrawing(false);
          setDragStart(null);
      }
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (activeTool !== 'point') return;
    e.preventDefault(); // Prevent context menu
    const { x, y } = getRelativeCoords(e);
    
    // Left click = 1 (Positive), Right click = 0 (Negative)
    const label = e.button === 2 ? 0 : 1;
    
    setPoints(prev => [...prev, { id: Date.now().toString(), x, y, label }]);
    setHasResult(false);
  };

  const deletePrompt = (type: PromptType, id?: string) => {
      if (type === 'point' && id) {
          setPoints(prev => prev.filter(p => p.id !== id));
      } else if (type === 'box') {
          setBox(null);
      } else if (type === 'scribble' && id) {
          setScribbles(prev => prev.filter(s => s.id !== id));
      }
      setHasResult(false);
  };

  const runInference = () => {
    if (points.length === 0 && !box && scribbles.length === 0 && !textPrompt) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setHasResult(true);
    }, 1200);
  };

  const handleSave = (name: string) => {
      console.log(`Saving capability: ${name}`);
      setIsSaveModalOpen(false);
  };

  return (
    <div className="h-full flex flex-col relative pt-4">
       {isSaveModalOpen && <SaveCapabilityModal onSave={handleSave} onCancel={() => setIsSaveModalOpen(false)} />}
       
       <div className="flex-1 flex gap-6 min-h-0">
          {/* Left: Samples */}
          <aside className="w-64 glass-panel p-4 rounded-xl flex flex-col shrink-0">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">黄金样本集</h3>
              <div className="flex-1 space-y-2 overflow-y-auto -mr-2 pr-2">
                 {MOCK_SAMPLES.map(sample => (
                     <div 
                        key={sample.id}
                        onClick={() => setActiveSample(sample)}
                        className={`p-2 rounded-lg flex items-center gap-3 cursor-pointer border-2 transition-all ${
                            activeSample.id === sample.id ? 'bg-primary-50 border-primary-200' : 'bg-white border-transparent hover:border-slate-200'
                        }`}
                     >
                        <img src={sample.thumbnailUrl} alt={sample.name} className="w-16 h-10 rounded object-cover flex-shrink-0" />
                        <span className="text-xs font-bold text-slate-700 leading-tight">{sample.name}</span>
                     </div>
                 ))}
              </div>
              <button className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-sm font-medium rounded-md border border-slate-200">
                  <Upload className="w-4 h-4" /> 上传样本
              </button>
          </aside>

          {/* Middle: Canvas */}
          <main className="flex-1 flex flex-col min-h-0 relative bg-slate-100 rounded-xl border border-slate-200 overflow-hidden">
            {/* Toolbar Overlay */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <div className="bg-white/95 backdrop-blur p-1.5 rounded-lg border border-slate-200 shadow-md flex gap-1">
                    {[
                        { type: 'point', icon: MousePointer2, title: '点提示 (左键正/右键负)' },
                        { type: 'box', icon: BoxSelect, title: '框提示 (拖拽)' },
                        { type: 'scribble', icon: Palette, title: '涂抹提示 (拖拽)' }
                    ].map(tool => (
                        <button 
                            key={tool.type} 
                            onClick={() => setActiveTool(tool.type as any)} 
                            className={`p-2 rounded-md transition-colors ${activeTool === tool.type ? 'bg-primary-50 text-primary-600 shadow-inner' : 'text-slate-500 hover:bg-slate-100'}`} 
                            title={tool.title}
                        >
                            <tool.icon className="w-5 h-5" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Inference Status Overlay */}
            {hasResult && activeSample.hasGroundTruth && (
                 <div className="absolute top-4 right-4 z-20 bg-white/90 backdrop-blur px-4 py-2 rounded-lg border border-slate-200 shadow-md flex items-center gap-4 animate-in slide-in-from-top-2">
                     <div>
                        <span className="text-xs font-bold text-slate-500 block">IoU Score</span>
                        <span className="text-lg font-bold text-emerald-600">0.92</span>
                     </div>
                     <div className="h-8 w-px bg-slate-200"></div>
                     <div>
                        <span className="text-xs font-bold text-slate-500 block">Inference</span>
                        <span className="text-lg font-bold text-slate-800">120ms</span>
                     </div>
                 </div>
            )}

            {/* Interactive Area */}
            <div 
                className="flex-1 relative flex items-center justify-center bg-slate-200/50 cursor-crosshair overflow-hidden select-none"
                ref={containerRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                onClick={handleCanvasClick}
                onContextMenu={(e) => { e.preventDefault(); handleCanvasClick(e); }} // Right click for negative points
            >
                <img 
                    src={activeSample.imageUrl} 
                    alt={activeSample.name} 
                    className="max-w-full max-h-full object-contain pointer-events-none shadow-2xl rounded-md" 
                />
                
                {/* Visual Layer: Prompts */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* 1. Box */}
                    {box && (
                        <div 
                            className="absolute border-2 border-blue-500 bg-blue-500/10"
                            style={{ 
                                left: `${box.x * 100}%`, 
                                top: `${box.y * 100}%`, 
                                width: `${box.w * 100}%`, 
                                height: `${box.h * 100}%` 
                            }}
                        >
                            <div className="absolute -top-6 left-0 bg-blue-500 text-white text-[10px] px-1.5 rounded font-bold">Box</div>
                        </div>
                    )}

                    {/* 2. Scribbles */}
                    <svg className="absolute inset-0 w-full h-full">
                        {scribbles.map((scribble) => (
                            <polyline 
                                key={scribble.id}
                                points={scribble.points.map(p => `${p.x * 100}%,${p.y * 100}%`).join(' ')} 
                                className="fill-none stroke-amber-500 opacity-80" 
                                strokeWidth="4" 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                            />
                        ))}
                    </svg>

                    {/* 3. Points */}
                    {points.map((p) => (
                        <div 
                            key={p.id} 
                            className={`absolute w-4 h-4 -ml-2 -mt-2 rounded-full border-2 border-white shadow-md flex items-center justify-center z-10 transition-transform hover:scale-125 ${p.label === 1 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                            style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%` }}
                        >
                            {p.label === 1 ? <Plus className="w-2.5 h-2.5 text-white" /> : <Minus className="w-2.5 h-2.5 text-white" />}
                        </div>
                    ))}
                </div>

                {/* Visual Layer: Results */}
                {hasResult && (
                    <div className="absolute inset-0 pointer-events-none animate-in fade-in duration-700">
                        {/* Mock Segmentation Mask */}
                        <div className="absolute inset-0 bg-indigo-500/20 mix-blend-multiply" style={{ clipPath: 'polygon(20% 20%, 80% 25%, 75% 75%, 25% 80%)' }}></div>
                        <div className="absolute inset-0 bg-indigo-500/10 mix-blend-multiply" style={{ clipPath: 'polygon(10% 10%, 40% 15%, 35% 45%, 15% 40%)' }}></div>
                        {/* Mock Heatmap overlay effect */}
                        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(circle at 50% 50%, rgba(99, 102, 241, 0.8) 0%, transparent 60%)' }}></div>
                    </div>
                )}
                
                {/* Loading State */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white/20 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
                        <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-2" />
                        <span className="text-primary-700 font-bold text-sm bg-white/80 px-3 py-1 rounded-full">正在推理 (Inference)...</span>
                    </div>
                )}
            </div>
          </main>

          {/* Right: Config & Management */}
          <aside className="w-80 glass-panel flex flex-col rounded-xl overflow-hidden shrink-0">
              <div className="p-5 border-b border-slate-100 flex-1 overflow-y-auto">
                  <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Settings className="w-4 h-4 text-slate-500"/> 配置与参数
                  </h3>
                  <div className="space-y-5">
                      <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">基座模型</label>
                          <select 
                            value={model}
                            onChange={e => setModel(e.target.value)}
                            className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-sm outline-none focus:border-primary-500 transition-colors"
                          >
                              <option>SAM 2 (Huge)</option>
                              <option>SAM 2 (Large)</option>
                              <option>SAM 2 (Mobile)</option>
                          </select>
                      </div>
                       <div>
                          <label className="text-xs font-bold text-slate-500 uppercase mb-1.5 block">文本提示 (Optional)</label>
                          <div className="relative">
                              <input 
                                type="text" 
                                value={textPrompt}
                                onChange={e => setTextPrompt(e.target.value)}
                                placeholder="e.g., solar panel" 
                                className="w-full bg-white border border-slate-300 rounded-lg pl-3 pr-8 py-2.5 text-sm outline-none focus:border-primary-500 transition-colors" 
                              />
                              <Type className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                          </div>
                       </div>
                      <div>
                          <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase mb-1.5">
                              <span>置信度阈值</span>
                              <span className="font-mono text-slate-800">{confidenceThreshold}</span>
                          </div>
                          <input 
                            type="range" 
                            min="0" max="1" step="0.05" 
                            value={confidenceThreshold}
                            onChange={e => setConfidenceThreshold(parseFloat(e.target.value))}
                            className="w-full accent-primary-600 h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer" 
                          />
                      </div>
                  </div>

                  <div className="mt-8">
                      <div className="flex justify-between items-center mb-3">
                          <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                              <Layers className="w-3 h-3"/> 当前提示 ({points.length + (box ? 1 : 0) + scribbles.length})
                          </h3>
                          {(points.length > 0 || box || scribbles.length > 0) && (
                              <button onClick={resetAllPrompts} className="text-[10px] text-rose-500 hover:text-rose-700 flex items-center gap-1 font-bold">
                                  <Eraser className="w-3 h-3" /> 清空
                              </button>
                          )}
                      </div>
                      
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                          {box && (
                              <div className="flex items-center justify-between p-2 bg-blue-50 border border-blue-100 rounded-lg text-xs group">
                                  <div className="flex items-center gap-2 text-blue-700 font-medium">
                                      <BoxSelect className="w-3 h-3" /> Box Prompt
                                  </div>
                                  <button onClick={() => deletePrompt('box')} className="text-blue-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                              </div>
                          )}
                          {points.map((p, i) => (
                              <div key={p.id} className={`flex items-center justify-between p-2 border rounded-lg text-xs group ${p.label === 1 ? 'bg-emerald-50 border-emerald-100 text-emerald-700' : 'bg-rose-50 border-rose-100 text-rose-700'}`}>
                                  <div className="flex items-center gap-2 font-medium">
                                      <MousePointer2 className="w-3 h-3" /> Point {i + 1} ({p.label === 1 ? 'Pos' : 'Neg'})
                                  </div>
                                  <button onClick={() => deletePrompt('point', p.id)} className="opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                              </div>
                          ))}
                          {scribbles.map((s, i) => (
                              <div key={s.id} className="flex items-center justify-between p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs group">
                                  <div className="flex items-center gap-2 text-amber-700 font-medium">
                                      <Palette className="w-3 h-3" /> Scribble {i + 1}
                                  </div>
                                  <button onClick={() => deletePrompt('scribble', s.id)} className="text-amber-400 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3"/></button>
                              </div>
                          ))}
                          
                          {points.length === 0 && !box && scribbles.length === 0 && (
                              <div className="text-center py-4 text-xs text-slate-400 border border-dashed border-slate-200 rounded-lg">
                                  在画布上添加提示以开始
                              </div>
                          )}
                      </div>
                  </div>
              </div>
              
              <div className="p-5 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                  <div className="flex justify-between text-xs text-slate-500 mb-1">
                      <span>预测数量</span>
                      <span className="font-bold text-slate-900">{hasResult ? '12 Objects' : '-'}</span>
                  </div>
                  <button 
                    onClick={runInference} 
                    disabled={isLoading || (points.length === 0 && !box && scribbles.length === 0 && !textPrompt)} 
                    className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-md ${
                        isLoading || (points.length === 0 && !box && scribbles.length === 0 && !textPrompt)
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none' 
                        : 'bg-primary-600 hover:bg-primary-700 text-white active:scale-95 shadow-primary-200'
                    }`}
                  >
                      {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> 正在推理...</> : <><Play className="w-5 h-5" /> 运行推理</>}
                  </button>
                  <button onClick={() => setIsSaveModalOpen(true)} disabled={!hasResult} className="w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all shadow-sm bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 hover:text-emerald-700 hover:border-emerald-200 disabled:opacity-50 disabled:cursor-not-allowed">
                      <Save className="w-4 h-4" /> 保存为能力
                  </button>
              </div>
          </aside>
       </div>
    </div>
  );
};

export default PromptLab;