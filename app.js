const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.post('/run-code', (req, res) => {
    const { code, array, algorithm } = req.body;
    let steps;

    if (algorithm === 'bubble-sort') {
        steps = runBubbleSort(array);
    } else if (algorithm === 'selection-sort') {
        steps = runSelectionSort(array);
    } else if (algorithm === 'insertion-sort') {
        steps = runInsertionSort(array);
    } else if (algorithm === 'quick-sort') {
        steps = runQuickSort(array);
    } else if (algorithm === 'merge-sort') {
        steps = runMergeSort(array);
    } else if (algorithm === 'heap-sort') {
        steps = runHeapSort(array);
    } else {
        res.status(400).json({ error: "Unknown algorithm selected" });
        return;
    }

    res.json({ steps });
});

function runBubbleSort(array) {
    const steps = [];
    let swapped;
    do {
        swapped = false;
        for (let i = 0; i < array.length - 1; i++) {
            if (array[i] > array[i + 1]) {
                [array[i], array[i + 1]] = [array[i + 1], array[i]];
                swapped = true;
                steps.push([...array]);
            }
        }
    } while (swapped);
    return steps;
}

function runSelectionSort(array) {
    const steps = [];
    for (let i = 0; i < array.length; i++) {
        let minIndex = i;
        for (let j = i + 1; j < array.length; j++) {
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        if (minIndex !== i) {
            [array[i], array[minIndex]] = [array[minIndex], array[i]];
            steps.push([...array]);
        }
    }
    return steps;
}

function runInsertionSort(array) {
    const steps = [];
    for (let i = 1; i < array.length; i++) {
        let key = array[i];
        let j = i - 1;
        while (j >= 0 && array[j] > key) {
            array[j + 1] = array[j];
            j = j - 1;
        }
        array[j + 1] = key;
        steps.push([...array]);
    }
    return steps;
}

function runQuickSort(array) {
    const steps = [];
    quickSort(array, 0, array.length - 1, steps);
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
        if (array[j] < pivot) {
            i++;
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
    [array[i + 1], array[high]] = [array[high], array[i + 1]];
    steps.push([...array]);
    return i + 1;
}

function runMergeSort(array) {
    const steps = [];
    mergeSort(array, 0, array.length - 1, steps);
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
        if (L[i] <= R[j]) {
            array[k] = L[i];
            i++;
        } else {
            array[k] = R[j];
            j++;
        }
        k++;
    }

    while (i < n1) {
        array[k] = L[i];
        i++;
        k++;
    }

    while (j < n2) {
        array[k] = R[j];
        j++;
        k++;
    }

    steps.push([...array]);
}

function runHeapSort(array) {
    const steps = [];
    const n = array.length;

    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(array, n, i, steps);
    }

    for (let i = n - 1; i > 0; i--) {
        [array[0], array[i]] = [array[i], array[0]];
        steps.push([...array]);
        heapify(array, i, 0, steps);
    }

    return steps;
}

function heapify(array, n, i, steps) {
    let largest = i;
    const left = 2 * i + 1;
    const right = 2 * i + 2;

    if (left < n && array[left] > array[largest]) {
        largest = left;
    }

    if (right < n && array[right] > array[largest]) {
        largest = right;
    }

    if (largest !== i) {
        [array[i], array[largest]] = [array[largest], array[i]];
        steps.push([...array]);
        heapify(array, n, largest, steps);
    }
}

app.post('/run-pathfinding', (req, res) => {
    const { grid, algorithm } = req.body;
    let steps;

    if (algorithm === 'dijkstra') {
        steps = runDijkstra(grid);
    } else if (algorithm === 'a-star') {
        steps = runAStar(grid);
    } else {
        res.status(400).json({ error: "Unknown algorithm selected" });
        return;
    }

    res.json({ steps });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
