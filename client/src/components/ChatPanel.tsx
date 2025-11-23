import React, { useState } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Props {
  onSend: (msg: string) => Promise<void>;
  loading: boolean;
}

export const ChatPanel: React.FC<Props> = ({ onSend, loading }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const newMsg = { role: 'user', content: input } as Message;
    setMessages(prev => [...prev, newMsg]);
    setInput('');
    
    await onSend(input); // Trigger parent logic
    
    // Note: In a real app, you'd pass the AI reply back down here to display
    // For simplicity, we assume the parent handles state or we just show "Done"
    setMessages(prev => [...prev, { role: 'assistant', content: 'Processed.' }]);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 border-l border-gray-300 w-80">
      <div className="p-4 bg-blue-600 text-white font-bold">AI Assistant</div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`p-2 rounded-lg max-w-[90%] ${m.role === 'user' ? 'bg-blue-100 ml-auto' : 'bg-white border'}`}>
            <p className="text-sm text-gray-800">{m.content}</p>
          </div>
        ))}
        {loading && <div className="text-xs text-gray-500 italic">AI is thinking...</div>}
      </div>

      <div className="p-2 border-t bg-white">
        <div className="flex gap-2">
          <input 
            className="flex-1 border rounded px-2 py-1 text-sm"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Type a command..."
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};