// audioTrimModule.js
// Assuming fetchAudio, setTrimSettingsForChannel, getTrimSettingsForChannel, and playSound are imported from their respective modules

class AudioTrimmer {
    constructor() {
        this.channelIndex = channelIndex;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffer = null;
        this.isPlaying = false;
        this.isLooping = false;
        this.trimSettings = getTrimSettings(this.channelIndex);
    }

    async initialize() {
        ['ordinalIdInput', 'loadSampleButton', 'waveformCanvas', 'playbackCanvas', 'playButton', 'stopButton', 'loopButton', 'startDimmed', 'endDimmed']
            .forEach(id => this[id] = document.getElementById(id));
        this.ctx = this.waveformCanvas.getContext('2d');
        this.addEventListeners();
        this.updateDimmedAreas();
    }

    addEventListeners() {
        this.loadSampleButton.addEventListener('click', () => this.loadSample());
        this.playButton.addEventListener('click', () => this.playAudio());
        this.stopButton.addEventListener('click', () => this.stopAudio());
        this.loopButton.addEventListener('click', () => this.toggleLoop());
    }

    async loadSample() {
        if (!this.ordinalIdInput.value) return;
        try {
            this.audioBuffer = await fetchAudio(`https://ordinals.com/content/${this.ordinalIdInput.value}`);
            this.trimSettings = getTrimSettings(this.channelIndex);
            this.drawWaveform();
            this.updateDimmedAreas();
        } catch (error) {
            console.error('Error loading audio:', error);
        }
    }

    drawWaveform() {
        if (!this.audioBuffer) return;
        const width = this.waveformCanvas.width;
        const height = this.waveformCanvas.height;
        const channelData = this.audioBuffer.getChannelData(0);
        const step = Math.ceil(channelData.length / width);
        const amp = height / 2;
        this.ctx.clearRect(0, 0, width, height);
        this.ctx.beginPath();
        
        for (let i = 0; i < width; i++) {
            const { min, max } = this.getMinMax(channelData, i * step, step);
            this.ctx.moveTo(i, amp * (1 + min));
            this.ctx.lineTo(i, amp * (1 + max));
        }
        
        this.ctx.stroke();
        }
        
        getMinMax(channelData, startIndex, step) {
        let min = 1.0, max = -1.0;
        for (let i = 0; i < step; i++) {
            const datum = channelData[startIndex + i];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        return { min, max };
        }

        updateSliderValues() {
            this.startSliderValue = parseFloat(this.startSlider.value);
            this.endSliderValue = parseFloat(this.endSlider.value);
            this.updateDimmedAreas(); // This will update the dimmed areas based on the sliders
            this.updateTrimmedSampleDuration();
            this.debounceDisplayValues();
        }
    
        // Method to get the current value of the start slider
        getStartSliderValue() {
            return this.startSliderValue;
        }
    
        // Method to get the current value of the end slider
        getEndSliderValue() {
            return this.endSliderValue;
        }
    
         // Method to get the current value of the isLooping flag
         getIsLooping() {
            return this.isLooping;
        }
        

    playAudio() {
        playSound(this.audioBuffer, this.trimSettings.start, this.trimSettings.end, this.isLooping);
    }

    stopAudio() {
        if (this.isPlaying && this.sourceNode) {
            this.sourceNode.stop(); // Stop the audio playback
            this.sourceNode.disconnect();
            this.sourceNode = null;
            this.isPlaying = false;
        }
        this.isLooping = false;
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.loopButton.classList.toggle('on', this.isLooping);
        this.loopButton.classList.toggle('off', !this.isLooping);
    }

    updateDimmedAreas() {
        const maxDuration = this.audioBuffer ? this.audioBuffer.duration : 100;
        const startDimmedWidth = `${this.trimSettings.start / maxDuration * 100}%`;
        const endDimmedWidth = `${(1 - this.trimSettings.end / maxDuration) * 100}%`;
        const endDimmedLeft = `${this.trimSettings.end / maxDuration * 100}%`;

        this.startDimmed.style.width = startDimmedWidth;
        this.startDimmed.style.left = '0';
        this.endDimmed.style.width = endDimmedWidth;
        this.endDimmed.style.left = endDimmedLeft;
    }



    getCurrentPlaybackPosition() {
        if (!this.isPlaying) return 0;
        return (this.audioContext.currentTime - this.startTime) % this.audioBuffer.duration;
        }
        
    updatePlaybackCanvas() {
        const currentPosition = this.getCurrentPlaybackPosition();
        const width = this.playbackCanvas.width;
        const height = this.playbackCanvas.height;
        this.playbackCtx.clearRect(0, 0, width, height);
        const xPosition = (currentPosition / this.audioBuffer.duration) * width;
        this.playbackCtx.beginPath();
        this.playbackCtx.moveTo(xPosition, 0);
        this.playbackCtx.lineTo(xPosition, height);
        this.playbackCtx.strokeStyle = '#FF0000';
        this.playbackCtx.lineWidth = 2;
        this.playbackCtx.stroke();
        }
        
        animatePlayback() {
        if (this.isPlaying) {
            this.updatePlaybackCanvas();
            requestAnimationFrame(() => this.animatePlayback());
        }
    }
}