import React, { useState } from 'react';
import { Submittal, SubmittalReviewResponse } from '../types';
import { reviewSubmittal } from '../services/openaiService';
import { ScanSearch, Loader2, Save, AlertTriangle, XCircle, Upload, Briefcase, Calendar, Plus, Filter, ArrowLeft, FileText, CheckCircle2, Paperclip, Download, X, Trash2 } from 'lucide-react';

interface SubmittalReviewProps {
  onSave: (sub: Submittal) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
  submittals: Submittal[];
}

const SubmittalReview: React.FC<SubmittalReviewProps> = ({ onSave, onDelete, onCancel, submittals }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [loading, setLoading] = useState(false);
  
  // Filter State
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Modal State
  const [attachmentModalData, setAttachmentModalData] = useState<{title: string, files: string[]} | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  
  // Basic Tracking Data
  const [title, setTitle] = useState('');
  const [specSection, setSpecSection] = useState('');
  const [trade, setTrade] = useState('');
  const [status, setStatus] = useState<Submittal['status']>('Pending');
  const [dueDate, setDueDate] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  
  // Analysis Data
  const [specText, setSpecText] = useState('');
  const [productData, setProductData] = useState('');
  const [reviewResult, setReviewResult] = useState<SubmittalReviewResponse | null>(null);

  const handleReview = async () => {
    if (!specText || !productData) return;
    setLoading(true);
    try {
      const response = await reviewSubmittal(specText, productData);
      setReviewResult(response);
      // Auto-suggest status based on AI result
      if (response.complianceStatus === 'Compliant') setStatus('For Review');
      if (response.complianceStatus === 'Rejected') setStatus('Rejected');
    } catch (e) {
      alert("Analysis failed. Check console or API key.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!title) {
        alert("Submittal Title is required.");
        return;
    }

    const newSub: Submittal = {
      id: Date.now().toString(),
      title,
      specSection: specSection || 'N/A',
      trade: trade || 'General',
      status,
      dueDate,
      attachments,
      dateCreated: new Date().toISOString(),
      aiAnalysis: reviewResult ? {
          summary: reviewResult.summary,
          complianceStatus: reviewResult.complianceStatus === 'Compliant' ? 'Compliant' : reviewResult.complianceStatus === 'Rejected' ? 'Rejected' : 'Deviations Noted',
          fullText: `**Summary:** ${reviewResult.summary}\n\n**Recommendation:** ${reviewResult.recommendation}`,
          missingInformation: reviewResult.missingInformation,
          discrepancies: reviewResult.discrepancies,
          recommendation: reviewResult.recommendation
      } : undefined
    };
    onSave(newSub);
    resetForm();
    setView('list');
  };

  const resetForm = () => {
    setTitle('');
    setSpecSection('');
    setTrade('');
    setStatus('Pending');
    setDueDate('');
    setAttachments([]);
    setSpecText('');
    setProductData('');
    setReviewResult(null);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
       const newFiles = Array.from(e.target.files).map((f: File) => f.name);
       setAttachments(prev => [...prev, ...newFiles]);
    }
  };

  const getStatusColor = (s: string) => {
    switch (s) {
        case 'Approved': 
        case 'Compliant':
            return 'text-green-600 bg-green-50 border-green-200';
        case 'Rejected': 
            return 'text-red-600 bg-red-50 border-red-200';
        case 'Revise & Resubmit': 
        case 'Deviations Noted':
            return 'text-orange-600 bg-orange-50 border-orange-200';
        case 'For Review': 
            return 'text-blue-600 bg-blue-50 border-blue-200';
        default: return 'text-gray-600 bg-gray-50 border-gray-200'; // Pending
    }
  };

  const filteredSubmittals = statusFilter === 'All' 
    ? submittals 
    : submittals.filter(s => s.status === statusFilter);

  // VIEW: LIST
  if (view === 'list') {
    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Submittal Manager</h2>
                    <p className="text-gray-500 text-sm">Track compliance and review status.</p>
                </div>
                <button 
                    onClick={() => setView('create')}
                    className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
                >
                    <Plus className="w-4 h-4" /> Create Submittal
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
                {['All', 'Pending', 'For Review', 'Approved', 'Revise & Resubmit', 'Rejected'].map(filter => (
                    <button
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-medium border transition-colors ${
                            statusFilter === filter 
                            ? 'bg-slate-800 text-white border-slate-800' 
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Submittal List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-100 bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-5 md:col-span-4">Title</div>
                    <div className="hidden md:block md:col-span-2">Spec Section</div>
                    <div className="hidden md:block md:col-span-2">Trade</div>
                    <div className="col-span-3 md:col-span-2">Due Date</div>
                    <div className="col-span-4 md:col-span-2 text-right">Status</div>
                </div>
                <div className="divide-y divide-gray-100">
                    {filteredSubmittals.length === 0 ? (
                        <div className="p-8 text-center text-gray-400">
                            No submittals found matching "{statusFilter}".
                        </div>
                    ) : (
                        filteredSubmittals.map(sub => (
                            <div key={sub.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors group">
                                <div className="col-span-5 md:col-span-4 flex items-center gap-2">
                                    <div className="font-medium text-gray-900 truncate" title={sub.title}>{sub.title}</div>
                                    {sub.attachments && sub.attachments.length > 0 && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setAttachmentModalData({ title: sub.title, files: sub.attachments! });
                                            }}
                                            className="ml-1 p-1 text-gray-400 hover:text-accent hover:bg-blue-50 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-accent"
                                            title={`${sub.attachments.length} Attachment(s) - Click to View`}
                                        >
                                            <Paperclip className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                    <div className="text-xs text-gray-400 mt-0.5 md:hidden w-full">{sub.specSection}</div>
                                </div>
                                <div className="hidden md:block md:col-span-2 text-sm text-gray-600">{sub.specSection}</div>
                                <div className="hidden md:block md:col-span-2 text-sm text-gray-600">
                                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-slate-100 text-slate-600">
                                        {sub.trade}
                                    </span>
                                </div>
                                <div className="col-span-3 md:col-span-2 text-sm text-gray-600 flex items-center gap-1">
                                    {sub.dueDate ? (
                                        <>
                                            <Calendar className="w-3 h-3 text-gray-400" />
                                            {new Date(sub.dueDate).toLocaleDateString()}
                                        </>
                                    ) : (
                                        <span className="text-gray-400 italic text-xs">No Date</span>
                                    )}
                                </div>
                                <div className="col-span-4 md:col-span-2 text-right flex items-center justify-end gap-2">
                                    <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusColor(sub.status)}`}>
                                        {sub.status}
                                    </span>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setItemToDelete(sub.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                        title="Delete Submittal"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Attachments Modal */}
            {attachmentModalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                        <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800 truncate pr-4 flex items-center gap-2">
                                <Paperclip className="w-4 h-4 text-gray-500" />
                                Attachments
                            </h3>
                            <button onClick={() => setAttachmentModalData(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-4 space-y-2 max-h-[60vh] overflow-y-auto">
                            <div className="text-xs text-gray-500 mb-2">
                                Files for: <span className="font-medium text-gray-700">{attachmentModalData.title}</span>
                            </div>
                            {attachmentModalData.files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 group transition-colors">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className="bg-blue-100 p-2 rounded-lg">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <span className="text-sm text-gray-700 truncate font-medium">{file}</span>
                                    </div>
                                    <button 
                                        className="p-2 text-gray-400 hover:text-accent hover:bg-white rounded-md transition-all shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100"
                                        title="Download (Simulation)"
                                        onClick={() => alert(`Downloading ${file}...\n\n(Note: In this local-only demo, actual file content download is simulated.)`)}
                                    >
                                        <Download className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 border-t bg-gray-50 text-right">
                            <button 
                                onClick={() => setAttachmentModalData(null)}
                                className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-100 text-gray-700 transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Delete Confirmation Modal */}
            {itemToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 text-center">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Submittal?</h3>
                            <p className="text-sm text-gray-500 mb-6">
                                Are you sure you want to delete this submittal? This action cannot be undone.
                            </p>
                            <div className="flex gap-3">
                                <button 
                                    onClick={() => setItemToDelete(null)}
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={() => {
                                        if (itemToDelete) onDelete(itemToDelete);
                                        setItemToDelete(null);
                                    }}
                                    className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-md shadow-red-500/20"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
  }

  // VIEW: CREATE / EDIT
  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
       <div className="flex items-center gap-4">
        <button 
            onClick={() => {
                resetForm();
                setView('list');
            }}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
        >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
           <h2 className="text-2xl font-bold text-gray-900">New Submittal</h2>
           <p className="text-gray-500 text-sm">Create and analyze a new submittal package.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Input Form */}
        <div className="xl:col-span-2 space-y-6">
            
            {/* 1. Basic Information */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-accent" /> Submittal Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-900 mb-1">Submittal Title *</label>
                        <input 
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent text-gray-900"
                            placeholder="e.g. Interior Latex Paint Product Data"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Spec Section</label>
                        <input 
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent text-gray-900"
                            placeholder="e.g. 09 90 00"
                            value={specSection}
                            onChange={(e) => setSpecSection(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Trade / Discipline</label>
                        <select 
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent text-gray-900"
                            value={trade}
                            onChange={(e) => setTrade(e.target.value)}
                        >
                            <option value="">Select Trade...</option>
                            <option value="General">General</option>
                            <option value="Concrete">Concrete</option>
                            <option value="Masonry">Masonry</option>
                            <option value="Metals">Metals</option>
                            <option value="Wood/Plastics">Wood & Plastics</option>
                            <option value="Thermal/Moisture">Thermal & Moisture</option>
                            <option value="Openings">Openings</option>
                            <option value="Finishes">Finishes</option>
                            <option value="Specialties">Specialties</option>
                            <option value="Equipment">Equipment</option>
                            <option value="Furnishings">Furnishings</option>
                            <option value="MEP">MEP</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Current Status</label>
                         <select 
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent text-gray-900"
                            value={status}
                            onChange={(e) => setStatus(e.target.value as Submittal['status'])}
                        >
                            <option value="Pending">Pending</option>
                            <option value="For Review">For Review</option>
                            <option value="Approved">Approved</option>
                            <option value="Revise & Resubmit">Revise & Resubmit</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-900 mb-1">Review Due Date</label>
                        <input 
                            type="date"
                            className="w-full p-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent text-gray-900"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                    </div>
                    <div className="md:col-span-2">
                         <label className="block text-sm font-medium text-gray-900 mb-1">Attachments</label>
                         <div className="flex items-center gap-2">
                             <label className="cursor-pointer flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors bg-white">
                                <Upload className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-600">Upload Documents</span>
                                <input type="file" multiple className="hidden" onChange={handleFileUpload} />
                            </label>
                             <span className="text-xs text-gray-400">{attachments.length} files attached</span>
                         </div>
                         {attachments.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {attachments.map((f, i) => (
                                    <span key={i} className="inline-flex items-center px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs border border-slate-200">
                                        {f}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 2. AI Analysis Input (Optional) */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                    <ScanSearch className="w-5 h-5 text-accent" /> 
                    AI Compliance Check <span className="text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full ml-2">Optional</span>
                </h3>
                <p className="text-sm text-gray-500 mb-4">Paste text below to have AI check for spec compliance automatically.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Spec Text Requirements</label>
                        <textarea 
                            className="w-full mt-1 p-2 h-40 bg-white border border-gray-300 rounded text-xs leading-relaxed resize-none focus:ring-2 focus:ring-accent text-gray-900"
                            placeholder="Paste relevant spec section text..."
                            value={specText}
                            onChange={(e) => setSpecText(e.target.value)}
                        ></textarea>
                     </div>
                     <div>
                        <label className="text-xs font-semibold text-gray-500 uppercase">Product Data Text</label>
                        <textarea 
                            className="w-full mt-1 p-2 h-40 bg-white border border-gray-300 rounded text-xs leading-relaxed resize-none focus:ring-2 focus:ring-accent text-gray-900"
                            placeholder="Paste product data text..."
                            value={productData}
                            onChange={(e) => setProductData(e.target.value)}
                        ></textarea>
                     </div>
                </div>
                <button 
                    onClick={handleReview}
                    disabled={loading || !specText || !productData}
                    className="mt-4 flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ScanSearch className="w-4 h-4" />}
                    Run Compliance Analysis
                </button>
            </div>
            
             <div className="flex gap-3 pt-2">
                  <button 
                    onClick={handleSave}
                    className="flex-1 bg-accent hover:bg-accent-hover text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                  >
                    <Save className="w-4 h-4" /> Save Submittal
                  </button>
                  <button 
                    onClick={() => setView('list')}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium"
                  >
                    Cancel
                  </button>
            </div>
        </div>

        {/* RIGHT COLUMN: AI Results Preview */}
        <div className="xl:col-span-1">
          {reviewResult ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-500 sticky top-6">
               {/* Header with detailed status */}
               <div className={`p-5 border-b flex justify-between items-start ${
                 reviewResult.complianceStatus === 'Compliant' ? 'bg-emerald-50 border-emerald-100' : 
                 reviewResult.complianceStatus === 'Rejected' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'
               }`}>
                  <div>
                    <h3 className={`font-bold text-lg ${
                         reviewResult.complianceStatus === 'Compliant' ? 'text-emerald-900' : 
                         reviewResult.complianceStatus === 'Rejected' ? 'text-red-900' : 'text-amber-900'
                    }`}>Analysis Results</h3>
                    <p className="text-xs text-gray-500 mt-1">Generated by AI Assistant</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border shadow-sm uppercase tracking-wide ${getStatusColor(reviewResult.complianceStatus)}`}>
                    {reviewResult.complianceStatus}
                  </div>
               </div>

               <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm">
                  
                  {/* Summary Section */}
                  <div>
                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                    <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                        {reviewResult.summary}
                    </p>
                  </div>

                  {/* Missing Info Section */}
                  {reviewResult.missingInformation.length > 0 && (
                    <div className="border border-amber-200 rounded-lg overflow-hidden">
                      <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h4 className="font-bold text-amber-900 text-xs uppercase tracking-wide">Missing Information</h4>
                      </div>
                      <ul className="divide-y divide-amber-100 bg-amber-50/30">
                        {reviewResult.missingInformation.map((item, idx) => (
                          <li key={idx} className="px-4 py-2 text-amber-800 text-sm flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Discrepancies Section */}
                  {reviewResult.discrepancies.length > 0 && (
                     <div className="border border-red-200 rounded-lg overflow-hidden">
                      <div className="bg-red-50 px-4 py-2 border-b border-red-100 flex items-center gap-2">
                        <XCircle className="w-4 h-4 text-red-600" />
                        <h4 className="font-bold text-red-900 text-xs uppercase tracking-wide">Discrepancies Found</h4>
                      </div>
                      <ul className="divide-y divide-red-100 bg-red-50/30">
                        {reviewResult.discrepancies.map((item, idx) => (
                          <li key={idx} className="px-4 py-2 text-red-800 text-sm flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Recommendation Section */}
                  <div className="mt-4">
                     <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">AI Recommendation</h4>
                     <div className={`p-4 rounded-lg border-l-4 ${
                         reviewResult.complianceStatus === 'Compliant' ? 'bg-emerald-50 border-emerald-500 text-emerald-800' :
                         reviewResult.complianceStatus === 'Rejected' ? 'bg-red-50 border-red-500 text-red-800' :
                         'bg-blue-50 border-blue-500 text-blue-800'
                     }`}>
                        <p className="font-medium">{reviewResult.recommendation}</p>
                     </div>
                  </div>
               </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50 min-h-[300px]">
               <ScanSearch className="w-12 h-12 mb-4 opacity-20" />
               <p className="font-medium">AI Analysis Ready</p>
               <p className="text-sm">Run analysis to see results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubmittalReview;