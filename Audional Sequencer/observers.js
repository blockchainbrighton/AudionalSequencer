// observers.js

// Assuming UnifiedSequencerSettings instance is accessible via a global variable
// For example, window.unifiedSequencerSettings

// Observer for Project Name
function updateProjectNameObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectName) {
        updateProjectNameUI(settings.masterSettings.projectName);
    }
}

// Observer for BPM
function updateBPMObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectBPM) {
        updateBPMUI(settings.masterSettings.projectBPM);
    }
}

// Observer for Project URLs
function updateProjectURLsObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectURLs) {
        updateProjectURLsUI(settings.masterSettings.projectURLs);
    }
}

// Observer for Trim Settings
function updateTrimSettingsObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.trimSettings) {
        updateTrimSettingsUI(settings.masterSettings.trimSettings);
    }
}

// Observer for Project URL Names
function updateProjectURLNamesObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectURLNames) {
        updateProjectURLNamesUI(settings.masterSettings.projectURLNames);
    }
}

// Observer for Project Sequences
function updateProjectSequencesObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectSequences) {
        updateProjectSequencesUI(settings.masterSettings.projectSequences);
    }
}

// Register all observers
function registerObservers() {
    if (window.unifiedSequencerSettings) {
        window.unifiedSequencerSettings.addObserver(updateProjectNameObserver);
        window.unifiedSequencerSettings.addObserver(updateBPMObserver);
        window.unifiedSequencerSettings.addObserver(updateProjectURLsObserver);
        window.unifiedSequencerSettings.addObserver(updateTrimSettingsObserver);
        window.unifiedSequencerSettings.addObserver(updateProjectURLNamesObserver);
        window.unifiedSequencerSettings.addObserver(updateProjectSequencesObserver);
    } else {
        console.error("UnifiedSequencerSettings instance not found.");
    }
}

// Call registerObservers on script load
registerObservers();
