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

    fs.writeFile(cppFilePath, code, (err) => {
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

                console.log('Execution output:', runStdout);
                res.json({ output: runStdout });
            });
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
