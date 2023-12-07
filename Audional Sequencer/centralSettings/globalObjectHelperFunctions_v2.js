// Global Object Update Functions

let currentChannelIndex = null; // Define at a higher scope

function updateGlobalBPM(newBPM) {
    window.unifiedSequencerSettings.setBPM(newBPM);
    console.log(`[updateGlobalBPM] BPM updated to: ${newBPM}`);
}

function setGlobalProjectName(projectName) {
    window.unifiedSequencerSettings.setProjectName(projectName);
    console.log(`[setGlobalProjectName] Project name updated to: ${projectName}`);
}

function setGlobalProjectURLs(urls) {
    window.unifiedSequencerSettings.setProjectURLs(urls);
    console.log(`[setGlobalProjectURLs] Project URLs updated:`, urls);
}

function setGlobalTrimSettings(trimSettings) {
    window.unifiedSequencerSettings.setTrimSettings(trimSettings);
    console.log(`[setGlobalTrimSettings] Trim settings updated:`, trimSettings);
}

function setGlobalProjectURLNames(urlNames) {
    window.unifiedSequencerSettings.setProjectURLNames(urlNames);
    console.log(`[setGlobalProjectURLNames] Project URL names updated:`, urlNames);
}

function setGlobalProjectSequences(sequences) {
    window.unifiedSequencerSettings.setProjectSequences(sequences);
    console.log(`[setGlobalProjectSequences] Project sequences updated:`, sequences);
}

// UI Update Functions

function updateUIFromLoadedSettings() {
    console.log("{debugGlobalObjectToUI} updateUIFromLoadedSettings: called with settings", settings);

    const settings = window.unifiedSequencerSettings.getSettings('masterSettings');
    console.log("Loaded settings:", settings);

    if (!settings) {
        console.error("Settings are not loaded or undefined.");
        return;
    }

    updateProjectNameUI(settings.projectName);
    updateBPMUI(settings.projectBPM);
    updateProjectURLsUI(settings.projectURLs);
    updateTrimSettingsUI(settings.trimSettings);
    updateProjectURLNamesUI(settings.projectURLNames);
    updateProjectSequencesUI(settings.projectSequences);
}

function updateProjectNameUI(projectName) {
    console.log("{debugGlobalObjectToUI} updateProjectNameUI: updating with projectName", projectName);

    const projectNameInput = document.getElementById('project-name');
    if (projectNameInput) {
        projectNameInput.value = projectName || "AUDX Project";
        console.log("Project name UI updated:", projectName);
    }
}

function updateBPMUI(bpm) {
    console.log("{debugGlobalObjectToUI} updateBPMUI: updating with BPM", bpm);

    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    if (bpmSlider && bpmDisplay) {
        bpmSlider.value = bpm;
        bpmDisplay.textContent = bpm;
        console.log("BPM UI updated:", bpm);
    }
}

function updateProjectURLsUI(urls) {
    console.log("{debugGlobalObjectToUI} updateProjectURLsUI: updating with URLs", urls);

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

function updateTrimSettingsUI(trimSettings) {
    console.log("{debugGlobalObjectToUI} updateTrimSettingsUI: updating with trimSettings", trimSettings);

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

function updateProjectURLNamesUI(urlNames) {
    console.log("{debugGlobalObjectToUI} updateProjectURLNamesUI: updating with URL names", urlNames);

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

function updateProjectSequencesUI(sequences) {
    console.log("{debugGlobalObjectToUI} updateProjectSequencesUI: updating with sequences", sequences);

    // Implement logic to update UI for project sequences
    console.log("Project sequences UI updated:", sequences);
    // Example: Update each sequence display or control
    Object.keys(sequences).forEach(sequenceKey => {
        const sequence = sequences[sequenceKey];
        Object.keys(sequence).forEach(channelKey => {
            const steps = sequence[channelKey];
            steps.forEach((step, index) => {
                const stepControl = document.getElementById(`${sequenceKey}-${channelKey}-step-${index}`);
                if (stepControl) {
                    // Update step control based on step value
                }
            });
        });
    });
}


// Utility Functions

function updateSpecificStepUI(sequenceNumber, channelIndex, stepIndex) {
    const stepState = window.unifiedSequencerSettings.getStepState(sequenceNumber, channelIndex, stepIndex);
    const stepButtonId = `${sequenceNumber}-ch${channelIndex + 1}-step-${stepIndex}`;
    const stepButton = document.getElementById(stepButtonId);

    if (stepButton) {
        stepButton.classList.toggle('selected', stepState);
        console.log(`updateSpecificStepUI called: Sequence ${sequenceNumber}, Channel ${channelIndex}, Step ${stepIndex}, State: ${stepState}`);
    } else {
        console.error(`Step button not found for the given IDs: ${stepButtonId}`);
    }
}


function reflectStepStateInUI(sequenceNumber, channelIndex, stepIndex) {
    const state = window.unifiedSequencerSettings.getStepState(sequenceNumber, channelIndex, stepIndex);
    const stepButtonId = `${sequenceNumber}-ch${channelIndex + 1}-step-${stepIndex}`;
    const stepButton = document.getElementById(stepButtonId);
    
    if (stepButton) {
        stepButton.classList.toggle('selected', state);
    } else {
        console.error('Step button not found for the given IDs');
    }
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

function setGlobalProjectName(name) {
    window.unifiedSequencerSettings.setProjectName(name);
}

function setGlobalProjectURLs(urls) {
    window.unifiedSequencerSettings.setProjectURLs(urls);
}

function setGlobalTrimSettings(settings) {
    window.unifiedSequencerSettings.setTrimSettings(settings);
}

function setGlobalProjectURLNames(names) {
    window.unifiedSequencerSettings.setProjectURLNames(names);
}

function setGlobalProjectSequences(sequences) {
    window.unifiedSequencerSettings.setProjectSequences(sequences);
}