import React from 'react';
import { Ghost, Play, Swords } from 'lucide-react';

const AdversarialLab = () => {
  return (
    <div className="h-full flex flex-col relative bg-slate-50">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600 border border-purple-100">
                    <Swords className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">对抗演练</h2>
                    <p className="text-xs text-slate-500">部署 AI Agent 主动寻找地图数据中的边缘案例</p>
                </div>
             </div>
        </header>

        <div className="flex-1 overflow-hidden px-6 pb-6 pt-4 flex flex-col items-center justify-center">
            <div className="max-w-2xl w-full text-center space-y-8">
                <div className="w-20 h-20 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mx-auto ring-4 ring-slate-50 shadow-sm">
                    <Ghost className="w-10 h-10 text-purple-600" />
                </div>
                
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">对抗性虚拟 Agent</h2>
                    <p className="text-slate-500">
                        主动寻找地图数据中的边缘案例（如死循环路由、不可能的转向）。
                    </p>
                </div>

                <div className="glass-panel p-8 rounded-xl text-left space-y-6 shadow-md bg-white">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">演练配置</h3>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">Agent 数量</label>
                            <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none" defaultValue={50} />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-semibold block mb-1.5">策略</label>
                            <select className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-slate-900 focus:ring-2 focus:ring-purple-100 focus:border-purple-500 outline-none">
                                <option>随机游走</option>
                                <option>启发式攻击</option>
                                <option>边界压力测试</option>
                            </select>
                        </div>
                    </div>
                    <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg shadow-purple-200">
                        <Play className="w-4 h-4" /> 释放 Agents
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};

export default AdversarialLab;