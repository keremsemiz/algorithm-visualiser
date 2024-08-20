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
    console.log('Received code:', code);

    const tempDir = path.join(__dirname, 'temp');
    const cppFilePath = path.join(tempDir, 'temp.cpp');
    const outputFilePath = path.join(tempDir, 'temp.out');

    if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir);
    }

    function simulateBubbleSort() {
        let array = [5, 3, 8, 4, 2];
        let steps = [];

        for (let i = 0; i < array.length - 1; i++) {
            for (let j = 0; j < array.length - i - 1; j++) {
                if (array[j] > array[j + 1]) {
                    [array[j], array[j + 1]] = [array[j + 1], array[j]];
                }
                steps.push([...array]); 
            }
        }

        return steps;
    }

    const steps = simulateBubbleSort();
    res.json({ steps: steps });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
