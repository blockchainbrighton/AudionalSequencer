// audioTrimModule_v3.js

class AudioTrimmer {
    constructor(channelIndex) {
        this.channelIndex = channelIndex;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffer = null;
        this.isPlaying = false;
        this.isLooping = false;
        this.trimSettings = getTrimSettings(this.channelIndex);
        this.initializeElements();
    }

    async initializeElements() {
        const elementIds = [
            'ordinalIdInput', 'loadSampleButton', 'waveformCanvas', 
            'playbackCanvas', 'playButton', 'stopButton', 'loopButton', 
            'startDimmed', 'endDimmed', 'startSlider', 'endSlider'
        ];

        for (const id of elementIds) {
            this[id] = document.getElementById(id);
            if (!this[id]) {
                console.error(`[AudioTrimmer] Element not found: ${id}`);
                return;
            }
        }

        this.ctx = this.waveformCanvas.getContext('2d');
        this.addEventListeners();
        this.setInitialSliderValues();
    }

    setInitialSliderValues() {
        const { startSliderValue, endSliderValue, isLooping } = getTrimSettings(this.channelIndex);
        this.startSlider.value = startSliderValue;
        this.endSlider.value = endSliderValue;
        this.isLooping = isLooping;
        this.updateLoopButtonState();
        this.updateDimmedAreas();
    }

    setAudioBuffer(audioBuffer) {
        this.audioBuffer = audioBuffer;
        this.drawWaveform();
        this.updateDimmedAreas();
    }

    drawWaveform() {
        if (!this.audioBuffer) return;
        const { width, height } = this.waveformCanvas;
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
            min = Math.min(min, datum);
            max = Math.max(max, datum);
        }
        return { min, max };
    }

    updateDimmedAreas() {
        this.setDimmedWidth(this.startDimmed, parseFloat(this.startSlider.value));
        this.setDimmedWidth(this.endDimmed, 100 - parseFloat(this.endSlider.value));
    }

    setDimmedWidth(element, value) {
        element.style.width = `${value}%`;
        element.style.left = element === this.endDimmed ? `${100 - value}%` : '0';
    }

    addEventListeners() {
        this.loadSampleButton.addEventListener('click', this.loadSample.bind(this));
        this.playButton.addEventListener('click', this.playTrimmedAudio.bind(this));
        this.stopButton.addEventListener('click', this.stopAudio.bind(this));
        this.loopButton.addEventListener('click', this.toggleLoop.bind(this));
        this.startSlider.addEventListener('input', this.onSliderInput.bind(this, 'start'));
        this.endSlider.addEventListener('input', this.onSliderInput.bind(this, 'end'));
    }

    onSliderInput(sliderType) {
        this.updateSliderValues();
        setTrimSettings(this.channelIndex, this.startSlider.value, this.endSlider.value);
    }
    
    updateSliderValues() {
        this.updateDimmedAreas();
        this.updateTrimmedSampleDuration();
        this.debounceDisplayValues();
    }

    updateTrimmedSampleDuration() {
        const startValue = parseFloat(this.startSlider.value);
        const endValue = parseFloat(this.endSlider.value);
        this.trimmedSampleDuration = Math.max(0, endValue - startValue);
        this.debounceDisplayValues();
    }

    // Method to debounce the display of values
    debounceDisplayValues() {
        clearTimeout(this.displayTimeout);
        this.displayTimeout = setTimeout(() => this.displayValues(), 300);
    }

    // Method to display values (for debugging or UI update)
    displayValues() {
        console.log("Start Slider Value:", this.startSlider.value);
        console.log("End Slider Value:", this.endSlider.value);
        console.log("Trimmed Sample Duration:", this.trimmedSampleDuration);
    }

    async loadSample() {
        if (!this.ordinalIdInput.value) return;
        try {
            const audioBuffer = await fetchAudio(`https://ordinals.com/content/${this.ordinalIdInput.value}`);
            this.setAudioBuffer(audioBuffer);
        } catch (error) {
            console.error('Error loading audio:', error);
        }
    }

    playTrimmedAudio() {
        if (!this.audioBuffer) {
            console.error("No audio buffer loaded");
            return;
        }

        const startTime = this.sliderValueToTimecode(this.startSlider.value);
        const endTime = this.sliderValueToTimecode(this.endSlider.value);

        this.sourceNode = this.audioContext.createBufferSource();
        this.sourceNode.buffer = this.audioBuffer;
        this.sourceNode.connect(this.audioContext.destination);
        this.sourceNode.loop = this.isLooping;
        if (this.isLooping) {
            this.sourceNode.loopStart = startTime;
            this.sourceNode.loopEnd = endTime;
        }

        this.sourceNode.start(0, startTime, endTime - startTime);
        this.isPlaying = true;
        this.sourceNode.onended = () => this.onAudioEnded();
    }

    onAudioEnded() {
        this.isPlaying = false;
        if (this.isLooping) {
            this.playTrimmedAudio();
        }
    }

    stopAudio() {
        if (this.isPlaying && this.sourceNode) {
            this.sourceNode.stop();
            this.sourceNode.disconnect();
            this.sourceNode = null;
            this.isPlaying = false;
        }
        this.isLooping = false;
    }

    toggleLoop() {
        this.isLooping = !this.isLooping;
        this.updateLoopButtonState();
    }

    updateLoopButtonState() {
        if (this.loopButton) {
            this.loopButton.classList.toggle('on', this.isLooping);
            this.loopButton.classList.toggle('off', !this.isLooping);
        }
    }

    sliderValueToTimecode(sliderValue) {
        return (parseFloat(sliderValue) / 100) * this.audioBuffer.duration;
    }

    getCurrentPlaybackPosition() {
        if (!this.isPlaying) return 0;
        return (this.audioContext.currentTime - this.startTime) % this.audioBuffer.duration;
    }

    updatePlaybackCanvas() {
        if (!this.isPlaying || !this.audioBuffer) return;

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

        requestAnimationFrame(() => this.updatePlaybackCanvas());
    }
}

