
import React, { useState, useEffect } from 'react';
import { Inspection } from '../types';
import { ClipboardList, Plus, Trash2, Camera, X, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface InspectionManagerProps {
  inspections: Inspection[];
  onSave: (inspection: Inspection) => void;
  onDelete: (id: string) => void;
}

const InspectionManager: React.FC<InspectionManagerProps> = ({ inspections, onSave, onDelete }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [inspectorName, setInspectorName] = useState('');
  const [status, setStatus] = useState<Inspection['status']>('Scheduled');
  const [comments, setComments] = useState('');
  
  // Photo State
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  useEffect(() => {
    return () => {
      photoPreviews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [photoPreviews]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files) as File[];
      const newPreviews = files.map(f => URL.createObjectURL(f));
      setPhotoPreviews(prev => [...prev, ...newPreviews]);
      setPhotoFiles(prev => [...prev, ...files]);
    }
  };

  const removePhoto = (index: number) => {
    setPhotoPreviews(prev => {
        const newPreviews = [...prev];
        URL.revokeObjectURL(newPreviews[index]);
        return newPreviews.filter((_, i) => i !== index);
    });
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!type || !location) return;
    const newInspection: Inspection = {
      id: Date.now().toString(),
      date,
      type,
      location,
      inspectorName,
      status,
      comments,
      photos: photoFiles.map(f => f.name),
      dateCreated: new Date().toISOString()
    };
    onSave(newInspection);
    resetForm();
    setView('list');
  };

  const resetForm = () => {
    setType('');
    setLocation('');
    setInspectorName('');
    setStatus('Scheduled');
    setComments('');
    setPhotoPreviews([]);
    setPhotoFiles([]);
  };

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'Pass': return 'bg-green-100 text-green-800 border-green-200';
      case 'Fail': return 'bg-red-100 text-red-800 border-red-200';
      case 'Conditional': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inspection Manager</h2>
          <p className="text-gray-500 text-sm">Schedule and track city, special, and quality inspections.</p>
        </div>
        <button 
             onClick={() => setView(view === 'list' ? 'create' : 'list')}
             className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
        >
             {view === 'list' ? <><Plus className="w-4 h-4" /> Schedule Inspection</> : 'Back to List'}
        </button>
      </div>

      {view === 'create' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4">
           <h3 className="font-semibold text-gray-800 mb-4">Inspection Details</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                 <input 
                   type="date"
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   value={date}
                   onChange={e => setDate(e.target.value)}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                 <select 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   value={type}
                   onChange={e => setType(e.target.value)}
                 >
                    <option value="">Select Type...</option>
                    <option value="Framing">Framing</option>
                    <option value="Electrical Rough-in">Electrical Rough-in</option>
                    <option value="Plumbing Rough-in">Plumbing Rough-in</option>
                    <option value="Insulation">Insulation</option>
                    <option value="Drywall Screw">Drywall Screw</option>
                    <option value="Final Electrical">Final Electrical</option>
                    <option value="Final Building">Final Building</option>
                    <option value="Special Inspection">Special Inspection</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                 <input 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   placeholder="e.g. Building A, Floors 1-3"
                   value={location}
                   onChange={e => setLocation(e.target.value)}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Name (Optional)</label>
                 <input 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   placeholder="e.g. John Doe (City)"
                   value={inspectorName}
                   onChange={e => setInspectorName(e.target.value)}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Status Result</label>
                 <select 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   value={status}
                   onChange={e => setStatus(e.target.value as any)}
                 >
                    <option value="Scheduled">Scheduled</option>
                    <option value="Pass">Pass</option>
                    <option value="Fail">Fail</option>
                    <option value="Conditional">Conditional Pass</option>
                 </select>
              </div>
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Inspector Comments / Corrective Actions</label>
                 <textarea 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 h-24"
                   placeholder="Notes from the inspector..."
                   value={comments}
                   onChange={e => setComments(e.target.value)}
                 />
              </div>
              
               <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos (Corrective Actions / Proof)</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                      <div className="flex flex-wrap gap-4 items-center">
                          {photoPreviews.map((src, index) => (
                              <div key={index} className="relative w-20 h-20 group">
                                  <img src={src} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                  <button 
                                    onClick={() => removePhoto(index)}
                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                                  >
                                      <X className="w-3 h-3" />
                                  </button>
                              </div>
                          ))}
                          <label className="w-20 h-20 flex flex-col items-center justify-center border border-gray-300 bg-white rounded-lg cursor-pointer hover:bg-gray-50 hover:border-accent hover:text-accent transition-all">
                              <Camera className="w-6 h-6 mb-1 text-gray-400" />
                              <span className="text-[10px] text-gray-500 font-medium">Add Photo</span>
                              <input type="file" accept="image/*" multiple onChange={handlePhotoSelect} className="hidden" />
                          </label>
                      </div>
                  </div>
              </div>
              
              <div className="md:col-span-2 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={!type || !location}
                    className="bg-accent hover:bg-accent-hover text-white px-6 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Save Inspection Record
                  </button>
              </div>
           </div>
        </div>
      )}

      {view === 'list' && (
         <div className="space-y-4">
            {inspections.length === 0 ? (
               <div className="p-12 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                  <ClipboardList className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No inspections scheduled.</p>
               </div>
            ) : (
               inspections.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(item => (
                  <div key={item.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                     <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                           <span className={`px-2 py-1 text-xs font-bold uppercase rounded border ${getStatusBadge(item.status)}`}>
                              {item.status}
                           </span>
                           <h4 className="font-bold text-gray-900">{item.type}</h4>
                        </div>
                        <button onClick={() => onDelete(item.id)} className="text-gray-400 hover:text-red-600">
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                        <div><span className="font-medium text-gray-900">Date:</span> {new Date(item.date).toLocaleDateString()}</div>
                        <div><span className="font-medium text-gray-900">Location:</span> {item.location}</div>
                        <div><span className="font-medium text-gray-900">Inspector:</span> {item.inspectorName || 'TBD'}</div>
                     </div>
                     {item.comments && (
                        <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 italic border border-gray-100 mb-3">
                           "{item.comments}"
                        </div>
                     )}
                     {item.photos.length > 0 && (
                        <div className="flex gap-2">
                           {item.photos.map((p, i) => (
                              <div key={i} className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs border border-blue-100">
                                 <Camera className="w-3 h-3" /> {p}
                              </div>
                           ))}
                        </div>
                     )}
                  </div>
               ))
            )}
         </div>
      )}
    </div>
  );
};

export default InspectionManager;
