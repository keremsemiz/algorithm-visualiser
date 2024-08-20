let currentStep = 0;
let steps = [];

document.getElementById('run-btn').addEventListener('click', () => {
    const code = codeEditor.getValue();
    sendCodeToBackend(code);
});

function sendCodeToBackend(code) {
    fetch('/run-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code }),
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
    const arrayState = steps[stepIndex];
    const visualizationArea = document.getElementById('visualization-area');
    visualizationArea.innerHTML = '';

    arrayState.forEach((value, index) => {
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
    }
});
