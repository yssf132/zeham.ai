import React, { useState } from 'react';
import { Upload } from 'lucide-react';

const Gateway = ({ id, position, count, status, onPositionChange }) => {
  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
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

  return (
    <div
      className="absolute flex flex-col items-center justify-center rounded-lg transition-all duration-300 cursor-move"
      onMouseDown={handleMouseDown}
      style={{
        top: position.top,
        left: position.left,
        width: '120px',
        height: '120px',
      }}
    >
      {/* Gateway ID */}
      <div className="absolute -top-2 bg-green-600 text-white px-2 py-0.5 rounded-full text-xs font-bold z-10">
        G{id}
      </div>

      {/* Image Preview or Upload */}
      {imagePreview ? (
        <div className="relative w-full h-full group">
          <img
            src={imagePreview}
            alt={`Gateway ${id} crowd`}
            className="w-full h-full object-cover rounded-lg"
          />
          <label className="absolute bottom-1 right-1 bg-green-600 text-white p-1 rounded cursor-pointer hover:bg-green-700 opacity-0 group-hover:opacity-100 transition-opacity">
            <Upload size={12} />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center cursor-pointer w-full h-full opacity-0 hover:opacity-100 transition-opacity">
          <div className="bg-white/90 backdrop-blur-sm rounded border-2 border-green-600 p-2">
            <Upload size={16} className="text-gray-400" />
          </div>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>
      )}

      {/* Count Display */}
      {count !== null && count !== undefined && (
        <div className="absolute -bottom-2 bg-gray-800 text-white px-2 py-0.5 rounded-full text-xs font-semibold z-10">
          {count}
        </div>
      )}
    </div>
  );
};

export default Gateway;
