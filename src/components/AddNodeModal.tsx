import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type NodeType = 'personNode' | 'documentNode' | 'decisionNode';

interface AddNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddNode: (type: NodeType, data: Record<string, unknown>) => void;
}

export default function AddNodeModal({ isOpen, onClose, onAddNode }: AddNodeModalProps) {
  const [nodeType, setNodeType] = useState<NodeType>('decisionNode');
  
  // Form states
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Person specific
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  
  // Document specific
  const [content, setContent] = useState('');
  const [authorId, setAuthorId] = useState('');
  
  // Decision specific
  const [status, setStatus] = useState('Approved');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    let data: Record<string, unknown> = { label };

    if (nodeType === 'personNode') {
      data = { ...data, role, department };
    } else if (nodeType === 'documentNode') {
      data = { ...data, date, content, authorId };
    } else if (nodeType === 'decisionNode') {
      data = { ...data, date, status };
    }

    onAddNode(nodeType, data);
    
    // Reset form
    setLabel('');
    setRole('');
    setDepartment('');
    setContent('');
    setAuthorId('');
    setStatus('Approved');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden relative"
          >
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Add New Entity</h2>
              <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full text-slate-500 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Entity Type</label>
                <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
                  {(['decisionNode', 'documentNode', 'personNode'] as NodeType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setNodeType(type)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                        nodeType === type 
                          ? 'bg-white text-indigo-600 shadow-sm' 
                          : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {type.replace('Node', '')}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">Label / Title</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="e.g. Project Titan Delay"
                />
              </div>

              {nodeType === 'personNode' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Role</label>
                    <input
                      type="text"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Lead Architect"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Department</label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. Engineering"
                    />
                  </div>
                </>
              )}

              {nodeType === 'documentNode' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Author ID</label>
                    <input
                      type="text"
                      value={authorId}
                      onChange={(e) => setAuthorId(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="e.g. person-1"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Content / Evidence</label>
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                      placeholder="Quote or summary of the document..."
                    />
                  </div>
                </>
              )}

              {nodeType === 'decisionNode' && (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Date</label>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Status</label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Reversed">Reversed</option>
                      <option value="Pending">Pending</option>
                    </select>
                  </div>
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                >
                  Create Entity
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
