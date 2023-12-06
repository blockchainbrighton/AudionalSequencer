// globalObjectHelperFunctions.js

let currentChannelIndex = null; // Define at a higher scope

function updateGlobalBPM(newBPM) {
    window.unifiedSequencerSettings.setBPM(newBPM);
    console.log(`[updateGlobalBPM] BPM updated to: ${newBPM}`);

    // Additional logic if needed, e.g., emit messages or update external modules
}

function clearAndLoadSettings(jsonSettings) {
    if (window.unifiedSequencerSettings) {
        window.unifiedSequencerSettings.clearMasterSettings();
        window.unifiedSequencerSettings.loadSettings(jsonSettings);
        updateUIFromLoadedSettings();
        console.log("[clearAndLoadSettings] Settings cleared and new settings loaded.");
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
    const settings = window.unifiedSequencerSettings.getSetting('masterSettings');

    // Log the settings for debugging
    console.log("Loaded settings:", settings);

    if (!settings) {
        console.error("Settings are not loaded or undefined.");
        return;
    }

    // Update project name
    const projectNameInput = document.getElementById('project-name');
    if (projectNameInput) {
        if (settings.projectName) {
            projectNameInput.value = settings.projectName;
        } else {
            // Log missing project name and use a placeholder
            console.log("Missing project name, using placeholder.");
            projectNameInput.value = "AUDX Project";
        }

          // Additional log for confirmation
        console.log("UI updated with loaded settings.");
    }

    // Update BPM
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    if (bpmSlider && bpmDisplay && settings.projectBPM) {
        bpmSlider.value = settings.projectBPM;
        bpmDisplay.textContent = settings.projectBPM;
    }
}




// Add implementations for getAudioUrlForChannel and getTrimSettingsForChannel in UnifiedSequencerSettings
