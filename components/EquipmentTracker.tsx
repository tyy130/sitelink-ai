
import React, { useState } from 'react';
import { EquipmentItem, MaintenancePredictionResponse } from '../types';
import { predictMaintenance } from '../services/geminiService';
import { Hammer, Plus, Clock, AlertTriangle, CheckCircle, Trash2, Loader2, Sparkles, Wrench } from 'lucide-react';

interface EquipmentTrackerProps {
  equipment: EquipmentItem[];
  onSave: (item: EquipmentItem) => void;
  onUpdate: (id: string, updates: Partial<EquipmentItem>) => void;
  onDelete: (id: string) => void;
}

const EquipmentTracker: React.FC<EquipmentTrackerProps> = ({ equipment, onSave, onUpdate, onDelete }) => {
  const [view, setView] = useState<'list' | 'add'>('list');
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [hours, setHours] = useState<number>(0);
  const [status, setStatus] = useState<EquipmentItem['status']>('Active');

  const [predictingId, setPredictingId] = useState<string | null>(null);

  const handleAdd = () => {
    if (!name || !type) return;
    const newItem: EquipmentItem = {
      id: Date.now().toString(),
      name,
      type,
      hoursUsed: hours,
      status,
      notes: ''
    };
    onSave(newItem);
    setName('');
    setType('');
    setHours(0);
    setView('list');
  };

  const runMaintenanceCheck = async (item: EquipmentItem) => {
     setPredictingId(item.id);
     try {
        const result = await predictMaintenance(item.name, item.type, item.hoursUsed);
        onUpdate(item.id, {
           aiMaintenancePrediction: {
              maintenanceNeeded: result.maintenanceNeeded,
              reason: result.reason,
              recommendedAction: result.recommendedAction,
              predictionDate: new Date().toISOString()
           }
        });
     } catch (e) {
        alert("Prediction failed");
     } finally {
        setPredictingId(null);
     }
  };

  const getStatusColor = (s: string) => {
     switch (s) {
        case 'Active': return 'bg-green-100 text-green-800';
        case 'Maintenance': return 'bg-orange-100 text-orange-800';
        case 'Retired': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100';
     }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Equipment Tracker</h2>
          <p className="text-gray-500 text-sm">Track fleet inventory, usage hours, and maintenance needs.</p>
        </div>
        <button 
             onClick={() => setView(view === 'list' ? 'add' : 'list')}
             className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
        >
             {view === 'list' ? <><Plus className="w-4 h-4" /> Add Equipment</> : 'Back to List'}
        </button>
      </div>

      {view === 'add' && (
         <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 max-w-2xl mx-auto animate-in fade-in slide-in-from-top-4">
            <h3 className="font-semibold text-gray-800 mb-4">Add New Equipment</h3>
            <div className="space-y-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Equipment Name / ID</label>
                  <input 
                     className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                     placeholder="e.g. Scissor Lift #4"
                     value={name}
                     onChange={e => setName(e.target.value)}
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type / Model</label>
                  <input 
                     className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                     placeholder="e.g. JLG 1930ES"
                     value={type}
                     onChange={e => setType(e.target.value)}
                  />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Current Hours</label>
                     <input 
                        type="number"
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                        value={hours}
                        onChange={e => setHours(Number(e.target.value))}
                     />
                  </div>
                  <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                     <select 
                        className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                        value={status}
                        onChange={e => setStatus(e.target.value as any)}
                     >
                        <option value="Active">Active</option>
                        <option value="Maintenance">Maintenance</option>
                        <option value="Retired">Retired</option>
                     </select>
                  </div>
               </div>
               <button 
                  onClick={handleAdd}
                  disabled={!name}
                  className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50 mt-4"
               >
                  Save Equipment
               </button>
            </div>
         </div>
      )}

      {view === 'list' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.length === 0 ? (
               <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                  <Hammer className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No equipment tracked.</p>
               </div>
            ) : (
               equipment.map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col">
                     <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded ${getStatusColor(item.status)}`}>
                           {item.status}
                        </span>
                        <button onClick={() => onDelete(item.id)} className="text-gray-300 hover:text-red-500">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <h3 className="font-bold text-gray-900 text-lg">{item.name}</h3>
                     <p className="text-sm text-gray-500 mb-4">{item.type}</p>
                     
                     <div className="flex items-center gap-2 mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="font-mono font-bold text-gray-700">{item.hoursUsed} hrs</span>
                        <input 
                           type="number" 
                           className="w-16 ml-auto p-1 text-xs border rounded bg-white" 
                           placeholder="+ hrs"
                           onBlur={(e) => {
                              if (e.target.value) {
                                 onUpdate(item.id, { hoursUsed: item.hoursUsed + Number(e.target.value) });
                                 e.target.value = '';
                              }
                           }}
                        />
                     </div>

                     {/* AI Prediction Section */}
                     {item.aiMaintenancePrediction ? (
                        <div className={`mt-auto p-3 rounded-lg border text-xs ${item.aiMaintenancePrediction.maintenanceNeeded ? 'bg-red-50 border-red-100 text-red-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                           <div className="flex items-center gap-2 font-bold mb-1">
                              {item.aiMaintenancePrediction.maintenanceNeeded ? <AlertTriangle className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                              {item.aiMaintenancePrediction.maintenanceNeeded ? 'Maintenance Recommended' : 'Healthy Status'}
                           </div>
                           <p className="mb-1">{item.aiMaintenancePrediction.reason}</p>
                           {item.aiMaintenancePrediction.maintenanceNeeded && (
                              <p className="font-semibold mt-1">Action: {item.aiMaintenancePrediction.recommendedAction}</p>
                           )}
                           <div className="mt-2 text-[10px] text-gray-500 text-right">
                              Last check: {new Date(item.aiMaintenancePrediction.predictionDate).toLocaleDateString()}
                           </div>
                        </div>
                     ) : (
                        <button 
                           onClick={() => runMaintenanceCheck(item)}
                           disabled={predictingId === item.id}
                           className="mt-auto w-full py-2 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2"
                        >
                           {predictingId === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3 text-accent" />}
                           Run AI Maintenance Check
                        </button>
                     )}
                  </div>
               ))
            )}
         </div>
      )}
    </div>
  );
};

export default EquipmentTracker;
