
import React, { useState } from 'react';
import { DailyLog, FieldIssue, LaborEntry, JHA } from '../types';
import { polishDailyLog } from '../services/openaiService';
import { BookOpen, Sun, Users, Clock, Wand2, Save, Calendar, Loader2, Info, StickyNote, ShieldAlert } from 'lucide-react';

interface DailyLogsProps {
  onSave: (log: DailyLog) => void;
  logs: DailyLog[];
  todayIssues: FieldIssue[];
  todayLabor: LaborEntry[];
  todayJhas: JHA[];
}

const DailyLogs: React.FC<DailyLogsProps> = ({ onSave, logs, todayIssues, todayLabor, todayJhas }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weather, setWeather] = useState('');
  const [temperature, setTemperature] = useState('');
  const [crewSize, setCrewSize] = useState<number>(0);
  const [workNotes, setWorkNotes] = useState('');
  const [delays, setDelays] = useState('');
  
  const [isPolishing, setIsPolishing] = useState(false);

  // Derived Stats for the selected date
  const issuesForDate = todayIssues.filter(i => i.dateCreated.startsWith(date));
  const laborForDate = todayLabor.filter(l => l.date === date);
  const jhasForDate = todayJhas.filter(j => j.dateCreated.startsWith(date));
  
  const totalManpower = laborForDate.reduce((acc, curr) => acc + curr.crewCount, 0);

  const handlePolish = async () => {
    if (!workNotes) return;
    setIsPolishing(true);
    try {
      const polished = await polishDailyLog(workNotes);
      setWorkNotes(polished);
    } catch (e) {
      // fail silently or show toast
    } finally {
      setIsPolishing(false);
    }
  };

  const handleSave = () => {
    if (!date || !workNotes) return;
    const newLog: DailyLog = {
      id: Date.now().toString(),
      date,
      weather,
      temperature,
      crewSize: crewSize || totalManpower, // Use manual or calculated
      workPerformed: workNotes,
      delays,
      status: 'Submitted'
    };
    onSave(newLog);
    // Reset critical fields
    setWorkNotes('');
    setDelays('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Daily Construction Logs</h2>
          <p className="text-gray-500 text-sm">Official project narrative and progress record.</p>
        </div>
      </div>

      {/* Distinction Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-3 text-sm text-blue-800">
         <Info className="w-5 h-5 flex-shrink-0 text-blue-600 mt-0.5" />
         <div>
            <span className="font-bold">Pro Tip:</span> This log is for the "Story of the Day" (general progress). 
            For specific conflicts, defects, or actionable items, use the 
            <span className="font-bold mx-1">Observations / Issues</span> module.
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="lg:col-span-2 space-y-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                 <Calendar className="w-5 h-5 text-accent" />
                 <h3 className="font-semibold text-gray-800">New Log Entry</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <input 
                      type="date" 
                      value={date} 
                      onChange={e => setDate(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                    />
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Crew Size</label>
                    <input 
                      type="number" 
                      value={crewSize || (totalManpower > 0 ? totalManpower : '')} 
                      onChange={e => setCrewSize(parseInt(e.target.value))}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                      placeholder={totalManpower > 0 ? `Auto: ${totalManpower}` : "0"}
                    />
                    {totalManpower > 0 && <div className="text-[10px] text-gray-400 mt-1">Synced from Crew Tracker</div>}
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Weather Condition</label>
                    <select 
                      value={weather}
                      onChange={e => setWeather(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                    >
                       <option value="">Select...</option>
                       <option value="Sunny">Sunny</option>
                       <option value="Cloudy">Cloudy</option>
                       <option value="Rain">Rain</option>
                       <option value="Snow">Snow</option>
                       <option value="Windy">Windy</option>
                    </select>
                 </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Temp (°F)</label>
                    <input 
                      type="text" 
                      value={temperature} 
                      onChange={e => setTemperature(e.target.value)}
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                      placeholder="e.g. 72"
                    />
                 </div>
              </div>

              <div className="mb-4">
                  <div className="flex justify-between items-center mb-1">
                     <label className="block text-sm font-medium text-gray-700">General Work Performed / Progress</label>
                     <button 
                        onClick={handlePolish}
                        disabled={isPolishing || !workNotes}
                        className="text-xs flex items-center gap-1 text-accent hover:text-accent-hover font-medium disabled:opacity-50"
                     >
                        {isPolishing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Wand2 className="w-3 h-3" />}
                        AI Polish
                     </button>
                  </div>
                  <textarea 
                    value={workNotes}
                    onChange={e => setWorkNotes(e.target.value)}
                    className="w-full h-32 p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 leading-relaxed resize-none"
                    placeholder="Describe general progress, areas worked, and milestones reached today..."
                  />
              </div>

              <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Delays / Impacts</label>
                  <input 
                    type="text" 
                    value={delays} 
                    onChange={e => setDelays(e.target.value)}
                    className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                    placeholder="e.g. Rain delay (2 hours), Material shortage"
                  />
              </div>

              <button 
                onClick={handleSave}
                className="w-full bg-primary hover:bg-slate-800 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" /> Submit Log
              </button>
           </div>
        </div>

        {/* Right Col: Stats & History */}
        <div className="lg:col-span-1 space-y-6">
           {/* Site Activity Summary Widget */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
               <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-700 text-sm">Activity on {date}</h3>
               </div>
               <div className="p-4 space-y-3">
                   <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2 text-gray-600">
                           <StickyNote className="w-4 h-4 text-orange-500" /> Issues Raised
                       </div>
                       <span className="font-bold text-gray-900">{issuesForDate.length}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2 text-gray-600">
                           <ShieldAlert className="w-4 h-4 text-red-500" /> JHAs Created
                       </div>
                       <span className="font-bold text-gray-900">{jhasForDate.length}</span>
                   </div>
                   <div className="flex items-center justify-between text-sm">
                       <div className="flex items-center gap-2 text-gray-600">
                           <Users className="w-4 h-4 text-blue-500" /> Subcontractors
                       </div>
                       <span className="font-bold text-gray-900">{laborForDate.length}</span>
                   </div>
                   {issuesForDate.length > 0 && (
                       <div className="mt-3 pt-3 border-t border-gray-100">
                           <p className="text-xs text-gray-400 mb-1">Latest Issue:</p>
                           <p className="text-xs text-gray-800 italic truncate">"{issuesForDate[0].description}"</p>
                       </div>
                   )}
               </div>
           </div>

           {/* History */}
           <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col max-h-[400px]">
              <div className="p-4 border-b border-gray-100 bg-gray-50">
                 <h3 className="font-semibold text-gray-700 text-sm">Log History</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                 {logs.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm py-8">No logs recorded yet.</div>
                 ) : (
                    logs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(log => (
                       <div key={log.id} className="relative pl-4 border-l-2 border-gray-200 pb-4 last:pb-0">
                          <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-accent border-2 border-white"></div>
                          <div className="text-xs font-bold text-gray-500 mb-1">{new Date(log.date).toLocaleDateString()}</div>
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                             <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                                <span className="flex items-center gap-1"><Sun className="w-3 h-3" /> {log.weather}</span>
                                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {log.crewSize}</span>
                             </div>
                             <p className="text-sm text-gray-800 line-clamp-3">{log.workPerformed}</p>
                          </div>
                       </div>
                    ))
                 )}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default DailyLogs;
