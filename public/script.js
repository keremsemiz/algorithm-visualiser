document.addEventListener('DOMContentLoaded', (event) => {
    console.log("script.js is loaded and DOM is fully loaded");

    let currentStep = 0;
    let steps = [];
    let selectedAlgorithm = 'bubble-sort';
    let speed = 50;
    let setMode = '';

    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            console.log("Reset button clicked");
            resetGrid();
        });
    } else {
        console.error("Element 'reset-btn' not found");
    }

    function resetGrid() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.className = 'grid-cell';
        });
        console.log("Grid has been reset");
    }

    document.getElementById('algorithm-select').addEventListener('change', (event) => {
        selectedAlgorithm = event.target.value;
        toggleAlgorithmView(selectedAlgorithm);
    });

    document.getElementById('speed-control').addEventListener('input', (event) => {
        speed = event.target.value;
    });

    document.getElementById('run-btn').addEventListener('click', () => {
        console.log("Run button clicked");

        if (selectedAlgorithm === 'pathfinding') {
            console.log("Pathfinding algorithm selected");
            runPathfinding();
        } else {
            console.log("Sorting algorithm selected");
            runSortingAlgorithm();
        }
    });

    function runSortingAlgorithm() {
        const code = document.getElementById('code-editor').value;
        const arrayInput = document.getElementById('array-input').value;
        const array = arrayInput.split(',').map(Number);

        if (array.some(isNaN)) {
            alert('Please enter a valid array of numbers.');
            return;
        }
        sendCodeToBackend(code, array);
    }

    document.getElementById('set-start-btn').addEventListener('click', () => {
        setMode = 'start';
    });

    document.getElementById('set-end-btn').addEventListener('click', () => {
        setMode = 'end';
    });

    document.getElementById('set-obstacle-btn').addEventListener('click', () => {
        setMode = 'obstacle';
    });

    function toggleAlgorithmView(algorithm) {
        document.getElementById('sorting-container').style.display = 'none';
        document.getElementById('pathfinding-container').style.display = 'none';

        if (algorithm === 'pathfinding') {
            document.getElementById('pathfinding-container').style.display = 'block';
            createGrid();
        } else {
            document.getElementById('sorting-container').style.display = 'block';
        }
    }

    function createGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
    
        const numRows = 20;
        const numCols = 20;
    
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;
    
                cell.addEventListener('click', () => {
                    if (setMode === 'start') {
                        clearCells('start');
                        cell.classList.add('start');
                    } else if (setMode === 'end') {
                        clearCells('end');
                        cell.classList.add('end');
                    } else if (setMode === 'obstacle') {
                        cell.classList.toggle('obstacle');
                    }
                });
    
                gridContainer.appendChild(cell);
            }
        }
    }

    function clearCells(type) {
        document.querySelectorAll(`.grid-cell.${type}`).forEach(cell => cell.classList.remove(type));
    }

    function sendCodeToBackend(code, array) {
        const feedbackElement = document.getElementById('feedback');
        feedbackElement.innerText = "Processing your code...";

        fetch('/run-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code, array, algorithm: selectedAlgorithm }),
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

    function runPathfinding() {
        console.log("Run Pathfinding function triggered");
    
        const grid = [];
        document.querySelectorAll('.grid-cell').forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;
            if (!grid[row]) grid[row] = [];
            if (cell.classList.contains('start')) {
                console.log("Start cell found at:", row, col);
                grid[row][col] = 'S';
            } else if (cell.classList.contains('end')) {
                console.log("End cell found at:", row, col);
                grid[row][col] = 'E';
            } else if (cell.classList.contains('obstacle')) {
                grid[row][col] = 'O';
            } else {
                grid[row][col] = ' ';
            }
        });
    
        console.log("Grid prepared for server:", grid);
    
        fetch('/run-pathfinding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grid }),
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response from server:", data);
            if (data.steps.length === 0) {
                document.getElementById('feedback').innerText = 'No path found!';
            } else {
                visualizePathfinding(data.steps);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('feedback').innerText = 'Error: Unable to process the request.';
        });
    }
    

    function visualizePathfinding(steps) {
        steps.forEach((step, index) => {
            setTimeout(() => {
                step.forEach(([row, col, type]) => {
                    const cell = document.querySelector(`.grid-container > :nth-child(${row * 20 + col + 1})`);
                    if (type === 'path') {
                        cell.classList.add('path');
                    } else if (type === 'visited') {
                        cell.classList.add('visited');
                    }
                });
            }, speed * index);
        });
    }
});
