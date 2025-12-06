
import React, { useState, useEffect } from 'react';
import { FieldIssue, Priority } from '../types';
import { StickyNote, AlertTriangle, ArrowRight, Trash2, Camera, Plus, FileText, X, Image as ImageIcon } from 'lucide-react';

interface FieldIssuesProps {
  issues: FieldIssue[];
  onSave: (issue: FieldIssue) => void;
  onDelete: (id: string) => void;
  onConvertToRFI: (issue: FieldIssue) => void;
}

const FieldIssues: React.FC<FieldIssuesProps> = ({ issues, onSave, onDelete, onConvertToRFI }) => {
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [urgency, setUrgency] = useState<Priority>(Priority.MEDIUM);
  
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
        URL.revokeObjectURL(newPreviews[index]);
        return newPreviews.filter((_, i) => i !== index);
    });
    setPhotoFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!description) return;
    const newIssue: FieldIssue = {
      id: Date.now().toString(),
      description,
      location,
      urgency,
      status: 'Open',
      photos: photoFiles.map(f => f.name),
      dateCreated: new Date().toISOString()
    };
    onSave(newIssue);
    
    // Reset Form
    setDescription('');
    setLocation('');
    setUrgency(Priority.MEDIUM);
    setPhotoPreviews([]);
    setPhotoFiles([]);
  };

  const getUrgencyColor = (p: Priority) => {
    switch (p) {
        case Priority.CRITICAL: return 'bg-red-100 text-red-700';
        case Priority.HIGH: return 'bg-orange-100 text-orange-700';
        case Priority.LOW: return 'bg-gray-100 text-gray-600';
        default: return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Field Observations & Issues</h2>
          <p className="text-gray-500 text-sm">Capture actionable items, conflicts, and defects. Convert high-impact issues to RFIs.</p>
        </div>
      </div>

      {/* Quick Add */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
         <h3 className="font-semibold text-gray-800 mb-4 text-sm flex items-center gap-2">
            <Plus className="w-4 h-4 text-accent" /> Quick Capture
         </h3>
         <div className="space-y-4">
             <textarea 
               className="w-full p-3 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 resize-none h-24 focus:ring-2 focus:ring-accent"
               placeholder="Describe the issue, conflict, or observation..."
               value={description}
               onChange={e => setDescription(e.target.value)}
             />
             
             {/* Photo Previews */}
             {photoPreviews.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2 pt-2 pr-2">
                    {photoPreviews.map((src, idx) => (
                        <div key={idx} className="relative w-16 h-16 flex-shrink-0 group">
                            <img src={src} alt="Preview" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                            <button 
                                onClick={() => removePhoto(idx)}
                                className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
             )}

             <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                    <input 
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-accent"
                      placeholder="Location (e.g. 2nd Floor Corridor)"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                    />
                </div>
                <div className="w-full md:w-48">
                    <select 
                      className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900 focus:ring-2 focus:ring-accent"
                      value={urgency}
                      onChange={e => setUrgency(e.target.value as Priority)}
                    >
                       <option value={Priority.LOW}>Low Urgency</option>
                       <option value={Priority.MEDIUM}>Medium Urgency</option>
                       <option value={Priority.HIGH}>High Urgency</option>
                       <option value={Priority.CRITICAL}>Critical</option>
                    </select>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                    <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-600 px-3 py-2 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 border border-gray-200">
                        <Camera className="w-4 h-4" />
                        <span className="hidden md:inline">Photo</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoSelect} />
                    </label>
                    <button 
                      onClick={handleSave}
                      disabled={!description}
                      className="bg-primary hover:bg-slate-800 text-white px-6 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 whitespace-nowrap flex-1 md:flex-none"
                    >
                      Add Observation
                    </button>
                </div>
             </div>
         </div>
      </div>

      {/* Grid of Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {issues.length === 0 ? (
            <div className="col-span-full text-center text-gray-400 py-12 bg-white rounded-xl border border-dashed border-gray-300">
               No items logged. Start capturing observations above.
            </div>
         ) : (
            issues.sort((a,b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()).map(issue => (
               <div key={issue.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 flex flex-col group hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                     <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${getUrgencyColor(issue.urgency)}`}>
                        {issue.urgency}
                     </span>
                     <div className="flex gap-1">
                        <button 
                           onClick={() => onDelete(issue.id)}
                           className="text-gray-300 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                        >
                           <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                  </div>
                  
                  <p className="text-gray-800 text-sm mb-4 line-clamp-4 flex-1 whitespace-pre-wrap">{issue.description}</p>
                  
                  {/* Metadata Row */}
                  <div className="text-xs text-gray-500 mb-4 space-y-2">
                     <div className="flex items-center gap-2">
                         <span className="font-medium text-gray-700">{issue.location || 'Unknown Location'}</span>
                         <span>•</span>
                         <span>{new Date(issue.dateCreated).toLocaleDateString()}</span>
                     </div>
                     {issue.photos && issue.photos.length > 0 && (
                         <div className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-1 rounded w-fit">
                             <ImageIcon className="w-3 h-3" />
                             <span className="font-medium">{issue.photos.length} Photo{issue.photos.length !== 1 ? 's' : ''}</span>
                         </div>
                     )}
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                     <div className="text-xs text-gray-400 italic">
                        {/* Placeholder for future expansion */}
                     </div>
                     
                     {issue.status === 'RFI Drafted' ? (
                        <span className="text-xs font-bold text-blue-600 flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
                           <FileText className="w-3 h-3" /> RFI Created
                        </span>
                     ) : (
                        <button 
                           onClick={() => onConvertToRFI(issue)}
                           className="text-xs font-bold text-accent hover:text-accent-hover flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                        >
                           Convert to RFI <ArrowRight className="w-3 h-3" />
                        </button>
                     )}
                  </div>
               </div>
            ))
         )}
      </div>
    </div>
  );
};

export default FieldIssues;
