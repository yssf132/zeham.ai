import React, { useState } from 'react';
import StadiumMap from './components/StadiumMap';
import { PlayCircle, RefreshCw, Play, Square } from 'lucide-react';

function App() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [gatewayData, setGatewayData] = useState([]);
  const [corridorData, setCorridorData] = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [gatewayImages, setGatewayImages] = useState({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationInterval, setAnimationInterval] = useState(null);

  // Default positions
  const defaultGatewayPositions = [
    { id: 1, top: '10%', left: '20%' },
    { id: 2, top: '10%', left: '75%' },
    { id: 3, top: '45%', left: '5%' },
    { id: 4, top: '45%', left: '90%' },
    { id: 5, top: '80%', left: '20%' },
    { id: 6, top: '80%', left: '75%' },
  ];

  const defaultCorridorPositions = [
    // Gate 1 screens
    { id: 'Lower_Gate_1', top: '15%', left: '25%', assignedGate: 1 },
    { id: 'Upper_Gate_1_1', top: '10%', left: '20%', assignedGate: 1 },
    { id: 'Upper_Gate_1_2', top: '10%', left: '30%', assignedGate: 1 },
    // Gate 2 screens
    { id: 'Lower_Gate_2', top: '15%', left: '70%', assignedGate: 2 },
    { id: 'Upper_Gate_2_1', top: '10%', left: '65%', assignedGate: 2 },
    { id: 'Upper_Gate_2_2', top: '10%', left: '75%', assignedGate: 2 },
    // Gate 3 screens
    { id: 'Lower_Gate_3', top: '45%', left: '10%', assignedGate: 3 },
    { id: 'Upper_Gate_3_1', top: '40%', left: '5%', assignedGate: 3 },
    { id: 'Upper_Gate_3_2', top: '50%', left: '5%', assignedGate: 3 },
    // Gate 4 screens
    { id: 'Lower_Gate_4', top: '45%', left: '85%', assignedGate: 4 },
    { id: 'Upper_Gate_4_1', top: '40%', left: '90%', assignedGate: 4 },
    { id: 'Upper_Gate_4_2', top: '50%', left: '90%', assignedGate: 4 },
    // Gate 5 screens
    { id: 'Lower_Gate_5', top: '75%', left: '25%', assignedGate: 5 },
    { id: 'Upper_Gate_5_1', top: '80%', left: '20%', assignedGate: 5 },
    { id: 'Upper_Gate_5_2', top: '80%', left: '30%', assignedGate: 5 },
    // Gate 6 screens
    { id: 'Lower_Gate_6', top: '75%', left: '70%', assignedGate: 6 },
    { id: 'Upper_Gate_6_1', top: '80%', left: '65%', assignedGate: 6 },
    { id: 'Upper_Gate_6_2', top: '80%', left: '75%', assignedGate: 6 },
  ];

  // Load positions from localStorage or use defaults
  const [gatewayPositions, setGatewayPositions] = useState(() => {
    const saved = localStorage.getItem('gatewayPositions');
    return saved ? JSON.parse(saved) : defaultGatewayPositions;
  });

  const [gatewayPositionsFullscreen, setGatewayPositionsFullscreen] = useState(() => {
    const saved = localStorage.getItem('gatewayPositionsFullscreen');
    return saved ? JSON.parse(saved) : defaultGatewayPositions;
  });

  const [corridorPositions, setCorridorPositions] = useState(() => {
    const saved = localStorage.getItem('corridorPositions');
    return saved ? JSON.parse(saved) : defaultCorridorPositions;
  });

  const [corridorPositionsFullscreen, setCorridorPositionsFullscreen] = useState(() => {
    const saved = localStorage.getItem('corridorPositionsFullscreen');
    return saved ? JSON.parse(saved) : defaultCorridorPositions;
  });

  // Save positions to localStorage whenever they change
  React.useEffect(() => {
    localStorage.setItem('gatewayPositions', JSON.stringify(gatewayPositions));
  }, [gatewayPositions]);

  React.useEffect(() => {
    localStorage.setItem('gatewayPositionsFullscreen', JSON.stringify(gatewayPositionsFullscreen));
  }, [gatewayPositionsFullscreen]);

  React.useEffect(() => {
    localStorage.setItem('corridorPositions', JSON.stringify(corridorPositions));
  }, [corridorPositions]);

  React.useEffect(() => {
    localStorage.setItem('corridorPositionsFullscreen', JSON.stringify(corridorPositionsFullscreen));
  }, [corridorPositionsFullscreen]);

  // API call to backend
  const fetchLiveData = async () => {
    try {
      const response = await fetch('http://localhost:8000/live-data');
      if (!response.ok) {
        throw new Error('Failed to fetch live data');
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching live data:', error);
      throw error;
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    
    try {
      const response = await fetchLiveData();
      
      // Transform API response to match our component structure
      const gatewayMap = {};
      response.screens.forEach(screen => {
        if (!gatewayMap[screen.assigned_gate]) {
          gatewayMap[screen.assigned_gate] = {
            id: screen.assigned_gate,
            count: screen.people_count,
            status: calculateDirection(screen.assigned_gate, screen.recommended_gate),
          };
        }
      });
      
      const gateways = Object.values(gatewayMap);
      const corridors = response.screens.map(screen => ({
        id: screen.screen_id,
        target_gateway_id: screen.recommended_gate,
        assigned_gate: screen.assigned_gate,
        direction: calculateDirection(screen.assigned_gate, screen.recommended_gate),
        people_count: screen.people_count,
      }));
      
      setGatewayData(gateways);
      setCorridorData(corridors);
    } catch (error) {
      console.error('Error analyzing flow:', error);
      alert('Failed to connect to backend. Make sure the backend is running on http://localhost:8000');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const calculateDirection = (assignedGate, recommendedGate) => {
    if (assignedGate === recommendedGate) return 0; // straight/up
    if (recommendedGate < assignedGate) return -1; // left
    return 1; // right
  };

  const handleReset = () => {
    setGatewayData([]);
    setCorridorData([]);
    setGatewayImages({});
    setResetKey(prev => prev + 1);
  };

  const loadPresetImages = () => {
    const images = {};
    for (let i = 1; i <= 6; i++) {
      images[i] = `/gate_${i}.jpg`;
    }
    setGatewayImages(images);
  };

  // Shuffle array helper function
  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle images among gateways
  const shuffleGatewayImages = () => {
    const imageValues = Object.values(gatewayImages);
    if (imageValues.length === 0) return;
    
    const shuffledImages = shuffleArray(imageValues);
    const newImages = {};
    for (let i = 1; i <= 6; i++) {
      newImages[i] = shuffledImages[i - 1];
    }
    setGatewayImages(newImages);
  };

  // Start animation
  const startAnimation = async () => {
    // Make sure we have images loaded
    if (Object.keys(gatewayImages).length === 0) {
      loadPresetImages();
      // Wait a bit for images to load
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    setIsAnimating(true);
    
    // Run first iteration immediately
    await handleAnalyze();
    
    // Set up interval for subsequent iterations (every 4 seconds)
    const interval = setInterval(async () => {
      shuffleGatewayImages();
      // Wait a bit for images to update
      await new Promise(resolve => setTimeout(resolve, 300));
      await handleAnalyze();
    }, 4000);
    
    setAnimationInterval(interval);
  };

  // Stop animation
  const stopAnimation = () => {
    if (animationInterval) {
      clearInterval(animationInterval);
      setAnimationInterval(null);
    }
    setIsAnimating(false);
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (animationInterval) {
        clearInterval(animationInterval);
      }
    };
  }, [animationInterval]);

  const handleFullscreenChange = (fullscreen) => {
    setIsFullscreen(fullscreen);
  };

  const updateGatewayPosition = (id, newPosition) => {
    if (isFullscreen) {
      setGatewayPositionsFullscreen(prev => 
        prev.map(g => g.id === id ? { ...g, ...newPosition } : g)
      );
    } else {
      setGatewayPositions(prev => 
        prev.map(g => g.id === id ? { ...g, ...newPosition } : g)
      );
    }
  };

  const updateCorridorPosition = (id, newPosition) => {
    if (isFullscreen) {
      setCorridorPositionsFullscreen(prev => 
        prev.map(c => c.id === id ? { ...c, ...newPosition } : c)
      );
    } else {
      setCorridorPositions(prev => 
        prev.map(c => c.id === id ? { ...c, ...newPosition } : c)
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      {!isFullscreen && (
        <header className="bg-white text-gray-800 p-6 shadow-md">
          <div className="px-4 flex items-center gap-6">
            {/* Logo */}
            <img 
              src="/logo.png" 
              alt="Sentinel Hub Logo" 
              className="h-16 w-16 object-contain"
            />
            
            {/* Text Content */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Sentinel Hub</h1>
              <p className="text-base text-gray-700 mb-1">
                Fluidifier les flux, améliorer le confort : bienvenue dans le Smart Stadium.
              </p>
              <p className="text-base text-gray-700">
                كلشي تحت السيطرة، والفانز كيمشيو بلا مشاكل.
              </p>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <div>
        {/* Control Panel */}
        {!isFullscreen && (
          <div className="bg-white shadow-md p-4 px-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || isAnimating}
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
                onClick={loadPresetImages}
                disabled={isAnimating}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                📷 Load Test Images
              </button>
              {!isAnimating ? (
                <button
                  onClick={startAnimation}
                  disabled={isAnalyzing}
                  className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Play size={20} />
                  Start Animation
                </button>
              ) : (
                <button
                  onClick={stopAnimation}
                  className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors animate-pulse"
                >
                  <Square size={20} />
                  Stop Animation
                </button>
              )}
              <button
                onClick={handleReset}
                disabled={isAnalyzing || isAnimating}
                className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <RefreshCw size={20} />
                Reset
              </button>
            </div>
          </div>
        )}

        {/* Stadium Map Component */}
        <StadiumMap
          gatewayPositions={isFullscreen ? gatewayPositionsFullscreen : gatewayPositions}
          corridorPositions={isFullscreen ? corridorPositionsFullscreen : corridorPositions}
          gatewayData={gatewayData}
          corridorData={corridorData}
          resetKey={resetKey}
          updateGatewayPosition={updateGatewayPosition}
          updateCorridorPosition={updateCorridorPosition}
          isFullscreen={isFullscreen}
          onToggleFullscreen={handleFullscreenChange}
          gatewayImages={gatewayImages}
          onGatewayImageChange={(id, image) => setGatewayImages(prev => ({ ...prev, [id]: image }))}
        />
      </div>
    </div>
  );
}

export default App;
