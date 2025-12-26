import React, { useState } from 'react';
import Gateway from './components/Gateway';
import CorridorScreen from './components/CorridorScreen';
import { PlayCircle, RefreshCw } from 'lucide-react';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gatewayData, setGatewayData] = useState([]);
  const [corridorData, setCorridorData] = useState([]);
  const [resetKey, setResetKey] = useState(0);

  // Initial positions for 6 Gateways (spread around the map)
  const [gatewayPositions, setGatewayPositions] = useState([
    { id: 1, top: '10%', left: '20%' },
    { id: 2, top: '10%', left: '75%' },
    { id: 3, top: '45%', left: '5%' },
    { id: 4, top: '45%', left: '90%' },
    { id: 5, top: '80%', left: '20%' },
    { id: 6, top: '80%', left: '75%' },
  ]);

  // Initial positions for 12 Corridor Screens (spread around the map)
  const [corridorPositions, setCorridorPositions] = useState([
    { id: 1, top: '15%', left: '35%' },
    { id: 2, top: '15%', left: '60%' },
    { id: 3, top: '30%', left: '15%' },
    { id: 4, top: '30%', left: '80%' },
    { id: 5, top: '45%', left: '35%' },
    { id: 6, top: '45%', left: '60%' },
    { id: 7, top: '60%', left: '15%' },
    { id: 8, top: '60%', left: '80%' },
    { id: 9, top: '75%', left: '35%' },
    { id: 10, top: '75%', left: '60%' },
    { id: 11, top: '90%', left: '45%' },
    { id: 12, top: '5%', left: '45%' },
  ]);

  // Mock Backend Logic - Simulates API response
  const mockOptimizeFlow = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = {
          gateways: [
            { id: 1, count: 45, status: 'optimal' },
            { id: 2, count: 120, status: 'crowded' },
            { id: 3, count: 15, status: 'optimal' },
            { id: 4, count: 85, status: 'optimal' },
            { id: 5, count: 150, status: 'crowded' },
            { id: 6, count: 30, status: 'optimal' },
          ],
          corridors: [
            { id: 1, target_gateway_id: 3, direction: 'left' },
            { id: 2, target_gateway_id: 1, direction: 'left' },
            { id: 3, target_gateway_id: 3, direction: 'right' },
            { id: 4, target_gateway_id: 4, direction: 'left' },
            { id: 5, target_gateway_id: 1, direction: 'left' },
            { id: 6, target_gateway_id: 6, direction: 'right' },
            { id: 7, target_gateway_id: 3, direction: 'right' },
            { id: 8, target_gateway_id: 6, direction: 'left' },
            { id: 9, target_gateway_id: 3, direction: 'straight' },
            { id: 10, target_gateway_id: 6, direction: 'straight' },
            { id: 11, target_gateway_id: 3, direction: 'left' },
            { id: 12, target_gateway_id: 1, direction: 'straight' },
          ],
        };
        resolve(mockResponse);
      }, 2000); // Simulate 2 second API delay
    });
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await mockOptimizeFlow();
      setGatewayData(response.gateways);
      setCorridorData(response.corridors);
    } catch (error) {
      console.error('Error analyzing flow:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setGatewayData([]);
    setCorridorData([]);
    setResetKey(prev => prev + 1);
  };

  const updateGatewayPosition = (id, newPosition) => {
    setGatewayPositions(prev => 
      prev.map(g => g.id === id ? { ...g, ...newPosition } : g)
    );
  };

  const updateCorridorPosition = (id, newPosition) => {
    setCorridorPositions(prev => 
      prev.map(c => c.id === id ? { ...c, ...newPosition } : c)
    );
  };

  const getGatewayInfo = (gatewayId) => {
    return gatewayData.find((g) => g.id === gatewayId) || {};
  };

  const getCorridorInfo = (corridorId) => {
    return corridorData.find((c) => c.id === corridorId) || {};
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-green-700 to-green-900 text-white p-4 shadow-lg">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">🇲🇦 Moroccan Cup Crowd Management</h1>
          <p className="text-sm mt-1 opacity-90">Real-time crowd flow optimization system</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-4">
        {/* Control Panel */}
        <div className="mb-4 bg-white rounded-lg shadow-md p-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw size={20} className="animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <PlayCircle size={20} />
                  Analyze & Optimize Flow
                </>
              )}
            </button>
            <button
              onClick={handleReset}
              disabled={isAnalyzing}
              className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw size={20} />
              Reset
            </button>
          </div>
        </div>

        {/* Stadium Map Container */}
        <div className="relative bg-white shadow-xl overflow-hidden w-full" style={{ height: 'calc(100vh - 180px)' }}>
          {/* Background Image - Replace this path with your actual stadium map */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: 'url(/stadium-map.jpg)',
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
            }}
          />

          {/* Gateway Components */}
          {gatewayPositions.map((pos) => {
            const info = getGatewayInfo(pos.id);
            return (
              <Gateway
                key={`gateway-${pos.id}-${resetKey}`}
                id={pos.id}
                position={{ top: pos.top, left: pos.left }}
                count={info.count}
                status={info.status}
                onPositionChange={updateGatewayPosition}
              />
            );
          })}

          {/* Corridor Screen Components */}
          {corridorPositions.map((pos) => {
            const info = getCorridorInfo(pos.id);
            return (
              <CorridorScreen
                key={`corridor-${pos.id}`}
                id={pos.id}
                position={{ top: pos.top, left: pos.left }}
                targetGatewayId={info.target_gateway_id}
                direction={info.direction}
                onPositionChange={updateCorridorPosition}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default App;
