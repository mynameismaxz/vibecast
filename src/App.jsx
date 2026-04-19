import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Radio, Timer, X, Sun, Moon } from 'lucide-react'
import { animate, stagger } from 'motion'
import './App.css'

const STATIONS = [
  { id: 1, name: 'Class 95', callsign: 'CLASS 95', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CLASS95_PREM.aac', mountName: 'CLASS95_PREM', location: 'Singapore', genre: 'Pop & Hits' },
  { id: 2, name: '987 FM', callsign: '987 FM', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/987FM_PREM.aac', mountName: '987FM_PREM', location: 'Singapore', genre: 'Rock & Pop' },
  { id: 3, name: 'Gold 905', callsign: 'GOLD 905', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/GOLD905_PREM.aac', mountName: 'GOLD905_PREM', location: 'Singapore', genre: 'Oldies' },
  { id: 4, name: 'Kiss92', callsign: 'KISS 92', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KISS_92_PREM.aac', mountName: 'KISS_92_PREM', location: 'Singapore', genre: 'Adult Contemporary' },
  { id: 5, name: 'YES 933', callsign: 'YES 933', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/YES933_PREM.aac', mountName: 'YES933_PREM', location: 'Singapore', genre: 'Chinese Pop' },
  { id: 6, name: 'Love 972', callsign: 'LOVE 972', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOVE972FM_PREM.aac', mountName: 'LOVE972FM_PREM', location: 'Singapore', genre: 'Chinese Hits' },
  { id: 7, name: 'Capital 958', callsign: 'CAPITAL 958', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CAPITAL958FM_PREM.aac', mountName: 'CAPITAL958FM_PREM', location: 'Singapore', genre: 'Chinese News' },
  { id: 8, name: 'UFM100.3', callsign: 'UFM 100.3', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/UFM_1003_PREM.aac', mountName: 'UFM_1003_PREM', location: 'Singapore', genre: 'Chinese Pop' },
  { id: 9, name: 'Ria 89.7', callsign: 'RIA 897', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/RIA897FM_PREM.aac', mountName: 'RIA897FM_PREM', location: 'Singapore', genre: 'Malay' },
  { id: 10, name: 'Warna 94.2', callsign: 'WARNA 942', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/WARNA942FM_PREM.aac', mountName: 'WARNA942FM_PREM', location: 'Singapore', genre: 'Malay' },
  { id: 11, name: 'Oli 96.8', callsign: 'OLI 968', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/OLI968FM_PREM.aac', mountName: 'OLI968FM_PREM', location: 'Singapore', genre: 'Tamil' },
  { id: 12, name: 'Symphony 92.4', callsign: 'SYMPHONY 924', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/SYMPHONY924_PREM.aac', mountName: 'SYMPHONY924_PREM', location: 'Singapore', genre: 'Classical' },
]

function App() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentStation, setCurrentStation] = useState(STATIONS[0])
  const [volume, setVolume] = useState(0.7)
  const [isMuted, setIsMuted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null)
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme')
    return saved || 'dark'
  })
  const [nowPlaying, setNowPlaying] = useState(null)
  const audioRef = useRef(null)
  const sleepTimerRef = useRef(null)
  const metadataIntervalRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  useEffect(() => {
    animate('.station-card', 
      { opacity: [0, 1], y: [20, 0] },
      { delay: stagger(0.1), duration: 0.6 }
    )
  }, [])

  useEffect(() => {
    if (sleepTimeRemaining !== null && sleepTimeRemaining > 0) {
      sleepTimerRef.current = setInterval(() => {
        setSleepTimeRemaining(prev => {
          if (prev <= 1) {
            if (audioRef.current) {
              audioRef.current.pause()
              setIsPlaying(false)
            }
            return null
          }
          return prev - 1
        })
      }, 1000)

      return () => {
        if (sleepTimerRef.current) {
          clearInterval(sleepTimerRef.current)
        }
      }
    }
  }, [sleepTimeRemaining])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentStation.stream
      audioRef.current.load()
    }
  }, [currentStation])

  useEffect(() => {
    document.title = isPlaying 
      ? `▶ ${currentStation.name} - Radio`
      : `Radio - ${currentStation.name}`
  }, [isPlaying, currentStation])

  useEffect(() => {
    const fetchNowPlaying = async () => {
      if (!isPlaying || !currentStation.mountName) return
      
      try {
        const response = await fetch(
          `https://np.tritondigital.com/public/nowplaying?mountName=${currentStation.mountName}&numberToFetch=1`
        )
        const xmlText = await response.text()
        
        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')
        
        const nowPlayingInfo = xmlDoc.querySelector('nowplaying-info')
        if (nowPlayingInfo) {
          const titleProp = nowPlayingInfo.querySelector('property[name="cue_title"]')
          const artistProp = nowPlayingInfo.querySelector('property[name="track_artist_name"]')
          
          const title = titleProp?.textContent?.trim() || 'Unknown Track'
          const artist = artistProp?.textContent?.trim()
          
          const songInfo = artist ? `${artist} - ${title}` : title
          setNowPlaying(songInfo)
          document.title = `▶ ${songInfo} - ${currentStation.name}`
        }
      } catch (error) {
        console.error('Failed to fetch now playing:', error)
      }
    }

    if (isPlaying) {
      fetchNowPlaying()
      metadataIntervalRef.current = setInterval(fetchNowPlaying, 10000)
    } else {
      setNowPlaying(null)
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current)
      }
    }

    return () => {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current)
      }
    }
  }, [isPlaying, currentStation])

  const togglePlay = async () => {
    if (!audioRef.current) return
    
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      setIsLoading(true)
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (error) {
        console.error('Playback failed:', error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  const selectStation = (station) => {
    const wasPlaying = isPlaying
    if (audioRef.current) {
      audioRef.current.pause()
    }
    setCurrentStation(station)
    setIsPlaying(false)
    
    if (wasPlaying) {
      setTimeout(() => togglePlay(), 100)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false)
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const startSleepTimer = (minutes) => {
    const seconds = minutes * 60
    setSleepTimeRemaining(seconds)
    setShowSleepTimerModal(false)
  }

  const cancelSleepTimer = () => {
    setSleepTimeRemaining(null)
    if (sleepTimerRef.current) {
      clearInterval(sleepTimerRef.current)
    }
  }

  const formatTime = (seconds) => {
    if (seconds === null) return ''
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleCustomTimer = (e) => {
    e.preventDefault()
    const input = e.target.elements.customMinutes
    const minutes = parseInt(input.value)
    if (minutes > 0 && minutes <= 999) {
      startSleepTimer(minutes)
    }
  }

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  }

  return (
    <div className="app">
      <div className="grain"></div>
      
      <header className="header">
        <div className="logo">
          <Radio className="logo-icon" />
          <h1>Radio</h1>
        </div>
        <div className="header-right">
          <div className="tagline">Singapore Stations</div>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      <main className="main">
        <div className="player-section">
          <div className="now-playing">
            <div className="station-info">
              <div className="callsign">{currentStation.callsign}</div>
              <div className="station-name">{currentStation.name}</div>
              {nowPlaying && (
                <div className="now-playing-track">♫ {nowPlaying}</div>
              )}
              <div className="station-meta">
                <span>{currentStation.location}</span>
                <span className="separator">•</span>
                <span>{currentStation.genre}</span>
              </div>
            </div>

            <div className="visualizer">
              {isPlaying && (
                <>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                  <div className="bar"></div>
                </>
              )}
            </div>
          </div>

          <div className="controls">
            <button 
              className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
              onClick={togglePlay}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="spinner"></div>
              ) : isPlaying ? (
                <Pause size={32} />
              ) : (
                <Play size={32} />
              )}
            </button>

            <div className="volume-control">
              <button className="volume-button" onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="volume-slider"
              />
            </div>

            <button 
              className={`sleep-timer-button ${sleepTimeRemaining ? 'active' : ''}`}
              onClick={() => sleepTimeRemaining ? cancelSleepTimer() : setShowSleepTimerModal(true)}
            >
              <Timer size={20} />
              {sleepTimeRemaining && (
                <span className="countdown-text">{formatTime(sleepTimeRemaining)}</span>
              )}
            </button>
          </div>
        </div>

        <div className="stations-section">
          <h2 className="section-title">Stations</h2>
          <div className="stations-grid">
            {STATIONS.map((station) => (
              <button
                key={station.id}
                className={`station-card ${currentStation.id === station.id ? 'active' : ''}`}
                onClick={() => selectStation(station)}
              >
                <div className="station-card-header">
                  <div className="station-callsign">{station.callsign}</div>
                  {currentStation.id === station.id && isPlaying && (
                    <div className="live-indicator">
                      <span className="pulse"></span>
                      LIVE
                    </div>
                  )}
                </div>
                <div className="station-card-name">{station.name}</div>
                <div className="station-card-meta">
                  <span>{station.location}</span>
                </div>
                <div className="station-card-genre">{station.genre}</div>
              </button>
            ))}
          </div>
        </div>
      </main>

      {showSleepTimerModal && (
        <div className="sleep-timer-modal-overlay" onClick={() => setShowSleepTimerModal(false)}>
          <div className="sleep-timer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="sleep-timer-header">
              <h3>Sleep Timer</h3>
              <button className="close-button" onClick={() => setShowSleepTimerModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="sleep-timer-presets">
              <button onClick={() => startSleepTimer(15)}>15 min</button>
              <button onClick={() => startSleepTimer(30)}>30 min</button>
              <button onClick={() => startSleepTimer(45)}>45 min</button>
              <button onClick={() => startSleepTimer(60)}>60 min</button>
              <button onClick={() => startSleepTimer(90)}>90 min</button>
            </div>

            <div className="sleep-timer-divider">or</div>

            <form className="sleep-timer-custom" onSubmit={handleCustomTimer}>
              <input
                type="number"
                name="customMinutes"
                min="1"
                max="999"
                placeholder="Custom minutes"
                required
              />
              <button type="submit">Start</button>
            </form>
          </div>
        </div>
      )}

      <audio
        ref={audioRef}
        crossOrigin="anonymous"
        preload="none"
      />
    </div>
  )
}

export default App
