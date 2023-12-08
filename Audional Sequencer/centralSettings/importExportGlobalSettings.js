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

        console.log("{debugGlobalObjectToUI} importSettings: loading settings", parsedSettings);

        // Load the new settings
        window.unifiedSequencerSettings.loadSettings(parsedSettings);

        // The observers will automatically update the UI
        // No need for explicit UI update calls here

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


