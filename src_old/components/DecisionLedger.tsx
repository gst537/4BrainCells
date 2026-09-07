import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import mockData from '../../data/graphMock.json';

export default function DecisionLedger() {
  const decisions = mockData.nodes
    .filter((n) => n.type === 'decisionNode')
    .map((n) => ({
      id: n.id,
      ...n.data,
    }));

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'Rejected': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'Reversed': return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Rejected': return 'bg-red-50 text-red-700 border-red-200';
      case 'Reversed': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <h2 className="text-lg font-semibold text-slate-800">Decision Ledger</h2>
        <p className="text-xs text-slate-500">Curated, high-signal decisions.</p>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2">
        <div className="flex flex-col gap-2">
          {decisions.map((decision) => (
            <div 
              key={decision.id}
              className="p-3 rounded-xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all cursor-pointer group bg-white"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {decision.label}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">{decision.date}</p>
                </div>
                
                <span className={`text-[10px] font-semibold px-2 py-1 rounded-full border flex items-center gap-1 whitespace-nowrap ${getStatusColor(decision.status as string)}`}>
                  {getStatusIcon(decision.status as string)}
                  {decision.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
