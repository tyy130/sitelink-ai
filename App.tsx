
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import RFIDrafter from './components/RFIDrafter';
import SubmittalReview from './components/SubmittalReview';
import SafetyAssistant from './components/SafetyAssistant';
import DailyLogs from './components/DailyLogs';
import PunchList from './components/PunchList';
import LaborTracker from './components/LaborTracker';
import MaterialTracker from './components/MaterialTracker';
import FieldIssues from './components/FieldIssues';
import InspectionManager from './components/InspectionManager';
import ToolboxTalks from './components/ToolboxTalks';
import EquipmentTracker from './components/EquipmentTracker';
import ProjectManager from './components/ProjectManager';
import { ViewState, RFI, Submittal, JHA, DailyLog, PunchItem, LaborEntry, MaterialDelivery, FieldIssue, Priority, Project, Inspection, ToolboxTalk, EquipmentItem } from './types';
import { Menu, HardHat, Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Project State
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);

  // Staging state for RFI duplication
  const [rfiDraftData, setRfiDraftData] = useState<RFI | null>(null);
  
  // Data State (Scoped to Project)
  const [rfis, setRfis] = useState<RFI[]>([]);
  const [submittals, setSubmittals] = useState<Submittal[]>([]);
  const [jhas, setJhas] = useState<JHA[]>([]);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [punchList, setPunchList] = useState<PunchItem[]>([]);
  const [laborEntries, setLaborEntries] = useState<LaborEntry[]>([]);
  const [deliveries, setDeliveries] = useState<MaterialDelivery[]>([]);
  const [issues, setIssues] = useState<FieldIssue[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [toolboxTalks, setToolboxTalks] = useState<ToolboxTalk[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);

  // 1. Initialization & Migration Effect
  useEffect(() => {
    const storedProjectsStr = localStorage.getItem('sitelink_projects');
    let loadedProjects: Project[] = storedProjectsStr ? JSON.parse(storedProjectsStr) : [];
    
    // Check if we need to migrate legacy global data to a project
    if (loadedProjects.length === 0) {
       const hasLegacyData = localStorage.getItem('sitelink_rfis') !== null;
       
       const defaultProject: Project = {
           id: 'default-project',
           name: 'Main Project',
           jobNumber: '001',
           location: 'General Site',
           dateCreated: new Date().toISOString()
       };
       
       if (hasLegacyData) {
           console.log("Migrating legacy data to default project...");
           const keys = [
               { old: 'sitelink_rfis', new: `sitelink_project_${defaultProject.id}_rfis` },
               { old: 'sitelink_submittals', new: `sitelink_project_${defaultProject.id}_submittals` },
               { old: 'sitelink_jhas', new: `sitelink_project_${defaultProject.id}_jhas` },
               { old: 'sitelink_logs', new: `sitelink_project_${defaultProject.id}_logs` },
               { old: 'sitelink_punch', new: `sitelink_project_${defaultProject.id}_punch` },
               { old: 'sitelink_labor', new: `sitelink_project_${defaultProject.id}_labor` },
               { old: 'sitelink_deliveries', new: `sitelink_project_${defaultProject.id}_deliveries` },
               { old: 'sitelink_issues', new: `sitelink_project_${defaultProject.id}_issues` },
           ];
           
           keys.forEach(k => {
               const val = localStorage.getItem(k.old);
               if (val) {
                   localStorage.setItem(k.new, val);
                   // Optional: localStorage.removeItem(k.old); 
               }
           });
       }
       
       loadedProjects = [defaultProject];
       localStorage.setItem('sitelink_projects', JSON.stringify(loadedProjects));
    }
    
    setProjects(loadedProjects);
    
    // Determine active project
    const lastActive = localStorage.getItem('sitelink_active_project_id');
    const validActive = loadedProjects.find(p => p.id === lastActive) ? lastActive : loadedProjects[0].id;
    
    setActiveProjectId(validActive);
    setIsLoading(false);
  }, []);

  // 2. Load Data when Active Project Changes
  useEffect(() => {
      if (!activeProjectId) return;
      localStorage.setItem('sitelink_active_project_id', activeProjectId);
      
      const prefix = `sitelink_project_${activeProjectId}_`;
      
      const load = (key: string) => {
          const val = localStorage.getItem(`${prefix}${key}`);
          return val ? JSON.parse(val) : [];
      };

      setRfis(load('rfis'));
      setSubmittals(load('submittals'));
      setJhas(load('jhas'));
      setLogs(load('logs'));
      setPunchList(load('punch'));
      setLaborEntries(load('labor'));
      setDeliveries(load('deliveries'));
      setIssues(load('issues'));
      setInspections(load('inspections'));
      setToolboxTalks(load('toolbox_talks'));
      setEquipment(load('equipment'));

  }, [activeProjectId]);

  // 3. Save Data Effects (Scoped)
  const saveToProject = (key: string, data: any) => {
      if (!activeProjectId) return;
      localStorage.setItem(`sitelink_project_${activeProjectId}_${key}`, JSON.stringify(data));
  };

  useEffect(() => { saveToProject('rfis', rfis); }, [rfis, activeProjectId]);
  useEffect(() => { saveToProject('submittals', submittals); }, [submittals, activeProjectId]);
  useEffect(() => { saveToProject('jhas', jhas); }, [jhas, activeProjectId]);
  useEffect(() => { saveToProject('logs', logs); }, [logs, activeProjectId]);
  useEffect(() => { saveToProject('punch', punchList); }, [punchList, activeProjectId]);
  useEffect(() => { saveToProject('labor', laborEntries); }, [laborEntries, activeProjectId]);
  useEffect(() => { saveToProject('deliveries', deliveries); }, [deliveries, activeProjectId]);
  useEffect(() => { saveToProject('issues', issues); }, [issues, activeProjectId]);
  useEffect(() => { saveToProject('inspections', inspections); }, [inspections, activeProjectId]);
  useEffect(() => { saveToProject('toolbox_talks', toolboxTalks); }, [toolboxTalks, activeProjectId]);
  useEffect(() => { saveToProject('equipment', equipment); }, [equipment, activeProjectId]);


  // Project Management Handlers
  const handleCreateProject = (newProject: Project) => {
      const updatedProjects = [...projects, newProject];
      setProjects(updatedProjects);
      localStorage.setItem('sitelink_projects', JSON.stringify(updatedProjects));
      setActiveProjectId(newProject.id); // Auto switch
      setCurrentView(ViewState.DASHBOARD);
  };

  const handleSwitchProject = (id: string) => {
      setActiveProjectId(id);
      setCurrentView(ViewState.DASHBOARD);
  };

  // Data Handlers
  const handleViewChange = (view: ViewState) => {
    if (view !== ViewState.RFI_DRAFT) {
        setRfiDraftData(null);
    }
    setRfiDraftData(null);
    setCurrentView(view);
  };

  const handleDuplicateRFI = (rfi: RFI) => {
    setRfiDraftData(rfi);
    setCurrentView(ViewState.RFI_DRAFT);
  };

  const handleSaveRFI = (rfi: RFI) => {
    setRfis(prev => [rfi, ...prev]);
    setRfiDraftData(null);
    setCurrentView(ViewState.DASHBOARD);
  };

  const handleSaveSubmittal = (sub: Submittal) => {
    setSubmittals(prev => [sub, ...prev]);
  };

  const handleDeleteSubmittal = (id: string) => {
    setSubmittals(prev => prev.filter(s => s.id !== id));
  };

  const handleSaveJHA = (jha: JHA) => {
    setJhas(prev => [jha, ...prev]);
  };

  const handleSaveLog = (log: DailyLog) => {
    setLogs(prev => [log, ...prev]);
  };

  const handleSavePunch = (item: PunchItem) => setPunchList(prev => [item, ...prev]);
  const handleUpdatePunch = (id: string, updates: Partial<PunchItem>) => {
    setPunchList(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  };
  const handleDeletePunch = (id: string) => setPunchList(prev => prev.filter(i => i.id !== id));

  const handleSaveLabor = (entry: LaborEntry) => setLaborEntries(prev => [entry, ...prev]);
  const handleDeleteLabor = (id: string) => setLaborEntries(prev => prev.filter(e => e.id !== id));

  const handleSaveDelivery = (d: MaterialDelivery) => setDeliveries(prev => [d, ...prev]);
  const handleDeleteDelivery = (id: string) => setDeliveries(prev => prev.filter(d => d.id !== id));

  const handleSaveIssue = (issue: FieldIssue) => setIssues(prev => [issue, ...prev]);
  const handleDeleteIssue = (id: string) => setIssues(prev => prev.filter(i => i.id !== id));

  const handleConvertIssueToRFI = (issue: FieldIssue) => {
     setIssues(prev => prev.map(i => i.id === issue.id ? { ...i, status: 'RFI Drafted' } : i));
     const mockRFI: RFI = {
       id: 'temp',
       subject: `Issue at ${issue.location}`,
       question: issue.description,
       suggestion: '',
       drawingRef: '',
       specRef: '',
       priority: issue.urgency,
       dateCreated: new Date().toISOString(),
       status: 'Draft'
     };
     setRfiDraftData(mockRFI);
     setCurrentView(ViewState.RFI_DRAFT);
  };
  
  const handleSaveInspection = (i: Inspection) => setInspections(prev => [i, ...prev]);
  const handleDeleteInspection = (id: string) => setInspections(prev => prev.filter(i => i.id !== id));
  
  const handleSaveToolboxTalk = (t: ToolboxTalk) => setToolboxTalks(prev => [t, ...prev]);
  const handleDeleteToolboxTalk = (id: string) => setToolboxTalks(prev => prev.filter(t => t.id !== id));

  const handleSaveEquipment = (e: EquipmentItem) => setEquipment(prev => [e, ...prev]);
  const handleUpdateEquipment = (id: string, updates: Partial<EquipmentItem>) => setEquipment(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  const handleDeleteEquipment = (id: string) => setEquipment(prev => prev.filter(e => e.id !== id));

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  if (isLoading) {
      return (
          <div className="min-h-screen bg-slate-50 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-gray-500 font-medium">Loading Project Data...</p>
              </div>
          </div>
      );
  }

  const renderView = () => {
    switch (currentView) {
      case ViewState.PROJECTS:
        return (
            <ProjectManager 
                projects={projects}
                activeProjectId={activeProjectId}
                onCreateProject={handleCreateProject}
                onSwitchProject={handleSwitchProject}
                onCancel={() => setCurrentView(ViewState.DASHBOARD)}
            />
        );
      case ViewState.DASHBOARD:
        return (
          <Dashboard 
            rfis={rfis} 
            submittals={submittals} 
            logs={logs}
            jhas={jhas}
            changeView={handleViewChange}
            onDuplicate={handleDuplicateRFI}
          />
        );
      case ViewState.RFI_DRAFT:
        return (
          <RFIDrafter 
            onSave={handleSaveRFI} 
            onCancel={() => handleViewChange(ViewState.DASHBOARD)}
            initialData={rfiDraftData}
          />
        );
      case ViewState.SUBMITTAL_REVIEW:
        return (
          <SubmittalReview 
            onSave={handleSaveSubmittal} 
            onDelete={handleDeleteSubmittal}
            onCancel={() => handleViewChange(ViewState.DASHBOARD)}
            submittals={submittals}
          />
        );
      case ViewState.SAFETY_ASSISTANT:
        return (
          <SafetyAssistant
            onSave={handleSaveJHA}
            onCancel={() => handleViewChange(ViewState.DASHBOARD)}
            existingJhas={jhas}
          />
        );
      case ViewState.DAILY_LOGS:
        return (
          <DailyLogs 
            onSave={handleSaveLog} 
            logs={logs} 
            todayIssues={issues}
            todayLabor={laborEntries}
            todayJhas={jhas}
          />
        );
      case ViewState.PUNCH_LIST:
        return (
          <PunchList 
            items={punchList} 
            onSave={handleSavePunch} 
            onUpdate={handleUpdatePunch} 
            onDelete={handleDeletePunch} 
          />
        );
      case ViewState.LABOR_TRACKER:
        return (
          <LaborTracker 
            entries={laborEntries} 
            onSave={handleSaveLabor} 
            onDelete={handleDeleteLabor} 
          />
        );
      case ViewState.MATERIAL_TRACKER:
        return (
          <MaterialTracker 
            deliveries={deliveries} 
            onSave={handleSaveDelivery} 
            onDelete={handleDeleteDelivery}
            submittals={submittals}
          />
        );
      case ViewState.FIELD_ISSUES:
        return (
          <FieldIssues 
            issues={issues} 
            onSave={handleSaveIssue} 
            onDelete={handleDeleteIssue}
            onConvertToRFI={handleConvertIssueToRFI}
          />
        );
      case ViewState.INSPECTION_MANAGER:
        return (
           <InspectionManager 
              inspections={inspections}
              onSave={handleSaveInspection}
              onDelete={handleDeleteInspection}
           />
        );
      case ViewState.TOOLBOX_TALKS:
        return (
           <ToolboxTalks 
              talks={toolboxTalks}
              onSave={handleSaveToolboxTalk}
              onDelete={handleDeleteToolboxTalk}
           />
        );
      case ViewState.EQUIPMENT_TRACKER:
        return (
           <EquipmentTracker 
              equipment={equipment}
              onSave={handleSaveEquipment}
              onUpdate={handleUpdateEquipment}
              onDelete={handleDeleteEquipment}
           />
        );
      default:
        return <div>View not found</div>;
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-primary text-white p-4 flex items-center justify-between sticky top-0 z-20 shadow-md print:hidden">
        <div className="flex items-center gap-2">
          <div className="bg-accent p-1.5 rounded-lg">
            <HardHat className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold tracking-tight text-sm">SiteLink AI</span>
            <span className="text-[10px] text-gray-400 truncate max-w-[150px]">{activeProject?.name || 'Loading...'}</span>
          </div>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 hover:bg-white/10 rounded-lg transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <Sidebar 
        currentView={currentView} 
        setView={handleViewChange}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        activeProject={activeProject}
        onManageProjects={() => setCurrentView(ViewState.PROJECTS)}
      />
      
      <main className="flex-1 md:ml-64 p-4 md:p-8 transition-all duration-300 print:ml-0 print:p-0">
        <div className="max-w-7xl mx-auto print:max-w-none print:mx-0">
          {renderView()}
        </div>
      </main>
    </div>
  );
};

export default App;
