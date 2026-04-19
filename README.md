# Vibecast

A modern web radio streaming player for Singapore radio stations. Built with React + Vite.

## Features

- **Now Playing** - Displays current track and artist information fetched from Triton Digital
- **Volume Control** - Adjust playback volume with mute toggle
- **Sleep Timer** - Set a timer to automatically stop playback
- **Dark/Light Theme** - Toggle between dark and light modes
- **Responsive Design** - Works on desktop and mobile devices
- **Smooth Animations** - Polished animations using Motion

## Tech Stack

- [React](https://react.dev/) - UI framework
- [Vite](https://vitejs.dev/) - Build tool
- [Motion](https://motion.dev/) - Animation library
- [Lucide React](https://lucide.dev/) - Icons

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to project directory
cd radio-streaming-player

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build

```bash
# Build for production
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
├── src/
│   ├── App.jsx       # Main application component
│   ├── App.css      # Application styles
│   └── main.jsx     # Application entry point
├── public/
├── index.html
├── package.json
└── vite.config.js
```

## Usage

1. Click on a station card to select your desired station
2. Click the play button to start streaming
3. Use the volume slider to adjust volume
4. Click the timer icon to set a sleep timer
5. Toggle the theme using the sun/moon icon

## License

MIT