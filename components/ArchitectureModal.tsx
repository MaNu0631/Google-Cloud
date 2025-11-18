import React from 'react';
import { Icon } from './Icon';

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ArchitectureSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-lg font-bold text-green-800 mb-2 pb-1 border-b-2 border-green-200">{title}</h3>
    <div className="text-gray-700 space-y-2">{children}</div>
  </div>
);

const ArchitectureItem: React.FC<{ name: string; description: string }> = ({ name, description }) => (
  <p><strong className="font-semibold text-gray-900">{name}:</strong> {description}</p>
);

const ArchitectureModal: React.FC<ArchitectureModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center animate-fade-in"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-auto max-h-[85vh] flex flex-col border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-green-600 p-4 flex items-center justify-between flex-shrink-0 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Icon name="server" className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">System Architecture</h2>
          </div>
          <button onClick={onClose} className="text-green-100 hover:text-white">
            <Icon name="xMark" className="h-6 w-6" />
          </button>
        </header>
        
        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto bg-gray-50 text-sm">
            <p className="mb-6 text-gray-600 italic">This application is built on a scalable, serverless, AI-centric architecture deployed on Google Cloud Run, featuring a hybrid data storage model.</p>

            <ArchitectureSection title="Application Layer">
                <ArchitectureItem name="Application" description="Handles core business logic and user interactions." />
                <ArchitectureItem name="Authentication (Auth)" description="Manages secure user access to services." />
            </ArchitectureSection>

            <ArchitectureSection title="Core Integration & Orchestration">
                <ArchitectureItem name="MCP Toolbox" description="Middleware/data abstraction layer, providing a unified interface to data stores." />
                <ArchitectureItem name="ADK (Agent Development Kit)" description="AI agent framework for orchestrating complex tasks, including NLP and data interactions." />
            </ArchitectureSection>

            <ArchitectureSection title="Data & Storage Layer (Hybrid Approach)">
                <ul className="list-disc list-inside space-y-2">
                    <li><strong className="font-semibold text-gray-900">MongoDB Atlas / MongoDB:</strong> NoSQL document storage (potentially for vector search).</li>
                    <li><strong className="font-semibold text-gray-900">Spanner:</strong> Globally distributed, strongly consistent relational DB for critical transactional data.</li>
                    <li><strong className="font-semibold text-gray-900">SQL (Generic):</strong> Other relational databases.</li>
                    <li><strong className="font-semibold text-gray-900">BigQuery (BQ):</strong> Serverless data warehouse for analytics and ML integration.</li>
                    <li><strong className="font-semibold text-gray-900">Cloud Storage:</strong> For unstructured data (files, multimedia, batch processing data).</li>
                </ul>
            </ArchitectureSection>

            <ArchitectureSection title="AI & Context Layer">
                <ArchitectureItem name="LLM (Large Language Model)" description="Core AI (likely Gemini) for NLU/NLG." />
                <ArchitectureItem name="Context Guardrails" description="Essential for safe and relevant LLM operation." />
                <ArchitectureItem name="Web Data / Files Multimodal" description="Information sources for the LLM, supporting RAG with structured and various file types." />
            </ArchitectureSection>
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            0% { opacity: 0; }
            100% { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ArchitectureModal;
