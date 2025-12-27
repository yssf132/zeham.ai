import React, { useState } from 'react';
import { Upload, ArrowLeft, ArrowRight, ArrowUp } from 'lucide-react';

const Gateway = ({ id, position, count, status, onPositionChange, externalImage, onImageChange, isFullscreen }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  // Update imagePreview when externalImage changes
  React.useEffect(() => {
    if (externalImage) {
      setImagePreview(externalImage);
    }
  }, [externalImage]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        onImageChange?.(reader.result);
      };
      reader.readAsDataURL(file);
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

  const hasData = count !== null && count !== undefined;

  return (
    <div
      className="absolute flex flex-col items-center gap-2 cursor-move"
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        top: position.top,
        left: position.left,
        transition: isDragging ? 'none' : 'all 0.3s',
        pointerEvents: isDragging ? 'none' : 'auto',
      }}
    >
      {/* Result Box - Gray rectangle with Gateway ID and Direction (After Analysis) */}
      {hasData && (
        <div className="flex items-center justify-between gap-3 bg-gray-600 px-4 py-2 rounded-lg shadow-lg">
          <span className="text-red-500 font-bold text-lg">G{id}</span>
          <div className="text-white">
            {status === 0 ? (
              <ArrowUp size={24} />
            ) : status === -1 ? (
              <ArrowLeft size={24} />
            ) : status === 1 ? (
              <ArrowRight size={24} />
            ) : (
              <ArrowUp size={24} />
            )}
          </div>
        </div>
      )}

      {/* Image Preview - Smaller */}
      {imagePreview && (isFullscreen || isHovered) ? (
        <div className="relative w-24 h-24 group">
          <img
            src={imagePreview}
            alt={`Gateway ${id} crowd`}
            className="w-full h-full object-cover rounded-lg shadow-lg"
          />
          
          {/* People Count on image - After API call */}
          {hasData && (
            <div className="absolute top-1 left-1 bg-black/70 text-white px-2 py-0.5 rounded text-xs font-bold">
              {count}
            </div>
          )}
          
          {/* Green badge - Always visible */}
          <div className="absolute -top-2 -right-2 bg-green-600 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-lg">
            G{id}
          </div>
          
          {/* Upload button on hover */}
          {isHovered && (
            <label className="absolute inset-0 flex items-center justify-center bg-black/50 hover:bg-black/60 rounded-lg cursor-pointer transition-all">
              <Upload size={20} className="text-white" />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      ) : (
        // Upload prompt - Smaller
        <div className="relative w-24 h-24">
          {/* Green badge when no image */}
          <div className="absolute -top-2 -right-2 bg-green-600 text-white w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shadow-lg z-10">
            G{id}
          </div>
          
          {isHovered && (
            <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full bg-white/90 backdrop-blur-sm rounded-lg border-2 border-dashed border-green-600 shadow-lg transition-all">
              <Upload size={20} className="text-green-600 mb-1" />
              <span className="text-[10px] text-gray-600 font-medium">Upload</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
};

export default Gateway;
