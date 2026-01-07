import React, { useState } from 'react';
import { NAVIGATION_MENU } from './constants';
import { ViewType, OperatorTask } from './types';
import { ChevronRight, Map as MapIcon, PanelLeft } from 'lucide-react';
import { DictionaryProvider } from './contexts/DictionaryContext';

// Views - Cockpit
import Dashboard from './views/cockpit/Dashboard';
import Panorama from './views/cockpit/Panorama';

// Views - Supply Chain
import ResourceMarket from './views/supplyChain/ResourceMarket';

// Views - Capabilities
import CapabilitiesCenter from './views/capabilities/CapabilitiesCenter';

// Views - Production Center (New)
import CluePool from './views/production/CluePool';
import PipelineOrchestrator from './views/production/PipelineOrchestrator';
import PipelineTasks from './views/production/PipelineTasks';
import SmartWorkbench from './views/production/SmartWorkbench';

// Views - Quality
import EvaluationTasks from './views/quality/EvaluationTasks';
import AdversarialLab from './views/quality/AdversarialLab';

// Views - Delivery
import ReleaseCalendar from './views/delivery/ReleaseCalendar';
import ProductReleases from './views/delivery/ProductReleases';
import ComponentSnapshots from './views/delivery/ComponentSnapshots';

// Views - Operations
import IssueTracker from './views/operations/IssueTracker';
import HotfixExpress from './views/operations/HotfixExpress';

// Views - System
import IAM from './views/system/IAM';
import FinOps from './views/system/FinOps';
import Security from './views/system/Security';
import DictionaryManagement from './views/system/DictionaryManagement';

interface AppState {
  view: ViewType;
  context?: any;
}

const App: React.FC = () => {
  const [activeState, setActiveState] = useState<AppState>({ view: 'dashboard' });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleNavigate = (view: ViewType, context?: any) => {
      setActiveState({ view, context });
  };
  
  const renderView = () => {
    switch (activeState.view) {
      case 'dashboard': return <Dashboard onNavigate={(view) => handleNavigate(view)} />;
      case 'panorama': return <Panorama />;
      case 'resource-market': return <ResourceMarket />;
      case 'capabilities-center': return <CapabilitiesCenter />;
      
      // Production Center
      case 'clue-pool': return <CluePool />;
      case 'pipeline-orchestrator': return <PipelineOrchestrator />;
      case 'pipeline-tasks': return <PipelineTasks />;
      case 'smart-workbench': return <SmartWorkbench defaultView="packages" />;

      case 'evaluation': return <EvaluationTasks />;
      case 'adversarial': return <AdversarialLab />;
      case 'release-calendar': return <ReleaseCalendar />;
      case 'releases': return <ProductReleases />;
      case 'snapshots': return <ComponentSnapshots />;
      case 'issues': return <IssueTracker />;
      case 'hotfix': return <HotfixExpress />;
      case 'iam': return <IAM />;
      case 'finops': return <FinOps />;
      case 'security': return <Security />;
      case 'dictionary': return <DictionaryManagement />;
      default: return <Dashboard onNavigate={(view) => handleNavigate(view)} />;
    }
  };

  const getActiveLabel = () => {
    for (const menu of NAVIGATION_MENU) {
      if (menu.children) {
        const sub = menu.children.find(c => c.path === activeState.view);
        if (sub) return sub.label;
      }
    }
    return 'Dashboard';
  };

  return (
    <DictionaryProvider>
      <div className="flex h-screen bg-slate-50 text-slate-900 font-sans selection:bg-primary-100 selection:text-primary-700">
        <aside 
          className={`${sidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r border-slate-200 bg-white flex flex-col z-20 shadow-sm`}
        >
          <div className={`h-16 flex items-center border-b border-slate-100 shrink-0 ${sidebarOpen ? 'justify-between px-5' : 'justify-center'}`}>
            {sidebarOpen ? (
              <>
                <div className="flex items-center gap-3 text-primary-600 overflow-hidden whitespace-nowrap">
                  <div className="bg-primary-50 p-1.5 rounded-lg shrink-0">
                      <MapIcon className="w-6 h-6" />
                  </div>
                  <span className="font-bold text-lg tracking-tight text-slate-900 animate-in fade-in duration-300">MapOps</span>
                </div>
                <button 
                  onClick={() => setSidebarOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <PanelLeft className="w-5 h-5" />
                </button>
              </>
            ) : (
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                title="Expand Sidebar"
              >
                <PanelLeft className="w-6 h-6" />
              </button>
            )}
          </div>

          <nav className="flex-1 overflow-y-auto py-6 scrollbar-thin scrollbar-thumb-slate-200">
            <ul className="space-y-6 px-3">
              {NAVIGATION_MENU.map((group, index) => {
                if (!group.children) return null;
                
                return (
                  <li key={group.id}>
                    {sidebarOpen ? (
                       <div className="px-3 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {group.label}
                       </div>
                    ) : (
                       index > 0 && <div className="h-px bg-slate-100 mx-2 my-4"></div>
                    )}

                    <ul className="space-y-1">
                        {group.children.map((item) => {
                          const Icon = item.icon;
                          const isActive = activeState.view === item.path;
                          return (
                            <li key={item.id}>
                              <button
                                onClick={() => item.path && handleNavigate(item.path as ViewType)}
                                title={!sidebarOpen ? item.label : undefined}
                                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group relative ${
                                  isActive
                                    ? 'bg-primary-50 text-primary-700'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                } ${!sidebarOpen ? 'justify-center px-0 py-3' : ''}`}
                              >
                                {Icon && <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isActive ? 'text-primary-600' : 'text-slate-400 group-hover:text-slate-600'}`} />}
                                {sidebarOpen && <span>{item.label}</span>}
                                
                                {/* Active Indicator for Expanded Mode */}
                                {sidebarOpen && isActive && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-primary-600 rounded-r-full" />
                                )}
                              </button>
                            </li>
                          );
                        })}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>

        <main className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
          <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 relative z-50 shadow-sm shrink-0">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-500">MapOps</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
              <span className="text-slate-900 font-semibold">{getActiveLabel()}</span>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-medium text-emerald-700">系统正常</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-sm font-bold text-white shadow-md shadow-primary-200">
                PM
              </div>
            </div>
          </header>

          <div className="flex-1 overflow-auto relative">
            <div className="w-full h-full">
              {renderView()}
            </div>
          </div>
        </main>
      </div>
    </DictionaryProvider>
  );
};

export default App;