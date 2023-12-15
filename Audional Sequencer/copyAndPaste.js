// copyAndPaste.js

// Introduce the flag at the top level
let isCopyPasteEvent = false;

let copiedData = null; // This will hold the copied data

// Add a function to validate the updates in the global object and UI
function validateAndUpdateUI(sequenceIndex) {
    const sequenceSettings = window.unifiedSequencerSettings.getSequenceSettings(sequenceIndex);
    
    if (!isValidSequence(sequenceSettings)) {
        console.error(`[copyPasteDebug] Invalid sequence settings for sequence index: ${sequenceIndex}`);
        return;
    }

    // Call UI update function with the new sequence settings
    updateUIForSequence(sequenceIndex);
    console.log(`[copyPasteDebug] UI updated for sequence index: ${sequenceIndex}`);

    // Additional validation logic can be added here
}

document.addEventListener('DOMContentLoaded', function() {
    const copyButton = document.getElementById('copy-sequence-settings');
    const pasteButton = document.getElementById('paste-button');

    if (copyButton) {
        console.log('[copyPasteDebug] Copy button clicked.');
        copyButton.addEventListener('click', function() {
            // Inside the event listener for the copy button
            const currentSequenceIndex = window.unifiedSequencerSettings.getCurrentSequence();
            const sequenceSettings = window.unifiedSequencerSettings.getSequenceSettings(currentSequenceIndex);

            copiedData = {
                type: 'sequence',
                currentSequenceIndex: currentSequenceIndex,
                sequenceSettings: sequenceSettings
            };

            console.log('[copyPasteDebug] Sequence step settings copied:', copiedData);

            if (pasteButton) {
                pasteButton.classList.add('flashing');
            }
            showConfirmationTooltip('[copyPasteDebug] Copied sequence step settings. Select another sequence to paste to.');
        });
    }

    if (pasteButton) {
        console.log('[copyPasteDebug] pasteButton clicked');
        pasteButton.addEventListener('click', function() {
            if (!copiedData) {
                alert('No data copied to paste!');
                return;
            }

            // Inside the event listener for the paste button
        const currentSequenceIndex = window.unifiedSequencerSettings.getCurrentSequence();
        console.log(`[copyPasteDebug] Current sequence index: ${currentSequenceIndex}`);
        window.unifiedSequencerSettings.setSequenceSettings(currentSequenceIndex, copiedData.sequenceSettings);
        console.log(`[copyPasteDebug] Sequence step settings pasted: ${copiedData}`);
        updateUIForSequence(currentSequenceIndex);
        console.log(`[copyPasteDebug] updteUIForSequence called with sequence index: ${currentSequenceIndex}`);
        console.log(`[copyPasteDebug] Current sequence index according to the global object is now: ${window.unifiedSequencerSettings.getCurrentSequence()}`);


        this.classList.remove('flashing');
        // New validation call after pasting settings
        validateAndUpdateUI(currentSequenceIndex);
    });
    }
});

function isValidSequence(seq) {
    const isValid = seq && Array.isArray(seq.channels) && typeof seq.name === 'string';
    console.log(`[copyPasteDebug] Sequence ${seq.name} is valid for paste: ${isValid}`);
    return isValid;
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