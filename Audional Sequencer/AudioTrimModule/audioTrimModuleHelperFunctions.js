// audioTrimmerHelperFunctions.js
let currentTrimmerInstance = null; // Define at a higher scope
let currentTrimChannelIndex = null; // Define at a higher scope to store the current channel index


function openAudioTrimmerModal(channelIndex) {
    currentTrimChannelIndex = channelIndex; // Store the channel index

    fetch('AudioTrimModule/audioTrimModule.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('audio-trimmer-container');
            container.innerHTML = html;

            currentTrimmerInstance = new AudioTrimmer(channelIndex); // Create and store the AudioTrimmer instance
            setTimeout(() => {
                currentTrimmerInstance.initialize();

                const trimSettings = getTrimSettings(channelIndex);
                if (trimSettings) {
                    setStartSliderValue(currentTrimmerInstance, trimSettings.startSliderValue);
                    setEndSliderValue(currentTrimmerInstance, trimSettings.endSliderValue);
                    setIsLooping(currentTrimmerInstance, trimSettings.isLooping);
                }
            }, 0);

            document.getElementById('audio-trimmer-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading audio trimmer module:', error);
        });
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.open-audio-trimmer').forEach((button, channelIndex) => {
        button.addEventListener('click', () => openAudioTrimmerModal(channelIndex));
    });
});

// Close modal functionality
document.querySelector('.close-button').addEventListener('click', function() {
    if (currentTrimmerInstance && currenttrimChannelIndex !== null) {
        const settings = {
            startSliderValue: currentTrimmerInstance.getStartSliderValue(),
            endSliderValue: currentTrimmerInstance.getEndSliderValue(),
            isLooping: currentTrimmerInstance.getIsLooping()
        };
        setTrimSettings(currentTrimChannelIndex, settings.startSliderValue, settings.endSliderValue, settings.isLooping);
    }

    document.getElementById('audio-trimmer-modal').style.display = 'none';
    currentTrimmerInstance = null;
    currentTrimChannelIndex = null; // Reset the channel index
});