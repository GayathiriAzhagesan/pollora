import React from 'react';

export const QRCodeCard = ({ value = 'https://livepoll.example.com/poll/1', size = 180 }) => {
  // Generate a deterministic 21x21 QR code grid matrix based on value hash
  const gridSize = 21;
  const hash = Array.from(value).reduce((acc, char, i) => acc + char.charCodeAt(0) * (i + 1), 0);
  
  // Position detection patterns (top-left, top-right, bottom-left 7x7 locators)
  const isFinderPattern = (r, c) => {
    // Top-left
    if (r < 7 && c < 7) {
      return (
        r === 0 || r === 6 || c === 0 || c === 6 ||
        (r >= 2 && r <= 4 && c >= 2 && c <= 4)
      );
    }
    // Top-right
    if (r < 7 && c >= gridSize - 7) {
      const col = c - (gridSize - 7);
      return (
        r === 0 || r === 6 || col === 0 || col === 6 ||
        (r >= 2 && r <= 4 && col >= 2 && col <= 4)
      );
    }
    // Bottom-left
    if (r >= gridSize - 7 && c < 7) {
      const row = r - (gridSize - 7);
      return (
        row === 0 || row === 6 || c === 0 || c === 6 ||
        (row >= 2 && row <= 4 && c >= 2 && c <= 4)
      );
    }
    // Timing patterns
    if (r === 6 || c === 6) {
      return (r + c) % 2 === 0;
    }
    return null;
  };

  const cells = [];
  for (let r = 0; r < gridSize; r++) {
    for (let c = 0; c < gridSize; c++) {
      const finder = isFinderPattern(r, c);
      let isDark = false;
      if (finder !== null) {
        isDark = finder;
      } else {
        // Pseudo-random data module
        const seed = (hash * (r + 1) * 31 + c * 17) % 97;
        isDark = seed % 2 === 0 || (r + c) % 3 === 0;
      }
      if (isDark) {
        cells.push({ r, c });
      }
    }
  }

  const cellSize = size / (gridSize + 4);
  const offset = cellSize * 2;

  return (
    <div className="qr-container" style={{ width: size + 24, height: size + 24 }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="qr-svg"
      >
        <rect width={size} height={size} rx="8" fill="#ffffff" />
        {cells.map(({ r, c }) => (
          <rect
            key={`${r}-${c}`}
            x={offset + c * cellSize}
            y={offset + r * cellSize}
            width={cellSize * 0.94}
            height={cellSize * 0.94}
            rx={cellSize * 0.15}
            fill="#0f172a"
          />
        ))}
      </svg>
    </div>
  );
};
