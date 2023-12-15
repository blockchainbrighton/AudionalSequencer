// stepHandling.js

function handleStep(channel, channelData, totalStepCount) {
    console.log('handleStep entered');
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
    console.log('renderPlayhead entered');
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
    console.log("[stepHandling][playStep] Function entered");

    // Current sequence number and preset data
    const currentSequence = window.unifiedSequencerSettings.getCurrentSequence();
    const presetData = presets.preset1;

    // Iterate over all channels
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
        // Increment step counters and emit beats/bars if needed
    }

        // Handle moving to the next sequence if needed
        incrementStepCounters();
        handleSequenceTransition(currentSequence);
        // displayUpdatedValues();
    }

function incrementStepCounters() {
    currentStep = (currentStep + 1) % 64;
    totalStepCount = (totalStepCount + 1);
    nextStepTime += stepDuration;


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
        console.log(`[playStep-count] Sequence count: ${sequenceCount}`);
    }
    console.log(`[SeqDebug][playStep-count] Next step time: ${nextStepTime}`);
}

// Check if we need to switch to the next sequence (continuous play logic)
function handleSequenceTransition(targetSequence) {
    console.log("[SeqDebug][stepHandling] handleSequenceTransition entered");
    // Inside handleSequenceTransition
    console.log(`[SeqDebug] handleSequenceTransition called with sequence: ${targetSequence}`);


    // Set the target sequence
    window.unifiedSequencerSettings.setCurrentSequence(targetSequence);
    console.log(`[SeqDebug][stepHandling] Sequence set to ${targetSequence} at ${new Date().toLocaleTimeString()}`);

    // Reset counters, recreate step buttons, and update UI
    resetCountersForNewSequence();
    createStepButtonsForSequence();

    // Delay updating the UI to ensure DOM has updated
    setTimeout(() => {
        updateUIForSequence(targetSequence);
        console.log(`[SeqDebug][handleSequenceTransition][stepHandling] UI updated for sequence ${targetSequence} at ${new Date().toLocaleTimeString()}`);
    }, 100); // Adjust delay as needed
}




function resetCountersForNewSequence() {
    beatCount = 0;
    barCount = 0;
    currentStep = 0;
    totalStepCount = 0;
}


// displayUpdatedValues();
