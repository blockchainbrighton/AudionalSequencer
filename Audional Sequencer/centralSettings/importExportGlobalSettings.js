// importExportGlobalSettings.js

function exportSettings() {
    const settings = window.unifiedSequencerSettings.exportSettings();
    // Directly return the JSON string of the settings
    return settings;
}


function importSettings(jsonSettings) {
    try {
        // Parse jsonSettings if it's a string
        const parsedSettings = typeof jsonSettings === 'string' ? JSON.parse(jsonSettings) : jsonSettings;
        window.unifiedSequencerSettings.loadSettings(parsedSettings);


        // Update UI for each sequence
        const masterSettings = window.unifiedSequencerSettings.getSettings('masterSettings');

        if (masterSettings && typeof masterSettings.projectSequences === 'object') {
            for (let sequenceNumber = 1; sequenceNumber <= Object.keys(masterSettings.projectSequences).length; sequenceNumber++) {
                updateUIForSequence(sequenceNumber);
            }
        }

        // Optionally, update other parts of the UI here
        // For example, updating BPM, projectName, etc.
        updateBPMUI(masterSettings.projectBPM);
        updateProjectNameUI(masterSettings.projectName);
        // ... other UI updates ...

    } catch (error) {
        console.error('Error importing settings:', error);
    }
}

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


