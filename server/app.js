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
    res.json({ message: 'Code received successfully', code: code });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
