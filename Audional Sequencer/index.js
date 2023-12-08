// index.js


let isPlaying = false;
let currentStep = 0;
let totalStepCount = 0
let beatCount = 1; // individual steps
let barCount = 1; // bars

let sequenceCount = 0;
let currentSequence = 0;

const sequenceLength = 64;
const maxSequenceCount = 64; // sequences
const allSequencesLength = 4096;
const collectedURLs = Array(16).fill(''); 

let timeoutId;
let isPaused = false; // a flag to indicate if the sequencer is paused
let pauseTime = 0;  // tracks the total paused time
let stopClickCount = 0;
let playButton = document.getElementById('play');
let stopButton = document.getElementById('stop');
let saveButton = document.getElementById('save-button');
let loadButton = document.getElementById('load-button');
// let bpm ;
let audioContext;
let currentStepTime;
let startTime;
let nextStepTime;
let stepDuration;
let gainNodes = Array(16).fill(null);
let isMuted = false;
let channelMutes = []; // Declare the channelMutes array as a global variable
let muteState = false
let volumeStates = Array(16).fill(1); // Start with full volume for all channels
let soloedChannels = Array(16).fill(false); // Assuming you have 16 channels
const audioBuffers = new Map();
let channels = document.querySelectorAll('.channel[id^="channel-"]');
let activeChannels = 16;// new Set();
let clearClickedOnce = Array(channels.length).fill(false);
let clearConfirmTimeout = Array(channels.length).fill(null);

let isContinuousPlay = false;

const continuousPlayButton = document.getElementById('continuous-play');
continuousPlayButton.addEventListener('click', () => {
    isContinuousPlay = !isContinuousPlay;  // Toggle the continuous play mode
    continuousPlayButton.classList.toggle('selected', isContinuousPlay);
});


    if (!audioContext) {
        try {
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            audioContext = new AudioContext();
        } catch (e) {
            console.warn('Web Audio API is not supported in this browser');
        }
    }

    // Function to update the actual volume
    function updateVolume(channel, index) {
      if (soloedChannels.some(state => state)) {
          // If any channel is soloed, reduce volume to 0 for non-soloed channels
          gainNodes[index].gain.value = soloedChannels[index] ? 1 : 0;
      } else {
          // Otherwise, use the volume state
          gainNodes[index].gain.value = volumeStates[index];
      }
    }
    // Function to update the dim state based on gain value
    function updateDimState(channel, index) {
        const stepButtons = channel.querySelectorAll('.step-button');
        if (gainNodes[index].gain.value === 0) {
            stepButtons.forEach(button => button.classList.add('dimmed'));
        } else {
            stepButtons.forEach(button => button.classList.remove('dimmed'));
        }
    }
    

// Global document click listener for clear buttons
document.addEventListener('click', () => {
    channels.forEach((channel, channelIndex) => {
        if (clearClickedOnce[channelIndex]) {
            const clearConfirm = channel.querySelector('.clear-confirm');
            clearConfirm.style.display = "none";
            clearTimeout(clearConfirmTimeout[channelIndex]);
            clearClickedOnce[channelIndex] = false;
        }
    });
});










        if (playButton && stopButton) {
          const channel1 = document.querySelector('#channel-0 .step-button:nth-child(4n+1)');
          if (channel1) channel1.classList.add('selected');

          const channel2Beat1 = document.querySelector('#channel-1 .step-button:nth-child(1)');
          if (channel2Beat1) channel2Beat1.classList.add('selected');

          const channel2Beat6 = document.querySelector('#channel-1 .step-button:nth-child(6)');
          if (channel2Beat6) channel2Beat6.classList.add('selected');

          let isPaused = false;  // Add this line to declare the isPaused flag

          function checkContinuousPlay() {
            const continuousPlayCheckbox = document.getElementById('continuous-play');
            let isContinuousPlay = continuousPlayCheckbox.checked;
        
            if (isContinuousPlay && totalStepCount >= allSequencesLength) {
                // Reset counters for the next sequence
                beatCount = 0;
                barCount = 0;
                currentStep = 0;
                totalStepCount = 0;
        
                // Simulate a click on the "Next Sequence" button
                document.getElementById('next-sequence').click();
            }
        }
        
        
        
        // function updateCollectedURLsForSequences() {
        //     // Assuming collectedURLsForSequences is a 2D array where each inner array represents URLs for a sequence.
        //     if (!collectedURLsForSequences[currentSequence - 1]) {
        //         collectedURLsForSequences[currentSequence - 1] = [];
        //     }
        //     collectedURLsForSequences[currentSequence - 1] = [...collectedURLs];
        //     console.log(`index.js loadButton: Updated collectedURLsForSequences for sequence ${currentSequence}:`, collectedURLsForSequences[currentSequence - 1]);
        // }
        
        // Inside your playButton event listener, after the play logic
        playButton.addEventListener('click', () => {            const continuousPlayCheckbox = document.getElementById('continuous-play');
            let isContinuousPlay = continuousPlayCheckbox.checked;

            if (!isPlaying) {
                startScheduler();
                emitPlay(); 
                playButton.classList.add('selected');
                stopButton.classList.remove('selected');
                isPlaying = true;
                isPaused = false;  // Ensure that the isPaused flag is set to false when starting playback
            } else if (!isPaused) {  // If the sequencer is playing and is not paused, pause the sequencer
                pauseScheduler();
                emitPause();
                isPaused = true;
            } else {  // If the sequencer is paused, resume the sequencer
                resumeScheduler();
                emitResume();  // Assuming you'd like to inform other parts of your application that the sequencer is resuming
                isPaused = false;
            }
        
            if (isContinuousPlay && totalStepCount >= allSequencesLength) {
                // Reset counters for the next sequence
                beatCount = 0;
                barCount = 0;
                sequenceCount = 0;
                currentStep = 0;
                totalStepCount = 0;
        
                // Load the next sequence here (assuming you have a function or method to do so)
                // For example, you can increment the sequenceCount and use it to load the next preset.
                sequenceCount++;
                if (sequenceCount > maxSequenceCount) {  // Assuming maxSequenceCount is the total number of sequences you have
                    sequenceCount = 1;  // Reset to the first sequence if we're at the end
                }
                loadPreset(`preset${sequenceCount}`);  // Load the next sequence
            }
            // After the sequencer starts, checks for continuous play
            checkContinuousPlay();
        });
        

          stopButton.addEventListener('click', () => {
            
              if (isPlaying) {
                  stopScheduler();
                  emitStop();
                  stopButton.classList.add('selected');
                  playButton.classList.remove('selected');
                  isPlaying = false;
                  isPaused = false;  // Reset the isPaused flag when stopping the sequencer
                  beatCount = 0;  // reset the beat count
                  barCount = 0; // reset the bar count
                  sequenceCount = 0; // reset the sequence count
                  currentStep = 0;  // reset the step count
                  totalStepCount = 0;
                  resetStepLights();  // reset the step lights
              }
          });

        } else {
          console.error("Play or Stop button is not defined");
        }


// The loadPreset function is updated to use updateMuteState function
const loadPreset = (preset) => {
    // console.log("loadPreset: before loadPreset, gainNodes values:", gainNodes.map(gn => gn.gain.value));

    // console.log("loadPreset: Loading preset:", preset);

    const presetData = presets[preset];
    if (!presetData) {
        console.error('Preset not found:', preset);
        return;
    }

    channels.forEach((channel, index) => {
        const channelData = presetData.channels[index];
        if (!channelData) {
            console.warn(`No preset data for channel index: ${index + 1}`);
            return;
        }

        const { url, triggers, toggleMuteSteps, mute } = channelData;

        if (url) {
            const loadSampleButton = document.querySelector(`.channel[data-id="Channel-${index + 1}"] .load-sample-button`);
            fetchAudio(url, index, loadSampleButton).then(() => {
                const audioTrimmer = getAudioTrimmerInstanceForChannel(index);
                if (audioTrimmer) {
                    audioTrimmer.loadSampleFromURL(url).then(() => {
                        // Set initial trim settings
                        const startSliderValue = channelData.trimSettings?.startSliderValue || 0.01;
                        const endSliderValue = channelData.trimSettings?.endSliderValue || audioTrimmer.totalSampleDuration;
                        audioTrimmer.setStartSliderValue(startSliderValue);
                        audioTrimmer.setEndSliderValue(endSliderValue);

                        // Update global settings
                        window.unifiedSequencerSettings.setTrimSettings(index, startSliderValue, endSliderValue);
                    });
                }
            });
        }

    triggers.forEach(pos => {
      const btn = document.querySelector(`.channel[data-id="Channel-${index + 1}"] .step-button:nth-child(${pos})`);
      if (btn) btn.classList.add('selected');
    });

    toggleMuteSteps.forEach(pos => {
      const btn = document.querySelector(`.channel[data-id="Channel-${index + 1}"] .step-button:nth-child(${pos})`);
      if (btn) btn.classList.add('toggle-mute');
      console.log(`Channel-${index + 1} loadPreset classList.add`);
    });

    const channelElement = document.querySelector(`.channel[data-id="Channel-${index + 1}"]`);
    if (channelElement) {
      updateMuteState(channelElement, mute); 
      // console.log(`Channel-${index + 1} updateMuteState toggled by the loadPreset function - Muted: ${mute}`);
      
      // Add the 'ordinal-loaded' class to the channel element
      channelElement.classList.add('ordinal-loaded');
    }
  });
  console.log(preset);
  // Load settings into the internal array
  loadChannelSettingsFromPreset(presets[preset]);
  console.log("loadPreset: After loadPreset, gainNodes values:", gainNodes.map(gn => gn.gain.value));

};
