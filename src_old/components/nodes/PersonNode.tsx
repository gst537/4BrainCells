import { Handle, Position } from '@xyflow/react';
import { UserCircle } from 'lucide-react';

interface PersonNodeProps {
  data: {
    label: string;
    role: string;
    department: string;
  };
}

export default function PersonNode({ data }: PersonNodeProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border border-slate-200 shadow-md rounded-full px-4 py-2 flex items-center gap-3 relative transition-transform hover:scale-105 group cursor-pointer">
      <Handle type="target" position={Position.Top} className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <UserCircle className="w-8 h-8 text-slate-400" />
      
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-slate-800">{data.label}</span>
        <span className="text-[10px] text-slate-500">{data.role} &bull; {data.department}</span>
      </div>

      <Handle type="source" position={Position.Bottom} className="w-2 h-2 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
}
