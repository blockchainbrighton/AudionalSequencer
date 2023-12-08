// globalObjectClass.js

class UnifiedSequencerSettings {
    constructor() {
        this.observers = [];

        this.settings = {
            masterSettings: {
                projectName: '',
                projectBPM: 120,
                currentSequence: 0, // Initialize with a default value
                projectURLs: new Array(16).fill(''),
                trimSettings: Array.from({ length: 16 }, () => ({
                    startSliderValue: 0.01,
                    endSliderValue: 100.00,
                    totalSampleDuration: 0
                })),
                projectURLNames: new Array(16).fill(''),
                projectSequences: this.initializeSequences(16, 16, 64)
            }
        };

        // Expose the checkSettings function for manual checking
        this.checkSettings = this.checkSettings.bind(this);
    }

    // Method to register an observer
    addObserver(observerFunction) {
        this.observers.push(observerFunction);
    }

    // Method to notify all observers
    notifyObservers() {
        this.observers.forEach(observerFunction => observerFunction(this.settings));
    }

    // Example of a method that changes settings
    setProjectName(name) {
        this.settings.masterSettings.projectName = name;
        this.notifyObservers(); // Notify observers about the change
    }

    // Method to update the current sequence
    setCurrentSequence(sequenceNumber) {
        this.settings.currentSequence = sequenceNumber;
        console.log(`[setCurrentSequence] Current sequence set to: ${sequenceNumber}`);
    }

    // Method to get the current sequence
    getCurrentSequence() {
        return this.settings.currentSequence;
    }


    getSettings(key) {
        if (key === 'masterSettings') {
            console.log("[getSettings] Retrieved all masterSettings:", this.settings.masterSettings);
            return this.settings.masterSettings;
        } else if (key) {
            const settingValue = this.settings.masterSettings[key];
            console.log(`[getSettings] Retrieved setting for key '${key}':`, settingValue);
            return settingValue;
        } else {
            console.log("[getSettings] Retrieved all settings:", this.settings);
            return this.settings;
        }
    }

    // Nested function for manual checking
    checkSettings() {
        console.log("[checkSettings] Current masterSettings:", this.settings.masterSettings);
        return this.settings.masterSettings;
    }

    clearMasterSettings() {
        console.log("[clearMasterSettings] Current masterSettings before clearing:", this.settings.masterSettings);

        this.settings.masterSettings = {
            projectName: '',
            projectBPM: 120,
            projectURLs: new Array(16).fill(''),
            trimSettings: Array.from({ length: 16 }, () => ({
                startSliderValue: 0.01,
                endSliderValue: 100.00,
                totalSampleDuration: 0
            })),
            projectURLNames: new Array(16).fill(''),
            projectSequences: this.initializeSequences(16, 16, 64)
        };
        console.log("[clearMasterSettings] Master settings cleared.");
    }
  

    initializeSequences(numSequences, numChannels, numSteps) {
        let sequenceData = {};
        for (let seq = 0; seq < numSequences; seq++) {
            sequenceData[`Sequence${seq}`] = this.initializeChannels(numChannels, numSteps);
        }
        return sequenceData;
    }
    
    initializeChannels(numChannels, numSteps) {
        let channels = {};
        for (let ch = 0; ch < numChannels; ch++) {
            channels[`ch${ch}`] = {
                steps: Array(numSteps).fill(false),
                mute: false, // Ensure mute is off by default
                url: '' // Default URL can be empty or set to a default value
            };
        }
        return channels;
    }
    
    updateStepState(sequenceNumber, channelIndex, stepIndex, state) {
        console.log(`[updateStepState] Called with Sequence: ${sequenceNumber}, Channel: ${channelIndex}, Step: ${stepIndex}, State: ${state}`);
        const sequence = this.settings.masterSettings.projectSequences[`Sequence${sequenceNumber}`];
        const channel = sequence && sequence[`ch${channelIndex}`];
        if (channel && stepIndex < channel.steps.length) {
            channel.steps[stepIndex] = state;
        } else {
            console.error('Invalid sequence, channel, or step index in updateStepState');
        }
    }
    
    
    getStepState(sequenceNumber, channelIndex, stepIndex) {
        console.log(`[getStepState] Called with Sequence: ${sequenceNumber}, Channel: ${channelIndex}, Step: ${stepIndex}`);
        const sequence = this.settings.masterSettings.projectSequences[`Sequence${sequenceNumber}`];
        const channel = sequence && sequence[`ch${channelIndex}`];
        if (channel && stepIndex < channel.steps.length) {
            return channel.steps[stepIndex];
        } else {
            console.error('Invalid sequence, channel, or step index in getStepState');
            return null;
        }
    }
    
    
    

    updateSetting(key, value, channelIndex = null) {
        if (channelIndex !== null && Array.isArray(this.settings.masterSettings[key])) {
            this.settings.masterSettings[key][channelIndex] = value;
        } else if (key in this.settings.masterSettings) {
            this.settings.masterSettings[key] = value;
        } else {
            console.error(`Setting ${key} does not exist in masterSettings`);
        }
    }

    updateSampleDuration(duration, channelIndex) {
        if (this.isValidIndex(channelIndex, this.settings.masterSettings.trimSettings.length)) {
            this.settings.masterSettings.trimSettings[channelIndex].totalSampleDuration = duration;
        } else {
            console.error(`Invalid channel index: ${channelIndex}`);
        }
    }

    getBPM() {
        return this.settings.masterSettings.projectBPM;
    }

    setBPM(newBPM) {
        this.settings.masterSettings.projectBPM = newBPM;
    }

    setTrimSettingsForChannel(channelIndex, startSliderValue, endSliderValue) {
        if (this.isValidIndex(channelIndex, this.settings.masterSettings.trimSettings.length)) {
            const currentSettings = this.settings.masterSettings.trimSettings[channelIndex];
            Object.assign(currentSettings, { startSliderValue, endSliderValue });
        } else {
            console.error(`Invalid channel index: ${channelIndex}`);
        }
    }

    getTrimSettingsForChannel(channelIndex) {
        const trimSettings = this.settings.masterSettings.trimSettings[channelIndex];
        return trimSettings || { startSliderValue: 0.01, endSliderValue: 100.00 };
    }

   

    getAudioUrlForChannel(channelIndex) {
        return this.settings.masterSettings.projectURLs[channelIndex];
    }

    setProjectName(name) {
        this.settings.masterSettings.projectName = name;
        console.log(`[setProjectName] Project name set to: ${name}`);
    }

    setProjectURLs(urls) {
        this.settings.masterSettings.projectURLs = urls;
        console.log(`[setProjectURLs] Project URLs set:`, urls);
    }

    setTrimSettings(settings) {
        this.settings.masterSettings.trimSettings = settings;
        console.log(`[setTrimSettings] Trim settings set:`, settings);
    }

    setProjectURLNames(names) {
        this.settings.masterSettings.projectURLNames = names;
        console.log(`[setProjectURLNames] Project URL names set:`, names);
    }

    setProjectSequences(sequenceData) {
        this.settings.masterSettings.projectSequences = sequenceData;
        console.log(`[setProjectSequences] Project sequences set:`, sequenceData);
    }

    
    

    loadSettings(jsonSettings) {
        try {
            console.log("[loadSettings] Received JSON Settings:", jsonSettings);
            const parsedSettings = typeof jsonSettings === 'string' ? JSON.parse(jsonSettings) : jsonSettings;
            console.log("[loadSettings] Parsed Settings:", parsedSettings);

            console.log("[loadSettings] Current masterSettings before loading new settings:", this.settings.masterSettings);
            this.settings.masterSettings = parsedSettings;
            console.log("[loadSettings] Updated masterSettings:", this.settings.masterSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        // Notify all observers about the change
        this.notifyObservers();
    }
    

    exportSettings() {
        const exportedSettings = JSON.stringify(this.settings.masterSettings);
        console.log("[exportSettings] Exported Settings:", exportedSettings);
        return exportedSettings;
    }
    

    viewCurrentSettings() {
        return JSON.stringify(this.settings, null, 2);
    }

    isValidIndex(index, length) {
        return index >= 0 && index < length;
    }

    // Additional methods for updating UI
    updateProjectNameUI(projectName) {
        const projectNameInput = document.getElementById('project-name');
        if (projectNameInput) {
            projectNameInput.value = projectName || "AUDX Project";
            console.log("Project name UI updated:", projectName);
        }
    }

    updateBPMUI(bpm) {
        const bpmSlider = document.getElementById('bpm-slider');
        const bpmDisplay = document.getElementById('bpm-display');
        if (bpmSlider && bpmDisplay) {
            bpmSlider.value = bpm;
            bpmDisplay.textContent = bpm;
            console.log("BPM UI updated:", bpm);
        }
    }

    updateProjectURLsUI(urls) {
        // Implement logic to update UI for project URLs
        console.log("Project URLs UI updated:", urls);
        // Example: Update each URL input field
        urls.forEach((url, index) => {
            const urlInput = document.getElementById(`url-input-${index}`);
            if (urlInput) {
                urlInput.value = url;
            }
        });
    }

    updateTrimSettingsUI(trimSettings) {
        // Implement logic to update UI for trim settings
        console.log("Trim settings UI updated:", trimSettings);
        // Example: Update each trim setting input field
        trimSettings.forEach((setting, index) => {
            const startSlider = document.getElementById(`start-slider-${index}`);
            const endSlider = document.getElementById(`end-slider-${index}`);
            if (startSlider && endSlider) {
                startSlider.value = setting.startSliderValue;
                endSlider.value = setting.endSliderValue;
            }
        });
    }

    updateProjectURLNamesUI(urlNames) {
        // Implement logic to update UI for project URL names
        console.log("Project URL names UI updated:", urlNames);
        // Example: Update each URL name display
        urlNames.forEach((name, index) => {
            const nameDisplay = document.getElementById(`url-name-${index}`);
            if (nameDisplay) {
                nameDisplay.textContent = name;
            }
        });
    }

    
}



window.unifiedSequencerSettings = new UnifiedSequencerSettings();
