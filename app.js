let currentData = null;

function loadBoard() {
    try {
        currentData = JSON.parse(document.getElementById('jsonInput').value);
        renderPerfectTable();
    } catch (e) { 
        alert("Invalid JSON format. Please check your structure."); 
    }
}

function renderPerfectTable() {
    const boardContainer = document.getElementById('board');
    boardContainer.innerHTML = ''; 

    const table = document.createElement('table');
    table.className = 'nono-table';

    const numRows = currentData.cells.length;
    const numCols = currentData.cells[0].length;

    // Calculate maximum depth of hints to know how many header rows/cols we need
    const maxColHintDepth = Math.max(...currentData.columnHints.map(h => h.length), 1);
    const maxRowHintDepth = Math.max(...currentData.rowHints.map(h => h.length), 1);

    // --- 1. BUILD TOP HEADER ROWS (Column Hints) ---
    for (let hRow = 0; hRow < maxColHintDepth; hRow++) {
        const tr = document.createElement('tr');
        tr.className = 'col-hints';

        // Top-left empty spacer columns
        if (hRow === 0) {
            const corner = document.createElement('td');
            corner.className = 'empty-corner';
            corner.colSpan = maxRowHintDepth;
            corner.rowSpan = maxColHintDepth;
            tr.appendChild(corner);
        }

        // Column hint cells
        for (let c = 0; c < numCols; c++) {
            const th = document.createElement('th');
            th.className = 'col-hint-cell';
            
            const hints = currentData.columnHints[c] || [];
            const hintIndex = hRow - (maxColHintDepth - hints.length);
            
            if (hintIndex >= 0) {
                th.innerText = hints[hintIndex];
            } else {
                th.className += ' empty-hint'; 
            }
            tr.appendChild(th);
        }
        table.appendChild(tr);
    }

    // --- 2. BUILD BODY ROWS (Row Hints + Board Grid) ---
    for (let r = 0; r < numRows; r++) {
        const tr = document.createElement('tr');

        // Left-side row hint cells
        const rHints = currentData.rowHints[r] || [];
        for (let hCol = 0; hCol < maxRowHintDepth; hCol++) {
            const th = document.createElement('th');
            th.className = 'row-hint-cell';

            const hintIndex = hCol - (maxRowHintDepth - rHints.length);

            if (hintIndex >= 0) {
                th.innerText = rHints[hintIndex];
            } else {
                th.className += ' empty-hint';
            }
            tr.appendChild(th);
        }

        // Main playable board grid cells
        for (let c = 0; c < numCols; c++) {
            const td = document.createElement('td');
            const val = currentData.cells[r][c];
            td.className = `cell val-${val}`;
            td.dataset.r = r;
            td.dataset.c = c;
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    boardContainer.appendChild(table);
}

function validateBoard() {
    // 1. Clean up marks
    document.querySelectorAll('.cell.invalid').forEach(el => el.classList.remove('invalid'));

    const status = NonogramEngine.validateBoard(currentData);
    
    if (status.isValid) {
        alert("Board looks consistent so far!");
        return;
    }

    // 2. Target the first invalid cell using your dataset
    const firstError = status.invalidCells[0];
    const cellSelector = `.cell[data-r="${firstError.row}"][data-c="${firstError.col}"]`;
    const targetCell = document.querySelector(cellSelector);
    
    if (targetCell) {
        targetCell.classList.add('invalid');
        alert(`Conflict found at Row ${firstError.row + 1}, Col ${firstError.col + 1}.`);
    }
}

function getHint() {
    // For this implementation, getHint can mirror the single-cell alert cleanly
    validateBoard();
}

// ==========================================
// SITE SNIPPETS CONFIGURATION
// ==========================================
const snippetSites = [
  { 
    name: 'puzzle-nonogram',
    image: 'https://www.puzzle-nonograms.com/art/ico/puzzle-nonograms.ico',
    // We wrap the snippet string cleanly. Notice the escaped quotes where necessary.
    snippet: `JSON.stringify({
  columnHints: Array.from(document.querySelectorAll('#game #taskTop .task-group')).map(hints => 
    Array.from(hints.querySelectorAll('div.task-cell')).flatMap(hint => !!hint.innerText ? [parseInt(hint.innerText, 10)] : [])
  ),
  rowHints: Array.from(document.querySelectorAll('#game #taskLeft .task-group')).map(hints => 
    Array.from(hints.querySelectorAll('div.task-cell')).flatMap(hint => !!hint.innerText ? [parseInt(hint.innerText, 10)] : [])
  ),
  cells: Array.from(document.querySelectorAll('#game .nonograms-cell-back div.row')).map(row =>
    Array.from(row.querySelectorAll('.cell')).map(cell =>
        cell.classList.contains('cell-on') ? 1 :
          cell.classList.contains('cell-x') ? 0 :
          cell.classList.contains('cell-off') ? -1 :
          -2
    )
  )
});`
  }
  // Future sites can be appended directly right here!
];

function renderSnippetButtons() {
    const container = document.getElementById('snippet-buttons-container');
    if (!container) return;

    snippetSites.forEach(site => {
        // Create the button element
        const btn = document.createElement('button');
        btn.className = 'snippet-btn';
        btn.title = `Copy extraction snippet for ${site.name}`;
        
        // Create the icon image element
        const img = document.createElement('img');
        img.src = site.image;
        img.alt = site.name;
        img.className = 'snippet-btn-icon';

        // Assemble button text/icon
        btn.appendChild(img);
        btn.appendChild(document.createTextNode(site.name));

        // Clipboard Copy functionality
        btn.addEventListener('click', () => {
            navigator.clipboard.writeText(site.snippet)
                .then(() => {
                    const originalText = btn.innerHTML;
                    btn.innerText = 'Copied!';
                    btn.style.background = '#10b981'; // Feedback green
                    
                    setTimeout(() => {
                        btn.innerHTML = '';
                        btn.appendChild(img);
                        btn.appendChild(document.createTextNode(site.name));
                        btn.style.background = ''; // Revert style
                    }, 1500);
                })
                .catch(err => {
                    console.error('Failed to copy text: ', err);
                    alert('Failed to copy snippet automatically.');
                });
        });

        container.appendChild(btn);
    });
}

// MODIFY your existing DOMContentLoaded listener at the very bottom of app.js:
document.addEventListener('DOMContentLoaded', () => {
    renderSnippetButtons(); // Initialize your new buttons
    loadBoard();            // Auto-loads the board layout as before
});