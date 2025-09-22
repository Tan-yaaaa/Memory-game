import { useState, useEffect, useCallback, useRef } from 'react'
import './App.css'

function App() {
  const [gameState, setGameState] = useState('home')
  const [userName, setUserName] = useState('')
  const [cards, setCards] = useState([])
  const [flipped, setFlipped] = useState([])
  const [matched, setMatched] = useState([])
  const [moves, setMoves] = useState(0)
  const [timer, setTimer] = useState(0)
  const [highScores, setHighScores] = useState([])
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const timeoutRef = useRef(null)

  const emojis = ['🐱', '🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸']

  const initGame = useCallback(() => {
    const gameEmojis = [...emojis.slice(0, 8), ...emojis.slice(0, 8)]
    const shuffled = [...gameEmojis]
      .sort(() => Math.random() - 0.5)
      .map((emoji, i) => ({ id: i, emoji, flipped: false }))
    
    setCards(shuffled)
    setFlipped([])
    setMatched([])
    setMoves(0)
    setTimer(0)
    setIsTimerRunning(true)
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const startGame = () => {
    if (!userName.trim()) {
      alert('Please enter your name to start the game!')
      return
    }
    initGame()
    setGameState('playing')
  }

  const handleCardClick = (id) => {
    if (flipped.length === 2 || flipped.includes(id) || matched.includes(id)) return
    
    const newFlipped = [...flipped, id]
    setFlipped(newFlipped)
    
    if (newFlipped.length === 2) {
      setMoves(moves + 1)
      if (cards[newFlipped[0]].emoji === cards[newFlipped[1]].emoji) {
        setMatched([...matched, ...newFlipped])
        setFlipped([])
      } else {
        timeoutRef.current = setTimeout(() => {
          setFlipped([])
          timeoutRef.current = null
        }, 1000)
      }
    }
  }

  useEffect(() => {
    if (matched.length === 16 && cards.length > 0) {
      setIsTimerRunning(false)
      const score = Math.floor(10000 / (moves + timer / 10))
      
      const newScore = { name: userName, score, moves, time: timer }
      
      setHighScores(prevScores => {
        const updatedScores = [...prevScores, newScore]
          .sort((a, b) => b.score - a.score)
          .slice(0, 3);
        
        localStorage.setItem('memoryHighScores', JSON.stringify(updatedScores))
        return updatedScores
      })
      
      setGameState('gameOver')
    }
  }, [matched, cards.length, moves, timer, userName])

  useEffect(() => {
    let interval
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTimerRunning])

  useEffect(() => {
    const savedScores = localStorage.getItem('memoryHighScores')
    if (savedScores) {
      try {
        const parsedScores = JSON.parse(savedScores)
        if (Array.isArray(parsedScores)) {
          setHighScores(parsedScores)
        }
      } catch (e) {
        console.error("Error parsing saved scores:", e)
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`
  }

  return (
    <div className="app dark-theme">
      {/* Moving background elements */}
      <div className={`moving-background ${gameState !== 'playing' ? 'visible' : ''}`}>
        <div className="bg-bubbles">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="bubble" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 15}s`,
              animationDuration: `${15 + Math.random() * 20}s`,
              width: `${20 + Math.random() * 30}px`,
              height: `${20 + Math.random() * 30}px`,
              opacity: `${0.1 + Math.random() * 0.2}`
            }}></div>
          ))}
        </div>
        <div className="bg-shapes">
          <div className="shape circle"></div>
          <div className="shape triangle"></div>
          <div className="shape square"></div>
        </div>
      </div>

      {gameState === 'home' && (
        <div className="home-screen">
          <div className="home-content">
            <div className="game-header">
              <h1 className="game-title">Neuro<span>Match</span></h1>
              <p className="game-subtitle">Memory Game</p>
            </div>
            
            <div className="input-container">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="name-input"
                  onKeyPress={(e) => e.key === 'Enter' && startGame()}
                />
                <button onClick={startGame} className="start-button">Start Game</button>
              </div>
            </div>

            <div className="high-scores-section">
              <h2>Leaderboard</h2>
              <div className="high-scores">
                {highScores.length > 0 ? (
                  highScores.map((score, index) => (
                    <div key={index} className="score-item">
                      <div className="rank">{index + 1}</div>
                      <div className="player-info">
                        <div className="player-name">{score.name}</div>
                        <div className="player-stats">{score.moves} moves · {formatTime(score.time)}</div>
                      </div>
                      <div className="score-value">{score.score}</div>
                    </div>
                  ))
                ) : (
                  <p className="no-scores">No high scores yet!</p>
                )}
              </div>
            </div>
<div className="credits">
      <p>created by Tanya</p>
           <div className="links">
            
            
                        <a href="https://github.com/Tan-yaaaa" target="_blank" rel="noopener noreferrer">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                            </svg>
                            GitHub
                        </a>
                        <a href="https://www.linkedin.com/in/tanya-singh-chauhan/" target="_blank" rel="noopener noreferrer">
                            <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                            </svg>
                            LinkedIn
                        </a>
                      
                    </div>
                </div>
            </div>
        </div>
  

      )}

      {gameState === 'playing' && (
        <div className="game-screen">
          <div className="game-header">
            <h2>Neuro<span>Match</span></h2>
            <div className="game-controls">
              <button className="icon-button" onClick={() => {
                if (timeoutRef.current) {
                  clearTimeout(timeoutRef.current)
                  timeoutRef.current = null
                }
                setGameState('home')
              }}>
                ◀ Menu
              </button>
            </div>
          </div>

          <div className="stats-bar">
            <div className="stat">
              <span className="stat-label">Player</span>
              <span className="stat-value">{userName}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time</span>
              <span className="stat-value">{formatTime(timer)}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Moves</span>
              <span className="stat-value">{moves}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Matches</span>
              <span className="stat-value">{matched.length / 2}/8</span>
            </div>
          </div>

          <div className="cards-container">
            <div className="cards-grid">
              {cards.map(card => (
                <div 
                  key={card.id}
                  className={`card ${flipped.includes(card.id) || matched.includes(card.id) ? 'flipped' : ''}`}
                  onClick={() => handleCardClick(card.id)}
                >
                  <div className="card-inner">
                    <div className="card-front">
                      <div className="card-pattern"></div>
                    </div>
                    <div className="card-back">
                      <span>{card.emoji}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {gameState === 'gameOver' && (
        <div className="game-over-screen">
          <div className="game-over-content">
            <h2>Game Complete!</h2>
            <div className="result-card">
              <div className="result-header">Your Score</div>
              <div className="result-score">{Math.floor(10000 / (moves + timer / 10))}</div>
              <div className="result-details">
                <div className="detail">
                  <span>Time:</span>
                  <span>{formatTime(timer)}</span>
                </div>
                <div className="detail">
                  <span>Moves:</span>
                  <span>{moves}</span>
                </div>
                <div className="detail">
                  <span>Player:</span>
                  <span>{userName}</span>
                </div>
              </div>
            </div>

            <div className="high-scores-mini">
              <h3>Top Scores</h3>
              {highScores.map((score, index) => (
                <div key={index} className={`score-line ${score.name === userName ? 'highlighted' : ''}`}>
                  <span className="score-rank">{index + 1}.</span>
                  <span className="score-name">{score.name}</span>
                  <span className="score-points">{score.score}</span>
                </div>
              ))}
            </div>

            <div className="action-buttons">
              <button onClick={() => {
                initGame();
                setGameState('playing');
              }} className="primary-button">Play Again</button>
              <button onClick={() => setGameState('home')} className="secondary-button">Main Menu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App