// globalObjectHelperFunctions.js

let currentChannelIndex = null; // Define at a higher scope

function updateGlobalBPM(newBPM) {
    window.unifiedSequencerSettings.setBPM(newBPM);
    console.log(`[updateGlobalBPM] BPM updated to: ${newBPM}`);

    // Additional logic if needed, e.g., emit messages or update external modules
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
    const settings = window.unifiedSequencerSettings.getSetting('masterSettings');

    // Example: Update project name
    const projectNameInput = document.getElementById('project-name');
    if (settings.projectName) {
        projectNameInput.value = settings.projectName;
    }

    // Example: Update BPM
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    if (settings.projectBPM) {
        bpmSlider.value = settings.projectBPM;
        bpmDisplay.textContent = settings.projectBPM;
    }
}


// Add implementations for getAudioUrlForChannel and getTrimSettingsForChannel in UnifiedSequencerSettings
