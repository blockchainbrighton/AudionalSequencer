// globalObjectHelperFunctions.js

let currentChannelIndex = null; // Define at a higher scope

function updateGlobalBPM(newBPM) {
    window.unifiedSequencerSettings.setBPM(newBPM);
    console.log(`[updateGlobalBPM] BPM updated to: ${newBPM}`);

    // Additional logic if needed, e.g., emit messages or update external modules
}

function clearSettings() {
    if (window.unifiedSequencerSettings) {
        window.unifiedSequencerSettings.clearMasterSettings();
        console.log("[clearSettings] Settings cleared.");
    } else {
        console.error("window.unifiedSequencerSettings is not defined.");
    }
}
function loadNewSettings(jsonSettings) {
    if (window.unifiedSequencerSettings) {
        window.unifiedSequencerSettings.loadSettings(jsonSettings);

        // Log the settings that have been loaded
        console.log("[loadNewSettings] Loaded settings:", jsonSettings);

        updateUIFromLoadedSettings();
        console.log("[loadNewSettings] New settings loaded and UI updated.");
    } else {
        console.error("window.unifiedSequencerSettings is not defined.");
    }
}


// Function to save trim settings
function setTrimSettings(channelIndex, startSliderValue, endSliderValue) {
    window.unifiedSequencerSettings.setTrimSettingsForChannel(channelIndex, startSliderValue, endSliderValue);
}

// Function to get trim settings
function getTrimSettings(channelIndex) {
    return window.unifiedSequencerSettings.getTrimSettingsForChannel(channelIndex);
}

function setStartSliderValue(trimmer, value) {
    trimmer.startSliderValue = value;
    if (trimmer.startSlider) {
        trimmer.startSlider.value = value;
    }
}

function setEndSliderValue(trimmer, value) {
    trimmer.endSliderValue = value;
    if (trimmer.endSlider) {
        trimmer.endSlider.value = value;
    }
}

function setIsLooping(trimmer, isLooping) {
    trimmer.isLooping = isLooping;
    // Additional logic to handle the looping state if needed
}


function updateUIFromLoadedSettings() {
    const settings = window.unifiedSequencerSettings.getSettings('masterSettings');

    console.log("Loaded settings:", settings);

    if (!settings) {
        console.error("Settings are not loaded or undefined.");
        return;
    }

    // Call the new methods in UnifiedSequencerSettings class to update the UI
    window.unifiedSequencerSettings.updateProjectNameUI(settings.projectName);
    window.unifiedSequencerSettings.updateBPMUI(settings.projectBPM);
    window.unifiedSequencerSettings.updateProjectURLsUI(settings.projectURLs);
    window.unifiedSequencerSettings.updateTrimSettingsUI(settings.trimSettings);
    window.unifiedSequencerSettings.updateProjectURLNamesUI(settings.projectURLNames);
    window.unifiedSequencerSettings.updateProjectSequencesUI(settings.projectSequences);

    console.log("UI updated with loaded settings.");
}

    // Update BPM
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    if (bpmSlider && bpmDisplay && settings.projectBPM) {
        bpmSlider.value = settings.projectBPM;
        bpmDisplay.textContent = settings.projectBPM;
    }
    
// Add helper functions to directly invoke update methods
function updateProjectName(projectName) {
    window.unifiedSequencerSettings.updateProjectNameUI(projectName);
}

function updateBPM(bpm) {
    window.unifiedSequencerSettings.updateBPMUI(bpm);
}

function updateProjectURLs(urls) {
    window.unifiedSequencerSettings.updateProjectURLsUI(urls);
}

function updateTrimSettings(trimSettings) {
    window.unifiedSequencerSettings.updateTrimSettingsUI(trimSettings);
}

function updateProjectURLNames(urlNames) {
    window.unifiedSequencerSettings.updateProjectURLNamesUI(urlNames);
}

function updateProjectSequences(sequences) {
    window.unifiedSequencerSettings.updateProjectSequencesUI(sequences);
}





// Add implementations for getAudioUrlForChannel and getTrimSettingsForChannel in UnifiedSequencerSettings
