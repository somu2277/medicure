import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Sparkles, User, Bot, AlertCircle } from 'lucide-react';
import api from '../utils/api';

const AskEasyPage = () => {
    const [messages, setMessages] = useState([
        { role: 'bot', content: 'Hello! I am your AI healthcare assistant. How can I help you today? Please note that I can only answer health and wellness related questions.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = input.trim();
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const { data } = await api.post('/chatbot', { message: userMsg });
            if (data.success) {
                setMessages(prev => [...prev, { role: 'bot', content: data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'bot', content: 'Sorry, I could not reach the server right now. Please check your internet connection or try again later.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 min-h-[calc(100vh-140px)] py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-slate-800 mb-4 flex items-center justify-center gap-3">
                        <Sparkles className="text-teal-500" size={32} />
                        Ask Easy AI
                    </h1>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Your personal, AI-powered healthcare assistant. Ask about symptoms, medications, general wellness, and health tips.
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
                    {/* Chat Header */}
                    <div className="bg-teal-600 px-6 py-4 flex items-center justify-between text-white shadow-md relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="bg-white/20 p-2 rounded-lg">
                                <MessageSquare size={24} />
                            </div>
                            <div>
                                <h2 className="font-bold text-lg">MediCare Health Assistant</h2>
                                <p className="text-teal-100 text-xs flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span> Online
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-amber-50 px-4 py-2 border-b border-amber-100 flex items-start gap-2 text-amber-700 text-xs">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <p><strong>Disclaimer:</strong> This AI provides general information only and is not a substitute for professional medical advice, diagnosis, or treatment.</p>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 p-6 overflow-y-auto bg-slate-50 flex flex-col gap-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-sm ${msg.role === 'user' ? 'bg-teal-100 text-teal-700' : 'bg-white border border-slate-200 text-teal-600'}`}>
                                        {msg.role === 'user' ? <User size={16} /> : <Bot size={18} />}
                                    </div>
                                    
                                    {/* Bubble */}
                                    <div 
                                        className={`p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-teal-600 text-white rounded-tr-none' 
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-none'
                                        }`}
                                    >
                                        {msg.content.split('\n').map((line, i) => (
                                            <span key={i}>
                                                {line}
                                                {i !== msg.content.split('\n').length - 1 && <br />}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-3 max-w-[85%]">
                                    <div className="w-8 h-8 rounded-full bg-white border border-slate-200 text-teal-600 flex items-center justify-center shrink-0 mt-1 shadow-sm">
                                        <Bot size={18} />
                                    </div>
                                    <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-none p-4 shadow-sm flex items-center gap-2">
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.15s'}}></div>
                                        <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="bg-white p-4 border-t border-slate-200">
                        <form onSubmit={handleSend} className="relative flex items-center">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type your health question here..."
                                className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 transition-all text-slate-700"
                                disabled={isLoading}
                            />
                            <button 
                                type="submit" 
                                disabled={isLoading || !input.trim()}
                                className="absolute right-2 p-3 bg-teal-600 text-white rounded-full hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
                            >
                                <Send size={18} className="ml-0.5" />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AskEasyPage;
