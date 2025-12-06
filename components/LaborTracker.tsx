
import React, { useState } from 'react';
import { LaborEntry } from '../types';
import { Users, Clock, Plus, Trash2, Calendar } from 'lucide-react';

interface LaborTrackerProps {
  entries: LaborEntry[];
  onSave: (entry: LaborEntry) => void;
  onDelete: (id: string) => void;
}

const LaborTracker: React.FC<LaborTrackerProps> = ({ entries, onSave, onDelete }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subcontractor, setSubcontractor] = useState('');
  const [crewCount, setCrewCount] = useState<number | ''>('');
  const [hours, setHours] = useState<number | ''>('');
  const [notes, setNotes] = useState('');

  const handleSave = () => {
    if (!subcontractor || !crewCount || !hours) return;
    const newEntry: LaborEntry = {
      id: Date.now().toString(),
      date,
      subcontractor,
      crewCount: Number(crewCount),
      hoursWorked: Number(hours),
      notes
    };
    onSave(newEntry);
    setSubcontractor('');
    setCrewCount('');
    setHours('');
    setNotes('');
  };

  const selectedDateEntries = entries.filter(e => e.date === date);
  const totalPeople = selectedDateEntries.reduce((acc, curr) => acc + curr.crewCount, 0);
  const totalHours = selectedDateEntries.reduce((acc, curr) => acc + curr.hoursWorked, 0);

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Crew & Labor Tracker</h2>
          <p className="text-gray-500 text-sm">Track manpower counts and hours by subcontractor.</p>
        </div>
        <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200">
           <Calendar className="w-4 h-4 text-gray-400 ml-2" />
           <input 
             type="date" 
             value={date}
             onChange={(e) => setDate(e.target.value)}
             className="text-sm border-none focus:ring-0 text-gray-700 bg-transparent"
           />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Headcount</div>
            <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               {totalPeople} <Users className="w-5 h-5 text-blue-500" />
            </div>
         </div>
         <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Hours</div>
            <div className="text-2xl font-bold text-gray-900 flex items-center gap-2">
               {totalHours} <Clock className="w-5 h-5 text-orange-500" />
            </div>
         </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
         <h3 className="font-semibold text-gray-800 mb-3 text-sm">Add Crew Entry</h3>
         <div className="flex flex-col md:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
               <label className="block text-xs font-medium text-gray-700 mb-1">Subcontractor</label>
               <input 
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 placeholder="e.g. Acme Electric"
                 value={subcontractor}
                 onChange={e => setSubcontractor(e.target.value)}
               />
            </div>
            <div className="w-full md:w-32">
               <label className="block text-xs font-medium text-gray-700 mb-1">Crew Count</label>
               <input 
                 type="number"
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 placeholder="0"
                 value={crewCount}
                 onChange={e => setCrewCount(e.target.value === '' ? '' : Number(e.target.value))}
               />
            </div>
            <div className="w-full md:w-32">
               <label className="block text-xs font-medium text-gray-700 mb-1">Total Hours</label>
               <input 
                 type="number"
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 placeholder="0"
                 value={hours}
                 onChange={e => setHours(e.target.value === '' ? '' : Number(e.target.value))}
               />
            </div>
            <button 
              onClick={handleSave}
              className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors h-[38px] w-full md:w-auto justify-center"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
         </div>
      </div>

      {/* List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
         <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            <div className="col-span-6 md:col-span-5">Subcontractor</div>
            <div className="col-span-2 md:col-span-2 text-center">Crew</div>
            <div className="col-span-2 md:col-span-2 text-center">Hours</div>
            <div className="col-span-2 md:col-span-3 text-right">Actions</div>
         </div>
         <div className="divide-y divide-gray-100">
            {selectedDateEntries.length === 0 ? (
               <div className="p-8 text-center text-gray-400 text-sm">No entries for this date.</div>
            ) : (
               selectedDateEntries.map(entry => (
                  <div key={entry.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                     <div className="col-span-6 md:col-span-5 font-medium text-gray-900">{entry.subcontractor}</div>
                     <div className="col-span-2 md:col-span-2 text-center text-gray-700">{entry.crewCount}</div>
                     <div className="col-span-2 md:col-span-2 text-center text-gray-700">{entry.hoursWorked}</div>
                     <div className="col-span-2 md:col-span-3 text-right">
                        <button 
                          onClick={() => onDelete(entry.id)}
                          className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
               ))
            )}
         </div>
      </div>
    </div>
  );
};

export default LaborTracker;
