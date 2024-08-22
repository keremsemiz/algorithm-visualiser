let currentStep = 0;
let steps = [];
let selectedAlgorithm = 'bubble-sort';
let speed = 1000;

document.getElementById('algorithm-select').addEventListener('change', (event) => {
    selectedAlgorithm = event.target.value;
});

document.getElementById('speed-control').addEventListener('input', (event) => {
    speed = event.target.value;
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

document.getElementById('random-btn').addEventListener('click', () => {
    const arraySize = 10;
    const randomArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100));
    document.getElementById('array-input').value = randomArray.join(',');
});

function sendCodeToBackend(code, array) {
    const feedbackElement = document.getElementById('feedback');
    feedbackElement.innerText = "Processing your code...";
    
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
            feedbackElement.innerText = `Error: ${data.details}`;
            document.getElementById('visualization-area').innerText = '';
        } else {
            feedbackElement.innerText = "Visualization ready. Click 'Next Step' to proceed.";
            steps = data.steps;
            currentStep = 0;
            displayStep(currentStep);
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        feedbackElement.innerText = 'Error: Unable to process the code.';
        document.getElementById('visualization-area').innerText = '';
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
        bar.style.transition = 'height 0.5s ease-in-out, background-color 0.5s ease';
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

function autoPlaySteps() {
    if (currentStep < steps.length - 1) {
        currentStep++;
        displayStep(currentStep);
        setTimeout(autoPlaySteps, speed);
    } else {
        document.getElementById('feedback').innerText = 'Sorting Complete!';
    }
}

document.getElementById('next-btn').addEventListener('click', () => {
    autoPlaySteps();
});

document.getElementById('back-btn').addEventListener('click', () => {
    if (currentStep > 0) {
        currentStep--;
        displayStep(currentStep);
    }
});

document.getElementById('pause-btn').addEventListener('click', () => {
    clearTimeout(autoPlaySteps);
});

document.getElementById('reset-btn').addEventListener('click', () => {
    clearTimeout(autoPlaySteps);
    currentStep = 0;
    displayStep(currentStep);
    document.getElementById('feedback').innerText = "Reset complete. You can start again.";
});
