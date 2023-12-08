// globalObjectHelperFunctions_v2.js

function updateProjectURLsUI(urls) {
    console.log("{debugGlobalObjectToUI} updateProjectURLsUI: updating with URLs", urls);

    urls.forEach((url, index) => {
        const urlButton = document.getElementById(`load-sample-button-${index}`);
        if (urlButton) {
            urlButton.textContent = url || 'Load New Audional'; // Default text if URL is empty
        }
    });

    console.log("Project URLs UI updated:", urls);
}

// 
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
// 
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
// 
document.addEventListener('DOMContentLoaded', () => {
    // Assuming there are 16 sequences and 16 channels per sequence
    for (let seq = 0; seq < 16; seq++) {
        for (let ch = 0; ch < 16; ch++) {
            // Find or create a container for each channel's steps
            let channelStepsContainer = document.querySelector(`#channel-${ch}-steps-container`);
            if (!channelStepsContainer) {
                channelStepsContainer = document.createElement('div');
                channelStepsContainer.id = `channel-${ch}-steps-container`;
                channelStepsContainer.classList.add('steps-container');
                // Append the container to the appropriate place in the DOM
                // (This needs to be adjusted based on your actual DOM structure)
                document.body.appendChild(channelStepsContainer);
            }

            // Clear any existing buttons
            channelStepsContainer.innerHTML = '';

            // Create step buttons for each step in the channel
            for (let step = 0; step < 64; step++) {
                const button = document.createElement('button');
                button.classList.add('step-button');

                // Assign an ID to the button based on sequence, channel, and step index
                button.id = `Sequence${seq}-ch${ch}-step-${step}`;

                button.addEventListener('click', () => {
                    // Toggle the step state in the global object
                    let currentStepState = window.unifiedSequencerSettings.getStepState(seq, ch, step);
                    window.unifiedSequencerSettings.updateStepState(seq, ch, step, !currentStepState);

                    console.log(`[updateSpecificStepUI] Step button clicked: Sequence ${seq}, Channel ${ch}, Step ${step}, New State: ${!currentStepState}`);

                    // Update the UI for the specific step
                    updateSpecificStepUI(seq, ch, step);
                });

                channelStepsContainer.appendChild(button);
            }
        }
    }
});






function updateBPMUI(bpm) {
    const bpmSlider = document.getElementById('bpm-slider');
    const bpmDisplay = document.getElementById('bpm-display');
    if (bpmSlider && bpmDisplay) {
        bpmSlider.value = bpm;
        bpmDisplay.textContent = bpm;
    }
}

function updateProjectNameUI(projectName) {
    const projectNameInput = document.getElementById('project-name');
    if (projectNameInput) {
        projectNameInput.value = projectName;
    }
}
// 
// 
// // Utility Functions
// 
function updateSpecificStepUI(sequenceNumber, channelIndex, stepIndex) {
    const stepState = window.unifiedSequencerSettings.getStepState(sequenceNumber, channelIndex, stepIndex);
    const stepButtonId = `${sequenceNumber}-ch${channelIndex}-step-${stepIndex}`;
    const stepButton = document.getElementById(stepButtonId);

    if (stepButton) {
        stepButton.classList.toggle('selected', stepState);
        console.log(`updateSpecificStepUI called: Sequence ${sequenceNumber}, Channel ${channelIndex}, Step ${stepIndex}, State: ${stepState}`);
    } else {
        console.error(`Step button not found for the given IDs: ${stepButtonId}`);
    }
}
// 
// let currentChannelIndex = null; // Define at a higher scope
// 
// function updateGlobalBPM(newBPM) {
//     window.unifiedSequencerSettings.setBPM(newBPM);
//     console.log(`[updateGlobalBPM] BPM updated to: ${newBPM}`);
// }
// 
// function setGlobalProjectName(projectName) {
//     window.unifiedSequencerSettings.setProjectName(projectName);
//     console.log(`[setGlobalProjectName] Project name updated to: ${projectName}`);
// }
// 
function setGlobalProjectURLs(urls) {
    window.unifiedSequencerSettings.setProjectURLs(urls);
    console.log(`[setGlobalProjectURLs] Project URLs updated:`, urls);
}
// 
// function setGlobalTrimSettings(trimSettings) {
//     window.unifiedSequencerSettings.setTrimSettings(trimSettings);
//     console.log(`[setGlobalTrimSettings] Trim settings updated:`, trimSettings);
// }
// 
// function setGlobalProjectURLNames(urlNames) {
//     window.unifiedSequencerSettings.setProjectURLNames(urlNames);
//     console.log(`[setGlobalProjectURLNames] Project URL names updated:`, urlNames);
// }
// 
// function setGlobalProjectSequences(sequences) {
//     window.unifiedSequencerSettings.setProjectSequences(sequences);
//     console.log(`[setGlobalProjectSequences] Project sequences updated:`, sequences);
// }
// 
// // UI Update Functions
// 
function updateUIFromLoadedSettings() {

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


function updateProjectSequencesUI(sequenceData) {
    console.log("{debugGlobalObjectToUI} updateProjectSequencesUI: updating with sequences", sequenceData);

    Object.keys(sequenceData).forEach(sequenceKey => {
        const sequence = sequenceData[sequenceKey];
        Object.keys(sequence).forEach(channelKey => {
            const steps = sequence[channelKey].steps; // Corrected to directly access the steps array
            if (Array.isArray(steps)) {
                steps.forEach((step, index) => {
                    const stepControl = document.getElementById(`${sequenceKey}-${channelKey}-step-${index}`);
                    if (stepControl) {
                        if (step === true) {
                            stepControl.classList.add('selected');
                        } else {
                            stepControl.classList.remove('selected');
                        }
                    }
                });
            }
        });
    });
}



// function reflectStepStateInUI(sequenceNumber, channelIndex, stepIndex) {
//     const state = window.unifiedSequencerSettings.getStepState(sequenceNumber, channelIndex, stepIndex);
//     const stepButtonId = `${sequenceNumber}-ch${channelIndex}-step-${stepIndex}`;
//     const stepButton = document.getElementById(stepButtonId);
//     
//     if (stepButton) {
//         stepButton.classList.toggle('selected', state);
//     } else {
//         console.error('Step button not found for the given IDs');
//     }
// }
// 
// function clearSettings() {
//     if (window.unifiedSequencerSettings) {
//         window.unifiedSequencerSettings.clearMasterSettings();
//         console.log("[clearSettings] Settings cleared.");
//     } else {
//         console.error("window.unifiedSequencerSettings is not defined.");
//     }
// }
// 
// function loadNewSettings(jsonSettings) {
//     if (window.unifiedSequencerSettings) {
//         window.unifiedSequencerSettings.loadSettings(jsonSettings);
//         console.log("[loadNewSettings] Loaded settings:", jsonSettings);
//         updateUIFromLoadedSettings();
//         console.log("[loadNewSettings] New settings loaded and UI updated.");
//     } else {
//         console.error("window.unifiedSequencerSettings is not defined.");
//     }
// }
// 
// // Function to save trim settings
// function setTrimSettings(channelIndex, startSliderValue, endSliderValue) {
//     window.unifiedSequencerSettings.setTrimSettingsForChannel(channelIndex, startSliderValue, endSliderValue);
// }
// 
   // Function to get trim settings
   function getTrimSettings(channelIndex) {
       return window.unifiedSequencerSettings.getTrimSettingsForChannel(channelIndex);
   }
// 
// function setStartSliderValue(trimmer, value) {
//     trimmer.startSliderValue = value;
//     if (trimmer.startSlider) {
//         trimmer.startSlider.value = value;
//     }
// }
// 
// function setEndSliderValue(trimmer, value) {
//     trimmer.endSliderValue = value;
//     if (trimmer.endSlider) {
//         trimmer.endSlider.value = value;
//     }
// }
// 
// function setIsLooping(trimmer, isLooping) {
//     trimmer.isLooping = isLooping;
//     // Additional logic to handle the looping state if needed
// }
// 
// function setGlobalProjectName(name) {
//     window.unifiedSequencerSettings.setProjectName(name);
// }
// 
// function setGlobalProjectURLs(urls) {
//     window.unifiedSequencerSettings.setProjectURLs(urls);
// }
// 
// function setGlobalTrimSettings(settings) {
//     window.unifiedSequencerSettings.setTrimSettings(settings);
// }
// 
// function setGlobalProjectURLNames(names) {
//     window.unifiedSequencerSettings.setProjectURLNames(names);
// }
// 
// function setGlobalProjectSequences(sequences) {
//     window.unifiedSequencerSettings.setProjectSequences(sequences);
// }