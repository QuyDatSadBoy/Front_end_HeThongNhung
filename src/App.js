import React, { useState } from 'react';
import './App.css';

function App() {
  const [greenValue, setGreenValue] = useState('');
  const [redValue, setRedValue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/send-data/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          green: parseFloat(greenValue),
          red: parseFloat(redValue)
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessage(`Thành công! Entry ID: ${data.entry_id}`);
        setGreenValue('');
        setRedValue('');
      } else {
        setMessage(`Lỗi: ${data.detail}`);
      }
    } catch (error) {
      setMessage(`Lỗi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Camera Stream & ThingSpeak Data</h1>
        
        {/* Video Stream */}
        <div className="video-container" style={{ marginBottom: '30px' }}>
          <h2>Video Stream</h2>
          <img 
            src="http://localhost:8000/video_feed" 
            alt="Camera Stream"
            style={{ 
              width: '100%', 
              maxWidth: '800px',
              border: '2px solid #ccc',
              borderRadius: '8px'
            }}
          />
        </div>
        
        {/* ThingSpeak Form */}
        <div className="thingspeak-container">
          <h2>Gửi dữ liệu đến ThingSpeak</h2>
          <form onSubmit={handleSubmit} style={{ width: '300px', margin: '20px auto' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Green (Field 1):
              </label>
              <input
                type="number"
                step="0.01"
                value={greenValue}
                onChange={(e) => setGreenValue(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>
                Red (Field 2):
              </label>
              <input
                type="number"
                step="0.01"
                value={redValue}
                onChange={(e) => setRedValue(e.target.value)}
                required
                style={{ width: '100%', padding: '8px', fontSize: '16px' }}
              />
            </div>
            
            <button 
              type="submit" 
              disabled={loading}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: loading ? '#ccc' : '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '16px'
              }}
            >
              {loading ? 'Đang gửi...' : 'Gửi dữ liệu'}
            </button>
          </form>
          
          {message && (
            <div style={{
              marginTop: '20px',
              padding: '10px',
              backgroundColor: message.includes('Thành công') ? '#4CAF50' : '#f44336',
              color: 'white',
              borderRadius: '4px'
            }}>
              {message}
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;