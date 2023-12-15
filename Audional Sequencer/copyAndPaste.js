// copyAndPaste.js

// Introduce the flag at the top level
let isCopyPasteEvent = false;

let copiedData = null; // This will hold the copied data

document.addEventListener('DOMContentLoaded', function() {
    const copyButton = document.getElementById('copy-sequence-settings');
    const pasteButton = document.getElementById('paste-button');

    if (copyButton) {
        copyButton.addEventListener('click', function() {
            // Retrieve the current settings from the global object
            const currentSequence = window.unifiedSequencerSettings.settings.masterSettings.currentSequence;
            const masterSettings = window.unifiedSequencerSettings.settings.masterSettings;

            // Logic to copy the sequence settings
            copiedData = {
                type: 'sequence',
                currentSequence: currentSequence,
                bpm: masterSettings.projectBPM,
                channelSettings: masterSettings.projectSequences[`Sequence${currentSequence}`], // Assuming channel settings are stored per sequence
                channelURLs: masterSettings.projectURLs[currentSequence]
            };
            console.log('Sequence settings copied:', copiedData);

            // Start flashing animation on the paste button
            if (pasteButton) {
                pasteButton.classList.add('flashing');
            }

            // Show soft confirmation message
            showConfirmationTooltip('Copied sequence settings. Select another sequence to paste to.');
        });
    }

    if (pasteButton) {
        pasteButton.addEventListener('click', function() {
            if (!copiedData) {
                alert('No data copied to paste!');
                return;
            }

            const currentSequence = window.unifiedSequencerSettings.settings.masterSettings.currentSequence;
            if (currentSequence === copiedData.currentSequence) {
                alert('Please select a different sequence to paste the settings.');
                return;
            }

            pasteSettings();
            this.classList.remove('flashing');
        });
    }
});


function pasteSettings() {
    if (!copiedData) {
        console.error('No data copied to paste!');
        return;
    }

    const currentSequence = window.unifiedSequencerSettings.settings.masterSettings.currentSequence;
    console.log("P1 Copied data:", copiedData);

    if (copiedData.type === 'sequence') {
        // Update the BPM for the current sequence
        window.unifiedSequencerSettings.settings.masterSettings.projectBPM = copiedData.bpm;

        // Update the channel settings and URLs for the current sequence
        window.unifiedSequencerSettings.settings.masterSettings.projectSequences[`Sequence${currentSequence}`] = copiedData.channelSettings;
        window.unifiedSequencerSettings.settings.masterSettings.projectURLs[currentSequence] = copiedData.channelURLs;
    } else if (copiedData.type === 'channel') {
        // Update the specific channel's settings in the current sequence
        window.unifiedSequencerSettings.settings.masterSettings.projectSequences[`Sequence${currentSequence}`][copiedData.channelIndex] = copiedData.channelSetting;
        window.unifiedSequencerSettings.settings.masterSettings.projectURLs[currentSequence][copiedData.channelIndex] = copiedData.channelURL;
    }

    console.log('P1 Data pasted:', copiedData);
    updateUIForSequence(currentSequence);
}

function pasteSequenceSettings(settings) {
    console.log("Pasting sequence settings...");

    let parsedSettings;

    try {
        parsedSettings = JSON.parse(settings);
        console.log("P1 Parsed settings for paste:", parsedSettings);
    } catch (error) {
        console.error("Error parsing settings for paste:", error);
        return;
    }

    function isValidSequence(seq) {
        const isValid = seq && Array.isArray(seq.channels) && typeof seq.name === 'string';
        console.log(`Sequence ${seq.name} is valid for paste: ${isValid}`);
        return isValid;
    }
    console.log("P1 Parsed settings before conversion:", parsedSettings);

    // Update collectedURLsForSequences with the parsed URLs for the current sequence
    collectedURLsForSequences[currentSequence] = parsedSettings[0].channels.map(ch => ch.url);

    // Update the BPM for the current sequence
    sequenceBPMs[currentSequence] = parsedSettings[0].bpm;

    // Build the sequences array for paste
    let pastedSequences = parsedSettings.map((seqSettings, index) => {
        if (isValidSequence(seqSettings)) {
            return convertSequenceSettings(seqSettings);
        } else {
            return null;
        }
    }).filter(Boolean);

    // If the current sequence is beyond the length of the sequences array, append the pasted sequence
    if (currentSequence > sequences.length) {
        sequences.push(pastedSequences[0]);
    } else {
        sequences[currentSequence] = pastedSequences[0];
    }
    console.log("P1 Current sequence after paste:", sequences[currentSequence]);

    // Ensure channelSettings is initialized for the current sequence
    channelSettings = sequences[currentSequence];

    // Now, call functions that rely on channelSettings
    updateUIForSequence(currentSequence);

    console.log("P1 Pasted sequences array:", sequences);

    loadAndDisplaySequence(currentSequence);

    console.log("Paste sequence settings completed.");
}

function showConfirmationTooltip(message) {
    const tooltip = document.createElement('div');
    tooltip.innerText = message;
    tooltip.style.position = 'absolute';
    tooltip.style.background = '#333';
    tooltip.style.color = 'white';
    tooltip.style.padding = '5px';
    tooltip.style.borderRadius = '5px';
    tooltip.style.top = '50%';
    tooltip.style.left = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
    tooltip.style.zIndex = '1000';

    document.body.appendChild(tooltip);

    setTimeout(() => {
        tooltip.remove();
    }, 3000);
}