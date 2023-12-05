// audioTrimmerModuleHelperFunctions.js
let currentTrimmerInstance = null;
let currentTrimmerChannelIndex = null; // Define at a higher scope

function openAudioTrimmerModal(channelIndex) {
    console.log('channelIndex:', channelIndex); // Log the channel index
    currentTrimmerChannelIndex = channelIndex; // Store the channel index

    fetch('AudioTrimModule/audioTrimModule.html')
        .then(response => response.text())
        .then(html => {
            const container = document.getElementById('audio-trimmer-container');
            container.innerHTML = html;

            currentTrimmerInstance = new AudioTrimmer(channelIndex);
            setTimeout(() => {
                currentTrimmerInstance.initialize();
        
                const trimSettings = getTrimSettings(channelIndex);
                if (trimSettings) {
                    setStartSliderValue(currentTrimmerChannelIndex, trimSettings.startSliderValue);
                    setEndSliderValue(currentTrimmerChannelIndex, trimSettings.endSliderValue);
                    setIsLooping(currentTrimmerChannelIndex, trimSettings.isLooping);
                }
            }, 0);

            document.getElementById('audio-trimmer-modal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error loading audio trimmer module:', error);
        });
}


function updateAudioTrimmerWithBuffer(audioBuffer) {
    if (currentTrimmerChannelIndex) {
        currentTrimmerChannelIndex.setAudioBuffer(audioBuffer);
        currentTrimmerChannelIndex.drawWaveform();
        currentTrimmerChannelIndex.updateDimmedAreas();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.open-audio-trimmer').forEach((button, channelIndex) => {
        button.addEventListener('click', () => {
            console.log('Clicked button with channelIndex:', channelIndex); // Log the channel index
            openAudioTrimmerModal(channelIndex);
        });
    });
});


// Close modal functionality
document.querySelector('.close-button').addEventListener('click', function() {
    if (currentTrimmerChannelIndex && currentTrimmerChannelIndex !== null) {
        const settings = {
            startSliderValue: currentTrimmerChannelIndex.getStartSliderValue(),
            endSliderValue: currentTrimmerChannelIndex.getEndSliderValue(),
            isLooping: currentTrimmerChannelIndex.getIsLooping()
        };
        setTrimSettings(currentTrimmerChannelIndex, settings.startSliderValue, settings.endSliderValue);
    }

    document.getElementById('audio-trimmer-modal').style.display = 'none';
    currentTrimmerChannelIndex = null;
});