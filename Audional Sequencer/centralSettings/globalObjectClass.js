// globalObjectClass.js

class UnifiedSequencerSettings {
    constructor() {
        this.observers = [];

        this.settings = {
            masterSettings: {
                projectName: 'New Audx Project', // Set the project name placeholder
                projectBPM: 120,
                currentSequence: 0, // Initialize with a default value
                projectURLs: new Array(16).fill(''), 
                trimSettings: Array.from({ length: 16 }, () => ({
                    startSliderValue: 0.01,
                    endSliderValue: 100.00,
                    totalSampleDuration: 0
                })),
                projectChannelNames: new Array(16).fill(''), // You can set placeholders for channel names if needed
                projectSequences: this.initializeSequences(16, 16, 64) // You can adjust the dimensions as needed
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

    setTrimSettings(channelIndex, startSliderValue, endSliderValue) {
        if (this.isValidIndex(channelIndex)) {
            const currentSettings = this.settings.masterSettings.trimSettings[channelIndex];
            if (currentSettings) {
                Object.assign(currentSettings, { startSliderValue, endSliderValue });
            } else {
                console.error(`Trim settings not found for channel index: ${channelIndex}`);
            }
        } else {
            console.error(`Invalid channel index: ${channelIndex}`);
        }
    }
    
    getTrimSettings(channelIndex) {
        const trimSettings = this.settings.masterSettings.trimSettings[channelIndex];
        return trimSettings || { startSliderValue: 0.01, endSliderValue: 100.00 };
    }


    // Example of a method that changes settings
    setProjectName(channelIndex, name) {
        this.settings.masterSettings.projectName[channelIndex] = name;
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
            projectChannelNames: new Array(16).fill(''),
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

    updateProjectSequencesUI() {
        const projectSequences = this.getSettings('projectSequences');
        // Assuming you have a method to update the UI for each sequence
        projectSequences.forEach((sequence, index) => {
            updateSequenceUI(index, sequence);
        });
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
        console.log(`[updateSetting] Called with key: ${key}, value: ${value}, channelIndex: ${channelIndex}`);
        if (channelIndex !== null && Array.isArray(this.settings.masterSettings[key])) {
            this.settings.masterSettings[key][channelIndex] = value;
        } else if (key in this.settings.masterSettings) {
            this.settings.masterSettings[key] = value;
        } else {
            console.error(`Setting ${key} does not exist in masterSettings`);
        }
    }

    updateSampleDuration(duration, channelIndex) {
        if (this.isValidIndex(channelIndex)) {
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

    
   

    getprojectUrlforChannel(channelIndex) {
        return this.settings.masterSettings.projectURLs[channelIndex];
    }

    setProjectName(name) {
        this.settings.masterSettings.projectName = name;
        console.log(`[setProjectName] Project name set to: ${name}`);
    }

    setProjectURLs(urls) {
        this.settings.masterSettings.projectURLs = urls;
        console.log(`[setProjectURLs] Project URLs set:`, urls);
        updateAllLoadSampleButtonTexts();

    }

    // setTrimSettings(settings) {
    //     this.settings.masterSettings.trimSettings = settings;
    //     console.log(`[setTrimSettings] Trim settings set:`, settings);
    // }

        // Method to update the name of a specific channel
    setProjectChannelName(channelIndex, name) {
        if (this.isValidIndex(channelIndex)) {
            // Update only if the name is different
            if (this.settings.masterSettings.projectChannelNames[channelIndex] !== name) {
                this.settings.masterSettings.projectChannelNames[channelIndex] = name;
                console.log(`[setChannelName] Channel ${channelIndex} name set to: ${name}`);
                this.notifyObservers(); // Notify observers about the change
            }
        } else {
            console.error(`[setChannelName] Invalid channel index: ${channelIndex}`);
        }
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
    
            // Update the masterSettings with the parsed settings
            this.settings.masterSettings.projectName = parsedSettings.projectName;
            this.settings.masterSettings.projectBPM = parsedSettings.projectBPM;
            this.settings.masterSettings.currentSequence = parsedSettings.currentSequence;
            this.settings.masterSettings.projectURLs = parsedSettings.projectURLs;
            this.settings.masterSettings.trimSettings = parsedSettings.trimSettings;
            this.settings.masterSettings.projectChannelNames = parsedSettings.projectChannelNames;
    
            // Update projectSequences
            if (parsedSettings.projectSequences) {
                this.setProjectSequences(parsedSettings.projectSequences);
            }
    
            console.log("[loadSettings] Updated masterSettings:", this.settings.masterSettings);
    
            // Update the text of each loadSampleButton with the loaded URL
            this.updateAllLoadSampleButtonTexts();
        } catch (error) {
            console.error('Error loading settings:', error);
        }
        // Notify all observers about the change
        this.notifyObservers();
    }
    
    
        
        // Helper function to ensure array length
        ensureArrayLength(array, length, defaultValue) {
            while (array.length < length) {
                array.push(defaultValue);
            }
        }
            
    
    updateAllLoadSampleButtonTexts() {
        const channels = document.querySelectorAll('.channel');
        channels.forEach((channel, index) => {
            const loadSampleButton = channel.querySelector('.load-sample-button');
            if (loadSampleButton) {
                // Call the modified updateLoadSampleButtonText function
                this.updateLoadSampleButtonText(index, loadSampleButton);
            }
        });
    }
    
    
    updateLoadSampleButtonText(channelIndex, button) {
        let buttonText = 'Load New Audional'; // Default text
    
        // Accessing projectChannelNames and projectURLs from settings
        const channelName = this.settings.masterSettings.projectChannelNames[channelIndex];
        const loadedUrl = this.settings.masterSettings.projectURLs[channelIndex];
    
        if (channelName) {
            buttonText = channelName;
        } else if (loadedUrl) {
            // Extract the desired portion of the URL
            const urlParts = loadedUrl.split('/');
            const lastPart = urlParts[urlParts.length - 1];
            buttonText = lastPart;
        }
    
        // Update button text
        button.textContent = buttonText;
    }
    
    exportSettings() {
        const exportedSettings = JSON.stringify(this.settings.masterSettings);
        console.log("[exportSettings] Exported Settings:", exportedSettings);
        return exportedSettings;
    }
  
    isValidIndex(index) {
        return index >= 0 && index < 16; // Directly checking against 16
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

    updateProjectChannelNamesUI(urlNames) {
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

    ensureArrayLength(array, maxLength) {
        while (array.length < maxLength) {
            array.push(this.getDefaultArrayElement());
        }
    }
    
    getDefaultArrayElement() {
        // Return the default element structure
        // For example, for trimSettings:
        return { startSliderValue: 0.01, endSliderValue: 100.00, totalSampleDuration: 0 };
    }
    
   
    
}



window.unifiedSequencerSettings = new UnifiedSequencerSettings();
