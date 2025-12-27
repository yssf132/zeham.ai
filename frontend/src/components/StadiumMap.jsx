import React, { useRef } from 'react';
import Gateway from './Gateway';
import CorridorScreen from './CorridorScreen';

const StadiumMap = ({ 
  gatewayPositions, 
  corridorPositions, 
  gatewayData, 
  corridorData,
  resetKey,
  updateGatewayPosition,
  updateCorridorPosition,
  isFullscreen,
  onToggleFullscreen,
  gatewayImages,
  onGatewayImageChange
}) => {
  const mapContainerRef = useRef(null);

  const getGatewayInfo = (gatewayId) => {
    return gatewayData.find((g) => g.id === gatewayId) || {};
  };

  const getCorridorInfo = (corridorId) => {
    return corridorData.find((c) => c.id === corridorId) || {};
  };

  const handleFullscreen = () => {
    if (!document.fullscreenElement) {
      mapContainerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      onToggleFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [onToggleFullscreen]);

  return (
    <div 
      ref={mapContainerRef}
      className="relative w-full bg-white" 
      style={{ height: isFullscreen ? '100vh' : 'calc(100vh - 160px)' }}
    >
      {/* Background Image */}
      <img
        src="/stadium-map.jpg"
        alt="Stadium Map"
        className="w-full h-full object-contain"
      />
      
      {/* Fullscreen Button - only visible when NOT in fullscreen */}
      {!isFullscreen && (
        <button
          onClick={handleFullscreen}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white text-gray-700 font-semibold px-4 py-2 rounded-lg shadow-lg z-50 flex items-center gap-2 transition-all"
          title="Enter Fullscreen"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
          </svg>
          Fullscreen
        </button>
      )}
      
      {/* Overlay container for components */}
      <div className="absolute inset-0">
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
              recommendedGate={info.recommendedGate}
              onPositionChange={updateGatewayPosition}
              externalImage={gatewayImages[pos.id]}
              onImageChange={(image) => onGatewayImageChange(pos.id, image)}
              isFullscreen={isFullscreen}
            />
          );
        })}

        {/* Corridor Screen Components */}
        {corridorPositions.map((pos) => {
          const info = getCorridorInfo(pos.id);
          return (
            <CorridorScreen
              key={pos.id}
              id={pos.id}
              position={{ top: pos.top, left: pos.left }}
              targetGatewayId={info.target_gateway_id}
              direction={info.direction}
              onPositionChange={updateCorridorPosition}
            />
          );
        })}

        {/* Fullscreen Exit Button - only visible in fullscreen */}
        {isFullscreen && (
          <button
            onClick={handleFullscreen}
            className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg shadow-lg z-50"
          >
            ✕ Exit Fullscreen
          </button>
        )}
      </div>
    </div>
  );
};

export default StadiumMap;
