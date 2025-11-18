import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { generateXml, generateSvgPreview } from './services/geminiService';
import { validateAndProcessCircuit } from './services/topologyEngine';
import { useFileHandler } from './hooks/useFileHandler';
import { Icon, IconType } from './components/Icon';
import CodeDisplay from './components/CodeDisplay';
import { AppState, ProcessStep, CustomComponent, ComponentDetails } from './types';
import Chatbot from './components/Chatbot';
import ComponentManager from './components/ComponentManager';
import ArchitectureModal from './components/ArchitectureModal';

const PREDEFINED_COMPONENTS = ['Resistor', 'Capacitor', 'Inductor', 'Diode', 'Transistor', 'Op-Amp'];

const App: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Create a circuit with a 9V power source, a relay, and a red LED connected in series.');
  const [userComponents, setUserComponents] = useState<CustomComponent[]>([]);
  const [selectedLibraryComponents, setSelectedLibraryComponents] = useState<string[]>([]);
  const [generatedXml, setGeneratedXml] = useState<string>('');
  const [svgPreview, setSvgPreview] = useState<string>('');
  const [promptForOutputs, setPromptForOutputs] = useState<string>('');
  const [loadingStep, setLoadingStep] = useState<ProcessStep | null>(null);
  const [error, setError] = useState<string>('');
  const [componentsChanged, setComponentsChanged] = useState<boolean>(false);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isArchitectureModalOpen, setIsArchitectureModalOpen] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState<ComponentDetails | null>(null);
  const [zoom, setZoom] = useState({ scale: 1, x: 0, y: 0 });

  const svgContainerRef = useRef<HTMLDivElement>(null);
  const panState = useRef({ isPanning: false, startX: 0, startY: 0, startPanX: 0, startPanY: 0 });
  const { handleFileUpload, handleFileDownload } = useFileHandler();

  const appState: AppState = useMemo(() => {
    if (loadingStep) return AppState.LOADING;
    if (error) return AppState.ERROR;
    if (svgPreview) return AppState.PREVIEW_READY;
    if (generatedXml) return AppState.XML_READY;
    return AppState.IDLE;
  }, [loadingStep, error, generatedXml, svgPreview]);

  const resetOutputs = useCallback(() => {
    setGeneratedXml('');
    setSvgPreview('');
    setError('');
    setLoadingStep(null);
    setPromptForOutputs('');
    setSelectedComponent(null);
    setZoom({ scale: 1, x: 0, y: 0 });
  }, []);
  
  const handlePromptChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    resetOutputs();
    setComponentsChanged(false);
  }, [resetOutputs]);

  const onFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileData = await handleFileUpload(event);
    if (fileData) {
      const newComponent: CustomComponent = {
        id: `custom-${Date.now()}`,
        name: fileData.name,
        content: fileData.content,
      };
      setUserComponents(prev => [...prev, newComponent]);
      setComponentsChanged(true);
    }
  }, [handleFileUpload]);
  
  const handleDeleteUserComponent = useCallback((id: string) => {
    setUserComponents(prev => prev.filter(c => c.id !== id));
    setComponentsChanged(true);
  }, []);

  const handleUpdateUserComponent = useCallback((id: string, newContent: string) => {
    setUserComponents(prev => prev.map(c => c.id === id ? { ...c, content: newContent } : c));
    setComponentsChanged(true);
  }, []);

  const handleLibraryComponentToggle = useCallback((componentName: string) => {
    setSelectedLibraryComponents(prev => {
        const isSelected = prev.includes(componentName);
        if (isSelected) {
            return prev.filter(c => c !== componentName);
        } else {
            return [...prev, componentName];
        }
    });
    setComponentsChanged(true);
  }, []);

  const parseComponentDetails = useCallback((xmlString: string, id: string): ComponentDetails | null => {
    if (!xmlString) return null;
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, "application/xml");
      const componentNode = xmlDoc.querySelector(`component[id="${id}"]`);
      if (!componentNode) return null;
  
      const attributes: Array<{ name: string; value: string }> = [];
      componentNode.querySelectorAll('attribute').forEach(attr => {
        attributes.push({
          name: attr.getAttribute('name') || '',
          value: attr.getAttribute('value') || '',
        });
      });
  
      return {
        id: id,
        type: componentNode.getAttribute('type') || 'Unknown',
        name: componentNode.getAttribute('name') || 'Unnamed',
        attributes,
      };
    } catch (e) {
      console.error("Error parsing XML for details:", e);
      return null;
    }
  }, []);

  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;
  
    const handleClick = (event: MouseEvent) => {
      if (panState.current.isPanning) return;
      const target = event.target as SVGElement;
      const componentElement = target.closest('.component');
  
      if (componentElement && componentElement.id) {
        if(selectedComponent?.id === componentElement.id) {
          setSelectedComponent(null);
        } else {
          const details = parseComponentDetails(generatedXml, componentElement.id);
          setSelectedComponent(details);
        }
      } else {
        if (!target.closest('.inspector-panel')) {
           setSelectedComponent(null);
        }
      }
    };
  
    container.addEventListener('click', handleClick);
  
    return () => {
      container.removeEventListener('click', handleClick);
    };
  }, [generatedXml, selectedComponent, parseComponentDetails]);
  
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;
  
    container.querySelectorAll('.component.selected').forEach(el => {
      el.classList.remove('selected');
    });
  
    if (selectedComponent) {
      try {
        const el = container.querySelector(`[id='${selectedComponent.id}']`);
        if (el) {
          el.classList.add('selected');
        }
      } catch (e) {
        console.error("Failed to select element by ID:", e);
      }
    }
  }, [selectedComponent, svgPreview]);

  // Zoom and Pan Logic
  useEffect(() => {
    const container = svgContainerRef.current;
    if (!container) return;

    container.style.cursor = 'grab';

    const handleWheel = (e: WheelEvent) => {
        e.preventDefault();
        setZoom(prevZoom => {
            const scaleDelta = e.deltaY * -0.005;
            const newScale = Math.min(Math.max(prevZoom.scale + scaleDelta, 0.2), 7);
            const rect = container.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const mouseY = e.clientY - rect.top;
            
            const newX = mouseX - (mouseX - prevZoom.x) * (newScale / prevZoom.scale);
            const newY = mouseY - (mouseY - prevZoom.y) * (newScale / prevZoom.scale);

            return { scale: newScale, x: newX, y: newY };
        });
    };

    const handleMouseDown = (e: MouseEvent) => {
        if (e.button !== 0 || (e.target as HTMLElement).closest('.zoom-controls, .inspector-panel, .component')) {
            return;
        }
        e.preventDefault();
        panState.current.isPanning = true;
        panState.current.startX = e.clientX;
        panState.current.startY = e.clientY;
        setZoom(prevZoom => {
            panState.current.startPanX = prevZoom.x;
            panState.current.startPanY = prevZoom.y;
            return prevZoom;
        });
        container.style.cursor = 'grabbing';
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (!panState.current.isPanning) return;
        e.preventDefault();
        const dx = e.clientX - panState.current.startX;
        const dy = e.clientY - panState.current.startY;
        setZoom(prevZoom => ({
            scale: prevZoom.scale,
            x: panState.current.startPanX + dx,
            y: panState.current.startPanY + dy
        }));
    };

    const handleMouseUp = () => {
        if (panState.current.isPanning) {
            panState.current.isPanning = false;
            container.style.cursor = 'grab';
        }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mouseleave', handleMouseUp);

    return () => {
        container.removeEventListener('wheel', handleWheel);
        container.removeEventListener('mousedown', handleMouseDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);
  
  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a circuit description.');
      return;
    }
    resetOutputs();
    setPromptForOutputs(prompt);

    const libraryComponentInfo = selectedLibraryComponents.length > 0
        ? `User-selected library components to include:\n- ${selectedLibraryComponents.join('\n- ')}\n`
        : '';
    
    const customComponentInfo = userComponents.length > 0
        ? `User-uploaded custom component definitions:\n---\n${userComponents.map(c => `// Component: ${c.name}\n${c.content}`).join('\n---\n')}\n---`
        : '';

    const additionalComponents = [libraryComponentInfo, customComponentInfo].filter(Boolean).join('\n');

    try {
      setLoadingStep(ProcessStep.GENERATE_XML);
      const rawXml = await generateXml(prompt, additionalComponents || null);

      setLoadingStep(ProcessStep.VALIDATE_TOPOLOGY);
      const validatedXml = validateAndProcessCircuit(rawXml);
      setGeneratedXml(validatedXml);

      setLoadingStep(ProcessStep.GENERATE_PREVIEW);
      const svg = await generateSvgPreview(validatedXml);
      setSvgPreview(svg);
      setComponentsChanged(false);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred during the generation process.';
      setError(errorMessage);
      setGeneratedXml('');
      setSvgPreview('');
    } finally {
      setLoadingStep(null);
    }
  };
  
  const ActionButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    isLoading: boolean;
    icon: IconType;
    text: string;
    className?: string;
  }> = ({ onClick, disabled, isLoading, icon, text, className = '' }) => (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`flex items-center justify-center gap-2 w-full px-4 py-3 font-semibold text-white rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${
        disabled
          ? 'bg-gray-400 cursor-not-allowed'
          : `${className} hover:scale-105 active:scale-100`
      }`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : (
        <>
          <Icon name={icon} className="h-5 w-5" />
          {text}
        </>
      )}
    </button>
  );

  const handleZoomIn = () => setZoom(prev => ({ ...prev, scale: Math.min(prev.scale * 1.3, 7) }));
  const handleZoomOut = () => setZoom(prev => ({ ...prev, scale: Math.max(prev.scale / 1.3, 0.2) }));
  const handleResetZoom = () => setZoom({ scale: 1, x: 0, y: 0 });

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-800 flex flex-col">
      <header className="bg-green-600 shadow-md p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
            <Icon name="logo" className="h-10 w-10 text-white" />
            <div>
            <h1 className="text-2xl font-bold text-white">AutoCircuit Generator</h1>
            <p className="text-sm text-green-100">AI-Powered Circuit Diagramming from Natural Language</p>
            </div>
        </div>
        <button
          onClick={() => setIsArchitectureModalOpen(true)}
          className="text-green-100 hover:text-white p-2 rounded-full hover:bg-green-700 transition-colors"
          title="View System Architecture"
        >
          <Icon name="server" className="h-6 w-6" />
        </button>
      </header>

      <main className="flex-grow p-4 lg:p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column: Inputs & Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-6 xl:col-span-1 h-full border border-gray-200">
          <div className="flex-grow flex flex-col gap-4">
              <label htmlFor="prompt" className="text-lg font-semibold text-green-700">1. Describe Your Circuit</label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={handlePromptChange}
                placeholder="e.g., A fan controlled by a temperature sensor..."
                className="w-full h-48 p-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors duration-200 resize-none"
              />
          </div>

          <div>
            <label className="text-lg font-semibold text-green-700">2. Manage Components</label>
            <div className="mt-2">
              <button 
                onClick={() => setIsManagerOpen(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors font-semibold"
              >
                <Icon name="chip" className="w-5 h-5" />
                <span>Open Component Manager</span>
              </button>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
              <h2 className="text-lg font-semibold text-green-700">3. Generate Diagram</h2>
              {generatedXml && componentsChanged ? (
                <ActionButton
                  onClick={handleGenerate}
                  disabled={!prompt}
                  isLoading={!!loadingStep}
                  icon="gear"
                  text="Apply Component Changes"
                  className="bg-amber-500 hover:bg-amber-400"
                />
              ) : (
                <ActionButton 
                  onClick={handleGenerate} 
                  disabled={!prompt} 
                  isLoading={!!loadingStep} 
                  icon="gear" 
                  text="Generate Diagram" 
                  className="bg-green-600 hover:bg-green-500" 
                />
              )}
          </div>
        </div>

        {/* Right Columns: Output & Preview */}
        <div className="xl:col-span-2 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Preview Display */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-[75vh] lg:h-auto border border-gray-200">
            <h2 className="text-xl font-bold text-green-700 pb-4 border-b border-gray-200">Live Preview</h2>
            <div className="flex-grow mt-4 flex flex-col bg-gray-100 rounded-lg overflow-hidden relative" ref={svgContainerRef}>
              {loadingStep === ProcessStep.VALIDATE_TOPOLOGY && (
                <div className="m-auto text-center">
                  <Icon name="loader" className="h-12 w-12 animate-spin text-green-500 mx-auto" />
                  <p className="mt-4 text-gray-600">Validating circuit topology...</p>
                </div>
              )}
              {loadingStep === ProcessStep.GENERATE_PREVIEW && (
                <div className="m-auto text-center">
                  <Icon name="loader" className="h-12 w-12 animate-spin text-green-500 mx-auto" />
                  <p className="mt-4 text-gray-600">Generating visual preview...</p>
                </div>
              )}
              {appState !== AppState.LOADING && !svgPreview && !error && (
                <div className="m-auto text-center text-gray-400">
                  <Icon name="image" className="h-16 w-16 mx-auto" />
                  <p className="mt-2">Circuit preview will be displayed here</p>
                </div>
              )}
              {svgPreview && !error && (
                <div
                  className="w-full h-full"
                  style={{ transform: `translate(${zoom.x}px, ${zoom.y}px) scale(${zoom.scale})`, transformOrigin: '0 0' }}
                >
                  <div className="w-full h-full flex flex-col">
                    <div className="flex-shrink-0" style={{ transform: `scale(${1/zoom.scale})`, width: `${zoom.scale * 100}%`, transformOrigin: 'top left', marginBottom: `${zoom.scale * 1}rem` }}>
                      <div className="p-3 bg-green-50/80 rounded-lg border border-green-200">
                        <p className="text-sm font-semibold text-green-800">Showing preview for prompt:</p>
                        <p className="text-sm text-green-700 italic mt-1">"{promptForOutputs}"</p>
                      </div>
                    </div>
                    <div className="w-full flex-grow" dangerouslySetInnerHTML={{ __html: svgPreview }} />
                  </div>
                </div>
              )}
              {error && (
                <div className="m-auto text-red-700 p-4 bg-red-100 rounded-lg text-center border border-red-200">
                    <h3 className="font-bold mb-2">Generation Failed</h3>
                    <p className="text-sm">{error}</p>
                </div>
              )}
              
              {svgPreview && (
                <div className="zoom-controls absolute bottom-4 right-4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg p-1 flex items-center gap-1 shadow-lg">
                  <button onClick={handleZoomOut} className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded-md transition-colors" title="Zoom Out"><Icon name="minus" className="h-5 w-5" /></button>
                  <button onClick={handleResetZoom} className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded-md transition-colors" title="Reset View"><Icon name="viewfinder" className="h-5 w-5" /></button>
                  <button onClick={handleZoomIn} className="p-2 text-green-700 hover:text-green-900 hover:bg-green-100 rounded-md transition-colors" title="Zoom In"><Icon name="plus" className="h-5 w-5" /></button>
                </div>
              )}

              {selectedComponent && (
                <div className="inspector-panel absolute top-4 right-4 bg-white/80 backdrop-blur-md border border-gray-200 rounded-lg p-4 w-64 shadow-lg animate-fade-in">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="font-bold text-green-800 flex items-center gap-2">
                      <Icon name="info" className="h-5 w-5 text-green-600" />
                      Component Details
                    </h3>
                    <button onClick={() => setSelectedComponent(null)} className="text-gray-500 hover:text-gray-800">
                      <Icon name="xMark" className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm max-h-64 overflow-y-auto">
                    <p><strong className="text-gray-600">ID:</strong> {selectedComponent.id}</p>
                    <p><strong className="text-gray-600">Name:</strong> {selectedComponent.name}</p>
                    <p><strong className="text-gray-600">Type:</strong> {selectedComponent.type}</p>
                    {selectedComponent.attributes.length > 0 && (
                      <div>
                        <strong className="text-gray-600">Attributes:</strong>
                        <ul className="list-disc list-inside pl-2 mt-1 space-y-1">
                          {selectedComponent.attributes.map(attr => (
                            <li key={attr.name}>{attr.name}: <span className="text-green-700 font-medium">{attr.value}</span></li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Code Display */}
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col h-[75vh] lg:h-auto border border-gray-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-green-700">Generated XML</h2>
              <button 
                onClick={() => handleFileDownload(generatedXml, 'circuit.xml')} 
                disabled={!generatedXml}
                className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200 disabled:bg-gray-50 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                title="Download XML"
              >
                <Icon name="download" className="h-5 w-5"/>
              </button>
            </div>
            <div className="flex-grow pt-4 overflow-hidden">
              <CodeDisplay language="xml" code={generatedXml} isLoading={loadingStep === ProcessStep.GENERATE_XML || loadingStep === ProcessStep.VALIDATE_TOPOLOGY} placeholder="XML output will appear here..." />
            </div>
          </div>
        </div>
      </main>

      <Chatbot />
      
      <ComponentManager 
        isOpen={isManagerOpen}
        onClose={() => setIsManagerOpen(false)}
        libraryComponents={PREDEFINED_COMPONENTS}
        selectedLibraryComponents={selectedLibraryComponents}
        onLibraryComponentToggle={handleLibraryComponentToggle}
        customComponents={userComponents}
        onFileUpload={onFileUpload}
        onUpdateCustomComponent={handleUpdateUserComponent}
        onDeleteCustomComponent={handleDeleteUserComponent}
      />

      <ArchitectureModal 
        isOpen={isArchitectureModalOpen}
        onClose={() => setIsArchitectureModalOpen(false)}
      />

      <style>{`
        @keyframes fade-in {
            0% { opacity: 0; transform: scale(0.95); }
            100% { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;