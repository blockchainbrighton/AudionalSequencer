// createStepButtonsforSequence.js

// Function to create step buttons for a given sequence
function createStepButtonsForSequence() {
    channels.forEach((channel, channelIndex) => {
        const stepsContainer = channel.querySelector('.steps-container');
        stepsContainer.innerHTML = '';
    
        let currentSequence = window.unifiedSequencerSettings.settings.masterSettings.currentSequence;
    
        for (let i = 0; i < 64; i++) {
            const button = document.createElement('button');
            button.classList.add('step-button');
            button.id = `Sequence${currentSequence}-ch${channelIndex}-step-${i}`;
            
            // console.log(`[createStepButtonsForSequence] Creating button with ID: ${button.id}`);
            
            button.addEventListener('click', () => {
                let currentSequence = window.unifiedSequencerSettings.settings.masterSettings.currentSequence;
               
                        // Toggle the step state in the global object
                        let currentStepState = window.unifiedSequencerSettings.getStepState(currentSequence, channelIndex, i);
                        console.log(`[setting currentStepState using getStepState to: ${currentSequence}, Channel ${channelIndex}, Step ${i}, New State: ${!currentStepState}`);
                        window.unifiedSequencerSettings.updateStepState(currentSequence, channelIndex, i, !currentStepState);
                    
                        console.log(`[calling - updateSpecificStepUI] Step button clicked: Sequence ${currentSequence}, Channel ${channelIndex}, Step ${i}, New State: ${!currentStepState}`);
                    
                        // Update the UI for the specific step
                        updateSpecificStepUI(currentSequence, channelIndex, i);
                    });
                    stepsContainer.appendChild(button);
                }
        
                // Add other channel elements like load buttons, mute, solo, clear, etc., if they are not already present
            });
        }
        
    
    // Call the function initially on DOMContentLoaded
document.addEventListener('DOMContentLoaded', createStepButtonsForSequence);


