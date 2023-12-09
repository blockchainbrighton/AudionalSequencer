// loadSampleButtonModal.js
function setupLoadSampleButton(channel, index) {

const loadSampleButton = channel.querySelector('.load-sample-button');
                loadSampleButton.addEventListener('click', () => {

                    // Create a basic modal for audional ID input
                    const idModal = document.createElement('div');
                    idModal.style.position = 'fixed';
                    idModal.style.left = '0';
                    idModal.style.top = '0';
                    idModal.style.width = '100%';
                    idModal.style.height = '100%';
                    idModal.style.backgroundColor = 'rgba(0,0,0,0.5)';
                    idModal.style.display = 'flex';
                    idModal.style.justifyContent = 'center';
                    idModal.style.alignItems = 'center';
                    idModal.style.zIndex = '9999';

                    const idModalContent = document.createElement('div');
                    idModalContent.style.backgroundColor = 'white';
                    idModalContent.style.padding = '20px';
                    idModalContent.style.borderRadius = '10px';
                    idModalContent.style.width = '50%';
                    idModalContent.style.maxHeight = '500px';  // Adjust this value as per your needs
                    idModalContent.style.overflowY = 'auto';

                    const instructionText = document.createElement('p');
                    instructionText.textContent = 'Enter an Ordinal ID to load a Bitcoin Audional:';
                    instructionText.style.color = 'black';  // Setting the color to black
                    idModalContent.appendChild(instructionText);

                    // Add input field for Ordinal ID
                    const audionalInput = document.createElement('input');
                    audionalInput.type = 'text';
                    audionalInput.placeholder = 'Enter ORD ID:';
                    audionalInput.style.marginBottom = '10px';
                    audionalInput.style.width = '100%';
                    audionalInput.style.boxSizing = 'border-box';
                    idModalContent.appendChild(audionalInput);

                    const ipfsInstructionText = document.createElement('p');
                    ipfsInstructionText.textContent = 'Or, enter an IPFS ID for an off-chain Audional:';
                    ipfsInstructionText.style.color = 'black';  // Setting the color to black
                    idModalContent.appendChild(ipfsInstructionText);

                    // Add input field for IPFS address
                    const ipfsInput = document.createElement('input');
                    ipfsInput.type = 'text';
                    ipfsInput.placeholder = 'Enter IPFS ID:';
                    ipfsInput.style.marginBottom = '10px';
                    ipfsInput.style.width = '100%';
                    ipfsInput.style.boxSizing = 'border-box';
                    idModalContent.appendChild(ipfsInput);

                    // Event listeners to disable one input when the other is being used
                    audionalInput.addEventListener('input', () => {
                      console.log("Ordinal ID entered:", audionalInput.value);
                        if (audionalInput.value) {
                            ipfsInput.disabled = true;
                        } else {
                            ipfsInput.disabled = false;
                        }
                    });

                    ipfsInput.addEventListener('input', () => {
                        if (ipfsInput.value) {
                          console.log("IPFS CID entered:", ipfsInput.value);
                            audionalInput.disabled = true;
                        } else {
                            audionalInput.disabled = false;
                        }
                    });

                    const loadButton = document.createElement('button');
                    loadButton.textContent = 'Load';
                    loadButton.addEventListener('click', () => {
                        let url;
                        if (audionalInput.value) {
                            url = 'https://ordinals.com/content/' + getIDFromURL(audionalInput.value);
                            console.log(`Setting URL for channel ${index + 1}:`, url);
                        } else if (ipfsInput.value) {
                            url = 'https://ipfs.io/ipfs/' + ipfsInput.value;
                            console.log(`Setting IPFS URL for channel ${index + 1}:`, url);
                        }

                        if (url) {
                            // Update the URL in the global settings object at the specific channel index
                            window.unifiedSequencerSettings.updateSetting('projectURLs', url, index);

                            // Fetch and load the audio
                            fetchAudio(url, index, loadSampleButton);

                            // Update the class of the channel container
                            const channelContainer = document.querySelector(`.channel:nth-child(${index + 1}) .channel-container`);
                            if (channelContainer) {
                                channelContainer.classList.toggle('ordinal-loaded', audionalInput.value !== undefined);
                            }
                        }

                        document.body.removeChild(idModal);
                        console.log(`Updated URL for channel ${index + 1}:`, url);
                    });
                    idModalContent.appendChild(loadButton);

                    // Cancel button implementation
                    const cancelButton = document.createElement('button');
                    cancelButton.textContent = 'Cancel';
                    cancelButton.addEventListener('click', () => {
                        document.body.removeChild(idModal);
                    });
                    idModalContent.appendChild(cancelButton);

                    // Create an audio element for previewing the audionals
                    const audioPreview = new Audio();

                    // Function to play a preview
                    const playPreview = (url) => {
                      audioPreview.src = url;
                      audioPreview.play();
                    };

                    audionalIDs.forEach((audionalObj) => {
                      const idLinkContainer = document.createElement('div');
                      idLinkContainer.style.display = 'flex';
                      idLinkContainer.style.alignItems = 'center';
                      idLinkContainer.style.marginBottom = '10px';
                      idLinkContainer.style.flexDirection = 'row';
                    
                      // Create an audition play button for previewing
                      const auditionPlayButton = document.createElement('button');
                      auditionPlayButton.textContent = '▶️';
                      auditionPlayButton.style.marginRight = '10px';
                    
                      auditionPlayButton.addEventListener('click', async (e) => {
                          e.preventDefault();
                          // Construct the audionalUrl using the same logic as idLink's click event
                          const audionalUrl = 'https://ordinals.com/content/' + getIDFromURL(audionalObj.id);
                          // Use the sequencer's function to buffer and play the audio
                          playAuditionedSample(audionalUrl);
                      });
                  
                      idLinkContainer.appendChild(auditionPlayButton);
                    
                      const idLink = document.createElement('a');
                      idLink.href = '#';
                      idLink.textContent = audionalObj.label;
                      idLink.addEventListener('click', (e) => {
                          e.preventDefault();
                          const audionalUrl = 'https://ordinals.com/content/' + getIDFromURL(audionalObj.id);
                          console.log(audionalUrl); // or ipfsUrl
                          collectedURLs[index] = audionalUrl; // Instead of using .push
                            // Update the global object with the new URL
                            window.unifiedSequencerSettings.updateSetting('projectURLs', collectedURLs);
    
                          fetchAudio(audionalUrl, index, loadSampleButton);
                          document.body.removeChild(idModal);
                      });
                  
                      idLinkContainer.appendChild(idLink);
                      idModalContent.appendChild(idLinkContainer);
            

                        idLink.href = '#';
                        idLink.textContent = audionalObj.label;
                        idLink.style.display = 'block';
                        idLink.style.marginBottom = '10px';
                        idLink.addEventListener('click', (e) => {
                            e.preventDefault();
                            const audionalUrl = 'https://ordinals.com/content/' + getIDFromURL(audionalObj.id);
                            console.log(audionalUrl); // or ipfsUrl
                            collectedURLs[index] = audionalUrl; // Instead of using .push
                              // Update the global object with the new URL
                              window.unifiedSequencerSettings.updateSetting('projectURLs', collectedURLs);
    
                            fetchAudio(audionalUrl, index, loadSampleButton);
                        });
                        idModalContent.appendChild(idLink);
                    });

                    idModal.appendChild(idModalContent);
                    document.body.appendChild(idModal);
                });
                // console.log("Collected URLs before adding to sequence arrays:", collectedURLs);
                // addURLsToSequenceArrays(collectedURLs);
                
            }

            export { setupLoadSampleButton };

    