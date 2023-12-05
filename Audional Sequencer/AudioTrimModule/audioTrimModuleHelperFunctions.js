// audioTrimmerHelperFunctions.js
let currentTrimmerInstance = null; // Define at a higher scope


document.addEventListener('DOMContentLoaded', function() {
    // Add event listener to all "T" buttons
    document.querySelectorAll('.open-audio-trimmer').forEach((button, index) => {
        button.addEventListener('click', function() {
            openAudioTrimmerModal(index); // Pass the channel index

            // Create and store the AudioTrimmer instance
            currentTrimmerInstance = new AudioTrimmer(channelIndex);
        });
    });
});