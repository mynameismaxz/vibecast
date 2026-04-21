import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Radio, Timer, X, ChevronRight, ListMusic, Sun, Moon } from 'lucide-react'
import './App.css'

const STATIONS = [
  { id: 1, name: 'Class 95', callsign: 'CLASS 95', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CLASS95_PREM.aac', mountName: 'CLASS95_PREM', location: 'Singapore', genre: 'Pop & Hits' },
  { id: 2, name: '987 FM', callsign: '987 FM', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/987FM_PREM.aac', mountName: '987FM_PREM', location: 'Singapore', genre: 'Rock & Pop' },
  { id: 3, name: 'Gold 905', callsign: 'GOLD 905', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/GOLD905_PREM.aac', mountName: 'GOLD905_PREM', location: 'Singapore', genre: 'Oldies' },
  { id: 4, name: 'Kiss92', callsign: 'KISS 92', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/KISS_92_PREM.aac', mountName: 'KISS_92_PREM', location: 'Singapore', genre: 'Adult Contemporary' },
  { id: 5, name: 'YES 933', callsign: 'YES 933', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/YES933_PREM.aac', mountName: 'YES933_PREM', location: 'Singapore', genre: 'Chinese Pop' },
  { id: 6, name: 'Love 972', callsign: 'LOVE 972', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/LOVE972FM_PREM.aac', mountName: 'LOVE972FM_PREM', location: 'Singapore', genre: 'Chinese Hits' },
  { id: 7, name: 'Capital 958', callsign: 'CAPITAL 958', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/CAPITAL958FM_PREM.aac', mountName: 'CAPITAL958FM_PREM', location: 'Singapore', genre: 'Chinese News' },
  { id: 8, name: 'UFM100.3', callsign: 'UFM 100.3', stream: 'https://playerservices.streamtheworld.com/api/livestream-redirect/UFM_1003_SC', mountName: 'UFM_1003', location: 'Singapore', genre: 'Chinese Pop' },
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
  const [showStationsModal, setShowStationsModal] = useState(false)
  const [nowPlaying, setNowPlaying] = useState(null)
  const [albumArt, setAlbumArt] = useState(null)
  const [albumArtLoading, setAlbumArtLoading] = useState(false)
  const [mediaSessionSupported] = useState(() => 'mediaSession' in navigator)
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark')
  const audioRef = useRef(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark')
  const metadataIntervalRef = useRef(null)

  const [sleepTimeRemaining, setSleepTimeRemaining] = useState(null)
  const [showSleepTimerModal, setShowSleepTimerModal] = useState(false)
  const sleepTimerRef = useRef(null)

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = currentStation.stream
      audioRef.current.load()
    }
  }, [currentStation])

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
    document.title = isPlaying 
      ? `▶ ${currentStation.name} - VibeCast`
      : `VibeCast - ${currentStation.name}`
  }, [isPlaying, currentStation])

  useEffect(() => {
    if (!('mediaSession' in navigator)) return

    if (!isPlaying) {
      navigator.mediaSession.playbackState = 'none'
      return
    }

    const [artist, title] = nowPlaying
      ? nowPlaying.includes(' - ')
        ? nowPlaying.split(' - ').map(s => s.trim())
        : [currentStation.name, nowPlaying]
      : [currentStation.genre, currentStation.name]

    const absoluteBase = `${window.location.origin}`
    const fallbackArt = `${absoluteBase}/favicon.svg`
    const artworkList = albumArt
      ? [{ src: albumArt, sizes: '400x400', type: 'image/jpeg' }]
      : [{ src: fallbackArt, sizes: '512x512', type: 'image/svg+xml' }]

    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist,
      album: 'VibeCast · ' + currentStation.location,
      artwork: artworkList,
    })
    navigator.mediaSession.playbackState = 'playing'

    navigator.mediaSession.setActionHandler('play', () => {
      audioRef.current?.play()
      setIsPlaying(true)
    })
    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause()
      setIsPlaying(false)
    })
    navigator.mediaSession.setActionHandler('stop', () => {
      audioRef.current?.pause()
      setIsPlaying(false)
    })
    navigator.mediaSession.setActionHandler('previoustrack', () => {
      const idx = STATIONS.findIndex(s => s.id === currentStation.id)
      const prev = STATIONS[(idx - 1 + STATIONS.length) % STATIONS.length]
      selectStation(prev)
    })
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      const idx = STATIONS.findIndex(s => s.id === currentStation.id)
      const next = STATIONS[(idx + 1) % STATIONS.length]
      selectStation(next)
    })
  }, [isPlaying, nowPlaying, currentStation, albumArt])

  const fetchAlbumArtFromITunes = async (artist, title, signal) => {
    if (!artist && !title) return null
    try {
      const query = encodeURIComponent(`${artist || ''} ${title || ''}`.trim())
      const res = await fetch(
        `https://itunes.apple.com/search?term=${query}&media=music&limit=1`,
        { signal }
      )
      const data = await res.json()
      const artwork = data.results?.[0]?.artworkUrl100
      return artwork ? artwork.replace('100x100bb', '400x400bb') : null
    } catch {
      return null
    }
  }

  useEffect(() => {
    const abortController = new AbortController()
    const { signal } = abortController

    const fetchNowPlaying = async () => {
      if (!isPlaying || !currentStation.mountName) return
      try {
        const response = await fetch(
          `https://np.tritondigital.com/public/nowplaying?mountName=${currentStation.mountName}&numberToFetch=1`,
          { signal }
        )
        const xmlText = await response.text()

        const parser = new DOMParser()
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml')

        const nowPlayingInfo = xmlDoc.querySelector('nowplaying-info')
        if (nowPlayingInfo) {
          const titleProp = nowPlayingInfo.querySelector('property[name="cue_title"]')
          const artistProp = nowPlayingInfo.querySelector('property[name="track_artist_name"]')
          const coverProp = nowPlayingInfo.querySelector('property[name="track_cover_url"]')

          const title = titleProp?.textContent?.trim() || 'Unknown Track'
          const artist = artistProp?.textContent?.trim()
          const tritonCover = coverProp?.textContent?.trim() || null

          const songInfo = artist ? `${artist} - ${title}` : title
          setNowPlaying(songInfo)
          document.title = `▶ ${songInfo} - ${currentStation.name}`

          if (title !== 'Unknown Track') {
            setAlbumArtLoading(true)
            const art = tritonCover || await fetchAlbumArtFromITunes(artist, title, signal)
            if (!signal.aborted) {
              setAlbumArt(art)
              setAlbumArtLoading(false)
            }
          }
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Failed to fetch now playing:', error)
        }
      }
    }

    if (isPlaying) {
      fetchNowPlaying()
      metadataIntervalRef.current = setInterval(fetchNowPlaying, 10000)
    } else {
      if (metadataIntervalRef.current) {
        clearInterval(metadataIntervalRef.current)
      }
      setNowPlaying(null)
      setAlbumArt(null)
    }

    return () => {
      abortController.abort()
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
    setShowStationsModal(false)
    
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

  return (
    <div className="app">
      <header className="header">
        <div className="logo">
          <Radio className="logo-icon" />
          <h1>VibeCast</h1>
        </div>
        <div className="header-right">
          <button className="theme-toggle" onClick={() => setShowStationsModal(true)} aria-label="Station list">
            <ListMusic size={22} />
          </button>
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={22} /> : <Moon size={22} />}
          </button>
        </div>
      </header>

      <main className="main">
        <section className="player-card">
          <div className="now-playing-container">
            <div className="album-art-wrapper">
              {(isPlaying || albumArt) && (
                <div className={`album-art-container ${isPlaying && albumArt ? 'playing' : ''}`}>
                  {albumArtLoading ? (
                    <div className="album-art-skeleton" aria-label="Loading album art" />
                  ) : albumArt ? (
                    <img
                      src={albumArt}
                      alt={nowPlaying ? `Album art for ${nowPlaying}` : 'Album art'}
                      className="album-art-img"
                      loading="lazy"
                    />
                  ) : (
                    <div className="album-art-placeholder" aria-hidden="true">
                      <Radio size={40} color="var(--golden-orange)" />
                    </div>
                  )}
                  {isPlaying && (
                    <div className="album-art-visualizer">
                      <div className="bar"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="station-info">
              <div className="callsign-row">
                <div className="callsign">{currentStation.callsign}</div>
                {mediaSessionSupported && (
                  <div className="mediasession-badge" title="Media controls available in OS">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
                    </svg>
                    OS Media
                  </div>
                )}
              </div>
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

          <div className="controls-row">
            <div className="main-controls">
              <button 
                className={`play-button ${isPlaying ? 'playing' : ''} ${isLoading ? 'loading' : ''}`}
                onClick={togglePlay}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="spinner"></div>
                ) : isPlaying ? (
                  <Pause fill="currentColor" size={32} />
                ) : (
                  <Play fill="currentColor" size={32} style={{ marginLeft: '4px' }} />
                )}
              </button>
            </div>

            <div className="secondary-controls">
              <div className="volume-control">
                <button className={`icon-button ${isMuted || volume === 0 ? '' : 'active'}`} onClick={toggleMute}>
                  {isMuted || volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
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
                className={`icon-button timer-button ${sleepTimeRemaining ? 'active' : ''}`}
                onClick={() => sleepTimeRemaining ? cancelSleepTimer() : setShowSleepTimerModal(true)}
                title="Sleep Timer"
              >
                <Timer size={24} />
                {sleepTimeRemaining && (
                  <span className="countdown-text">{formatTime(sleepTimeRemaining)}</span>
                )}
              </button>
            </div>
          </div>

          <div className="station-selector">
            <button className="station-select-btn" onClick={() => setShowStationsModal(true)}>
              <span>Change Station ({currentStation.name})</span>
              <ChevronRight size={24} />
            </button>
          </div>
        </section>
      </main>

      <footer className="footer">
        <span>&copy; {new Date().getFullYear()} VibeCast • Singapore Radio Stations</span>
        <a
          href="https://github.com/mynameismaxz/vibecast"
          target="_blank"
          rel="noopener noreferrer"
          className="footer-link"
          aria-label="View source on GitHub"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.84 1.236 1.84 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.418-1.305.762-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          <span>GitHub</span>
        </a>
      </footer>

      {showStationsModal && (
        <div className="modal-overlay" onClick={() => setShowStationsModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Select Station</h2>
              <button className="close-btn" onClick={() => setShowStationsModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="stations-list">
              {STATIONS.map(station => (
                <button 
                  key={station.id} 
                  className={`station-list-item ${currentStation.id === station.id ? 'active' : ''}`}
                  onClick={() => selectStation(station)}
                >
                  <div className="station-list-info">
                    <h3>{station.name}</h3>
                    <p>{station.genre} • {station.location}</p>
                  </div>
                  {currentStation.id === station.id && isPlaying ? (
                    <div className="visualizer" style={{ height: '24px' }}>
                      <div className="bar"></div>
                      <div className="bar"></div>
                      <div className="bar"></div>
                    </div>
                  ) : currentStation.id === station.id ? (
                    <Play size={24} color="var(--golden-orange)" />
                  ) : null}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSleepTimerModal && (
        <div className="modal-overlay" onClick={() => setShowSleepTimerModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Sleep Timer</h2>
              <button className="close-btn" onClick={() => setShowSleepTimerModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="sleep-timer-presets">
              <button onClick={() => startSleepTimer(15)}>15 min</button>
              <button onClick={() => startSleepTimer(30)}>30 min</button>
              <button onClick={() => startSleepTimer(45)}>45 min</button>
              <button onClick={() => startSleepTimer(60)}>1 hour</button>
              <button onClick={() => startSleepTimer(90)}>1.5 hours</button>
              <button onClick={() => startSleepTimer(120)}>2 hours</button>
            </div>

            <form className="sleep-timer-custom" onSubmit={handleCustomTimer}>
              <input
                type="number"
                name="customMinutes"
                min="1"
                max="999"
                placeholder="Custom minutes..."
                required
              />
              <button type="submit">Start Timer</button>
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

