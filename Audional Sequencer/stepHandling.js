// stepHandling.js

function handleStep(channel, channelData, totalStepCount) {
    let isMuted = channel.dataset.muted === 'true';
    const isToggleMuteStep = channelData.toggleMuteSteps.includes(totalStepCount);

    if (isToggleMuteStep) {
      isMuted = !isMuted;
      channel.dataset.muted = isMuted ? 'true' : 'false';
      // Update the mute state in the DOM
      updateMuteState(channel, isMuted);
      console.log('Mute toggled by the handleStep function');
    }

    return isMuted;
}

function renderPlayhead(buttons, currentStep) {
    buttons.forEach((button, buttonIndex) => {
        button.classList.remove('playing');
        button.classList.remove('triggered');

        if (buttonIndex === currentStep) {
            button.classList.add('playing');
        }

        if (button.classList.contains('selected')) {
            button.classList.add('triggered');
        }
    });
}


function playStep() {
    console.log("[playStep] Function called");

    // Retrieve the updated current sequence number
    const currentSequence = window.unifiedSequencerSettings.getCurrentSequence();


    const presetData = presets.preset1;

    // Iterate over all 16 channels
    for (let channelIndex = 0; channelIndex < 16; channelIndex++) {
        console.log(`[playStep] Processing channel index: ${channelIndex}`);

        const channel = channels[channelIndex];
        const buttons = channel.querySelectorAll('.step-button');
        let channelData = presetData.channels[channelIndex];
        console.log(`[playStep] Channel data for channel index ${channelIndex}:`, channelData);

        const defaultStepsArray = Array(4096).fill(false);
        renderPlayhead(buttons, currentStep, channel.dataset.muted === 'true');

        // If no channelData is found for the current channel, use a default set of values
        if (!channelData) {
            console.warn(`No preset data for channel index: ${channelIndex}`);
            channelData = {
                steps: defaultStepsArray.slice(),
                mute: false,
                url: null
            };
        }

        renderPlayhead(buttons, currentStep);
        const isMuted = handleStep(channel, channelData, totalStepCount);
        console.log(`[playStep] Mute state for channel index ${channelIndex}: ${isMuted}`);

        playSound(currentSequence, channel, currentStep);
        console.log(`[playStep] Playing sound for current sequence: ${currentSequence}, channel index: ${channelIndex}, current step: ${currentStep}`);
    }

    currentStep = (currentStep + 1) % 64;
    totalStepCount = (totalStepCount + 1);
    console.log(`[playStep-count] Total steps count: ${totalStepCount}`);


    if (currentStep % 4 === 0) {
        beatCount++;  
        console.log(`[playStep-count] Beat count: ${beatCount}`);
        emitBeat(beatCount);
    }

    if (currentStep % 16 === 0) {
        barCount = (barCount + 1);
        console.log(`[playStep-count] Bar count: ${barCount}`);
        emitBar(barCount);
    }

    if (currentStep % 64 === 0) {
        sequenceCount++;
        console.log(`[playStep-count] Sequence count: ${sequenceCount}`);

        
    
        

       // Check if we need to switch to the next sequence (continuous play logic)
        const continuousPlayCheckbox = document.getElementById('continuous-play');
        if (continuousPlayCheckbox && continuousPlayCheckbox.checked) {
            // Reset counters for the next sequence
            beatCount = 0;
            barCount = 0;
            currentStep = 0;
            totalStepCount = 0;
            console.log("[SeqDebug] [playStep-count] Continuous play enabled, moving to the next sequence");

            // Retrieve the current sequence number
            const currentSequence = window.unifiedSequencerSettings.getCurrentSequence();
            console.log(`[SeqDebug] [playStep-count] Current sequence: ${currentSequence}`);

            // Increment the sequence number and update it
            const updatedSequence = currentSequence + 1;
            window.unifiedSequencerSettings.setCurrentSequence(updatedSequence);
            console.log(`[SeqDebug] [playStep-count] Current sequence after increment: ${updatedSequence}`);

            createStepButtonsForSequence()

            // Update the UI for the new sequence
            updateUIForSequence(updatedSequence);
        }
    }
    nextStepTime += stepDuration;
    console.log(`[SeqDebug][playStep-count] Next step time: ${nextStepTime}`);

    displayUpdatedValues();
}

// function updateStepButtonsUI() {
//     console.log("[updateStepButtonsUI] Function called");
//     const currentSequence = sequences[sequenceCount]; // Get the current sequence based on sequenceCount
//     const stepButtons = document.querySelectorAll('.step-button');
//     
//     stepButtons.forEach((button, index) => {
//         // Determine the channel index from the button's parent container
//         let channelElement = button.closest('.channel');
//         let channelIndex = parseInt(channelElement.id.split('-')[1]); // Assuming the id is in the format 'channel-x'
// 
//         // Update each button's state based on the currentSequence
//         let stepState = currentSequence[index];
//         if (stepState) {
//             button.classList.add('selected');
//         } else {
//             button.classList.remove('selected');
//         }
// 
//         // Update the global object
//         window.unifiedSequencerSettings.updateStepState(sequenceCount, channelIndex, index, stepState);
// 
//         // Optional: Log for debugging
//         console.log(`Updated global object for sequence: ${sequenceCount}, channelIndex: ${channelIndex}, stepIndex: ${index}, state: ${stepState}`);
//     });
// }
// 