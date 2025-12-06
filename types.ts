
export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  RFI_DRAFT = 'RFI_DRAFT',
  SUBMITTAL_REVIEW = 'SUBMITTAL_REVIEW',
  SAFETY_ASSISTANT = 'SAFETY_ASSISTANT',
  DAILY_LOGS = 'DAILY_LOGS',
  PUNCH_LIST = 'PUNCH_LIST',
  LABOR_TRACKER = 'LABOR_TRACKER',
  MATERIAL_TRACKER = 'MATERIAL_TRACKER',
  FIELD_ISSUES = 'FIELD_ISSUES',
  INSPECTION_MANAGER = 'INSPECTION_MANAGER',
  TOOLBOX_TALKS = 'TOOLBOX_TALKS',
  EQUIPMENT_TRACKER = 'EQUIPMENT_TRACKER',
  HISTORY = 'HISTORY',
  PROJECTS = 'PROJECTS'
}

export enum Priority {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical'
}

export interface Project {
  id: string;
  name: string;
  jobNumber: string;
  location: string;
  dateCreated: string;
}

export interface RFI {
  id: string;
  subject: string;
  question: string;
  suggestion: string;
  drawingRef: string;
  specRef: string;
  priority: Priority;
  dueDate?: string;
  attachments?: string[];
  dateCreated: string;
  status: 'Draft' | 'Sent' | 'Closed';
}

export interface Submittal {
  id: string;
  title: string;
  specSection: string;
  trade: string;
  status: 'Pending' | 'For Review' | 'Approved' | 'Revise & Resubmit' | 'Rejected';
  dueDate?: string;
  attachments?: string[];
  aiAnalysis?: {
    summary: string;
    complianceStatus: 'Compliant' | 'Deviations Noted' | 'Rejected' | 'Pending';
    fullText: string;
    missingInformation?: string[];
    discrepancies?: string[];
    recommendation?: string;
  };
  dateCreated: string;
}

export interface JHA {
  id: string;
  taskName: string;
  dateCreated: string;
  hazards: {
    hazard: string;
    consequence: string;
    control: string;
  }[];
  requiredPPE: string[];
  status: 'Draft' | 'Active' | 'Archived';
}

export interface DailyLog {
  id: string;
  date: string;
  weather: string;
  temperature: string;
  crewSize: number;
  workPerformed: string;
  delays: string;
  status: 'Draft' | 'Submitted';
}

// New Module Interfaces

export interface PunchItem {
  id: string;
  description: string;
  location: string;
  trade: string;
  status: 'Open' | 'Completed' | 'Verified';
  priority: Priority;
  photos: string[];
  dateCreated: string;
}

export interface LaborEntry {
  id: string;
  date: string;
  subcontractor: string;
  crewCount: number;
  hoursWorked: number;
  notes: string;
}

export interface MaterialDelivery {
  id: string;
  date: string;
  material: string;
  supplier: string;
  status: 'Received' | 'Partial' | 'Damaged' | 'Rejected';
  notes: string;
  photos: string[];
  submittalId?: string;
}

export interface FieldIssue {
  id: string;
  description: string;
  location: string;
  urgency: Priority;
  status: 'Open' | 'Resolved' | 'RFI Drafted';
  photos: string[];
  dateCreated: string;
}

export interface Inspection {
  id: string;
  date: string;
  type: string; // e.g., "Framing", "Electrical Rough-in"
  location: string;
  inspectorName: string;
  status: 'Pass' | 'Fail' | 'Conditional' | 'Scheduled';
  comments: string;
  photos: string[];
  dateCreated: string;
}

export interface Attendee {
  id: string;
  name: string;
  signatureTime: string;
}

export interface ToolboxTalk {
  id: string;
  date: string;
  topic: string;
  content: {
    keyPoints: string[];
    discussionQuestions: string[];
  };
  attendees: Attendee[];
  notes: string;
}

export interface EquipmentItem {
  id: string;
  name: string; // e.g., "Scissor Lift #4"
  type: string;
  status: 'Active' | 'Maintenance' | 'Retired';
  hoursUsed: number;
  lastMaintenanceDate?: string;
  notes: string;
  photo?: string;
  aiMaintenancePrediction?: {
    maintenanceNeeded: boolean;
    reason: string;
    recommendedAction: string;
    predictionDate: string;
  };
}

// AI Service Types
export interface RFIDraftResponse {
  subject: string;
  formattedQuestion: string;
  suggestedSolution: string;
  impactAssessment: string;
}

export interface SubmittalReviewResponse {
  summary: string;
  complianceStatus: 'Compliant' | 'Deviations Noted' | 'Rejected';
  missingInformation: string[];
  discrepancies: string[];
  recommendation: string;
}

export interface JHAResponse {
  hazards: {
    hazard: string;
    consequence: string;
    control: string;
  }[];
  requiredPPE: string[];
}

export interface ToolboxTalkResponse {
  topic: string;
  keyPoints: string[];
  discussionQuestions: string[];
}

export interface MaintenancePredictionResponse {
  maintenanceNeeded: boolean;
  reason: string;
  recommendedAction: string;
}
