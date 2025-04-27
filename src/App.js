import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';

// Định nghĩa URL API
const API_BASE_URL = 'http://localhost:8000';

function App() {
  // State cho dữ liệu
  const [trafficStats, setTrafficStats] = useState({
    horizontal_count: 0,
    vertical_count: 0,
    horizontal_density: 0,
    vertical_density: 0,
    current_direction: 'horizontal',
    timestamp: '-'
  });

  const [trafficLightState, setTrafficLightState] = useState({
    horizontal: 'red',
    vertical: 'green',
    horizontal_time: 0,
    vertical_time: 0
  });

  const [historicalData, setHistoricalData] = useState({
    horizontal: {
      timestamps: [],
      counts: [],
      densities: []
    },
    vertical: {
      timestamps: [],
      counts: [],
      densities: []
    }
  });

  const [smartMode, setSmartMode] = useState(true);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Hàm lấy dữ liệu từ API
  const fetchTrafficStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/traffic_stats`);
      setTrafficStats(response.data);
    } catch (error) {
      console.error('Error fetching traffic stats:', error);
    }
  };

  const fetchTrafficLightState = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/traffic_light_state`);
      setTrafficLightState(response.data);
    } catch (error) {
      console.error('Error fetching traffic light state:', error);
    }
  };

  const fetchHistoricalData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/historical_data`);
      setHistoricalData(response.data);
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }
  };

  // Thay đổi hướng camera
  const changeCameraDirection = async (direction) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/camera_direction`, {
        direction: direction
      });
      setMessage(`Đã chuyển camera sang hướng ${direction}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Lỗi: ${error.response?.data?.detail || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Bật/tắt chế độ thông minh
  const toggleSmartMode = async () => {
    try {
      setLoading(true);
      const newState = !smartMode;
      const response = await axios.post(`${API_BASE_URL}/smart_mode/${newState}`);
      setSmartMode(newState);
      setMessage(`Đã ${newState ? 'bật' : 'tắt'} chế độ thông minh`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Lỗi: ${error.response?.data?.detail || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Gửi dữ liệu đến ThingSpeak (chức năng kiểm thử)
  const sendTestDataToThingSpeak = async () => {
    try {
      setLoading(true);
      const green = trafficLightState.horizontal === 'green' ? 1 : 0;
      const red = trafficLightState.horizontal === 'red' ? 1 : 0;
      
      const response = await axios.post(`${API_BASE_URL}/send-data/`, {
        green: green,
        red: red
      });
      
      setMessage(`Đã gửi dữ liệu kiểm thử thành công (Entry ID: ${response.data.entry_id})`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage(`Lỗi: ${error.response?.data?.detail || error.message}`);
      setTimeout(() => setMessage(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Hàm tạo biểu đồ đơn giản bằng CSS
  const renderSimpleChart = (data, maxValue) => {
    return (
      <div className="simple-chart">
        {data.map((value, index) => (
          <div 
            key={index} 
            className="chart-bar" 
            style={{ 
              height: `${(value / maxValue) * 100}%`,
              backgroundColor: value > maxValue * 0.7 ? '#ff4d4d' : 
                              value > maxValue * 0.4 ? '#ffaa00' : '#4CAF50'
            }}
            title={`Giá trị: ${value.toFixed(2)}`}
          />
        ))}
      </div>
    );
  };

  // Đồng hồ đèn giao thông
  const TrafficLightClock = ({ state, time }) => {
    const getColor = (lightState) => {
      if (lightState === 'red') return '#ff0000';
      if (lightState === 'yellow') return '#ffcc00';
      if (lightState === 'green') return '#00cc00';
      return '#444';
    };

    return (
      <div className="traffic-light-clock">
        <div className="traffic-light">
          <div className="light red" style={{ opacity: state === 'red' ? 1 : 0.3 }}></div>
          <div className="light yellow" style={{ opacity: state === 'yellow' ? 1 : 0.3 }}></div>
          <div className="light green" style={{ opacity: state === 'green' ? 1 : 0.3 }}></div>
        </div>
        <div className="countdown" style={{ color: getColor(state) }}>
          {time}s
        </div>
      </div>
    );
  };

  // Sử dụng useEffect để lấy dữ liệu định kỳ
  useEffect(() => {
    // Lấy dữ liệu ngay khi trang tải
    fetchTrafficStats();
    fetchTrafficLightState();
    fetchHistoricalData();

    // Thiết lập interval để cập nhật dữ liệu
    const statsInterval = setInterval(fetchTrafficStats, 1000);
    const lightInterval = setInterval(fetchTrafficLightState, 1000);
    const historicalInterval = setInterval(fetchHistoricalData, 5000);

    // Dọn dẹp interval khi component unmount
    return () => {
      clearInterval(statsInterval);
      clearInterval(lightInterval);
      clearInterval(historicalInterval);
    };
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Hệ Thống Phân Tích Giao Thông Thông Minh</h1>
        
        {/* Grid layout cho giao diện */}
        <div className="dashboard-grid">
          {/* Video Stream */}
          <div className="video-container">
            <h2>Camera Giám Sát</h2>
            <div className="video-wrapper">
              <img 
                src={`${API_BASE_URL}/video_feed`} 
                alt="Camera Stream"
                className="video-stream"
              />
              <div className="camera-info">
                <span>Hướng hiện tại: <strong>{trafficStats.current_direction === 'horizontal' ? 'Ngang' : 'Dọc'}</strong></span>
                <div className="camera-controls">
                  <button 
                    onClick={() => changeCameraDirection('horizontal')}
                    disabled={loading || trafficStats.current_direction === 'horizontal'}
                    className={trafficStats.current_direction === 'horizontal' ? 'active' : ''}
                  >
                    Hướng Ngang
                  </button>
                  <button 
                    onClick={() => changeCameraDirection('vertical')}
                    disabled={loading || trafficStats.current_direction === 'vertical'}
                    className={trafficStats.current_direction === 'vertical' ? 'active' : ''}
                  >
                    Hướng Dọc
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Traffic Lights */}
          <div className="traffic-light-container">
            <h2>Trạng Thái Đèn Giao Thông</h2>
            <div className="traffic-lights-display">
              <div className="traffic-direction">
                <h3>Hướng Ngang</h3>
                <TrafficLightClock 
                  state={trafficLightState.horizontal} 
                  time={trafficLightState.horizontal_time} 
                />
              </div>
              <div className="traffic-direction">
                <h3>Hướng Dọc</h3>
                <TrafficLightClock 
                  state={trafficLightState.vertical} 
                  time={trafficLightState.vertical_time} 
                />
              </div>
            </div>
            <div className="traffic-light-mode">
              <label>
                <input 
                  type="checkbox" 
                  checked={smartMode}
                  onChange={toggleSmartMode}
                  disabled={loading}
                />
                Chế độ điều khiển thông minh
              </label>
              <p className="mode-description">
                {smartMode ? 
                  'Thời gian đèn sẽ được điều chỉnh tự động dựa trên mật độ giao thông' : 
                  'Thời gian đèn cố định, không phụ thuộc vào mật độ giao thông'
                }
              </p>
            </div>
          </div>
          
          {/* Traffic Statistics */}
          <div className="traffic-stats-container">
            <h2>Thống Kê Giao Thông</h2>
            <div className="stats-grid">
              <div className="stat-box">
                <h3>Hướng Ngang</h3>
                <div className="stat-value">{trafficStats.horizontal_count}</div>
                <div className="stat-label">phương tiện</div>
                <div className="density-meter">
                  <div 
                    className="density-fill" 
                    style={{ 
                      width: `${trafficStats.horizontal_density * 100}%`,
                      backgroundColor: `rgba(${255 * trafficStats.horizontal_density}, ${255 * (1 - trafficStats.horizontal_density)}, 0, 0.8)`
                    }}
                  ></div>
                  <div className="density-text">{Math.round(trafficStats.horizontal_density * 100)}%</div>
                </div>
                <div className="stat-label">mật độ</div>
              </div>
              <div className="stat-box">
                <h3>Hướng Dọc</h3>
                <div className="stat-value">{trafficStats.vertical_count}</div>
                <div className="stat-label">phương tiện</div>
                <div className="density-meter">
                  <div 
                    className="density-fill" 
                    style={{ 
                      width: `${trafficStats.vertical_density * 100}%`,
                      backgroundColor: `rgba(${255 * trafficStats.vertical_density}, ${255 * (1 - trafficStats.vertical_density)}, 0, 0.8)`
                    }}
                  ></div>
                  <div className="density-text">{Math.round(trafficStats.vertical_density * 100)}%</div>
                </div>
                <div className="stat-label">mật độ</div>
              </div>
            </div>
            <div className="update-info">
              Cập nhật lúc: {trafficStats.timestamp}
            </div>
          </div>
          
          {/* Historical Data Charts */}
          <div className="historical-data-container">
            <h2>Biểu Đồ Theo Thời Gian</h2>
            <div className="charts-container">
              <div className="chart-box">
                <h3>Số lượng phương tiện</h3>
                <div className="chart-area">
                  {historicalData.horizontal.counts.length > 0 ? (
                    <div className="chart-wrapper">
                      {renderSimpleChart(
                        historicalData.horizontal.counts.slice(-20), 
                        Math.max(...historicalData.horizontal.counts, ...historicalData.vertical.counts, 15)
                      )}
                      <div className="chart-legend horizontal">Hướng ngang</div>
                    </div>
                  ) : (
                    <div className="no-data">Chưa có dữ liệu</div>
                  )}
                  
                  {historicalData.vertical.counts.length > 0 ? (
                    <div className="chart-wrapper">
                      {renderSimpleChart(
                        historicalData.vertical.counts.slice(-20), 
                        Math.max(...historicalData.horizontal.counts, ...historicalData.vertical.counts, 15)
                      )}
                      <div className="chart-legend vertical">Hướng dọc</div>
                    </div>
                  ) : (
                    <div className="no-data">Chưa có dữ liệu</div>
                  )}
                </div>
              </div>
              
              <div className="chart-box">
                <h3>Mật độ giao thông</h3>
                <div className="chart-area">
                  {historicalData.horizontal.densities.length > 0 ? (
                    <div className="chart-wrapper">
                      {renderSimpleChart(
                        historicalData.horizontal.densities.slice(-20), 
                        1
                      )}
                      <div className="chart-legend horizontal">Hướng ngang</div>
                    </div>
                  ) : (
                    <div className="no-data">Chưa có dữ liệu</div>
                  )}
                  
                  {historicalData.vertical.densities.length > 0 ? (
                    <div className="chart-wrapper">
                      {renderSimpleChart(
                        historicalData.vertical.densities.slice(-20), 
                        1
                      )}
                      <div className="chart-legend vertical">Hướng dọc</div>
                    </div>
                  ) : (
                    <div className="no-data">Chưa có dữ liệu</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Message display */}
        {message && (
          <div className="message-box">
            {message}
          </div>
        )}
        
        {/* Advanced controls */}
        <div className="advanced-controls">
          <button 
            className="toggle-advanced" 
            onClick={() => setShowAdvancedControls(!showAdvancedControls)}
          >
            {showAdvancedControls ? 'Ẩn điều khiển nâng cao' : 'Hiện điều khiển nâng cao'}
          </button>
          
          {showAdvancedControls && (
            <div className="advanced-panel">
              <button
                onClick={sendTestDataToThingSpeak}
                disabled={loading}
                className="test-button"
              >
                Gửi dữ liệu kiểm thử đến ThingSpeak
              </button>
              
              <div className="system-info">
                <h3>Thông tin hệ thống</h3>
                <ul>
                  <li>Trạng thái camera: <span className="status active">Hoạt động</span></li>
                  <li>Kết nối ESP32: <span className="status active">Hoạt động</span></li>
                  <li>Chế độ: <span className="status">{smartMode ? 'Thông minh' : 'Cố định'}</span></li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;