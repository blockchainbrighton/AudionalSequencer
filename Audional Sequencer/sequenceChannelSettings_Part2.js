// sequenceChannelSettings_Part2.js

let totalSequenceCount = 16;

let isContinuousPlay = false;

document.addEventListener('DOMContentLoaded', () => {
    const continuousPlayButton = document.getElementById('continuous-play');
    continuousPlayButton.addEventListener('click', () => {
        isContinuousPlay = !isContinuousPlay;  // Toggle the continuous play mode
        continuousPlayButton.classList.toggle('selected', isContinuousPlay);
        // Other logic that needs to be executed when the mode changes
    });
});

function loadSequence(currentSequence) {
    // Retrieve the sequence from the global object
    let sequence = window.unifiedSequencerSettings.getSettings('projectSequences')[`Sequence${currentSequence}`];
    console.log(`[loadSequence] Loading sequence ${currentSequence}...`);

    // Check if sequence is an object
    if (typeof sequence !== 'object') {
        console.error(`Sequence ${currentSequence} is not an object.`, sequence);
        return;
    }

    // Update the UI to reflect the loaded sequence
    updateUIForSequence(currentSequence);

    // Iterate over each channel in the sequence
    Object.entries(sequence).forEach(([channelKey, channelData]) => {
        const channelIndex = parseInt(channelKey.replace('ch', ''), 10);

        // Update the UI for each channel based on the step states in the sequence
        updateChannelUI(currentSequence, channelIndex, channelData.steps);
    });
}

function updateChannelUI(currentSequence, channelIndex, steps) {
    console.log(`[SeqDebug] [updateChannelUI] Updating UI for sequence ${currentSequence} channel ${channelIndex}`);
    const channelElement = document.querySelector(`.channel[data-id="Channel-${channelIndex}"]`);
    if (!channelElement) {
        console.error(`Channel element not found for index: ${channelIndex}`);
        return;
    }

    const stepButtons = channelElement.querySelectorAll(`.step-button[id^="Sequence${currentSequence}-ch${channelIndex}"]`);
    stepButtons.forEach((button, index) => {
        if (steps[index]) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }
    });
}



function loadNextSequence() {
    console.log(`[SeqDebug] [loadNextSequence] Loading next sequence. Current sequence is: ${window.unifiedSequencerSettings.getCurrentSequence()}`);
    let currentSequence = window.unifiedSequencerSettings.getCurrentSequence();

    if (currentSequence < totalSequenceCount - 1) {
        // Increment the current sequence number
        const newSequence = currentSequence + 1;
        window.unifiedSequencerSettings.setCurrentSequence(newSequence);

        // Load the next sequence's settings
        loadSequence(newSequence);

        // Update the displayed number and UI
        updateSequenceDisplay(newSequence);
    } else {
        console.warn("You've reached the last sequence.");
    }
}

function initializeNewSequence(currentSequence) {
    console.log(`[initializeNewSequence] Initializing new sequence. Current sequence: ${currentSequence}`);
    // Initialize the sequence with default settings
    let sequenceChannels = Array(16).fill().map(() => [null].concat(Array(64).fill(false)));

    // Increment the currentSequence by 1 for the new sequence
    let newSequenceNumber = currentSequence + 1;
    console.log(`[initializeNewSequence] New sequence: ${currentSequence}`);


    // Set the new sequence with incremented number
    window.unifiedSequencerSettings.setCurrentSequence(newSequenceNumber, sequenceChannels);
    console.log(`[SeqDebug] [initializeNewSequence] newSequenceCreated ${currentSequence} ${sequenceChannels}`);

}

function updateSequenceDisplay(currentSequence) {
    const sequenceDisplayElement = document.getElementById('current-sequence-display');
    if (sequenceDisplayElement) {
        sequenceDisplayElement.textContent = 'Sequence ' + currentSequence;
    }
    updateActiveQuickPlayButton();
}

function updateUIForSequence(currentSequence) {
    console.log(`[SeqDebug] [updateUIForSequence] Updating UI for Sequence ${currentSequence}`);
    const masterSettings = window.unifiedSequencerSettings.getSettings('masterSettings');
    const sequenceSettings = masterSettings.projectSequences[`Sequence${currentSequence}`];

    // Additional logging to check the format of the sequenceSettings
    console.log(`[SeqDebug] [debugging Step Button IDs] Sequence Settings for Sequence ${currentSequence}:`, sequenceSettings);

    if (currentSequence >= 0 && currentSequence < 64) {
        channels.forEach((channel, index) => {
            const stepButtons = channel.querySelectorAll('.step-button');
            const toggleMuteButtons = channel.querySelectorAll('.toggle-mute');

            console.log(`[SeqDebug] [debugging Step Button IDs][updateUIForSequence] Processing Channel: ${index}, Step Buttons Found: ${stepButtons.length}`);

            // Validate that the sequence settings for the channel exist
            if (!sequenceSettings || !sequenceSettings[`ch${index}`] || !sequenceSettings[`ch${index}`].steps) {
                console.error(`[SeqDebug][debugging Step Button IDs][updateUIForSequence] Missing step data for Channel: ${index} in Sequence: ${currentSequence}`);
                return;
            }

            // Clear all step buttons and toggle mute states
            stepButtons.forEach(button => button.classList.remove('selected'));
            toggleMuteButtons.forEach(button => button.classList.remove('toggle-mute'));

            // Update the steps based on the sequence settings
            sequenceSettings[`ch${index}`].steps.forEach((stepState, pos) => {
                console.log(`[SeqDebug][debugging Step Button IDs] [updateUIForSequence] Channel: ${index}, Position: ${pos}, Step State: ${stepState}`);

                if (stepState) {
                    if (stepButtons[pos]) {
                        stepButtons[pos].classList.add('selected');
                        console.log(`[SeqDebug][debugging Step Button IDs][updateUIForSequence] Adding 'selected' class to Step Button at Position: ${pos} in Channel: ${index}`);
                    } else {
                        console.error(`[SeqDebug][debugging Step Button IDs][updateUIForSequence] Step Button not found at Position: ${pos} in Channel: ${index}`);
                    }
                }
            });

            // Additional logic for updating other UI elements like toggle mute states, volume, etc.
        });
    } else {
        console.error("[SeqDebug][debugging Step Button IDs] [updateUIForSequence] Invalid sequence number:", currentSequence);
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
document.getElementById('next-sequence').addEventListener('click', function() {
    console.log("Next sequence button clicked.");
    loadNextSequence();
});

document.getElementById('prev-sequence').addEventListener('click', function() {
    console.log("Previous sequence button clicked.");

    // Fetch the current sequence number from the global settings
    let currentSequence = window.unifiedSequencerSettings.settings.masterSettings.currentSequence;
    console.log(`Current sequence before decrement: ${currentSequence}`);

    if (currentSequence > 0) {
        // Decrement the current sequence number
        currentSequence--;

        // Update the global settings with the new current sequence number
        window.unifiedSequencerSettings.settings.masterSettings.currentSequence = currentSequence;
        console.log(`Current sequence after decrement: ${currentSequence}`);

        // Load the previous sequence's settings
        loadSequence(currentSequence);
        
        // Update the display and highlight the active button
        document.getElementById('current-sequence-display').textContent = `Sequence ${currentSequence}`;
        updateActiveQuickPlayButton();
    } else {
        console.warn("You're already on the first sequence.");
    }
});



console.log("Initial channel settings:", window.unifiedSequencerSettings.getSettings('projectSequences'));


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


