/**
 * Multi-Layer Audio Engine
 * Built with Web Audio API for sophisticated audio mixing and control
 */

class AudioEngine {
    constructor() {
        this.audioContext = null;
        this.masterGain = null;
        this.layers = new Map();
        this.isInitialized = false;
        this.noiseGenerators = new Map();

        // Configuration
        this.config = {
            fadeDuration: 1.0,
            enableCrossfade: true,
            loopLayers: true,
            sampleRate: 44100
        };

        // Audio file paths mapping
        this.audioLibrary = {
            nature: {
                rain: 'assets/audio/nature/rain.mp3',
                forest: 'assets/audio/nature/forest.mp3',
                ocean: 'assets/audio/nature/ocean.mp3',
                stream: 'assets/audio/nature/stream.mp3',
                birds: 'assets/audio/nature/birds.mp3'
            },
            music: {
                piano: 'assets/audio/music/piano.mp3',
                ambient: 'assets/audio/music/ambient.mp3',
                guitar: 'assets/audio/music/guitar.mp3',
                strings: 'assets/audio/music/strings.mp3',
                lofi: 'assets/audio/music/lofi.mp3'
            },
            noise: {
                white: null, // Generated
                pink: null,  // Generated
                brown: null, // Generated
                fan: 'assets/audio/noise/fan.mp3',
                cafe: 'assets/audio/noise/cafe.mp3'
            },
            ambient: {
                space: 'assets/audio/ambient/space.mp3',
                temple: 'assets/audio/ambient/temple.mp3',
                wind: 'assets/audio/ambient/wind.mp3',
                tibetan: 'assets/audio/ambient/tibetan.mp3',
                meditation: 'assets/audio/ambient/meditation.mp3'
            }
        };
    }

    /**
     * Initialize the Audio Context and master gain node
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Create AudioContext
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // Create master gain node
            this.masterGain = this.audioContext.createGain();
            this.masterGain.connect(this.audioContext.destination);
            this.masterGain.gain.value = 0.7;

            this.isInitialized = true;
            console.log('Audio Engine initialized successfully');

            return true;
        } catch (error) {
            console.error('Failed to initialize audio engine:', error);
            throw error;
        }
    }

    /**
     * Resume audio context (required for user interaction)
     */
    async resume() {
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }
    }

    /**
     * Create a new audio layer
     */
    createLayer(layerId, volume = 0.6) {
        if (!this.isInitialized) {
            throw new Error('Audio engine not initialized');
        }

        if (this.layers.has(layerId)) {
            console.warn(`Layer ${layerId} already exists`);
            return this.layers.get(layerId);
        }

        const layer = {
            id: layerId,
            audioElement: null,
            sourceNode: null,
            gainNode: this.audioContext.createGain(),
            analyserNode: this.audioContext.createAnalyser(),
            currentSound: null,
            isPlaying: false,
            volume: volume,
            noiseBuffer: null,
            noiseSource: null
        };

        // Configure analyser for visualization
        layer.analyserNode.fftSize = 256;
        layer.analyserNode.smoothingTimeConstant = 0.8;

        // Set initial volume
        layer.gainNode.gain.value = volume;

        // Connect nodes: source -> gain -> analyser -> master
        layer.gainNode.connect(layer.analyserNode);
        layer.analyserNode.connect(this.masterGain);

        this.layers.set(layerId, layer);
        console.log(`Created layer: ${layerId}`);

        return layer;
    }

    /**
     * Load and play audio for a specific layer
     */
    async loadAndPlayAudio(layerId, soundType, soundName) {
        await this.resume();

        const layer = this.layers.get(layerId);
        if (!layer) {
            throw new Error(`Layer ${layerId} not found`);
        }

        // Stop current audio if playing
        this.stopLayer(layerId);

        // Check if this is a generated noise
        if (soundType === 'noise' && ['white', 'pink', 'brown'].includes(soundName)) {
            await this.generateAndPlayNoise(layerId, soundName);
            return;
        }

        // Get audio file path
        const audioPath = this.audioLibrary[soundType]?.[soundName];
        if (!audioPath) {
            console.error(`Audio not found: ${soundType}/${soundName}`);
            // Generate a simple tone as fallback
            this.generateTone(layerId, 220); // A3 note
            return;
        }

        try {
            // Create audio element
            const audio = new Audio(audioPath);
            audio.loop = this.config.loopLayers;
            audio.crossOrigin = 'anonymous';

            // Create media element source
            const source = this.audioContext.createMediaElementSource(audio);
            source.connect(layer.gainNode);

            layer.audioElement = audio;
            layer.sourceNode = source;
            layer.currentSound = `${soundType}/${soundName}`;

            // Apply fade in if crossfade is enabled
            if (this.config.enableCrossfade) {
                this.fadeIn(layerId);
            }

            await audio.play();
            layer.isPlaying = true;

            console.log(`Playing audio: ${layer.currentSound} on layer ${layerId}`);
        } catch (error) {
            console.error(`Error loading audio for ${layerId}:`, error);
            // Fallback to tone generation
            this.generateTone(layerId, 220);
        }
    }

    /**
     * Generate and play noise (white, pink, brown)
     */
    async generateAndPlayNoise(layerId, noiseType) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        // Generate noise buffer if not already generated
        if (!this.noiseGenerators.has(noiseType)) {
            const buffer = this.createNoiseBuffer(noiseType);
            this.noiseGenerators.set(noiseType, buffer);
        }

        const noiseBuffer = this.noiseGenerators.get(noiseType);

        // Create buffer source
        const source = this.audioContext.createBufferSource();
        source.buffer = noiseBuffer;
        source.loop = true;
        source.connect(layer.gainNode);

        layer.noiseSource = source;
        layer.sourceNode = source;
        layer.currentSound = `noise/${noiseType}`;
        layer.isPlaying = true;

        // Apply fade in
        if (this.config.enableCrossfade) {
            this.fadeIn(layerId);
        }

        source.start(0);
        console.log(`Playing ${noiseType} noise on layer ${layerId}`);
    }

    /**
     * Create noise buffer (white, pink, or brown)
     */
    createNoiseBuffer(noiseType) {
        const bufferSize = this.audioContext.sampleRate * 2; // 2 seconds
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        if (noiseType === 'white') {
            // White noise - equal power across frequencies
            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }
        } else if (noiseType === 'pink') {
            // Pink noise - 1/f power spectrum
            let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                b0 = 0.99886 * b0 + white * 0.0555179;
                b1 = 0.99332 * b1 + white * 0.0750759;
                b2 = 0.96900 * b2 + white * 0.1538520;
                b3 = 0.86650 * b3 + white * 0.3104856;
                b4 = 0.55000 * b4 + white * 0.5329522;
                b5 = -0.7616 * b5 - white * 0.0168980;
                data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
                b6 = white * 0.115926;
            }
        } else if (noiseType === 'brown') {
            // Brown noise - 1/f² power spectrum
            let lastOut = 0.0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                data[i] = (lastOut + (0.02 * white)) / 1.02;
                lastOut = data[i];
                data[i] *= 3.5; // Compensate for volume drop
            }
        }

        return buffer;
    }

    /**
     * Generate a simple tone (fallback)
     */
    generateTone(layerId, frequency = 440) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.value = frequency;
        oscillator.connect(layer.gainNode);

        layer.sourceNode = oscillator;
        layer.currentSound = `tone/${frequency}Hz`;
        layer.isPlaying = true;

        oscillator.start();
        console.log(`Playing fallback tone: ${frequency}Hz on layer ${layerId}`);
    }

    /**
     * Stop a specific layer
     */
    stopLayer(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        // Apply fade out if crossfade is enabled
        if (this.config.enableCrossfade && layer.isPlaying) {
            this.fadeOut(layerId, () => {
                this._stopLayerImmediately(layerId);
            });
        } else {
            this._stopLayerImmediately(layerId);
        }
    }

    /**
     * Immediately stop layer without fade
     */
    _stopLayerImmediately(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        if (layer.audioElement) {
            layer.audioElement.pause();
            layer.audioElement.currentTime = 0;
            layer.audioElement = null;
        }

        if (layer.noiseSource) {
            try {
                layer.noiseSource.stop();
            } catch (e) {
                // Already stopped
            }
            layer.noiseSource = null;
        }

        if (layer.sourceNode && layer.sourceNode.stop) {
            try {
                layer.sourceNode.stop();
            } catch (e) {
                // Already stopped
            }
        }

        layer.sourceNode = null;
        layer.currentSound = null;
        layer.isPlaying = false;

        console.log(`Stopped layer: ${layerId}`);
    }

    /**
     * Fade in effect
     */
    fadeIn(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        const currentTime = this.audioContext.currentTime;
        const targetVolume = layer.volume;

        layer.gainNode.gain.cancelScheduledValues(currentTime);
        layer.gainNode.gain.setValueAtTime(0, currentTime);
        layer.gainNode.gain.linearRampToValueAtTime(
            targetVolume,
            currentTime + this.config.fadeDuration
        );
    }

    /**
     * Fade out effect
     */
    fadeOut(layerId, callback) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        const currentTime = this.audioContext.currentTime;

        layer.gainNode.gain.cancelScheduledValues(currentTime);
        layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, currentTime);
        layer.gainNode.gain.linearRampToValueAtTime(
            0,
            currentTime + this.config.fadeDuration
        );

        if (callback) {
            setTimeout(callback, this.config.fadeDuration * 1000);
        }
    }

    /**
     * Set layer volume
     */
    setLayerVolume(layerId, volume) {
        const layer = this.layers.get(layerId);
        if (!layer) return;

        layer.volume = volume;

        if (layer.isPlaying) {
            const currentTime = this.audioContext.currentTime;
            layer.gainNode.gain.cancelScheduledValues(currentTime);
            layer.gainNode.gain.setValueAtTime(layer.gainNode.gain.value, currentTime);
            layer.gainNode.gain.linearRampToValueAtTime(volume, currentTime + 0.05);
        } else {
            layer.gainNode.gain.value = volume;
        }
    }

    /**
     * Set master volume
     */
    setMasterVolume(volume) {
        if (!this.masterGain) return;

        const currentTime = this.audioContext.currentTime;
        this.masterGain.gain.cancelScheduledValues(currentTime);
        this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, currentTime);
        this.masterGain.gain.linearRampToValueAtTime(volume, currentTime + 0.05);
    }

    /**
     * Get analyser data for visualization
     */
    getAnalyserData(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer || !layer.isPlaying) return null;

        const bufferLength = layer.analyserNode.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        layer.analyserNode.getByteTimeDomainData(dataArray);

        return dataArray;
    }

    /**
     * Stop all layers
     */
    stopAll() {
        this.layers.forEach((layer, layerId) => {
            if (layer.isPlaying) {
                this.stopLayer(layerId);
            }
        });
    }

    /**
     * Play all active layers
     */
    playAll() {
        this.layers.forEach((layer, layerId) => {
            if (layer.currentSound && !layer.isPlaying) {
                const [soundType, soundName] = layer.currentSound.split('/');
                this.loadAndPlayAudio(layerId, soundType, soundName);
            }
        });
    }

    /**
     * Get layer info
     */
    getLayerInfo(layerId) {
        const layer = this.layers.get(layerId);
        if (!layer) return null;

        return {
            id: layer.id,
            isPlaying: layer.isPlaying,
            currentSound: layer.currentSound,
            volume: layer.volume
        };
    }

    /**
     * Get all active layers count
     */
    getActiveLayersCount() {
        let count = 0;
        this.layers.forEach(layer => {
            if (layer.isPlaying) count++;
        });
        return count;
    }

    /**
     * Update configuration
     */
    updateConfig(config) {
        this.config = { ...this.config, ...config };

        // Update looping for all audio elements
        if (config.loopLayers !== undefined) {
            this.layers.forEach(layer => {
                if (layer.audioElement) {
                    layer.audioElement.loop = config.loopLayers;
                }
            });
        }
    }

    /**
     * Dispose of audio engine
     */
    dispose() {
        this.stopAll();

        if (this.audioContext) {
            this.audioContext.close();
        }

        this.layers.clear();
        this.noiseGenerators.clear();
        this.isInitialized = false;

        console.log('Audio engine disposed');
    }
}

// Export for use in main app
window.AudioEngine = AudioEngine;
