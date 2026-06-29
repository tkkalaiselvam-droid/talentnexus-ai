import * as XLSX from 'xlsx';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Shield,
  Eye,
  EyeOff,
  FileSpreadsheet,
  Terminal,
  Activity,
  AlertTriangle,
  Cpu,
  Zap,
  Globe,
  Lock,
  User,
  Briefcase,
  Award,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Code,
  Hash,
  Layers,
  Search,
  Filter,
  RefreshCw,
  Clock,
  BarChart3,
  Keyboard,
  X,
  Sparkles,
  Play,
  Pause,
  Loader2,
  BrainCircuit,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Line,
} from 'recharts';
import { rankCandidates, type GeminiRankingResult } from './lib/gemini';

// ─── Types ───
interface Candidate {
  id: string;
  tracker: string;
  badges: string[];
  skills: string[];
  score: number;
  experience: string;
  location: string;
  education: string;
  languages: string[];
}

interface LogEntry {
  id: number;
  text: string;
  timestamp: string;
  status: 'pending' | 'complete' | 'warning';
}

interface Milestone {
  year: string;
  title: string;
  company: string;
  description: string;
  level: number;
}

interface TelemetryPoint {
  time: string;
  keystrokes: number;
  accuracy: number;
  cadence: number;
}

// ─── Mock Data ───
const CANDIDATES: Candidate[] = [
  {
    id: '1',
    tracker: 'Candidate #TN-8842',
    badges: ['HIGH AUTHORITY', 'EXPERIENCED'],
    skills: ['React', 'Node.js', 'Python', 'TensorFlow', 'AWS', 'Kubernetes'],
    score: 9.21,
    experience: '6.5 Years',
    location: 'Bengaluru, IN',
    education: 'M.Tech AI, IIT Bombay',
    languages: ['English', 'Hindi', 'Japanese'],
  },
  {
    id: '2',
    tracker: 'Candidate #TN-7731',
    badges: ['HIGH AUTHORITY', 'LEADERSHIP'],
    skills: ['Go', 'Rust', 'PostgreSQL', 'Redis', 'gRPC', 'Docker'],
    score: 8.94,
    experience: '5.2 Years',
    location: 'San Francisco, US',
    education: 'B.S. CS, Stanford',
    languages: ['English', 'Mandarin'],
  },
  {
    id: '3',
    tracker: 'Candidate #TN-9912',
    badges: ['EMERGING TALENT', 'FULL STACK'],
    skills: ['Vue.js', 'Django', 'GraphQL', 'Terraform', 'Azure', 'CI/CD'],
    score: 8.67,
    experience: '3.8 Years',
    location: 'London, UK',
    education: 'M.Sc. SE, Imperial College',
    languages: ['English', 'French', 'German'],
  },
  {
    id: '4',
    tracker: 'Candidate #TN-5543',
    badges: ['EXPERIENCED', 'SYSTEMS'],
    skills: ['C++', 'CUDA', 'OpenMP', 'MPI', 'Slurm', 'HPC'],
    score: 8.45,
    experience: '7.1 Years',
    location: 'Zurich, CH',
    education: 'Ph.D. HPC, ETH Zurich',
    languages: ['English', 'German', 'Italian'],
  },
  {
    id: '5',
    tracker: 'Candidate #TN-3321',
    badges: ['EMERGING TALENT', 'MOBILE'],
    skills: ['Swift', 'Kotlin', 'Flutter', 'Firebase', 'Realm', 'Fastlane'],
    score: 8.12,
    experience: '2.5 Years',
    location: 'Singapore, SG',
    education: 'B.Eng. ECE, NUS',
    languages: ['English', 'Malay', 'Tamil'],
  },
  {
    id: '6',
    tracker: 'Candidate #TN-6678',
    badges: ['HIGH AUTHORITY', 'SECURITY'],
    skills: ['Rust', 'Solidity', 'Zero-Knowledge', 'SNARKs', 'Ethereum', 'Auditing'],
    score: 8.03,
    experience: '4.9 Years',
    location: 'Berlin, DE',
    education: 'M.Sc. Crypto, TU Berlin',
    languages: ['English', 'German', 'Russian'],
  },
  {
    id: '7',
    tracker: 'Candidate #TN-4456',
    badges: ['EXPERIENCED', 'DATA'],
    skills: ['PyTorch', 'Spark', 'Airflow', 'dbt', 'Snowflake', 'MLflow'],
    score: 7.89,
    experience: '5.7 Years',
    location: 'Toronto, CA',
    education: 'M.Sc. Stats, U of T',
    languages: ['English', 'French'],
  },
];

const PIPELINE_PHASES: LogEntry[] = [
  { id: 1, text: 'Ingesting raw resume corpus...', timestamp: '14:02:01.221', status: 'pending' },
  { id: 2, text: 'De-duplicating keyword noise tensors...', timestamp: '14:02:03.884', status: 'pending' },
  { id: 3, text: 'Applying cross-lingual normalization...', timestamp: '14:02:07.112', status: 'pending' },
  { id: 4, text: 'Verifying credential authority tiers...', timestamp: '14:02:11.445', status: 'pending' },
  { id: 5, text: 'Computing Praxis competency matrix...', timestamp: '14:02:15.992', status: 'pending' },
  { id: 6, text: 'Synthesizing composite score matrix...', timestamp: '14:02:19.334', status: 'pending' },
  { id: 7, text: 'Finalizing multi-dimensional rankings...', timestamp: '14:02:22.778', status: 'pending' },
];

const MILESTONES: Milestone[] = [
  { year: '2018', title: 'Associate Systems Engineer', company: 'Infosys Ltd.', description: 'Built microservices for banking clients', level: 1 },
  { year: '2020', title: 'Software Engineer', company: 'Redrob Premium Labs Ltd.', description: 'Led frontend migration to React/TypeScript', level: 2 },
  { year: '2022', title: 'Senior Software Engineer', company: 'Redrob Premium Labs Ltd.', description: 'Architected AI inference pipeline', level: 3 },
  { year: '2024', title: 'Lead AI Engineer', company: 'Redrob Premium Labs Ltd.', description: 'Leading 12-person ML platform team', level: 4 },
];

const TELEMETRY_DATA: TelemetryPoint[] = [
  { time: '00:00', keystrokes: 45, accuracy: 98, cadence: 3.2 },
  { time: '00:05', keystrokes: 62, accuracy: 97, cadence: 3.5 },
  { time: '00:10', keystrokes: 78, accuracy: 96, cadence: 3.8 },
  { time: '00:15', keystrokes: 55, accuracy: 99, cadence: 3.1 },
  { time: '00:20', keystrokes: 88, accuracy: 95, cadence: 4.1 },
  { time: '00:25', keystrokes: 72, accuracy: 97, cadence: 3.6 },
  { time: '00:30', keystrokes: 95, accuracy: 94, cadence: 4.3 },
  { time: '00:35', keystrokes: 60, accuracy: 98, cadence: 3.3 },
  { time: '00:40', keystrokes: 82, accuracy: 96, cadence: 3.9 },
  { time: '00:45', keystrokes: 70, accuracy: 97, cadence: 3.5 },
  { time: '00:50', keystrokes: 90, accuracy: 95, cadence: 4.0 },
  { time: '00:55', keystrokes: 65, accuracy: 98, cadence: 3.4 },
];

// ─── Utility ───
function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

// ─── Components ───

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 9 ? 'text-emerald-600' : score >= 8 ? 'text-sky-600' : 'text-amber-600';
  return (
    <div className="flex items-center gap-1.5">
      <TrendingUp className={cn('w-4 h-4', color)} />
      <span className={cn('font-mono font-bold text-lg', color)}>{score.toFixed(2)}</span>
    </div>
  );
}

function Badge({ text }: { text: string }) {
  const isHigh = text.includes('HIGH') || text.includes('LEADERSHIP');
  const isEmerging = text.includes('EMERGING');
  return (
    <span
      className={cn(
        'px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase border',
        isHigh && 'bg-emerald-50 text-emerald-700 border-emerald-200',
        isEmerging && 'bg-amber-50 text-amber-700 border-amber-200',
        !isHigh && !isEmerging && 'bg-sky-50 text-sky-700 border-sky-200'
      )}
    >
      {text}
    </span>
  );
}

function SkillChip({ skill }: { skill: string }) {
  return (
    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-[#0F172A] text-[11px] border border-slate-200">
      {skill}
    </span>
  );
}

// ─── Workspace Dropdown ───
const WORKSPACE_OPTIONS = [
  { id: 1, label: 'Recruiter Command Center', shortLabel: 'Recruiter Command Center' },
  { id: 2, label: 'Vanguard Professional Portal', shortLabel: 'Vanguard Professional Portal' },
  { id: 3, label: 'Nexus Student Track', shortLabel: 'Nexus Student Track' },
];

function WorkspaceDropdown({ activeId, onSelect }: { activeId: number; onSelect: (id: number) => void }) {
  const [open, setOpen] = useState(false);
  const active = WORKSPACE_OPTIONS.find((o) => o.id === activeId) ?? WORKSPACE_OPTIONS[0];
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 transition-all text-sm font-medium"
        style={{ backgroundColor: '#F8FAFC', color: '#0F172A' }}
      >
        <span className="max-w-[200px] truncate">{active.shortLabel}</span>
        <ChevronDown className={cn('w-4 h-4 text-slate-400 transition-transform', open && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-1.5 w-72 rounded-lg border border-slate-200 bg-white shadow-xl z-50 overflow-hidden"
          >
            {WORKSPACE_OPTIONS.map((opt) => {
              const isActive = opt.id === activeId;
              return (
                <button
                  key={opt.id}
                  onClick={() => {
                    onSelect(opt.id);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full text-left px-4 py-3 text-sm transition-colors flex items-center justify-between',
                    isActive ? 'bg-slate-50 text-[#0F172A] font-semibold' : 'text-[#475569] hover:bg-slate-50'
                  )}
                >
                  <span>{opt.label}</span>
                  {isActive && <CheckCircle className="w-4 h-4 text-emerald-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Tab 1: Recruiter Command Center ───
function RecruiterCommandCenter() {
  const [searchQuery, setSearchQuery] = useState('');
  const [pipelineStarted, setPipelineStarted] = useState(false);
  const [completedPhaseCount, setCompletedPhaseCount] = useState(0);
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [rankingResult, setRankingResult] = useState<{ candidates: any[] }>({ candidates: [] });

  const totalPhases = 7;
  const progressPercent = pipelineStarted ? Math.round((completedPhaseCount / totalPhases) * 100) : 0;

  useEffect(() => {
    if (!pipelineStarted) return;

    if (completedPhaseCount >= totalPhases) {
      setPipelineComplete(true);
      
      // FETCH DATA DIRECTLY FROM YOUR RUNNING PYTHON API
      fetch(`/api/rank?query=${encodeURIComponent(searchQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data && data.candidates) {
            setRankingResult({ candidates: data.candidates });
            // UNLOCK THE SEARCH BAR AND BUTTON FOR NEXT SEARCHES INSTANTLY
            setPipelineStarted(false);
            setCompletedPhaseCount(0);
          }
        })
        .catch((err) => console.error("Data Sync Error:", err));
        setPipelineStarted(false);
        setCompletedPhaseCount(0);
        
      return;
    }

    const timer = setTimeout(() => {
      setCompletedPhaseCount((c) => c + 1);
    }, 400);

    return () => clearTimeout(timer);
  }, [pipelineStarted, completedPhaseCount, totalPhases, searchQuery]);

  return (
    <div className="w-full h-[calc(100vh-80px)] flex bg-white text-[#0F172A] p-6 gap-6 overflow-hidden">
      {/* LEFT COLUMN: CANDIDATE CARD LIST */}
      <div className="w-1/2 h-full flex flex-col border border-slate-200 rounded-lg p-4 bg-white shadow-sm min-h-0">
        <h2 className="text-lg font-bold mb-4 border-b border-slate-100 pb-2 text-[#0F172A]">Ranked Candidates Feed</h2>
        
        {!pipelineComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border-2 border-dashed border-slate-200 rounded-md bg-slate-50/50">
            <span className="text-2xl mb-2">🔍</span>
            <p className="text-sm font-semibold text-[#0F172A]">No ranking data yet</p>
            <p className="text-xs text-slate-500 max-w-[280px] mt-1">
              Input search intent metrics and execute the high-throughput evaluation engine pipeline.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {rankingResult.candidates.map((candidate: any) => (
              <div key={candidate.id} className="p-4 border border-slate-200 rounded-lg bg-white shadow-sm hover:border-emerald-500 transition-all flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-[#0F172A]">
                      {candidate.stuffing_detected ? `Anonymized (#${candidate.id})` : candidate.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 font-bold rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                      SCORE MAP
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-700">{candidate.title}</p>
                  <p className="text-[11px] text-slate-500 mt-1 max-w-[320px] line-clamp-1">
                    Skills: {candidate.skills}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-emerald-600 font-mono bg-emerald-50/50 px-2 py-1 rounded border border-emerald-100">
                    {candidate.score}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono block mt-1">{candidate.id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: PIPELINE EXECUTION CONSOLE */}
      <div className="w-1/2 flex flex-col gap-4">
        {/* ACTION TRIGGER BUTTON PANEL */}
        <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Search Candidate Profiles by Intent
          </label>
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={pipelineStarted}
            placeholder="e.g., Python Developer with 3+ years experience..."
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-md text-sm text-[#0F172A] focus:outline-none focus:border-emerald-500 transition-colors mb-4"
          />
          
          <button
            onClick={() => setPipelineStarted(true)}
            disabled={pipelineStarted}
            className={`w-full font-bold text-sm py-3 px-4 rounded-md shadow-sm transition-all flex items-center justify-center gap-2 ${
              pipelineStarted 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white transform active:scale-[0.99]'
            }`}
          >
            {pipelineStarted ? (
              <>
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Pipeline Running ({progressPercent}%)</span>
              </>
            ) : (
              <span>EXECUTE HIGH-THROUGHPUT CROSS-LINGUAL RANKING PIPELINE</span>
            )}
          </button>
        </div>

        {/* PROGRESS SYSTEM STATUS OVERVIEW */}
        <div className="border border-slate-200 rounded-lg p-5 bg-white shadow-sm flex-1 flex flex-col">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600">Pipeline Evaluation Log</h3>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {completedPhaseCount}/{totalPhases} PHASES
            </span>
          </div>

          {!pipelineStarted ? (
            <div className="flex-1 flex items-center justify-center text-center text-xs text-slate-400 italic">
              AWAITING PIPELINE EXECUTION TRIGGER...
            </div>
          ) : (
            <div className="space-y-3 font-mono text-xs">
              {[
                "Ingesting raw resume corpus...",
                "De-duplicating keyword noise tensors...",
                "Applying cross-lingual normalization...",
                "Verifying credential authority tiers...",
                "Computing Praxis competency matrix...",
                "Synthesizing composite score matrix...",
                "Finalizing multi-dimensional rankings..."
              ].map((phase, index) => {
                const isDone = completedPhaseCount > index;
                const isCurrent = completedPhaseCount === index;
                return (
                  <div key={index} className={`flex items-center gap-3 p-2 rounded transition-colors ${
                    isDone ? 'text-emerald-700 bg-emerald-50/40' : isCurrent ? 'text-blue-700 bg-blue-50/50 font-bold' : 'text-slate-300'
                  }`}>
                    <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] border ${
                      isDone ? 'bg-emerald-500 border-emerald-600 text-white' : isCurrent ? 'border-blue-500 bg-white text-blue-600 animate-pulse' : 'border-slate-200 bg-white text-transparent'
                    }`}>
                      {isDone ? "✓" : "▶"}
                    </div>
                    <span>{phase}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tab 2: Vanguard Professional Track ───
function VanguardProfessionalTrack() {
  const [ghostMode, setGhostMode] = useState(false);

  const realName = 'Raj Kumar';
  const ghostName = 'Candidate #TN-8842';
  const realCompany = 'Redrob Premium Labs Ltd.';
  const ghostCompany = 'Tier-1 Enterprise Marketplace Sync';

  return (
    <div className="flex flex-col h-full p-6 overflow-y-auto bg-white">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-[#0F172A] mb-1">
          Vanguard Professional Portal // Discretionary Candidate Identity Map
        </h2>
        <p className="text-sm text-[#475569]">
          Toggle visibility modes to control how your profile appears to external recruiters.
        </p>
      </div>

      {/* Profile Banner */}
      <div className="mb-6 p-5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-50 to-emerald-50 border border-sky-200 flex items-center justify-center">
              <User className="w-7 h-7 text-sky-600" />
            </div>
            <div>
              <motion.h3
                key={ghostMode ? 'ghost' : 'real'}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-bold text-[#0F172A]"
              >
                {ghostMode ? ghostName : realName}
              </motion.h3>
              <p className="text-sm text-sky-600 font-medium">Senior Full Stack AI Developer</p>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="text-xs text-[#475569]">6.5 Years Experience</span>
                <span className="text-slate-300">|</span>
                <motion.span
                  key={ghostMode ? 'gc' : 'rc'}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-[#475569]"
                >
                  Current Company: {ghostMode ? ghostCompany : realCompany}
                </motion.span>
              </div>
            </div>
          </div>

          {/* Ghost Mode Toggle */}
          <button
            onClick={() => setGhostMode(!ghostMode)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all text-sm font-semibold',
              ghostMode
                ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            )}
          >
            {ghostMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {ghostMode ? 'Ghost Mode: ON' : 'Ghost Mode: OFF'}
          </button>
        </div>
      </div>

      {/* Career Velocity Timeline */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-sky-600" />
          <h3 className="text-sm font-bold text-[#0F172A] tracking-wide">
            CONTINUOUS CAREER VELOCITY & MILESTONE TIMELINE
          </h3>
        </div>

        <div className="relative pl-8">
          {/* Vertical line */}
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gradient-to-b from-sky-300 via-emerald-300 to-slate-200" />

          <div className="space-y-6">
            {MILESTONES.map((m, i) => (
              <motion.div
                key={m.year}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
                className="relative"
              >
                {/* Dot */}
                <div
                  className={cn(
                    'absolute -left-[29px] w-5 h-5 rounded-full border-2 flex items-center justify-center bg-white',
                    i === MILESTONES.length - 1
                      ? 'border-emerald-400'
                      : 'border-sky-300'
                  )}
                >
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full',
                      i === MILESTONES.length - 1 ? 'bg-emerald-500' : 'bg-sky-400'
                    )}
                  />
                </div>

                <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm hover:border-slate-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-sky-600">{m.year}</span>
                      <ChevronRight className="w-3 h-3 text-slate-300" />
                      <span className="text-sm font-bold text-[#0F172A]">{m.title}</span>
                    </div>
                    <span className="text-xs text-[#475569]">{m.company}</span>
                  </div>
                  <p className="text-xs text-[#475569]">{m.description}</p>

                  {/* Level bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(m.level / 4) * 100}%` }}
                        transition={{ duration: 0.8, delay: i * 0.15 + 0.3 }}
                        className="h-full rounded-full bg-gradient-to-r from-sky-400 to-emerald-400"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">L{m.level}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Skills Radar Placeholder */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-semibold text-[#0F172A]">Competency Distribution</span>
          </div>
          <div className="space-y-2">
            {[
              { skill: 'Frontend Architecture', level: 92 },
              { skill: 'ML / AI Systems', level: 88 },
              { skill: 'Backend Engineering', level: 85 },
              { skill: 'DevOps / SRE', level: 78 },
              { skill: 'System Design', level: 90 },
            ].map((item) => (
              <div key={item.skill} className="flex items-center gap-3">
                <span className="text-[11px] text-[#475569] w-32 truncate">{item.skill}</span>
                <div className="flex-1 h-1.5 rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.level}%` }}
                    transition={{ duration: 0.6 }}
                    className="h-full rounded-full bg-emerald-400"
                  />
                </div>
                <span className="text-[10px] text-slate-400 font-mono w-8 text-right">{item.level}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-lg bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="text-xs font-semibold text-[#0F172A]">Authority Signals</span>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'GitHub Contributions', value: '1,247 commits', icon: Code },
              { label: 'Stack Overflow', value: 'Top 2% reputation', icon: Award },
              { label: 'Publications', value: '3 peer-reviewed', icon: Layers },
              { label: 'Open Source', value: '12 maintained projects', icon: Zap },
            ].map((sig) => (
              <div key={sig.label} className="flex items-center gap-2.5">
                <sig.icon className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[11px] text-[#475569]">{sig.label}</span>
                <span className="text-[11px] text-[#0F172A] ml-auto font-medium">{sig.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Tab 3: Nexus Student Track ───
function NexusStudentTrack() {
  const [malwareAlert, setMalwareAlert] = useState(false);
  const [codeContent, setCodeContent] = useState(`function evaluateCandidate(seed) {
  const matrix = new CompetencyMatrix(seed);
  matrix.ingestResume(corpus);
  matrix.normalizeCrossLingual();

  const score = matrix.computePraxis();
  return score > THRESHOLD
    ? STATUS.SHORTLIST
    : STATUS.REJECT;
}`);
  const [cursorPos, setCursorPos] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSimulateMalware = () => {
    setMalwareAlert(true);
    setIsTyping(false);
  };

  const handleTyping = () => {
    if (malwareAlert) return;
    setIsTyping(true);
    setCursorPos((p) => p + 1);
    setTimeout(() => setIsTyping(false), 800);
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center gap-3">
          <Cpu className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-mono font-semibold text-[#0F172A]">
            TalentNexus AI Compiler Node v3.04 // Monitoring Nominal
          </span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 text-xs text-[#475569]">
            <Clock className="w-3.5 h-3.5" />
            <span className="font-mono">{new Date().toLocaleTimeString()}</span>
          </div>
          <button
            onClick={handleSimulateMalware}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-all text-xs font-semibold"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Simulate Clipboard Malware Hack
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel: Seed Schema */}
        <div className="w-72 border-r border-slate-200 bg-slate-50/50 flex flex-col">
          <div className="px-4 py-2.5 border-b border-slate-200 bg-white">
            <span className="text-xs font-semibold text-[#475569] uppercase tracking-wider">
              Vector Prompt Schema
            </span>
          </div>
          <div className="p-4 space-y-4 overflow-y-auto">
            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-mono text-emerald-700">Seed ID: 0x77AF31</span>
              </div>
              <div className="space-y-1.5 text-[11px] text-[#475569] font-mono">
                <div className="flex justify-between">
                  <span>structure_type</span>
                  <span className="text-sky-600">binary_tree</span>
                </div>
                <div className="flex justify-between">
                  <span>depth</span>
                  <span className="text-sky-600">7</span>
                </div>
                <div className="flex justify-between">
                  <span>nodes</span>
                  <span className="text-sky-600">127</span>
                </div>
                <div className="flex justify-between">
                  <span>entropy</span>
                  <span className="text-sky-600">0.943</span>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3.5 h-3.5 text-sky-600" />
                <span className="text-xs font-semibold text-[#0F172A]">Active Seeds</span>
              </div>
              <div className="space-y-2">
                {[
                  { id: '0x77AF31', status: 'active', progress: 87 },
                  { id: '0x88BE42', status: 'queued', progress: 12 },
                  { id: '0x99CF53', status: 'queued', progress: 0 },
                ].map((seed) => (
                  <div key={seed.id} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono text-[#475569]">{seed.id}</span>
                      <span
                        className={cn(
                          'text-[10px] px-1.5 py-0.5 rounded',
                          seed.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-[#475569]'
                        )}
                      >
                        {seed.status}
                      </span>
                    </div>
                    <div className="h-1 rounded-full bg-slate-100">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all',
                          seed.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300'
                        )}
                        style={{ width: `${seed.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-white border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Keyboard className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-semibold text-[#0F172A]">Input Metrics</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-[#0F172A]">{cursorPos}</div>
                  <div className="text-[10px] text-[#475569]">Chars</div>
                </div>
                <div className="text-center p-2 rounded bg-slate-50 border border-slate-100">
                  <div className="text-lg font-bold text-[#0F172A]">{isTyping ? 'Active' : 'Idle'}</div>
                  <div className="text-[10px] text-[#475569]">State</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Workspace + Telemetry */}
        <div className="flex-1 flex flex-col">
          {/* Code Editor */}
          <div className="flex-1 relative">
            <div className="absolute inset-0 flex flex-col">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 bg-white">
                <div className="flex items-center gap-2">
                  <Code className="w-4 h-4 text-sky-600" />
                  <span className="text-xs font-semibold text-[#0F172A]">
                    Nexus Technical Evaluation Node
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#475569] font-mono">main.evaluation.ts</span>
                  <span className="text-[10px] text-emerald-600 font-mono">unsaved</span>
                </div>
              </div>

              <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={codeContent}
                onChange={(e) => {
                  setCodeContent(e.target.value);
                  handleTyping();
                }}
                onPaste={(e) => {
                  e.preventDefault(); // Dynamic Safeguard: Immediately blocks text injection!
                  setMalwareAlert(true); // Triggers your crimson anomaly box overlay automatically!
                  setTyping(false); // Freezes the session typing monitors instantly!
                }}
                spellCheck={false}
                className="w-full h-full bg-slate-50/50 text-[#0F172A] font-mono p-4 resize-none outline-none border-none min-h-[300px]"
                placeholder="// Paste or write your code challenge solution here..."
                disabled={malwareAlert} // Locks the panel down completely once malpractice is caught!
              />

                {/* Malware Alert Overlay */}
                <AnimatePresence>
                  {malwareAlert && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="absolute inset-0 bg-red-50/80 backdrop-blur-sm flex items-center justify-center z-20"
                    >
                      <motion.div
                        initial={{ y: 20 }}
                        animate={{ y: 0 }}
                        className="mx-6 max-w-lg w-full p-6 rounded-xl bg-white border-2 border-red-300 shadow-2xl"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-red-50">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-red-700">MALPRACTICE ANOMALY DETECTED</h3>
                            <p className="text-xs text-[#475569]">Core Scoring Pipeline Frozen</p>
                          </div>
                        </div>

                        <div className="p-4 rounded-lg bg-red-50 border border-red-100 mb-4">
                          <p className="text-sm text-[#0F172A] font-mono leading-relaxed">
                            Keystroke Cadence Violation detected at timestamp{' '}
                            <span className="text-red-600">{new Date().toLocaleTimeString()}</span>.
                            Clipboard injection pattern matched signature{' '}
                            <span className="text-red-600">SIG-CLIP-01</span>.
                          </p>
                          <div className="mt-3 space-y-1.5">
                            <div className="flex items-center gap-2">
                              <X className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-xs text-[#475569]">Clipboard Injection Blocked</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <X className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-xs text-[#475569]">Core Scoring Pipeline Frozen</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <X className="w-3.5 h-3.5 text-red-500" />
                              <span className="text-xs text-[#475569]">Session Flagged for Review</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4 text-red-500" />
                            <span className="text-xs text-[#475569] font-mono">
                              Incident ID: INC-{Math.random().toString(36).substring(2, 10).toUpperCase()}
                            </span>
                          </div>
                          <button
                            onClick={() => setMalwareAlert(false)}
                            className="px-4 py-2 rounded bg-slate-100 text-[#0F172A] text-xs font-semibold hover:bg-slate-200 transition-colors"
                          >
                            Dismiss Alert
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Bottom Telemetry Chart */}
          <div className="h-56 border-t border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span className="text-xs font-semibold text-[#0F172A]">Automated Telemetry // Keystroke Analytics</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span className="text-[10px] text-[#475569]">Keystrokes/min</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-sky-500" />
                  <span className="text-[10px] text-[#475569]">Accuracy %</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-[10px] text-[#475569]">Cadence</span>
                </div>
              </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={TELEMETRY_DATA} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorKs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
                  }}
                  labelStyle={{ color: '#64748b' }}
                />
                <Area
                  type="monotone"
                  dataKey="keystrokes"
                  stroke="#10B981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorKs)"
                />
                <Area
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorAcc)"
                />
                <Line
                  type="monotone"
                  dataKey="cadence"
                  stroke="#fbbf24"
                  strokeWidth={2}
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main App ───
function App() {
  const [activeTab, setActiveTab] = useState(1);
  const [isOnboarded, setIsOnboarded] = useState(false);
  if (!isOnboarded) {
    return (
      <div className="w-screen h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-[#0F172A] selection:bg-emerald-100">
        {/* Onboarding Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-600 text-white font-black text-xl shadow-sm mb-4">
            TN
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-[#0F172A]">TalentNexus AI</h1>
          <p className="text-slate-500 text-xs mt-2 max-w-sm mx-auto">
            High-Throughput Predictive Sourcing, Multi-Dimensional Ranking Matrix & Cross-Lingual Evaluation Nodes.
          </p>
        </div>

        {/* 3-Way Role Selector Gateway Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full px-4">
          
          {/* Card 1: Recruiter Command Center */}
          <div 
            onClick={() => { setActiveTab(1); setIsOnboarded(true); }}
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-emerald-500 transition-all cursor-pointer group flex flex-col justify-between h-52"
          >
            <div>
              <span className="text-xl">💼</span>
              <h3 className="text-base font-bold mt-3 text-[#0F172A] group-hover:text-emerald-600 transition-colors">Recruiter Command Center</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Execute core predictive scoring pipelines, evaluate cross-lingual concept tensors, and generate candidate export shortlists.
              </p>
            </div>
            <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1 mt-4">
              Launch Sourcing Hub ➜
            </span>
          </div>

          {/* Card 2: Vanguard Portal */}
          <div 
            onClick={() => { setActiveTab(2); setIsOnboarded(true); }}
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-teal-500 transition-all cursor-pointer group flex flex-col justify-between h-52"
          >
            <div>
              <span className="text-xl">🛡️</span>
              <h3 className="text-base font-bold mt-3 text-[#0F172A] group-hover:text-teal-600 transition-colors">Vanguard Professional Portal</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Secure profile trajectory configurations using continuous career velocity indicators and active discretion Ghost Mode toggles.
              </p>
            </div>
            <span className="text-xs font-bold text-teal-600 inline-flex items-center gap-1 mt-4">
              Explore Discretion Portal ➜
            </span>
          </div>

          {/* Card 3: Nexus Student Track */}
          <div 
            onClick={() => { setActiveTab(3); setIsOnboarded(true); }}
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm hover:shadow-md hover:border-rose-500 transition-all cursor-pointer group flex flex-col justify-between h-52"
          >
            <div>
              <span className="text-xl">🎓</span>
              <h3 className="text-base font-bold mt-3 text-[#0F172A] group-hover:text-rose-600 transition-colors">Nexus Student Track</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Engage continuous testing cycles using sandbox execution terminals protected by active keystroke cadence malware defenses.
              </p>
            </div>
            <span className="text-xs font-bold text-rose-600 inline-flex items-center gap-1 mt-4">
              Open Evaluation Workspace ➜
            </span>
          </div>

        </div>

        {/* Track Compliance Frame */}
        <p className="text-[10px] text-slate-400 font-mono mt-16 tracking-wider uppercase">
          Track-1 Validation Pipeline // Redrob AI Hackathon
        </p>
      </div>
    );
  }
  return (
    <div className="h-screen w-screen bg-white flex flex-col overflow-hidden">
      {/* Persistent Header Banner */}
      <header className="shrink-0 px-5 py-3 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#0F172A] flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-[#0F172A] tracking-tight">
                TalentNexus AI <span className="text-slate-300">//</span>{' '}
                <span className="text-sky-600 font-normal">Grand Champion Spec</span>
              </h1>
              <button 
                onClick={() => setIsOnboarded(false)}
                className="text-[10px] ml-4 px-2 py-1 border border-slate-200 rounded bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors font-sans font-medium"
              >
                ◀ Switch Portal Gateway
              </button>  
            </div>
          </div>

          {/* Workspace Dropdown Selector */}
          <WorkspaceDropdown activeId={activeTab} onSelect={setActiveTab} />
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden bg-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {activeTab === 1 && <RecruiterCommandCenter />}
            {activeTab === 2 && <VanguardProfessionalTrack />}
            {activeTab === 3 && <NexusStudentTrack />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;