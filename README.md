# Nonogram Logic Helper
A web-based helper tool for validating and solving Nonogram logic puzzles.

## Status capture
### `puzzle-nonogram.com`
```js
JSON.stringify({
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
});
```