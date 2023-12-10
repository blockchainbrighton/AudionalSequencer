// channelsForeach.js

import { setupLoadSampleModalButton } from './loadSampleModalButton_v2.js';


channels.forEach((channel, index) => {
    channel.dataset.id = `Channel-${index}`;
    
    // Create a gain node for the channel
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1; // Initial volume set to 1 (full volume)
    gainNode.connect(audioContext.destination);
    gainNodes[index] = gainNode;
    
      // Logging to confirm gain node creation and attachment
      // console.log(`Gain node created for Channel-${index}. Current gain value: ${gainNode.gain.value}`);
    
      
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
                let stepSettings = Array(64).fill(false); // Reset all steps to false
                for (let stepIndex = 0; stepIndex < stepSettings.length; stepIndex++) {
                    window.unifiedSequencerSettings.updateStepState(currentSequence, index, stepIndex, stepSettings[stepIndex]);
                }

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
        // Assuming 'channels' is a NodeList or array of channel elements
        channels.forEach((channel, channelIndex) => {
            const stepsContainer = channel.querySelector('.steps-container');
            stepsContainer.innerHTML = '';
    
            for (let i = 0; i < 64; i++) {
                const button = document.createElement('button');
                button.classList.add('step-button');
    
                // Update the ID assignment to match the format used in the rest of the application
                // Replace 'currentSequence' with a default sequence number or a dynamic one, if needed
                button.id = `Sequence0-ch${channelIndex}-step-${i}`;
    
                button.addEventListener('click', () => {
                    // Retrieve the current sequence number dynamically if needed
                    let currentSequence = 0; // Replace with dynamic sequence number if applicable
    
                    // Toggle the step state in the global object
                    let currentStepState = window.unifiedSequencerSettings.getStepState(currentSequence, channelIndex, i);
                    window.unifiedSequencerSettings.updateStepState(currentSequence, channelIndex, i, !currentStepState);
    
                    console.log(`[calling - updateSpecificStepUI] Step button clicked: Sequence ${currentSequence}, Channel ${channelIndex}, Step ${i}, New State: ${!currentStepState}`);
    
                    // Update the UI for the specific step
                    updateSpecificStepUI(currentSequence, channelIndex, i);
                });
    
                stepsContainer.appendChild(button);
            }
    
            // Add other channel elements like load buttons, mute, solo, clear, etc., if they are not already present
        });
    });
    
    


    const loadSampleButton = channel.querySelector('.load-sample-button');

    

        // Left-click event listener
        loadSampleButton.addEventListener('click', () => {
            setupLoadSampleModalButton(channel, index);
            // Additional logic for closing the modal can be added within setupLoadSampleModalButton if needed
        });

        // Right-click event listener
        loadSampleButton.addEventListener('contextmenu', (event) => {
            event.preventDefault(); // Prevent the default context menu
            showChannelNamingModal(index); // Show the channel naming modal
       
            // Create and show the custom context menu
            showCustomContextMenu(event.pageX, event.pageY, () => {
                const userChannelName = prompt("Enter a name for this channel:");
                if (userChannelName) {
                    // Update the button or relevant element with the new channel name
                    loadSampleButton.textContent = userChannelName;
                }
        });
    });

        // Function to create and show the custom context menu
        function showCustomContextMenu(x, y, channelIndex) {
            // Remove any existing custom context menus
            closeCustomContextMenu();

            // Create the custom context menu
            const menu = document.createElement('div');
            menu.classList.add('custom-context-menu');
            menu.style.top = `${y}px`;
            menu.style.left = `${x}px`;

            // Add menu options
            const addChannelNameOption = document.createElement('div');
            addChannelNameOption.textContent = 'Add User Channel Name';
            addChannelNameOption.addEventListener('click', () => {
                showChannelNamingModal(channelIndex);
                closeCustomContextMenu(); // Close the menu after opening the naming modal
            });
            menu.appendChild(addChannelNameOption);

            // Append the menu to the body and show it
            document.body.appendChild(menu);
        }

        // Function to create and show the channel naming modal
        function showChannelNamingModal(channelIndex) {
            const modal = document.createElement('div');
            modal.className = 'channel-naming-modal';

            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Give this channel a name';
            input.className = 'channel-name-input';

            const submitButton = document.createElement('button');
            submitButton.textContent = 'Submit';
            submitButton.onclick = () => {
                if (input.value) {
                    window.unifiedSequencerSettings.setProjectChannelName(channelIndex, input.value);
                }
                document.body.removeChild(modal);
            };

            modal.appendChild(input);
            modal.appendChild(submitButton);
            document.body.appendChild(modal);
        }

        // Function to close the custom context menu
        function closeCustomContextMenu() {
            const existingMenu = document.querySelector('.custom-context-menu');
            if (existingMenu) {
                existingMenu.remove();
            }
        }

        // Hide the custom context menu or modal when clicking elsewhere
        document.addEventListener('click', (event) => {
            // Close the custom context menu if the click is outside
            const existingMenu = document.querySelector('.custom-context-menu');
            if (existingMenu && !existingMenu.contains(event.target)) {
                closeCustomContextMenu();
            }

            // Logic to close the left-click modal if the click is outside
            const modal = document.querySelector('.load-sample-buttor'); // Replace with your actual modal selector
            if (modal && !modal.contains(event.target) && !loadSampleButton.contains(event.target)) {
                closeModal(modal); // Replace with your function to close the modal
            }
        });

        // Function to close the modal
        function closeModal(modal) {
            // Add logic to close the modal, e.g., hide it or remove it from the DOM
            modal.style.display = 'none'; // Example: hide the modal
        }

    

});