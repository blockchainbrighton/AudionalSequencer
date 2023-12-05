// audioTrimModule.js

class AudioTrimmer {
    constructor(channelIndex) {
        console.log("[Class Functions] constructor", { channelIndex });

        this.channelIndex = channelIndex;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffer = null;
        this.isPlaying = false;
        this.isLooping = false;
        this.trimSettings = getTrimSettings(this.channelIndex);

        this.displayTimeout = null;

    }

      // Method to set the audio buffer and update the waveform
      setAudioBuffer(audioBuffer) {
        console.log("[Class Functions] setAudioBuffer", { audioBuffer });

        this.audioBuffer = audioBuffer;
        this.drawWaveform();
        this.updateDimmedAreas();
    }

    drawWaveform() {
        console.log("[Class Functions] drawWaveform");
        if (!this.audioBuffer) {
            console.log("[Class Functions] drawWaveform - No audio buffer");
            return;
        }
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

        async initialize() {
            console.log("[Class Functions] initialize");
        
            const elementIds = ['ordinalIdInput', 'loadSampleButton', 'waveformCanvas', 'playbackCanvas', 'playButton', 'stopButton', 'loopButton', 'startDimmed', 'endDimmed', 'startSlider', 'endSlider'];
            let allElementsAvailable = true;
        
            elementIds.forEach(id => {
                this[id] = document.getElementById(id);
                if (!this[id]) {
                    console.error(`[Class Functions] initialize - Element not found: ${id}`);
                    allElementsAvailable = false;
                }
            });
        
            if (allElementsAvailable) {
                this.ctx = this.waveformCanvas.getContext('2d');
                this.addEventListeners();
                this.updateDimmedAreas();
            } else {
                console.log("[Class Functions] initialize - Waiting for elements to be available");
                setTimeout(() => this.initialize(), 500); // Retry initialization after a delay
            }

            // Initialize slider values based on global settings
            const trimSettings = getTrimSettings(this.channelIndex);
            this.startSlider.value = trimSettings.startSliderValue;
            this.endSlider.value = trimSettings.endSliderValue;
            this.isLooping = trimSettings.isLooping;
            this.updateLoopButtonState();
            this.updateDimmedAreas();
        
        }
        
        updateDimmedAreas() {
            console.log("[Class Functions] updateDimmedAreas");
        
            const startSliderValue = parseFloat(this.startSlider.value);
            const endSliderValue = parseFloat(this.endSlider.value);
        
            const startDimmedWidth = `${startSliderValue}%`;
            const endDimmedWidth = `${100 - endSliderValue}%`;
        
            this.startDimmed.style.width = startDimmedWidth;
            this.startDimmed.style.left = '0';
            this.endDimmed.style.width = endDimmedWidth;
            this.endDimmed.style.left = `${endSliderValue}%`; // Position the end dimmed area correctly
        }
        
        updateSliderValues() {
            this.startSliderValue = parseFloat(this.startSlider.value);
            this.endSliderValue = parseFloat(this.endSlider.value);
            this.updateDimmedAreas(); // This will update the dimmed areas based on the sliders
            this.updateTrimmedSampleDuration();
            this.debounceDisplayValues();
        }

        updateTrimmedSampleDuration() {
            const startValue = this.startSliderValue;
            const endValue = this.endSliderValue;
            this.trimmedSampleDuration = Math.max(0, endValue - startValue);
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
    
        

    // Method to debounce the display of values
    debounceDisplayValues() {
        if (this.displayTimeout) {
            clearTimeout(this.displayTimeout);
        }
        this.displayTimeout = setTimeout(() => this.displayValues(), 300); // Adjust the delay as needed
    }

    // Method to display values (for debugging or UI update)
    displayValues() {
        console.log("Start Slider Value:", this.startSliderValue);
        console.log("End Slider Value:", this.endSliderValue);
        console.log("Trimmed Sample Duration:", this.trimmedSampleDuration);
        // Add any other values you wish to display
    }

  

        addEventListeners() {
            console.log("[Class Functions] addEventListeners");
        
            const elements = [
                { id: 'loadSampleButton', element: this.loadSampleButton },
                { id: 'playButton', element: this.playButton },
                { id: 'stopButton', element: this.stopButton },
                { id: 'loopButton', element: this.loopButton },
                { id: 'startSlider', element: this.startSlider },
                { id: 'endSlider', element: this.endSlider }
            ];
        
            elements.forEach(({ id, element }) => {
                if (element) {
                    console.log(`[Class Functions] addEventListeners - Found element: ${id}`);
                    if (id === 'startSlider' || id === 'endSlider') {
                        element.addEventListener('input', () => {
                            console.log(`[Class Functions] ${id} Input Changed`);
                            this.updateSliderValues();
                            setTrimSettings(this.channelIndex, this.startSliderValue, this.endSliderValue);
                        });
                    } else {
                        element.addEventListener('click', () => {
                            console.log(`[Class Functions] ${id} Clicked`);
                            this[id.replace('Button', '')](); // Calls the corresponding method
                        });
                    }
                } else {
                    console.error(`[Class Functions] addEventListeners - Element not found: ${id}`);
                }
            });
        }
        
      

    async loadSample() {
        console.log("[Class Functions] loadSample");

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

        
        getMinMax(channelData, startIndex, step) {
        let min = 1.0, max = -1.0;
        for (let i = 0; i < step; i++) {
            const datum = channelData[startIndex + i];
            if (datum < min) min = datum;
            if (datum > max) max = datum;
        }
        return { min, max };
        }

       
    
         // Method to get the current value of the isLooping flag
         getIsLooping() {
            return this.isLooping;
        }

        // Method to set the isLooping flag
        setIsLooping(isLooping) {
            this.isLooping = isLooping;
            this.updateLoopButtonState();
        }

        // Method to update the loop button's visual state based on isLooping flag
        updateLoopButtonState() {
            if (this.loopButton) {
                this.loopButton.classList.toggle('on', this.isLooping);
                this.loopButton.classList.toggle('off', !this.isLooping);
            }
        }
        

    playAudio() {
        console.log("[Class Functions] playAudio");

        playSound(this.audioBuffer, this.trimSettings.start, this.trimSettings.end, this.isLooping);
    }

    stopAudio() {
        console.log("[Class Functions] stopAudio");

        if (this.isPlaying && this.sourceNode) {
            this.sourceNode.stop(); // Stop the audio playback
            this.sourceNode.disconnect();
            this.sourceNode = null;
            this.isPlaying = false;
        }
        this.isLooping = false;
    }

    toggleLoop() {
        console.log("[Class Functions] toggleLoop");

        this.isLooping = !this.isLooping;
        this.loopButton.classList.toggle('on', this.isLooping);
        this.loopButton.classList.toggle('off', !this.isLooping);
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