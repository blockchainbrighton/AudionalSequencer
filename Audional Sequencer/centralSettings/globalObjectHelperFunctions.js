// globalObjectHelperFunctions.js

let currentChannelIndex = null; // Define at a higher scope

// Function to save trim settings
function setTrimSettings(channelIndex, startSliderValue, endSliderValue, isLooping) {
    window.unifiedSequencerSettings.setTrimSettingsForChannel(channelIndex, startSliderValue, endSliderValue, isLooping);
}

// Function to get trim settings
function getTrimSettings(channelIndex) {
    return window.unifiedSequencerSettings.getTrimSettingsForChannel(channelIndex);
}

function setStartSliderValue(trimmer, value) {
    trimmer.startSliderValue = value;
    if (trimmer.startSlider) {
        trimmer.startSlider.value = value;
    }
}

function setEndSliderValue(trimmer, value) {
    trimmer.endSliderValue = value;
    if (trimmer.endSlider) {
        trimmer.endSlider.value = value;
    }
}

function setIsLooping(trimmer, isLooping) {
    trimmer.isLooping = isLooping;
    // Additional logic to handle the looping state if needed
}

// Close modal functionality
document.querySelector('.close-button').addEventListener('click', function() {
    const trimmer = new AudioTrimmer(channelIndex); // Ensure channelIndex is defined or retrieved

    const settings = {
        startSliderValue: trimmer.getStartSliderValue(),
        endSliderValue: trimmer.getEndSliderValue(),
        isLooping: trimmer.getIsLooping()
    };

    setTrimSettings(trimmer.channelIndex, settings.startSliderValue, settings.endSliderValue, settings.isLooping);

    document.getElementById('audio-trimmer-modal').style.display = 'none';
});

function openAudioTrimmerModal(channelIndex) {
    currentChannelIndex = channelIndex; // Store the channel index

    fetch('AudioTrimModule/audioTrimModule.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('audio-trimmer-container');
            container.innerHTML = html;

            const trimmer = new AudioTrimmer(channelIndex);
            if (typeof AudioTrimmer === 'function') {
                setTimeout(() => {
                    trimmer.initialize();

                    // Retrieve audio sample URL and trim settings for the channel
                    const trimSettings = getTrimSettings(channelIndex);

                    if (trimSettings) {
                        setStartSliderValue(trimmer, trimSettings.startSliderValue);
                        setEndSliderValue(trimmer, trimSettings.endSliderValue);
                        setIsLooping(trimmer, trimSettings.isLooping);
                    }
                }, 0);
            }

            document.getElementById('audio-trimmer-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading audio trimmer module:', error);
        });
}

// Add implementations for getAudioUrlForChannel and getTrimSettingsForChannel in UnifiedSequencerSettings
