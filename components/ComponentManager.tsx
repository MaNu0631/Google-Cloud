
import React, { useState, useRef, useEffect } from 'react';
import { CustomComponent } from '../types';
import { Icon } from './Icon';

interface ComponentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  libraryComponents: string[];
  selectedLibraryComponents: string[];
  onLibraryComponentToggle: (name: string) => void;
  customComponents: CustomComponent[];
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onUpdateCustomComponent: (id: string, newContent: string) => void;
  onDeleteCustomComponent: (id: string) => void;
}

const ComponentManager: React.FC<ComponentManagerProps> = ({
  isOpen,
  onClose,
  libraryComponents,
  selectedLibraryComponents,
  onLibraryComponentToggle,
  customComponents,
  onFileUpload,
  onUpdateCustomComponent,
  onDeleteCustomComponent
}) => {
  const [editingComponent, setEditingComponent] = useState<CustomComponent | null>(null);
  const [editText, setEditText] = useState('');
  const [filterText, setFilterText] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingComponent) {
      setEditText(editingComponent.content);
    } else {
      setEditText('');
    }
  }, [editingComponent]);
  
  if (!isOpen) return null;

  const handleSaveEdit = () => {
    if (editingComponent) {
      onUpdateCustomComponent(editingComponent.id, editText);
      setEditingComponent(null);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const filteredLibraryComponents = libraryComponents.filter(name =>
    name.toLowerCase().includes(filterText.toLowerCase())
  );

  const filteredCustomComponents = customComponents.filter(comp =>
    comp.name.toLowerCase().includes(filterText.toLowerCase())
  );

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl h-[80vh] flex flex-col border border-gray-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <header className="bg-green-600 p-4 flex items-center justify-between flex-shrink-0 rounded-t-xl">
          <div className="flex items-center gap-3">
            <Icon name="chip" className="h-6 w-6 text-white" />
            <h2 className="text-xl font-bold text-white">Component Manager</h2>
          </div>
          <button onClick={onClose} className="text-green-100 hover:text-white">
            <Icon name="xMark" className="h-6 w-6" />
          </button>
        </header>
        
        {/* Search Bar */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Icon name="search" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search components..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50">
          {/* Library Components */}
          <section>
            <h3 className="text-lg font-semibold text-green-700 mb-4">Library Components</h3>
            <div className="space-y-2">
              {filteredLibraryComponents.map(name => (
                <label key={name} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
                  <span className="font-medium text-gray-800">{name}</span>
                  <div className="relative">
                    <input 
                      type="checkbox" 
                      className="sr-only" 
                      checked={selectedLibraryComponents.includes(name)} 
                      onChange={() => onLibraryComponentToggle(name)} 
                    />
                    <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${selectedLibraryComponents.includes(name) ? 'transform translate-x-full bg-green-500' : ''}`}></div>
                  </div>
                </label>
              ))}
            </div>
          </section>

          {/* Custom Components */}
          <section className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-green-700">Custom Components</h3>
              <button 
                onClick={handleUploadClick}
                className="flex items-center gap-1.5 text-sm bg-green-600 text-white px-3 py-1.5 rounded-md hover:bg-green-500 transition-colors"
              >
                <Icon name="plus" className="h-4 w-4" />
                Add
              </button>
              <input type="file" ref={fileInputRef} className="sr-only" onChange={onFileUpload} accept=".xml,.json" />
            </div>
            <div className="flex-grow space-y-2 bg-gray-100 p-2 rounded-lg min-h-[150px] border border-gray-200">
              {filteredCustomComponents.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <p>{customComponents.length > 0 ? 'No matches found.' : 'No custom components uploaded.'}</p>
                </div>
              ) : (
                filteredCustomComponents.map(comp => (
                  <div key={comp.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <span className="font-medium truncate pr-2 text-gray-800" title={comp.name}>{comp.name}</span>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => setEditingComponent(comp)} className="text-gray-500 hover:text-green-600"><Icon name="pencil" className="h-5 w-5"/></button>
                      <button onClick={() => onDeleteCustomComponent(comp.id)} className="text-gray-500 hover:text-red-500"><Icon name="trash" className="h-5 w-5"/></button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      </div>
      
      {/* Editing Modal */}
      {editingComponent && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center" onClick={() => setEditingComponent(null)}>
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl h-[70vh] flex flex-col border border-gray-200" onClick={e => e.stopPropagation()}>
              <header className="bg-green-50 p-4 flex items-center justify-between border-b border-green-200 flex-shrink-0">
                <h3 className="font-semibold text-green-800">Edit: {editingComponent.name}</h3>
                 <button onClick={() => setEditingComponent(null)} className="text-gray-500 hover:text-gray-800">
                    <Icon name="xMark" className="h-6 w-6" />
                </button>
              </header>
              <div className="flex-grow p-4">
                <textarea 
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  className="w-full h-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none font-mono text-sm"
                />
              </div>
              <footer className="p-4 border-t border-gray-200 flex-shrink-0 flex justify-end gap-3 bg-gray-50 rounded-b-xl">
                <button onClick={() => setEditingComponent(null)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">Cancel</button>
                <button onClick={handleSaveEdit} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors">Save Changes</button>
              </footer>
           </div>
        </div>
      )}
    </div>
  );
};

export default ComponentManager;