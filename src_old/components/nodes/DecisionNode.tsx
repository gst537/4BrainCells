import { Handle, Position } from '@xyflow/react';
import { CheckCircle2, XCircle, Clock } from 'lucide-react';

interface DecisionNodeProps {
  data: {
    label: string;
    status: 'Approved' | 'Rejected' | 'Proposed' | 'Reversed';
    date: string;
  };
}

export default function DecisionNode({ data }: DecisionNodeProps) {
  const getStatusIcon = () => {
    switch (data.status) {
      case 'Approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Reversed': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (data.status) {
      case 'Approved': return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600';
      case 'Rejected': return 'bg-red-500/10 border-red-500/20 text-red-600';
      case 'Reversed': return 'bg-amber-500/10 border-amber-500/20 text-amber-600';
      default: return 'bg-blue-500/10 border-blue-500/20 text-blue-600';
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl shadow-slate-200/50 rounded-xl p-4 min-w-[250px] relative transition-transform hover:scale-105">
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-white bg-slate-400" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Decision</span>
          <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border flex items-center gap-1 ${getStatusColor()}`}>
            {getStatusIcon()}
            {data.status}
          </span>
        </div>
        
        <h3 className="text-sm font-semibold text-slate-800">{data.label}</h3>
        <p className="text-xs text-slate-500">{data.date}</p>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-white bg-slate-400" />
    </div>
  );
}
