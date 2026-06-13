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

function validateBoard() { alert("Logic coming soon!"); }
function getHint(type) { alert("Logic coming soon!"); }

// Auto-load the board when the page finishes loading
document.addEventListener('DOMContentLoaded', loadBoard);