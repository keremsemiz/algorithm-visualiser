const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// ─── Sorting Algorithms ────────────────────────────────────────────────────────

app.post('/run-code', (req, res) => {
    const { array, algorithm } = req.body;

    if (!array || !Array.isArray(array) || array.length === 0) {
        return res.status(400).json({ error: 'Invalid array provided' });
    }

    const sortFunctions = {
        'bubble-sort': runBubbleSort,
        'selection-sort': runSelectionSort,
        'insertion-sort': runInsertionSort,
        'quick-sort': runQuickSort,
        'merge-sort': runMergeSort,
        'heap-sort': runHeapSort,
    };

    const sortFn = sortFunctions[algorithm];
    if (!sortFn) {
        return res.status(400).json({ error: 'Unknown algorithm selected' });
    }

    const steps = sortFn([...array]);
    res.json({ steps });
});

// Each step: { array, comparing, swapped, sorted }

function runBubbleSort(array) {
    const steps = [];
    const n = array.length;
    let swapped;
    let pass = 0;
    do {
        swapped = false;
        for (let i = 0; i < n - 1 - pass; i++) {
            steps.push({ array: [...array], comparing: [i, i + 1], swapped: null, sorted: [] });
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapped = true;
                steps.push({ array: [...array], comparing: [], swapped: [i, i + 1], sorted: [] });
            }
        }
        pass++;
    } while (swapped);
    steps.push({ array: [...array], comparing: [], swapped: null, sorted: Array.from({ length: n }, (_, i) => i) });
    return steps;
}

function runSelectionSort(array) {
    const steps = [];
    const n = array.length;
    const sorted = [];
    for (let i = 0; i < n; i++) {
        let minIndex = i;
        for (let j = i + 1; j < n; j++) {
            steps.push({ array: [...array], comparing: [minIndex, j], swapped: null, sorted: [...sorted] });
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            steps.push({ array: [...array], comparing: [], swapped: [i, minIndex], sorted: [...sorted] });
        }
        sorted.push(i);
    }
    steps.push({ array: [...array], comparing: [], swapped: null, sorted: Array.from({ length: n }, (_, i) => i) });
    return steps;
}

function runInsertionSort(array) {
    const steps = [];
    const n = array.length;
    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        steps.push({ array: [...array], comparing: [i, j >= 0 ? j : 0], swapped: null, sorted: [] });
        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            steps.push({ array: [...array], comparing: [j, j + 1], swapped: [j, j + 1], sorted: [] });
            j = j - 1;
        }
        array[j + 1] = key;
        steps.push({ array: [...array], comparing: [], swapped: null, sorted: [] });
    }
    steps.push({ array: [...array], comparing: [], swapped: null, sorted: Array.from({ length: n }, (_, i) => i) });
    return steps;
}

function runQuickSort(array) {
    const steps = [];
    quickSort(array, 0, array.length - 1, steps);
    steps.push({ array: [...array], comparing: [], swapped: null, sorted: Array.from({ length: array.length }, (_, i) => i) });
    return steps;
}

function quickSort(array, low, high, steps) {
    if (low < high) {
        const pi = partition(array, low, high, steps);
        quickSort(array, low, pi - 1, steps);
        quickSort(array, pi + 1, high, steps);
    }
}

function partition(array, low, high, steps) {
    const pivot = array[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
        steps.push({ array: [...array], comparing: [j, high], swapped: null, pivot: high, sorted: [] });
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
            steps.push({ array: [...array], comparing: [], swapped: [i, j], pivot: high, sorted: [] });
        }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    steps.push({ array: [...array], comparing: [], swapped: [i + 1, high], pivot: null, sorted: [] });
    return i + 1;
}

function runMergeSort(array) {
    const steps = [];
    mergeSort(array, 0, array.length - 1, steps);
    steps.push({ array: [...array], comparing: [], swapped: null, sorted: Array.from({ length: array.length }, (_, i) => i) });
    return steps;
}

function mergeSort(array, l, r, steps) {
    if (l < r) {
        const m = Math.floor((l + r) / 2);
        mergeSort(array, l, m, steps);
        mergeSort(array, m + 1, r, steps);
        merge(array, l, m, r, steps);
    }
}

function merge(array, l, m, r, steps) {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = new Array(n1);
    const R = new Array(n2);

    for (let i = 0; i < n1; i++) L[i] = array[l + i];
    for (let j = 0; j < n2; j++) R[j] = array[m + 1 + j];

    let i = 0, j = 0, k = l;
    while (i < n1 && j < n2) {
        steps.push({ array: [...array], comparing: [l + i, m + 1 + j], swapped: null, sorted: [] });
        if (L[i] <= R[j]) {
            array[k] = L[i];
            i++;
        } else {
            array[k] = R[j];
            j++;
        }
        steps.push({ array: [...array], comparing: [], swapped: [k], sorted: [] });
        k++;
    }

    while (i < n1) { array[k] = L[i]; i++; k++; }
    while (j < n2) { array[k] = R[j]; j++; k++; }
    steps.push({ array: [...array], comparing: [], swapped: null, sorted: [] });
}

function runHeapSort(array) {
    const steps = [];
    const n = array.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(array, n, i, steps);
    }

    for (let i = n - 1; i > 0; i--) {
        [array[0], array[i]] = [array[i], array[0]];
        steps.push({ array: [...array], comparing: [], swapped: [0, i], sorted: [] });
        heapify(array, i, 0, steps);
    }

    steps.push({ array: [...array], comparing: [], swapped: null, sorted: Array.from({ length: n }, (_, i) => i) });
    return steps;
}

function heapify(array, n, i, steps) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && array[left] > array[largest]) largest = left;
    if (right < n && array[right] > array[largest]) largest = right;

    if (largest !== i) {
        steps.push({ array: [...array], comparing: [i, largest], swapped: null, sorted: [] });
        [array[i], array[largest]] = [array[largest], array[i]];
        steps.push({ array: [...array], comparing: [], swapped: [i, largest], sorted: [] });
        heapify(array, n, largest, steps);
    }
}

// ─── Pathfinding Algorithms ────────────────────────────────────────────────────

app.post('/run-pathfinding', (req, res) => {
    const { grid, algorithm } = req.body;

    if (!grid || !Array.isArray(grid)) {
        return res.status(400).json({ error: 'Invalid grid provided' });
    }

    let result;
    if (algorithm === 'dijkstra') {
        result = runDijkstra(grid);
    } else if (algorithm === 'a-star') {
        result = runAStar(grid);
    } else {
        return res.status(400).json({ error: 'Unknown algorithm selected' });
    }

    res.json({ steps: result });
});

function findCell(grid, type) {
    for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
            if (grid[r][c] === type) return { row: r, col: c };
        }
    }
    return null;
}

function getNeighbors(row, col, numRows, numCols) {
    const neighbors = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr >= 0 && nr < numRows && nc >= 0 && nc < numCols) {
            neighbors.push({ row: nr, col: nc });
        }
    }
    return neighbors;
}

function reconstructPath(cameFrom, current) {
    const path = [];
    while (current) {
        path.unshift(current);
        const key = `${current.row},${current.col}`;
        current = cameFrom[key] || null;
    }
    return path;
}

function runDijkstra(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const start = findCell(grid, 'S');
    const end = findCell(grid, 'E');

    if (!start || !end) return [];

    const steps = [];
    const dist = {};
    const cameFrom = {};
    const visited = new Set();
    const pq = [];

    const startKey = `${start.row},${start.col}`;
    dist[startKey] = 0;
    pq.push({ row: start.row, col: start.col, dist: 0 });

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const current = pq.shift();
        const currentKey = `${current.row},${current.col}`;

        if (visited.has(currentKey)) continue;
        visited.add(currentKey);

        if (currentKey !== startKey && currentKey !== `${end.row},${end.col}`) {
            steps.push([[current.row, current.col, 'visited']]);
        }

        if (current.row === end.row && current.col === end.col) {
            const path = reconstructPath(cameFrom, current);
            const pathSteps = path
                .filter(p => !(p.row === start.row && p.col === start.col) && !(p.row === end.row && p.col === end.col))
                .map(p => [p.row, p.col, 'path']);
            for (const ps of pathSteps) {
                steps.push([ps]);
            }
            return steps;
        }

        const neighbors = getNeighbors(current.row, current.col, numRows, numCols);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (visited.has(neighborKey)) continue;
            if (grid[neighbor.row][neighbor.col] === 'O') continue;

            const newDist = (dist[currentKey] || 0) + 1;
            if (newDist < (dist[neighborKey] ?? Infinity)) {
                dist[neighborKey] = newDist;
                cameFrom[neighborKey] = current;
                pq.push({ row: neighbor.row, col: neighbor.col, dist: newDist });
            }
        }
    }

    return steps;
}

function runAStar(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    const start = findCell(grid, 'S');
    const end = findCell(grid, 'E');

    if (!start || !end) return [];

    const steps = [];

    function heuristic(a, b) {
        return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
    }

    const openSet = [];
    const cameFrom = {};
    const gScore = {};
    const fScore = {};
    const closedSet = new Set();

    const startKey = `${start.row},${start.col}`;
    gScore[startKey] = 0;
    fScore[startKey] = heuristic(start, end);
    openSet.push({ row: start.row, col: start.col, f: fScore[startKey] });

    while (openSet.length > 0) {
        openSet.sort((a, b) => a.f - b.f);
        const current = openSet.shift();
        const currentKey = `${current.row},${current.col}`;

        if (current.row === end.row && current.col === end.col) {
            const path = reconstructPath(cameFrom, current);
            const pathSteps = path
                .filter(p => !(p.row === start.row && p.col === start.col) && !(p.row === end.row && p.col === end.col))
                .map(p => [p.row, p.col, 'path']);
            for (const ps of pathSteps) {
                steps.push([ps]);
            }
            return steps;
        }

        closedSet.add(currentKey);

        if (currentKey !== startKey) {
            steps.push([[current.row, current.col, 'visited']]);
        }

        const neighbors = getNeighbors(current.row, current.col, numRows, numCols);
        for (const neighbor of neighbors) {
            const neighborKey = `${neighbor.row},${neighbor.col}`;
            if (closedSet.has(neighborKey)) continue;
            if (grid[neighbor.row][neighbor.col] === 'O') continue;

            const tentativeG = (gScore[currentKey] || 0) + 1;

            if (tentativeG < (gScore[neighborKey] ?? Infinity)) {
                cameFrom[neighborKey] = current;
                gScore[neighborKey] = tentativeG;
                fScore[neighborKey] = tentativeG + heuristic(neighbor, end);

                if (!openSet.find(n => n.row === neighbor.row && n.col === neighbor.col)) {
                    openSet.push({ row: neighbor.row, col: neighbor.col, f: fScore[neighborKey] });
                }
            }
        }
    }

    return steps;
}

// ─── Algorithm Info ────────────────────────────────────────────────────────────

app.get('/algorithm-info/:name', (req, res) => {
    const info = {
        'bubble-sort': {
            name: 'Bubble Sort',
            timeComplexity: 'O(n²)',
            spaceComplexity: 'O(1)',
            description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.',
            stable: true,
        },
        'selection-sort': {
            name: 'Selection Sort',
            timeComplexity: 'O(n²)',
            spaceComplexity: 'O(1)',
            description: 'Finds the minimum element from the unsorted part and puts it at the beginning.',
            stable: false,
        },
        'insertion-sort': {
            name: 'Insertion Sort',
            timeComplexity: 'O(n²)',
            spaceComplexity: 'O(1)',
            description: 'Builds the sorted array one item at a time by inserting each element into its correct position.',
            stable: true,
        },
        'quick-sort': {
            name: 'Quick Sort',
            timeComplexity: 'O(n log n) avg',
            spaceComplexity: 'O(log n)',
            description: 'Picks a pivot element and partitions the array around it, then recursively sorts sub-arrays.',
            stable: false,
        },
        'merge-sort': {
            name: 'Merge Sort',
            timeComplexity: 'O(n log n)',
            spaceComplexity: 'O(n)',
            description: 'Divides the array in half, sorts each half recursively, then merges the sorted halves.',
            stable: true,
        },
        'heap-sort': {
            name: 'Heap Sort',
            timeComplexity: 'O(n log n)',
            spaceComplexity: 'O(1)',
            description: 'Builds a max heap from the array, then repeatedly extracts the maximum element.',
            stable: false,
        },
        'a-star': {
            name: 'A* Search',
            timeComplexity: 'O(E)',
            spaceComplexity: 'O(V)',
            description: 'Uses heuristics to find the shortest path. Combines actual distance with estimated distance to goal.',
        },
        'dijkstra': {
            name: "Dijkstra's Algorithm",
            timeComplexity: 'O(V²)',
            spaceComplexity: 'O(V)',
            description: 'Finds the shortest path from source to all vertices by exploring nodes in order of increasing distance.',
        },
    };

    const data = info[req.params.name];
    if (data) {
        res.json(data);
    } else {
        res.status(404).json({ error: 'Algorithm not found' });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Algowhiz is running on http://localhost:${PORT}`);
});
