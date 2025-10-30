# Multi-Layer Audio Generator

A sophisticated web-based audio generator that combines multiple audio layers (ambient nature sounds, subtle instrumental music, white noise, and ambient textures) with individual volume controls. Create your perfect non-distracting soundscape while video content remains synchronized.

## Features

### Core Functionality
- **Multi-Layer Audio Mixing**: Combine up to 4 simultaneous audio layers
- **Individual Volume Controls**: Fine-tune each layer independently
- **Master Volume Control**: Global volume adjustment for all layers
- **Real-time Waveform Visualization**: See audio activity for each layer
- **Video Synchronization**: Optional sync with video playback

### Audio Layers

1. **Nature Sounds** 🌿
   - Rain
   - Forest ambience
   - Ocean waves
   - Stream
   - Birds chirping

2. **Instrumental Music** 🎹
   - Soft Piano
   - Ambient Synth
   - Acoustic Guitar
   - String Ensemble
   - Lo-Fi Beats

3. **White Noise** 📻
   - White Noise (generated)
   - Pink Noise (generated)
   - Brown Noise (generated)
   - Fan Noise
   - Cafe Ambience

4. **Ambient Textures** 🌌
   - Space Drone
   - Temple Bells
   - Wind Chimes
   - Tibetan Bowls
   - Meditation Pad

### Quick Presets

Pre-configured soundscapes for different scenarios:
- **Deep Focus**: Brown noise, ambient synth, stream, space drone
- **Calm Workspace**: Rain, soft piano, cafe ambience
- **Nature Retreat**: Forest sounds, wind chimes
- **Rain Study**: Rain, lo-fi beats, white noise
- **Meditation**: Ocean waves, Tibetan bowls
- **Custom**: Save your own configuration

### Advanced Features

- **Crossfade**: Smooth transitions when switching audio
- **Loop Control**: Enable/disable automatic looping
- **Adjustable Fade Duration**: Customize transition timing
- **Video Sync**: Coordinate audio with video playback
- **Local Storage**: Save custom presets

## Technical Architecture

### Web Audio API
Built on the powerful Web Audio API for professional-grade audio processing:
- **AudioContext**: Central audio processing graph
- **GainNode**: Individual and master volume control
- **AnalyserNode**: Real-time frequency analysis for visualization
- **MediaElementSource**: Integration with HTML5 audio elements
- **BufferSource**: Procedural noise generation

### Audio Processing Features
- Real-time procedural noise generation (white, pink, brown)
- Smooth volume ramping to prevent clicks
- Crossfade support for seamless transitions
- Looping buffer management
- Multi-source mixing with independent control

### Project Structure
```
/New-Focus-Prototypes/
├── index.html          # Main HTML structure
├── styles.css          # Complete styling and responsive design
├── audio-engine.js     # Web Audio API engine
├── app.js              # Application controller
├── assets/             # Audio files (to be added)
│   ├── audio/
│   │   ├── nature/
│   │   ├── music/
│   │   ├── noise/
│   │   └── ambient/
│   └── sample-video.mp4
└── README.md           # This file
```

## Getting Started

### Prerequisites
- Modern web browser with Web Audio API support
  - Chrome 34+
  - Firefox 25+
  - Safari 14.1+
  - Edge 79+

### Installation

1. Clone the repository:
```bash
git clone https://github.com/devloper-gazi/New-Focus-Prototypes.git
cd New-Focus-Prototypes
```

2. (Optional) Add your own audio files to the `assets/audio/` directory following this structure:
```
assets/
└── audio/
    ├── nature/
    │   ├── rain.mp3
    │   ├── forest.mp3
    │   ├── ocean.mp3
    │   ├── stream.mp3
    │   └── birds.mp3
    ├── music/
    │   ├── piano.mp3
    │   ├── ambient.mp3
    │   ├── guitar.mp3
    │   ├── strings.mp3
    │   └── lofi.mp3
    ├── noise/
    │   ├── fan.mp3
    │   └── cafe.mp3
    └── ambient/
        ├── space.mp3
        ├── temple.mp3
        ├── wind.mp3
        ├── tibetan.mp3
        └── meditation.mp3
```

3. Serve the files using a local web server:

**Using Python:**
```bash
python -m http.server 8000
```

**Using Node.js (http-server):**
```bash
npx http-server -p 8000
```

**Using PHP:**
```bash
php -S localhost:8000
```

4. Open your browser and navigate to:
```
http://localhost:8000
```

## Usage Guide

### Basic Operation

1. **Initialize Audio**: Click "Play All Layers" or any individual layer's play button
   - First interaction initializes the Web Audio API context

2. **Select Audio**: Choose audio from dropdowns for each layer

3. **Adjust Volumes**: Use sliders to control individual layer volumes

4. **Master Volume**: Control overall output level

5. **Toggle Layers**: Play/pause individual layers independently

### Using Presets

Click any preset button to instantly load a pre-configured soundscape:
- All layer volumes are set automatically
- Appropriate audio is selected and started
- Active preset is highlighted

### Saving Custom Presets

1. Configure your perfect soundscape
2. Click "Save Custom" in the presets section
3. Your configuration is saved to browser localStorage
4. Access it anytime by clicking "Custom" preset

### Advanced Settings

Open the "Advanced Settings" section to configure:
- **Sync with Video Playback**: Audio responds to video play/pause
- **Enable Crossfade**: Smooth transitions between audio
- **Fade Duration**: Adjust transition timing (100-5000ms)
- **Loop Audio Layers**: Continuous playback

### Video Integration

1. Replace `assets/sample-video.mp4` with your video file
2. Enable "Sync with Video Playback" in settings
3. Video and audio layers work in harmony

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Web Audio API | ✅ 34+ | ✅ 25+ | ✅ 14.1+ | ✅ 79+ |
| AudioContext | ✅ | ✅ | ✅ | ✅ |
| MediaElementSource | ✅ | ✅ | ✅ | ✅ |
| AnalyserNode | ✅ | ✅ | ✅ | ✅ |
| Canvas Visualization | ✅ | ✅ | ✅ | ✅ |

## Development

### Code Structure

**audio-engine.js**: Core audio processing
- `AudioEngine` class manages all Web Audio API interactions
- Layer creation and management
- Noise generation algorithms
- Volume control and crossfading
- Visualization data extraction

**app.js**: Application logic
- UI event handling
- Layer state management
- Preset system
- Video synchronization
- Visualization rendering

**styles.css**: Complete styling
- Responsive design
- Dark theme optimized for focus
- Smooth animations and transitions
- Accessible controls

### Extending the Application

**Adding New Audio:**
1. Place audio files in appropriate `assets/audio/` subdirectory
2. Update `audioLibrary` in `audio-engine.js`
3. Add option to corresponding select element in `index.html`

**Creating New Presets:**
1. Define preset configuration in `app.js` presets object
2. Add preset button in HTML
3. Button automatically wired through event delegation

**Customizing Noise Generation:**
Modify noise algorithms in `audio-engine.js`:
- `createNoiseBuffer()` method
- Adjust filter coefficients for different characteristics

## Performance Considerations

- **Low CPU Usage**: Efficient Web Audio API graph
- **Optimized Visualization**: RequestAnimationFrame for smooth rendering
- **Memory Management**: Proper cleanup of audio resources
- **Buffer Reuse**: Noise buffers generated once and reused

## Troubleshooting

### Audio Not Playing
- Check browser console for errors
- Ensure user interaction occurred (Web Audio API requirement)
- Verify audio file paths are correct
- Check browser audio permissions

### No Visualization
- Verify layer is actively playing
- Check canvas element rendering
- Ensure analyser node is connected

### Performance Issues
- Reduce number of active layers
- Lower visualization update rate
- Check for browser extensions blocking content

### Video Won't Load
- Verify video file path
- Check video codec support
- Ensure proper MIME type configuration

## Future Enhancements

Potential features for future development:
- [ ] Audio recording and export
- [ ] Equalizer controls per layer
- [ ] Spatial audio (panning, 3D positioning)
- [ ] More sophisticated visualizations (FFT, spectrum)
- [ ] Cloud-based preset sharing
- [ ] Mobile app version
- [ ] MIDI controller support
- [ ] Binaural beats generation
- [ ] Timer and session management
- [ ] Integration with productivity tools

## Contributing

Contributions are welcome! Areas for improvement:
- Additional audio content
- New preset configurations
- Enhanced visualizations
- Accessibility improvements
- Performance optimizations
- Bug fixes

## License

MIT License - see LICENSE file for details

## Credits

Built with:
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- HTML5 Canvas for visualizations
- Modern CSS Grid and Flexbox
- Vanilla JavaScript (no frameworks required)

## Resources

- [Web Audio API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Web Audio API Specification](https://www.w3.org/TR/webaudio/)
- [Audio Processing Examples](https://github.com/mdn/webaudio-examples)

---

**Happy focusing! 🎵**
