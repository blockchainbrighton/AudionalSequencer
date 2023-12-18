// Define global variables
let audioContext;
let audioBuffers = {}; // To store loaded audio buffers
let sequenceData; // To store JSON data
let playbackInterval; // For timing control
let currentStep = 0; // Current step in the sequence

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        // Assuming sequenceData is a global variable in your script
        sequenceData = JSON.parse(e.target.result);
        // You can call any function here to initialize audio after loading JSON
    };
    reader.readAsText(file);
});



// Initialize the Web Audio API
function initAudioContext() {
    console.log("Initializing AudioContext");
    try {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
        console.log("AudioContext initialized:", audioContext);
    } catch (e) {
        console.error('Error initializing Web Audio API:', e);
        alert('Web Audio API is not supported in this browser');
    }
}

// Process JSON file selected by the user
function processJSONFile(file) {
    console.log("Processing JSON file:", file.name);
    const reader = new FileReader();
    reader.onload = function(e) {
        console.log("File read complete. Parsing JSON.");
        sequenceData = JSON.parse(e.target.result);
        console.log("JSON parsed:", sequenceData);
        loadAudioFiles();
    };
    reader.readAsText(file);
}

// Load audio files
async function loadAudioFiles() {
    if (!audioContext) {
        console.log("AudioContext not initialized. Initializing now.");
        initAudioContext();
    }
    console.log(`AudioContext state: ${audioContext.state}`);
    if (audioContext.state === 'suspended') {
        console.log('Resuming AudioContext');
        await audioContext.resume();
    }
    const promises = sequenceData.projectURLs.map(async (url, index) => {
        console.log(`Fetching audio from URL: ${url}`);
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        console.log(`Decoding audio data for URL: ${url}`);
        audioBuffers[index] = await audioContext.decodeAudioData(arrayBuffer);
        console.log(`Audio buffer loaded for URL: ${url}`);
    });

    try {
        await Promise.all(promises);
        console.log('All audio files loaded');
    } catch (e) {
        console.error('Error loading audio files:', e);
    }
}

// Play the sequence
function playSequence() {
    console.log("playSequence called");
    if (!audioContext) {
        console.log("Initializing AudioContext");
        initAudioContext();
    }
    console.log("Starting playback");
    // Ensure we're starting from the first step
    currentStep = 0;
    playbackInterval = setInterval(playStep, calculateStepInterval());
    console.log("Playback interval set:", playbackInterval);
}

// Stop the sequence
function stopSequence() {
    console.log("Stopping sequence");
    clearInterval(playbackInterval);
}

// Function to play audio at a specific step
function playStep() {
    console.log(`Playing step: ${currentStep}`);
    const currentSequence = sequenceData.projectSequences['Sequence' + sequenceData.currentSequence];

    Object.keys(currentSequence).forEach(channelKey => {
        const channel = currentSequence[channelKey];
        console.log(`Processing channel: ${channelKey}`);
        if (channel.steps[currentStep] && !channel.mute) {
            console.log(`Creating audio source for channel: ${channelKey}`);
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffers[channelKey];
            source.connect(audioContext.destination);
            console.log(`Audio source connected for channel: ${channelKey}`);
            source.onended = () => console.log(`Playback finished for channel: ${channelKey}`);
            source.start(0);
            console.log(`Playback started for channel: ${channelKey}`);
                    }
    });

    currentStep = (currentStep + 1) % 64; // Assuming each channel has 64 steps
    console.log(`Next step: ${currentStep}`);
}

// Calculate the interval between steps based on BPM
function calculateStepInterval() {
    const interval = (60 / sequenceData.projectBPM) * 1000;
    console.log(`Step interval calculated: ${interval}ms`);
    return interval; // Interval in milliseconds
}

// UI Button Handlers
document.getElementById('playButton').addEventListener('click', playSequence);
document.getElementById('stopButton').addEventListener('click', stopSequence);
console.log("UI button handlers set up");

// File Input Handler
document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    console.log("File selected:", file.name);
    processJSONFile(file);
});

// Initialize the Web Audio API
document.getElementById('playButton').addEventListener('click', initAudioContext);
console.log("Initialization complete");
