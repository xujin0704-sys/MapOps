import React from 'react';
import { MessageSquareWarning, ArrowUpRight, Ticket } from 'lucide-react';

const IssueTracker = () => {
  return (
    <div className="h-full flex flex-col relative bg-slate-50">
       <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 z-10 shadow-sm">
             <div className="flex items-center gap-3">
                <div className="p-2 bg-rose-50 rounded-lg text-rose-600 border border-rose-100">
                    <Ticket className="w-5 h-5" />
                </div>
                <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">工单池</h2>
                    <p className="text-xs text-slate-500">用户反馈与问题分诊</p>
                </div>
             </div>
        </header>

       <div className="flex-1 overflow-hidden px-6 pb-6 pt-4">
           <div className="h-full glass-panel rounded-xl overflow-hidden shadow-sm flex flex-col">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase font-semibold">
                    <tr>
                        <th className="p-4">工单 ID</th>
                        <th className="p-4">上报内容</th>
                        <th className="p-4">AI 预判</th>
                        <th className="p-4">时间</th>
                        <th className="p-4">操作</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-100 bg-white">
                    <tr className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-slate-500 text-sm">#FB-9021</td>
                        <td className="p-4 text-slate-800 font-medium text-sm">第五大道缺失转向限制</td>
                        <td className="p-4">
                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-xs border border-emerald-100 font-medium">有效 (92%)</span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">2小时前</td>
                        <td className="p-4">
                            <button className="flex items-center gap-1 text-primary-600 hover:text-primary-700 hover:underline text-sm font-medium">
                                热修 <ArrowUpRight className="w-3 h-3" />
                            </button>
                        </td>
                    </tr>
                    <tr className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 font-mono text-slate-500 text-sm">#FB-9022</td>
                        <td className="p-4 text-slate-800 font-medium text-sm">POI "Joe's Pizza" 已关闭</td>
                        <td className="p-4">
                            <span className="bg-amber-50 text-amber-700 px-2 py-1 rounded-full text-xs border border-amber-100 font-medium">不确定 (45%)</span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm">4小时前</td>
                        <td className="p-4">
                            <button className="text-slate-500 hover:text-slate-800 text-sm font-medium">核实</button>
                        </td>
                    </tr>
                 </tbody>
              </table>
           </div>
       </div>
    </div>
  );
};

export default IssueTracker;