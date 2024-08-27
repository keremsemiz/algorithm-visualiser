document.addEventListener('DOMContentLoaded', () => {
    let currentStep = 0;
    let steps = [];
    let selectedAlgorithm = 'bubble-sort';
    let speed = 50;
    let setMode = '';
    let currentArray = [];

    const progressBar = document.getElementById('progress-bar');

    document.getElementById('algorithm-select').addEventListener('change', (event) => {
        selectedAlgorithm = event.target.value;
        toggleAlgorithmView(selectedAlgorithm);
    });

    document.getElementById('speed-control').addEventListener('input', (event) => {
        speed = event.target.value;
    });

    document.getElementById('run-btn').addEventListener('click', () => {
        if (selectedAlgorithm === 'a-star' || selectedAlgorithm === 'dijkstra') {
            runPathfinding();
        } else {
            runSortingAlgorithm();
        }
    });

    document.getElementById('reset-btn').addEventListener('click', resetGrid);

    document.getElementById('generate-random-btn').addEventListener('click', () => {
        generateRandomArray();
        visualizeArray(currentArray);
    });

    function generateRandomArray() {
        const arraySize = 20; 
        currentArray = Array.from({ length: arraySize }, () => Math.floor(Math.random() * 100) + 1);
        console.log("Random array generated:", currentArray);
    }

    function runSortingAlgorithm() {
        if (!currentArray.length) {
            alert('Please generate a random array first.');
            return;
        }

        const algorithm = selectedAlgorithm;

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
                steps = data.steps;
                currentStep = 0;
                autoDisplaySteps();
                updateProgressBar();
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
        visualizeArray(stepArray);
    }

    function visualizeArray(array) {
        const arrayContainer = document.getElementById('array-container');
        arrayContainer.innerHTML = '';
        const barWidth = Math.max(10, Math.floor(arrayContainer.clientWidth / array.length)) + "px";
        array.forEach(value => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            bar.style.height = `${value * 3}px`; 
            bar.style.width = barWidth;
            bar.setAttribute('data-value', value);
            arrayContainer.appendChild(bar);
        });
    }

    function updateProgressBar() {
        if (progressBar) {
            const progressPercentage = ((currentStep / steps.length) * 100).toFixed(2);
            progressBar.style.width = `${progressPercentage}%`;
            progressBar.innerText = `${progressPercentage}%`;
        }
    }

    function resetGrid() {
        document.querySelectorAll('.grid-cell').forEach(cell => {
            cell.className = 'grid-cell';
        });
    }

    function toggleAlgorithmView(algorithm) {
        document.getElementById('sorting-container').style.display = 'none';
        document.getElementById('pathfinding-container').style.display = 'none';

        if (algorithm === 'a-star' || algorithm === 'dijkstra') {
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

                cell.addEventListener('click', () => handleCellClick(cell));

                gridContainer.appendChild(cell);
            }
        }
    }

    function handleCellClick(cell) {
        if (setMode === 'start') {
            clearCells('start');
            cell.classList.add('start');
        } else if (setMode === 'end') {
            clearCells('end');
            cell.classList.add('end');
        } else if (setMode === 'obstacle') {
            cell.classList.toggle('obstacle');
        }
    }

    function clearCells(type) {
        document.querySelectorAll(`.grid-cell.${type}`).forEach(cell => cell.classList.remove(type));
    }

    function runPathfinding() {
        const grid = [];
        document.querySelectorAll('.grid-cell').forEach((cell, index) => {
            const row = Math.floor(index / 20);
            const col = index % 20;
            if (!grid[row]) grid[row] = [];
            if (cell.classList.contains('start')) {
                grid[row][col] = 'S';
            } else if (cell.classList.contains('end')) {
                grid[row][col] = 'E';
            } else if (cell.classList.contains('obstacle')) {
                grid[row][col] = 'O';
            } else {
                grid[row][col] = ' ';
            }
        });

        fetch('/run-pathfinding', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ grid, algorithm: selectedAlgorithm }),
        })
        .then(response => response.json())
        .then(data => {
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
