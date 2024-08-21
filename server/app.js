const fs = require('fs');
const { exec } = require('child_process');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));
app.use(bodyParser.json());

app.post('/run-code', (req, res) => {
    const code = req.body.code;
    const array = req.body.array || [5, 3, 8, 4, 2];
    const algorithm = req.body.algorithm || 'bubble-sort';
    const tempDir = path.join(__dirname, 'temp');
    const cppFilePath = path.join(tempDir, 'temp.cpp');
    const outputFilePath = path.join(tempDir, 'temp.out');

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    let modifiedCode;

    if (algorithm === 'bubble-sort') {
        modifiedCode = `
            #include <iostream>
            using namespace std;
            void bubbleSort(int arr[], int n) {
                for (int i = 0; i < n-1; i++) {
                    for (int j = 0; j < n-i-1; j++) {
                        if (arr[j] > arr[j+1]) {
                            int temp = arr[j];
                            arr[j] = arr[j+1];
                            arr[j+1] = temp;
                        }
                        for (int k = 0; k < n; k++) {
                            cout << arr[k] << " ";
                        }
                        cout << endl;
                    }
                }
            }
            int main() {
                int arr[] = {${array.join(',')}};
                int n = sizeof(arr)/sizeof(arr[0]);
                bubbleSort(arr, n);
                return 0;
            }
        `;
    } else if (algorithm === 'selection-sort') {
        modifiedCode = `
            #include <iostream>
            using namespace std;
            void selectionSort(int arr[], int n) {
                for (int i = 0; i < n-1; i++) {
                    int min_idx = i;
                    for (int j = i+1; j < n; j++) {
                        if (arr[j] < arr[min_idx]) {
                            min_idx = j;
                        }
                    }
                    int temp = arr[min_idx];
                    arr[min_idx] = arr[i];
                    arr[i] = temp;
                    for (int k = 0; k < n; k++) {
                        cout << arr[k] << " ";
                    }
                    cout << endl;
                }
            }
            int main() {
                int arr[] = {${array.join(',')}};
                int n = sizeof(arr)/sizeof(arr[0]);
                selectionSort(arr, n);
                return 0;
            }
        `;
    } else if (algorithm === 'insertion-sort') {
        modifiedCode = `
            #include <iostream>
            using namespace std;
            void insertionSort(int arr[], int n) {
                for (int i = 1; i < n; i++) {
                    int key = arr[i];
                    int j = i - 1;
                    while (j >= 0 && arr[j] > key) {
                        arr[j + 1] = arr[j];
                        j = j - 1;
                    }
                    arr[j + 1] = key;
                    for (int k = 0; k < n; k++) {
                        cout << arr[k] << " ";
                    }
                    cout << endl;
                }
            }
            int main() {
                int arr[] = {${array.join(',')}};
                int n = sizeof(arr)/sizeof(arr[0]);
                insertionSort(arr, n);
                return 0;
            }
        `;
    } else if (algorithm === 'quick-sort') {
        modifiedCode = `
            #include <iostream>
            using namespace std;
            void quickSort(int arr[], int low, int high) {
                if (low < high) {
                    int pi = partition(arr, low, high);
                    quickSort(arr, low, pi - 1);
                    quickSort(arr, pi + 1, high);
                }
            }
            int partition(int arr[], int low, int high) {
                int pivot = arr[high];
                int i = (low - 1);
                for (int j = low; j <= high - 1; j++) {
                    if (arr[j] < pivot) {
                        i++;
                        int temp = arr[i];
                        arr[i] = arr[j];
                        arr[j] = temp;
                    }
                }
                int temp = arr[i + 1];
                arr[i + 1] = arr[high];
                arr[high] = temp;
                for (int k = 0; k < high + 1; k++) {
                    cout << arr[k] << " ";
                }
                cout << endl;
                return (i + 1);
            }
            int main() {
                int arr[] = {${array.join(',')}};
                int n = sizeof(arr)/sizeof(arr[0]);
                quickSort(arr, 0, n - 1);
                return 0;
            }
        `;
    } else if (algorithm === 'merge-sort') {
        modifiedCode = `
            #include <iostream>
            using namespace std;
            void merge(int arr[], int l, int m, int r) {
                int n1 = m - l + 1;
                int n2 = r - m;
                int L[n1], R[n2];
                for (int i = 0; i < n1; i++) {
                    L[i] = arr[l + i];
                }
                for (int j = 0; j < n2; j++) {
                    R[j] = arr[m + 1 + j];
                }
                int i = 0, j = 0, k = l;
                while (i < n1 && j < n2) {
                    if (L[i] <= R[j]) {
                        arr[k] = L[i];
                        i++;
                    } else {
                        arr[k] = R[j];
                        j++;
                    }
                    k++;
                }
                while (i < n1) {
                    arr[k] = L[i];
                    i++;
                    k++;
                }
                while (j < n2) {
                    arr[k] = R[j];
                    j++;
                    k++;
                }
                for (int p = l; p <= r; p++) {
                    cout << arr[p] << " ";
                }
                cout << endl;
            }
            void mergeSort(int arr[], int l, int r) {
                if (l < r) {
                    int m = l + (r - l) / 2;
                    mergeSort(arr, l, m);
                    mergeSort(arr, m + 1, r);
                    merge(arr, l, m, r);
                }
            }
            int main() {
                int arr[] = {${array.join(',')}};
                int n = sizeof(arr) / sizeof(arr[0]);
                mergeSort(arr, 0, n - 1);
                return 0;
            }
        `;
    } else {
        return res.status(400).json({ error: 'Unsupported algorithm selected' });
    }

    fs.writeFile(cppFilePath, modifiedCode, (err) => {
        if (err) {
            console.error('Error writing file:', err);
            return res.status(500).json({ error: 'Failed to save code file' });
        }

        exec(`g++ ${cppFilePath} -o ${outputFilePath}`, (compileErr, stdout, stderr) => {
            if (compileErr) {
                console.error('Compilation error:', stderr);
                return res.status(400).json({ error: 'Compilation failed', details: stderr });
            }

            exec(outputFilePath, (runErr, runStdout, runStderr) => {
                if (runErr) {
                    console.error('Execution error:', runStderr);
                    return res.status(400).json({ error: 'Execution failed', details: runStderr });
                }

                const steps = runStdout.trim().split('\n').map(line => line.split(' ').map(Number));
                res.json({ steps: steps });
            });
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
