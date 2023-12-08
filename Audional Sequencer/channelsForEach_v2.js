// channelsForeach.js

// Reusable function to toggle mute state
function toggleMute(channel, index, isMuted) {
    const muteButton = channel.querySelector('.mute-button');
    muteButton.classList.toggle('selected', isMuted);
    gainNodes[index].gain.value = isMuted ? 0 : 1;
    updateDimState(channel, index);
}

// Function to handle solo logic
function handleSoloLogic(channel, index) {
    const soloButton = channel.querySelector('.solo-button');
    const isSoloed = soloButton.classList.contains('selected');
    soloedChannels[index] = isSoloed;

    if (isSoloed) {
        // Logic when a channel is soloed
        channels.forEach((otherChannel, otherIndex) => {
            const isOtherSoloed = soloedChannels[otherIndex];
            toggleMute(otherChannel, otherIndex, otherIndex !== index && !isOtherSoloed);
        });
    } else if (!soloedChannels.some(state => state)) {
        // Logic when no channel is soloed
        channels.forEach((otherChannel, otherIndex) => {
            const isOtherMuted = otherChannel.querySelector('.mute-button').classList.contains('selected');
            toggleMute(otherChannel, otherIndex, isOtherMuted);
        });
    }
}

channels.forEach((channel, index) => {
    channel.dataset.id = `Channel-${index}`;

    // Create and configure gain node
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 1;
    gainNode.connect(audioContext.destination);
    gainNodes[index] = gainNode;

    const muteButton = channel.querySelector('.mute-button');
    muteButton.addEventListener('click', () => {
        const isMuted = muteButton.classList.contains('selected');
        toggleMute(channel, index, !isMuted);
    });

    const soloButton = channel.querySelector('.solo-button');
    soloButton.addEventListener('click', () => {
        soloButton.classList.toggle('selected');
        handleSoloLogic(channel, index);
    });

    // Additional channel setup logic...
});

// Handle clicks outside the clear button (moved outside forEach)
document.addEventListener('click', (e) => {
    channels.forEach((channel, index) => {
        const clearButton = channel.querySelector('.clear-button');
        if (!clearButton.contains(e.target) && clearClickedOnce[index]) {
            // Reset clear button state
        }
    });
});

// Handle DOMContentLoaded (moved outside forEach)
document.addEventListener('DOMContentLoaded', () => {
    channels.forEach((channel, index) => {
        // Channel specific DOMContentLoaded logic
    });
});

// Continued refactoring...

// Other functions and logic...

channels.forEach((channel, index) => {
    // Clear button logic
    const clearButton = channel.querySelector('.clear-button');
    const clearConfirm = channel.querySelector('.clear-confirm');

    clearButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (!clearClickedOnce[index]) {
            clearButton.classList.add('flashing');
            clearButton.classList.remove('dimmed');
            clearClickedOnce[index] = true;

            clearConfirmTimeout[index] = setTimeout(() => {
                resetClearButtonState(channel, index);
            }, 2000);
        } else {
            // Logic to clear the steps and update sequence data
            clearStepsAndSequence(channel, index);
            resetClearButtonState(channel, index);
        }
    });

    // Load sample button logic
    const loadSampleButton = channel.querySelector('.load-sample-button');
    loadSampleButton.addEventListener('click', () => {
        createAndShowModal(channel, index);
    });
});

// Reusable function to reset the clear button state
function resetClearButtonState(channel, index) {
    const clearButton = channel.querySelector('.clear-button');
    const clearConfirm = channel.querySelector('.clear-confirm');

    clearConfirm.style.display = "none";
    clearTimeout(clearConfirmTimeout[index]);
    clearClickedOnce[index] = false;
    clearButton.classList.remove('flashing');
    clearButton.classList.add('dimmed');
}

// Function to clear steps and update sequence
function clearStepsAndSequence(channel, index) {
    const stepButtons = channel.querySelectorAll('.step-button');
    stepButtons.forEach(button => button.classList.remove('selected'));

    let stepSettings = [null].concat(Array(64).fill(false));
    updateSequenceData({
        channelIndex: index,
        stepSettings: stepSettings
    });
}

// Function to create and show the modal for loading samples
function createAndShowModal(channel, index) {
    // Modal creation and setup logic
}

// Additional functions and utilities...

// Ensure that any additional logic or functions you have are included here, following the same principles of optimization and organization. This includes any event listeners, utility functions, or any other code segments that are part of your script.

// End of refactoring
