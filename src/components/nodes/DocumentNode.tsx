import { Handle, Position } from '@xyflow/react';
import { FileText } from 'lucide-react';

interface DocumentNodeProps {
  data: {
    label: string;
    date: string;
    content: string;
  };
}

export default function DocumentNode({ data }: DocumentNodeProps) {
  return (
    <div className="bg-white/80 backdrop-blur-md border border-indigo-100 shadow-lg shadow-indigo-100/50 rounded-xl p-4 w-[280px] relative transition-transform hover:scale-105">
      <Handle type="target" position={Position.Top} className="w-3 h-3 border-2 border-white bg-indigo-400" />
      
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-indigo-500">
          <FileText className="w-4 h-4" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Evidence Doc</span>
        </div>
        
        <h3 className="text-sm font-semibold text-slate-800 leading-tight">{data.label}</h3>
        <p className="text-xs text-slate-400">{data.date}</p>
        
        <div className="mt-2 p-2 bg-slate-50 rounded-lg border border-slate-100">
          <p className="text-xs text-slate-600 italic line-clamp-3">&quot;{data.content}&quot;</p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 border-2 border-white bg-indigo-400" />
    </div>
  );
}
