// unifiedSequencerSettingsClass.js

class UnifiedSequencerSettings {
    constructor() {
        this.settings = {
            masterSettings: {
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
            }
        };
    }

  

    initializeSequences(numSequences, numChannels, numSteps) {
        let sequences = {};
        for (let seq = 1; seq <= numSequences; seq++) {
            sequences[`Sequence${seq}`] = this.initializeChannels(numChannels, numSteps);
        }
        return sequences;
    }

    initializeChannels(numChannels, numSteps) {
        let channels = {};
        for (let ch = 1; ch <= numChannels; ch++) {
            channels[`ch${ch}`] = Array(numSteps).fill(false);
        }
        return channels;
    }

    updateStepState(sequenceNumber, channelIndex, stepIndex, state) {
        const sequence = this.settings.masterSettings.projectSequences[`Sequence${sequenceNumber + 1}`];
        const channel = sequence && sequence[`ch${channelIndex + 1}`];
        if (channel && stepIndex < channel.length) {
            channel[stepIndex] = state;
        } else {
            console.error('Invalid sequence, channel, or step index');
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

    getSetting(key) {
        return this.settings.masterSettings[key];
    }

    loadSettings(jsonSettings) {
        try {
            console.log("[loadSettings] Received JSON Settings:", jsonSettings);
            const parsedSettings = typeof jsonSettings === 'string' ? JSON.parse(jsonSettings) : jsonSettings;
            console.log("[loadSettings] Parsed Settings:", parsedSettings);
    
            Object.assign(this.settings.masterSettings, parsedSettings);
            console.log("[loadSettings] Updated masterSettings:", this.settings.masterSettings);
        } catch (error) {
            console.error('Error loading settings:', error);
        }
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
}

window.unifiedSequencerSettings = new UnifiedSequencerSettings();
