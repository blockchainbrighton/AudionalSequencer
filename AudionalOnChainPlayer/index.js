// Define global variables
let audioContext;
let audioBuffers = {};
let playbackInterval;
let currentStep = 0;
let currentSequenceIndex = 0; // Current sequence index
let sequenceData = {};
let totalSequenceCount = 0;

document.getElementById('fileInput').addEventListener('change', async function(event) {
    const file = event.target.files[0];
    console.log("File selected:", file.name);
    sequenceData = await readJSONFile(file);
    totalSequenceCount = Object.keys(sequenceData.projectSequences).length;
    console.log(`Total sequences: ${totalSequenceCount}`);
    await initializeAudioContext();
    await loadAudioBuffers(sequenceData);
});

async function readJSONFile(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                console.log("JSON parsed:", data);
                resolve(data);
            } catch (error) {
                console.error('Error parsing JSON:', error);
                reject(error);
            }
        };
        reader.readAsText(file);
    });
}

async function initializeAudioContext() {
    if (!audioContext) {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
            console.log("AudioContext initialized:", audioContext);
        } catch (e) {
            console.error('Error initializing Web Audio API:', e);
            alert('Web Audio API is not supported in this browser');
        }
    }
    if (audioContext.state === 'suspended') {
        await audioContext.resume();
    }
}

async function loadAudioBuffers(sequenceData) {
    const promises = sequenceData.projectURLs.map(async (url, index) => {
        if (!audioBuffers[index]) {
            console.log(`Fetching audio from URL: ${url}`);
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();
            audioBuffers[sequenceData.projectChannelNames[index]] = await audioContext.decodeAudioData(arrayBuffer);
            console.log(`Audio buffer loaded for channel: ${sequenceData.projectChannelNames[index]}`);
        }
    });

    try {
        await Promise.all(promises);
        console.log('All audio files loaded');
    } catch (e) {
        console.error('Error loading audio files:', e);
    }
}

function playSequence() {
    currentStep = 0;
    currentSequenceIndex = 0;
    playbackInterval = setInterval(playStep, calculateStepInterval(sequenceData));
    console.log("Playback started");
}

function stopSequence() {
    clearInterval(playbackInterval);
    console.log("Playback stopped");
}

function playStep() {
    if (currentSequenceIndex >= totalSequenceCount) {
        stopSequence();
        console.log("Completed all sequences");
        return;
    }

    const sequenceKey = 'Sequence' + currentSequenceIndex;
    const currentSequence = sequenceData.projectSequences[sequenceKey];
    Object.keys(currentSequence).forEach(channelKey => {
        const channel = currentSequence[channelKey];
        if (channel.steps[currentStep] && !channel.mute) {
            const source = audioContext.createBufferSource();
            source.buffer = audioBuffers[channelKey];
            source.connect(audioContext.destination);
            source.start(0);
        }
    });

    currentStep++;
    if (currentStep >= 64) { // Assuming each channel has 64 steps
        currentStep = 0;
        currentSequenceIndex++;
    }
}

function calculateStepInterval(sequenceData) {
    return (60 / sequenceData.projectBPM) * 1000;
}

document.getElementById('playButton').addEventListener('click', playSequence);
document.getElementById('stopButton').addEventListener('click', stopSequence);