// audioUtils.js


// Function to get the ID from a URL
function getIDFromURL(url) {
  const parts = url.split('/');
  return parts[parts.length - 1];
}

// Function to convert base64 to an array buffer
function base64ToArrayBuffer(base64) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

// Function to decode audio data
const decodeAudioData = (audioData) => {
  return new Promise((resolve, reject) => {
      audioContext.decodeAudioData(audioData, resolve, reject);
  });
};

// Function to fetch and parse the HTML to find the content type
async function fetchAndParseContentType(url) {
  try {
      const response = await fetch(url);
      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      const contentTypeElement = doc.querySelector('dt:contains("content type") + dd');
      if (contentTypeElement) {
          return contentTypeElement.textContent;
      } else {
          throw new Error('Content type not found');
      }
  } catch (error) {
      console.error('Error fetching or parsing HTML:', error);
  }
}

// Function to fetch audio data
const fetchAudio = async (url, channelIndex, loadSampleButtonElement = null) => {
  try {
      console.log(`[fetchAudio] Fetching audio from URL: ${url} for channel index: ${channelIndex}`);

      const response = await fetch(url);
      let audioData;
      let filename;

      // Clone the response for a second read attempt if the first one fails
      const clonedResponse = response.clone();

      try {
          // Try to read the response as JSON
          const data = await response.json();
          audioData = base64ToArrayBuffer(data.audioData.split(',')[1]);
          filename = data.filename || data.fileName;
      } catch (e) {
          console.log("[fetchAudio] Response is not JSON, trying to read as arrayBuffer");
          try {
              audioData = await clonedResponse.arrayBuffer();
              filename = url.split('/').pop();
          } catch (e) {
              console.error("Response could not be processed as JSON or as an ArrayBuffer.", e);
              return;
          }
      }

      // Proceed with audio data processing
      const audioBuffer = await decodeAudioData(audioData);
      // Assuming audioBuffers is a Map to store audio buffers
      audioBuffers.set(url, audioBuffer);

      // Update the global object with the new URL and audio data
      window.unifiedSequencerSettings.updateSetting('projectURLs', url, channelIndex);
      window.unifiedSequencerSettings.updateSampleDuration(audioBuffer.duration, channelIndex);
      console.log(`[fetchAudio] Updated global object with URL: ${url} and duration: ${audioBuffer.duration} for channel index: ${channelIndex}`);

      if (loadSampleButtonElement) {
          loadSampleButtonElement.classList.add('button-fixed-width');
          loadSampleButtonElement.style.width = '200px';
          loadSampleButtonElement.textContent = filename ? filename.substring(0, 20) : 'Loaded Sample';
          loadSampleButtonElement.title = filename ? filename : 'Loaded Sample';
      }
  } catch (error) {
      console.error('Error fetching audio:', error);
  }
};

// Helper function to convert an ArrayBuffer to a Base64 string
function bufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Function to play sound
function playSound(channel, currentStep) {
  // Extract channelIndex from the channel element's dataset
  const channelIndex = parseInt(channel.dataset.id.split('-')[1]) - 1;

  console.log(`[playSound] Processing channel index: ${channelIndex}`);

  // Retrieve the step state from the global object
  const stepState = window.unifiedSequencerSettings.getStepState(currentSequence, channelIndex, currentStep);

  console.log(`[playSound] Step state for Channel ${channelIndex}, Step ${currentStep}:`, stepState);

  if (stepState) {
      const url = window.unifiedSequencerSettings.getAudioUrlForChannel(channelIndex);
      console.log("[playSound] URL of the audio:", url);

      const audioBuffer = audioBuffers.get(url);
      console.log(`[playSound] Audio buffer for URL ${url}:`, audioBuffer);

      if (audioBuffer) {
          console.log("[playSound] Audio buffer found for URL:", url);

          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;

          const trimSettings = window.unifiedSequencerSettings.getTrimSettingsForChannel(channelIndex);
          let trimStart = (trimSettings.startSliderValue / 100) * audioBuffer.duration;
          let trimEnd = (trimSettings.endSliderValue / 100) * audioBuffer.duration;

          trimStart = Math.max(0, Math.min(trimStart, audioBuffer.duration));
          trimEnd = Math.max(trimStart, Math.min(trimEnd, audioBuffer.duration));

          const duration = trimEnd - trimStart;

          source.connect(gainNodes[channelIndex]);
          gainNodes[channelIndex].connect(audioContext.destination);

          source.start(0, trimStart, duration);
      } else {
          console.log("[playSound] No audio buffer found for URL:", url);
      }
  } else {
      console.log("[playSound] Current step is not selected. Skipping playback.");
  }
}



async function playAuditionedSample(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();

    // Check if the expected audioData field is present
    if (data.audioData) {
      const audioData = base64ToArrayBuffer(data.audioData.split(',')[1]);

      if (!audioContext) {
        window.AudioContext = window.AudioContext || window.webkitAudioContext;
        audioContext = new AudioContext();
      }

      const audioBuffer = await decodeAudioData(audioData);
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } else {
      console.log("Audional data not found in response, attempting to fetch and parse content type.");
      const contentType = await fetchAndParseContentType(url);
      console.log(`Content type found: ${contentType}`);
      // Additional logic to handle the content type will be added here
    }
  } catch (error) {
    console.error('Error playing auditioned sample:', error);
  }
};



// Function to toggle the play state
function togglePlayState(isPlaying, startStopFunction, firstButton, secondButton) {
  if (!isPlaying) {
    isPlaying = true;
    startStopFunction();
    firstButton.classList.add('selected');
    secondButton.classList.remove('selected');
  }
}

// Function to update the mute state in a single function
function updateMuteState(channel, shouldMute) {
  const channelIndex = parseInt(channel.dataset.id.split('-')[1]) - 1;
  channel.dataset.muted = shouldMute ? 'true' : 'false';
  const muteButton = channel.querySelector('.mute-button');

  muteButton.classList.toggle('selected', shouldMute);
  channelMutes[channelIndex] = shouldMute;

  // Mute or unmute using gain node
  if (shouldMute) {
      gainNodes[channelIndex].gain.value = 0; // Mute the channel
      // console.log("updateMuteState - Channel-" + channel.dataset.id.replace("Channel-", "") + " Muted");
  } else {
      gainNodes[channelIndex].gain.value = 1; // Unmute the channel (set to original volume)
      // console.log("updateMuteState - Channel-" + channel.dataset.id.replace("Channel-", "") + " Unmuted");
  }

  // Update the dim state of the channel
  updateDimState(channel, channelIndex);

  // console.log(`Channel-${channel.dataset.id.replace("Channel-", "")} Muted: ${shouldMute}`);
}


  

// Function to handle manual toggle of the mute button
function toggleMute(channelElement) {
  const channelIndex = parseInt(channelElement.dataset.id.split('-')[1]) - 1;
  const isMuted = channelMutes[channelIndex];
  updateMuteState(channelElement, !isMuted, channelIndex);
  console.log('Mute has been toggled by the toggleMute function');
}
