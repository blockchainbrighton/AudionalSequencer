// channelsForeach.js

import { setupLoadSampleButton } from './loadSampleButtonModal.js';


channels.forEach((channel, index) => {
    channel.dataset.id = `Channel-${index + 1}`;
    saveCurrentSequence(currentSequence);
    
    // Create a gain node for the channel
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1; // Initial volume set to 1 (full volume)
    gainNode.connect(audioContext.destination);
    gainNodes[index] = gainNode;
    
      // Logging to confirm gain node creation and attachment
      // console.log(`Gain node created for Channel-${index + 1}. Current gain value: ${gainNode.gain.value}`);
    
      
      const muteButton = channel.querySelector('.mute-button');
        muteButton.addEventListener('click', () => {
            if (muteButton.classList.contains('selected')) {
                muteButton.classList.remove('selected');
                
                // Check if any channel is soloed
                if (!soloedChannels.some(state => state) || soloedChannels[index]) {
                    gainNodes[index].gain.value = 1;
                }
            } else {
                muteButton.classList.add('selected');
                gainNodes[index].gain.value = 0;

                // If the current channel is soloed and being muted, remove its solo status
                if (soloedChannels[index]) {
                    soloedChannels[index] = false;
                    const soloButton = channel.querySelector('.solo-button');
                    soloButton.classList.remove('selected');
                }
            }
            updateDimState(channel, index);
        });

      

        const soloButton = channel.querySelector('.solo-button');
        soloButton.addEventListener('click', () => {
            // Toggle solo state for the current channel
            soloedChannels[index] = !soloedChannels[index];
            soloButton.classList.toggle('selected', soloedChannels[index]);

            // If this channel is now soloed
            if (soloedChannels[index]) {
                gainNodes[index].gain.value = 1; // Ensure its gain is set to 1
                muteButton.classList.remove('selected'); // Ensure it's not muted
                updateDimState(channel, index);

                // Mute and dim all other non-soloed channels
                channels.forEach((otherChannel, otherIndex) => {
                    if (!soloedChannels[otherIndex] && otherIndex !== index) {
                        gainNodes[otherIndex].gain.value = 0;
                        updateDimState(otherChannel, otherIndex);
                    }
                });
            } else {
                // If this channel is now unsoloed and no other channels are soloed
                if (!soloedChannels.some(state => state)) {
                    channels.forEach((otherChannel, otherIndex) => {
                        gainNodes[otherIndex].gain.value = otherChannel.querySelector('.mute-button').classList.contains('selected') ? 0 : 1;
                        updateDimState(otherChannel, otherIndex);
                    });
                } else {
                    // If other channels are still soloed, mute the current channel regardless of its mute button state
                    gainNodes[index].gain.value = 0;
                    updateDimState(channel, index);
                }
            }
        });




    
        const clearButton = channel.querySelector('.clear-button');
        const clearConfirm = channel.querySelector('.clear-confirm');
        
        clearButton.addEventListener('click', (e) => {
            e.stopPropagation();
        
            if (!clearClickedOnce[index]) {
                // Start the flashing effect
                clearButton.classList.add('flashing');
                clearButton.classList.remove('dimmed');
        
                // Show the visual indication
                clearClickedOnce[index] = true;
        
                // Set a timer to hide the confirmation after 2 seconds
                clearConfirmTimeout[index] = setTimeout(() => {
                    clearConfirm.style.display = "none";
                    clearClickedOnce[index] = false;
                    // Stop the flashing effect
                    clearButton.classList.remove('flashing');
                    clearButton.classList.add('dimmed');
                }, 2000);
            } else {
                // Clear the steps
                const stepButtons = channel.querySelectorAll('.step-button');
                stepButtons.forEach(button => {
                    button.classList.remove('selected');
                });
        
                // Update the step settings in the sequence data
                let stepSettings = [null].concat(Array(64).fill(false)); // Reset all steps to false
                updateSequenceData({
                    channelIndex: index,
                    stepSettings: stepSettings
                });
        
                // Hide the visual indication
                clearConfirm.style.display = "none";
                clearTimeout(clearConfirmTimeout[index]);
                clearClickedOnce[index] = false;
                // Stop the flashing effect
                clearButton.classList.remove('flashing');
                clearButton.classList.add('dimmed');
            }
        });
        
    

    // Handle clicks outside the clear button
    document.addEventListener('click', (e) => {
        if (!clearButton.contains(e.target) && clearClickedOnce[index]) {
            clearConfirm.style.display = "none";
            clearTimeout(clearConfirmTimeout[index]); // Clear the timer for the specific channel
            clearClickedOnce[index] = false;  // Reset the variable for the specific channel when clicked outside
            clearButton.classList.remove('flashing');
        }
    });





    document.addEventListener('DOMContentLoaded', () => {
        const stepsContainer = channel.querySelector('.steps-container');
        stepsContainer.innerHTML = '';
    
        for (let i = 0; i < 64; i++) {
            const button = document.createElement('button');
            button.classList.add('step-button');
    
            // Retrieve the channel index from the channel's id attribute
            let channelIndex = parseInt(channel.id.split('-')[1]) - 1;
            console.log(`[Debug] Channel Index: ${channelIndex}`);
    
            // Assign an ID to the button based on sequence, channel, and step index
                // Assuming 'currentSequence' is defined and holds the current sequence key
                button.id = `${currentSequence}-ch${channelIndex + 1}-step-${i}`;

                button.addEventListener('click', () => {                    
                console.log(`[Debug] Button clicked: Channel ${channelIndex}, Step ${i}`);
    
                // Log the current step state before toggling
                let currentStepState = button.classList.contains('selected');
                console.log(`[Debug] Current Step State before toggle: ${currentStepState}`);
    
                // Toggle the step state
                button.classList.toggle('selected');
                
                // Update the step's state in the channelSettings
                let stepState = button.classList.contains('selected');
                console.log(`[Debug] New Step State after toggle: ${stepState}`);
    
                updateStep(channelIndex, i, stepState);
                
                // Log the global object state before update
                console.log(`[Debug] Global Object State before update:`, window.unifiedSequencerSettings.viewCurrentSettings());
    
                // Update the global object
                window.unifiedSequencerSettings.updateStepState(currentSequence, channelIndex, i, stepState);
    
                // Log the global object state after update
                console.log(`[Debug] Global Object State after update:`, window.unifiedSequencerSettings.viewCurrentSettings());
            });
    
            stepsContainer.appendChild(button);
        }
    });


        const loadSampleButton = channel.querySelector('.load-sample-button');
        loadSampleButton.addEventListener('click', () => {
            setupLoadSampleButton(channel, index);
     
    });

});