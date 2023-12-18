// jsonAnalysis.js

document.getElementById('fileInput').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const jsonData = JSON.parse(e.target.result);
            displayJSONStructure(jsonData);
        } catch (error) {
            console.error('Error parsing JSON:', error);
            displayError('Invalid JSON file');
        }
    };
    reader.readAsText(file);
});

function displayJSONStructure(jsonData) {
    const structureDescription = analyzeJSONStructure(jsonData);
    const displayArea = document.getElementById('jsonStructureDisplay');
    if (!displayArea) {
        console.error('Display area not found');
        return;
    }
    displayArea.innerHTML = structureDescription;
}

function analyzeJSONStructure(jsonData) {
    let description = '<h3>JSON Structure Analysis:</h3>';
    Object.keys(jsonData).forEach(key => {
        description += `<p><strong>${key}:</strong> `;
        if (Array.isArray(jsonData[key])) {
            description += `Array with ${jsonData[key].length} elements`;
            if (jsonData[key].length > 0) {
                description += ` (e.g., ${JSON.stringify(jsonData[key][0]).substring(0, 30)}...)`;
            }
        } else if (typeof jsonData[key] === 'object') {
            description += `Object with keys: ${Object.keys(jsonData[key]).join(', ')}`;
        } else {
            description += `Value: ${jsonData[key]}`;
        }
        description += '</p>';
    });
    return description;
}

function displayError(message) {
    const displayArea = document.getElementById('jsonStructureDisplay');
    if (displayArea) {
        displayArea.innerHTML = `<p class="error">${message}</p>`;
    }
}

// Add a div in your HTML where the structure will be displayed
// For example: <div id="jsonStructureDisplay"></div>
