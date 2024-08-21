let currentStep = 0;
let steps = [];
let selectedAlgorithm = 'bubble-sort';

document.getElementById('algorithm-select').addEventListener('change', (event) => {
    selectedAlgorithm = event.target.value;
});

document.getElementById('run-btn').addEventListener('click', () => {
    const code = document.getElementById('code-editor').value; 
    const arrayInput = document.getElementById('array-input').value;
    const array = arrayInput.split(',').map(Number);
    if (array.some(isNaN)) {
        alert('Please enter a valid array of numbers.');
        return;
    }
    sendCodeToBackend(code, array);
});

function sendCodeToBackend(code, array) {
    fetch('/run-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code, array: array, algorithm: selectedAlgorithm }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('visualization-area').innerText = `Error: ${data.details}`;
        } else {
            steps = data.steps;
            currentStep = 0;
            displayStep(currentStep);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('visualization-area').innerText = 'Error: Unable to process the code.';
    });
}

function displayStep(stepIndex) {
    if (!steps.length) return;
    
    const arrayState = steps[stepIndex];
    const visualizationArea = document.getElementById('visualization-area');
    visualizationArea.innerHTML = '';

    arrayState.forEach((value, index) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar';
        bar.style.height = `${value * 20}px`;
        bar.innerText = value;
        

        if (stepIndex > 0) {
            const previousArrayState = steps[stepIndex - 1];
            if (previousArrayState[index] !== value) {
                bar.classList.add('red'); 
            } else {
                bar.classList.add('green'); 
            }
        }
        
        visualizationArea.appendChild(bar);
    });
}

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        displayStep(currentStep);
    } else {
        alert('Sorting Complete! The array is fully sorted.');
    }
});
