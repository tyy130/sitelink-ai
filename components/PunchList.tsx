
import React, { useState, useEffect } from 'react';
import { PunchItem, Priority } from '../types';
import { CheckSquare, Plus, Filter, Camera, Trash2, CheckCircle2, X, Image as ImageIcon, Printer, Table } from 'lucide-react';

interface PunchListProps {
  items: PunchItem[];
  onSave: (item: PunchItem) => void;
  onUpdate: (id: string, updates: Partial<PunchItem>) => void;
  onDelete: (id: string) => void;
}

const PunchList: React.FC<PunchListProps> = ({ items, onSave, onUpdate, onDelete }) => {
  const [view, setView] = useState<'list' | 'create' | 'report'>('list');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Open' | 'Completed' | 'Verified'>('All');

  // Form State
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [trade, setTrade] = useState('');
  const [priority, setPriority] = useState<Priority>(Priority.MEDIUM);
  
  // Photo State
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);

  // Cleanup object URLs to avoid memory leaks
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
        URL.revokeObjectURL(newPreviews[index]); // Cleanup
        return newPreviews.filter((_, i) => i !== index);
    });
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!description || !location) return;
    const newItem: PunchItem = {
      id: Date.now().toString(),
      description,
      location,
      trade: trade || 'General',
      priority,
      status: 'Open',
      photos: photoFiles.map(f => f.name), // Store references (filenames)
      dateCreated: new Date().toISOString()
    };
    onSave(newItem);
    resetForm();
    setView('list');
  };

  const resetForm = () => {
    setDescription('');
    setLocation('');
    setTrade('');
    setPriority(Priority.MEDIUM);
    setPhotoPreviews([]);
    setPhotoFiles([]);
  };

  const filteredItems = statusFilter === 'All' 
    ? items 
    : items.filter(i => i.status === statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Open': return 'bg-red-50 text-red-700 border-red-200';
      case 'Completed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Verified': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-gray-50 text-gray-700';
    }
  };

  // REPORT VIEW
  if (view === 'report') {
    return (
      <div className="max-w-5xl mx-auto space-y-6 animate-fade-in pb-12">
        <div className="flex items-center justify-between print:hidden">
          <div>
             <h2 className="text-2xl font-bold text-gray-900">Punch List Report</h2>
             <p className="text-gray-500 text-sm">Preview and export punch items to PDF.</p>
          </div>
          <div className="flex gap-3">
             <button 
               onClick={() => window.print()}
               className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
             >
               <Printer className="w-4 h-4" /> Print / Save PDF
             </button>
             <button 
               onClick={() => setView('list')}
               className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
             >
               Close
             </button>
          </div>
        </div>

        {/* Report Paper Preview */}
        <div className="bg-white p-8 shadow-lg border border-gray-200 min-h-[11in] print:shadow-none print:border-none print:p-0">
           {/* Report Header */}
           <div className="border-b-2 border-gray-900 pb-6 mb-6 flex justify-between items-end">
              <div>
                 <h1 className="text-3xl font-bold uppercase tracking-tight text-gray-900">Punch List Report</h1>
                 <p className="text-gray-500 mt-2 font-medium">Project: SiteLink Construction Demo</p>
                 <p className="text-gray-500 text-sm">Generated: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="text-right">
                 <div className="text-sm font-bold text-gray-900 uppercase">Summary</div>
                 <p className="text-sm text-gray-600">Total Items: {filteredItems.length}</p>
                 <p className="text-sm text-gray-600">Filter: <span className="font-semibold">{statusFilter}</span></p>
              </div>
           </div>

           {/* Report Table */}
           <table className="w-full text-sm text-left border-collapse">
              <thead>
                 <tr className="bg-gray-100 text-gray-700 uppercase text-xs font-bold border-y border-gray-300">
                    <th className="p-3 border-r border-gray-200 w-16 text-center">ID</th>
                    <th className="p-3 border-r border-gray-200 w-24 text-center">Status</th>
                    <th className="p-3 border-r border-gray-200">Description & Location</th>
                    <th className="p-3 border-r border-gray-200 w-32">Trade</th>
                    <th className="p-3 border-r border-gray-200 w-24 text-center">Priority</th>
                    <th className="p-3 w-40">Photos Ref</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                 {filteredItems.length === 0 ? (
                    <tr>
                       <td colSpan={6} className="p-8 text-center text-gray-400 italic">No items found matching criteria.</td>
                    </tr>
                 ) : (
                    filteredItems.map((item, idx) => (
                       <tr key={item.id} className="break-inside-avoid">
                          <td className="p-3 border-r border-gray-200 text-center text-gray-500 text-xs">#{idx + 1}</td>
                          <td className="p-3 border-r border-gray-200 text-center">
                             <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-bold border ${getStatusColor(item.status)}`}>
                                {item.status}
                             </span>
                          </td>
                          <td className="p-3 border-r border-gray-200">
                             <div className="font-bold text-gray-900">{item.description}</div>
                             <div className="text-xs text-gray-500 mt-0.5">{item.location}</div>
                          </td>
                          <td className="p-3 border-r border-gray-200 text-gray-700 font-medium">{item.trade}</td>
                          <td className="p-3 border-r border-gray-200 text-center text-xs uppercase font-semibold text-gray-600">{item.priority}</td>
                          <td className="p-3 text-xs text-gray-400 italic">
                             {item.photos && item.photos.length > 0 ? (
                                <div className="flex flex-col gap-1">
                                   {item.photos.map((p, i) => (
                                      <div key={i} className="flex items-center gap-1">
                                         <ImageIcon className="w-3 h-3" /> {p}
                                      </div>
                                   ))}
                                </div>
                             ) : 'None'}
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>

           {/* Footer */}
           <div className="mt-8 pt-4 border-t border-gray-200 flex justify-between text-xs text-gray-400">
              <span>SiteLink AI - Field Management System</span>
              <span>Page 1 of 1</span>
           </div>
        </div>
      </div>
    );
  }

  // CREATE / EDIT VIEW
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Punch List Manager</h2>
          <p className="text-gray-500 text-sm">Track deficiencies, assign trades, and verify completion.</p>
        </div>
        <div className="flex gap-2">
           {view === 'list' && (
              <button 
                 onClick={() => setView('report')}
                 className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
              >
                 <Printer className="w-4 h-4" /> Export Report
              </button>
           )}
           <button 
             onClick={() => setView(view === 'list' ? 'create' : 'list')}
             className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
           >
             {view === 'list' ? <><Plus className="w-4 h-4" /> Add Item</> : 'Back to List'}
           </button>
        </div>
      </div>

      {view === 'create' && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-top-4">
           <h3 className="font-semibold text-gray-800 mb-4">New Punch Item</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                 <input 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   placeholder="e.g. Paint scratch on north wall"
                   value={description}
                   onChange={e => setDescription(e.target.value)}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Location / Room</label>
                 <input 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   placeholder="e.g. Conf Room 102"
                   value={location}
                   onChange={e => setLocation(e.target.value)}
                 />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Trade Responsibility</label>
                 <select 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   value={trade}
                   onChange={e => setTrade(e.target.value)}
                 >
                    <option value="">Select...</option>
                    <option value="Painter">Painter</option>
                    <option value="Electrician">Electrician</option>
                    <option value="Carpenter">Carpenter</option>
                    <option value="Plumber">Plumber</option>
                    <option value="General">General</option>
                 </select>
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                 <select 
                   className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                   value={priority}
                   onChange={e => setPriority(e.target.value as Priority)}
                 >
                    <option value={Priority.LOW}>Low</option>
                    <option value={Priority.MEDIUM}>Medium</option>
                    <option value={Priority.HIGH}>High</option>
                    <option value={Priority.CRITICAL}>Critical</option>
                 </select>
              </div>

              {/* Photo Upload Section */}
              <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos</label>
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 bg-gray-50/50">
                      <div className="flex flex-wrap gap-4 items-center">
                          {photoPreviews.map((src, index) => (
                              <div key={index} className="relative w-20 h-20 group">
                                  <img 
                                    src={src} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover rounded-lg border border-gray-200" 
                                  />
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

              <div className="md:col-span-2 flex items-end pt-2">
                  <button 
                    onClick={handleSave}
                    disabled={!description || !location}
                    className="w-full bg-accent hover:bg-accent-hover text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    Save Item
                  </button>
              </div>
           </div>
        </div>
      )}

      {/* List View */}
      {view === 'list' && (
        <div className="space-y-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
             {['All', 'Open', 'Completed', 'Verified'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status as any)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                     statusFilter === status 
                     ? 'bg-slate-800 text-white border-slate-800'
                     : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {status}
                </button>
             ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="divide-y divide-gray-100">
                {filteredItems.length === 0 ? (
                  <div className="p-8 text-center text-gray-400 text-sm">No punch items found.</div>
                ) : (
                  filteredItems.map(item => (
                    <div key={item.id} className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                       <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                             <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${getStatusColor(item.status)}`}>
                                {item.status}
                             </span>
                             <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{item.trade}</span>
                             {item.priority === Priority.HIGH || item.priority === Priority.CRITICAL ? (
                                <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 rounded border border-red-100">
                                   {item.priority}
                                </span>
                             ) : null}
                          </div>
                          <h4 className="font-semibold text-gray-900">{item.description}</h4>
                          <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                             Location: <span className="text-gray-700">{item.location}</span>
                          </p>
                       </div>

                       <div className="flex items-center gap-2">
                          {/* Photo Indicator */}
                          {item.photos && item.photos.length > 0 ? (
                            <div className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-xs font-medium border border-blue-100" title={item.photos.join(', ')}>
                                <ImageIcon className="w-3.5 h-3.5" />
                                {item.photos.length}
                            </div>
                          ) : (
                            <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Add Photo (Simulated)">
                                <Camera className="w-4 h-4" />
                            </button>
                          )}

                          {/* Status Actions */}
                          {item.status === 'Open' && (
                             <button 
                               onClick={() => onUpdate(item.id, { status: 'Completed' })}
                               className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-xs font-medium hover:bg-green-50 hover:text-green-700 hover:border-green-200 transition-colors"
                             >
                               Mark Complete
                             </button>
                          )}
                          {item.status === 'Completed' && (
                             <button 
                               onClick={() => onUpdate(item.id, { status: 'Verified' })}
                               className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                             >
                               <CheckCircle2 className="w-3 h-3" /> Verify
                             </button>
                          )}
                          
                          <button 
                            onClick={() => onDelete(item.id)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
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
      )}
    </div>
  );
};

export default PunchList;
