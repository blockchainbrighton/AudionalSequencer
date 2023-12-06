// importExportGlobalSettings.js

function exportSettings() {
    const settings = window.unifiedSequencerSettings.exportSettings();
    const formattedSettings = JSON.stringify(JSON.parse(settings), null, 4);
    // Save this JSON to a file or provide it for download
    return formattedSettings;
}

function importSettings(jsonSettings) {
    try {
        // Assuming jsonSettings is a JSON string
        window.unifiedSequencerSettings.loadSettings(jsonSettings);

        // Update UI for each sequence
        const masterSettings = window.unifiedSequencerSettings.getSetting('masterSettings');
        if (masterSettings && masterSettings.projectSequences) {
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


