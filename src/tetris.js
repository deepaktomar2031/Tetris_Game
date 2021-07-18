const canvas = document.getElementById("tetris");
const context = canvas.getContext("2d");
const scoreElement = document.getElementById("score");
const ROW = 20;
const COLUMN = 10;
const squareSize = 20;
const VACANT = "WHITE";

// draw a square
function drawSquare(x, y, color) {
    context.fillStyle = color;
    context.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    context.strokeStyle = "BLACK";
    context.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

// create the board
let board = [];
for (let r = 0; r < ROW; r++) {
    board[r] = [];
    for (let c = 0; c < COLUMN; c++) {
        board[r][c] = VACANT;
    }
}

// draw the board
function drawBoard() {
    for (let r = 0; r < ROW; r++) {
        for (let c = 0; c < COLUMN; c++) {
            drawSquare(c, r, board[r][c]);
        }
    }
}
drawBoard();

// the pieces and their colors
const BLOCKS = [
    [I, "black"],
    [O, "purple"],
    [T, "red"],
    [S, "yellow"],
    [Z, "green"],
    [J, "blue"],
    [L, "orange"]
];

// generate random blocks
function randomBlocks() {
    let r = randomN = Math.floor(Math.random() * BLOCKS.length)
    return new Piece(BLOCKS[r][0], BLOCKS[r][1]);
}
let blockObject = randomBlocks();

// The Object of Piece
function Piece(tetromino, color) {
    this.tetromino = tetromino;
    this.color = color;

    this.tetrominoN = 0;
    this.activeTetromino = this.tetromino[this.tetrominoN];

    this.x = 3;
    this.y = -2;
}

// function to fill the block
Piece.prototype.fill = function (color) {
    for (r = 0; r < this.activeTetromino.length; r++) {
        for (c = 0; c < this.activeTetromino.length; c++) {
            if (this.activeTetromino[r][c]) {
                drawSquare(this.x + c, this.y + r, color);
            }
        }
    }
}

// function to draw a piece to the board
Piece.prototype.draw = function () {
    this.fill(this.color);
}

// function to Undraw a piece
Piece.prototype.unDraw = function () {
    this.fill(VACANT);
}

// function to move Down the piece
Piece.prototype.moveDown = function () {
    if (!this.collision(0, 1, this.activeTetromino)) {
        this.unDraw();
        this.y++;
        this.draw();
    } else {
        this.lockTheBlock();
        blockObject = randomBlocks();
    }
}

// function to move Right the piece
Piece.prototype.moveRight = function () {
    if (!this.collision(1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x++;
        this.draw();
    }
}

// function to move Left the piece
Piece.prototype.moveLeft = function () {
    if (!this.collision(-1, 0, this.activeTetromino)) {
        this.unDraw();
        this.x--;
        this.draw();
    }
}

// function to rotate the piece
Piece.prototype.rotate = function () {
    let nextPattern = this.tetromino[(this.tetrominoN + 1) % this.tetromino.length];
    let kick = 0;

    if (this.collision(0, 0, nextPattern)) {
        if (this.x > COLUMN / 2) {
            kick = -1; 
        } else {
            kick = 1; 
        }
    }

    if (!this.collision(kick, 0, nextPattern)) {
        this.unDraw();
        this.x += kick;
        this.tetrominoN = (this.tetrominoN + 1) % this.tetromino.length; 
        this.activeTetromino = this.tetromino[this.tetrominoN];
        this.draw();
    }
}

let score = 0;

Piece.prototype.lockTheBlock = function () {
    for (let r = 0; r < this.activeTetromino.length; r++) {
        for (let c = 0; c < this.activeTetromino.length; c++) {
            if (!this.activeTetromino[r][c]) {
                continue;
            }
            if (this.y + r < 0) {
                alert("Game Over");
                gameOver = true;
                break;
            }
            board[this.y + r][this.x + c] = this.color;
        }
    }
    for (let r = 0; r < ROW; r++) {
        let isRowFull = true;
        for (let c = 0; c < COLUMN; c++) {
            isRowFull = isRowFull && (board[r][c] != VACANT);
        }
        if (isRowFull) {
            for (let y = r; y > 1; y--) {
                for (let c = 0; c < COLUMN; c++) {
                    board[y][c] = board[y - 1][c];
                }
            }
            for (let c = 0; c < COLUMN; c++) {
                board[0][c] = VACANT;
            }
            score += 10;
        }
    }
    drawBoard();

    scoreElement.innerHTML = score;
}

// collision fucntion
Piece.prototype.collision = function (x, y, piece) {
    for (let r = 0; r < piece.length; r++) {
        for (let c = 0; c < piece.length; c++) {
            if (!piece[r][c]) {
                continue;
            }
            let newX = this.x + c + x;
            let newY = this.y + r + y;

            if (newX < 0 || newX >= COLUMN || newY >= ROW) {
                return true;
            }
            if (newY < 0) {
                continue;
            }
            if (board[newY][newX] != VACANT) {
                return true;
            }
        }
    }
    return false;
}

// CONTROL the piece
document.addEventListener("keydown", CONTROL);

function CONTROL(event) {
    if (event.keyCode == 37) {
        blockObject.moveLeft();
        dropStart = Date.now();
    } else if (event.keyCode == 38) {
        blockObject.rotate();
        dropStart = Date.now();
    } else if (event.keyCode == 39) {
        blockObject.moveRight();
        dropStart = Date.now();
    } else if (event.keyCode == 40) {
        blockObject.moveDown();
    }
}

// drop the piece
let dropStart = Date.now();
let gameOver = false;
function drop() {
    let now = Date.now();
    let delta = now - dropStart;
    if (delta > 1000) {
        blockObject.moveDown();
        dropStart = Date.now();
    }
    if (!gameOver) {
        requestAnimationFrame(drop);
    }
}
drop();