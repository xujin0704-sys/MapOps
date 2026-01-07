
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon?: LucideIcon;
  children?: MenuItem[];
  path?: string; // Identifier for the view
}

export interface KPICardProps {
  title: string;
  value: string;
  trend: string;
  trendUp: boolean;
  icon: LucideIcon;
}

export enum TaskStatus {
  PENDING = 'Pending',
  PROCESSING = 'Processing',
  REVIEW = 'Manual Review',
  COMPLETED = 'Completed'
}

export interface PipelineTask {
  id: string;
  name: string;
  status: TaskStatus;
  aiConfidence: number;
  priority: 'High' | 'Medium' | 'Low';
  type: 'Road' | 'POI' | 'Building';
}

export interface TaskPackage {
    id: string;
    region: string;
    gridCells: string;
    progressCurrent: number;
    progressTotal: number;
    aiStatus: 'Completed' | 'Processing' | 'Failed';
    slaRemainingHours: number;
    pipeline: 'Road' | 'POI' | 'Building' | 'Admin' | 'Address' | 'DoorToDoor' | 'Parking';
}

export interface PromptLog {
  id: string;
  prompt: string;
  model: string;
  timestamp: string;
  previewUrl: string;
}

export interface JobClue {
  id: string;
  type: 'road_change' | 'poi_new' | 'admin_adjust' | 'water_change';
  location: { x: number; y: number; label: string }; // x,y in percentage for mock map
  confidence: number;
  status: 'pending' | 'promoted' | 'ignored';
  source: string; // e.g., 'Satellite_Img_2023', 'User_Report'
  timestamp: string;
  description: string;
  relatedClues?: number; // Count of aggregated signals
}

export interface PipelineTreeItem {
  id: string;
  name: string;
  backlog: number;
  children?: PipelineTreeItem[];
}

export interface GridCellData {
  id: string;
  clueCount: number;
  roadClues: number;
  urgentCount: number;
  x: number; // Grid position
  y: number; // Grid position
}

export interface PackagingPolicy {
    id: string;
    name: string;
    triggerType: 'cron' | 'threshold';
    triggerValue: string;
    spatialStrategy: 'admin_district' | 'map_tile';
    action: 'auto_push' | 'draft';
    enabled: boolean;
}

export type OperatorTaskType = 'Road' | 'Admin' | 'POI' | 'LastMile';

export interface OperatorTask {
    id: string;
    type: OperatorTaskType;
    region: string;
    aiConfidence: number; // 0-1
    slaHours: number;
    status: 'pending' | 'in-progress' | 'review' | 'completed' | 'rejected';
}

export type ViewType = 
  | 'dashboard' 
  | 'panorama' 
  | 'resource-market' 
  | 'capabilities-center'
  | 'clue-pool'
  | 'pipeline-orchestrator'
  | 'pipeline-tasks'
  | 'smart-workbench'
  | 'evaluation' 
  | 'adversarial' 
  | 'release-calendar' 
  | 'releases' 
  | 'snapshots' 
  | 'issues' 
  | 'hotfix' 
  | 'iam' 
  | 'finops' 
  | 'security'
  | 'dictionary';
