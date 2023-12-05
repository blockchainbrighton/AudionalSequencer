// globalObjectClassAndInit.js

class UnifiedSequencerSettings {
    constructor() {
        this.settings = {
            masterSettings: {
                projectName: '',
                projectBPM: 120,
                projectURLs: new Array(16).fill(''),
                trimSettings: new Array(16).fill().map(() => ({
                    startSliderValue: 0.01, // Default start value
                    endSliderValue: 100.00, // Default end value (100%)
                    totalSampleDuration: 0
                })),
                projectURLNames: new Array(16).fill(''),
                projectSequences: this.initializeSequences(16, 16, 64)
            },
            // Add other settings as needed
        };

        // Log the initial values of startSliderValue and endSliderValue for each channel
        this.settings.masterSettings.trimSettings.forEach((setting, index) => {
            console.log(`Channel ${index + 1} - startSliderValue = ${setting.startSliderValue}, endSliderValue = ${setting.endSliderValue}`);
        });
    }

    

    // Initialize sequences with the specified structure
    initializeSequences(numSequences, numChannels, numSteps) {
        let sequences = {};
        for (let seq = 1; seq <= numSequences; seq++) {
            sequences[`Sequence${seq}`] = this.initializeChannels(numChannels, numSteps);
        }
        return sequences;
    }

    // Initialize channels for each sequence
    initializeChannels(numChannels, numSteps) {
        let channels = {};
        for (let ch = 1; ch <= numChannels; ch++) {
            // Create an array with 1-based indexing for steps
            channels[`ch${ch}`] = new Array(numSteps + 1).fill(false);
            channels[`ch${ch}`].shift(); // Remove the first element to start indexing from 1
        }
        return channels;
    }

    // Method to update a specific setting
    updateSetting(key, value, channelIndex = null) {
        if (key in this.settings.masterSettings) {
            if (Array.isArray(this.settings.masterSettings[key]) && channelIndex !== null) {
                // If the setting is an array and a channel index is provided, update the specific element
                this.settings.masterSettings[key][channelIndex] = value;
            } else {
                // If the setting is not an array or no channel index is provided, update the whole setting
                this.settings.masterSettings[key] = value;
            }
        } else {
            console.error(`Setting ${key} does not exist in masterSettings`);
        }
    }

    // Method to update audio data for a specific channel
    updateSampleDuration(duration, channelIndex) {
        if (channelIndex >= 0 && channelIndex < this.settings.masterSettings.trimSettings.length) {
            this.settings.masterSettings.trimSettings[channelIndex].totalSampleDuration = duration;
            console.log(`[UnifiedSequencerSettings] Duration updated for channel ${channelIndex}: ${duration}`);
        } else {
            console.error(`[UnifiedSequencerSettings] Invalid channel index: ${channelIndex}`);
        }
    }

   // Method to update trim settings
    setTrimSettingsForChannel(channelIndex, startSliderValue, endSliderValue) {
        if (channelIndex >= 0 && channelIndex < this.settings.masterSettings.trimSettings.length) {
            const currentSettings = this.settings.masterSettings.trimSettings[channelIndex];
            if (currentSettings) {
                this.settings.masterSettings.trimSettings[channelIndex] = {
                    startSliderValue: startSliderValue,
                    endSliderValue: endSliderValue,
                    totalSampleDuration: currentSettings.totalSampleDuration
                };
            } else {
                console.error(`[setTrimSettingsForChannel] Trim settings not initialized for channel index: ${channelIndex}`);
            }
        } else {
            console.error(`Invalid channel index: ${channelIndex}`);
        }
    }



      // Method to get the trim settings for a specific channel
      getTrimSettingsForChannel(channelIndex) {
        const trimSettings = this.settings.masterSettings.trimSettings[channelIndex];
        return trimSettings ? {
            startSliderValue: trimSettings.startSliderValue,
            endSliderValue: trimSettings.endSliderValue
        } : {
            startSliderValue: 0.01, // Default value if not set
            endSliderValue: 100.00 // Default end value if not set
        };
    }

    // Method to update the state of a specific step
    updateStepState(sequenceNumber, channelIndex, stepIndex, state) {
        let adjustedSequenceNumber = sequenceNumber + 1;
        let adjustedChannelIndex = channelIndex + 1;

        if (this.settings.masterSettings.projectSequences[`Sequence${adjustedSequenceNumber}`] &&
            this.settings.masterSettings.projectSequences[`Sequence${adjustedSequenceNumber}`][`ch${adjustedChannelIndex}`] &&
            stepIndex < this.settings.masterSettings.projectSequences[`Sequence${adjustedSequenceNumber}`][`ch${adjustedChannelIndex}`].length) {
            this.settings.masterSettings.projectSequences[`Sequence${adjustedSequenceNumber}`][`ch${adjustedChannelIndex}`][stepIndex] = state;
        } else {
            console.error('Error updating step state: Invalid sequence, channel, or step index');
        }
    }


    // Method to get the audio URL for a specific channel
    getAudioUrlForChannel(channelIndex) {
        // Assuming channelIndex is 0-based and corresponds directly to the array index
        return this.settings.masterSettings.projectURLs[channelIndex];
    }

  

    // Method to get a specific setting
    getSetting(key) {
        return this.settings.masterSettings[key] || null;
    }

    // Method to load settings from a JSON object or string
    loadSettings(jsonSettings) {
        try {
            const parsedSettings = typeof jsonSettings === 'string' ? JSON.parse(jsonSettings) : jsonSettings;
            this.settings.masterSettings = { ...this.settings.masterSettings, ...parsedSettings };
        } catch (error) {
            console.error('Error loading settings:', error);
        }
    }

    // Method to export current settings as a JSON string
    exportSettings() {
        return JSON.stringify(this.settings.masterSettings);
    }

    // Method to view current settings in JSON format
    viewCurrentSettings() {
        return JSON.stringify(this.settings, null, 2); // Pretty print the JSON
    }
}

// Attach the settings object to the global window object
window.unifiedSequencerSettings = new UnifiedSequencerSettings();
