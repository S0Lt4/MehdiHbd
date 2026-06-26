const boardElement = document.getElementById('board');
const statusMsg = document.getElementById('status-msg');
const gameContainer = document.getElementById('game-container');
const revealSection = document.getElementById('birthday-reveal');

let selectedSquare = null;

// Initial state for a simple "Back Rank Mate" puzzle
// 0: empty, P: white pawn, p: black pawn, K/k: king, Q/q: queen, etc.
// Pieces represented by Unicode
const pieces = {
    'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
    'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟'
};

const initialBoard = [
    ['br', '', '', 'bk', '', 'bb', '', 'br'],
    ['bp', 'bp', 'bp', '', 'bp', 'bp', 'bp', 'bp'],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', ''],
    ['WP', 'WP', 'WP', 'WQ', 'WP', 'WP', 'WP', 'WP'],
    ['WR', '', '', 'WK', '', 'WR', '', '']
];

// Flat representation for easier handling
let boardState = Array(64).fill(null);

// Specific puzzle setup: Back rank mate
// Black King on g8 (row 0, col 6 -> index 6)
// Black Pawns on f7, g7, h7 (index 13, 14, 15)
// White Queen on d1 (row 7, col 3 -> index 59)
function setupPuzzle() {
    boardState = Array(64).fill(null);
    boardState[6] = 'bk'; // King
    boardState[13] = 'bp'; 
    boardState[14] = 'bp'; 
    boardState[15] = 'bp';
    
    boardState[59] = 'wq'; // Queen on d1
    boardState[62] = 'wk'; // King on g1
    
    renderBoard();
}

function renderBoard() {
    boardElement.innerHTML = '';
    for (let i = 0; i < 64; i++) {
        const square = document.createElement('div');
        const row = Math.floor(i / 8);
        const col = i % 8;
        
        square.classList.add('square');
        square.classList.add((row + col) % 2 === 0 ? 'white' : 'black');
        square.dataset.index = i;
        
        if (boardState[i]) {
            const piece = document.createElement('div');
            piece.classList.add('piece');
            piece.textContent = pieces[boardState[i]];
            square.appendChild(piece);
        }
        
        square.addEventListener('click', () => handleSquareClick(i));
        boardElement.appendChild(square);
    }
}

function handleSquareClick(index) {
    if (selectedSquare === null) {
        // Select a piece
        if (boardState[index] && boardState[index].startsWith('w')) {
            selectedSquare = index;
            highlightSquare(index);
        }
    } else {
        // Move piece
        if (isValidMove(selectedSquare, index)) {
            movePiece(selectedSquare, index);
            checkWin(index);
        }
        clearHighlights();
        selectedSquare = null;
    }
}

function highlightSquare(index) {
    clearHighlights();
    const squares = document.querySelectorAll('.square');
    squares[index].classList.add('highlight');
}

function clearHighlights() {
    const squares = document.querySelectorAll('.square');
    squares.forEach(s => s.classList.remove('highlight'));
}

function isValidMove(from, to) {
    // For this simple birthday puzzle, we only care if they move the Queen to the back rank
    const piece = boardState[from];
    if (piece === 'wq') {
        const toRow = Math.floor(to / 8);
        const fromRow = Math.floor(from / 8);
        const fromCol = from % 8;
        const toCol = to % 8;
        
        // Horizontal, Vertical or Diagonal
        const dRow = Math.abs(toRow - fromRow);
        const dCol = Math.abs(toCol - fromCol);
        
        return (dRow === 0 || dCol === 0 || dRow === dCol);
    }
    return false;
}

function movePiece(from, to) {
    boardState[to] = boardState[from];
    boardState[from] = null;
    renderBoard();
}

function checkWin(toIndex) {
    const row = Math.floor(toIndex / 8);
    const col = toIndex % 8;
    
    // Checkmate if Queen reaches row 0 (back rank) and is near the king?
    // Let's just make any move to row 0 win for the "fun" factor
    if (row === 0) {
        triggerWin();
    }
}

function triggerWin() {
    statusMsg.innerText = "Checkmate!";
    statusMsg.style.color = "var(--black-square)";
    
    setTimeout(() => {
        gameContainer.style.display = 'none';
        revealSection.style.display = 'block';
        launchConfetti();
    }, 600);
}

function launchConfetti() {
    const duration = 3 * 1000;
    const end = Date.now() + duration;

    (function frame() {
        confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ['#d4af37', '#ffffff', '#8e44ad']
        });
        confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ['#d4af37', '#ffffff', '#8e44ad']
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Initialize
setupPuzzle();
