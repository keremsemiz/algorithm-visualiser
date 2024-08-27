document.addEventListener('DOMContentLoaded', (event) => {
    console.log("script.js is loaded and DOM is fully loaded");

    let currentStep = 0;
    let steps = [];
    let selectedAlgorithm = 'bubble-sort';
    let speed = 50;
    let setMode = '';
    let currentArray = [];

    const spinner = document.getElementById('loading-spinner');
    const sortingContainer = document.getElementById('sorting-container');
    const pathfindingContainer = document.getElementById('pathfinding-container');

    showSpinner();

    setTimeout(() => {
        const selectedAlgorithm = document.getElementById('algorithm-select').value;
        toggleAlgorithmView(selectedAlgorithm);
        hideSpinner();
    }, 1000);

    function showSpinner() {
        spinner.classList.remove('hidden');
    }

    function hideSpinner() {
        spinner.classList.add('hidden');
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

        if (selectedAlgorithm === 'a-star' || selectedAlgorithm === 'dijkstra') {
            console.log("Pathfinding algorithm selected");
            runPathfinding();
        } else {
            console.log("Sorting algorithm selected");
            runSortingAlgorithm();
        }
    });

    document.getElementById('set-start-btn').addEventListener('click', () => {
        setMode = 'start';
        console.log("Set mode to 'start'");
    });

    document.getElementById('set-end-btn').addEventListener('click', () => {
        setMode = 'end';
        console.log("Set mode to 'end'");
    });

    document.getElementById('set-obstacle-btn').addEventListener('click', () => {
        setMode = 'obstacle';
        console.log("Set mode to 'obstacle'");
    });

    function runSortingAlgorithm() {
        const arrayInput = document.getElementById('array-input').value;

        if (arrayInput) {
            currentArray = arrayInput.split(',').map(Number);
        }

        if (currentArray.some(isNaN) || currentArray.length === 0) {
            alert('Please enter a valid array of numbers.');
            return;
        }

        const algorithm = selectedAlgorithm;
        console.log(`Running ${algorithm} on array:`, currentArray);

        fetch('/run-code', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code: "", array: currentArray, algorithm }),
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.error(`Error: ${data.details}`);
                document.getElementById('feedback').innerText = `Error: ${data.details}`;
            } else {
                console.log("Visualization ready. Starting automatic display.");
                steps = data.steps;
                currentStep = 0;
                autoDisplaySteps();
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            document.getElementById('feedback').innerText = 'Error: Unable to process the code.';
        });
    }

    function autoDisplaySteps() {
        if (currentStep < steps.length) {
            displayStep(currentStep);
            currentStep++;
            setTimeout(autoDisplaySteps, 1000 / speed); 
        } else {
            console.log("Sorting completed.");
        }
    }

    function displayStep(stepIndex) {
        const stepArray = steps[stepIndex];
        const arrayContainer = document.getElementById('array-container');
        arrayContainer.innerHTML = '';
        stepArray.forEach(value => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${value * 5}px`; 
            bar.setAttribute('data-value', value);
            arrayContainer.appendChild(bar);
        });
    }

    function toggleAlgorithmView(algorithm) {
        console.log('Toggling view for algorithm:', algorithm);
        if (algorithm === 'bubble-sort' || algorithm === 'selection-sort') {
            sortingContainer.style.display = 'block';
            pathfindingContainer.style.display = 'none';
            initializeSortingArray();
        } else {
            sortingContainer.style.display = 'none';
            pathfindingContainer.style.display = 'block';
            createGrid();
        }
    }

    function initializeSortingArray() {
        console.log("Initializing sorting array visualization");
        const arrayContainer = document.getElementById('array-container');
        currentArray = generateRandomArray();
        visualizeArray(arrayContainer, currentArray);
    }

    function generateRandomArray() {
        return Array.from({ length: 10 }, () => Math.floor(Math.random() * 100) + 1);
    }

    function visualizeArray(container, array) {
        container.innerHTML = '';
        array.forEach(value => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${value * 5}px`;
            bar.setAttribute('data-value', value);
            container.appendChild(bar);
        });
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
                    handleCellClick(cell);
                });
    
                gridContainer.appendChild(cell);
            }
        }
    }

    function handleCellClick(cell) {
        if (setMode === 'start') {
            clearCells('start');
            cell.classList.add('start');
            console.log(`Start set at row ${cell.dataset.row}, col ${cell.dataset.col}`);
        } else if (setMode === 'end') {
            clearCells('end');
            cell.classList.add('end');
            console.log(`End set at row ${cell.dataset.row}, col ${cell.dataset.col}`);
        } else if (setMode === 'obstacle') {
            cell.classList.toggle('obstacle');
            console.log(`Obstacle toggled at row ${cell.dataset.row}, col ${cell.dataset.col}`);
        }
    }

    function clearCells(type) {
        document.querySelectorAll(`.grid-cell.${type}`).forEach(cell => cell.classList.remove(type));
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
            body: JSON.stringify({ grid, algorithm: selectedAlgorithm }),
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
