/**
 * Nonogram Game Logic Engine - STUB ONLY
 */
const NonogramEngine = {
    /**
     * Stubbed validator for UI testing.
     * Always returns invalid and points to the top-left cell.
     */
    validateBoard(boardData) {
        return {
            isValid: false,
            invalidCells: [
                { row: 0, col: 0 } // Hardcoded stub to test Row 1, Col 1 highlighting
            ]
        };
    }
};