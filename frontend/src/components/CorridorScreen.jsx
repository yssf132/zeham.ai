import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

const CorridorScreen = ({ id, position, targetGatewayId, direction, onPositionChange }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

  const getDirectionIcon = () => {
    switch (direction?.toLowerCase()) {
      case 'left':
        return <ArrowLeft size={24} className="text-green-500" />;
      case 'right':
        return <ArrowRight size={24} className="text-green-500" />;
      case 'straight':
      case 'up':
        return <ArrowUp size={24} className="text-green-500" />;
      default:
        return null;
    }
  };

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - (parseFloat(position.left) * window.innerWidth / 100),
      y: e.clientY - (parseFloat(position.top) * window.innerHeight / 100),
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const newLeft = ((e.clientX - dragStart.x) / window.innerWidth * 100);
    const newTop = ((e.clientY - dragStart.y) / window.innerHeight * 100);
    
    onPositionChange(id, {
      left: `${Math.max(0, Math.min(95, newLeft))}%`,
      top: `${Math.max(0, Math.min(95, newTop))}%`,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      className="absolute cursor-move"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        top: position.top,
        left: position.left,
        width: '70px',
        height: '50px',
      }}
    >
      {/* Screen ID - Always Visible */}
      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-700 text-white px-2 py-0.5 rounded text-xs font-bold z-20">
        C{id}
      </div>

      {/* Full Box - Only on Hover */}
      {isHovered && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/90 backdrop-blur-sm rounded-lg border-2 border-gray-700 shadow-xl transition-all duration-300">
          {/* Content */}
          {targetGatewayId ? (
            <div className="flex flex-col items-center justify-center">
              {getDirectionIcon()}
              <div className="mt-1 text-white text-xs font-bold">
                G{targetGatewayId}
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-xs text-center px-1">
              Wait
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CorridorScreen;
