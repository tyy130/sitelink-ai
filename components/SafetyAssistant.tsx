import React, { useState } from 'react';
import { JHA, JHAResponse } from '../types';
import { generateJHA } from '../services/openaiService';
import { ShieldAlert, HardHat, Loader2, Save, Plus, Trash2, Printer } from 'lucide-react';

interface SafetyAssistantProps {
  onSave: (jha: JHA) => void;
  onCancel: () => void;
  existingJhas: JHA[];
}

const SafetyAssistant: React.FC<SafetyAssistantProps> = ({ onSave, onCancel, existingJhas }) => {
  const [taskInput, setTaskInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentJHA, setCurrentJHA] = useState<JHAResponse | null>(null);

  const handleGenerate = async () => {
    if (!taskInput) return;
    setLoading(true);
    try {
      const result = await generateJHA(taskInput);
      setCurrentJHA(result);
    } catch (e) {
      alert("Failed to generate JHA");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!currentJHA || !taskInput) return;
    const newJHA: JHA = {
      id: Date.now().toString(),
      taskName: taskInput,
      dateCreated: new Date().toISOString(),
      hazards: currentJHA.hazards,
      requiredPPE: currentJHA.requiredPPE,
      status: 'Active'
    };
    onSave(newJHA);
    setTaskInput('');
    setCurrentJHA(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Safety Assistant</h2>
          <p className="text-gray-500 text-sm">AI-Powered Job Hazard Analysis (JHA) Generator.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Input Section - Hidden on Print */}
        <div className="lg:col-span-1 space-y-6 print:hidden">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-accent" /> New JHA
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task / Activity Description</label>
                <textarea
                  value={taskInput}
                  onChange={(e) => setTaskInput(e.target.value)}
                  className="w-full h-32 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent resize-none text-sm text-gray-900"
                  placeholder="e.g. Excavating trench for new utility line using backhoe..."
                />
              </div>
              <button
                onClick={handleGenerate}
                disabled={loading || !taskInput}
                className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-slate-800 text-white py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <HardHat className="w-4 h-4" />}
                {loading ? 'Analyzing Hazards...' : 'Generate Safety Plan'}
              </button>
            </div>
          </div>

          {/* Recent List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
             <div className="p-4 border-b border-gray-100 bg-gray-50">
                <h3 className="font-semibold text-gray-700 text-sm">Active Safety Plans</h3>
             </div>
             <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {existingJhas.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-400">No active JHAs</div>
                ) : (
                  existingJhas.map(jha => (
                    <div key={jha.id} className="p-3 hover:bg-gray-50">
                      <div className="font-medium text-gray-900 text-sm">{jha.taskName}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(jha.dateCreated).toLocaleDateString()} • {jha.hazards.length} Hazards Identified
                      </div>
                    </div>
                  ))
                )}
             </div>
          </div>
        </div>

        {/* Results/Preview Section - Expands on Print */}
        <div className="lg:col-span-2 print:col-span-3 print:w-full print:absolute print:top-0 print:left-0">
          {currentJHA ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden animate-in fade-in slide-in-from-bottom-2 print:shadow-none print:border-none print:rounded-none">
              <div className="p-6 border-b border-gray-100 bg-slate-50 flex justify-between items-center print:bg-white print:border-b-2 print:border-gray-900 print:mb-4">
                 <div>
                    <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">Job Hazard Analysis (JHA)</h3>
                    <p className="text-lg font-medium text-gray-700 mt-1">Task: {taskInput}</p>
                    <p className="text-xs text-gray-500 mt-1 print:hidden">Generated by AI • Please Review Before Use</p>
                    <p className="hidden print:block text-xs text-gray-500 mt-1">Date: {new Date().toLocaleDateString()}</p>
                 </div>
                 <div className="flex gap-2 print:hidden">
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg text-sm font-medium">
                       <Save className="w-4 h-4" /> Save
                    </button>
                    <button 
                      onClick={() => window.print()} 
                      className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white rounded border border-transparent hover:border-gray-300"
                      title="Print PDF"
                    >
                       <Printer className="w-4 h-4" />
                    </button>
                 </div>
              </div>

              <div className="p-6 space-y-6 print:p-0">
                {/* PPE Section */}
                <div>
                   <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider border-b pb-2 print:text-black">Required PPE</h4>
                   <div className="flex flex-wrap gap-2">
                      {currentJHA.requiredPPE.map((ppe, i) => (
                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100 flex items-center gap-2 print:bg-white print:border-gray-300 print:text-black">
                           <ShieldAlert className="w-3 h-3" /> {ppe}
                        </span>
                      ))}
                   </div>
                </div>

                {/* Hazards Table */}
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-3 tracking-wider border-b pb-2 print:text-black">Hazard Analysis & Controls</h4>
                  <div className="border rounded-lg overflow-hidden print:border-gray-300">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-600 font-semibold border-b print:bg-gray-200 print:text-black">
                        <tr>
                          <th className="p-3 w-1/4">Hazard</th>
                          <th className="p-3 w-1/4">Consequence</th>
                          <th className="p-3 w-1/2">Control Measure</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 print:divide-gray-300">
                        {currentJHA.hazards.map((h, i) => (
                          <tr key={i} className="hover:bg-gray-50 print:bg-white">
                            <td className="p-3 align-top font-medium text-gray-900">{h.hazard}</td>
                            <td className="p-3 align-top text-red-600 print:text-black">{h.consequence}</td>
                            <td className="p-3 align-top text-green-700 bg-green-50/30 print:bg-white print:text-black">{h.control}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Print Only Signatures */}
                <div className="hidden print:block mt-12 pt-8 border-t border-gray-300">
                   <div className="grid grid-cols-2 gap-12">
                      <div>
                         <div className="border-b border-gray-400 h-8"></div>
                         <p className="text-xs uppercase mt-1 font-bold">Supervisor Signature</p>
                      </div>
                      <div>
                         <div className="border-b border-gray-400 h-8"></div>
                         <p className="text-xs uppercase mt-1 font-bold">Safety Officer Signature</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50 min-h-[400px] print:hidden">
               <HardHat className="w-16 h-16 mb-4 opacity-20" />
               <h3 className="text-lg font-medium text-gray-500">Ready to Analyze</h3>
               <p className="max-w-md mx-auto mt-2">Enter a task description on the left. The Safety Assistant will identify potential hazards and recommend controls instantly.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SafetyAssistant;