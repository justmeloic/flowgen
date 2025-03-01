import logging

from fastapi import APIRouter
from fastapi.responses import HTMLResponse

logger = logging.getLogger()

router = APIRouter()


@router.get("/", response_class=HTMLResponse)
async def read_root():
    """
    Returns an HTML page for the root endpoint, focusing on Mermaid diagram generation.
    """
    logger.info("Received request to root endpoint ('/')")
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Mermaid Diagram Generator</title>
        <link rel="stylesheet" type="text/css" href="styles.css">
        <script src="https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js"></script>
    </head>
    <body>
        <div class="container">
            <h1>Mermaid Diagram Generator</h1>
            <p>Enter a description of your desired architecture or system below, and I'll generate a Mermaid diagram for you!</p>
            <div class="input-area">
                <textarea id="mermaid-input" placeholder="Describe your system here..."></textarea>
                <button id="generate-btn">Generate Diagram</button>
            </div>
            <div class="output-area">
                <h2>Generated Diagram:</h2>
                <div id="mermaid-output"></div>
            </div>
        </div>
        <script>
        document.addEventListener('DOMContentLoaded', function() {
            mermaid.initialize({ startOnLoad: true });
            const input = document.getElementById('mermaid-input');
            const generateBtn = document.getElementById('generate-btn');
            const output = document.getElementById('mermaid-output');
            generateBtn.addEventListener('click', async () => {
                const description = input.value;
                const response = await fetch('/api/v1/mermaid', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ message: description })
                });
                if (response.ok) {
                    const data = await response.json();
                    const code = data.response;
                    output.innerHTML = code;
                    mermaid.run({
                        nodes: output
                    });
                } else {
                    output.innerHTML = 'Error generating diagram.';
                }
            });
        });
        </script>

    </body>
    </html>
    """
    logger.debug("Returning HTML content for root endpoint.")
    return HTMLResponse(content=html_content)
