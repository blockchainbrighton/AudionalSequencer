    // loadSampleButtonModal.js
    function setupLoadSampleButton(channel, index) {
        const loadSampleButton = channel.querySelector('.load-sample-button');
        loadSampleButton.addEventListener('click', () => openModal(index));
    }

    function openModal(index) {
        const idModal = createModal();
        const idModalContent = createModalContent();
        idModal.appendChild(idModalContent);

        // Add instruction texts, inputs, and buttons
        idModalContent.appendChild(createTextParagraph('Enter an Ordinal ID to load a Bitcoin Audional:'));
        const audionalInput = createInputField('Enter ORD ID:');
        idModalContent.appendChild(audionalInput);

        idModalContent.appendChild(createTextParagraph('Or, enter an IPFS ID for an off-chain Audional:'));
        const ipfsInput = createInputField('Enter IPFS ID:');
        idModalContent.appendChild(ipfsInput);

        addInputListeners(audionalInput, ipfsInput);

        // Add Load and Cancel buttons
        idModalContent.appendChild(createButton('Load', () => handleLoad(index, audionalInput, ipfsInput, idModal)));
        idModalContent.appendChild(createButton('Cancel', () => document.body.removeChild(idModal)));

        document.body.appendChild(idModal);
    }

    function createModal() {
        const modal = document.createElement('div');
        modal.className = 'loadSampleButtonModal'; // Updated class name
        return modal;
    }

    function createModalContent() {
        const content = document.createElement('div');
        content.className = 'loadSampleButtonModal-content'; // Updated class name
        return content;
    }

    function createTextParagraph(text) {
        const paragraph = document.createElement('p');
        paragraph.textContent = text;
        paragraph.className = 'loadSampleButtonModal-text'; // Updated class name
        return paragraph;
    }

    function createInputField(placeholder) {
        const input = document.createElement('input');
        input.type = 'text';
        input.placeholder = placeholder;
        input.className = 'loadSampleButtonModal-input'; // Updated class name
        return input;
    }

    function addInputListeners(audionalInput, ipfsInput) {
        audionalInput.addEventListener('input', () => {
            ipfsInput.disabled = !!audionalInput.value;
        });

        ipfsInput.addEventListener('input', () => {
            audionalInput.disabled = !!ipfsInput.value;
        });
    }

    function createButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.addEventListener('click', onClick);
        return button;
    }

    function handleLoad(index, audionalInput, ipfsInput, idModal) {
        let url;
        if (audionalInput.value) {
            url = 'https://ordinals.com/content/' + getIDFromURL(audionalInput.value);
        } else if (ipfsInput.value) {
            url = 'https://ipfs.io/ipfs/' + ipfsInput.value;
        }
    
        if (url) {
            // Update the URL in the global settings object at the specific channel index
            window.unifiedSequencerSettings.updateSetting('projectURLs', url, index);
            console.log(`Updated URL for channel ${index + 1}:`, url); // Debug log
            // Fetch and load the audio
            fetchAudio(url, index, loadSampleButton);
            console.log(`Fetched audio for channel ${index + 1}`); // Debug log
            // Update the class of the channel container
            const channelContainer = document.querySelector(`.channel:nth-child(${index + 1}) .channel-container`);
            if (channelContainer) {
                channelContainer.classList.toggle('ordinal-loaded', audionalInput.value !== undefined);
                console.log(`Updated channelContainer class for channel ${index + 1}`); // Debug log
    
                updateButtonAfterLoading(index, loadSampleButton); // Call the helper function
                console.log(`Updated button text for channel ${index + 1}`); // Debug log
            }
        }
        document.body.removeChild(idModal);
        console.log(`Removed modal for channel ${index + 1}`); // Debug log
    }
    
    // Helper function to update button text after loading a sample
    function updateButtonAfterLoading(channelIndex, button) {
        if (window.unifiedSequencerSettings && typeof window.unifiedSequencerSettings.updateLoadSampleButtonText === 'function') {
            window.unifiedSequencerSettings.updateAllLoadSampleButtonTexts(channelIndex, button);
        }
        console.log(`Updated button text for channel ${channelIndex + 1}`); // Debug log
    }
    
    export { setupLoadSampleButton };
    
