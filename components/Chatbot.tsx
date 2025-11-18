
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { Icon } from './Icon';

interface Message {
    sender: 'user' | 'bot';
    text: string;
}

const Chatbot: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { sender: 'bot', text: 'Hello! How can I help you with your circuit design today?' }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isThinkingMode, setIsThinkingMode] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        const trimmedInput = inputValue.trim();
        if (!trimmedInput || isLoading) return;

        const newMessages: Message[] = [...messages, { sender: 'user', text: trimmedInput }];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            const response = await getChatResponse(trimmedInput, isThinkingMode);
            setMessages([...newMessages, { sender: 'bot', text: response }]);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : "Sorry, I couldn't get a response.";
            setMessages([...newMessages, { sender: 'bot', text: errorMessage }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <>
            {/* FAB */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-500 transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 focus:ring-green-500 z-50"
                aria-label="Open chat assistant"
            >
                <Icon name={isOpen ? 'xMark' : 'chat'} className="h-8 w-8" />
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 w-full max-w-md h-[70vh] bg-white rounded-xl shadow-2xl flex flex-col z-50 border border-gray-200 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <header className="bg-green-600 p-4 flex items-center justify-between flex-shrink-0">
                        <div className="flex items-center gap-3">
                            <Icon name="chat" className="h-6 w-6 text-white" />
                            <h2 className="text-lg font-bold text-white">AI Assistant</h2>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="text-green-100 hover:text-white">
                            <Icon name="xMark" className="h-6 w-6" />
                        </button>
                    </header>

                    {/* Messages */}
                    <div className="flex-grow p-4 overflow-y-auto bg-white">
                        <div className="flex flex-col gap-4">
                            {messages.map((msg, index) => (
                                <div key={index} className={`flex gap-3 items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.sender === 'bot' && <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center"><Icon name="logo" className="h-5 w-5 text-white" /></div>}
                                    <div className={`max-w-xs md:max-w-sm rounded-2xl p-3 text-gray-800 ${msg.sender === 'user' ? 'bg-gray-200 rounded-br-none' : 'bg-green-100 rounded-bl-none'}`}>
                                        <p className="text-sm break-words" dangerouslySetInnerHTML={{__html: msg.text.replace(/\n/g, '<br />') }} />
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3 items-start justify-start">
                                     <div className="flex-shrink-0 h-8 w-8 rounded-full bg-green-600 flex items-center justify-center"><Icon name="logo" className="h-5 w-5 text-white" /></div>
                                     <div className="max-w-xs md:max-w-sm rounded-2xl p-3 bg-green-100 rounded-bl-none">
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="h-2 w-2 bg-green-400 rounded-full animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-gray-200 p-4 bg-gray-50 flex-shrink-0 space-y-2">
                         <div className="flex items-center gap-2">
                             <label htmlFor="thinking-toggle" className="flex items-center cursor-pointer">
                                 <div className="relative">
                                     <input id="thinking-toggle" type="checkbox" className="sr-only" checked={isThinkingMode} onChange={() => setIsThinkingMode(!isThinkingMode)} />
                                     <div className="block bg-gray-300 w-10 h-6 rounded-full"></div>
                                     <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${isThinkingMode ? 'transform translate-x-full bg-green-500' : ''}`}></div>
                                 </div>
                                 <div className="ml-3 text-gray-700 text-sm font-medium flex items-center gap-1.5">
                                     <Icon name="sparkles" className={`h-4 w-4 transition-colors ${isThinkingMode ? 'text-green-500' : 'text-gray-400'}`} />
                                     Thinking Mode
                                 </div>
                             </label>
                             <p className="text-xs text-gray-400 ml-auto">{isThinkingMode ? 'Using Gemini 2.5 Pro' : 'Using Gemini 2.5 Flash'}</p>
                         </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Ask a question..."
                                className="w-full p-2 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                                disabled={isLoading}
                            />
                            <button onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()} className="bg-green-600 text-white p-2.5 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed hover:bg-green-500 transition-colors">
                                <Icon name="send" className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            <style>{`
                @keyframes fade-in-up {
                    0% { opacity: 0; transform: translateY(20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.3s ease-out forwards;
                }
            `}</style>
        </>
    );
};

export default Chatbot;