// Game constants
const canvas = document.getElementById('game-board');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const messageDisplay = document.getElementById('message');
const startButton = document.getElementById('start-button');
const TILE_SIZE = 20; // Size of each block (20x20 pixels)
const GRID_SIZE = canvas.width / TILE_SIZE; // 400 / 20 = 20 tiles wide/high

// Game state variables
let snake;
let food;
let dx = TILE_SIZE; // Velocity X (starts moving Right)
let dy = 0;        // Velocity Y
let score = 0;
let gameLoopInterval;
let isGameRunning = false;
let changingDirection = false; // Flag to prevent rapid direction changes

// --- Core Game Functions ---

function startGame() {
    if (isGameRunning) return;

    // Reset game state
    score = 0;
    scoreDisplay.textContent = 'Score: 0';
    messageDisplay.textContent = '';
    isGameRunning = true;
    startButton.textContent = 'Restart';
    startButton.disabled = true; // Disable start button during play

    // Initialize snake (starts with 3 segments)
    snake = [
        { x: 6 * TILE_SIZE, y: 10 * TILE_SIZE },
        { x: 5 * TILE_SIZE, y: 10 * TILE_SIZE },
        { x: 4 * TILE_SIZE, y: 10 * TILE_SIZE }
    ];
    dx = TILE_SIZE; // Initial direction: Right
    dy = 0;
    changingDirection = false;
    
    placeFood();

    // Start the game loop (runs every 100ms)
    gameLoopInterval = setInterval(update, 100);
}

function update() {
    if (gameOver()) {
        clearInterval(gameLoopInterval);
        isGameRunning = false;
        startButton.disabled = false;
        messageDisplay.textContent = 'Game Over! Final Score: ' + score;
        return;
    }

    changingDirection = false;
    
    moveSnake();
    drawGame();
}

function moveSnake() {
    // 1. Create the new head
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // 2. Add the new head to the beginning of the snake array
    snake.unshift(head);

    // 3. Check for food collision
    if (head.x === food.x && head.y === food.y) {
        // Food eaten: don't remove the tail (snake grows)
        score++;
        scoreDisplay.textContent = 'Score: ' + score;
        placeFood(); // Place new food
    } else {
        // Food not eaten: remove the tail
        snake.pop();
    }
}

function gameOver() {
    const head = snake[0];

    // Check for collision with self
    for (let i = 1; i < snake.length; i++) {
        if (head.x === snake[i].x && head.y === snake[i].y) return true;
    }

    // Check for collision with walls
    const hitLeftWall = head.x < 0;
    const hitRightWall = head.x >= canvas.width;
    const hitTopWall = head.y < 0;
    const hitBottomWall = head.y >= canvas.height;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

function placeFood() {
    // Generate a random position for the food
    function randomCoord() {
        // Multiplies random grid index by TILE_SIZE (e.g., 0 to 19 * 20)
        return Math.floor(Math.random() * GRID_SIZE) * TILE_SIZE; 
    }

    food = { x: randomCoord(), y: randomCoord() };

    // Check if food is placed on the snake, if so, retry
    for (let i = 0; i < snake.length; i++) {
        if (food.x === snake[i].x && food.y === snake[i].y) {
            placeFood();
            return;
        }
    }
}

function drawGame() {
    // Clear the canvas
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw food (Red circle)
    ctx.fillStyle = 'red';
    ctx.beginPath();
    // Draw a circle centered on the tile
    ctx.arc(food.x + TILE_SIZE / 2, food.y + TILE_SIZE / 2, TILE_SIZE / 2, 0, 2 * Math.PI);
    ctx.fill();

    // Draw snake (Green squares)
    ctx.fillStyle = 'lightgreen';
    ctx.strokeStyle = '#006400';
    snake.forEach(segment => {
        ctx.fillRect(segment.x, segment.y, TILE_SIZE, TILE_SIZE);
        ctx.strokeRect(segment.x, segment.y, TILE_SIZE, TILE_SIZE);
    });
}

// --- Input Handling ---

function changeDirection(newDx, newDy) {
    // Prevent changing direction more than once per game tick
    if (changingDirection) return;
    changingDirection = true;

    const goingUp = dy === -TILE_SIZE;
    const goingDown = dy === TILE_SIZE;
    const goingRight = dx === TILE_SIZE;
    const goingLeft = dx === -TILE_SIZE;

    // Check for opposite direction to prevent instant death
    if (newDy === -TILE_SIZE && !goingDown) {
        dx = 0; dy = newDy;
    } else if (newDy === TILE_SIZE && !goingUp) {
        dx = 0; dy = newDy;
    } else if (newDx === -TILE_SIZE && !goingRight) {
        dx = newDx; dy = 0;
    } else if (newDx === TILE_SIZE && !goingLeft) {
        dx = newDx; dy = 0;
    }
}

// Keyboard listener for desktop/physical keyboards
document.addEventListener('keydown', (event) => {
    if (!isGameRunning) return;

    const keyPressed = event.key;

    if (keyPressed === 'ArrowUp' || keyPressed === 'w') {
        changeDirection(0, -TILE_SIZE);
    } else if (keyPressed === 'ArrowDown' || keyPressed === 's') {
        changeDirection(0, TILE_SIZE);
    } else if (keyPressed === 'ArrowLeft' || keyPressed === 'a') {
        changeDirection(-TILE_SIZE, 0);
    } else if (keyPressed === 'ArrowRight' || keyPressed === 'd') {
        changeDirection(TILE_SIZE, 0);
    }
});

// Mobile button listeners
document.getElementById('up').addEventListener('click', () => {
    if (isGameRunning) changeDirection(0, -TILE_SIZE);
});
document.getElementById('down').addEventListener('click', () => {
    if (isGameRunning) changeDirection(0, TILE_SIZE);
});
document.getElementById('left').addEventListener('click', () => {
    if (isGameRunning) changeDirection(-TILE_SIZE, 0);
});
document.getElementById('right').addEventListener('click', () => {
    if (isGameRunning) changeDirection(TILE_SIZE, 0);
});

// Initial Setup
startButton.addEventListener('click', startGame);
drawGame(); // Draw the initial empty board
