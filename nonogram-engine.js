class NonogramValidator {
  constructor() {
    // Our cache key will look like: "hintIdx,cellIdx" -> boolean
    this.memo = new Map();
  }

  /**
   * Determines if the current cell configuration can legally fulfill the given hints.
   * @param {number[]} hints - e.g., [2, 1]
   * @param {number[]} cellStatuses - e.g., [1, -1, 0, -1]
   * @returns {boolean}
   */
  canFit(hints, cellStatuses) {
    this.memo.clear(); // Clear cache before a fresh run
    return this._backtrack(hints, cellStatuses, 0, 0);
  }

  /**
   * Internal recursive worker with memoization
   */
  _backtrack(hints, cells, hintIdx, cellIdx) {
    // Check cache first
    const cacheKey = `${hintIdx},${cellIdx}`;
    if (this.memo.has(cacheKey)) {
      return this.memo.get(cacheKey);
    }

    // Base Case 1: All hints have been successfully placed
    if (hintIdx === hints.length) {
      // The remaining unexamined cells must NOT contain any definitive black cells (1)
      for (let i = cellIdx; i < cells.length; i++) {
        if (cells[i] === 1) {
          this.memo.set(cacheKey, false);
          return false;
        }
      }
      this.memo.set(cacheKey, true);
      return true;
    }

    // Base Case 2: Out of cells, but we still have remaining hints to place
    if (cellIdx >= cells.length) {
      this.memo.set(cacheKey, false);
      return false;
    }

    const currentCell = cells[cellIdx];
    let canFormValidPattern = false;

    // Scenario A: Treat current cell as a SPACE/CROSS (0)
    // Allowed if the cell is currently an X (0) or unmarked (-1)
    if (currentCell === 0 || currentCell === -1) {
      if (this._backtrack(hints, cells, hintIdx, cellIdx + 1)) {
        canFormValidPattern = true;
      }
    }

    // Scenario B: Treat current cell as the START of a blocks run (1)
    // Allowed if the cell is currently Black (1) or unmarked (-1)
    if (!canFormValidPattern && (currentCell === 1 || currentCell === -1)) {
      const currentRunLength = hints[hintIdx];

      if (this._canPlaceBlockRun(cells, cellIdx, currentRunLength)) {
        // If we successfully placed the run, we must jump past it.
        // Nonograms require at least one empty spacer space after a continuous run.
        const nextCellIdx = cellIdx + currentRunLength + 1;

        if (this._backtrack(hints, cells, hintIdx + 1, nextCellIdx)) {
          canFormValidPattern = true;
        }
      }
    }

    this.memo.set(cacheKey, canFormValidPattern);
    return canFormValidPattern;
  }

  /**
   * Helper to verify if a continuous segment of blocks can physically fit
   */
  _canPlaceBlockRun(cells, startIdx, runLength) {
    // 1. Not enough cells remaining to satisfy the target length
    if (startIdx + runLength > cells.length) return false;

    // 2. All cells inside the proposed target segment must accept being black (1 or -1)
    for (let i = startIdx; i < startIdx + runLength; i++) {
      if (cells[i] === 0) return false; // Blocked by an explicit X
    }

    // 3. The trailing separator cell right after the run must NOT be a mandatory black cell (1)
    const separationCellIdx = startIdx + runLength;
    if (separationCellIdx < cells.length && cells[separationCellIdx] === 1) {
      return false; // Mismatch: Run would be forced to be longer than intended
    }

    return true;
  }
}

// Ensure you have the class defined above this object
const NonogramEngine = {
  validator: new NonogramValidator(),

  canFit(hints, cellStatuses) {
    return this.validator.canFit(hints, cellStatuses);
  },

  getColumn(cells, colIndex) {
    return cells.map((row) => row[colIndex]);
  },

  getHint(boardData) {
    const { cells, rowHints, columnHints } = boardData;
    const numRows = cells.length;
    const numCols = cells[0].length;

    // Internal helper to test a move
    const wouldItFit = (r, c, val) => {
      const originalVal = cells[r][c];
      cells[r][c] = val; // Temporarily make the move

      // Must fit BOTH the row and the column
      const rowFits = this.canFit(rowHints[r], cells[r]);
      const colFits = this.canFit(columnHints[c], this.getColumn(cells, c));

      cells[r][c] = originalVal; // Revert immediately
      return rowFits && colFits;
    };

    // Iterate through all cells
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        // Only evaluate unmarked cells
        if (cells[r][c] !== -1) continue;

        const blackFits = wouldItFit(r, c, 1);
        const whiteFits = wouldItFit(r, c, 0);

        // Deduction: If one fits and the other doesn't, we have an answer!
        if (blackFits && !whiteFits) {
          return { row: r, col: c, value: 1, reason: "Must be Black" };
        }
        if (!blackFits && whiteFits) {
          return { row: r, col: c, value: 0, reason: "Must be White" };
        }
      }
    }

    return null; // No logical deduction possible
  },

  validateBoard(boardData) {
    const { cells, rowHints, columnHints } = boardData;
    const numRows = cells.length;
    const numCols = cells[0].length;

    const badRows = [];
    const badCols = [];

    // 1. Find which entire lines are broken
    for (let r = 0; r < numRows; r++) {
      if (!this.canFit(rowHints[r], cells[r])) {
        badRows.push(r);
      }
    }

    for (let c = 0; c < numCols; c++) {
      if (!this.canFit(columnHints[c], this.getColumn(cells, c))) {
        badCols.push(c);
      }
    }

    // If everything fits, we are golden
    if (badRows.length === 0 && badCols.length === 0) {
      return { isValid: true, invalidCells: [] };
    }

    const invalidCells = [];
    const invalidSet = new Set();

    const addInvalid = (r, c) => {
      const key = `${r},${c}`;
      if (!invalidSet.has(key)) {
        invalidCells.push({ row: r, col: c });
        invalidSet.add(key);
      }
    };

    // 2. PRIORITIZE: Find marked cells (0 or 1) that live inside any broken line
    for (let r = 0; r < numRows; r++) {
      for (let c = 0; c < numCols; c++) {
        if (badRows.includes(r) || badCols.includes(c)) {
          // If the cell is explicitly marked, it's our prime suspect!
          if (cells[r][c] === 0 || cells[r][c] === 1) {
            addInvalid(r, c);
          }
        }
      }
    }

    // 3. FALLBACK: If lines are broken but the user hasn't placed any marks there yet,
    // fill in the rest of the cells on those broken lines
    badRows.forEach((r) => {
      for (let c = 0; c < numCols; c++) addInvalid(r, c);
    });

    badCols.forEach((c) => {
      for (let r = 0; r < numRows; r++) addInvalid(r, c);
    });

    return {
      isValid: false,
      invalidCells: invalidCells,
    };
  },
};
