const boardEl = document.getElementById("board");
const movesEl = document.getElementById("moves");
const timeEl = document.getElementById("time");
const scoreEl = document.getElementById("score");

const difficultyEl = document.getElementById("difficulty");

const restartBtn = document.getElementById("restartBtn");
const newGameBtn = document.getElementById("newGameBtn");
const clearLeaderboardBtn = document.getElementById("clearLeaderboardBtn");

const winModal = document.getElementById("winModal");
const finalTimeEl = document.getElementById("finalTime");
const finalMovesEl = document.getElementById("finalMoves");
const finalScoreEl = document.getElementById("finalScore");
const playerNameEl = document.getElementById("playerName");
const submitScoreBtn = document.getElementById("submitScoreBtn");

const leaderboardBody = document.getElementById("leaderboardBody");
const noScoresText = document.getElementById("noScoresText");

let size = 3;
let board = [];
let moves = 0;
let time = 0;
let score = 0;
let timerInterval = null;
let gameWon = false;

const multipliers = {
  Easy: 1,
  Medium: 2,
  Hard: 3
};

function generateSolvedBoard() {
  const total = size * size;
  const arr = [];

  for (let i = 1; i < total; i++) {
    arr.push(i);
  }
  arr.push(0);
  return arr;
}

function shuffleBoard(arr) {
  // Shuffle randomly
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function createBoard() {
  boardEl.innerHTML = "";
  boardEl.style.gridTemplateColumns = `repeat(${size}, 70px)`;

  board.forEach((tile, index) => {
    const div = document.createElement("div");
    div.classList.add("tile");

    if (tile === 0) {
      div.classList.add("empty");
      div.textContent = "";
    } else {
      div.textContent = tile;
      div.addEventListener("click", () => moveTile(index));
    }

    boardEl.appendChild(div);
  });
}

function calculateScore() {
  const base = multipliers[difficultyEl.value] * 10000;
  score = Math.max(0, base - time * 10 - moves * 5);
  scoreEl.textContent = score;
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    if (!gameWon) {
      time++;
      timeEl.textContent = time;
      calculateScore();
    }
  }, 1000);
}

function isSolved() {
  const solved = generateSolvedBoard();
  for (let i = 0; i < solved.length; i++) {
    if (board[i] !== solved[i]) return false;
  }
  return true;
}

function moveTile(index) {
  if (gameWon) return;

  const emptyIndex = board.indexOf(0);

  const row = Math.floor(index / size);
  const col = index % size;

  const emptyRow = Math.floor(emptyIndex / size);
  const emptyCol = emptyIndex % size;

  const isAdjacent =
    (row === emptyRow && Math.abs(col - emptyCol) === 1) ||
    (col === emptyCol && Math.abs(row - emptyRow) === 1);

  if (!isAdjacent) return;

  [board[index], board[emptyIndex]] = [board[emptyIndex], board[index]];

  moves++;
  movesEl.textContent = moves;

  calculateScore();
  createBoard();

  if (isSolved()) {
    winGame();
  }
}

function winGame() {
  gameWon = true;
  clearInterval(timerInterval);

  finalTimeEl.textContent = time;
  finalMovesEl.textContent = moves;
  finalScoreEl.textContent = score;

  winModal.classList.remove("hidden");
}

function resetGame() {
  moves = 0;
  time = 0;
  score = 0;
  gameWon = false;

  movesEl.textContent = moves;
  timeEl.textContent = time;
  scoreEl.textContent = score;

  board = shuffleBoard(generateSolvedBoard());
  createBoard();
  startTimer();
}

function newGame() {
  resetGame();
}

function setDifficulty() {
  const diff = difficultyEl.value;

  if (diff === "Easy") size = 3;
  if (diff === "Medium") size = 4;
  if (diff === "Hard") size = 5;

  resetGame();
  renderLeaderboard();
}

function saveScore(name) {
  const data = {
    name,
    difficulty: difficultyEl.value,
    time,
    moves,
    score,
    date: new Date().toISOString()
  };

  let scores = JSON.parse(localStorage.getItem("puzzleScores")) || [];
  scores.push(data);

  // Sort by score highest
  scores.sort((a, b) => b.score - a.score);

  // Keep top 50 overall
  scores = scores.slice(0, 50);

  localStorage.setItem("puzzleScores", JSON.stringify(scores));
}

function renderLeaderboard() {
  leaderboardBody.innerHTML = "";

  const allScores = JSON.parse(localStorage.getItem("puzzleScores")) || [];
  const diffScores = allScores.filter(s => s.difficulty === difficultyEl.value);

  const top10 = diffScores.slice(0, 10);

  if (top10.length === 0) {
    noScoresText.style.display = "block";
  } else {
    noScoresText.style.display = "none";
  }

  top10.forEach((player, index) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${player.name}</td>
      <td>${player.difficulty}</td>
      <td>${player.score}</td>
      <td>${player.time}</td>
      <td>${player.moves}</td>
    `;

    leaderboardBody.appendChild(row);
  });
}

submitScoreBtn.addEventListener("click", () => {
  const name = playerNameEl.value.trim();

  if (!name) {
    alert("Please enter your name!");
    return;
  }

  saveScore(name);
  renderLeaderboard();

  playerNameEl.value = "";
  winModal.classList.add("hidden");

  alert("Score saved successfully!");
});

restartBtn.addEventListener("click", resetGame);
newGameBtn.addEventListener("click", newGame);

difficultyEl.addEventListener("change", setDifficulty);

clearLeaderboardBtn.addEventListener("click", () => {
  if (confirm("Are you sure you want to clear leaderboard?")) {
    localStorage.removeItem("puzzleScores");
    renderLeaderboard();
  }
});

window.addEventListener("load", () => {
  resetGame();
  renderLeaderboard();
});