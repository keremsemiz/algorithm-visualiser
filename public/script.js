const codeEditor = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    lineNumbers: true,
    mode: "text/x-c++src",
    theme: "default",
});

document.getElementById('run-btn').addEventListener('click', () => {
    const code = codeEditor.getValue();
    console.log("Code submitted:", code);
    sendCodeToBackend(code);
});

function sendCodeToBackend(code) {
    fetch('/run-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Success:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function sendCodeToBackend(code) {
    fetch('/run-code', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            document.getElementById('visualization-area').innerText = `Error: ${data.details}`;
        } else {
            document.getElementById('visualization-area').innerText = `Output:\n${data.output}`;
        }
    })
    .catch((error) => {
        console.error('Error:', error);
        document.getElementById('visualization-area').innerText = 'Error: Unable to process the code.';
    });
}

