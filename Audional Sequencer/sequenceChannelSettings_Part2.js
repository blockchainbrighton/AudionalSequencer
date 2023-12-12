// sequenceChannelSettings_Part2.js

let totalSequenceCount = 1;

let isContinuousPlay = false;

document.addEventListener('DOMContentLoaded', () => {
    const continuousPlayButton = document.getElementById('continuous-play');
    continuousPlayButton.addEventListener('click', () => {
        isContinuousPlay = !isContinuousPlay;  // Toggle the continuous play mode
        continuousPlayButton.classList.toggle('selected', isContinuousPlay);
        // Other logic that needs to be executed when the mode changes
    });
});

function loadSequence(sequenceNumber) {
    // Retrieve the sequence from the global object
    let sequence = window.unifiedSequencerSettings.getSettings('projectSequences')[`Sequence${sequenceNumber}`];

    // Initialize the sequence if it doesn't exist
    if (!sequence) {
        // Initialize a new sequence with default values
        const newSequence = window.unifiedSequencerSettings.initializeSequences(1, 16, 64);
        window.unifiedSequencerSettings.setProjectSequences({ ...window.unifiedSequencerSettings.getSettings('projectSequences'), ...newSequence });
        sequence = newSequence[`Sequence${sequenceNumber}`];
    }

    // Update the currentSequence in the global object
    window.unifiedSequencerSettings.setCurrentSequence(sequenceNumber);

    // Check if sequence is an object
    if (typeof sequence !== 'object') {
        console.error(`Sequence ${sequenceNumber} is not an object.`, sequence);
        return;
    }

    // Update the UI to reflect the loaded sequence
    updateUIForSequence(sequenceNumber);

    // Iterate over each channel in the sequence
    Object.entries(sequence).forEach(([channelKey, channelData]) => {
        const channelIndex = parseInt(channelKey.replace('ch', ''), 10);
        const currentUrl = channelData.url; // Assuming the URL is stored in the channelData object
        const channelElement = document.querySelector(`.channel[data-id="Channel-${channelIndex + 1}"]`);
        const previousUrl = channelElement.dataset.originalUrl;

        if (currentUrl && currentUrl !== previousUrl) {
            const loadSampleButton = channelElement.querySelector('.load-sample-button');
            fetchAudio(currentUrl, channelIndex, loadSampleButton);
        }
    });
}

function loadNextSequence() {
    let currentSequence = window.unifiedSequencerSettings.getCurrentSequence();

    if (currentSequence < totalSequenceCount) {
        // Save current sequence's settings

        // Increment the current sequence number
        const newSequence = currentSequence + 1;
        window.unifiedSequencerSettings.setCurrentSequence(newSequence);

        // Load the next sequence's settings
        loadSequence(newSequence);

        // Update the displayed number and UI
        updateSequenceDisplay(newSequence);
    } else if (isContinuousPlay) {
        // Create a new sequence if continuous play is active and we're at the last sequence
        const newSequence = totalSequenceCount;
        totalSequenceCount++; // Increment the total sequence count

        // Initialize the new sequence
        initializeNewSequence(newSequence);

        // Load the new sequence
        loadSequence(newSequence);

        // Update the displayed number and UI
        updateSequenceDisplay(newSequence);
    } else {
        console.warn("You've reached the last sequence.");
    }
}

function initializeNewSequence(sequenceNumber) {
    // Initialize the sequence with default settings
    let sequenceChannels = Array(16).fill().map(() => [null].concat(Array(64).fill(false)));
    window.unifiedSequencerSettings.setCurrentSequence(sequenceNumber, sequenceChannels);
}

function updateSequenceDisplay(sequenceNumber) {
    const sequenceDisplayElement = document.getElementById('current-sequence-display');
    if (sequenceDisplayElement) {
        sequenceDisplayElement.textContent = 'Sequence ' + sequenceNumber;
    }
    updateActiveQuickPlayButton();
}

function updateUIForSequence(sequenceNumber) {
    console.log(`[updateUIForSequence] Updating UI for Sequence ${sequenceNumber}`);
    const masterSettings = window.unifiedSequencerSettings.getSettings('masterSettings');
    const sequenceSettings = masterSettings.projectSequences[`Sequence${sequenceNumber}`];

    console.log("[debugging Step Button IDs] Updating UI for Sequence:", sequenceNumber);

    if (sequenceNumber >= 0 && sequenceNumber < masterSettings.projectSequences.length) {

        // Mark the sequence as active
        markSequenceAsLive(sequenceNumber);

        channels.forEach((channel, index) => {
            const stepButtons = channel.querySelectorAll('.step-button');
            const toggleMuteButtons = channel.querySelectorAll('.toggle-mute');

            console.log(`[debugging Step Button IDs] Processing Channel: ${index}, Step Buttons Found: ${stepButtons.length}`);

            // Clear all step buttons and toggle mute states
            stepButtons.forEach(button => button.classList.remove('selected'));
            toggleMuteButtons.forEach(button => button.classList.remove('toggle-mute'));

            // Update the steps based on the sequence settings
            sequenceSettings[`ch${index}`].steps.forEach((stepState, pos) => {
                console.log(`[debugging Step Button IDs] Channel: ${index}, Position: ${pos}, Step State: ${stepState}`);

                if (stepState) {
                    if (stepButtons[pos]) {
                        stepButtons[pos].classList.add('selected');
                        console.log(`[debugging Step Button IDs] Adding 'selected' class to Step Button at Position: ${pos} in Channel: ${index}`);
                    } else {
                        console.error(`[debugging Step Button IDs] Step Button not found at Position: ${pos} in Channel: ${index}`);
                    }
                }
            });

            // Additional logic for updating other UI elements like toggle mute states, volume, etc.
        });
    } else {
        console.error("[debugging Step Button IDs] Invalid sequence number:", sequenceNumber);
    }
}

// Call this function whenever the sequence changes
function changeSequence(seq) {
    currentSequence = seq;
    onSequenceOrDataChange();
  }

  /**
 * Updates a specific step's state for a given channel.
 * @param {number} channelIndex - The index of the channel (0 to 15).
 * @param {number} stepIndex - The index of the step (0 to 63).
 * @param {boolean} state - The new state of the step (true for on, false for off).
 */
function updateStep(channelIndex, stepIndex, state) {
    // Existing code to update channelSettings
    channelSettings[channelIndex][stepIndex] = state;
    
    // // Log updated settings for the specific channel after the update
    // updateSequenceData({
    //     channelIndex: channelIndex,
    //     stepSettings: channelSettings[channelIndex]
    // });
    // console.log(`Updated settings for Channel-${channelIndex + 1}:`, channelSettings[channelIndex]);

    // Update the global object
    window.unifiedSequencerSettings.updateStepState(currentSequence, channelIndex, stepIndex, state);

    // Add console log for debugging
    console.log(`updateStepState called with sequence: ${currentSequence}, channelIndex: ${channelIndex}, stepIndex: ${stepIndex}, state: ${state}`);
}

// Listen for the custom event and then load and display sequence 1
window.addEventListener('setupComplete', function() {
    loadAndDisplaySequence(0);
});

// Use loadNextSequence inside the event listener
document.getElementById('next-sequence').addEventListener('click', loadNextSequence);


document.getElementById('prev-sequence').addEventListener('click', function() {
    if (currentSequence > 1) {
        // Save current sequence's settings

        // Decrement the current sequence number and load its settings
        currentSequence--;
        loadSequence(currentSequence);
        
        // Update the display and highlight the active button
        document.getElementById('current-sequence-display').textContent = `Sequence ${currentSequence}`;
        updateActiveQuickPlayButton();
    } else {
        console.warn("You're already on the first sequence.");
    }
});

  //function loadChannelSettingsFromPreset(preset) {
  //  preset.channels.forEach((channelData, channelIndex) => {
  //      let stepSettings = [null].concat(Array(64).fill(false));  // Add placeholder for 0th index
  //      channelData.triggers.forEach(trigger => {
  //          // Account for 1-indexing
  //          stepSettings[trigger] = true;
  //      });
  //      channelSettings[channelIndex] = stepSettings;
  //     // console.log(`Loaded settings for Channel-${channelIndex + 1}:`, channelSettings[channelIndex]);
  //      
  //      // Fetch audio data
  //      if (channelData.url) {
  //          const loadSampleButton = document.querySelector(`.channel[data-id="Channel-${channelIndex + 1}"] .load-sample-button`);
  //          fetchAudio(channelData.url, channelIndex, loadSampleButton);
  //          // console.log(`Channel-${channelIndex + 1} fetchAudio called`);
  //      }
  //  });
//
//
  //  // console.log("loadChannelSettingsFromPreset: After loadChannelSettingsFromPreset, gainNodes values:", gainNodes.map(gn => gn.gain.value));
//
//}

console.log("Initial channel settings:", window.unifiedSequencerSettings.getSettings('projectSequences'));

