import React, { useState, useEffect, useRef } from "react";
import { useSceneStore } from "../../hooks/useSceneStore";
import { fetchLocalAIResponse } from "../../api/openai";

// --- SUB-COMPONENT: Chat Message Bubble ---
// Menyatukan style bubble di sini agar konsisten sci-fi
const ChatMessage = ({ message }) => {
  const isUser = message.role === "user";
  const isSystem = message.role === "system";

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 opacity-70">
        <span className="text-[10px] uppercase tracking-widest text-cyan-500 font-mono border border-cyan-900/50 px-2 py-1 rounded bg-black/40">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-4 ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`relative max-w-[85%] px-4 py-3 text-sm font-sans leading-relaxed
          ${isUser 
            ? "bg-cyan-900/20 border-r-2 border-cyan-400 text-cyan-50 rounded-l-lg rounded-tr-sm" 
            : "bg-slate-900/60 border-l-2 border-white/20 text-slate-300 rounded-r-lg rounded-tl-sm backdrop-blur-sm shadow-lg"
          }
        `}
      >
        {/* Decorative corner marker for AI */}
        {!isUser && <div className="absolute top-0 left-0 w-1 h-1 bg-white/50"></div>}
        
        {/* Label kecil untuk peran */}
        <div className="text-[9px] font-mono uppercase mb-1 opacity-50 tracking-wider">
          {isUser ? "USER_INPUT" : "AI_CORE_RESPONSE"}
        </div>
        
        {message.content}
      </div>
    </div>
  );
};

// --- SUB-COMPONENT: Chat Input ---
const ChatInputArea = ({ onSubmit, isLoading }) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSubmit(input);
    setInput("");
  };

  return (
    <form onSubmit={handleSubmit} className="relative mt-auto pt-4 border-t border-white/10 bg-black/20 backdrop-blur-md p-4">
      <div className="relative flex items-center group">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isLoading ? "Processing data..." : "Enter query..."}
          disabled={isLoading}
          className="w-full bg-slate-900/50 border border-cyan-900/50 text-cyan-100 text-sm rounded-none pl-4 pr-12 py-3 focus:outline-none focus:border-cyan-500/80 focus:ring-1 focus:ring-cyan-500/20 placeholder-cyan-700/50 font-mono transition-all"
        />
        
        {/* Send Button */}
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="absolute right-2 p-1.5 text-cyan-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? (
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          )}
        </button>
      </div>
      {/* Footer deco */}
      <div className="flex justify-between items-center mt-2">
         <span className="text-[8px] text-cyan-600/50 font-mono">SECURE CONNECTION // ENCRYPTED</span>
         <div className="h-[2px] w-12 bg-cyan-800/30"></div>
      </div>
    </form>
  );
};


// --- MAIN DATA ---
const expertPersona = {
  atom: "You are an expert in atomic structure, quantum behavior, and subatomic particles.",
  dna: "You are an expert in genetics, DNA structure, replication, and molecular biology.",
  cell: "You are a specialist in cellular biology, organelles, and biochemical processes.",
  earth: "You are a geoscience and planetary expert focusing on Earth and the Moon.",
  solar: "You are an astrophysics expert specializing in the Solar System.",
  galaxy: "You are an expert in galactic formation, stars, and black holes.",
  universe: "You are a cosmology and astrophysics expert specializing in spacetime.",
};

// --- MAIN COMPONENT ---
function AIPanel() {
  const { isAIPanelOpen, currentScale } = useSceneStore();
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isAIPanelOpen]);

  // Context switching effect
  useEffect(() => {
    if (isAIPanelOpen) {
      const scaleName = currentScale.charAt(0).toUpperCase() + currentScale.slice(1);
      
      const welcomeMsg = {
        role: "system",
        content: `SYSTEM INITIALIZED: ${scaleName.toUpperCase()} SCALE MODULE LOADED.`
      };

      // Cek agar tidak duplikat pesan system jika scale belum berubah
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (!lastMsg || lastMsg.content !== welcomeMsg.content) {
         // Keep old history but add system separator? 
         // Or clear history? Let's just append system notification.
         if (chatHistory.length === 0) {
            setChatHistory([welcomeMsg]);
         } else {
            // Optional: kalau mau clear history per scale, uncomment baris bawah:
            // setChatHistory([welcomeMsg]); 
            // Kalau mau retain history tapi kasih marker:
             setChatHistory(prev => [...prev, welcomeMsg]);
         }
      }
    }
  }, [currentScale, isAIPanelOpen]); // Removed chatHistory dep to avoid loop

  const handleSubmit = async (message) => {
    setIsLoading(true);
    const newUserMessage = { role: "user", content: message };
    
    // Optimistic UI update
    const tempHistory = [...chatHistory, newUserMessage];
    setChatHistory(tempHistory);

    try {
      const persona = expertPersona[currentScale] || "You are an expert in fundamental science.";
      
      const aiResponse = await fetchLocalAIResponse(
        message,
        tempHistory.filter(m => m.role !== 'system'), // Filter system messages for API clarity
        currentScale,
        persona
      );

      const newAiMessage = { role: "assistant", content: aiResponse };
      setChatHistory(prev => [...prev, newAiMessage]);
      
    } catch (err) {
      console.error(err);
      const errorMessage = {
        role: "system",
        content: "ERROR: LINK TO AI CORE SEVERED. RETRY.",
      };
      setChatHistory(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop overlay for mobile only */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-30 transition-opacity duration-500 md:hidden ${
          isAIPanelOpen ? "opacity-50 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Main Panel */}
      <div
        className={`fixed top-4 right-4 bottom-4 w-full md:w-[21rem] z-40 transform transition-transform duration-500 cubic-bezier(0.22, 1, 0.36, 1) ${
          isAIPanelOpen ? "translate-x-0" : "translate-x-[120%]"
        }`}
      >
        {/* Container Isi Panel */}
        {/* Tambahkan rounded-2xl dan overflow-hidden di sini juga agar background mengikuti bentuk */}
        <div className="h-1/2 flex flex-col bg-slate-900/90 backdrop-blur-xl border border-cyan-500/20 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] rounded-2xl overflow-hidden">
          
          {/* HEADER */}
          <div className="relative px-6 py-6 border-b border-white/10 shrink-0 bg-gradient-to-r from-cyan-900/20 to-transparent">
            {/* Animated scanning line under header */}
            <div className="absolute bottom-0 left-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-full animate-pulse"></div>
            
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-xl font-bold text-white tracking-[0.15em] uppercase">
                    AI Interface
                  </h2>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_#22c55e]"></div>
                    <span className="text-[10px] text-cyan-400 font-mono uppercase tracking-wider">
                      Online // {currentScale} Layer
                    </span>
                  </div>
               </div>
               {/* Optional: Close Button Icon (karena floating, biasanya butuh tombol close visual) */}
               <button onClick={() => {/* logic close */}} className="md:hidden text-cyan-500">
                 ✕
               </button>
            </div>
          </div>

          {/* CHAT HISTORY AREA */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-cyan-900 scrollbar-track-transparent"
          >
            {chatHistory.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-cyan-700/50 opacity-50">
                  <svg className="w-16 h-16 mb-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  <p className="text-xs font-mono tracking-widest">AWAITING INPUT...</p>
               </div>
            ) : (
               chatHistory.map((msg, idx) => (
                 <ChatMessage key={idx} message={msg} />
               ))
            )}
          </div>

          {/* INPUT AREA */}
          <ChatInputArea onSubmit={handleSubmit} isLoading={isLoading} />
        </div>
      </div>
    </>
  );
}

export default AIPanel;