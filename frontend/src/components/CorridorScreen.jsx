import React from 'react';
import { ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

const CorridorScreen = ({ id, position, targetGatewayId, direction, onPositionChange }) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [dragStart, setDragStart] = React.useState({ x: 0, y: 0 });

  const getDirectionIcon = () => {
    if (direction === 0) {
      return <ArrowUp size={24} className="text-white" />;
    } else if (direction === -1) {
      return <ArrowLeft size={24} className="text-white" />;
    } else if (direction === 1) {
      return <ArrowRight size={24} className="text-white" />;
    }
    return <ArrowUp size={24} className="text-white" />;
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

  const hasData = targetGatewayId !== null && targetGatewayId !== undefined;

  // Extract portal number from ID (e.g., "Upper_Gate_1_1" -> "P11")
  const getPortalNumber = () => {
    const match = id.match(/Gate_(\d+)/);
    const gateNum = match ? match[1] : '?';
    const isUpper = id.includes('Upper');
    const suffix = id.match(/_(\d)$/);
    if (isUpper && suffix) {
      return `P${gateNum}${suffix[1]}`;
    }
    // Don't display Lower gates
    return null;
  };

  // Don't render if it's a Lower gate
  if (!id.includes('Upper')) {
    return null;
  }

  return (
    <div
      className="absolute flex flex-col items-center gap-2 cursor-move"
      onMouseDown={handleMouseDown}
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      {/* Result Box - Gray rectangle with Gateway ID and Direction (After Analysis) */}
      {hasData && (
        <div className="flex items-center justify-between gap-3 bg-blue-600/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-lg">
          <span className="text-red-500 font-bold text-lg">G{targetGatewayId}</span>
          <div className="text-white">
            {getDirectionIcon()}
          </div>
        </div>
      )}

      {/* Portal ID - Always Visible (small blue badge) */}
      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold shadow-md">
        {getPortalNumber()}
      </div>
    </div>
  );
};

export default CorridorScreen;
