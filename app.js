/**
 * Multi-Layer Audio Generator Application
 * Main application controller
 */

class AudioGeneratorApp {
    constructor() {
        this.audioEngine = null;
        this.videoElement = null;
        this.layers = ['nature', 'music', 'noise', 'ambient'];
        this.currentPreset = null;
        this.animationFrameId = null;

        // Preset configurations
        this.presets = {
            'deep-focus': {
                nature: { sound: 'stream', volume: 0.3 },
                music: { sound: 'ambient', volume: 0.5 },
                noise: { sound: 'brown', volume: 0.4 },
                ambient: { sound: 'space', volume: 0.2 }
            },
            'calm-workspace': {
                nature: { sound: 'rain', volume: 0.4 },
                music: { sound: 'piano', volume: 0.3 },
                noise: { sound: 'cafe', volume: 0.3 },
                ambient: { sound: null, volume: 0 }
            },
            'nature-retreat': {
                nature: { sound: 'forest', volume: 0.6 },
                music: { sound: null, volume: 0 },
                noise: { sound: null, volume: 0 },
                ambient: { sound: 'wind', volume: 0.4 }
            },
            'rain-study': {
                nature: { sound: 'rain', volume: 0.7 },
                music: { sound: 'lofi', volume: 0.4 },
                noise: { sound: 'white', volume: 0.2 },
                ambient: { sound: null, volume: 0 }
            },
            'meditation': {
                nature: { sound: 'ocean', volume: 0.3 },
                music: { sound: null, volume: 0 },
                noise: { sound: null, volume: 0 },
                ambient: { sound: 'tibetan', volume: 0.5 }
            }
        };

        this.init();
    }

    /**
     * Initialize the application
     */
    async init() {
        console.log('Initializing Multi-Layer Audio Generator...');

        // Initialize audio engine
        this.audioEngine = new AudioEngine();

        // Set up event listeners
        this.setupEventListeners();

        // Initialize status display
        this.updateStatus();

        // Set up visualization loop
        this.startVisualization();

        console.log('Application initialized. Click "Play All Layers" to start.');
    }

    /**
     * Set up all event listeners
     */
    setupEventListeners() {
        // Master controls
        document.getElementById('playAllBtn').addEventListener('click', () => this.handlePlayAll());
        document.getElementById('stopAllBtn').addEventListener('click', () => this.handleStopAll());

        // Master volume
        const masterVolume = document.getElementById('masterVolume');
        masterVolume.addEventListener('input', (e) => this.handleMasterVolumeChange(e));

        // Video element
        this.videoElement = document.getElementById('mainVideo');
        this.videoElement.addEventListener('play', () => this.handleVideoPlay());
        this.videoElement.addEventListener('pause', () => this.handleVideoPause());

        // Layer controls
        this.layers.forEach(layerId => {
            const layerElement = document.querySelector(`[data-layer="${layerId}"]`);

            // Toggle button
            const toggleBtn = layerElement.querySelector('.btn-toggle');
            toggleBtn.addEventListener('click', () => this.handleLayerToggle(layerId));

            // Audio select
            const audioSelect = layerElement.querySelector('.audio-select');
            audioSelect.addEventListener('change', (e) => this.handleAudioSelect(layerId, e));

            // Volume slider
            const volumeSlider = layerElement.querySelector('.volume-slider');
            volumeSlider.addEventListener('input', (e) => this.handleLayerVolumeChange(layerId, e));
        });

        // Presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const preset = e.currentTarget.dataset.preset;
                if (preset === 'custom') {
                    this.saveCustomPreset();
                } else {
                    this.loadPreset(preset);
                }
            });
        });

        // Settings
        document.getElementById('syncVideo').addEventListener('change', (e) => {
            this.updateVideoSync(e.target.checked);
        });

        document.getElementById('crossfade').addEventListener('change', (e) => {
            this.audioEngine.updateConfig({ enableCrossfade: e.target.checked });
        });

        document.getElementById('fadeDuration').addEventListener('change', (e) => {
            const duration = parseFloat(e.target.value) / 1000;
            this.audioEngine.updateConfig({ fadeDuration: duration });
        });

        document.getElementById('loopLayers').addEventListener('change', (e) => {
            this.audioEngine.updateConfig({ loopLayers: e.target.checked });
        });
    }

    /**
     * Handle Play All button
     */
    async handlePlayAll() {
        try {
            // Initialize audio engine if not already done
            if (!this.audioEngine.isInitialized) {
                await this.audioEngine.initialize();
                this.updateStatus();
            }

            // Initialize layers if not created
            this.layers.forEach(layerId => {
                if (!this.audioEngine.layers.has(layerId)) {
                    const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
                    const volumeSlider = layerElement.querySelector('.volume-slider');
                    const volume = parseFloat(volumeSlider.value) / 100;
                    this.audioEngine.createLayer(layerId, volume);
                }
            });

            // Play all layers that have audio selected
            this.layers.forEach(layerId => {
                const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
                const audioSelect = layerElement.querySelector('.audio-select');
                const selectedSound = audioSelect.value;

                if (selectedSound) {
                    this.playLayer(layerId, layerId, selectedSound);
                }
            });

            this.updateStatus();
        } catch (error) {
            console.error('Error playing all layers:', error);
            alert('Failed to start audio. Please check your browser permissions.');
        }
    }

    /**
     * Handle Stop All button
     */
    handleStopAll() {
        this.audioEngine.stopAll();

        // Update UI
        this.layers.forEach(layerId => {
            const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
            layerElement.classList.remove('active');

            const toggleBtn = layerElement.querySelector('.btn-toggle');
            toggleBtn.classList.remove('playing');
            toggleBtn.querySelector('.icon').textContent = '▶';
        });

        this.updateStatus();
    }

    /**
     * Handle layer toggle
     */
    async handleLayerToggle(layerId) {
        try {
            // Initialize audio engine if needed
            if (!this.audioEngine.isInitialized) {
                await this.audioEngine.initialize();
                this.updateStatus();
            }

            // Create layer if it doesn't exist
            if (!this.audioEngine.layers.has(layerId)) {
                const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
                const volumeSlider = layerElement.querySelector('.volume-slider');
                const volume = parseFloat(volumeSlider.value) / 100;
                this.audioEngine.createLayer(layerId, volume);
            }

            const layerInfo = this.audioEngine.getLayerInfo(layerId);
            const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
            const audioSelect = layerElement.querySelector('.audio-select');
            const selectedSound = audioSelect.value;

            if (layerInfo.isPlaying) {
                // Stop the layer
                this.audioEngine.stopLayer(layerId);
                this.updateLayerUI(layerId, false);
            } else {
                // Play the layer
                if (selectedSound) {
                    this.playLayer(layerId, layerId, selectedSound);
                } else {
                    alert('Please select an audio first');
                }
            }

            this.updateStatus();
        } catch (error) {
            console.error(`Error toggling layer ${layerId}:`, error);
            alert('Failed to toggle audio layer. Please try again.');
        }
    }

    /**
     * Play a specific layer
     */
    async playLayer(layerId, soundType, soundName) {
        await this.audioEngine.loadAndPlayAudio(layerId, soundType, soundName);
        this.updateLayerUI(layerId, true);
        this.updateStatus();
    }

    /**
     * Update layer UI state
     */
    updateLayerUI(layerId, isPlaying) {
        const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
        const toggleBtn = layerElement.querySelector('.btn-toggle');

        if (isPlaying) {
            layerElement.classList.add('active');
            toggleBtn.classList.add('playing');
            toggleBtn.querySelector('.icon').textContent = '⏸';
        } else {
            layerElement.classList.remove('active');
            toggleBtn.classList.remove('playing');
            toggleBtn.querySelector('.icon').textContent = '▶';
        }
    }

    /**
     * Handle audio selection change
     */
    handleAudioSelect(layerId, event) {
        const selectedSound = event.target.value;

        if (!selectedSound) return;

        // If the layer is currently playing, switch to new audio
        const layerInfo = this.audioEngine.getLayerInfo(layerId);
        if (layerInfo && layerInfo.isPlaying) {
            this.playLayer(layerId, layerId, selectedSound);
        }
    }

    /**
     * Handle layer volume change
     */
    handleLayerVolumeChange(layerId, event) {
        const volume = parseFloat(event.target.value) / 100;
        const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
        const volumeValue = layerElement.querySelector('.volume-value');

        volumeValue.textContent = `${event.target.value}%`;

        if (this.audioEngine.layers.has(layerId)) {
            this.audioEngine.setLayerVolume(layerId, volume);
        }
    }

    /**
     * Handle master volume change
     */
    handleMasterVolumeChange(event) {
        const volume = parseFloat(event.target.value) / 100;
        document.getElementById('masterVolumeValue').textContent = `${event.target.value}%`;

        if (this.audioEngine.isInitialized) {
            this.audioEngine.setMasterVolume(volume);
        }
    }

    /**
     * Handle video play
     */
    handleVideoPlay() {
        const syncEnabled = document.getElementById('syncVideo').checked;
        if (syncEnabled && this.audioEngine.isInitialized) {
            // Resume audio context
            this.audioEngine.resume();
        }
    }

    /**
     * Handle video pause
     */
    handleVideoPause() {
        const syncEnabled = document.getElementById('syncVideo').checked;
        if (syncEnabled) {
            // Optionally pause audio layers
            // this.handleStopAll();
        }
    }

    /**
     * Update video sync setting
     */
    updateVideoSync(enabled) {
        console.log(`Video sync ${enabled ? 'enabled' : 'disabled'}`);
        // Additional sync logic can be added here
    }

    /**
     * Load a preset configuration
     */
    async loadPreset(presetName) {
        if (!this.presets[presetName]) {
            console.error(`Preset not found: ${presetName}`);
            return;
        }

        console.log(`Loading preset: ${presetName}`);

        const preset = this.presets[presetName];

        // Initialize audio engine if needed
        if (!this.audioEngine.isInitialized) {
            await this.audioEngine.initialize();
            this.updateStatus();
        }

        // Stop all current layers
        this.handleStopAll();

        // Apply preset to each layer
        for (const layerId of this.layers) {
            const config = preset[layerId];
            if (!config) continue;

            const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
            const audioSelect = layerElement.querySelector('.audio-select');
            const volumeSlider = layerElement.querySelector('.volume-slider');
            const volumeValue = layerElement.querySelector('.volume-value');

            // Set volume
            const volumePercent = Math.round(config.volume * 100);
            volumeSlider.value = volumePercent;
            volumeValue.textContent = `${volumePercent}%`;

            // Create layer with new volume
            if (!this.audioEngine.layers.has(layerId)) {
                this.audioEngine.createLayer(layerId, config.volume);
            } else {
                this.audioEngine.setLayerVolume(layerId, config.volume);
            }

            // Set audio selection and play if sound is specified
            if (config.sound) {
                audioSelect.value = config.sound;
                await this.playLayer(layerId, layerId, config.sound);
            } else {
                audioSelect.value = '';
            }
        }

        // Update preset UI
        this.currentPreset = presetName;
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.preset === presetName) {
                btn.classList.add('active');
            }
        });

        this.updateStatus();
    }

    /**
     * Save custom preset
     */
    saveCustomPreset() {
        const customPreset = {};

        this.layers.forEach(layerId => {
            const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
            const audioSelect = layerElement.querySelector('.audio-select');
            const volumeSlider = layerElement.querySelector('.volume-slider');

            customPreset[layerId] = {
                sound: audioSelect.value || null,
                volume: parseFloat(volumeSlider.value) / 100
            };
        });

        // Save to localStorage
        localStorage.setItem('audioGeneratorCustomPreset', JSON.stringify(customPreset));
        this.presets['custom'] = customPreset;

        alert('Custom preset saved successfully!');

        // Mark custom preset as active
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.preset === 'custom') {
                btn.classList.add('active');
            }
        });
    }

    /**
     * Start visualization loop
     */
    startVisualization() {
        const drawWaveform = (layerId) => {
            const layerElement = document.querySelector(`[data-layer="${layerId}"]`);
            const canvas = layerElement.querySelector('.waveform');
            const ctx = canvas.getContext('2d');

            const data = this.audioEngine.getAnalyserData(layerId);

            // Clear canvas
            ctx.fillStyle = 'rgb(51, 65, 85)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            if (data) {
                ctx.lineWidth = 2;
                ctx.strokeStyle = 'rgb(99, 102, 241)';
                ctx.beginPath();

                const sliceWidth = canvas.width / data.length;
                let x = 0;

                for (let i = 0; i < data.length; i++) {
                    const v = data[i] / 128.0;
                    const y = (v * canvas.height) / 2;

                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }

                    x += sliceWidth;
                }

                ctx.lineTo(canvas.width, canvas.height / 2);
                ctx.stroke();
            }
        };

        const animate = () => {
            this.layers.forEach(layerId => {
                drawWaveform(layerId);
            });

            this.animationFrameId = requestAnimationFrame(animate);
        };

        animate();
    }

    /**
     * Update status display
     */
    updateStatus() {
        const activeLayers = this.audioEngine.getActiveLayersCount();
        const isPlaying = activeLayers > 0;

        document.getElementById('activeLayers').textContent = activeLayers;
        document.getElementById('playbackStatus').textContent = isPlaying ? 'Playing' : 'Stopped';
        document.getElementById('audioContextStatus').textContent = this.audioEngine.isInitialized
            ? 'Initialized'
            : 'Not Initialized';
    }

    /**
     * Cleanup
     */
    dispose() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }

        if (this.audioEngine) {
            this.audioEngine.dispose();
        }
    }
}

// Initialize app when DOM is ready
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new AudioGeneratorApp();
});

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    if (app) {
        app.dispose();
    }
});
