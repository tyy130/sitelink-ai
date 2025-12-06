
import React, { useState } from 'react';
import { Project } from '../types';
import { Plus, Briefcase, MapPin, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';

interface ProjectManagerProps {
    projects: Project[];
    activeProjectId: string | null;
    onSwitchProject: (projectId: string) => void;
    onCreateProject: (project: Project) => void;
    onCancel: () => void;
}

const ProjectManager: React.FC<ProjectManagerProps> = ({ projects, activeProjectId, onSwitchProject, onCreateProject, onCancel }) => {
    const [isCreating, setIsCreating] = useState(false);
    
    // Form State
    const [name, setName] = useState('');
    const [jobNumber, setJobNumber] = useState('');
    const [location, setLocation] = useState('');

    const handleCreate = () => {
        if (!name || !jobNumber) return;
        
        const newProject: Project = {
            id: Date.now().toString(),
            name,
            jobNumber,
            location,
            dateCreated: new Date().toISOString()
        };
        
        onCreateProject(newProject);
        setIsCreating(false);
        setName('');
        setJobNumber('');
        setLocation('');
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-gray-900">Project Selection</h2>
                    <p className="text-gray-500 mt-1">Manage multiple job sites and switch active context.</p>
                </div>
                <button 
                    onClick={onCancel}
                    className="text-sm text-gray-500 hover:text-gray-900"
                >
                    Back to Dashboard
                </button>
            </div>

            {isCreating ? (
                <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-accent" /> Start New Project
                    </h3>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                            <input 
                                className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent"
                                placeholder="e.g. Downtown Medical Center"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                autoFocus
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Job Number *</label>
                                <input 
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent"
                                    placeholder="e.g. 24-005"
                                    value={jobNumber}
                                    onChange={e => setJobNumber(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Location / Address</label>
                                <input 
                                    className="w-full p-3 bg-white border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-accent"
                                    placeholder="e.g. 123 Main St"
                                    value={location}
                                    onChange={e => setLocation(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-8">
                        <button 
                            onClick={handleCreate}
                            disabled={!name || !jobNumber}
                            className="flex-1 bg-primary hover:bg-slate-800 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                        >
                            Create Project
                        </button>
                        <button 
                            onClick={() => setIsCreating(false)}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Create New Card */}
                    <button 
                        onClick={() => setIsCreating(true)}
                        className="flex flex-col items-center justify-center p-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-white hover:border-accent hover:text-accent transition-all group h-full min-h-[200px]"
                    >
                        <div className="bg-white p-4 rounded-full shadow-sm mb-4 group-hover:shadow-md transition-shadow">
                            <Plus className="w-6 h-6 text-gray-400 group-hover:text-accent" />
                        </div>
                        <span className="font-bold text-gray-600 group-hover:text-accent">Create New Project</span>
                    </button>

                    {/* Existing Projects */}
                    {projects.map(project => {
                        const isActive = project.id === activeProjectId;
                        return (
                            <div 
                                key={project.id}
                                onClick={() => !isActive && onSwitchProject(project.id)}
                                className={`relative p-6 rounded-xl border-2 transition-all text-left flex flex-col h-full ${
                                    isActive 
                                    ? 'bg-white border-accent shadow-lg ring-1 ring-accent' 
                                    : 'bg-white border-transparent shadow-sm hover:border-gray-300 cursor-pointer'
                                }`}
                            >
                                {isActive && (
                                    <div className="absolute top-4 right-4 text-accent flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full text-xs font-bold">
                                        <CheckCircle2 className="w-3 h-3" /> Active
                                    </div>
                                )}
                                
                                <div className="mb-4">
                                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${isActive ? 'bg-accent text-white' : 'bg-gray-100 text-gray-500'}`}>
                                        <Briefcase className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-1" title={project.name}>{project.name}</h3>
                                    <div className="text-sm text-gray-500 font-mono mt-1">Job #: {project.jobNumber}</div>
                                </div>
                                
                                <div className="mt-auto space-y-2 pt-4 border-t border-gray-100">
                                    {project.location && (
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <MapPin className="w-3.5 h-3.5" />
                                            <span className="truncate">{project.location}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Started {new Date(project.dateCreated).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {!isActive && (
                                    <div className="mt-4 pt-2">
                                        <div className="text-accent text-sm font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Open Project <ArrowRight className="w-4 h-4" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectManager;
