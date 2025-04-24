'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';
import DirectionalControls from './DirectionalControls';

declare global {
  interface Window {
    startX?: number;
    startY?: number;
  }
}

interface Resource {
  name: string;
  color: string;
  iconClasses: string;
  tier: number; // 1=basic, 2=material, 3=compound, 4=super
}

// Resource definitions
const BASIC_RESOURCES: Resource[] = [
  {
    name: 'Crystalite',
    color: 'bg-purple-400',
    iconClasses: 'w-3 h-3 rotate-45 transform',
    tier: 1
  },
  {
    name: 'Nebulite',
    color: 'bg-blue-400',
    iconClasses: 'w-3 h-3 rounded-full',
    tier: 1
  },
  {
    name: 'Solarium',
    color: 'bg-yellow-400',
    iconClasses: 'w-3 h-3 rounded-full',
    tier: 1
  },
  {
    name: 'Verdanium',
    color: 'bg-emerald-400',
    iconClasses: 'w-3 h-3 rotate-45 transform',
    tier: 1
  },
  {
    name: 'Pyroxite',
    color: 'bg-orange-500',
    iconClasses: 'w-3 h-3 skew-y-3 transform',
    tier: 1
  },
  {
    name: 'Lunarium',
    color: 'bg-white border-2 border-yellow-200',
    iconClasses: 'w-3 h-3 rounded-l-full',
    tier: 1
  },
  {
    name: 'Aquarite',
    color: 'bg-cyan-400',
    iconClasses: 'w-3 h-2 rounded-full',
    tier: 1
  },
  {
    name: 'Terrastone',
    color: 'bg-amber-700',
    iconClasses: 'w-3 h-3 rounded-md',
    tier: 1
  }
];

const MATERIALS: Resource[] = [
  {
    name: 'Celestial Alloy',
    color: 'bg-purple-600',
    iconClasses: 'w-4 h-4 rotate-45 transform star-shape',
    tier: 2
  },
  {
    name: 'Solar Steel',
    color: 'bg-amber-500',
    iconClasses: 'w-4 h-4 rotate-30 transform hexagon',
    tier: 2
  },
  {
    name: 'Magma Core',
    color: 'bg-red-600',
    iconClasses: 'w-4 h-4 rotate-45 transform flame-shape',
    tier: 2
  },
  {
    name: 'Ocean Stone',
    color: 'bg-blue-600',
    iconClasses: 'w-4 h-4 wave-shape',
    tier: 2
  }
];

const COMPOUNDS: Resource[] = [
  {
    name: 'Astral Matrix',
    color: 'bg-indigo-500',
    iconClasses: 'w-5 h-5 geometric-shape',
    tier: 3
  },
  {
    name: 'Terra Nova',
    color: 'bg-amber-600',
    iconClasses: 'w-5 h-5 crystal-shape',
    tier: 3
  }
];

const SUPER_ALLOY: Resource = {
  name: 'Quantum Amalgam',
  color: 'bg-gradient-to-r from-purple-500 via-pink-500 to-red-500',
  iconClasses: 'w-6 h-6 mandala-shape',
  tier: 4
};

// Add type for combinations
type CombinationKey = 'Crystalite+Nebulite' | 'Solarium+Verdanium' | 'Pyroxite+Lunarium' | 'Aquarite+Terrastone' | 
                      'Celestial Alloy+Solar Steel' | 'Magma Core+Ocean Stone' | 'Astral Matrix+Terra Nova';

// Update COMBINATIONS with type
const COMBINATIONS: Record<CombinationKey, string> = {
  'Crystalite+Nebulite': 'Celestial Alloy',
  'Solarium+Verdanium': 'Solar Steel',
  'Pyroxite+Lunarium': 'Magma Core',
  'Aquarite+Terrastone': 'Ocean Stone',
  'Celestial Alloy+Solar Steel': 'Astral Matrix',
  'Magma Core+Ocean Stone': 'Terra Nova',
  'Astral Matrix+Terra Nova': 'Quantum Amalgam'
};


interface Cell {
  id: string;
  owned: boolean;
  owner: string | null;
  resource: Resource | null;
  miningProgress: number;
}

const GRID_SIZE = 20;
const RESOURCE_CHANCE = 0.12;
const MAX_MINING = 10;

function createInitialGrid(includeResources: boolean): Cell[][] {
  const initialGrid: Cell[][] = [];
  const centerPoint = Math.floor(GRID_SIZE / 2);
  
  for (let i = 0; i < GRID_SIZE; i++) {
    const row: Cell[] = [];
    for (let j = 0; j < GRID_SIZE; j++) {
      const hasResource = includeResources && Math.random() < RESOURCE_CHANCE;
      row.push({
        id: `${i}-${j}`,
        owned: i === centerPoint && j === centerPoint,
        owner: i === centerPoint && j === centerPoint ? 'player' : null,
        resource: hasResource ? BASIC_RESOURCES[Math.floor(Math.random() * BASIC_RESOURCES.length)] : null,
        miningProgress: 0,
      });
    }
    initialGrid.push(row);
  }
  return initialGrid;
}

function combineResources(resources: Record<string, number>): Record<string, number> {
  const newResources = { ...resources };

  // Try super alloy combination first (Tier 4)
  const superInput = 'Astral Matrix+Terra Nova' as CombinationKey;
  const superOutput = COMBINATIONS[superInput];
  while (newResources['Astral Matrix'] > 0 && newResources['Terra Nova'] > 0) {
    newResources['Astral Matrix']--;
    newResources['Terra Nova']--;
    newResources[superOutput] = (newResources[superOutput] || 0) + 1;
  }

  // Try compound combinations next (Tier 3)
  const compoundCombos: CombinationKey[] = ['Celestial Alloy+Solar Steel', 'Magma Core+Ocean Stone'];
  for (const combo of compoundCombos) {
    const [input1, input2] = combo.split('+');
    while (newResources[input1] > 0 && newResources[input2] > 0) {
      newResources[input1]--;
      newResources[input2]--;
      newResources[COMBINATIONS[combo]] = (newResources[COMBINATIONS[combo]] || 0) + 1;
    }
  }

  // Try basic combinations last (Tier 2)
  const basicCombos: CombinationKey[] = ['Crystalite+Nebulite', 'Solarium+Verdanium', 'Pyroxite+Lunarium', 'Aquarite+Terrastone'];
  for (const combo of basicCombos) {
    const [input1, input2] = combo.split('+');
    while (newResources[input1] > 0 && newResources[input2] > 0) {
      newResources[input1]--;
      newResources[input2]--;
      newResources[COMBINATIONS[combo]] = (newResources[COMBINATIONS[combo]] || 0) + 1;
    }
  }

  return newResources;
}

// Add these helper functions at the top of the component
interface Position {
  x: number;
  y: number;
}

interface TierLayout {
  icon: Position;
  name: Position;
  quantity: Position;
  connectorStart: Position;
  connectorEnd: Position;
}

const calculateTierLayout = (tier: number, index: number, totalInTier: number, containerWidth: number, containerHeight: number): TierLayout => {
  const columnWidth = containerWidth / totalInTier;
  const x = (index * columnWidth) + (columnWidth / 2);
  
  // Adjust vertical spacing to be more compact
  const tierHeights = [0.2, 0.25, 0.25, 0.2];
  const tierStarts = [0];
  for (let i = 1; i < tierHeights.length; i++) {
    tierStarts[i] = tierStarts[i-1] + tierHeights[i-1];
  }
  
  const baseY = tierStarts[tier] * containerHeight;
  const tierHeight = tierHeights[tier] * containerHeight;
  const nameHeight = tierHeight * 0.2;
  const iconHeight = tierHeight * 0.25;
  
  return {
    name: { x, y: baseY + (tierHeight * 0.1) },
    icon: { x, y: baseY + nameHeight },
    quantity: { x, y: baseY + nameHeight + iconHeight },
    connectorStart: { x, y: baseY + nameHeight + iconHeight + (tierHeight * 0.1) },
    connectorEnd: { x, y: baseY + nameHeight - 10 }  // Connect to just above the icon of the output
  };
};

const getResourcePosition = (resource: Resource, containerWidth: number, containerHeight: number): TierLayout => {
  switch (resource.tier) {
    case 1:
      return calculateTierLayout(0, BASIC_RESOURCES.findIndex(r => r.name === resource.name), 8, containerWidth, containerHeight);
    case 2:
      return calculateTierLayout(1, MATERIALS.findIndex(r => r.name === resource.name), 4, containerWidth, containerHeight);
    case 3:
      return calculateTierLayout(2, COMPOUNDS.findIndex(r => r.name === resource.name), 2, containerWidth, containerHeight);
    case 4:
      return calculateTierLayout(3, 0, 1, containerWidth, containerHeight);
    default:
      throw new Error(`Invalid tier: ${resource.tier}`);
  }
};

const createYConnector = (input1: TierLayout, input2: TierLayout, output: TierLayout): string => {
  // Adjustment constants (tweak as desired)
  const topAdjustment = 5;      // lower the top point (add to input start y)
  const bendAdjustment = -5;    // raise the bend point (subtract from control y)
  const outputAdjustment = -5;  // raise the output junction (subtract from output y)

  const startY1 = input1.connectorStart.y + topAdjustment;
  const startY2 = input2.connectorStart.y + topAdjustment;
  const adjustedOutputY = output.connectorEnd.y + outputAdjustment;
  const midY = (startY1 + adjustedOutputY) / 2;
  const verticalFactor = 0.3;
  let controlY = midY + (adjustedOutputY - midY) * verticalFactor;
  controlY += bendAdjustment;
  return `M ${input1.connectorStart.x} ${startY1} 
          L ${input1.connectorStart.x} ${controlY} 
          L ${output.connectorEnd.x} ${adjustedOutputY} 
          M ${input2.connectorStart.x} ${startY2} 
          L ${input2.connectorStart.x} ${controlY} 
          L ${output.connectorEnd.x} ${adjustedOutputY}`;
};

const GameGrid: React.FC = () => {
  const [grid, setGrid] = useState<Cell[][]>(() => createInitialGrid(false));
  const [turnCount, setTurnCount] = useState(0);
  const [resources, setResources] = useState<Record<string, number>>({});
  const [showInstructions, setShowInstructions] = useState(false); // Popup closed initially
  const [isMobile, setIsMobile] = useState(false); // Detect mobile devices
  const [gridSize, setGridSize] = useState(0);
  const [lastMoveTime, setLastMoveTime] = useState(0);
  const MOVE_COOLDOWN = 300; // 300ms cooldown between moves

  useEffect(() => {
    // Detect if the user is on a mobile device
    setIsMobile(window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    const updateGridSize = () => {
      const offset = isMobile ? 40 : 80; // Increased mobile offset
      if (isMobile) {
        // For mobile, use the smaller dimension (width or height) minus offset
        const minDimension = Math.min(window.innerWidth, window.innerHeight);
        setGridSize(minDimension - offset);
      } else {
        const containerWidth = window.innerWidth * 0.65;
        setGridSize(Math.min(containerWidth - offset, window.innerHeight - offset));
      }
    };
    updateGridSize();
    window.addEventListener('resize', updateGridSize);
    return () => window.removeEventListener('resize', updateGridSize);
  }, [isMobile]);

  const handleSwipe = (direction: string) => {
    const now = Date.now();
    if (now - lastMoveTime < MOVE_COOLDOWN) {
      return; // Ignore moves that are too close together
    }
    setLastMoveTime(now);

    // Use functional update so we always work with the latest grid.
    setGrid(prevGrid => {
      const newGrid = prevGrid.map(row => [...row]);
      let changed = false;

      for (let row = 0; row < GRID_SIZE; row++) {
        for (let col = 0; col < GRID_SIZE; col++) {
          if (prevGrid[row][col].owned) {
            switch (direction) {
              case 'up':
                if (row > 0 && !prevGrid[row - 1][col].owned) {
                  newGrid[row - 1][col] = { ...newGrid[row - 1][col], owned: true, owner: 'player' };
                  changed = true;
                }
                break;
              case 'down':
                if (row < GRID_SIZE - 1 && !prevGrid[row + 1][col].owned) {
                  newGrid[row + 1][col] = { ...newGrid[row + 1][col], owned: true, owner: 'player' };
                  changed = true;
                }
                break;
              case 'left':
                if (col > 0 && !prevGrid[row][col - 1].owned) {
                  newGrid[row][col - 1] = { ...newGrid[row][col - 1], owned: true, owner: 'player' };
                  changed = true;
                }
                break;
              case 'right':
                if (col < GRID_SIZE - 1 && !prevGrid[row][col + 1].owned) {
                  newGrid[row][col + 1] = { ...newGrid[row][col + 1], owned: true, owner: 'player' };
                  changed = true;
                }
                break;
            }
          }
        }
      }

      if (changed) {
        // Use functional update for resources as well.
        setResources(prevResources => {
          const combinedResources = combineResources(prevResources);
          const { newGrid: minedGrid, newResources: finalResources } = mineResources(newGrid, combinedResources);
          // Update grid and turn counter with the new state.
          setGrid(minedGrid);
          setTurnCount(prev => prev + 1);
          return finalResources;
        });
      }
      return prevGrid;
    });
  };

  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    window.startX = touch.clientX;
    window.startY = touch.clientY;
  }, []);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - (window.startX ?? 0);
    const deltaY = touch.clientY - (window.startY ?? 0);

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      // Horizontal swipe
      if (deltaX > 0) handleSwipe('right');
      else handleSwipe('left');
    } else {
      // Vertical swipe
      if (deltaY > 0) handleSwipe('down');
      else handleSwipe('up');
    }
  }, [handleSwipe]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (isMobile) return; // Ignore keyboard events on mobile
    
    let direction = '';
    switch (event.key) {
      case 'ArrowUp':
        direction = 'up';
        break;
      case 'ArrowDown':
        direction = 'down';
        break;
      case 'ArrowLeft':
        direction = 'left';
        break;
      case 'ArrowRight':
        direction = 'right';
        break;
      default:
        return;
    }
    handleSwipe(direction);
  }, [isMobile]);

  useEffect(() => {
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleTouchStart, handleTouchEnd, handleKeyPress]);

  useEffect(() => {
    setGrid(createInitialGrid(true));
  }, []);

  const territoryCount = grid.reduce((total, row) => 
    total + row.reduce((rowTotal, cell) => rowTotal + (cell.owned ? 1 : 0), 0), 0
  );

  const mineResources = useCallback((currentGrid: Cell[][], currentResources: Record<string, number>) => {
    const newGrid = currentGrid.map(row => [...row]);
    const newResources = { ...currentResources };

    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        const cell = currentGrid[row][col];
        if (cell.owned && cell.resource && cell.miningProgress < MAX_MINING) {
          newResources[cell.resource.name] = (newResources[cell.resource.name] || 0) + 1;
          newGrid[row][col] = {
            ...cell,
            miningProgress: cell.miningProgress + 1,
          };
        }
      }
    }
    return { newGrid, newResources };
  }, []);

  return (
    <div className={`flex ${isMobile ? 'flex-col' : 'h-screen'} w-full relative`}>
      {/* How to Play Popup */}
      {showInstructions && (
        <div
          className="absolute bg-white p-2 rounded shadow-lg text-xs text-gray-600 leading-relaxed w-80 z-50 border border-gray-300"
          style={{
            top: isMobile ? '20%' : '10%',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          {isMobile ? (
            <>
              Swipe or tap the directional buttons to expand your territory. Mine resources by owning cells containing them,
              then combine basic resources to create advanced materials.
              <br /><br />
              Ultimate Goal: Create the legendary Quantum Amalgam by discovering and combining rare resources across your empire!
            </>
          ) : (
            <>
              Use the arrow keys to expand your territory and claim new cells. Mine resources by owning cells containing them,
              then combine basic resources to create advanced materials.
              <br /><br />
              Ultimate Goal: Create the legendary Quantum Amalgam by discovering and combining rare resources across your empire!
            </>
          )}
        </div>
      )}

      {/* Mobile Layout */}
      {isMobile ? (
        <div className="flex flex-col h-screen">
          {/* Grid Section - Top */}
          <div
            className="flex items-center justify-center mx-auto"
            style={{
              padding: '10px',
              width: gridSize + "px",
              height: gridSize + "px",
            }}
          >
            <div
              className="gap-0.5 mx-auto"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                width: '100%',
                height: '100%',
              }}
            >
              {grid.map((row) =>
                row.map((cell) => (
                  <div
                    key={cell.id}
                    className={`
                      border border-gray-300 flex items-center justify-center relative
                      ${cell.owned 
                        ? 'bg-green-500 border-green-700' 
                        : 'bg-gray-200 border-gray-400'
                      }
                    `}
                  >
                    {cell.owned && (
                      <div className="w-4 h-4 bg-white rounded-full absolute" />
                    )}
                    {cell.resource && (
                      <div className={`
                        ${cell.resource.iconClasses}
                        ${cell.miningProgress >= MAX_MINING ? 'bg-gray-400' : cell.resource.color}
                        ${cell.owned ? 'mix-blend-multiply' : ''}
                        absolute
                        ${cell.miningProgress >= MAX_MINING ? 'opacity-50' : ''}
                      `} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info and Controls Section - Middle */}
          <div className="flex flex-row p-2 space-x-2">
            {/* Game Info - Left 2/3 */}
            <div className="flex-1 bg-white rounded-lg p-3 shadow-md">
              <div className="relative mb-3">
                <div
                  className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  How to Play
                </div>
              </div>
              <div className="text-lg font-semibold mb-3 text-gray-800">Game Information</div>
              <div className="space-y-4">
                <div className="text-sm text-gray-700">Turn: {turnCount}</div>
                <div className="text-sm text-gray-700">Territory: {territoryCount} cells</div>
                <div className="flex items-center space-x-1">
                  <Image
                    src="/ingot.svg"
                    alt="Quantum Amalgam"
                    width={24}
                    height={24}
                    unoptimized
                    className="w-6 h-6"
                  />
                  <span className="text-sm text-gray-700">
                    Quantum Amalgam: {resources["Quantum Amalgam"] || 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Directional Controls - Right 1/3 */}
            <div className="w-1/3 bg-white rounded-lg p-3 shadow-md flex items-center justify-center">
              <DirectionalControls onDirectionClick={handleSwipe} />
            </div>
          </div>

          {/* Manufacturing Section - Bottom */}
          <div className="flex-1 bg-white rounded-lg p-3 shadow-md m-2">
            <div className="text-lg font-semibold mb-2 text-gray-800">Resource Manufacturing</div>
            <div className="relative w-full h-[calc(100%-2rem)]">
              {/* SVG Connections Layer */}
              <svg
                className="absolute top-0 left-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${400} ${500}`} // Use a fixed viewBox for scaling
                preserveAspectRatio="none" // Allow the aspect ratio to stretch
              >
                {/* Tier 1 to Tier 2 connections */}
                {[
                  [BASIC_RESOURCES[0], BASIC_RESOURCES[1], MATERIALS[0]],
                  [BASIC_RESOURCES[2], BASIC_RESOURCES[3], MATERIALS[1]],
                  [BASIC_RESOURCES[4], BASIC_RESOURCES[5], MATERIALS[2]],
                  [BASIC_RESOURCES[6], BASIC_RESOURCES[7], MATERIALS[3]]
                ].map(([input1, input2, output], index) => (
                  <path
                    key={`t1-${index}`}
                    d={createYConnector(
                      getResourcePosition(input1, 400, 500),
                      getResourcePosition(input2, 400, 500),
                      getResourcePosition(output, 400, 500)
                    )}
                    className="stroke-gray-400 fill-none"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Tier 2 to Tier 3 connections */}
                {[
                  [MATERIALS[0], MATERIALS[1], COMPOUNDS[0]],
                  [MATERIALS[2], MATERIALS[3], COMPOUNDS[1]]
                ].map(([input1, input2, output], index) => (
                  <path
                    key={`t2-${index}`}
                    d={createYConnector(
                      getResourcePosition(input1, 400, 500),
                      getResourcePosition(input2, 400, 500),
                      getResourcePosition(output, 400, 500)
                    )}
                    className="stroke-gray-400 fill-none"
                    strokeWidth="1.5"
                  />
                ))}

                {/* Tier 3 to Tier 4 connection */}
                <path
                  d={createYConnector(
                    getResourcePosition(COMPOUNDS[0], 400, 500),
                    getResourcePosition(COMPOUNDS[1], 400, 500),
                    getResourcePosition(SUPER_ALLOY, 400, 500)
                  )}
                  className="stroke-gray-400 fill-none"
                  strokeWidth="1.5"
                />
              </svg>

              {/* Resource Icons Layer */}
              {[...BASIC_RESOURCES, ...MATERIALS, ...COMPOUNDS, SUPER_ALLOY].map((resource) => {
                const pos = getResourcePosition(resource, 400, 500);
                return (
                  <div
                    key={resource.name}
                    className="absolute transform -translate-x-1/2"
                    style={{
                      left: `${(pos.icon.x / 400) * 100}%`, // Scale position based on container width
                      top: `${(pos.icon.y / 500) * 100}%` // Scale position based on container height
                    }}
                  >
                    <div
                      className="text-[0.6rem] text-gray-600 text-center whitespace-nowrap absolute transform -translate-x-1/2"
                      style={{
                        left: '50%',
                        top: '-16px'
                      }}
                    >
                      {resource.name}
                    </div>
                    {resource.name === "Quantum Amalgam" ? (
                      <Image
                        src="/ingot.svg"
                        alt="Quantum Amalgam"
                        width={32}
                        height={32}
                        className="w-8 h-8"
                      />
                    ) : (
                      <div
                        className={`${resource.color} ${resource.iconClasses}`}
                        style={{
                          transform: `scale(${400 / 400}, ${500 / 500})`, // Scale icons proportionally
                        }}
                      />
                    )}
                    <div
                      className="text-xs text-gray-800 font-medium text-center absolute transform -translate-x-1/2"
                      style={{
                        width: '24px',
                        left: '50%',
                        top: '24px'
                      }}
                    >
                      {resources[resource.name] || 0}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        // Desktop Layout
        <div className="flex h-screen w-full">
          {/* Game Grid - Left panel */}
          <div className="flex-1 h-full flex items-center justify-center p-4"
               style={{ backgroundImage: 'url("/moonscape.jpg")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div
              className="gap-0.5"
              style={{
                width: `${gridSize}px`,
                height: `${gridSize}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
                gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`,
                justifyContent: 'center',
                alignContent: 'center',
              }}
            >
              {grid.map((row) =>
                row.map((cell) => (
                  <div
                    key={cell.id}
                    className={`
                      border border-gray-300 flex items-center justify-center relative
                      ${cell.owned 
                        ? 'bg-green-500 border-green-700' 
                        : 'bg-gray-200 border-gray-400'
                      }
                    `}
                    style={{
                      width: '100%', // Let the grid container control the size
                      height: '100%', // Let the grid container control the size
                    }}
                  >
                    {cell.owned && (
                      <div className="w-4 h-4 bg-white rounded-full absolute" />
                    )}
                    {cell.resource && (
                      <div className={`
                        ${cell.resource.iconClasses}
                        ${cell.miningProgress >= MAX_MINING ? 'bg-gray-400' : cell.resource.color}
                        ${cell.owned ? 'mix-blend-multiply' : ''}
                        absolute
                        ${cell.miningProgress >= MAX_MINING ? 'opacity-50' : ''}
                      `} />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Info and Controls Panel - Right 35% */}
          <div className="w-[35%] h-full border-l border-gray-300 flex flex-col">
            {/* Info Section - Top 30% */}
            <div className="h-[30%] p-4 border-b border-gray-300 relative">
              <div className="bg-white rounded-lg p-3 shadow-md h-full overflow-auto">
                {/* Instructions */}
                <div className="relative mb-3">
                  <div
                    className="text-sm font-semibold text-blue-600 cursor-pointer hover:underline"
                    onClick={() => setShowInstructions(!showInstructions)}
                  >
                    How to Play
                  </div>
                </div>

                <div className="text-lg font-semibold mb-3 text-gray-800">Game Information</div>
                <div className="space-y-4">
                  {/* Stats */}
                  <div className="space-y-1">
                    <div className="text-sm text-gray-700">Turn: {turnCount}</div>
                    <div className="text-sm text-gray-700">Territory: {territoryCount} cells</div>
                    <div className="flex items-center space-x-1">
                      <Image
                        src="/ingot.svg"
                        alt="Quantum Amalgam"
                        width={24}
                        height={24}
                        unoptimized
                        className="w-6 h-6"
                      />
                      <span className="text-sm text-gray-700">
                        Quantum Amalgam: {resources["Quantum Amalgam"] || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Touch Controls for Mobile */}
            {isMobile && (
              <div className="flex justify-center items-center space-x-4 p-4">
                <button
                  className="bg-gray-200 p-4 rounded-full shadow-md"
                  onClick={() => handleSwipe('up')}
                >
                  ↑
                </button>
                <div className="flex flex-col space-y-4">
                  <button
                    className="bg-gray-200 p-4 rounded-full shadow-md"
                    onClick={() => handleSwipe('left')}
                  >
                    ←
                  </button>
                  <button
                    className="bg-gray-200 p-4 rounded-full shadow-md"
                    onClick={() => handleSwipe('right')}
                  >
                    →
                  </button>
                </div>
                <button
                  className="bg-gray-200 p-4 rounded-full shadow-md"
                  onClick={() => handleSwipe('down')}
                >
                  ↓
                </button>
              </div>
            )}

            {/* Resource Tree - Bottom 70% */}
            <div className="flex-1 p-4 overflow-auto">
              <div className="bg-white rounded-lg p-4 shadow-md h-full">
                <div className="text-lg font-semibold mb-2 text-gray-800">Resource Manufacturing</div>
                <div className="relative w-full h-[calc(100%-2rem)]">
                  {/* SVG Connections Layer */}
                  <svg
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                    viewBox={`0 0 ${400} ${500}`} // Use a fixed viewBox for scaling
                    preserveAspectRatio="none" // Allow the aspect ratio to stretch
                  >
                    {/* Tier 1 to Tier 2 connections */}
                    {[
                      [BASIC_RESOURCES[0], BASIC_RESOURCES[1], MATERIALS[0]],
                      [BASIC_RESOURCES[2], BASIC_RESOURCES[3], MATERIALS[1]],
                      [BASIC_RESOURCES[4], BASIC_RESOURCES[5], MATERIALS[2]],
                      [BASIC_RESOURCES[6], BASIC_RESOURCES[7], MATERIALS[3]]
                    ].map(([input1, input2, output], index) => (
                      <path
                        key={`t1-${index}`}
                        d={createYConnector(
                          getResourcePosition(input1, 400, 500),
                          getResourcePosition(input2, 400, 500),
                          getResourcePosition(output, 400, 500)
                        )}
                        className="stroke-gray-400 fill-none"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Tier 2 to Tier 3 connections */}
                    {[
                      [MATERIALS[0], MATERIALS[1], COMPOUNDS[0]],
                      [MATERIALS[2], MATERIALS[3], COMPOUNDS[1]]
                    ].map(([input1, input2, output], index) => (
                      <path
                        key={`t2-${index}`}
                        d={createYConnector(
                          getResourcePosition(input1, 400, 500),
                          getResourcePosition(input2, 400, 500),
                          getResourcePosition(output, 400, 500)
                        )}
                        className="stroke-gray-400 fill-none"
                        strokeWidth="1.5"
                      />
                    ))}

                    {/* Tier 3 to Tier 4 connection */}
                    <path
                      d={createYConnector(
                        getResourcePosition(COMPOUNDS[0], 400, 500),
                        getResourcePosition(COMPOUNDS[1], 400, 500),
                        getResourcePosition(SUPER_ALLOY, 400, 500)
                      )}
                      className="stroke-gray-400 fill-none"
                      strokeWidth="1.5"
                    />
                  </svg>

                  {/* Resource Icons Layer */}
                  {[...BASIC_RESOURCES, ...MATERIALS, ...COMPOUNDS, SUPER_ALLOY].map((resource) => {
                    const pos = getResourcePosition(resource, 400, 500);
                    return (
                      <div
                        key={resource.name}
                        className="absolute transform -translate-x-1/2"
                        style={{
                          left: `${(pos.icon.x / 400) * 100}%`, // Scale position based on container width
                          top: `${(pos.icon.y / 500) * 100}%` // Scale position based on container height
                        }}
                      >
                        <div
                          className="text-[0.6rem] text-gray-600 text-center whitespace-nowrap absolute transform -translate-x-1/2"
                          style={{
                            left: '50%',
                            top: '-16px'
                          }}
                        >
                          {resource.name}
                        </div>
                        {resource.name === "Quantum Amalgam" ? (
                          <Image
                            src="/ingot.svg"
                            alt="Quantum Amalgam"
                            width={32}
                            height={32}
                            className="w-8 h-8"
                          />
                        ) : (
                          <div
                            className={`${resource.color} ${resource.iconClasses}`}
                            style={{
                              transform: `scale(${400 / 400}, ${500 / 500})`, // Scale icons proportionally
                            }}
                          />
                        )}
                        <div
                          className="text-xs text-gray-800 font-medium text-center absolute transform -translate-x-1/2"
                          style={{
                            width: '24px',
                            left: '50%',
                            top: '24px'
                          }}
                        >
                          {resources[resource.name] || 0}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default GameGrid;