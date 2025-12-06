
import React from 'react';
import { LayoutDashboard, FileText, ClipboardCheck, HardHat, X, ShieldAlert, BookOpen, CheckSquare, Users, Truck, StickyNote, Briefcase, ChevronRight, ClipboardList, Hammer } from 'lucide-react';
import { ViewState, Project } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  activeProject: Project | null;
  onManageProjects: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, isOpen, onClose, activeProject, onManageProjects }) => {
  // Reordered based on High Value / Frequency of Use
  const navItems = [
    { id: ViewState.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: ViewState.RFI_DRAFT, label: 'RFI Drafter', icon: FileText },
    { id: ViewState.SUBMITTAL_REVIEW, label: 'Submittals', icon: ClipboardCheck },
    { id: ViewState.FIELD_ISSUES, label: 'Observations / Issues', icon: StickyNote },
    { id: ViewState.DAILY_LOGS, label: 'Daily Logs', icon: BookOpen },
    { id: ViewState.INSPECTION_MANAGER, label: 'Inspections', icon: ClipboardList },
    { id: ViewState.PUNCH_LIST, label: 'Punch List', icon: CheckSquare },
    { id: ViewState.SAFETY_ASSISTANT, label: 'Safety (JHA)', icon: ShieldAlert },
    { id: ViewState.TOOLBOX_TALKS, label: 'Toolbox Talks', icon: Users },
    { id: ViewState.LABOR_TRACKER, label: 'Crew Tracker', icon: HardHat },
    { id: ViewState.MATERIAL_TRACKER, label: 'Deliveries', icon: Truck },
    { id: ViewState.EQUIPMENT_TRACKER, label: 'Equipment', icon: Hammer },
  ];

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity print:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed inset-y-0 left-0 z-30 w-64 bg-primary text-white h-screen flex flex-col shadow-xl 
        transform transition-transform duration-300 ease-in-out print:hidden
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
        md:translate-x-0
      `}>
        {/* Project Switcher Header */}
        <div className="p-4 border-b border-gray-800">
           <button 
             onClick={() => {
                 onManageProjects();
                 onClose();
             }}
             className="w-full text-left group p-2 rounded-lg hover:bg-white/5 transition-colors"
           >
              <div className="flex items-center gap-3">
                <div className="bg-accent p-2 rounded-lg shadow-lg shadow-accent/20">
                  <HardHat className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="font-bold text-sm tracking-tight truncate text-white">
                      SiteLink AI
                  </h1>
                  <p className="text-xs text-gray-400 truncate flex items-center gap-1 group-hover:text-accent transition-colors">
                      {activeProject ? activeProject.name : 'Select Project'}
                      <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                </div>
              </div>
           </button>
           
          {/* Mobile Close Button */}
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 md:hidden text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <div className="mb-2 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Project Tools
          </div>
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setView(item.id);
                  onClose(); // Close sidebar on mobile when item clicked
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-6 border-t border-gray-800">
          <button 
             onClick={() => {
                 onManageProjects();
                 onClose();
             }}
             className="flex items-center gap-2 text-xs text-gray-500 hover:text-white transition-colors"
          >
             <Briefcase className="w-3 h-3" /> Manage Projects
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
