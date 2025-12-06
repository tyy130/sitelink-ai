
import React, { useState } from 'react';
import { ToolboxTalk, ToolboxTalkResponse } from '../types';
import { generateToolboxTalk } from '../services/geminiService';
import { Users, Loader2, Sparkles, Plus, CheckCircle, UserPlus, Trash2 } from 'lucide-react';

interface ToolboxTalksProps {
  talks: ToolboxTalk[];
  onSave: (talk: ToolboxTalk) => void;
  onDelete: (id: string) => void;
}

const ToolboxTalks: React.FC<ToolboxTalksProps> = ({ talks, onSave, onDelete }) => {
  const [view, setView] = useState<'list' | 'create'>('list');
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ToolboxTalkResponse | null>(null);
  const [attendeeName, setAttendeeName] = useState('');
  const [attendees, setAttendees] = useState<{id: string, name: string, signatureTime: string}[]>([]);

  const handleGenerate = async () => {
    if (!topic) return;
    setLoading(true);
    try {
      const result = await generateToolboxTalk(topic);
      setGeneratedContent(result);
    } catch (e) {
      alert("Failed to generate content.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAttendee = () => {
    if (!attendeeName) return;
    setAttendees(prev => [...prev, {
      id: Date.now().toString(),
      name: attendeeName,
      signatureTime: new Date().toLocaleTimeString()
    }]);
    setAttendeeName('');
  };

  const handleSave = () => {
    if (!generatedContent) return;
    const newTalk: ToolboxTalk = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      topic: generatedContent.topic,
      content: {
        keyPoints: generatedContent.keyPoints,
        discussionQuestions: generatedContent.discussionQuestions
      },
      attendees,
      notes: ''
    };
    onSave(newTalk);
    resetForm();
    setView('list');
  };

  const resetForm = () => {
    setTopic('');
    setGeneratedContent(null);
    setAttendees([]);
    setAttendeeName('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Toolbox Talk Library</h2>
          <p className="text-gray-500 text-sm">AI-generated safety meetings and attendance tracking.</p>
        </div>
        <button 
             onClick={() => setView(view === 'list' ? 'create' : 'list')}
             className="bg-primary hover:bg-slate-800 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
        >
             {view === 'list' ? <><Plus className="w-4 h-4" /> New Safety Talk</> : 'Back to Library'}
        </button>
      </div>

      {view === 'create' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
           {/* Generator Column */}
           <div className="space-y-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-accent" /> Topic Generator
                 </h3>
                 <div className="flex gap-2">
                    <input 
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                      placeholder="e.g. Ladder Safety, Heat Stress, Excavation"
                      value={topic}
                      onChange={e => setTopic(e.target.value)}
                    />
                    <button 
                      onClick={handleGenerate}
                      disabled={loading || !topic}
                      className="bg-accent hover:bg-accent-hover text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                       {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate'}
                    </button>
                 </div>
              </div>

              {generatedContent && (
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">{generatedContent.topic}</h3>
                    
                    <div className="mb-6">
                       <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Key Safety Points</h4>
                       <ul className="space-y-2">
                          {generatedContent.keyPoints.map((point, i) => (
                             <li key={i} className="flex items-start gap-2 text-sm text-gray-800">
                                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                                {point}
                             </li>
                          ))}
                       </ul>
                    </div>

                    <div className="mb-6">
                       <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Discussion Questions</h4>
                       <ul className="space-y-2 list-disc pl-5 text-sm text-gray-800">
                          {generatedContent.discussionQuestions.map((q, i) => (
                             <li key={i}>{q}</li>
                          ))}
                       </ul>
                    </div>
                 </div>
              )}
           </div>

           {/* Attendance Column */}
           <div className="space-y-6">
              <div className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-full flex flex-col ${!generatedContent ? 'opacity-50 pointer-events-none' : ''}`}>
                 <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-500" /> Attendance Log
                 </h3>
                 
                 <div className="flex gap-2 mb-4">
                    <input 
                      className="flex-1 p-2 bg-white border border-gray-300 rounded-lg text-sm text-gray-900"
                      placeholder="Worker Name"
                      value={attendeeName}
                      onChange={e => setAttendeeName(e.target.value)}
                    />
                    <button 
                      onClick={handleAddAttendee}
                      className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                       <UserPlus className="w-4 h-4" />
                    </button>
                 </div>

                 <div className="flex-1 border border-gray-200 rounded-lg bg-gray-50 overflow-hidden mb-4">
                    <table className="w-full text-sm text-left">
                       <thead className="bg-gray-100 text-xs text-gray-500 uppercase font-semibold">
                          <tr>
                             <th className="p-3">Name</th>
                             <th className="p-3 text-right">Time Signed</th>
                          </tr>
                       </thead>
                       <tbody className="divide-y divide-gray-200">
                          {attendees.map(a => (
                             <tr key={a.id} className="bg-white">
                                <td className="p-3 font-medium text-gray-900">{a.name}</td>
                                <td className="p-3 text-right text-gray-500 font-mono text-xs">{a.signatureTime}</td>
                             </tr>
                          ))}
                          {attendees.length === 0 && (
                             <tr>
                                <td colSpan={2} className="p-8 text-center text-gray-400">No attendees signed in.</td>
                             </tr>
                          )}
                       </tbody>
                    </table>
                 </div>

                 <button 
                    onClick={handleSave}
                    className="w-full bg-primary hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors"
                 >
                    Save Meeting Record
                 </button>
              </div>
           </div>
        </div>
      )}

      {view === 'list' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {talks.length === 0 ? (
               <div className="col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">
                  <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                  <p>No Toolbox Talks recorded.</p>
               </div>
            ) : (
               talks.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(talk => (
                  <div key={talk.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group relative">
                     <button onClick={() => onDelete(talk.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500">
                        <Trash2 className="w-4 h-4" />
                     </button>
                     <div className="text-xs font-bold text-gray-400 uppercase mb-1">{new Date(talk.date).toLocaleDateString()}</div>
                     <h3 className="font-bold text-gray-900 mb-3 pr-8">{talk.topic}</h3>
                     <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                        <Users className="w-4 h-4 text-blue-500" />
                        <span className="font-bold">{talk.attendees.length}</span> Attendees
                     </div>
                     <div className="space-y-1">
                        {talk.content.keyPoints.slice(0, 2).map((pt, i) => (
                           <p key={i} className="text-xs text-gray-500 truncate">• {pt}</p>
                        ))}
                     </div>
                  </div>
               ))
            )}
         </div>
      )}
    </div>
  );
};

export default ToolboxTalks;
