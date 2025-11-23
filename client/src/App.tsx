import { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import { Spreadsheet } from './components/Spreadsheet';
import { ChatPanel } from './components/ChatPanel';

function App() {
  // Explicitly type the data state
  // Initialize with a visible 5x10 grid instead of empty [[]]
  const [data, setData] = useState<any[][]>(
    Array(10).fill('').map(() => Array(5).fill(''))
  );
  const [loading, setLoading] = useState(false);
  const gridRef = useRef<any>(null);

  useEffect(() => {
    axios.get('http://localhost:5000/api/sheet')
      // Fix: Add explicit types to arguments
      .then((res: any) => {
        if (res.data.data && res.data.data.length > 0) setData(res.data.data);
      })
      .catch((err: any) => console.error("DB Error:", err));
  }, []);

  const handleDataChange = async (newData: any[][]) => {
    try {
      await axios.post('http://localhost:5000/api/sheet', { data: newData });
    } catch (err: any) {
      console.error("Save failed", err);
    }
  };

  const handleChat = async (userText: string) => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/chat', {
        messages: [{ role: 'user', content: userText }]
      });

      const { action } = res.data;

      if (action && gridRef.current) {
        const hot = gridRef.current;
        if (action.operation === 'UPDATE_CELL' || action.operation === 'SET_FORMULA') {
          hot.setDataAtCell(action.row, action.col, action.value);
          handleDataChange(hot.getData());
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex-1 h-full overflow-hidden relative">
        <Spreadsheet
          data={data}
          onChange={handleDataChange}
          forwardRef={gridRef}
        />
      </div>
      <ChatPanel onSend={handleChat} loading={loading} />
    </div>
  );
}

export default App;