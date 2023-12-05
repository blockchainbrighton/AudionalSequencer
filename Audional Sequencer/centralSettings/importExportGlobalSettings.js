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
    } catch (error) {
        console.error('Error importing settings:', error);
    }
}


