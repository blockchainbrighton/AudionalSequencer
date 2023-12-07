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

    // Assuming 'currentSequence' is the currently selected sequence number
    const currentSequenceData = window.unifiedSequencerSettings.getSettings('projectSequences')[`Sequence${currentSequence}`];
    console.log(`[playStep] Current sequence data:`, currentSequenceData);

    // Only iterate over active channels
    activeChannels.forEach((channelIndex) => {
        console.log(`[playStep] Processing channel index: ${channelIndex}`);

        const channel = channels[channelIndex];
        const buttons = channel.querySelectorAll('.step-button');

        // Get the step state for the current step from the global object
        const stepState = currentSequenceData && currentSequenceData[`ch${channelIndex + 1}`] ? currentSequenceData[`ch${channelIndex + 1}`][currentStep] : false;
        console.log(`[playStep] Step state for Channel ${channelIndex}, Step ${currentStep}:`, stepState);

        // Get the mute state for the current channel from the global object
        const isMuted = window.unifiedSequencerSettings.getChannelMuteState(channelIndex);
        console.log(`[playStep] Mute state for Channel ${channelIndex}:`, isMuted);

        renderPlayhead(buttons, currentStep, isMuted);
        playSound(channel, currentStep, stepState);
    });

    currentStep = (currentStep + 1) % 64;
    totalStepCount = (totalStepCount + 1);

    if (currentStep % 4 === 0) {
        beatCount++;  
        emitBeat(beatCount);
    }

    if (currentStep % 16 === 0) {
        barCount = (barCount + 1);
        emitBar(barCount);
    }

    if (currentStep % 64 === 0) {
        sequenceCount++;

        

        // Check if we need to switch to the next sequence (continuous play logic)
        const continuousPlayCheckbox = document.getElementById('continuous-play');
        if (continuousPlayCheckbox && continuousPlayCheckbox.checked) {
            // Reset counters for the next sequence
            beatCount = 0;
            barCount = 0;
            currentStep = 0;
            totalStepCount = 0;

            // Use the next-sequence button logic to move to the next sequence
            document.getElementById('next-sequence').click();
        }
        console.log(`[playStep] Next step: ${currentStep}, Total steps count: ${totalStepCount}`);

    }

    nextStepTime += stepDuration;
    displayUpdatedValues();
}

function updateStepButtonsUI() {
    const currentSequence = sequences[sequenceCount - 1]; // Get the current sequence based on sequenceCount
    const stepButtons = document.querySelectorAll('.step-button');
    
    stepButtons.forEach((button, index) => {
        // Determine the channel index from the button's parent container
        let channelElement = button.closest('.channel');
        let channelIndex = parseInt(channelElement.id.split('-')[1]) - 1; // Assuming the id is in the format 'channel-x'

        // Update each button's state based on the currentSequence
        let stepState = currentSequence[index];
        if (stepState) {
            button.classList.add('selected');
        } else {
            button.classList.remove('selected');
        }

        // Update the global object
        window.unifiedSequencerSettings.updateStepState(sequenceCount, channelIndex, index, stepState);

        // Optional: Log for debugging
        console.log(`Updated global object for sequence: ${sequenceCount}, channelIndex: ${channelIndex}, stepIndex: ${index}, state: ${stepState}`);
    });
}
