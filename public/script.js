let currentStep = 0;
let steps = [];
let interval = null;
let isPaused = true;

document.getElementById('run-btn').addEventListener('click', () => {
    const code = codeEditor.getValue();
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
        body: JSON.stringify({ code: code, array: array }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('visualization-area').innerText = `Error: ${data.details}`;
        } else {
            steps = data.steps;
            currentStep = 0;
            displayStep(currentStep);
            isPaused = false;
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

    arrayState.forEach((value) => {
        const bar = document.createElement('div');
        bar.className = 'array-bar';
        bar.style.height = `${value * 20}px`; 
        bar.innerText = value;
        visualizationArea.appendChild(bar);
    });
}

document.getElementById('next-btn').addEventListener('click', () => {
    if (currentStep < steps.length - 1) {
        currentStep++;
        displayStep(currentStep);
    } else {
        alert('No more steps.');
    }
});

document.getElementById('pause-btn').addEventListener('click', () => {
    isPaused = true;
    clearInterval(interval);
});

document.getElementById('reset-btn').addEventListener('click', () => {
    isPaused = true;
    currentStep = 0;
    displayStep(currentStep);
    clearInterval(interval);
});
