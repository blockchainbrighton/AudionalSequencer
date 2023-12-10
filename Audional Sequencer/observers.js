// observers.js

// Assuming UnifiedSequencerSettings instance is accessible via a global variable
// For example, window.unifiedSequencerSettings

// Observer for Project Name
function updateProjectNameObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectName) {
        console.log("[observers] Updating Project Name UI:", settings.masterSettings.projectName);

        updateProjectNameUI(settings.masterSettings.projectName);
    }
}

// Observer for BPM
function updateBPMObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectBPM) {
        console.log("Updating BPM UI:", settings.masterSettings.projectBPM);

        updateBPMUI(settings.masterSettings.projectBPM);
    }
}

// Observer for Project URLs
function updateProjectURLsObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectURLs) {
        console.log("Updating Project URLs UI:", settings.masterSettings.projectURLs);
        unifiedSequencerSettings.updateAllLoadSampleButtonTexts();
        // updateProjectURLsUI(settings.masterSettings.projectURLs);
    }
}

// Observer for Trim Settings
function updateTrimSettingsObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.trimSettings) {
        console.log("Updating Trim Settings UI:", settings.masterSettings.trimSettings);

        updateTrimSettingsUI(settings.masterSettings.trimSettings);
    }
}

// Observer for Project Channel Names
function updateProjectChannelNamesObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectChannelNames) {
        console.log("Updating Project channel Names UI:", settings.masterSettings.projectChannelNames);

        settings.masterSettings.projectChannelNames.forEach((name, index) => {
            const channelLabel = document.querySelector(`#channel-name-${index}`);
            if (channelLabel) {
                channelLabel.textContent = name || 'Default Channel Name'; // Use a default name if empty
            }
        });
    }
}

// Observer for Project Sequences
function updateProjectSequencesObserver(settings) {
    if (settings && settings.masterSettings && settings.masterSettings.projectSequences) {
        console.log("Updating Project Sequences UI:", settings.masterSettings.projectSequences);

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
        window.unifiedSequencerSettings.addObserver(updateProjectChannelNamesObserver);
        window.unifiedSequencerSettings.addObserver(updateProjectSequencesObserver);
    } else {
        console.error("UnifiedSequencerSettings instance not found.");
    }
}

// Call registerObservers on script load
registerObservers();
