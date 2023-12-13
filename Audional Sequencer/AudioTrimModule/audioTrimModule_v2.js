// audioTrimModule.js


class AudioTrimmer {
    constructor(channelIndex) {
        console.log("[Class Functions] constructor", { channelIndex });

        this.channelIndex = channelIndex;
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.audioBuffer = null;
        this.isPlaying = false;
        this.isLooping = false;

        this.initializeSliderTrack(channelIndex);

        const trimSettings = getTrimSettings(this.channelIndex);
        console.log("getSettings read into trimSettings in AudioTrimmer class constructor", trimSettings);
        this.startSliderValue = trimSettings.startSliderValue;
        this.endSliderValue = trimSettings.endSliderValue;
        console.log("startSliderValue and endSliderValue in AudioTrimmer class constructor", this.startSliderValue, this.endSliderValue);

        this.displayTimeout = null;

    }

    initializeSliderTrack() {
    this.sliderTrack = document.querySelector('.slider-track');
    if (!this.sliderTrack) {
        console.error('Slider track not found');
    }
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

    sliderValueToTimecode(sliderValue, totalDuration) {
        return (sliderValue / 100) * totalDuration;
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


      // Method to set the audio buffer and update the waveform
      setAudioBuffer(audioBuffer) {
        console.log("[Class Functions] setAudioBuffer", { audioBuffer });

        this.audioBuffer = audioBuffer;
        this.drawWaveform();
        console.log(" updateDimmedAreas method called from setAudioBuffer");
        this.updateDimmedAreas();
        this.updateSliderValues();
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
                console.log(" updateDimmedAreas method called from initialize");

                this.updateDimmedAreas();
                this.updateSliderValues();

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
            this.updateSliderValues();

        
        }



        updateSliderValues() {
            // Assuming the slider values are stored as percentages
            const startLeft = (this.startSliderValue / 100) * this.sliderTrack.offsetWidth;
            const endLeft = (this.endSliderValue / 100) * this.sliderTrack.offsetWidth;
        
            // Update the visual position of the sliders
            this.startSlider.style.left = `${startLeft}px`;
            this.endSlider.style.left = `${endLeft}px`;
        
            // Update the dimmed areas based on the new slider positions
            this.updateDimmedAreas();
        
            console.log("updateDimmedAreas method called from updateSliderValues");
            this.updateTrimmedSampleDuration();
            this.debounceDisplayValues();
        }
        
        updateDimmedAreas() {
            console.log("[Class Functions] updateDimmedAreas function entered into");
        
            // Use the internal state values instead of the slider element values
            const startSliderValue = this.startSliderValue;
            const endSliderValue = this.endSliderValue;
        
            const startDimmedWidth = `${startSliderValue}%`;
            const endDimmedWidth = `${100 - endSliderValue}%`;
        
            this.startDimmed.style.width = startDimmedWidth;
            this.startDimmed.style.left = '0';
            this.endDimmed.style.width = endDimmedWidth;
            this.endDimmed.style.left = `${endSliderValue}%`; // Position the end dimmed area correctly
        }
        
        
        

        
  

        addEventListeners() {
            console.log("[Class Functions] addEventListeners");
        
            const sliderMouseDown = (event, isStartSlider) => {
                const slider = isStartSlider ? this.startSlider : this.endSlider;
                console.log(`[Slider Mouse Down] Slider: ${isStartSlider ? 'Start' : 'End'}`);
        
                if (!slider) {
                    console.error('Slider element is undefined');
                    return;
                }
        
                const shiftX = event.clientX - slider.getBoundingClientRect().left;
        
                document.onmousemove = (e) => {
                    if (!this.sliderTrack) {
                        console.error('Slider track is undefined');
                        return;
                    }
        
                    let newLeft = e.clientX - shiftX - this.sliderTrack.getBoundingClientRect().left;
                    newLeft = Math.max(0, Math.min(newLeft, this.sliderTrack.offsetWidth - slider.offsetWidth));
        
                    const newValue = (newLeft / this.sliderTrack.offsetWidth) * 100; // Assuming the newValue is a percentage
                    if (isStartSlider) {
                        this.startSliderValue = newValue;
                    } else {
                        this.endSliderValue = newValue;
                    }
        
                    // Update the global settings with the new slider values
                    let updatedTrimSettings = unifiedSequencerSettings.settings.masterSettings.trimSettings;
                    updatedTrimSettings[this.channelIndex] = {
                        ...updatedTrimSettings[this.channelIndex],
                        startSliderValue: this.startSliderValue,
                        endSliderValue: this.endSliderValue
                    };
        
                    // Call the function to update the UI
                    updateTrimSettingsUI(updatedTrimSettings);
        
                    this.updateSliderValues();
                };
        
                document.onmouseup = () => {
                    document.onmousemove = document.onmouseup = null;
                };
            };
        
            this.startSlider.addEventListener('mousedown', (event) => sliderMouseDown(event, true));
            this.endSlider.addEventListener('mousedown', (event) => sliderMouseDown(event, false));
        }
        
        
      

    async loadSample() {
        console.log("[Class Functions] loadSample");

        if (!this.ordinalIdInput.value) return;
        try {
            this.audioBuffer = await fetchAudio(`https://ordinals.com/content/${this.ordinalIdInput.value}`);
            this.trimSettings = getTrimSettings(this.channelIndex);
            this.drawWaveform();
            console.log(" updateDimmedAreas method called from loadSample");
            this.updateSliderValues();

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
        
        playTrimmedAudio() {
            console.log("[Class Functions] playTrimmedAudio");
        
            if (!this.audioBuffer) {
                console.error("No audio buffer loaded");
                return;
            }
        
            // Convert slider values to timecodes
            const startTime = this.sliderValueToTimecode(this.startSlider.value, this.audioBuffer.duration);
            const endTime = this.sliderValueToTimecode(this.endSlider.value, this.audioBuffer.duration);
        
            // Create and configure the audio source node
            this.sourceNode = this.audioContext.createBufferSource();
            this.sourceNode.buffer = this.audioBuffer;
            this.sourceNode.connect(this.audioContext.destination);
        
            // Set looping if enabled
            this.sourceNode.loop = this.isLooping;
            if (this.isLooping) {
                this.sourceNode.loopStart = startTime;
                this.sourceNode.loopEnd = endTime;
            }
        
            // Start playback
            this.sourceNode.start(0, startTime, endTime - startTime);
            this.isPlaying = true;
        
            // Handle the end of playback
            this.sourceNode.onended = () => {
                this.isPlaying = false;
                if (this.isLooping) this.playTrimmedAudio(); // Restart if looping
            };
        }

        stopAudio() {
            console.log("[Class Functions] stopAudio");
        
            if (this.isPlaying && this.sourceNode) {
                this.sourceNode.stop(); // Stop the audio playback
                this.sourceNode.disconnect();
                this.sourceNode = null;
                this.isPlaying = false;
            }
            // Reset looping state if needed
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



