
import React, { useState } from 'react';
import { RFI, Submittal, ViewState, DailyLog, JHA, Priority } from '../types';
import { FileText, ClipboardCheck, AlertCircle, Clock, Calendar, Briefcase, ShieldAlert, BookOpen, Search, Copy } from 'lucide-react';

interface DashboardProps {
  rfis: RFI[];
  submittals: Submittal[];
  logs: DailyLog[];
  jhas: JHA[];
  changeView: (view: ViewState) => void;
  onDuplicate: (rfi: RFI) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ rfis, submittals, logs, jhas, changeView, onDuplicate }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const isOverdue = (dateStr?: string) => {
    if (!dateStr) return false;
    // Check if date is in the past and not today
    const d = new Date(dateStr);
    const now = new Date();
    return d < now && d.toDateString() !== now.toDateString();
  };

  // Filter Logic
  const filteredRFIs = rfis.filter(item => 
    item.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.drawingRef && item.drawingRef.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.specRef && item.specRef.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredSubmittals = submittals.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.specSection && item.specSection.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (item.trade && item.trade.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Stats derived from filtered lists
  // Urgent includes High or Critical
  const urgentRFIs = filteredRFIs.filter(r => r.priority === Priority.CRITICAL || r.priority === Priority.HIGH).length;
  const overdueRFIs = filteredRFIs.filter(r => isOverdue(r.dueDate)).length;
  
  const pendingSubmittals = filteredSubmittals.filter(s => s.status === 'For Review' || s.status === 'Pending').length;
  const todaysLog = logs.find(l => l.date === new Date().toISOString().split('T')[0]);
  
  const getPriorityBadgeClass = (priority: string) => {
    switch(priority) {
      case Priority.CRITICAL: return 'bg-red-100 text-red-700 border-red-200';
      case Priority.HIGH: return 'bg-orange-100 text-orange-700 border-orange-200';
      case Priority.LOW: return 'bg-slate-100 text-slate-600 border-slate-200';
      default: return 'bg-blue-50 text-blue-600 border-blue-200'; // Medium
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
           <h2 className="text-3xl font-bold text-gray-900">Project Overview</h2>
           <p className="text-gray-500 mt-1">Site Command Center • Local Storage Active</p>
        </div>
        
        <div className="flex flex-col md:items-end gap-3 w-full md:w-auto">
           {/* Search Bar */}
           <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search RFIs & Submittals..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-accent shadow-sm transition-shadow"
              />
           </div>
           
           <div className="flex items-center gap-2 text-xs text-gray-500">
             <Calendar className="w-3 h-3" />
             {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
             <span className="hidden md:inline">•</span>
             <span className="hidden md:inline">{logs.length} Total Logs</span>
           </div>
        </div>
      </header>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* RFI Card */}
        <div 
            onClick={() => changeView(ViewState.RFI_DRAFT)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 rounded-lg group-hover:bg-blue-100 transition-colors">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{filteredRFIs.length}</span>
          </div>
          <h3 className="font-semibold text-gray-700">RFIs {searchTerm ? 'Found' : 'Drafted'}</h3>
          <div className="flex items-center flex-wrap gap-x-2 text-xs mt-1">
             <span className="text-gray-500">{urgentRFIs} High Priority</span>
             {overdueRFIs > 0 && (
                <span className="font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded border border-red-100">
                   {overdueRFIs} Overdue
                </span>
             )}
          </div>
          {overdueRFIs > 0 && <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full m-2 animate-pulse" />}
        </div>

        {/* Submittal Card */}
        <div 
            onClick={() => changeView(ViewState.SUBMITTAL_REVIEW)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 rounded-lg group-hover:bg-emerald-100 transition-colors">
              <ClipboardCheck className="w-6 h-6 text-emerald-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{filteredSubmittals.length}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Submittals {searchTerm ? 'Found' : ''}</h3>
          <p className="text-xs text-gray-500 mt-1">{pendingSubmittals} Pending</p>
        </div>

        {/* Daily Log Card */}
        <div 
            onClick={() => changeView(ViewState.DAILY_LOGS)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-orange-50 rounded-lg group-hover:bg-orange-100 transition-colors">
              <BookOpen className="w-6 h-6 text-orange-600" />
            </div>
            <span className={`text-2xl font-bold ${todaysLog ? 'text-green-600' : 'text-gray-400'}`}>
                {todaysLog ? 'Done' : '-'}
            </span>
          </div>
          <h3 className="font-semibold text-gray-700">Daily Log</h3>
          <p className="text-xs text-gray-500 mt-1">{todaysLog ? 'Submitted Today' : 'Pending Entry'}</p>
        </div>

         {/* Safety Card */}
         <div 
            onClick={() => changeView(ViewState.SAFETY_ASSISTANT)}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 cursor-pointer hover:shadow-md transition-shadow group"
        >
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-50 rounded-lg group-hover:bg-red-100 transition-colors">
              <ShieldAlert className="w-6 h-6 text-red-600" />
            </div>
            <span className="text-2xl font-bold text-gray-900">{jhas.length}</span>
          </div>
          <h3 className="font-semibold text-gray-700">Safety Plans</h3>
          <p className="text-xs text-gray-500 mt-1">JHA Generator Active</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col - Task List */}
        <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800">
                      {searchTerm ? 'Search Results' : 'Open Items'}
                    </h3>
                    {searchTerm && (
                      <span className="text-xs text-gray-500">
                        Showing {filteredRFIs.length + filteredSubmittals.length} results
                      </span>
                    )}
                </div>
                <div className="divide-y divide-gray-100">
                    {/* Combine RFIs and Submittals into a single activity feed for density */}
                    {[...filteredRFIs, ...filteredSubmittals]
                        .sort((a, b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime())
                        .slice(0, searchTerm ? 20 : 5) // Show more items when searching
                        .map((item: any) => {
                            const isRFI = 'subject' in item;
                            const itemIsOverdue = isOverdue(item.dueDate);
                            
                            return (
                                <div 
                                  key={item.id} 
                                  className={`p-4 hover:bg-gray-50 transition-colors flex items-start gap-3 ${itemIsOverdue ? 'bg-red-50/40' : ''}`}
                                >
                                    <div className={`mt-1 min-w-[4px] h-8 rounded-full ${isRFI ? 'bg-blue-500' : 'bg-emerald-500'}`}></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center">
                                            <div className="flex items-center gap-2">
                                              <h4 className="font-medium text-gray-900 text-sm">
                                                  {isRFI ? `RFI: ${item.subject}` : `Submittal: ${item.title}`}
                                              </h4>
                                              {isRFI && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded border font-bold uppercase ${getPriorityBadgeClass(item.priority)}`}>
                                                  {item.priority}
                                                </span>
                                              )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                              {item.dueDate && itemIsOverdue && (
                                                  <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold border border-red-200 shadow-sm flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> OVERDUE
                                                  </span>
                                              )}
                                              {/* Duplicate Action for RFI */}
                                              {isRFI && (
                                                <button 
                                                  onClick={(e) => {
                                                     e.stopPropagation();
                                                     onDuplicate(item as RFI);
                                                  }}
                                                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                  title="Duplicate RFI"
                                                >
                                                  <Copy className="w-4 h-4" />
                                                </button>
                                              )}
                                            </div>
                                        </div>
                                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                            {isRFI ? item.question : item.specSection}
                                        </p>
                                    </div>
                                    <div className="text-xs text-gray-400 whitespace-nowrap">
                                        {new Date(item.dateCreated).toLocaleDateString()}
                                    </div>
                                </div>
                            )
                        })
                    }
                    {filteredRFIs.length === 0 && filteredSubmittals.length === 0 && (
                        <div className="p-8 text-center text-gray-400 text-sm">
                          {searchTerm ? `No results found for "${searchTerm}"` : "No active items."}
                        </div>
                    )}
                </div>
            </div>
        </div>

        {/* Right Col - Quick Actions & Status */}
        <div className="space-y-6">
            <div className="bg-gradient-to-br from-primary to-slate-800 p-6 rounded-xl shadow-lg text-white">
                <div className="flex items-center gap-2 mb-4">
                    <AlertCircle className="w-5 h-5 text-accent" />
                    <h3 className="font-semibold">Quick Launch</h3>
                </div>
                <div className="space-y-3">
                    <button 
                        onClick={() => changeView(ViewState.SAFETY_ASSISTANT)}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors flex items-center gap-2"
                    >
                        <ShieldAlert className="w-4 h-4 text-red-400" /> New Safety JHA
                    </button>
                    <button 
                        onClick={() => changeView(ViewState.DAILY_LOGS)}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors flex items-center gap-2"
                    >
                        <BookOpen className="w-4 h-4 text-orange-400" /> Log Daily Entry
                    </button>
                    <button 
                        onClick={() => changeView(ViewState.RFI_DRAFT)}
                        className="w-full text-left px-3 py-2 bg-white/10 hover:bg-white/20 rounded text-sm transition-colors flex items-center gap-2"
                    >
                        <FileText className="w-4 h-4 text-blue-400" /> Draft RFI
                    </button>
                </div>
            </div>
            
            {/* Recent Logs Snippet */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h4 className="font-bold text-gray-800 text-sm mb-3">Recent Logs</h4>
                <div className="space-y-3">
                    {logs.slice(0, 3).map(log => (
                        <div key={log.id} className="text-xs border-l-2 border-gray-200 pl-3">
                            <span className="font-semibold text-gray-700">{new Date(log.date).toLocaleDateString()}</span>
                            <p className="text-gray-500 line-clamp-1">{log.workPerformed}</p>
                        </div>
                    ))}
                    {logs.length === 0 && <span className="text-xs text-gray-400">No logs yet.</span>}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
