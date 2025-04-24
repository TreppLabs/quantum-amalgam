'use client';

interface DirectionalControlsProps {
  onDirectionClick: (direction: string) => void;
}

const DirectionalControls: React.FC<DirectionalControlsProps> = ({ onDirectionClick }) => {
  const handleTouchStart = (e: React.TouchEvent, direction: string) => {
    e.preventDefault(); // Prevent any default touch behavior
    onDirectionClick(direction);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <div className="grid grid-cols-3 gap-1">
        {/* Up button */}
        <div className="col-start-2 row-start-1">
          <button
            onClick={() => onDirectionClick('up')}
            onTouchStart={(e) => handleTouchStart(e, 'up')}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg flex items-center justify-center text-white text-xl touch-manipulation"
            aria-label="Move Up"
          >
            ↑
          </button>
        </div>
        
        {/* Left button */}
        <div className="col-start-1 row-start-2">
          <button
            onClick={() => onDirectionClick('left')}
            onTouchStart={(e) => handleTouchStart(e, 'left')}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg flex items-center justify-center text-white text-xl touch-manipulation"
            aria-label="Move Left"
          >
            ←
          </button>
        </div>
        
        {/* Right button */}
        <div className="col-start-3 row-start-2">
          <button
            onClick={() => onDirectionClick('right')}
            onTouchStart={(e) => handleTouchStart(e, 'right')}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg flex items-center justify-center text-white text-xl touch-manipulation"
            aria-label="Move Right"
          >
            →
          </button>
        </div>
        
        {/* Down button */}
        <div className="col-start-2 row-start-3">
          <button
            onClick={() => onDirectionClick('down')}
            onTouchStart={(e) => handleTouchStart(e, 'down')}
            className="w-12 h-12 bg-gray-800 hover:bg-gray-700 active:bg-gray-600 rounded-lg flex items-center justify-center text-white text-xl touch-manipulation"
            aria-label="Move Down"
          >
            ↓
          </button>
        </div>
      </div>
    </div>
  );
};

export default DirectionalControls; 