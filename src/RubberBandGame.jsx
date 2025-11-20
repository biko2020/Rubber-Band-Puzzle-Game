import React, { useState, useEffect } from 'react';
import { RotateCcw, Trophy } from 'lucide-react';

const RubberBandGame = () => {
  const GRID_SIZE = 5;                     // 5×5 pegs → 4×4 possible small squares
  const [pegs, setPegs] = useState([]);
  const [connections, setConnections] = useState([]);
  const [selectedPeg, setSelectedPeg] = useState(null);
  const [currentPlayer, setCurrentPlayer] = useState(1);
  const [triangles, setTriangles] = useState([]);
  const [scores, setScores] = useState({ player1: 0, player2: 0 });
  const [gameOver, setGameOver] = useState(false);

  // -----------------------------------------------------------------
  // Initialise board
  // -----------------------------------------------------------------
  useEffect(() => {
    initializeGame();
  }, []);

  const initializeGame = () => {
    const newPegs = [];
    for (let row = 0; row < GRID_SIZE; row++) {
      for (let col = 0; col < GRID_SIZE; col++) {
        newPegs.push({ id: `${row}-${col}`, row, col });
      }
    }
    setPegs(newPegs);
    setConnections([]);
    setSelectedPeg(null);
    setCurrentPlayer(1);
    setTriangles([]);
    setScores({ player1: 0, player2: 0 });
    setGameOver(false);
  };

  // -----------------------------------------------------------------
  // Geometry helpers
  // -----------------------------------------------------------------
  const getPegPosition = (peg) => {
    const size = 400;
    const spacing = size / (GRID_SIZE - 1);
    return {
      x: peg.col * spacing + 50,
      y: peg.row * spacing + 50,
    };
  };

  const connectionExists = (id1, id2) => {
    return connections.some(
      (c) => (c.from === id1 && c.to === id2) || (c.from === id2 && c.to === id1)
    );
  };

  // -----------------------------------------------------------------
  // Triangle detection (any 3 pegs that form a triangle)
  // -----------------------------------------------------------------
  const findNewTriangles = (newConn) => {
    const all = [...connections, newConn];
    const found = [];

    pegs.forEach((p1) => {
      pegs.forEach((p2) => {
        if (p1.id >= p2.id) return;
        pegs.forEach((p3) => {
          if (p2.id >= p3.id) return;

          const e12 = connectionExistsIn(all, p1.id, p2.id);
          const e23 = connectionExistsIn(all, p2.id, p3.id);
          const e31 = connectionExistsIn(all, p3.id, p1.id);

          if (e12 && e23 && e31) {
            const id = [p1.id, p2.id, p3.id].sort().join('-');
            if (!triangles.some((t) => t.id === id)) {
              found.push({ id, pegs: [p1, p2, p3], owner: currentPlayer });
            }
          }
        });
      });
    });
    return found;
  };

  const connectionExistsIn = (list, a, b) =>
    list.some((c) => (c.from === a && c.to === b) || (c.from === b && c.to === a));

  // -----------------------------------------------------------------
  // Click handling
  // -----------------------------------------------------------------
  const handlePegClick = (peg) => {
    if (gameOver) return;

    if (!selectedPeg) {
      setSelectedPeg(peg);
      return;
    }

    if (selectedPeg.id === peg.id) {
      setSelectedPeg(null);
      return;
    }

    if (connectionExists(selectedPeg.id, peg.id)) {
      setSelectedPeg(null);
      return;
    }

    const newConn = { from: selectedPeg.id, to: peg.id };
    const newTris = findNewTriangles(newConn);

    setConnections((prev) => [...prev, newConn]);
    setSelectedPeg(null);

    if (newTris.length) {
      setTriangles((prev) => [...prev, ...newTris]);
      setScores((prev) => ({
        ...prev,
        [`player${currentPlayer}`]: prev[`player${currentPlayer}`] + newTris.length,
      }));
    } else {
      setCurrentPlayer(currentPlayer === 1 ? 2 : 1);
    }

    // ----- game over when no legal moves left -----
    const possible = possibleMoves();
    if (possible.length === 0) setGameOver(true);
  };

  // All pairs of pegs that are **adjacent** (horizontal/vertical only)
  const possibleMoves = () => {
    const moves = [];
    pegs.forEach((p1) => {
      pegs.forEach((p2) => {
        if (p1.id >= p2.id) return;
        if (!connectionExists(p1.id, p2.id) && areAdjacent(p1, p2)) {
          moves.push([p1.id, p2.id]);
        }
      });
    });
    return moves;
  };

  const areAdjacent = (a, b) => {
    const dr = Math.abs(a.row - b.row);
    const dc = Math.abs(a.col - b.col);
    return (dr === 1 && dc === 0) || (dr === 0 && dc === 1);
  };

  // -----------------------------------------------------------------
  // Rendering helpers
  // -----------------------------------------------------------------
  const getTriangleCenter = (tri) => {
    const pos = tri.pegs.map(getPegPosition);
    return {
      x: (pos[0].x + pos[1].x + pos[2].x) / 3,
      y: (pos[0].y + pos[1].y + pos[2].y) / 3,
    };
  };

  // -----------------------------------------------------------------
  // JSX
  // -----------------------------------------------------------------
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-6 text-purple-600">
          Rubber Band Puzzle Game
        </h1>

        {/* Scores */}
        <div className="flex justify-between items-center mb-6">
          <div
            className={`flex-1 p-4 rounded-lg ${
              currentPlayer === 1 ? 'bg-blue-100 ring-4 ring-blue-400' : 'bg-gray-100'
            }`}
          >
            <div className="text-lg font-semibold text-blue-600">Joueur 1</div>
            <div className="text-3xl font-bold text-blue-700">{scores.player1}</div>
          </div>

          <button
            onClick={initializeGame}
            className="mx-4 p-3 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-colors"
          >
            <RotateCcw size={24} />
          </button>

          <div
            className={`flex-1 p-4 rounded-lg ${
              currentPlayer === 2 ? 'bg-red-100 ring-4 ring-red-400' : 'bg-gray-100'
            }`}
          >
            <div className="text-lg font-semibold text-red-600">Joueur 2</div>
            <div className="text-3xl font-bold text-red-700">{scores.player2}</div>
          </div>
        </div>

        {/* Game-over banner */}
        {gameOver && (
          <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-4 mb-4 text-center">
            <Trophy className="inline-block mr-2 text-yellow-600" size={24} />
            <span className="text-xl font-bold">
              {scores.player1 > scores.player2
                ? 'Joueur 1 gagne!'
                : scores.player2 > scores.player1
                ? 'Joueur 2 gagne!'
                : 'Match nul!'}
            </span>
          </div>
        )}

        {/* Board */}
        <div className="relative bg-gray-50 rounded-xl p-4">
          <svg width="500" height="500" className="mx-auto">
            {/* Connections */}
            {connections.map((c, i) => {
              const from = pegs.find((p) => p.id === c.from);
              const to = pegs.find((p) => p.id === c.to);
              const f = getPegPosition(from);
              const t = getPegPosition(to);
              return (
                <line
                  key={i}
                  x1={f.x}
                  y1={f.y}
                  x2={t.x}
                  y2={t.y}
                  stroke="#8b5cf6"
                  strokeWidth="3"
                  opacity="0.6"
                />
              );
            })}

            {/* Selected peg halo */}
            {selectedPeg && (
              <circle
                cx={getPegPosition(selectedPeg).x}
                cy={getPegPosition(selectedPeg).y}
                r="20"
                fill="yellow"
                opacity="0.3"
              />
            )}

            {/* Claimed triangles */}
            {triangles.map((tri, i) => {
              const center = getTriangleCenter(tri);
              return (
                <circle
                  key={i}
                  cx={center.x}
                  cy={center.y}
                  r="15"
                  fill={tri.owner === 1 ? '#3b82f6' : '#ef4444'}
                  opacity="0.8"
                />
              );
            })}

            {/* Pegs */}
            {pegs.map((peg) => {
              const pos = getPegPosition(peg);
              return (
                <circle
                  key={peg.id}
                  cx={pos.x}
                  cy={pos.y}
                  r="8"
                  fill="#6366f1"
                  className="cursor-pointer hover:fill-purple-700 transition-colors"
                  onClick={() => handlePegClick(peg)}
                />
              );
            })}
          </svg>
        </div>

        <div className="mt-6 text-center text-gray-600">
          <p className="text-sm">
            <strong>Comment jouer :</strong> Cliquez sur deux chevilles pour créer un
            élastique. Formez des triangles pour marquer des points !
          </p>
        </div>
      </div>
    </div>
  );
};

export default RubberBandGame;