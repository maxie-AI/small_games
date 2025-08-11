// 游戏合集主控制器
class GameCollection {
    constructor() {
        this.currentGame = null;
        this.gameInstances = {};
        this.canvas = null;
        this.ctx = null;
        this.init();
    }



    init() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupEventListeners();
        this.showGameSelection();
    }

    setupEventListeners() {
        // 游戏卡片点击事件
        document.querySelectorAll('.game-card').forEach(card => {
            card.addEventListener('click', () => {
                const gameType = card.dataset.game;
                this.startGame(gameType);
            });
        });

        // 返回按钮
        document.getElementById('backButton').addEventListener('click', () => {
            this.showGameSelection();
        });

        // 游戏控制按钮
        document.getElementById('startBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.start();
        });

        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.pause();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.reset();
        });

        document.getElementById('restartBtn').addEventListener('click', () => {
            if (this.currentGame) this.currentGame.restart();
        });

        // 移动端控制
        document.getElementById('upBtn').addEventListener('click', () => {
            if (this.currentGame && this.currentGame.handleInput) {
                this.currentGame.handleInput('up');
            }
        });

        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.currentGame && this.currentGame.handleInput) {
                this.currentGame.handleInput('down');
            }
        });

        document.getElementById('leftBtn').addEventListener('click', () => {
            if (this.currentGame && this.currentGame.handleInput) {
                this.currentGame.handleInput('left');
            }
        });

        document.getElementById('rightBtn').addEventListener('click', () => {
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('right');
                }
            });
            
            // 添加开火按键事件监听器
            document.getElementById('fireBtn').addEventListener('click', () => {
                if (this.currentGame && this.currentGame.handleInput) {
                    this.currentGame.handleInput('fire');
                }
            });

        // 键盘事件
        document.addEventListener('keydown', (e) => {
            if (this.currentGame && this.currentGame.handleKeyPress) {
                this.currentGame.handleKeyPress(e);
            }
        });

        // 设置点击事件监听器
        this.canvas.addEventListener('click', (e) => {
            if (this.currentGame && this.currentGame.handleClick) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const x = (e.clientX - rect.left) * scaleX;
                const y = (e.clientY - rect.top) * scaleY;
                this.currentGame.handleClick(x, y);
            }
        });

        // 触摸滑动事件
        this.setupTouchEvents();
    }

    setupTouchEvents() {
        let startX, startY;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            const touch = e.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
        });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!startX || !startY) return;

            const touch = e.changedTouches[0];
            const endX = touch.clientX;
            const endY = touch.clientY;

            const deltaX = endX - startX;
            const deltaY = endY - startY;

            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                if (deltaX > 30) {
                    if (this.currentGame && this.currentGame.handleInput) {
                        this.currentGame.handleInput('right');
                    }
                } else if (deltaX < -30) {
                    if (this.currentGame && this.currentGame.handleInput) {
                        this.currentGame.handleInput('left');
                    }
                }
            } else {
                if (deltaY > 30) {
                    if (this.currentGame && this.currentGame.handleInput) {
                        this.currentGame.handleInput('down');
                    }
                } else if (deltaY < -30) {
                    if (this.currentGame && this.currentGame.handleInput) {
                        this.currentGame.handleInput('up');
                    }
                }
            }

            // 对于某些游戏，点击也是有效输入 - 修复移动端触控定位
            if (this.currentGame && this.currentGame.handleClick) {
                const rect = this.canvas.getBoundingClientRect();
                const scaleX = this.canvas.width / rect.width;
                const scaleY = this.canvas.height / rect.height;
                const canvasX = (endX - rect.left) * scaleX;
                const canvasY = (endY - rect.top) * scaleY;
                this.currentGame.handleClick(canvasX, canvasY);
            }

            startX = null;
            startY = null;
        });
    }

    showGameSelection() {
        document.querySelector('.main-container').classList.remove('hidden');
        document.getElementById('gameContainer').classList.add('hidden');
        document.getElementById('backButton').classList.add('hidden');
        
        if (this.currentGame) {
            this.currentGame.stop();
            this.currentGame = null;
        }
    }

    async startGame(gameType) {
        document.querySelector('.main-container').classList.add('hidden');
        document.getElementById('gameContainer').classList.remove('hidden');
        document.getElementById('backButton').classList.remove('hidden');

        // 创建或获取游戏实例
        if (!this.gameInstances[gameType]) {
            this.gameInstances[gameType] = this.createGameInstance(gameType);
        }

        this.currentGame = this.gameInstances[gameType];
        
        // 对于Pokemon游戏，需要等待异步初始化完成
        if (gameType === 'pokemon') {
            await this.currentGame.init();
        } else {
            this.currentGame.init();
        }
        
        this.updateGameUI(gameType);
    }

    createGameInstance(gameType) {
        switch (gameType) {
            case 'snake': return new SnakeGame(this.canvas, this.ctx);
            case 'tetris': return new TetrisGame(this.canvas, this.ctx);
            case 'flappybird': return new FlappyBirdGame(this.canvas, this.ctx);
            case 'breakout': return new BreakoutGame(this.canvas, this.ctx);
            case 'tank': return new TankGame(this.canvas, this.ctx);
            case 'memory': return new MemoryGame(this.canvas, this.ctx);
            case 'crossy': return new CrossyRoadGame(this.canvas, this.ctx);
            case '2048': return new DoodleJumpGame(this.canvas, this.ctx);
            case 'gomoku': return new GomokuGame(this.canvas, this.ctx);
            case 'pokemon': return new PokemonGame(this.canvas, this.ctx);
            default: return null;
        }
    }

    updateGameUI(gameType) {
        const gameNames = {
              'snake': '🐍 贪吃蛇',
              'tetris': '🧩 俄罗斯方块',
              'flappybird': '🐦 飞翔小鸟',
              'breakout': '🏓 打砖块',
              'tank': '🪖 坦克大战',
              'memory': '🧠 记忆翻牌',
              'crossy': '🐔 小鸡过马路',
              '2048': '🦘 Doodle Jump',
              'gomoku': '⚫ 五子棋',
              'pokemon': '⚡ Pokemon识别'
          };

        const instructions = {
              'snake': ['使用方向键或点击控制按钮移动蛇', '吃到食物可以增长身体和得分', '避免撞到墙壁或自己的身体'],
              'tetris': ['使用方向键移动和旋转方块', '填满一行可以消除获得分数', '方块堆到顶部游戏结束'],
              'flappybird': ['点击屏幕或按空格键让小鸟飞翔', '避开管道障碍物', '飞得越远分数越高'],
              'breakout': ['移动挡板反弹球', '击破所有砖块获胜', '不要让球掉落'],
              'tank': ['使用方向键控制坦克移动', '按空格键发射子弹', '击毁敌方坦克获得分数'],
              'memory': ['点击卡片翻开', '记住卡片位置', '配对所有卡片获胜'],
              'crossy': ['使用方向键控制小鸡移动', '躲避来往车辆', '安全过马路获得分数'],
              '2048': ['使用方向键或点击屏幕左右移动', '自动跳跃到平台上', '爬得越高分数越高'],
              'gomoku': ['点击棋盘放置棋子', '五个连线获胜', '与电脑对战'],
              'pokemon': ['观察Pokemon图片', '从四个选项中选择正确名字', '三次错误游戏结束']
          };

        document.getElementById('gameTitle').textContent = gameNames[gameType];
        
        const instructionContent = document.getElementById('instructionContent');
        instructionContent.innerHTML = '';
        const ul = document.createElement('ul');
        instructions[gameType].forEach(instruction => {
            const li = document.createElement('li');
            li.textContent = instruction;
            ul.appendChild(li);
        });
        instructionContent.appendChild(ul);

        // 显示/隐藏移动控制
          const needsDirectionalControls = ['snake', 'crossy', 'breakout', 'tank'].includes(gameType);
          document.getElementById('mobileControls').style.display = needsDirectionalControls ? 'block' : 'none';
          
          // 显示/隐藏开火按键（仅坦克游戏需要）
          const fireBtn = document.getElementById('fireBtn');
          if (gameType === 'tank') {
              fireBtn.style.display = 'block';
          } else {
              fireBtn.style.display = 'none';
          }
    }

    updateScore(score, highScore) {
        document.getElementById('score').textContent = score;
        document.getElementById('highScore').textContent = highScore;
    }

    showGameOver(finalScore) {
        document.getElementById('finalScore').textContent = finalScore;
        document.getElementById('gameOver').classList.remove('hidden');
        
        // 设置重新开始按钮
        const restartBtn = document.getElementById('restartBtn');
        if (restartBtn) {
            restartBtn.onclick = () => {
                this.hideGameOver();
                this.restartGame();
            };
        }
        
        // 设置返回菜单按钮
        const backToMenuBtn = document.getElementById('backToMenuBtn');
        if (backToMenuBtn) {
            backToMenuBtn.onclick = () => {
                this.hideGameOver();
                this.showGameSelection();
            };
        }
    }

    hideGameOver() {
        document.getElementById('gameOver').classList.add('hidden');
    }

    restartGame() {
        if (this.currentGame) {
            this.currentGame.restart();
        }
    }
}

// 基础游戏类
class BaseGame {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;
        this.score = 0;
        this.highScore = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.gameLoop = null;
        this.loadHighScore();
    }

    loadHighScore() {
        const saved = localStorage.getItem(`${this.constructor.name}_highScore`);
        this.highScore = saved ? parseInt(saved) : 0;
    }

    saveHighScore() {
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem(`${this.constructor.name}_highScore`, this.highScore);
        }
    }

    updateScore(points) {
        this.score += points;
        gameCollection.updateScore(this.score, this.highScore);
    }

    start() {
        if (!this.isRunning && !this.isPaused) {
            this.isRunning = true;
            this.startGameLoop();
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
        } else if (this.isPaused) {
            this.resume();
        }
    }

    pause() {
        if (this.isRunning && !this.isPaused) {
            this.isPaused = true;
            if (this.gameLoop) {
                clearInterval(this.gameLoop);
            }
            document.getElementById('startBtn').disabled = false;
            document.getElementById('pauseBtn').disabled = true;
        }
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.startGameLoop();
            document.getElementById('startBtn').disabled = true;
            document.getElementById('pauseBtn').disabled = false;
        }
    }

    reset() {
        this.stop();
        this.score = 0;
        gameCollection.updateScore(this.score, this.highScore);
        gameCollection.hideGameOver();
        this.init();
    }

    restart() {
        this.reset();
        this.start();
    }

    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }

    gameOver() {
        this.stop();
        this.saveHighScore();
        gameCollection.showGameOver(this.score);
    }

    restart() {
        this.reset();
        this.start();
    }

    // 子类需要实现的方法
    init() { throw new Error('init method must be implemented'); }
    startGameLoop() { throw new Error('startGameLoop method must be implemented'); }
    update() { throw new Error('update method must be implemented'); }
    draw() { throw new Error('draw method must be implemented'); }
}

// 贪吃蛇游戏
class SnakeGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.gridSize = 20;
        this.snake = [];
        this.food = {};
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
    }

    init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.snake = [{ x: 200, y: 200 }];
        this.direction = { x: 0, y: 0 };
        this.nextDirection = { x: 0, y: 0 };
        this.generateFood();
        this.draw();
    }

    generateFood() {
        this.food = {
            x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)) * this.gridSize,
            y: Math.floor(Math.random() * (this.canvas.height / this.gridSize)) * this.gridSize
        };

        // 确保食物不在蛇身上
        for (let segment of this.snake) {
            if (segment.x === this.food.x && segment.y === this.food.y) {
                this.generateFood();
                return;
            }
        }
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 200);
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // 更新方向
        this.direction = { ...this.nextDirection };

        if (this.direction.x === 0 && this.direction.y === 0) return;

        // 移动蛇头
        const head = { ...this.snake[0] };
        head.x += this.direction.x * this.gridSize;
        head.y += this.direction.y * this.gridSize;

        // 检查碰撞
        if (head.x < 0 || head.x >= this.canvas.width || 
            head.y < 0 || head.y >= this.canvas.height) {
            this.gameOver();
            return;
        }

        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }

        this.snake.unshift(head);

        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            this.updateScore(10);
            this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制蛇
        this.ctx.fillStyle = '#48bb78';
        for (let segment of this.snake) {
            this.ctx.fillRect(segment.x, segment.y, this.gridSize - 2, this.gridSize - 2);
        }

        // 绘制食物
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.fillRect(this.food.x, this.food.y, this.gridSize - 2, this.gridSize - 2);
    }

    handleInput(direction) {
        switch (direction) {
            case 'up':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: -1 };
                break;
            case 'down':
                if (this.direction.y === 0) this.nextDirection = { x: 0, y: 1 };
                break;
            case 'left':
                if (this.direction.x === 0) this.nextDirection = { x: -1, y: 0 };
                break;
            case 'right':
                if (this.direction.x === 0) this.nextDirection = { x: 1, y: 0 };
                break;
        }
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.handleInput('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.handleInput('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.handleInput('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.handleInput('right');
                break;
        }
    }
}

// 俄罗斯方块游戏
class TetrisGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.gridWidth = 10;
        this.gridHeight = 20;
        this.cellSize = 20;
        this.grid = [];
        this.currentPiece = null;
        this.nextPiece = null;
        this.dropSpeed = 500; // 初始下降速度（毫秒）
        this.minDropSpeed = 100; // 最小下降速度
        this.linesCleared = 0; // 已清除的行数
        this.pieces = [
            { shape: [[1,1,1,1]], color: '#00f0f0' }, // I
            { shape: [[1,1],[1,1]], color: '#f0f000' }, // O
            { shape: [[0,1,0],[1,1,1]], color: '#a000f0' }, // T
            { shape: [[0,1,1],[1,1,0]], color: '#00f000' }, // S
            { shape: [[1,1,0],[0,1,1]], color: '#f00000' }, // Z
            { shape: [[1,0,0],[1,1,1]], color: '#f0a000' }, // J
            { shape: [[0,0,1],[1,1,1]], color: '#0000f0' }  // L
        ];
    }

    init() {
        this.canvas.width = this.gridWidth * this.cellSize; // 移除额外宽度
        this.canvas.height = this.gridHeight * this.cellSize;
        this.grid = Array(this.gridHeight).fill().map(() => Array(this.gridWidth).fill(0));
        this.currentPiece = this.createPiece();
        this.nextPiece = this.createPiece();
        this.dropSpeed = 500;
        this.linesCleared = 0;
        
        // 显示俄罗斯方块信息区域
        const tetrisInfo = document.getElementById('tetrisInfo');
        if (tetrisInfo) {
            tetrisInfo.classList.remove('hidden');
        }
        
        // 初始化预览canvas
        this.previewCanvas = document.getElementById('previewCanvas');
        this.previewCtx = this.previewCanvas ? this.previewCanvas.getContext('2d') : null;
        
        this.draw();
        this.updateGameInfo();
    }

    createPiece() {
        const piece = this.pieces[Math.floor(Math.random() * this.pieces.length)];
        return {
            shape: piece.shape,
            color: piece.color,
            x: Math.floor(this.gridWidth / 2) - Math.floor(piece.shape[0].length / 2),
            y: 0
        };
    }

    startGameLoop() {
        this.updateGameLoop();
    }

    updateGameLoop() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, this.dropSpeed);
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        if (this.canMove(this.currentPiece, 0, 1)) {
            this.currentPiece.y++;
        } else {
            this.placePiece();
            this.clearLines();
            this.currentPiece = this.nextPiece;
            this.nextPiece = this.createPiece();
            
            if (!this.canMove(this.currentPiece, 0, 0)) {
                this.gameOver();
            }
        }
    }

    canMove(piece, dx, dy) {
        for (let y = 0; y < piece.shape.length; y++) {
            for (let x = 0; x < piece.shape[y].length; x++) {
                if (piece.shape[y][x]) {
                    const newX = piece.x + x + dx;
                    const newY = piece.y + y + dy;
                    
                    if (newX < 0 || newX >= this.gridWidth || 
                        newY >= this.gridHeight || 
                        (newY >= 0 && this.grid[newY][newX])) {
                        return false;
                    }
                }
            }
        }
        return true;
    }

    placePiece() {
        for (let y = 0; y < this.currentPiece.shape.length; y++) {
            for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                if (this.currentPiece.shape[y][x]) {
                    const gridY = this.currentPiece.y + y;
                    const gridX = this.currentPiece.x + x;
                    if (gridY >= 0) {
                        this.grid[gridY][gridX] = this.currentPiece.color;
                    }
                }
            }
        }
    }

    clearLines() {
        let linesCleared = 0;
        for (let y = this.gridHeight - 1; y >= 0; y--) {
            if (this.grid[y].every(cell => cell !== 0)) {
                this.grid.splice(y, 1);
                this.grid.unshift(Array(this.gridWidth).fill(0));
                linesCleared++;
                y++; // 重新检查这一行
            }
        }
        if (linesCleared > 0) {
            this.linesCleared += linesCleared;
            this.updateScore(linesCleared * 100);
            
            // 每次得分速度加快10%
            const newSpeed = Math.max(this.minDropSpeed, this.dropSpeed * 0.9);
            if (newSpeed !== this.dropSpeed) {
                this.dropSpeed = newSpeed;
                this.updateGameLoop(); // 更新游戏循环速度
            }
        }
    }

    rotatePiece() {
        const rotated = this.currentPiece.shape[0].map((_, i) => 
            this.currentPiece.shape.map(row => row[i]).reverse()
        );
        
        const originalShape = this.currentPiece.shape;
        this.currentPiece.shape = rotated;
        
        if (!this.canMove(this.currentPiece, 0, 0)) {
            this.currentPiece.shape = originalShape;
        }
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        for (let y = 0; y < this.gridHeight; y++) {
            for (let x = 0; x < this.gridWidth; x++) {
                if (this.grid[y][x]) {
                    this.ctx.fillStyle = this.grid[y][x];
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, 
                                    this.cellSize - 1, this.cellSize - 1);
                }
            }
        }

        // 绘制当前方块
        if (this.currentPiece) {
            this.ctx.fillStyle = this.currentPiece.color;
            for (let y = 0; y < this.currentPiece.shape.length; y++) {
                for (let x = 0; x < this.currentPiece.shape[y].length; x++) {
                    if (this.currentPiece.shape[y][x]) {
                        this.ctx.fillRect(
                            (this.currentPiece.x + x) * this.cellSize,
                            (this.currentPiece.y + y) * this.cellSize,
                            this.cellSize - 1, this.cellSize - 1
                        );
                    }
                }
            }
        }

        // 更新预览和统计信息（移到HTML元素中）
        this.updateGameInfo();
    }

    handleInput(direction) {
        if (!this.currentPiece) return;
        
        switch (direction) {
            case 'left':
                if (this.canMove(this.currentPiece, -1, 0)) {
                    this.currentPiece.x--;
                }
                break;
            case 'right':
                if (this.canMove(this.currentPiece, 1, 0)) {
                    this.currentPiece.x++;
                }
                break;
            case 'down':
                if (this.canMove(this.currentPiece, 0, 1)) {
                    this.currentPiece.y++;
                }
                break;
            case 'up':
                this.rotatePiece();
                break;
        }
        this.draw();
    }

    updateGameInfo() {
        // 更新统计信息
        const linesCount = document.getElementById('linesCount');
        const speedLevel = document.getElementById('speedLevel');
        
        if (linesCount) {
            linesCount.textContent = this.linesCleared;
        }
        if (speedLevel) {
            speedLevel.textContent = Math.round((600 - this.dropSpeed) / 5);
        }
        
        // 更新预览canvas
        if (this.previewCtx && this.nextPiece) {
            this.previewCtx.clearRect(0, 0, 60, 60);
            
            // 计算居中位置
            const offsetX = (60 - this.nextPiece.shape[0].length * 12) / 2;
            const offsetY = (60 - this.nextPiece.shape.length * 12) / 2;
            
            this.previewCtx.fillStyle = this.nextPiece.color;
            for (let y = 0; y < this.nextPiece.shape.length; y++) {
                for (let x = 0; x < this.nextPiece.shape[y].length; x++) {
                    if (this.nextPiece.shape[y][x]) {
                        this.previewCtx.fillRect(
                            offsetX + x * 12,
                            offsetY + y * 12,
                            11, 11
                        );
                    }
                }
            }
        }
    }

    stop() {
        super.stop();
        // 隐藏俄罗斯方块信息区域
        const tetrisInfo = document.getElementById('tetrisInfo');
        if (tetrisInfo) {
            tetrisInfo.classList.add('hidden');
        }
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.handleInput('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.handleInput('right');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.handleInput('down');
                break;
            case 'ArrowUp':
            case 'w':
            case 'W':
            case ' ':
                e.preventDefault();
                this.handleInput('up');
                break;
        }
    }
}

// 飞翔小鸟游戏
class FlappyBirdGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.bird = { x: 50, y: 200, velocity: 0, size: 24 };
        this.pipes = [];
        this.gravity = 0.04;  // 恢复原始重力值
        this.jumpStrength = -1.75;  // 恢复原始跳跃强度
        this.pipeWidth = 50;
        this.pipeGap = 180;  // 进一步增大管道间隙
        this.pipeSpeed = 0.8;  // 初始速度更慢
        this.baseSpeed = 0.8;  // 基础速度
        this.maxSpeed = 3.0;   // 最大速度
        this.speedIncrement = 0.01;  // 减半：从0.02降到0.01
        this.pipeSpawnRate = 0.008;  // 初始管道生成率（更稀疏）
        this.basePipeSpawnRate = 0.008;
        this.maxPipeSpawnRate = 0.025;  // 最大管道生成率
        this.spawnRateIncrement = 0.00005;  // 减半：从0.0001降到0.00005
        this.distance = 0;  // 飞行距离
    }

    init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.bird = { x: 50, y: 200, velocity: 0, size: 24 };
        this.pipes = [];
        this.distance = 0;
        
        // 添加初始障碍物
        const gapY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
        this.pipes.push({
            x: this.canvas.width - 100,
            topHeight: gapY,
            bottomY: gapY + this.pipeGap,
            passed: false
        });
        
        this.draw();
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // 更新小鸟
        this.bird.velocity += this.gravity;
        this.bird.y += this.bird.velocity;
        
        // 更新飞行距离
        this.distance += this.pipeSpeed;

        // 检查边界碰撞
        if (this.bird.y <= 0 || this.bird.y >= this.canvas.height - this.bird.size) {
            this.gameOver();
            return;
        }

        // 根据分数逐渐增加速度和管道生成率
        const speedProgress = Math.min(this.score / 50, 1); // 50分达到最大速度
        this.pipeSpeed = this.baseSpeed + (this.maxSpeed - this.baseSpeed) * speedProgress;
        this.pipeSpawnRate = this.basePipeSpawnRate + (this.maxPipeSpawnRate - this.basePipeSpawnRate) * speedProgress;

        // 生成管道（使用动态生成率）
        if (Math.random() < this.pipeSpawnRate) {
            if (this.pipes.length === 0 || this.pipes[this.pipes.length - 1].x < this.canvas.width - 150) {
                const gapY = Math.random() * (this.canvas.height - this.pipeGap - 100) + 50;
                this.pipes.push({
                    x: this.canvas.width,
                    topHeight: gapY,
                    bottomY: gapY + this.pipeGap,
                    passed: false
                });
            }
        }

        // 更新管道
        for (let i = this.pipes.length - 1; i >= 0; i--) {
            const pipe = this.pipes[i];
            pipe.x -= this.pipeSpeed;

            // 检查碰撞
            if (this.bird.x + this.bird.size > pipe.x && this.bird.x < pipe.x + this.pipeWidth) {
                if (this.bird.y < pipe.topHeight || this.bird.y + this.bird.size > pipe.bottomY) {
                    this.gameOver();
                    return;
                }
            }

            // 计分
            if (!pipe.passed && this.bird.x > pipe.x + this.pipeWidth) {
                pipe.passed = true;
                this.updateScore(1);
            }

            // 移除离开屏幕的管道
            if (pipe.x + this.pipeWidth < 0) {
                this.pipes.splice(i, 1);
            }
        }
    }

    jump() {
        this.bird.velocity = this.jumpStrength;
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#87ceeb';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制管道
        this.ctx.fillStyle = '#228b22';
        for (let pipe of this.pipes) {
            // 上管道
            this.ctx.fillRect(pipe.x, 0, this.pipeWidth, pipe.topHeight);
            // 下管道
            this.ctx.fillRect(pipe.x, pipe.bottomY, this.pipeWidth, this.canvas.height - pipe.bottomY);
        }

        // 绘制卡通小鸟
        this.drawBird(this.bird.x, this.bird.y, this.bird.size);
        
        // 显示飞行距离
        this.ctx.fillStyle = '#000000';
        this.ctx.font = '16px Arial';
        this.ctx.fillText(`距离: ${Math.floor(this.distance)}m`, 10, 30);
    }
    
    drawBird(x, y, size) {
        const ctx = this.ctx;
        
        // 小鸟身体（椭圆形）
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.ellipse(x + size/2, y + size/2, size/2, size/3, 0, 0, 2 * Math.PI);
        ctx.fill();
        
        // 小鸟头部（圆形）
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(x + size * 0.7, y + size * 0.3, size/4, 0, 2 * Math.PI);
        ctx.fill();
        
        // 小鸟眼睛
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(x + size * 0.75, y + size * 0.25, size/12, 0, 2 * Math.PI);
        ctx.fill();
        
        // 小鸟眼睛高光
        ctx.fillStyle = '#FFF';
        ctx.beginPath();
        ctx.arc(x + size * 0.77, y + size * 0.23, size/20, 0, 2 * Math.PI);
        ctx.fill();
        
        // 小鸟嘴巴
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(x + size * 0.85, y + size * 0.35);
        ctx.lineTo(x + size * 0.95, y + size * 0.3);
        ctx.lineTo(x + size * 0.85, y + size * 0.25);
        ctx.closePath();
        ctx.fill();
        
        // 小鸟翅膀
        ctx.fillStyle = '#FF8C00';
        ctx.beginPath();
        ctx.ellipse(x + size/3, y + size/2, size/4, size/6, -0.3, 0, 2 * Math.PI);
        ctx.fill();
        
        // 小鸟尾巴
        ctx.fillStyle = '#FF6347';
        ctx.beginPath();
        ctx.moveTo(x, y + size/2);
        ctx.lineTo(x - size/4, y + size/3);
        ctx.lineTo(x - size/4, y + size * 2/3);
        ctx.closePath();
        ctx.fill();
    }

    handleClick() {
        this.jump();
    }

    handleKeyPress(e) {
        if (e.key === ' ' || e.key === 'ArrowUp') {
            e.preventDefault();
            this.jump();
        }
    }
}

// 打砖块游戏
class BreakoutGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.paddle = { x: 150, y: 380, width: 100, height: 10, speed: 8, originalWidth: 100 };
        this.ball = { x: 200, y: 300, dx: 2, dy: -2, radius: 8, originalSpeed: 3 };
        this.bricks = [];
        this.brickRows = 5;
        this.brickCols = 8;
        this.brickWidth = 45;
        this.brickHeight = 20;
        this.brickPadding = 5;
        this.leftPressed = false;
        this.rightPressed = false;
        this.lives = 3;
        this.powerUps = {
            slowBall: { active: false, duration: 0 },
            longPaddle: { active: false, duration: 0 }
        };
    }

    init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.paddle = { x: 150, y: 380, width: 100, height: 10, speed: 8, originalWidth: 100 };
        this.ball = { x: 200, y: 300, dx: 3, dy: -3, radius: 8, originalSpeed: 3 };
        this.lives = 3;
        this.powerUps = {
            slowBall: { active: false, duration: 0 },
            longPaddle: { active: false, duration: 0 }
        };
        this.createBricks();
        this.draw();
    }

    createBricks() {
        this.bricks = [];
        for (let r = 0; r < this.brickRows; r++) {
            for (let c = 0; c < this.brickCols; c++) {
                // 随机生成bonus砖块（15%概率）
                const isBonus = Math.random() < 0.15;
                let bonusType = null;
                if (isBonus) {
                    const bonusTypes = ['slowBall', 'longPaddle', 'extraLife'];
                    bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
                }
                
                this.bricks.push({
                    x: c * (this.brickWidth + this.brickPadding) + this.brickPadding,
                    y: r * (this.brickHeight + this.brickPadding) + 30,
                    width: this.brickWidth,
                    height: this.brickHeight,
                    visible: true,
                    isBonus: isBonus,
                    bonusType: bonusType
                });
            }
        }
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 16);
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // 更新道具效果持续时间
        this.updatePowerUps();

        // 移动挡板
        if (this.leftPressed && this.paddle.x > 0) {
            this.paddle.x -= this.paddle.speed;
        }
        if (this.rightPressed && this.paddle.x < this.canvas.width - this.paddle.width) {
            this.paddle.x += this.paddle.speed;
        }

        // 移动球
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // 球与墙壁碰撞
        if (this.ball.x + this.ball.radius > this.canvas.width || this.ball.x - this.ball.radius < 0) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y - this.ball.radius < 0) {
            this.ball.dy = -this.ball.dy;
        }

        // 球与挡板碰撞
        if (this.ball.y + this.ball.radius > this.paddle.y &&
            this.ball.x > this.paddle.x &&
            this.ball.x < this.paddle.x + this.paddle.width) {
            this.ball.dy = -this.ball.dy;
        }

        // 球掉落
        if (this.ball.y + this.ball.radius > this.canvas.height) {
            this.loseLife();
            return;
        }

        // 球与砖块碰撞
        for (let brick of this.bricks) {
            if (brick.visible &&
                this.ball.x > brick.x &&
                this.ball.x < brick.x + brick.width &&
                this.ball.y > brick.y &&
                this.ball.y < brick.y + brick.height) {
                this.ball.dy = -this.ball.dy;
                brick.visible = false;
                
                if (brick.isBonus) {
                    this.activateBonus(brick.bonusType);
                    this.updateScore(20); // bonus砖块得分更高
                } else {
                    this.updateScore(10);
                }
            }
        }

        // 检查胜利条件
        if (this.bricks.every(brick => !brick.visible)) {
            this.gameOver();
        }
    }

    updatePowerUps() {
        // 减慢球速效果
        if (this.powerUps.slowBall.active) {
            this.powerUps.slowBall.duration--;
            if (this.powerUps.slowBall.duration <= 0) {
                this.powerUps.slowBall.active = false;
                // 恢复球的原始速度
                const speedRatio = this.ball.originalSpeed / Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
                this.ball.dx *= speedRatio;
                this.ball.dy *= speedRatio;
            }
        }

        // 加长挡板效果
        if (this.powerUps.longPaddle.active) {
            this.powerUps.longPaddle.duration--;
            if (this.powerUps.longPaddle.duration <= 0) {
                this.powerUps.longPaddle.active = false;
                this.paddle.width = this.paddle.originalWidth;
            }
        }
    }

    activateBonus(bonusType) {
        switch (bonusType) {
            case 'slowBall':
                this.powerUps.slowBall.active = true;
                this.powerUps.slowBall.duration = 300; // 5秒（60fps * 5）
                // 将球速减半
                this.ball.dx *= 0.5;
                this.ball.dy *= 0.5;
                break;
            case 'longPaddle':
                this.powerUps.longPaddle.active = true;
                this.powerUps.longPaddle.duration = 300; // 5秒
                this.paddle.width = this.paddle.originalWidth * 1.5;
                break;
            case 'extraLife':
                this.lives++;
                break;
        }
    }

    loseLife() {
        this.lives--;
        if (this.lives <= 0) {
            this.gameOver();
        } else {
            // 重置球的位置
            this.ball.x = 200;
            this.ball.y = 300;
            this.ball.dx = 3;
            this.ball.dy = -3;
            // 重置挡板位置
            this.paddle.x = 150;
        }
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制砖块
        for (let brick of this.bricks) {
            if (brick.visible) {
                if (brick.isBonus) {
                    // bonus砖块用不同颜色显示
                    switch (brick.bonusType) {
                        case 'slowBall':
                            this.ctx.fillStyle = '#3182ce'; // 蓝色
                            break;
                        case 'longPaddle':
                            this.ctx.fillStyle = '#38a169'; // 绿色
                            break;
                        case 'extraLife':
                            this.ctx.fillStyle = '#d69e2e'; // 金色
                            break;
                    }
                } else {
                    this.ctx.fillStyle = '#e53e3e'; // 普通砖块红色
                }
                this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
                
                // 为bonus砖块添加标识
                if (brick.isBonus) {
                    this.ctx.fillStyle = '#ffffff';
                    this.ctx.font = '12px Arial';
                    this.ctx.textAlign = 'center';
                    let symbol = '';
                    switch (brick.bonusType) {
                        case 'slowBall': symbol = 'S'; break;
                        case 'longPaddle': symbol = 'L'; break;
                        case 'extraLife': symbol = '+'; break;
                    }
                    this.ctx.fillText(symbol, brick.x + brick.width/2, brick.y + brick.height/2 + 4);
                }
            }
        }

        // 绘制挡板
        this.ctx.fillStyle = this.powerUps.longPaddle.active ? '#68d391' : '#48bb78';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // 绘制球
        this.ctx.fillStyle = this.powerUps.slowBall.active ? '#63b3ed' : '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // 绘制生命数
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`生命: ${this.lives}`, 10, 25);

        // 绘制道具状态
        let statusY = 45;
        if (this.powerUps.slowBall.active) {
            this.ctx.fillStyle = '#63b3ed';
            this.ctx.fillText(`慢速球: ${Math.ceil(this.powerUps.slowBall.duration / 60)}s`, 10, statusY);
            statusY += 20;
        }
        if (this.powerUps.longPaddle.active) {
            this.ctx.fillStyle = '#68d391';
            this.ctx.fillText(`长挡板: ${Math.ceil(this.powerUps.longPaddle.duration / 60)}s`, 10, statusY);
        }
    }

    handleInput(direction) {
        switch (direction) {
            case 'left':
                this.leftPressed = true;
                setTimeout(() => this.leftPressed = false, 100);
                break;
            case 'right':
                this.rightPressed = true;
                setTimeout(() => this.rightPressed = false, 100);
                break;
        }
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.handleInput('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.handleInput('right');
                break;
        }
    }
    
    handleClick(x, y) {
        // 点击控制挡板移动
        if (!this.isRunning) return;
        
        const paddleCenter = this.paddle.x + this.paddle.width / 2;
        if (x < paddleCenter) {
            this.handleInput('left');
        } else {
            this.handleInput('right');
        }
    }
}

// 坦克大战游戏
class TankGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.playerTank = { x: 200, y: 350, width: 30, height: 30, direction: 0 };
        this.enemyTanks = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.walls = [];
    }

    init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.playerTank = { x: 200, y: 350, width: 30, height: 30, direction: 0 };
        this.enemyTanks = [];
        this.bullets = [];
        this.enemyBullets = [];
        this.walls = this.generateWalls();
        this.spawnEnemyTank();
        this.draw();
    }

    generateWalls() {
        const walls = [];
        // 生成一些随机墙壁
        for (let i = 0; i < 15; i++) {
            const isBreakable = Math.random() < 0.5; // 50%概率生成可破坏墙壁
            walls.push({
                x: Math.random() * (this.canvas.width - 40),
                y: Math.random() * (this.canvas.height - 100) + 50,
                width: 20,
                height: 20,
                isBreakable: isBreakable,
                hits: 0, // 被击中次数
                maxHits: 3 // 需要3次击中才能破坏
            });
        }
        return walls;
    }

    spawnEnemyTank() {
        if (this.enemyTanks.length < 3) {
            this.enemyTanks.push({
                x: Math.random() * (this.canvas.width - 30),
                y: 50,
                width: 30,
                height: 30,
                direction: Math.floor(Math.random() * 4),
                lastShot: 0
            });
        }
    }

    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 50);
    }

    update() {
        if (!this.isRunning || this.isPaused) return;

        // 更新子弹
        this.updateBullets();
        this.updateEnemyTanks();
        this.checkCollisions();

        // 定期生成敌方坦克
        if (Math.random() < 0.01) {
            this.spawnEnemyTank();
        }
    }

    updateBullets() {
        // 更新玩家子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= 5;
            
            // 检查子弹与墙壁碰撞
            for (let i = 0; i < this.walls.length; i++) {
                const wall = this.walls[i];
                if (bullet.x < wall.x + wall.width &&
                    bullet.x + bullet.width > wall.x &&
                    bullet.y < wall.y + wall.height &&
                    bullet.y + bullet.height > wall.y) {
                    
                    if (wall.isBreakable) {
                        wall.hits++;
                        if (wall.hits >= wall.maxHits) {
                            this.walls.splice(i, 1); // 移除被破坏的墙壁
                        }
                    }
                    return false; // 移除子弹
                }
            }
            
            return bullet.y > 0;
        });

        // 更新敌方子弹
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.y += 3;
            
            // 检查敌方子弹与墙壁碰撞
            for (let wall of this.walls) {
                if (bullet.x < wall.x + wall.width &&
                    bullet.x + bullet.width > wall.x &&
                    bullet.y < wall.y + wall.height &&
                    bullet.y + bullet.height > wall.y) {
                    return false; // 移除子弹
                }
            }
            
            return bullet.y < this.canvas.height;
        });
    }

    updateEnemyTanks() {
        this.enemyTanks.forEach(tank => {
            // 简单AI移动
            if (Math.random() < 0.1) {
                tank.direction = Math.floor(Math.random() * 4);
            }

            const speed = 1;
            switch(tank.direction) {
                case 0: tank.y -= speed; break;
                case 1: tank.x += speed; break;
                case 2: tank.y += speed; break;
                case 3: tank.x -= speed; break;
            }

            // 边界检测
            tank.x = Math.max(0, Math.min(this.canvas.width - tank.width, tank.x));
            tank.y = Math.max(0, Math.min(this.canvas.height - tank.height, tank.y));

            // 敌方坦克射击
            if (Math.random() < 0.02) {
                this.enemyBullets.push({
                    x: tank.x + tank.width / 2,
                    y: tank.y + tank.height,
                    width: 4,
                    height: 8
                });
            }
        });
    }

    checkCollisions() {
        // 检查玩家子弹击中敌方坦克
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemyTanks.forEach((tank, tankIndex) => {
                if (bullet.x < tank.x + tank.width &&
                    bullet.x + bullet.width > tank.x &&
                    bullet.y < tank.y + tank.height &&
                    bullet.y + bullet.height > tank.y) {
                    this.bullets.splice(bulletIndex, 1);
                    this.enemyTanks.splice(tankIndex, 1);
                    this.updateScore(100);
                }
            });
        });

        // 检查敌方子弹击中玩家
        this.enemyBullets.forEach(bullet => {
            if (bullet.x < this.playerTank.x + this.playerTank.width &&
                bullet.x + bullet.width > this.playerTank.x &&
                bullet.y < this.playerTank.y + this.playerTank.height &&
                bullet.y + bullet.height > this.playerTank.y) {
                this.gameOver();
            }
        });
    }

    shoot() {
        this.bullets.push({
            x: this.playerTank.x + this.playerTank.width / 2 - 2,
            y: this.playerTank.y,
            width: 4,
            height: 8
        });
    }

    drawTank(x, y, width, height, color, direction = 0) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        
        this.ctx.save();
        this.ctx.translate(centerX, centerY);
        this.ctx.rotate(direction * Math.PI / 2);
        
        // 绘制坦克主体
        this.ctx.fillStyle = color;
        this.ctx.fillRect(-width/2, -height/2, width, height);
        
        // 绘制坦克履带
        this.ctx.fillStyle = color === '#00ff00' ? '#00cc00' : '#cc0000';
        this.ctx.fillRect(-width/2 - 2, -height/2, 4, height);
        this.ctx.fillRect(width/2 - 2, -height/2, 4, height);
        
        // 绘制炮塔
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(0, 0, width/3, 0, Math.PI * 2);
        this.ctx.fill();
        
        // 绘制炮管
        this.ctx.fillStyle = color === '#00ff00' ? '#006600' : '#660000';
        this.ctx.fillRect(-2, -height/2 - 8, 4, 12);
        
        this.ctx.restore();
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制墙壁
        this.walls.forEach(wall => {
            if (wall.isBreakable) {
                // 可破坏墙壁 - 使用条纹效果
                const alpha = 1 - (wall.hits / wall.maxHits) * 0.6;
                this.ctx.fillStyle = `rgba(139, 69, 19, ${alpha})`; // 棕色背景
                this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
                
                // 添加条纹效果
                this.ctx.strokeStyle = `rgba(101, 67, 33, ${alpha})`; // 深棕色条纹
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                for (let i = 0; i < wall.width; i += 4) {
                    this.ctx.moveTo(wall.x + i, wall.y);
                    this.ctx.lineTo(wall.x + i, wall.y + wall.height);
                }
                this.ctx.stroke();
                
                // 添加裂纹效果
                if (wall.hits > 0) {
                    this.ctx.strokeStyle = '#000000';
                    this.ctx.lineWidth = 1;
                    this.ctx.beginPath();
                    for (let i = 0; i < wall.hits; i++) {
                        this.ctx.moveTo(wall.x + Math.random() * wall.width, wall.y);
                        this.ctx.lineTo(wall.x + Math.random() * wall.width, wall.y + wall.height);
                    }
                    this.ctx.stroke();
                }
            } else {
                // 普通墙壁 - 实心填充
                this.ctx.fillStyle = '#8B4513';
                this.ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
            }
        });

        // 绘制玩家坦克
        this.drawTank(this.playerTank.x, this.playerTank.y, this.playerTank.width, this.playerTank.height, '#00ff00', this.playerTank.direction);

        // 绘制敌方坦克
        this.enemyTanks.forEach(tank => {
            this.drawTank(tank.x, tank.y, tank.width, tank.height, '#ff0000', tank.direction);
        });

        // 绘制子弹
        this.ctx.fillStyle = '#ffff00';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        this.ctx.fillStyle = '#ff6600';
        this.enemyBullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    handleInput(direction) {
        const speed = 3;
        switch (direction) {
            case 'up':
                this.playerTank.y = Math.max(0, this.playerTank.y - speed);
                break;
            case 'down':
                this.playerTank.y = Math.min(this.canvas.height - this.playerTank.height, this.playerTank.y + speed);
                break;
            case 'left':
                this.playerTank.x = Math.max(0, this.playerTank.x - speed);
                break;
            case 'right':
                this.playerTank.x = Math.min(this.canvas.width - this.playerTank.width, this.playerTank.x + speed);
                break;
            case 'fire':
                this.shoot();
                break;
        }
        // 保持炮口向上
        this.playerTank.direction = 0;
        this.draw();
    }

    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                e.preventDefault();
                this.handleInput('up');
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                e.preventDefault();
                this.handleInput('down');
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.handleInput('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.handleInput('right');
                break;
            case ' ':
                e.preventDefault();
                this.shoot();
                break;
        }
    }
}

// 五子棋游戏
class GomokuGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.gridSize = 15;
        this.cellSize = 25;
        this.board = [];
        this.currentPlayer = 1; // 1为玩家，2为AI
        this.gameEnded = false;
    }

    init() {
        this.canvas.width = this.gridSize * this.cellSize;
        this.canvas.height = this.gridSize * this.cellSize;
        this.board = Array(this.gridSize).fill().map(() => Array(this.gridSize).fill(0));
        this.currentPlayer = 1;
        this.gameEnded = false;
        this.draw();
    }

    startGameLoop() {
        // 五子棋不需要持续的游戏循环，只在点击时更新
        this.isRunning = true;
    }

    update() {
        // 五子棋的更新逻辑在点击事件中处理
    }

    checkWin(row, col, player) {
        const directions = [
            [0, 1], [1, 0], [1, 1], [1, -1]
        ];

        for (let [dx, dy] of directions) {
            let count = 1;
            
            // 检查正方向
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (newRow >= 0 && newRow < this.gridSize && 
                    newCol >= 0 && newCol < this.gridSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 检查反方向
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (newRow >= 0 && newRow < this.gridSize && 
                    newCol >= 0 && newCol < this.gridSize && 
                    this.board[newRow][newCol] === player) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) {
                return true;
            }
        }
        return false;
    }

    makeAIMove() {
        // 专业级AI：使用Minimax算法和Alpha-Beta剪枝
        let bestMove = this.findBestMoveAdvanced();
        
        if (bestMove) {
            const [row, col] = bestMove;
            this.board[row][col] = 2;
            
            if (this.checkWin(row, col, 2)) {
                this.gameEnded = true;
                setTimeout(() => {
                    alert('AI获胜！');
                    this.gameOver();
                }, 100);
            } else {
                this.currentPlayer = 1;
            }
            this.draw();
        }
    }
    
    findBestMoveAdvanced() {
        // 检查开局阶段
        const moveCount = this.getMoveCount();
        if (moveCount <= 4) {
            const openingMove = this.getOpeningMove(moveCount);
            if (openingMove) return openingMove;
        }
        
        // 紧急情况检查（必胜或必防）
        const urgentMove = this.checkUrgentMoves();
        if (urgentMove) return urgentMove;
        
        // 获取候选位置（减少搜索空间）
        const candidates = this.getCandidatePositions();
        
        if (candidates.length === 0) {
            // 如果没有候选位置，选择中心点
            const center = Math.floor(this.gridSize / 2);
            return [center, center];
        }
        
        // 优化搜索深度，避免计算量过大
        let depth = moveCount < 6 ? 3 : moveCount < 15 ? 4 : moveCount < 25 ? 3 : 2;
        
        let bestMove = null;
        let bestScore = -Infinity;
        
        // 添加超时机制
        const startTime = Date.now();
        const maxTime = 2000; // 最大计算时间2秒
        
        // 使用Minimax算法搜索最佳位置
        for (let i = 0; i < candidates.length; i++) {
            const [row, col] = candidates[i];
            
            // 检查是否超时
            if (Date.now() - startTime > maxTime) {
                console.log('AI计算超时，使用当前最佳结果');
                break;
            }
            
            this.board[row][col] = 2;
            let score = this.minimax(depth, false, -Infinity, Infinity, startTime, maxTime);
            this.board[row][col] = 0;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = [row, col];
            }
        }
        
        return bestMove || candidates[0]; // 确保总是返回一个有效位置
    }
    
    // 获取当前棋盘上的棋子数量
    getMoveCount() {
        let count = 0;
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] !== 0) count++;
            }
        }
        return count;
    }
    
    // 开局策略
    getOpeningMove(moveCount) {
        const center = Math.floor(this.gridSize / 2);
        
        if (moveCount === 0) {
            // 第一手下中心
            return [center, center];
        }
        
        if (moveCount === 1) {
            // 如果玩家下了中心，AI下邻近位置
            if (this.board[center][center] === 1) {
                const openings = [
                    [center-1, center-1], [center-1, center+1],
                    [center+1, center-1], [center+1, center+1]
                ];
                return openings[Math.floor(Math.random() * openings.length)];
            } else {
                // 否则下中心
                return [center, center];
            }
        }
        
        if (moveCount === 2) {
            // 寻找形成斜线或直线的机会
            for (let row = 0; row < this.gridSize; row++) {
                for (let col = 0; col < this.gridSize; col++) {
                    if (this.board[row][col] === 2) {
                        const directions = [[1,1], [1,0], [0,1], [1,-1]];
                        for (let [dx, dy] of directions) {
                            const newRow = row + dx;
                            const newCol = col + dy;
                            if (newRow >= 0 && newRow < this.gridSize &&
                                newCol >= 0 && newCol < this.gridSize &&
                                this.board[newRow][newCol] === 0) {
                                return [newRow, newCol];
                            }
                        }
                    }
                }
            }
        }
        
        return null;
    }
    
    // 检查紧急情况（必胜或必防）
    checkUrgentMoves() {
        // 1. 检查AI是否能立即获胜
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 0) {
                    this.board[row][col] = 2;
                    if (this.checkWin(row, col, 2)) {
                        this.board[row][col] = 0;
                        return [row, col];
                    }
                    this.board[row][col] = 0;
                }
            }
        }
        
        // 2. 检查是否需要阻止玩家获胜
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 0) {
                    this.board[row][col] = 1;
                    if (this.checkWin(row, col, 1)) {
                        this.board[row][col] = 0;
                        return [row, col];
                    }
                    this.board[row][col] = 0;
                }
            }
        }
        
        // 3. 检查活四威胁
        const activeFourMoves = this.findActiveFourMoves();
        if (activeFourMoves.length > 0) {
            return activeFourMoves[0];
        }
        
        return null;
    }
    
    // 寻找活四位置
    findActiveFourMoves() {
        const moves = [];
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 0) {
                    // 检查AI的活四
                    this.board[row][col] = 2;
                    let threats = this.countThreats(row, col, 2);
                    if (threats.activeFour > 0) {
                        moves.push([row, col]);
                    }
                    
                    // 检查需要阻止的玩家活四
                    this.board[row][col] = 1;
                    threats = this.countThreats(row, col, 1);
                    if (threats.activeFour > 0) {
                        moves.unshift([row, col]); // 防守优先
                    }
                    
                    this.board[row][col] = 0;
                }
            }
        }
        
        return moves;
    }
    
    // Minimax算法实现（带Alpha-Beta剪枝）
    minimax(depth, isMaximizing, alpha, beta, startTime = null, maxTime = null) {
        // 检查超时
        if (startTime && maxTime && Date.now() - startTime > maxTime) {
            return this.evaluateBoardAdvanced(); // 超时时返回当前评估
        }
        
        // 检查游戏结束状态
        const gameState = this.evaluateGameState();
        if (gameState !== null) {
            return gameState;
        }
        
        if (depth === 0) {
            return this.evaluateBoardAdvanced();
        }
        
        const candidates = this.getCandidatePositions();
        
        if (isMaximizing) {
            let maxEval = -Infinity;
            for (let [row, col] of candidates) {
                // 再次检查超时
                if (startTime && maxTime && Date.now() - startTime > maxTime) {
                    break;
                }
                
                this.board[row][col] = 2;
                let evaluation = this.minimax(depth - 1, false, alpha, beta, startTime, maxTime);
                this.board[row][col] = 0;
                maxEval = Math.max(maxEval, evaluation);
                alpha = Math.max(alpha, evaluation);
                if (beta <= alpha) break; // Alpha-Beta剪枝
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let [row, col] of candidates) {
                // 再次检查超时
                if (startTime && maxTime && Date.now() - startTime > maxTime) {
                    break;
                }
                
                this.board[row][col] = 1;
                let evaluation = this.minimax(depth - 1, true, alpha, beta, startTime, maxTime);
                this.board[row][col] = 0;
                minEval = Math.min(minEval, evaluation);
                beta = Math.min(beta, evaluation);
                if (beta <= alpha) break; // Alpha-Beta剪枝
            }
            return minEval;
        }
    }
    
    // 获取候选位置（减少搜索空间）
    getCandidatePositions() {
        const candidates = new Map(); // 使用Map存储位置和其评估分数
        
        // 如果棋盘为空，返回中心位置
        if (this.getMoveCount() === 0) {
            const center = Math.floor(this.gridSize / 2);
            return [[center, center]];
        }
        
        // 根据棋子数量调整搜索范围
        const moveCount = this.getMoveCount();
        const searchRange = moveCount < 10 ? 2 : 1; // 早期搜索范围大，后期缩小
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] !== 0) {
                    // 在已有棋子周围搜索空位
                    for (let dr = -searchRange; dr <= searchRange; dr++) {
                        for (let dc = -searchRange; dc <= searchRange; dc++) {
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (newRow >= 0 && newRow < this.gridSize && 
                                newCol >= 0 && newCol < this.gridSize && 
                                this.board[newRow][newCol] === 0) {
                                const key = `${newRow},${newCol}`;
                                if (!candidates.has(key)) {
                                    // 计算该位置的初步评估分数
                                    const score = this.evaluatePositionQuick(newRow, newCol);
                                    candidates.set(key, { pos: [newRow, newCol], score });
                                }
                            }
                        }
                    }
                }
            }
        }
        
        // 根据棋局阶段调整候选位置数量
        const maxCandidates = moveCount < 6 ? 15 : moveCount < 15 ? 12 : 8;
        
        // 按分数排序，优先考虑高分位置（提高Alpha-Beta剪枝效率）
        const sortedCandidates = Array.from(candidates.values())
            .sort((a, b) => b.score - a.score)
            .slice(0, maxCandidates) // 动态限制候选位置数量
            .map(item => item.pos);
        
        return sortedCandidates;
    }
    
    // 快速位置评估（用于候选位置排序）
    evaluatePositionQuick(row, col) {
        let score = 0;
        
        // 模拟AI在此位置下棋
        this.board[row][col] = 2;
        const aiThreats = this.countThreats(row, col, 2);
        score += aiThreats.activeFour * 1000 + aiThreats.activeThree * 100;
        
        // 模拟玩家在此位置下棋（防守价值）
        this.board[row][col] = 1;
        const humanThreats = this.countThreats(row, col, 1);
        score += humanThreats.activeFour * 800 + humanThreats.activeThree * 80;
        
        this.board[row][col] = 0; // 恢复
        
        // 位置价值：中心位置更有价值
        const center = Math.floor(this.gridSize / 2);
        const centerDistance = Math.abs(row - center) + Math.abs(col - center);
        score += Math.max(0, 10 - centerDistance);
        
        // 连接性：与已有棋子的距离
        let minDistance = Infinity;
        for (let r = 0; r < this.gridSize; r++) {
            for (let c = 0; c < this.gridSize; c++) {
                if (this.board[r][c] !== 0) {
                    const distance = Math.abs(row - r) + Math.abs(col - c);
                    minDistance = Math.min(minDistance, distance);
                }
            }
        }
        if (minDistance !== Infinity) {
            score += Math.max(0, 5 - minDistance);
        }
        
        return score;
    }
    
    // 评估游戏状态（胜负判断）
    evaluateGameState() {
        // 检查AI是否获胜
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 2 && this.checkWin(row, col, 2)) {
                    return 100000; // AI获胜
                }
                if (this.board[row][col] === 1 && this.checkWin(row, col, 1)) {
                    return -100000; // 玩家获胜
                }
            }
        }
        return null; // 游戏未结束
    }
    
    // 高级棋盘评估函数
    evaluateBoardAdvanced() {
        let aiScore = this.evaluatePlayerAdvanced(2);
        let humanScore = this.evaluatePlayerAdvanced(1);
        return aiScore - humanScore;
    }
    
    // 高级玩家评估函数
    evaluatePlayerAdvanced(player) {
        let totalScore = 0;
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === player) {
                    for (let [dx, dy] of directions) {
                        totalScore += this.evaluateDirection(row, col, dx, dy, player);
                    }
                }
            }
        }
        
        // 添加威胁检测分数
        totalScore += this.evaluateThreats(player);
        
        return totalScore;
    }
    
    // 评估特定方向的分数
    evaluateDirection(row, col, dx, dy, player) {
        let score = 0;
        let consecutive = 1;
        let openEnds = 0;
        let blocked = 0;
        
        // 检查正方向
        let i = 1;
        while (i < 5) {
            const newRow = row + dx * i;
            const newCol = col + dy * i;
            
            if (newRow < 0 || newRow >= this.gridSize || 
                newCol < 0 || newCol >= this.gridSize) {
                blocked++;
                break;
            }
            
            if (this.board[newRow][newCol] === player) {
                consecutive++;
            } else if (this.board[newRow][newCol] === 0) {
                openEnds++;
                break;
            } else {
                blocked++;
                break;
            }
            i++;
        }
        
        // 检查反方向
        i = 1;
        while (i < 5) {
            const newRow = row - dx * i;
            const newCol = col - dy * i;
            
            if (newRow < 0 || newRow >= this.gridSize || 
                newCol < 0 || newCol >= this.gridSize) {
                blocked++;
                break;
            }
            
            if (this.board[newRow][newCol] === player) {
                consecutive++;
            } else if (this.board[newRow][newCol] === 0) {
                openEnds++;
                break;
            } else {
                blocked++;
                break;
            }
            i++;
        }
        
        // 根据连子数、开放端数和阻挡情况计算分数
        if (consecutive >= 5) {
            score = 50000; // 五连
        } else if (consecutive === 4) {
            if (openEnds === 2) score = 10000; // 活四
            else if (openEnds === 1) score = 1000; // 冲四
        } else if (consecutive === 3) {
            if (openEnds === 2) score = 1000; // 活三
            else if (openEnds === 1) score = 100; // 眠三
        } else if (consecutive === 2) {
            if (openEnds === 2) score = 100; // 活二
            else if (openEnds === 1) score = 10; // 眠二
        } else if (consecutive === 1) {
            if (openEnds === 2) score = 10; // 活一
            else if (openEnds === 1) score = 1; // 眠一
        }
        
        return score;
    }
    
    // 威胁检测和评估
    evaluateThreats(player) {
        let threatScore = 0;
        const opponent = player === 1 ? 2 : 1;
        
        // 检测双活三、活四等威胁
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] === 0) {
                    // 模拟在此位置下棋
                    this.board[row][col] = player;
                    
                    let threats = this.countThreats(row, col, player);
                    if (threats.activeFour >= 1) threatScore += 5000;
                    if (threats.activeThree >= 2) threatScore += 2000;
                    if (threats.activeThree >= 1) threatScore += 500;
                    
                    // 检查是否能阻止对手威胁
                    this.board[row][col] = opponent;
                    let opponentThreats = this.countThreats(row, col, opponent);
                    if (opponentThreats.activeFour >= 1) threatScore += 3000;
                    if (opponentThreats.activeThree >= 1) threatScore += 1000;
                    
                    this.board[row][col] = 0; // 恢复
                }
            }
        }
        
        return threatScore;
    }
    
    // 计算威胁数量
    countThreats(row, col, player) {
        const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
        let activeFour = 0;
        let activeThree = 0;
        
        for (let [dx, dy] of directions) {
            let consecutive = 1;
            let openEnds = 0;
            
            // 检查正方向
            for (let i = 1; i < 5; i++) {
                const newRow = row + dx * i;
                const newCol = col + dy * i;
                if (newRow >= 0 && newRow < this.gridSize && 
                    newCol >= 0 && newCol < this.gridSize) {
                    if (this.board[newRow][newCol] === player) {
                        consecutive++;
                    } else if (this.board[newRow][newCol] === 0) {
                        openEnds++;
                        break;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            
            // 检查反方向
            for (let i = 1; i < 5; i++) {
                const newRow = row - dx * i;
                const newCol = col - dy * i;
                if (newRow >= 0 && newRow < this.gridSize && 
                    newCol >= 0 && newCol < this.gridSize) {
                    if (this.board[newRow][newCol] === player) {
                        consecutive++;
                    } else if (this.board[newRow][newCol] === 0) {
                        openEnds++;
                        break;
                    } else {
                        break;
                    }
                } else {
                    break;
                }
            }
            
            if (consecutive === 4 && openEnds === 2) activeFour++;
            if (consecutive === 3 && openEnds === 2) activeThree++;
        }
        
        return { activeFour, activeThree };
    }

    draw() {
        // 清空画布
        this.ctx.fillStyle = '#deb887';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // 绘制网格
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < this.gridSize; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.cellSize + this.cellSize / 2, this.cellSize / 2);
            this.ctx.lineTo(i * this.cellSize + this.cellSize / 2, this.canvas.height - this.cellSize / 2);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.lineTo(this.canvas.width - this.cellSize / 2, i * this.cellSize + this.cellSize / 2);
            this.ctx.stroke();
        }

        // 绘制棋子
        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                if (this.board[row][col] !== 0) {
                    this.ctx.beginPath();
                    this.ctx.arc(
                        col * this.cellSize + this.cellSize / 2,
                        row * this.cellSize + this.cellSize / 2,
                        this.cellSize / 3,
                        0,
                        Math.PI * 2
                    );
                    this.ctx.fillStyle = this.board[row][col] === 1 ? '#000' : '#fff';
                    this.ctx.fill();
                    this.ctx.strokeStyle = '#000';
                    this.ctx.stroke();
                }
            }
        }
    }

    handleClick(x, y) {
        if (!this.isRunning || this.gameEnded || this.currentPlayer !== 1) return;

        const col = Math.floor(x / this.cellSize);
        const row = Math.floor(y / this.cellSize);

        if (row >= 0 && row < this.gridSize && col >= 0 && col < this.gridSize && this.board[row][col] === 0) {
            this.board[row][col] = 1;
            
            if (this.checkWin(row, col, 1)) {
                this.gameEnded = true;
                this.updateScore(100);
                setTimeout(() => {
                    alert('恭喜获胜！');
                    this.gameOver();
                }, 100);
            } else {
                this.currentPlayer = 2;
                this.draw();
                setTimeout(() => this.makeAIMove(), 500);
            }
        }
    }
}

// 其他游戏的基本框架（简化实现）
class MemoryGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.totalPairs = 8;
        this.canClick = true;
    }

    init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.cards = this.generateCards();
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.canClick = true;
        this.draw();
    }

    generateCards() {
        const symbols = ['🎈', '🎯', '🎪', '🎨', '🎭', '🎸', '🎲', '🎊'];
        const cards = [];
        
        // 创建成对的卡片
        for (let i = 0; i < this.totalPairs; i++) {
            for (let j = 0; j < 2; j++) {
                cards.push({
                    symbol: symbols[i],
                    flipped: false,
                    matched: false,
                    id: i
                });
            }
        }
        
        // 打乱卡片顺序
        this.shuffleArray(cards);
        
        // 设置卡片位置
        for (let i = 0; i < 16; i++) {
            const row = Math.floor(i / 4);
            const col = i % 4;
            cards[i].x = col * 90 + 20;
            cards[i].y = row * 90 + 20;
            cards[i].width = 70;
            cards[i].height = 70;
        }
        
        return cards;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    startGameLoop() {
        this.isRunning = true;
        // 为开始页面动画启动更新循环
        if (this.gameState === 'start') {
            this.animationLoop = setInterval(() => {
                if (this.gameState === 'start') {
                    this.draw();
                } else {
                    clearInterval(this.animationLoop);
                }
            }, 50);
        }
    }

    update() {
        // 记忆翻牌游戏的更新逻辑在点击事件中处理
    }

    draw() {
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.cards.forEach(card => {
            // 绘制卡片背景
            this.ctx.fillStyle = card.matched ? '#48bb78' : (card.flipped ? '#e2e8f0' : '#4a5568');
            this.ctx.fillRect(card.x, card.y, card.width, card.height);
            
            // 绘制边框
            this.ctx.strokeStyle = '#2d3748';
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(card.x, card.y, card.width, card.height);
            
            // 绘制符号
            if (card.flipped || card.matched) {
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#2d3748';
                this.ctx.fillText(
                    card.symbol,
                    card.x + card.width / 2,
                    card.y + card.height / 2
                );
            } else {
                // 绘制问号
                this.ctx.font = '30px Arial';
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillStyle = '#e2e8f0';
                this.ctx.fillText(
                    '?',
                    card.x + card.width / 2,
                    card.y + card.height / 2
                );
            }
        });
    }

    handleClick(x, y) {
        if (!this.isRunning || !this.canClick || this.flippedCards.length >= 2) return;

        const clickedCard = this.cards.find(card => 
            x >= card.x && x <= card.x + card.width &&
            y >= card.y && y <= card.y + card.height &&
            !card.flipped && !card.matched
        );

        if (clickedCard) {
            clickedCard.flipped = true;
            this.flippedCards.push(clickedCard);
            this.draw();

            if (this.flippedCards.length === 2) {
                this.canClick = false;
                setTimeout(() => this.checkMatch(), 1000);
            }
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        
        if (card1.id === card2.id) {
            card1.matched = true;
            card2.matched = true;
            this.matchedPairs++;
            this.updateScore(10);
            
            if (this.matchedPairs === this.totalPairs) {
                setTimeout(() => {
                    this.gameOver();
                }, 500);
            }
        } else {
            card1.flipped = false;
            card2.flipped = false;
        }
        
        this.flippedCards = [];
        this.canClick = true;
        this.draw();
    }
}

class CrossyRoadGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.chicken = { x: 200, y: 350, size: 20 };
        this.cars = [];
        this.roads = [];
        this.safeZones = [];
        this.gameSpeed = 2;
        this.isWaitingToRestart = false;
        this.waitStartTime = 0;
        this.waitDuration = 1000; // 1秒等待时间
        this.crossedSuccessfully = false;
        this.level = 1; // 关卡等级
        this.baseDensity = 0.35; // 基础车辆生成密度
        this.baseSpeed = [1.2, 2.0, 2.8, 3.5, 1.5, 2.5, 3.2]; // 基础速度
    }

    init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.chicken = { x: 200, y: 350, size: 20 };
        this.cars = [];
        this.roads = this.generateRoads();
        this.safeZones = this.generateSafeZones();
        this.isWaitingToRestart = false;
        this.crossedSuccessfully = false;
        this.level = 1; // 重置关卡等级
        
        // 为每条车道生成初始车辆（至少3辆）
        this.generateInitialCars();
        
        this.draw();
    }
    
    generateRoads() {
        const roads = [];
        const roadColors = ['#333333', '#444444', '#555555', '#666666'];
        // 根据关卡等级调整速度，每关增加20%
        const speedMultiplier = 1 + (this.level - 1) * 0.2;
        
        for (let i = 1; i < 8; i++) {
            roads.push({
                y: i * 50,
                direction: i % 2 === 0 ? 1 : -1,
                speed: (this.baseSpeed[i - 1] || 2.0) * speedMultiplier,
                color: roadColors[i % roadColors.length]
            });
        }
        return roads;
    }
    
    generateInitialCars() {
        const carColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
        
        // 为每条车道生成3-5辆初始车辆，但只在道路上，不在安全区域
        this.roads.forEach(road => {
            const carY = road.y + 10;
            let isInSafeZone = false;
            
            // 检查道路是否与安全区域重叠
            for (let safeZone of this.safeZones) {
                if (carY >= safeZone.y && carY <= safeZone.y + safeZone.height) {
                    isInSafeZone = true;
                    break;
                }
            }
            
            // 只有不在安全区域的道路才生成车辆
            if (!isInSafeZone) {
                const carCount = 3 + Math.floor(Math.random() * 3); // 3-5辆车
                
                for (let i = 0; i < carCount; i++) {
                    const spacing = this.canvas.width / carCount;
                    const baseX = road.direction > 0 ? 
                        i * spacing - 100 : // 从左边开始，向右移动
                        this.canvas.width - i * spacing + 100; // 从右边开始，向左移动
                    
                    this.cars.push({
                        x: baseX + Math.random() * 50 - 25, // 添加一些随机偏移
                        y: carY,
                        width: 40,
                        height: 20,
                        speed: road.speed * road.direction,
                        color: carColors[Math.floor(Math.random() * carColors.length)]
                    });
                }
            }
        });
    }
    
    generateSafeZones() {
        return [0, 50, 150, 250, 350, 400].map(y => ({ y, height: 50 }));
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 50);
    }
    
    update() {
        if (!this.isRunning || this.isPaused) return;
        
        // 处理等待重置状态
        if (this.isWaitingToRestart) {
            if (Date.now() - this.waitStartTime >= this.waitDuration) {
                // 重置小鸡位置到起始点
                this.chicken.x = 200;
                this.chicken.y = 350;
                this.cars = []; // 清空所有车辆
                this.isWaitingToRestart = false;
                this.crossedSuccessfully = false;
            }
            return; // 等待期间不更新游戏逻辑
        }
        
        // 检查是否成功穿越到顶部
        if (this.chicken.y <= 10 && !this.crossedSuccessfully) {
            this.crossedSuccessfully = true;
            this.updateScore(10); // 成功穿越得分
            this.level++; // 增加关卡等级
            this.roads = this.generateRoads(); // 重新生成道路以应用新速度
            this.isWaitingToRestart = true;
            this.waitStartTime = Date.now();
            return;
        }
        
        // 生成汽车（根据道路的不同速度生成不同颜色的车）
        // 确保车辆只在道路上生成，不在安全区域生成
        // 根据关卡等级调整车辆密度，每关增加10%
        const currentDensity = this.baseDensity * (1 + (this.level - 1) * 0.1);
        if (Math.random() < currentDensity) {
            const road = this.roads[Math.floor(Math.random() * this.roads.length)];
            const carColors = ['#ff4444', '#44ff44', '#4444ff', '#ffff44', '#ff44ff', '#44ffff'];
            let carSpeed = road.speed;
            
            // 偶尔生成高速车辆（5%概率）
            if (Math.random() < 0.05) {
                carSpeed = road.speed * 3; // 高速车辆是正常速度的3倍
            }
            
            // 确保车辆只在黑色道路区域生成，不在绿色安全区域
            // 检查车辆Y坐标是否在道路范围内
            const carY = road.y + 10;
            let isInSafeZone = false;
            
            // 检查是否与安全区域重叠
            for (let safeZone of this.safeZones) {
                if (carY >= safeZone.y && carY <= safeZone.y + safeZone.height) {
                    isInSafeZone = true;
                    break;
                }
            }
            
            // 只有不在安全区域时才生成车辆
            if (!isInSafeZone) {
                this.cars.push({
                    x: road.direction > 0 ? -30 : this.canvas.width + 30,
                    y: carY,
                    width: 40,
                    height: 20,
                    speed: carSpeed * road.direction,
                    color: carColors[Math.floor(Math.random() * carColors.length)]
                });
            }
        }
        
        // 更新汽车位置
        this.cars = this.cars.filter(car => {
            car.x += car.speed;
            return car.x > -50 && car.x < this.canvas.width + 50;
        });
        
        // 检查碰撞
        for (let car of this.cars) {
            if (this.chicken.x < car.x + car.width &&
                this.chicken.x + this.chicken.size > car.x &&
                this.chicken.y < car.y + car.height &&
                this.chicken.y + this.chicken.size > car.y) {
                this.gameOver();
                return;
            }
        }
        
    }
    
    draw() {
        // 清空画布 - 草地背景
        this.ctx.fillStyle = '#228B22';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制道路（使用不同颜色和纹理）
        this.roads.forEach((road, index) => {
            // 道路背景
            this.ctx.fillStyle = road.color;
            this.ctx.fillRect(0, road.y, this.canvas.width, 40);
            
            // 道路中心线
            this.ctx.fillStyle = '#FFFF00';
            this.ctx.fillRect(0, road.y + 18, this.canvas.width, 4);
            
            // 道路边缘线
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillRect(0, road.y, this.canvas.width, 2);
            this.ctx.fillRect(0, road.y + 38, this.canvas.width, 2);
        });
        
        // 绘制安全区域（更明亮的绿色）
        this.ctx.fillStyle = '#32CD32';
        this.safeZones.forEach(zone => {
            this.ctx.fillRect(0, zone.y, this.canvas.width, zone.height);
            
            // 添加草地纹理
            this.ctx.fillStyle = '#228B22';
            for (let i = 0; i < this.canvas.width; i += 20) {
                for (let j = 0; j < zone.height; j += 10) {
                    if (Math.random() > 0.7) {
                        this.ctx.fillRect(i + zone.y % 10, zone.y + j, 2, 2);
                    }
                }
            }
        });
        
        // 绘制汽车（更生动的车辆设计）
        this.cars.forEach(car => {
            // 车身
            this.ctx.fillStyle = car.color;
            this.ctx.fillRect(car.x, car.y, car.width, car.height);
            
            // 车窗
            this.ctx.fillStyle = '#87CEEB';
            this.ctx.fillRect(car.x + 5, car.y + 3, car.width - 10, car.height - 6);
            
            // 车轮
            this.ctx.fillStyle = '#000000';
            this.ctx.fillRect(car.x + 3, car.y + car.height - 2, 6, 4);
            this.ctx.fillRect(car.x + car.width - 9, car.y + car.height - 2, 6, 4);
            
            // 车灯（根据方向显示）
            this.ctx.fillStyle = car.speed > 0 ? '#FFFF00' : '#FF0000';
            if (car.speed > 0) {
                this.ctx.fillRect(car.x + car.width - 2, car.y + 2, 2, 4);
                this.ctx.fillRect(car.x + car.width - 2, car.y + car.height - 6, 2, 4);
            } else {
                this.ctx.fillRect(car.x, car.y + 2, 2, 4);
                this.ctx.fillRect(car.x, car.y + car.height - 6, 2, 4);
            }
        });
        
        // 绘制小鸡（更可爱的设计）
        const chickenX = this.chicken.x;
        const chickenY = this.chicken.y;
        const size = this.chicken.size;
        
        // 小鸡身体
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(chickenX + 2, chickenY + 4, size - 4, size - 8);
        
        // 小鸡头部
        this.ctx.fillStyle = '#FFFF00';
        this.ctx.fillRect(chickenX + 4, chickenY, size - 8, size - 4);
        
        // 小鸡眼睛
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(chickenX + 6, chickenY + 2, 2, 2);
        this.ctx.fillRect(chickenX + size - 8, chickenY + 2, 2, 2);
        
        // 小鸡嘴巴
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.fillRect(chickenX + size/2 - 1, chickenY + 6, 2, 2);
        
        // 小鸡脚
        this.ctx.fillStyle = '#FF8C00';
        this.ctx.fillRect(chickenX + 4, chickenY + size - 2, 3, 2);
        this.ctx.fillRect(chickenX + size - 7, chickenY + size - 2, 3, 2);
        
        // 显示等待状态提示
        if (this.isWaitingToRestart) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.font = '24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('成功穿越！', this.canvas.width / 2, this.canvas.height / 2 - 20);
            this.ctx.fillText('准备下一轮...', this.canvas.width / 2, this.canvas.height / 2 + 20);
        }
    }
    
    handleInput(direction) {
        if (!this.isRunning) return;
        
        switch (direction) {
            case 'up':
                if (this.chicken.y > 0) {
                    this.chicken.y -= 25; // 降低移动速度，与最慢车速0.5相当
                    this.updateScore(10);
                }
                break;
            case 'down':
                if (this.chicken.y < this.canvas.height - this.chicken.size) {
                    this.chicken.y += 25; // 降低移动速度
                }
                break;
            case 'left':
                if (this.chicken.x > 0) {
                    this.chicken.x -= 12; // 降低左右移动速度
                }
                break;
            case 'right':
                if (this.chicken.x < this.canvas.width - this.chicken.size) {
                    this.chicken.x += 12; // 降低左右移动速度
                }
                break;
        }
        this.draw();
    }
    
    handleKeyPress(e) {
        switch (e.key) {
            case 'ArrowUp':
                e.preventDefault();
                this.handleInput('up');
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.handleInput('down');
                break;
            case 'ArrowLeft':
                e.preventDefault();
                this.handleInput('left');
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.handleInput('right');
                break;
        }
    }
}

class DoodleJumpGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.player = {
            x: 200,
            y: 300,
            width: 20,
            height: 20,
            velocityX: 0,
            velocityY: 0,
            onGround: false
        };
        this.platforms = [];
        this.gravity = 0.4;
        this.jumpStrength = -12;
        this.moveSpeed = 5;
        this.cameraY = 0;
        this.maxHeight = 0;
        this.platformSpacing = 80;
        this.platformWidth = 60;
        this.platformHeight = 10;
    }

    init() {
        this.canvas.width = 400;
        this.canvas.height = 600;
        this.player.x = this.canvas.width / 2 - this.player.width / 2;
        this.player.y = this.canvas.height - 100;
        this.player.velocityX = 0;
        this.player.velocityY = 0;
        this.player.onGround = false;
        this.cameraY = 0;
        this.maxHeight = 0;
        this.platforms = [];
        this.generateInitialPlatforms();
        this.draw();
    }
    
    generateInitialPlatforms() {
        // 生成初始平台
        for (let i = 0; i < 15; i++) {
            this.platforms.push({
                x: Math.random() * (this.canvas.width - this.platformWidth),
                y: this.canvas.height - 50 - i * this.platformSpacing,
                width: this.platformWidth,
                height: this.platformHeight,
                type: 'normal'
            });
        }
        
        // 添加起始平台
        this.platforms.push({
            x: this.canvas.width / 2 - this.platformWidth / 2,
            y: this.canvas.height - 30,
            width: this.platformWidth,
            height: this.platformHeight,
            type: 'normal'
        });
    }
    
    generateNewPlatforms() {
        // 当玩家上升时生成新平台
        let highestPlatform = Math.min(...this.platforms.map(p => p.y));
        const targetHeight = this.cameraY - 200;
        
        while (highestPlatform > targetHeight) {
            const newPlatformY = highestPlatform - this.platformSpacing;
            this.platforms.push({
                x: Math.random() * (this.canvas.width - this.platformWidth),
                y: newPlatformY,
                width: this.platformWidth,
                height: this.platformHeight,
                type: Math.random() < 0.1 ? 'bouncy' : 'normal'
            });
            highestPlatform = newPlatformY; // 更新最高平台位置
        }
        
        // 清理过低的平台
        this.platforms = this.platforms.filter(p => p.y < this.cameraY + this.canvas.height + 100);
    }
    
    startGameLoop() {
        this.gameLoop = setInterval(() => {
            this.update();
            this.draw();
        }, 1000 / 60);
        this.isRunning = true;
    }
    
    update() {
        if (!this.isRunning) return;
        
        // 水平移动
        this.player.x += this.player.velocityX;
        
        // 边界检查（屏幕环绕）
        if (this.player.x < -this.player.width) {
            this.player.x = this.canvas.width;
        } else if (this.player.x > this.canvas.width) {
            this.player.x = -this.player.width;
        }
        
        // 重力
        this.player.velocityY += this.gravity;
        this.player.y += this.player.velocityY;
        
        // 平台碰撞检测
        this.player.onGround = false;
        for (let platform of this.platforms) {
            if (this.player.velocityY > 0 && // 只在下降时检测
                this.player.x < platform.x + platform.width &&
                this.player.x + this.player.width > platform.x &&
                this.player.y + this.player.height > platform.y &&
                this.player.y + this.player.height < platform.y + platform.height + 10) {
                
                this.player.y = platform.y - this.player.height;
                this.player.onGround = true;
                
                if (platform.type === 'bouncy') {
                    this.player.velocityY = this.jumpStrength * 1.5;
                } else {
                    this.player.velocityY = this.jumpStrength;
                }
                
                // 计分
                const height = Math.max(0, -(this.player.y - (this.canvas.height - 100)));
                if (height > this.maxHeight) {
                    this.updateScore(Math.floor((height - this.maxHeight) / 10));
                    this.maxHeight = height;
                }
                break;
            }
        }
        
        // 相机跟随
        const targetCameraY = this.player.y - this.canvas.height * 0.7;
        if (targetCameraY < this.cameraY) {
            this.cameraY = targetCameraY;
        }
        
        // 生成新平台
        this.generateNewPlatforms();
        
        // 游戏结束检测
        if (this.player.y > this.cameraY + this.canvas.height + 100) {
            this.gameOver();
        }
        
        // 减少水平速度（摩擦力）
        this.player.velocityX *= 0.8;
    }
    
    draw() {
        // 清空画布（天空背景）
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(1, '#98FB98');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 保存上下文
        this.ctx.save();
        
        // 应用相机变换
        this.ctx.translate(0, -this.cameraY);
        
        // 绘制平台
        for (let platform of this.platforms) {
            if (platform.y > this.cameraY - 50 && platform.y < this.cameraY + this.canvas.height + 50) {
                if (platform.type === 'bouncy') {
                    this.ctx.fillStyle = '#FF6B6B';
                } else {
                    this.ctx.fillStyle = '#4ECDC4';
                }
                this.ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
                
                // 平台边框
                this.ctx.strokeStyle = '#2C3E50';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(platform.x, platform.y, platform.width, platform.height);
            }
        }
        
        // 绘制玩家
        this.ctx.fillStyle = '#FFD93D';
        this.ctx.fillRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 玩家边框
        this.ctx.strokeStyle = '#2C3E50';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(this.player.x, this.player.y, this.player.width, this.player.height);
        
        // 玩家眼睛
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.fillRect(this.player.x + 4, this.player.y + 4, 3, 3);
        this.ctx.fillRect(this.player.x + 13, this.player.y + 4, 3, 3);
        
        // 恢复上下文
        this.ctx.restore();
        
        // 绘制高度信息
        this.ctx.fillStyle = '#2C3E50';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`高度: ${Math.floor(this.maxHeight)}m`, 10, 30);
    }
    
    handleInput(direction) {
        if (!this.isRunning) return;
        
        switch (direction) {
            case 'left':
                this.player.velocityX = -this.moveSpeed;
                break;
            case 'right':
                this.player.velocityX = this.moveSpeed;
                break;
        }
    }
    
    handleKeyPress(e) {
        if (!this.isRunning) return;
        
        switch (e.key) {
            case 'ArrowLeft':
            case 'a':
            case 'A':
                e.preventDefault();
                this.handleInput('left');
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                e.preventDefault();
                this.handleInput('right');
                break;
        }
    }
    
    handleClick(x, y) {
        if (!this.isRunning) return;
        
        // 点击左半边向左移动，右半边向右移动
        if (x < this.canvas.width / 2) {
            this.handleInput('left');
        } else {
            this.handleInput('right');
        }
    }
    
    stop() {
        this.isRunning = false;
        this.isPaused = false;
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').disabled = true;
    }
}



class PokemonGame extends BaseGame {
    constructor(canvas, ctx) {
        super(canvas, ctx);
        this.currentPokemon = null;
        this.options = [];
        this.correctAnswer = 0;
        this.wrongAnswers = 0;
        this.maxWrongAnswers = 3;
        this.pokemonList = [];
        this.currentImage = null;
        this.imageLoaded = false;
        this.gameState = 'start'; // 'start', 'playing', 'gameover'
        this.startAnimationTime = 0;
        this.hidingPokemon = [];
        this.animationTimer = null;
        this.selectedAnswer = -1; // 玩家选择的答案索引
        this.showResult = false; // 是否显示答案结果
        this.loadPokemonData();
    }
    
    async loadPokemonData() {
        try {
            const response = await fetch('pokemon_names.txt');
            const text = await response.text();
            const lines = text.trim().split('\n');
            
            this.pokemonList = lines.map(line => {
                // 处理制表符或空格分隔的情况
                const parts = line.split(/\t|\s+/);
                if (parts.length >= 2) {
                    const id = parseInt(parts[0]);
                    const name = parts.slice(1).join(' ').trim();
                    return { id, name };
                }
                return null;
            }).filter(pokemon => pokemon !== null);
        } catch (error) {
            console.error('Failed to load Pokemon data:', error);
            // Fallback to a smaller list if file loading fails
            this.pokemonList = [
                { id: 1, name: 'Bulbasaur' },
                { id: 4, name: 'Charmander' },
                { id: 7, name: 'Squirtle' },
                { id: 25, name: 'Pikachu' },
                { id: 39, name: 'Jigglypuff' },
                { id: 54, name: 'Psyduck' },
                { id: 143, name: 'Snorlax' },
                { id: 133, name: 'Eevee' }
            ];
        }
    }

    async init() {
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.wrongAnswers = 0;
        this.gameState = 'start';
        this.startAnimationTime = Date.now();
        
        // 先加载Pokemon数据，然后初始化游戏
        await this.loadPokemonData();
        this.initHidingPokemon();
        this.draw();
    }
    
    initHidingPokemon() {
        // 初始化躲猫猫的Pokemon
        this.hidingPokemon = [];
        
        // 从完整的Pokemon列表中随机选择8个用于开始页面动画
        const availablePokemon = this.pokemonList.filter(p => p.id >= 1 && p.id <= 802);
        const selectedPokemon = [];
        
        // 随机选择8个不重复的Pokemon
        while (selectedPokemon.length < 8 && selectedPokemon.length < availablePokemon.length) {
            const randomPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
            if (!selectedPokemon.find(p => p.id === randomPokemon.id)) {
                selectedPokemon.push(randomPokemon);
            }
        }
        
        const pokemonIds = selectedPokemon.map(p => p.id);
        
        for (let i = 0; i < pokemonIds.length; i++) {
            this.hidingPokemon.push({
                id: pokemonIds[i],
                x: Math.random() * (this.canvas.width - 60) + 30,
                y: Math.random() * (this.canvas.height - 60) + 30,
                size: 30 + Math.random() * 20,
                hideTime: Math.random() * 3000 + 1000,
                visible: true,
                image: null
            });
            
            // 加载图片
            const img = new Image();
            img.src = `pokemon/${pokemonIds[i]}.png`;
            this.hidingPokemon[i].image = img;
        }
    }
    
    startGameLoop() {
        this.isRunning = true;
        
        // 如果是开始页面，启动动画循环
        if (this.gameState === 'start') {
            this.animationTimer = setInterval(() => {
                this.draw();
            }, 50); // 每50毫秒更新一次动画
        }
    }
    
    stop() {
        super.stop();
        // 清除动画定时器
        if (this.animationTimer) {
            clearInterval(this.animationTimer);
            this.animationTimer = null;
        }
    }
    
    generateQuestion() {
        if (this.pokemonList.length === 0) {
            // Wait for Pokemon data to load
            setTimeout(() => this.generateQuestion(), 100);
            return;
        }
        
        // 重置答案状态
        this.selectedAnswer = -1;
        this.showResult = false;
        
        // 确保从全部802个Pokemon中随机选择
        const availablePokemon = this.pokemonList.filter(p => p.id >= 1 && p.id <= 802);
        if (availablePokemon.length === 0) {
            console.error('No Pokemon available for selection');
            return;
        }
        
        // 随机选择一个Pokemon
        this.currentPokemon = availablePokemon[Math.floor(Math.random() * availablePokemon.length)];
        this.correctAnswer = Math.floor(Math.random() * 4);
        
        // 加载Pokemon图片
        this.imageLoaded = false;
        this.currentImage = new Image();
        this.currentImage.onload = () => {
            this.imageLoaded = true;
            this.draw();
        };
        this.currentImage.onerror = () => {
            console.error(`Failed to load image for Pokemon ${this.currentPokemon.id}`);
            this.imageLoaded = false;
            this.draw();
        };
        this.currentImage.src = `pokemon/${this.currentPokemon.id}.png`;
        
        // 生成四个选项
        this.options = [];
        this.options[this.correctAnswer] = this.currentPokemon.name;
        
        // 填充其他错误选项，确保没有重复
        const wrongOptions = availablePokemon.filter(p => p.name !== this.currentPokemon.name);
        const usedOptions = new Set([this.currentPokemon.name]);
        
        for (let i = 0; i < 4; i++) {
            if (i !== this.correctAnswer) {
                let randomWrong;
                do {
                    randomWrong = wrongOptions[Math.floor(Math.random() * wrongOptions.length)];
                } while (usedOptions.has(randomWrong.name));
                
                this.options[i] = randomWrong.name;
                usedOptions.add(randomWrong.name);
            }
        }
    }
    
    update() {}
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#87CEEB';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        if (this.gameState === 'start') {
            this.drawStartScreen();
        } else if (this.gameState === 'playing') {
            this.drawGameScreen();
        } else if (this.gameState === 'gameover') {
            this.drawGameOverScreen();
        }
    }
    
    drawStartScreen() {
        const currentTime = Date.now();
        const elapsed = currentTime - this.startAnimationTime;
        
        // 绘制标题
        this.ctx.fillStyle = '#FF6B6B';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Pokemon Hide & Seek!', this.canvas.width / 2, 40);
        
        // 绘制躲猫猫的Pokemon
        for (let pokemon of this.hidingPokemon) {
            const hideProgress = elapsed / pokemon.hideTime;
            
            if (hideProgress < 0.7) {
                pokemon.visible = true;
            } else if (hideProgress < 0.9) {
                pokemon.visible = Math.random() > 0.5; // 闪烁效果
            } else {
                pokemon.visible = false;
            }
            
            if (pokemon.visible && pokemon.image && pokemon.image.complete) {
                const alpha = Math.max(0, 1 - hideProgress);
                this.ctx.globalAlpha = alpha;
                
                // 添加轻微的摆动效果
                const wobble = Math.sin(elapsed * 0.005 + pokemon.x) * 2;
                
                this.ctx.drawImage(
                    pokemon.image,
                    pokemon.x + wobble,
                    pokemon.y + Math.sin(elapsed * 0.003 + pokemon.y) * 1,
                    pokemon.size,
                    pokemon.size
                );
                
                this.ctx.globalAlpha = 1;
            }
        }
        
        // 绘制开始提示
        this.ctx.fillStyle = '#333333';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Click anywhere to start the game!', this.canvas.width / 2, this.canvas.height - 60);
        
        this.ctx.fillStyle = '#666666';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('Identify Pokemon from 802 different species!', this.canvas.width / 2, this.canvas.height - 40);
        
        // 重新开始动画循环
        if (elapsed > 4000) {
            this.startAnimationTime = currentTime;
            this.initHidingPokemon();
        }
    }
    
    drawGameScreen() {
        if (!this.currentPokemon) return;
        
        // 绘制Pokemon图片或占位符
        if (this.imageLoaded && this.currentImage) {
            // 计算图片显示尺寸，保持比例
            const maxSize = 120;
            const imgWidth = this.currentImage.width;
            const imgHeight = this.currentImage.height;
            const scale = Math.min(maxSize / imgWidth, maxSize / imgHeight);
            const displayWidth = imgWidth * scale;
            const displayHeight = imgHeight * scale;
            
            // 居中显示图片
            const x = (this.canvas.width - displayWidth) / 2;
            const y = 50;
            
            this.ctx.drawImage(this.currentImage, x, y, displayWidth, displayHeight);
        } else {
            // 显示加载中或错误占位符
            this.ctx.fillStyle = '#CCCCCC';
            this.ctx.fillRect(150, 50, 100, 100);
            
            this.ctx.fillStyle = '#666666';
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.imageLoaded === false && this.currentImage ? 'Loading...' : 'Image Error', 200, 105);
        }
        
        // 绘制问题文本
        this.ctx.fillStyle = '#000000';
        this.ctx.font = 'bold 18px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Which Pokemon is this?', 200, 200);
        
        // 绘制选项按钮
        for (let i = 0; i < 4; i++) {
            const x = 25 + (i % 2) * 175;
            const y = 240 + Math.floor(i / 2) * 60;
            
            // 按钮背景颜色
            let bgColor = '#FFFFFF';
            let borderColor = '#000000';
            let textColor = '#000000';
            
            if (this.showResult) {
                if (i === this.correctAnswer) {
                    // 正确答案高亮为绿色
                    bgColor = '#90EE90';
                    borderColor = '#228B22';
                } else if (i === this.selectedAnswer && i !== this.correctAnswer) {
                    // 错误选择高亮为红色
                    bgColor = '#FFB6C1';
                    borderColor = '#DC143C';
                }
            }
            
            // 按钮背景
            this.ctx.fillStyle = bgColor;
            this.ctx.fillRect(x, y, 150, 40);
            
            // 按钮边框
            this.ctx.strokeStyle = borderColor;
            this.ctx.lineWidth = 2;
            this.ctx.strokeRect(x, y, 150, 40);
            
            // 选项文本
            this.ctx.fillStyle = textColor;
            this.ctx.font = '14px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(this.options[i] || '', x + 75, y + 25);
            
            // 显示正确/错误标识
            if (this.showResult) {
                if (i === this.correctAnswer) {
                    // 绿色正确标识
                    this.ctx.fillStyle = '#228B22';
                    this.ctx.font = 'bold 20px Arial';
                    this.ctx.fillText('✓', x + 130, y + 28);
                } else if (i === this.selectedAnswer && i !== this.correctAnswer) {
                    // 红色错误标识
                    this.ctx.fillStyle = '#DC143C';
                    this.ctx.font = 'bold 20px Arial';
                    this.ctx.fillText('✗', x + 130, y + 28);
                }
            }
        }
        
        // 显示错误次数
        this.ctx.fillStyle = '#FF0000';
        this.ctx.font = '16px Arial';
        this.ctx.textAlign = 'left';
        this.ctx.fillText(`Wrong: ${this.wrongAnswers}/${this.maxWrongAnswers}`, 10, 30);
    }
    
    drawGameOverScreen() {
        // 绘制游戏结束背景
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制游戏结束文本
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2 - 60);
        
        this.ctx.font = '18px Arial';
        this.ctx.fillText(`You identified ${this.score / 10} Pokemon correctly!`, this.canvas.width / 2, this.canvas.height / 2 - 20);
        
        this.ctx.font = '14px Arial';
        this.ctx.fillText('Click anywhere to play again', this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
    
    handleClick(x, y) {
        if (!this.isRunning) return;
        
        if (this.gameState === 'start') {
            // 开始游戏
            this.gameState = 'playing';
            // 清除开始页面动画定时器
            if (this.animationTimer) {
                clearInterval(this.animationTimer);
                this.animationTimer = null;
            }
            this.generateQuestion();
            return;
        }
        
        if (this.gameState === 'gameover') {
            // 重新开始游戏
            this.restart();
            return;
        }
        
        if (this.gameState === 'playing' && !this.showResult) {
            // 检查点击的是哪个选项
            for (let i = 0; i < 4; i++) {
                const buttonX = 25 + (i % 2) * 175;
                const buttonY = 240 + Math.floor(i / 2) * 60;
                
                if (x >= buttonX && x <= buttonX + 150 && y >= buttonY && y <= buttonY + 40) {
                    // 记录玩家选择的答案
                    this.selectedAnswer = i;
                    this.showResult = true;
                    
                    if (i === this.correctAnswer) {
                        // 答对了
                        this.updateScore(10);
                    } else {
                        // 答错了
                        this.wrongAnswers++;
                    }
                    
                    // 重新绘制显示结果
                    this.draw();
                    
                    // 1.5秒后进入下一题或结束游戏
                    setTimeout(() => {
                        this.showResult = false;
                        this.selectedAnswer = -1;
                        
                        if (this.wrongAnswers >= this.maxWrongAnswers) {
                            this.gameState = 'gameover';
                        } else {
                            this.generateQuestion();
                        }
                        this.draw();
                    }, 1500);
                    
                    break;
                }
            }
        }
    }
    
    handleKeyPress(e) {
        if (!this.isRunning) return;
        
        let selectedOption = -1;
        switch (e.key) {
            case '1':
                selectedOption = 0;
                break;
            case '2':
                selectedOption = 1;
                break;
            case '3':
                selectedOption = 2;
                break;
            case '4':
                selectedOption = 3;
                break;
        }
        
        if (selectedOption >= 0) {
            // 模拟点击对应按钮
            const buttonX = 25 + (selectedOption % 2) * 175 + 75;
            const buttonY = 240 + Math.floor(selectedOption / 2) * 60 + 20;
            this.handleClick(buttonX, buttonY);
        }
    }
}

// 初始化游戏合集
const gameCollection = new GameCollection();