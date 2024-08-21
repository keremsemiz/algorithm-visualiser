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
    const tempDir = path.join(__dirname, 'temp');
    const cppFilePath = path.join(tempDir, 'temp.cpp');
    const outputFilePath = path.join(tempDir, 'temp.out');

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    const modifiedCode = `
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
