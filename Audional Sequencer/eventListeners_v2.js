// eventListeners_v2.js

document.addEventListener("DOMContentLoaded", function() {
    let saveButton = document.getElementById('save-button');
    let loadFileInput = document.getElementById('load-file-input');
    let loadButton = document.getElementById('load-button');
    let loadOptions = document.getElementById('loadOptions');
    let loadJson = document.getElementById('loadJson');
    let loadInternalPreset = document.getElementById('loadInternalPreset');
    let loadInternalPreset2 = document.getElementById('loadInternalPreset2');
    let loadInternalPreset3 = document.getElementById('loadInternalPreset3');
    let loadInternalPreset4 = document.getElementById('loadInternalPreset4');
    let loadInternalPreset5 = document.getElementById('loadInternalPreset5');

    saveButton.addEventListener('click', () => {
        let settings = window.unifiedSequencerSettings.exportSettings();

        // Create a Blob with the settings
        let blob = new Blob([settings], { type: 'application/json' });

        // Create a download link for the Blob
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = 'sequencer-settings.json';

        // Trigger a click on the download link
        downloadLink.click();
    });

    loadButton.addEventListener('click', () => {
        loadOptions.style.display = loadOptions.style.display === "none" || loadOptions.style.display === "" ? "block" : "none";
    });

    loadJson.addEventListener('click', () => {
        loadFileInput.click();
        loadOptions.style.display = "none";
    });

    loadFileInput.addEventListener('change', () => {
        let file = loadFileInput.files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            let settings = e.target.result;
            window.unifiedSequencerSettings.loadSettings(settings);
            console.log("Loaded file content:", settings);
    
            // Call function to update the UI based on the loaded settings
            updateUIFromLoadedSettings();
        };
        reader.readAsText(file);
    });

    function loadPresetFromFile(filePath) {
        console.log(`Loading preset from: ${filePath}`);
        fetch(filePath)
            .then(response => response.json())
            .then(jsonString => window.unifiedSequencerSettings.loadSettings(JSON.stringify(jsonString)))
            .catch(error => console.error(`Error loading preset from ${filePath}:`, error));
        loadOptions.style.display = "none";
    }
    
    loadInternalPreset.addEventListener('click', () => loadPresetFromFile('Preset_Json_Files/internalPreset1.json'));
    loadInternalPreset2.addEventListener('click', () => loadPresetFromFile('Preset_Json_Files/randomOrdinalSounds2.json'));
    loadInternalPreset3.addEventListener('click', () => loadPresetFromFile('Preset_Json_Files/Japanese_Koto_Samples.json'));
    loadInternalPreset4.addEventListener('click', () => loadPresetFromFile('Preset_Json_Files/internalPreset4.json'));
    loadInternalPreset5.addEventListener('click', () => loadPresetFromFile('Preset_Json_Files/Koto2.json'));
});

// Message event listener handling load, play, stop, pause commands
window.addEventListener('message', function(event) {
    // Implementation for handling 'load', 'play', 'stop', and 'pause' commands
});


// Close the modal when the user clicks on <span> (x)
document.querySelector('.close-button').addEventListener('click', function() {
    console.log('Close button clicked');
    document.getElementById('audio-trimmer-modal').style.display = 'none';
    console.log('Modal closed');
});

// Close the modal when the user clicks anywhere outside of the modal
window.onclick = function(event) {
    const modal = document.getElementById('audio-trimmer-modal');
    if (event.target === modal) {
        console.log('Clicked outside the modal');
        modal.style.display = 'none';
        console.log('Modal closed');
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const projectNameInput = document.getElementById('project-name');

    projectNameInput.addEventListener('input', () => {
        const projectName = projectNameInput.value;
        window.unifiedSequencerSettings.updateSetting('projectName', projectName);
    });
});