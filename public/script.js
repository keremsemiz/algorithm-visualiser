document.addEventListener('DOMContentLoaded', () => {
    // ─── State ─────────────────────────────────────────────────────────────────
    let currentStep = 0;
    let steps = [];
    let selectedAlgorithm = 'bubble-sort';
    let speed = 20;
    let setMode = '';
    let currentArray = [];
    let isRunning = false;
    let animationTimer = null;
    let isDragging = false;

    const GRID_ROWS = 25;
    const GRID_COLS = 25;

    // ─── DOM References ────────────────────────────────────────────────────────
    const spinner = document.getElementById('loading-spinner');
    const sortingContainer = document.getElementById('sorting-container');
    const pathfindingContainer = document.getElementById('pathfinding-container');
    const stepCounter = document.getElementById('step-counter');
    const currentStepNum = document.getElementById('current-step-num');
    const totalSteps = document.getElementById('total-steps');
    const progressBar = document.getElementById('progress-bar');
    const feedbackEl = document.getElementById('feedback');

    // ─── Initialization ────────────────────────────────────────────────────────
    showSpinner();
    setTimeout(() => {
        selectedAlgorithm = document.getElementById('algorithm-select').value;
        toggleAlgorithmView(selectedAlgorithm);
        fetchAlgorithmInfo(selectedAlgorithm);
        hideSpinner();
    }, 500);

    function showSpinner() { spinner.classList.remove('hidden'); }
    function hideSpinner() { spinner.classList.add('hidden'); }
    function showFeedback(msg, isError = false) {
        feedbackEl.innerText = msg;
        feedbackEl.style.color = isError ? 'var(--red)' : 'var(--green)';
        if (msg) setTimeout(() => { feedbackEl.innerText = ''; }, 4000);
    }

    // ─── Algorithm Info ────────────────────────────────────────────────────────
    function fetchAlgorithmInfo(algorithm) {
        fetch(`/algorithm-info/${algorithm}`)
            .then(r => r.json())
            .then(info => {
                document.getElementById('algo-info-name').textContent = info.name;
                document.getElementById('algo-info-desc').textContent = info.description;
                document.getElementById('algo-info-time').textContent = `⏱ ${info.timeComplexity}`;
                document.getElementById('algo-info-space').textContent = `💾 ${info.spaceComplexity}`;
                const stableEl = document.getElementById('algo-info-stable');
                if (info.stable === true) {
                    stableEl.textContent = '✓ Stable';
                    stableEl.style.display = '';
                } else if (info.stable === false) {
                    stableEl.textContent = '✗ Unstable';
                    stableEl.style.display = '';
                    stableEl.style.backgroundColor = 'rgba(236,55,80,0.1)';
                    stableEl.style.color = 'var(--red)';
                } else {
                    stableEl.style.display = 'none';
                }
            })
            .catch(() => {});
    }

    // ─── Event Listeners ───────────────────────────────────────────────────────
    document.getElementById('algorithm-select').addEventListener('change', (e) => {
        selectedAlgorithm = e.target.value;
        stopAnimation();
        toggleAlgorithmView(selectedAlgorithm);
        fetchAlgorithmInfo(selectedAlgorithm);
    });

    document.getElementById('speed-control').addEventListener('input', (e) => {
        speed = parseInt(e.target.value);
    });

    document.getElementById('run-btn').addEventListener('click', () => {
        if (isRunning) {
            stopAnimation();
            return;
        }
        showFeedback('');
        if (isPathfinding(selectedAlgorithm)) {
            runPathfinding();
        } else {
            runSortingAlgorithm();
        }
    });

    document.getElementById('reset-btn').addEventListener('click', () => {
        stopAnimation();
        stepCounter.style.display = 'none';
        showFeedback('');
        if (isPathfinding(selectedAlgorithm)) {
            clearGridVisualization();
        } else {
            initializeSortingArray();
        }
    });

    document.getElementById('set-start-btn').addEventListener('click', function() {
        setMode = 'start';
        updateModeButtons(this);
    });

    document.getElementById('set-end-btn').addEventListener('click', function() {
        setMode = 'end';
        updateModeButtons(this);
    });

    document.getElementById('set-obstacle-btn').addEventListener('click', function() {
        setMode = 'obstacle';
        updateModeButtons(this);
    });

    document.getElementById('generate-maze-btn').addEventListener('click', generateMaze);
    document.getElementById('clear-grid-btn').addEventListener('click', () => {
        createGrid();
    });

    document.getElementById('randomize-btn').addEventListener('click', () => {
        stopAnimation();
        initializeSortingArray();
    });

    function updateModeButtons(activeBtn) {
        document.querySelectorAll('.pathfinding-controls .btn').forEach(b => b.classList.remove('active'));
        activeBtn.classList.add('active');
    }

    // ─── Helpers ───────────────────────────────────────────────────────────────
    function isPathfinding(algo) {
        return algo === 'a-star' || algo === 'dijkstra';
    }

    function isSorting(algo) {
        return !isPathfinding(algo);
    }

    function stopAnimation() {
        isRunning = false;
        if (animationTimer) {
            clearTimeout(animationTimer);
            animationTimer = null;
        }
        const runBtn = document.getElementById('run-btn');
        runBtn.textContent = '▶ Run';
        runBtn.classList.remove('btn-secondary');
        runBtn.classList.add('btn-primary');
    }

    function setRunning() {
        isRunning = true;
        const runBtn = document.getElementById('run-btn');
        runBtn.textContent = '⏸ Pause';
        runBtn.classList.remove('btn-primary');
        runBtn.classList.add('btn-secondary');
    }

    // ─── View Toggle ───────────────────────────────────────────────────────────
    function toggleAlgorithmView(algorithm) {
        stopAnimation();
        stepCounter.style.display = 'none';

        if (isSorting(algorithm)) {
            sortingContainer.style.display = 'block';
            pathfindingContainer.style.display = 'none';
            initializeSortingArray();
        } else {
            sortingContainer.style.display = 'none';
            pathfindingContainer.style.display = 'block';
            createGrid();
        }
    }

    // ─── Sorting ───────────────────────────────────────────────────────────────
    function initializeSortingArray() {
        const arrayContainer = document.getElementById('array-container');
        currentArray = generateRandomArray();
        visualizeArray(arrayContainer, currentArray);
        steps = [];
        currentStep = 0;
    }

    function generateRandomArray() {
        const len = Math.floor(Math.random() * 15) + 15; // 15-30 bars
        return Array.from({ length: len }, () => Math.floor(Math.random() * 80) + 5);
    }

    function visualizeArray(container, array, highlights = {}) {
        container.innerHTML = '';
        const maxVal = Math.max(...array, 1);
        const containerHeight = container.clientHeight || 400;

        array.forEach((value, idx) => {
            const bar = document.createElement('div');
            bar.className = 'array-bar';
            const heightPct = (value / maxVal) * (containerHeight - 30);
            bar.style.height = `${heightPct}px`;
            bar.setAttribute('data-value', value);

            // Apply highlight classes
            if (highlights.comparing && highlights.comparing.includes(idx)) {
                bar.classList.add('comparing');
            }
            if (highlights.swapped && highlights.swapped.includes(idx)) {
                bar.classList.add('swapped');
            }
            if (highlights.sorted && highlights.sorted.includes(idx)) {
                bar.classList.add('sorted');
            }
            if (highlights.pivot === idx) {
                bar.classList.add('pivot');
            }

            container.appendChild(bar);
        });
    }

    function runSortingAlgorithm() {
        const arrayInput = document.getElementById('array-input').value.trim();

        if (arrayInput) {
            currentArray = arrayInput.split(',').map(s => parseInt(s.trim()));
            if (currentArray.some(isNaN) || currentArray.length === 0) {
                showFeedback('Please enter valid comma-separated numbers.', true);
                return;
            }
        }

        if (!currentArray || currentArray.length === 0) {
            currentArray = generateRandomArray();
        }

        fetch('/run-code', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ array: [...currentArray], algorithm: selectedAlgorithm }),
        })
        .then(r => r.json())
        .then(data => {
            if (data.error) {
                showFeedback(data.error, true);
                return;
            }
            steps = data.steps;
            currentStep = 0;
            totalSteps.textContent = steps.length;
            stepCounter.style.display = 'block';
            setRunning();
            autoDisplaySteps();
        })
        .catch(() => {
            showFeedback('Error: Unable to connect to the server.', true);
        });
    }

    function autoDisplaySteps() {
        if (!isRunning) return;

        if (currentStep < steps.length) {
            displayStep(currentStep);
            currentStep++;
            currentStepNum.textContent = currentStep;
            progressBar.style.width = `${(currentStep / steps.length) * 100}%`;
            const delay = Math.max(10, 1000 / speed);
            animationTimer = setTimeout(autoDisplaySteps, delay);
        } else {
            showFeedback('✅ Sorting complete!');
            stopAnimation();
        }
    }

    function displayStep(stepIndex) {
        const step = steps[stepIndex];
        const arrayContainer = document.getElementById('array-container');
        visualizeArray(arrayContainer, step.array, {
            comparing: step.comparing,
            swapped: step.swapped,
            sorted: step.sorted,
            pivot: step.pivot,
        });
    }

    // ─── Pathfinding Grid ──────────────────────────────────────────────────────
    function createGrid() {
        const gridContainer = document.getElementById('grid-container');
        gridContainer.innerHTML = '';
        gridContainer.style.gridTemplateColumns = `repeat(${GRID_COLS}, 28px)`;
        gridContainer.style.gridTemplateRows = `repeat(${GRID_ROWS}, 28px)`;

        for (let row = 0; row < GRID_ROWS; row++) {
            for (let col = 0; col < GRID_COLS; col++) {
                const cell = document.createElement('div');
                cell.classList.add('grid-cell');
                cell.dataset.row = row;
                cell.dataset.col = col;

                cell.addEventListener('mousedown', (e) => {
                    e.preventDefault();
                    isDragging = true;
                    handleCellClick(cell);
                });

                cell.addEventListener('mouseenter', () => {
                    if (isDragging && setMode === 'obstacle') {
                        if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
                            cell.classList.add('obstacle');
                        }
                    }
                });

                gridContainer.appendChild(cell);
            }
        }

        document.addEventListener('mouseup', () => { isDragging = false; });
    }

    function handleCellClick(cell) {
        if (setMode === 'start') {
            clearCells('start');
            cell.classList.remove('obstacle', 'end');
            cell.classList.add('start');
        } else if (setMode === 'end') {
            clearCells('end');
            cell.classList.remove('obstacle', 'start');
            cell.classList.add('end');
        } else if (setMode === 'obstacle') {
            if (!cell.classList.contains('start') && !cell.classList.contains('end')) {
                cell.classList.toggle('obstacle');
            }
        }
    }

    function clearCells(type) {
        document.querySelectorAll(`.grid-cell.${type}`).forEach(c => c.classList.remove(type));
    }

    function clearGridVisualization() {
        document.querySelectorAll('.grid-cell.visited, .grid-cell.path').forEach(c => {
            c.classList.remove('visited', 'path');
        });
    }

    function generateMaze() {
        createGrid();
        const cells = document.querySelectorAll('.grid-cell');

        // Random maze with ~30% walls
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (Math.random() < 0.3) {
                cell.classList.add('obstacle');
            }
        });

        // Set start and end
        const startCell = document.querySelector(`.grid-cell[data-row="1"][data-col="1"]`);
        const endCell = document.querySelector(`.grid-cell[data-row="${GRID_ROWS - 2}"][data-col="${GRID_COLS - 2}"]`);

        if (startCell) {
            startCell.classList.remove('obstacle');
            startCell.classList.add('start');
        }
        if (endCell) {
            endCell.classList.remove('obstacle');
            endCell.classList.add('end');
        }
    }

    // ─── Pathfinding ───────────────────────────────────────────────────────────
    function runPathfinding() {
        const grid = [];
        const cells = document.querySelectorAll('.grid-cell');
        let hasStart = false, hasEnd = false;

        cells.forEach((cell) => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (!grid[row]) grid[row] = [];

            if (cell.classList.contains('start')) {
                grid[row][col] = 'S';
                hasStart = true;
            } else if (cell.classList.contains('end')) {
                grid[row][col] = 'E';
                hasEnd = true;
            } else if (cell.classList.contains('obstacle')) {
                grid[row][col] = 'O';
            } else {
                grid[row][col] = ' ';
            }
        });

        if (!hasStart || !hasEnd) {
            showFeedback('Please set both a start and end point!', true);
            return;
        }

        // Clear previous visualization
        clearGridVisualization();

        fetch('/run-pathfinding', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ grid, algorithm: selectedAlgorithm }),
        })
        .then(r => r.json())
        .then(data => {
            if (!data.steps || data.steps.length === 0) {
                showFeedback('No path found! Try removing some walls.', true);
                return;
            }
            steps = data.steps;
            totalSteps.textContent = steps.length;
            currentStep = 0;
            stepCounter.style.display = 'block';
            setRunning();
            visualizePathfinding();
        })
        .catch(() => {
            showFeedback('Error: Unable to connect to the server.', true);
        });
    }

    function visualizePathfinding() {
        if (!isRunning || currentStep >= steps.length) {
            if (currentStep >= steps.length) {
                showFeedback('✅ Pathfinding complete!');
                stopAnimation();
            }
            return;
        }

        const step = steps[currentStep];
        step.forEach(([row, col, type]) => {
            const cell = document.querySelector(
                `.grid-cell[data-row="${row}"][data-col="${col}"]`
            );
            if (cell && !cell.classList.contains('start') && !cell.classList.contains('end')) {
                cell.classList.add(type);
            }
        });

        currentStep++;
        currentStepNum.textContent = currentStep;
        progressBar.style.width = `${(currentStep / steps.length) * 100}%`;

        const delay = Math.max(5, 200 / speed);
        animationTimer = setTimeout(visualizePathfinding, delay);
    }
});
