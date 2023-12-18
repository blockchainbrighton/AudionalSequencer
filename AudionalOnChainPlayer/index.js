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
    const promises = sequenceData.projectURLs.map(async (url) => {
        if (url && !audioBuffers[url]) { // Check if URL exists and buffer is not already loaded
            console.log(`Fetching audio from URL: ${url}`);
            try {
                const response = await fetch(url);
                const arrayBuffer = await response.arrayBuffer();
                audioBuffers[url] = await audioContext.decodeAudioData(arrayBuffer);

                console.log(`Audio buffer loaded for URL: ${url}`);
                // ... additional logs
            } catch (error) {
                console.error(`Error loading audio from URL ${url}:`, error);
            }
        }
    });

    try {
        await Promise.all(promises);
        console.log('All audio files loaded');
    } catch (e) {
        console.error('Error in loading audio files:', e);
    }
}




function playSequence() {
    console.log("playSequence called");
    currentStep = 0;
    currentSequenceIndex = 0;
    playbackInterval = setInterval(playStep, calculateStepInterval(sequenceData));
    console.log("Playback started");
}

function stopSequence() {
    console.log("Stopping sequence");
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
    console.log(`Playing sequence ${sequenceKey}, step ${currentStep}`);

    Object.keys(currentSequence).forEach(channelKey => {
        const channel = currentSequence[channelKey];
        const url = channel.url; // Assuming each channel has a 'url' field
        const buffer = audioBuffers[url];

        console.log(`Channel ${channelKey} - Buffer available: ${!!buffer}, Step: ${currentStep}, Mute: ${channel.mute}, Step Data: ${channel.steps[currentStep]}`);

        if (channel.steps[currentStep] && !channel.mute && buffer) {
            const source = audioContext.createBufferSource();
            source.buffer = buffer;

            const gainNode = audioContext.createGain();
            gainNode.gain.value = 1; // Adjust volume if necessary

            source.connect(gainNode);
            gainNode.connect(audioContext.destination);

            source.start(0);
            source.onended = () => console.log(`Finished playing sound for channel ${channelKey}`);

            console.log(`Playing sound for channel ${channelKey}`);

        } else {
            if (!buffer) {
                console.warn(`Buffer not available for channel ${channelKey} at step ${currentStep}`);
            }
            if (channel.mute) {
                console.log(`Channel ${channelKey} is muted at step ${currentStep}`);
            }
            if (!channel.steps[currentStep]) {
                console.log(`Channel ${channelKey} has no step ${currentStep} data`);
            }
        }
    });

    currentStep++;
    if (currentStep >= 64) { // Assuming each channel has 64 steps
        currentStep = 0;
        currentSequenceIndex++;
        console.log(`Moving to next sequence: Sequence${currentSequenceIndex}`);
    }
}


function calculateStepInterval(sequenceData) {
    return (60 / sequenceData.projectBPM) * 1000;
}

document.getElementById('playButton').addEventListener('click', playSequence);
document.getElementById('stopButton').addEventListener('click', stopSequence);