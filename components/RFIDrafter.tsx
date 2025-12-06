
import React, { useState, useRef } from 'react';
import { RFI, Priority, RFIDraftResponse } from '../types';
import { draftRFI } from '../services/openaiService';
import { Wand2, Loader2, Save, FileText, Upload, Printer, Calendar, Undo, Redo } from 'lucide-react';

interface RFIDrafterProps {
  onSave: (rfi: RFI) => void;
  onCancel: () => void;
  initialData?: RFI | null;
}

interface RFIFormData {
  context: string;
  drawingRef: string;
  specRef: string;
  priority: Priority;
  dueDate: string;
  attachments: string[];
}

const RFIDrafter: React.FC<RFIDrafterProps> = ({ onSave, onCancel, initialData }) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'preview'>('input');
  
  // Consolidated Form State for History Tracking
  const [formData, setFormData] = useState<RFIFormData>(() => ({
    context: initialData ? `PREVIOUS RFI CONTENT:\n${initialData.question}\n\nSUGGESTED SOLUTION:\n${initialData.suggestion}` : '',
    drawingRef: initialData?.drawingRef || '',
    specRef: initialData?.specRef || '',
    priority: initialData?.priority || Priority.MEDIUM,
    dueDate: initialData?.dueDate || '',
    attachments: initialData?.attachments || []
  }));

  // History Stacks
  const [history, setHistory] = useState<RFIFormData[]>([]);
  const [future, setFuture] = useState<RFIFormData[]>([]);
  
  // Ref to track last change time for debouncing history snapshots
  const lastChangeRef = useRef<number>(0);

  // Output State
  const [draft, setDraft] = useState<RFIDraftResponse | null>(null);

  // Unified Field Updater with History Debounce
  const updateField = <K extends keyof RFIFormData>(field: K, value: RFIFormData[K]) => {
    const now = Date.now();
    
    // If > 1000ms since last change, snapshot current state to history
    // This prevents character-by-character undo
    if (now - lastChangeRef.current > 1000) {
      setHistory(prev => [...prev, formData]);
      setFuture([]); // Clear redo stack on new input
    }
    
    lastChangeRef.current = now;
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const previous = history[history.length - 1];
    
    setFuture(prev => [formData, ...prev]);
    setFormData(previous);
    setHistory(prev => prev.slice(0, -1));
    
    // Reset timer to ensure next action creates a new snapshot
    lastChangeRef.current = 0;
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    
    setHistory(prev => [...prev, formData]);
    setFormData(next);
    setFuture(prev => prev.slice(1));
    
    lastChangeRef.current = 0;
  };

  const handleGenerate = async () => {
    if (!formData.context) return;
    setLoading(true);
    try {
      const response = await draftRFI(formData.context, formData.drawingRef, formData.specRef);
      setDraft(response);
      setStep('preview');
    } catch (e) {
      alert("Failed to generate RFI. Please check API Key configuration.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!draft) return;
    const newRFI: RFI = {
      id: Date.now().toString(),
      subject: draft.subject,
      question: draft.formattedQuestion,
      suggestion: draft.suggestedSolution,
      drawingRef: formData.drawingRef,
      specRef: formData.specRef,
      priority: formData.priority,
      dueDate: formData.dueDate,
      attachments: formData.attachments,
      dateCreated: new Date().toISOString(),
      status: 'Draft'
    };
    onSave(newRFI);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const newFiles = Array.from(e.target.files).map((f: File) => f.name);
       
       // Force snapshot for discrete actions like upload
       setHistory(prev => [...prev, formData]);
       setFuture([]);
       
       setFormData(prev => ({
           ...prev,
           attachments: [...prev.attachments, ...newFiles]
       }));
       lastChangeRef.current = Date.now();
    }
  };

  const getPriorityColor = (p: Priority) => {
    switch (p) {
        case Priority.CRITICAL: return 'border-red-500 text-red-500 bg-red-50';
        case Priority.HIGH: return 'border-orange-500 text-orange-500 bg-orange-50';
        case Priority.LOW: return 'border-gray-400 text-gray-500 bg-gray-50';
        default: return 'border-blue-500 text-blue-500 bg-blue-50'; // Medium
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">RFI Drafter</h2>
           <p className="text-gray-500 text-sm">Convert rough field notes into a formal Request for Information.</p>
        </div>
        {step === 'preview' && (
           <button 
             onClick={() => setStep('input')}
             className="text-sm text-gray-500 hover:text-gray-900 underline"
           >
             Edit Inputs
           </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <div className={`space-y-4 ${step === 'preview' ? 'hidden lg:block lg:opacity-50 lg:pointer-events-none' : ''}`}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             
             {/* Unified spacing container */}
             <div className="space-y-8">
                
                {/* 1. Main Content Input */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                      <label className="block text-sm font-bold text-gray-900">
                        Field Notes / Problem Description <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-1 bg-gray-50 rounded-md p-0.5 border border-gray-200">
                          <button 
                            onClick={handleUndo} 
                            disabled={history.length === 0} 
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded disabled:opacity-30 transition-all" 
                            title="Undo (Ctrl+Z)"
                          >
                              <Undo className="w-4 h-4" />
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                          <button 
                            onClick={handleRedo} 
                            disabled={future.length === 0} 
                            className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-white rounded disabled:opacity-30 transition-all" 
                            title="Redo (Ctrl+Y)"
                          >
                              <Redo className="w-4 h-4" />
                          </button>
                      </div>
                  </div>
                  <textarea 
                    value={formData.context}
                    onChange={(e) => updateField('context', e.target.value)}
                    className="w-full h-40 p-4 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-sm text-gray-900 shadow-sm transition-shadow placeholder:text-gray-400"
                    placeholder="Describe the condition, conflict, or question in detail. E.g., The ductwork shown on A-402 conflicts with the structural beam on S-201..."
                  />
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* 2. References Group */}
                <div>
                   <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Reference Information
                   </h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-gray-700">Drawing Number(s)</label>
                          <input 
                            type="text" 
                            value={formData.drawingRef}
                            onChange={(e) => updateField('drawingRef', e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm text-gray-900 shadow-sm"
                            placeholder="e.g. A-101, S-202"
                          />
                      </div>
                      <div className="space-y-1.5">
                          <label className="block text-sm font-medium text-gray-700">Specification Section</label>
                          <input 
                            type="text" 
                            value={formData.specRef}
                            onChange={(e) => updateField('specRef', e.target.value)}
                            className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm text-gray-900 shadow-sm"
                            placeholder="e.g. 03 30 00"
                          />
                      </div>
                   </div>
                </div>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* 3. Logistics Group */}
                <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                       <Calendar className="w-3 h-3" /> Planning & Priority
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Priority Level</label>
                            <div className="relative">
                                <select 
                                    value={formData.priority} 
                                    onChange={(e) => updateField('priority', e.target.value as Priority)}
                                    className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm text-gray-900 shadow-sm appearance-none"
                                >
                                    <option value={Priority.LOW}>Low</option>
                                    <option value={Priority.MEDIUM}>Medium</option>
                                    <option value={Priority.HIGH}>High</option>
                                    <option value={Priority.CRITICAL}>Critical</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                                   <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Response Required By</label>
                            <input 
                                type="date" 
                                value={formData.dueDate}
                                onChange={(e) => updateField('dueDate', e.target.value)}
                                className="w-full p-2.5 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent text-sm text-gray-900 shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* 4. Attachments */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-dashed border-gray-300">
                    <div className="flex items-center justify-between mb-3">
                        <label className="block text-sm font-medium text-gray-700">Supporting Attachments</label>
                        <span className="text-xs text-gray-400">{formData.attachments.length} files added</span>
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="cursor-pointer group flex items-center justify-center w-full px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg hover:bg-white hover:border-accent hover:text-accent transition-all bg-white">
                            <div className="flex items-center gap-2 text-gray-500 group-hover:text-accent">
                                <Upload className="w-5 h-5" />
                                <span className="text-sm font-medium">Click to upload files</span>
                            </div>
                            <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                        </label>
                        
                        {formData.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-1">
                                {formData.attachments.map((f, i) => (
                                    <div key={i} className="bg-white border border-gray-200 px-3 py-1.5 rounded-full text-xs text-gray-600 flex items-center gap-2 shadow-sm">
                                        <span className="truncate max-w-[150px]">{f}</span>
                                        {/* In a real app, delete button here */}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="pt-2">
                  <button 
                    onClick={handleGenerate}
                    disabled={loading || !formData.context}
                    className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-slate-800 text-white py-3.5 rounded-lg font-medium transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                  >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                    {loading ? 'Compiling RFI...' : 'Generate Formal RFI'}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-3">
                    AI will structure your notes into a formal request.
                  </p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Column: Preview */}
        <div className={step === 'preview' ? 'col-span-1 lg:col-span-2' : 'hidden lg:block'}>
          {draft ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               {/* Formal RFI Document Layout */}
               <div className="bg-white rounded-none shadow-xl border border-gray-200 overflow-hidden max-w-[8.5in] mx-auto min-h-[11in] flex flex-col">
                  {/* Header */}
                  <div className="bg-slate-900 text-white p-8">
                     <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-2xl font-bold tracking-wider uppercase">Request For Information</h1>
                            <p className="text-slate-400 text-sm mt-1">Project: Construction Site A</p>
                        </div>
                        <div className="text-right">
                             <div className="text-3xl font-mono opacity-50">RFI-#{Math.floor(Math.random() * 1000)}</div>
                             <div className={`mt-2 inline-block px-3 py-1 rounded border text-xs font-bold uppercase ${getPriorityColor(formData.priority)}`}>
                                 {formData.priority} PRIORITY
                             </div>
                        </div>
                     </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8 p-8 border-b border-gray-200 bg-slate-50 text-sm">
                      <div>
                          <span className="block text-xs uppercase text-gray-500 font-bold mb-1">To (Architect/Engineer)</span>
                          <div className="font-medium text-gray-900">Design Team Lead</div>
                      </div>
                      <div>
                          <span className="block text-xs uppercase text-gray-500 font-bold mb-1">Date Requested</span>
                          <div className="font-medium text-gray-900">{new Date().toLocaleDateString()}</div>
                      </div>
                      <div>
                          <span className="block text-xs uppercase text-gray-500 font-bold mb-1">References</span>
                          <div className="font-medium text-gray-900">Dwgs: {formData.drawingRef || 'N/A'} | Specs: {formData.specRef || 'N/A'}</div>
                      </div>
                      <div>
                          <span className="block text-xs uppercase text-gray-500 font-bold mb-1">Response Required By</span>
                          <div className={`font-medium ${formData.dueDate ? 'text-gray-900' : 'text-gray-400 italic'}`}>
                              {formData.dueDate ? new Date(formData.dueDate).toLocaleDateString() : 'ASAP'}
                          </div>
                      </div>
                  </div>

                  {/* Content */}
                  <div className="p-8 space-y-8 flex-1">
                      <div>
                          <h3 className="text-sm font-bold uppercase text-gray-900 border-b-2 border-gray-900 pb-2 mb-4">Subject: {draft.subject}</h3>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Question / Description</h4>
                        <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                            {draft.formattedQuestion}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Proposed Solution</h4>
                        <div className="text-gray-800 leading-relaxed text-sm whitespace-pre-wrap">
                            {draft.suggestedSolution}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Impact Assessment</h4>
                        <div className="text-gray-600 italic text-sm border-l-4 border-gray-200 pl-4">
                            {draft.impactAssessment}
                        </div>
                      </div>
                      
                      {formData.attachments.length > 0 && (
                          <div>
                             <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Attachments</h4>
                             <ul className="list-disc pl-5 text-sm text-gray-700">
                                 {formData.attachments.map((f, i) => <li key={i}>{f}</li>)}
                             </ul>
                          </div>
                      )}
                  </div>

                  {/* Footer */}
                  <div className="p-8 border-t border-gray-200 bg-slate-50 text-xs text-gray-500 flex justify-between">
                      <div>Generated by SiteLink AI</div>
                      <div>Page 1 of 1</div>
                  </div>
               </div>

               {/* Action Buttons */}
               <div className="max-w-[8.5in] mx-auto mt-6 flex gap-3">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <Save className="w-4 h-4" /> Save RFI to Log
                  </button>
                  <button 
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium flex items-center gap-2 shadow-sm"
                  >
                    <Printer className="w-4 h-4" /> Print / PDF
                  </button>
                  <button 
                    onClick={onCancel}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    Discard
                  </button>
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50">
               <Wand2 className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-medium">Ready to Draft</p>
               <p className="text-sm">Enter details on the left and let AI structure your formal request.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RFIDrafter;
