
import { 
  LayoutDashboard, 
  Activity, 
  Database, 
  Split, 
  Cpu, 
  FlaskConical, 
  PenTool, 
  ShieldCheck, 
  Swords, 
  Rocket, 
  Calendar, 
  Archive, 
  MessageSquareWarning, 
  Zap, 
  Settings, 
  Users, 
  Wallet, 
  Lock, 
  Eye, 
  Box, 
  Terminal, 
  Workflow, 
  ClipboardCheck, 
  Package, 
  Camera, 
  Ticket, 
  Sparkles, 
  ListTodo, 
  ShoppingBag, 
  CheckSquare,
  Book
} from 'lucide-react';
import { MenuItem, PipelineTask, TaskStatus, ViewType, JobClue, PipelineTreeItem, GridCellData, PackagingPolicy, TaskPackage, OperatorTask } from './types';

export const NAVIGATION_MENU: MenuItem[] = [
  {
    id: 'cockpit',
    label: '驾驶舱',
    icon: LayoutDashboard,
    children: [
      { id: '1.1', label: '运营总览', path: 'dashboard' as ViewType, icon: Activity },
      { id: '1.2', label: '全景监测', path: 'panorama' as ViewType, icon: Eye },
    ]
  },
  {
    id: 'capabilities',
    label: '能力中心',
    icon: Cpu,
    children: [
      { id: '2.1', label: '资料集市', path: 'resource-market' as ViewType, icon: ShoppingBag },
      { id: '2.2', label: '模型仓库', path: 'capabilities-center' as ViewType, icon: Box },
      { id: '2.3', label: '产线编排', path: 'pipeline-orchestrator' as ViewType, icon: Workflow },
    ]
  },
  {
    id: 'production',
    label: '生产中心',
    icon: PenTool,
    children: [
      { id: '3.1', label: '作业线索池', path: 'clue-pool' as ViewType, icon: Sparkles },
      { id: '3.2', label: '流水线任务', path: 'pipeline-tasks' as ViewType, icon: ListTodo },
      { id: '3.3', label: '智能作业台', path: 'smart-workbench' as ViewType, icon: PenTool },
    ]
  },
  {
    id: 'quality',
    label: '评测中心',
    icon: ShieldCheck,
    children: [
      { id: '4.1', label: '评测任务', path: 'evaluation' as ViewType, icon: ClipboardCheck },
      { id: '4.2', label: '对抗演练', path: 'adversarial' as ViewType, icon: Swords },
    ]
  },
  {
    id: 'delivery',
    label: '交付中心',
    icon: Rocket,
    children: [
      { id: '5.1', label: '发布日历', path: 'release-calendar' as ViewType, icon: Calendar },
      { id: '5.2', label: '产品发版', path: 'releases' as ViewType, icon: Package },
      { id: '5.3', label: '组件快照', path: 'snapshots' as ViewType, icon: Camera },
    ]
  },
  {
    id: 'operations',
    label: '运营与反馈',
    icon: MessageSquareWarning,
    children: [
      { id: '6.1', label: '工单池', path: 'issues' as ViewType, icon: Ticket },
      { id: '6.2', label: '热修通道', path: 'hotfix' as ViewType, icon: Zap },
    ]
  },
  {
    id: 'system',
    label: '系统管理',
    icon: Settings,
    children: [
      { id: '7.1', label: '组织与权限', path: 'iam' as ViewType, icon: Users },
      { id: '7.2', label: '算力成本', path: 'finops' as ViewType, icon: Wallet },
      { id: '7.3', label: '安全合规', path: 'security' as ViewType, icon: Lock },
      { id: '7.4', label: '字典管理', path: 'dictionary' as ViewType, icon: Book },
    ]
  }
];

export const MOCK_PIPELINE_TREE: PipelineTreeItem[] = [
    {
        id: 'road',
        name: '路网产线',
        backlog: 12890,
        children: [
            { id: 'road-new', name: '新增道路发现', backlog: 5600 },
            { id: 'road-change', name: '道路变更', backlog: 4210 },
            { id: 'road-fix', name: '用户反馈修复', backlog: 3080 },
        ]
    },
    {
        id: 'poi',
        name: 'POI 产线',
        backlog: 8904,
        children: [
            { id: 'poi-new', name: '新增 POI', backlog: 6500 },
            { id: 'poi-update', name: 'POI 信息更新', backlog: 2404 },
        ]
    },
    {
        id: 'admin',
        name: '行政区划产线',
        backlog: 512,
        children: [
            { id: 'admin-adjust', name: '边界调整', backlog: 512 },
        ]
    },
    {
        id: 'address',
        name: '门址产线',
        backlog: 3200,
        children: [
            { id: 'addr-extract', name: '门牌提取', backlog: 2100 },
            { id: 'addr-standard', name: '地址标准化', backlog: 1100 },
        ]
    }
];

export const MOCK_GRID_CELLS: GridCellData[] = Array.from({ length: 14 * 8 }).map((_, i) => {
    const x = i % 14;
    const y = Math.floor(i / 14);
    const clueCount = Math.random() > 0.3 ? Math.floor(Math.random() * (x + y + 2) * 5) : 0;
    const roadClues = Math.floor(clueCount * (Math.random() * 0.5 + 0.3));
    const urgentCount = clueCount > 50 ? Math.floor(Math.random() * 5) : 0;
    return {
        id: `cell-${x}-${y}`,
        clueCount,
        roadClues,
        urgentCount,
        x,
        y
    };
});

export const MOCK_PACKAGING_POLICIES: PackagingPolicy[] = [
    {
        id: 'P-01',
        name: '路网-每日打包',
        triggerType: 'cron',
        triggerValue: '每日 02:00',
        spatialStrategy: 'map_tile',
        action: 'auto_push',
        enabled: true,
    },
    {
        id: 'P-02',
        name: 'POI-高优商区',
        triggerType: 'threshold',
        triggerValue: '> 100 clues',
        spatialStrategy: 'admin_district',
        action: 'draft',
        enabled: true,
    },
    {
        id: 'P-03',
        name: '行政区划-紧急',
        triggerType: 'threshold',
        triggerValue: '> 1 urgent clue',
        spatialStrategy: 'admin_district',
        action: 'auto_push',
        enabled: false,
    }
];

export const MOCK_TASK_PACKAGES: TaskPackage[] = [
    { id: 'Pkg-20251209-HD01', region: '北京市海淀区', gridCells: 'Grids 5-8', progressCurrent: 78, progressTotal: 120, aiStatus: 'Completed', slaRemainingHours: 4, pipeline: 'Road' },
    { id: 'Pkg-20251209-CY02', region: '北京市朝阳区', gridCells: 'Grids 10-12', progressCurrent: 12, progressTotal: 80, aiStatus: 'Completed', slaRemainingHours: 22, pipeline: 'POI' },
    { id: 'Pkg-20251208-TJ01', region: '天津市滨海新区', gridCells: 'Grids 1-4', progressCurrent: 150, progressTotal: 150, aiStatus: 'Completed', slaRemainingHours: 48, pipeline: 'Building' },
    { id: 'Pkg-20251208-HD02', region: '北京市海淀区', gridCells: 'Grids 9-11', progressCurrent: 25, progressTotal: 95, aiStatus: 'Processing', slaRemainingHours: 1, pipeline: 'Road' },
    { id: 'Pkg-20251210-XC01', region: '北京市西城区', gridCells: 'Grids 15-18', progressCurrent: 0, progressTotal: 65, aiStatus: 'Completed', slaRemainingHours: 72, pipeline: 'Admin' },
    { id: 'Pkg-20251207-SH01', region: '上海市浦东新区', gridCells: 'Grids 1-10', progressCurrent: 45, progressTotal: 250, aiStatus: 'Failed', slaRemainingHours: 16, pipeline: 'Road' },
    { id: 'Pkg-20251211-SZ01', region: '深圳市南山区', gridCells: 'Grids 20-22', progressCurrent: 10, progressTotal: 100, aiStatus: 'Processing', slaRemainingHours: 12, pipeline: 'Address' },
];

export const MOCK_OPERATOR_TASKS: OperatorTask[] = [
    { id: 'Task-001', type: 'Road', region: '海淀区', aiConfidence: 0.98, slaHours: 2, status: 'in-progress' },
    { id: 'Task-002', type: 'LastMile', region: '朝阳区', aiConfidence: 0.75, slaHours: 4, status: 'pending' },
    { id: 'Task-003', type: 'Admin', region: '西城区', aiConfidence: 0.99, slaHours: 8, status: 'pending' },
    { id: 'Task-004', type: 'POI', region: '海淀区', aiConfidence: 0.62, slaHours: 1, status: 'review' },
];

export const SCENARIO_DATA = {
    source: {
        name: 'Gov_Doc_2023_Merge_AB.pdf',
        type: 'PDF',
        size: '2.4 MB',
        tags: ['行政', '官方公文', '高优先级']
    },
    evidenceText: "政府令 #2023-10：即日起，A 区行政边界并将入 B 区。新的北部边界应沿长江支流中心线划分...",
    pipelineName: "行政区划产线",
    qaCheck: { name: "多边形闭合性检查", status: "通过", score: "100%" },
    integrationConflict: "冲突警告：3 个 POI（学校、医院）现位于新定义的边界之外。"
};

export const MOCK_GLOBAL_DICTIONARY: Record<string, { label: string; value: string; color?: string; code?: string }[]> = {
    'pipeline': [
        // Foundation
        { label: '路网产线', value: 'Road', color: 'blue', code: 'Foundation' },
        { label: '行政区划产线', value: 'Admin', color: 'purple', code: 'Foundation' },
        { label: '建筑物产线', value: 'Building', color: 'emerald', code: 'Foundation' },
        // Location
        { label: '标准地址库', value: 'Address', color: 'cyan', code: 'Location' },
        { label: 'POI 产线', value: 'POI', color: 'amber', code: 'Location' },
        // Last Mile
        { label: '上门指引', value: 'DoorToDoor', color: 'rose', code: 'LastMile' },
        { label: '停车与接驳', value: 'Parking', color: 'slate', code: 'LastMile' }
    ],
    'sub_pipeline': [
        { label: '新增道路发现', value: 'road-new', code: 'Road' },
        { label: '道路变更', value: 'road-change', code: 'Road' },
        { label: '用户反馈修复', value: 'road-fix', code: 'Road' },
        { label: '新增 POI', value: 'poi-new', code: 'POI' },
        { label: 'POI 信息更新', value: 'poi-update', code: 'POI' },
        { label: '边界调整', value: 'admin-adjust', code: 'Admin' },
        { label: '建筑物提取', value: 'building-extract', code: 'Building' },
        { label: '门牌提取', value: 'addr-extract', code: 'Address' },
        { label: '地址标准化', value: 'addr-standard', code: 'Address' },
        { label: '小区出入口采集', value: 'gate-survey', code: 'DoorToDoor' },
        { label: '停车位检测', value: 'parking-detect', code: 'Parking' }
    ],
    'data_type': [
        { label: '卫星影像', value: 'Satellite', color: 'blue' },
        { label: '无人机', value: 'Drone', color: 'emerald' },
        { label: '街景', value: 'StreetView', color: 'slate' },
        { label: '政府公文', value: 'GovDoc', color: 'rose' },
        { label: '网络爬取', value: 'WebCrawl', color: 'amber' }
    ],
    'task_priority': [
        { label: '紧急 (P0)', value: 'P0', color: 'rose' },
        { label: '高 (P1)', value: 'P1', color: 'amber' },
        { label: '中 (P2)', value: 'P2', color: 'blue' },
        { label: '低 (P3)', value: 'P3', color: 'slate' },
    ],
    'asset_status': [
        { label: '已编目', value: 'cataloged', color: 'emerald' },
        { label: '分诊中', value: 'triaging', color: 'amber' },
        { label: '未处理', value: 'unprocessed', color: 'slate' },
        { label: '已归档', value: 'archived', color: 'purple' },
    ]
};
