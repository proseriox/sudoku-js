let puzzle = [
  [0, 6, 0, 0, 0, 0, 7, 0, 1],
  [0, 0, 7, 0, 3, 0, 0, 0, 8],
  [0, 0, 0, 6, 7, 8, 0, 0, 9],
  [7, 0, 0, 0, 0, 3, 0, 9, 0],
  [8, 0, 0, 5, 1, 2, 0, 0, 7],
  [0, 5, 0, 7, 0, 0, 0, 0, 3],
  [3, 0, 0, 2, 6, 1, 0, 0, 0],
  [5, 0, 0, 0, 4, 0, 1, 0, 0],
  [4, 0, 6, 0, 0, 0, 0, 7, 0],
];

function shuffle(group) {
  const indexes = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  const gridIndexes = [0, 1, 2, 9, 10, 11, 18, 19, 20];
  for (let i = 0; i < 9; i++) {
    const gridRow = Math.floor(i / 3);
    const gridColumn = i % 3;
    const index = gridIndexes[gridRow * 3 + gridColumn];
    const choices = indexes.filter((index) => !group.includes(index));
    if (choices.length === 0) {
      return false; // Invalid shuffle, cannot find a valid choice
    }
    const randomIndex = Math.floor(Math.random() * choices.length);
    group[index] = choices[randomIndex];
  }
  return true; // Valid shuffle
}

function generatePuzzle() {
  // Start with a solved puzzle
  puzzle = [
    [1, 2, 3, 4, 5, 6, 7, 8, 9],
    [4, 5, 6, 7, 8, 9, 1, 2, 3],
    [7, 8, 9, 1, 2, 3, 4, 5, 6],
    [2, 1, 4, 3, 6, 5, 8, 9, 7],
    [3, 6, 5, 8, 9, 7, 2, 1, 4],
    [8, 9, 7, 2, 1, 4, 3, 6, 5],
    [5, 3, 1, 6, 4, 2, 9, 7, 8],
    [6, 4, 2, 9, 7, 8, 5, 3, 1],
    [9, 7, 8, 5, 3, 1, 6, 4, 2],
  ];

  // Shuffle rows within each group
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 3; j++) {
      const rowGroup = puzzle.slice(i, i + 3);
      shuffle(rowGroup[j]);
      puzzle.splice(i, 3, ...rowGroup);
    }
  }

  // Shuffle columns within each group
  for (let i = 0; i < 9; i += 3) {
    for (let j = 0; j < 3; j++) {
      const colGroup = [];
      for (let k = 0; k < 3; k++) {
        colGroup.push(...puzzle[i + k].slice(j * 3, j * 3 + 3));
      }
      shuffle(colGroup);
      for (let k = 0; k < 3; k++) {
        for (let l = 0; l < 3; l++) {
          puzzle[i + k][j * 3 + l] = colGroup[k * 3 + l];
        }
      }
    }
  }

  // Remove cells to create a puzzle
  const cellsToRemove = 40;
  for (let i = 0; i < cellsToRemove; i++) {
    const row = Math.floor(Math.random() * 9);
    const col = Math.floor(Math.random() * 9);
    if (puzzle[row][col] !== 0) {
      puzzle[row][col] = 0;
    } else {
      i--;
    }
  }

  renderGrid();
}

let selectedCell = null;

function renderGrid() {
  const gridElement = document.querySelector("#sudoku-grid");
  gridElement.innerHTML = "";

  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      const cellValue = puzzle[row][col];

      const cellElement = document.createElement("div");
      cellElement.classList.add("sudoku-cell");
      if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
        cellElement.classList.add("sudoku-cell--selected");
      }

      const inputElement = document.createElement("input");
      inputElement.type = "number";
      inputElement.min = "1";
      inputElement.max = "9";
      inputElement.value = cellValue !== 0 ? cellValue : "";
      inputElement.addEventListener("input", (event) => {
        puzzle[row][col] = Number(event.target.value);
      });
      cellElement.appendChild(inputElement);

      cellElement.addEventListener("click", () => {
        selectedCell = {row, col};
        renderGrid();
      });

      gridElement.appendChild(cellElement);
    }
  }
}

function solve() {
  if (solveSudoku(0, 0)) {
    renderGrid();
  } else {
    alert("No solution found");
  }
}

function solveSudoku(row, col) {
  if (row === 9) {
    // We have reached the end of the grid (i.e., found a solution)
    return true;
  }

  if (puzzle[row][col] !== 0) {
    // This cell is already filled, move to the next one
    if (col === 8) {
      return solveSudoku(row + 1, 0);
    } else {
      return solveSudoku(row, col + 1);
    }
  }

  for (let value = 1; value <= 9; value++) {
    if (isValidValue(row, col, value)) {
      puzzle[row][col] = value;

      if (col === 8) {
        if (solveSudoku(row + 1, 0)) {
          return true;
        }
      } else {
        if (solveSudoku(row, col + 1)) {
          return true;
        }
      }

      puzzle[row][col] = 0;
    }
  }

  return false;
}

function isValidValue(row, col, value) {
  // Check if value is already in the same row or column
  for (let i = 0; i < 9; i++) {
    if (puzzle[row][i] === value || puzzle[i][col] === value) {
      return false;
    }
  }

  // Check if value is already in the same 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let i = boxRow; i < boxRow + 3; i++) {
    for (let j = boxCol; j < boxCol + 3; j++) {
      if (puzzle[i][j] === value) {
        return false;
      }
    }
  }

  // Value is valid
  return true;
}

function clearGrid() {
  selectedCell = null;
  puzzle.forEach((row, rowIndex) => {
    row.forEach((_, colIndex) => {
      puzzle[rowIndex][colIndex] = 0;
    });
  });
  renderGrid();
}

renderGrid();
generatePuzzle();
document.querySelector("#solve-button").addEventListener("click", solve);
document.querySelector("#clear-button").addEventListener("click", clearGrid);
