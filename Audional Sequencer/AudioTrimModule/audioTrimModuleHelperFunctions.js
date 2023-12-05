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
            console.log("[HTML Injection] Content injected into audio-trimmer-container:", container.innerHTML);

            // Wait for the browser to render the injected HTML
            requestAnimationFrame(() => {
                currentTrimmerInstance = new AudioTrimmer(channelIndex);
        
                if (document.getElementById('waveformCanvas')) {
                    currentTrimmerInstance.initialize();
        
                    // Retrieve trim settings for the channel from the global object
                    const trimSettings = getTrimSettings(channelIndex);
                    if (trimSettings) {
                        // Apply the trim settings to the current trimmer instance
                        currentTrimmerInstance.startSlider.value = trimSettings.startSliderValue;
                        currentTrimmerInstance.endSlider.value = trimSettings.endSliderValue;
                        currentTrimmerInstance.setIsLooping(trimSettings.isLooping); // Set looping state
        
                        // Update the trimmer instance with the new slider values
                        currentTrimmerInstance.updateSliderValues();
                    }
                } else {
                    console.error('Required elements not found in the DOM');
                }
            });

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
    if (currentTrimmerInstance) {
        const settings = {
            startSliderValue: currentTrimmerInstance.getStartSliderValue(),
            endSliderValue: currentTrimmerInstance.getEndSliderValue(),
            isLooping: currentTrimmerInstance.getIsLooping()
        };
        setTrimSettings(currentTrimmerChannelIndex, settings.startSliderValue, settings.endSliderValue, settings.isLooping);
    }

    document.getElementById('audio-trimmer-modal').style.display = 'none';
    currentTrimmerInstance = null;
    currentTrimmerChannelIndex = null;
});