
import React, { useState } from 'react';
import { MaterialDelivery, Submittal } from '../types';
import { Truck, Package, Plus, Trash2, Camera, AlertTriangle, Link as LinkIcon } from 'lucide-react';

interface MaterialTrackerProps {
  deliveries: MaterialDelivery[];
  onSave: (delivery: MaterialDelivery) => void;
  onDelete: (id: string) => void;
  submittals: Submittal[];
}

const MaterialTracker: React.FC<MaterialTrackerProps> = ({ deliveries, onSave, onDelete, submittals }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [material, setMaterial] = useState('');
  const [supplier, setSupplier] = useState('');
  const [status, setStatus] = useState<MaterialDelivery['status']>('Received');
  const [notes, setNotes] = useState('');
  const [selectedSubmittalId, setSelectedSubmittalId] = useState('');

  const handleSave = () => {
    if (!material || !supplier) return;
    const newDelivery: MaterialDelivery = {
      id: Date.now().toString(),
      date,
      material,
      supplier,
      status,
      notes,
      photos: [],
      submittalId: selectedSubmittalId || undefined
    };
    onSave(newDelivery);
    setMaterial('');
    setSupplier('');
    setNotes('');
    setStatus('Received');
    setSelectedSubmittalId('');
  };

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'Received': return 'bg-green-50 text-green-700 border-green-200';
      case 'Partial': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Damaged': return 'bg-red-50 text-red-700 border-red-200';
      case 'Rejected': return 'bg-gray-100 text-gray-700 border-gray-200';
      default: return 'bg-gray-50';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Material Delivery Log</h2>
          <p className="text-gray-500 text-sm">Track inbound materials, delivery slips, and status.</p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h3 className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
            <Truck className="w-4 h-4 text-accent" /> Log New Delivery
         </h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Date</label>
               <input 
                 type="date"
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 value={date}
                 onChange={e => setDate(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Material / Item</label>
               <input 
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 placeholder="e.g. 2x4 Lumber"
                 value={material}
                 onChange={e => setMaterial(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Supplier</label>
               <input 
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 placeholder="e.g. Home Depot"
                 value={supplier}
                 onChange={e => setSupplier(e.target.value)}
               />
            </div>
            <div>
               <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
               <select 
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 value={status}
                 onChange={e => setStatus(e.target.value as any)}
               >
                  <option value="Received">Received</option>
                  <option value="Partial">Partial</option>
                  <option value="Damaged">Damaged</option>
                  <option value="Rejected">Rejected</option>
               </select>
            </div>
            {/* Submittal Link Dropdown */}
            <div className="md:col-span-2">
               <label className="block text-xs font-medium text-gray-700 mb-1">Link to Submittal (Optional)</label>
               <select 
                 className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                 value={selectedSubmittalId}
                 onChange={e => setSelectedSubmittalId(e.target.value)}
               >
                  <option value="">-- No Linked Submittal --</option>
                  {submittals.map(s => (
                     <option key={s.id} value={s.id}>{s.title} ({s.specSection})</option>
                  ))}
               </select>
            </div>
            <div className="md:col-span-2 flex items-end justify-end">
               <button 
                 onClick={handleSave}
                 disabled={!material}
                 className="bg-primary hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50"
               >
                 Log Delivery
               </button>
            </div>
         </div>
      </div>

      {/* List */}
      <div className="space-y-4">
         {deliveries.length === 0 ? (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center text-gray-400 text-sm">
               No deliveries logged yet.
            </div>
         ) : (
            deliveries.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(d => {
               const linkedSubmittal = submittals.find(s => s.id === d.submittalId);
               return (
                  <div key={d.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-4 items-start md:items-center">
                      <div className="bg-gray-100 p-3 rounded-lg">
                         <Package className="w-6 h-6 text-gray-500" />
                      </div>
                      <div className="flex-1">
                         <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-gray-900">{d.material}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold ${getStatusColor(d.status)}`}>
                               {d.status}
                            </span>
                            {d.status === 'Damaged' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                            {linkedSubmittal && (
                               <span className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border border-blue-200 bg-blue-50 text-blue-700 font-medium">
                                  <LinkIcon className="w-3 h-3" /> Linked: {linkedSubmittal.title}
                               </span>
                            )}
                         </div>
                         <div className="text-xs text-gray-500 flex items-center gap-2">
                            <span>{new Date(d.date).toLocaleDateString()}</span>
                            <span>•</span>
                            <span>{d.supplier}</span>
                         </div>
                         {d.notes && <p className="text-xs text-gray-600 mt-1 italic">"{d.notes}"</p>}
                      </div>
                      <div className="flex gap-2">
                         <button className="p-2 text-gray-400 hover:text-blue-600 bg-gray-50 rounded-lg transition-colors text-xs flex items-center gap-1">
                            <Camera className="w-3 h-3" /> Slip
                         </button>
                         <button 
                            onClick={() => onDelete(d.id)}
                            className="p-2 text-gray-400 hover:text-red-600 bg-gray-50 rounded-lg transition-colors"
                         >
                            <Trash2 className="w-4 h-4" />
                         </button>
                      </div>
                  </div>
               );
            })
         )}
      </div>
    </div>
  );
};

export default MaterialTracker;