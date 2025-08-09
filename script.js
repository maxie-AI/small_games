class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gridSize = 20;
        this.tileCount = this.canvas.width / this.gridSize;
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.gameLoop = null;
        
        // 蛇的初始状态
        this.snake = [
            {x: 10, y: 10}
        ];
        this.dx = 0;
        this.dy = 0;
        
        // 食物位置
        this.food = {
            x: 15,
            y: 15
        };
        
        // 分数
        this.score = 0;
        this.highScore = localStorage.getItem('snakeHighScore') || 0;
        
        // 难度设置
        this.difficulties = {
            easy: { speed: 200, scoreMultiplier: 1 },
            medium: { speed: 150, scoreMultiplier: 1.5 },
            hard: { speed: 100, scoreMultiplier: 2 },
            expert: { speed: 70, scoreMultiplier: 3 }
        };
        this.currentDifficulty = 'medium';
        
        this.initializeGame();
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    initializeGame() {
        // 重置游戏状态
        this.snake = [{x: 10, y: 10}];
        this.dx = 0;
        this.dy = 0;
        this.score = 0;
        this.generateFood();
        this.draw();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        // 键盘控制
        document.addEventListener('keydown', (e) => {
            if (!this.gameRunning || this.gamePaused) return;
            
            const key = e.key;
            if (key === 'ArrowLeft' && this.dx === 0) {
                this.dx = -1;
                this.dy = 0;
            } else if (key === 'ArrowUp' && this.dy === 0) {
                this.dx = 0;
                this.dy = -1;
            } else if (key === 'ArrowRight' && this.dx === 0) {
                this.dx = 1;
                this.dy = 0;
            } else if (key === 'ArrowDown' && this.dy === 0) {
                this.dx = 0;
                this.dy = 1;
            }
        });
        
        // 游戏控制按钮
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        // 难度选择
        document.getElementById('difficulty').addEventListener('change', (e) => {
            this.currentDifficulty = e.target.value;
            if (this.gameRunning) {
                this.resetGame();
            }
        });
        
        // 移动端控制按钮
        document.getElementById('upBtn').addEventListener('click', () => {
            if (this.gameRunning && !this.gamePaused && this.dy === 0) {
                this.dx = 0;
                this.dy = -1;
            }
        });
        
        document.getElementById('downBtn').addEventListener('click', () => {
            if (this.gameRunning && !this.gamePaused && this.dy === 0) {
                this.dx = 0;
                this.dy = 1;
            }
        });
        
        document.getElementById('leftBtn').addEventListener('click', () => {
            if (this.gameRunning && !this.gamePaused && this.dx === 0) {
                this.dx = -1;
                this.dy = 0;
            }
        });
        
        document.getElementById('rightBtn').addEventListener('click', () => {
            if (this.gameRunning && !this.gamePaused && this.dx === 0) {
                this.dx = 1;
                this.dy = 0;
            }
        });
        
        // 触摸滑动控制
        let touchStartX = 0;
        let touchStartY = 0;
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
        });
        
        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            if (!this.gameRunning || this.gamePaused) return;
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const deltaX = touchEndX - touchStartX;
            const deltaY = touchEndY - touchStartY;
            
            const minSwipeDistance = 30;
            
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                // 水平滑动
                if (Math.abs(deltaX) > minSwipeDistance) {
                    if (deltaX > 0 && this.dx === 0) {
                        // 向右滑动
                        this.dx = 1;
                        this.dy = 0;
                    } else if (deltaX < 0 && this.dx === 0) {
                        // 向左滑动
                        this.dx = -1;
                        this.dy = 0;
                    }
                }
            } else {
                // 垂直滑动
                if (Math.abs(deltaY) > minSwipeDistance) {
                    if (deltaY > 0 && this.dy === 0) {
                        // 向下滑动
                        this.dx = 0;
                        this.dy = 1;
                    } else if (deltaY < 0 && this.dy === 0) {
                        // 向上滑动
                        this.dx = 0;
                        this.dy = -1;
                    }
                }
            }
        });
    }
    
    startGame() {
        if (this.gameRunning) return;
        
        this.gameRunning = true;
        this.gamePaused = false;
        
        // 如果蛇没有移动方向，设置默认向右移动
        if (this.dx === 0 && this.dy === 0) {
            this.dx = 1;
        }
        
        this.updateButtons();
        this.hideGameOver();
        
        const speed = this.difficulties[this.currentDifficulty].speed;
        this.gameLoop = setInterval(() => {
            if (!this.gamePaused) {
                this.update();
                this.draw();
            }
        }, speed);
    }
    
    togglePause() {
        if (!this.gameRunning) return;
        
        this.gamePaused = !this.gamePaused;
        this.updateButtons();
    }
    
    resetGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        this.initializeGame();
        this.updateButtons();
        this.hideGameOver();
    }
    
    update() {
        // 移动蛇头
        const head = {x: this.snake[0].x + this.dx, y: this.snake[0].y + this.dy};
        
        // 检查墙壁碰撞
        if (head.x < 0 || head.x >= this.tileCount || head.y < 0 || head.y >= this.tileCount) {
            this.gameOver();
            return;
        }
        
        // 检查自身碰撞
        for (let segment of this.snake) {
            if (head.x === segment.x && head.y === segment.y) {
                this.gameOver();
                return;
            }
        }
        
        this.snake.unshift(head);
        
        // 检查是否吃到食物
        if (head.x === this.food.x && head.y === this.food.y) {
            const multiplier = this.difficulties[this.currentDifficulty].scoreMultiplier;
            this.score += Math.floor(10 * multiplier);
            this.generateFood();
            this.updateDisplay();
        } else {
            this.snake.pop();
        }
    }
    
    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * this.tileCount),
                y: Math.floor(Math.random() * this.tileCount)
            };
        } while (this.snake.some(segment => segment.x === newFood.x && segment.y === newFood.y));
        
        this.food = newFood;
    }
    
    draw() {
        // 清空画布
        this.ctx.fillStyle = '#2d3748';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线（可选）
        this.ctx.strokeStyle = '#4a5568';
        this.ctx.lineWidth = 0.5;
        for (let i = 0; i <= this.tileCount; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(i * this.gridSize, 0);
            this.ctx.lineTo(i * this.gridSize, this.canvas.height);
            this.ctx.stroke();
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, i * this.gridSize);
            this.ctx.lineTo(this.canvas.width, i * this.gridSize);
            this.ctx.stroke();
        }
        
        // 绘制蛇
        this.snake.forEach((segment, index) => {
            if (index === 0) {
                // 蛇头
                this.ctx.fillStyle = '#48bb78';
            } else {
                // 蛇身
                this.ctx.fillStyle = '#68d391';
            }
            
            this.ctx.fillRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2
            );
            
            // 添加圆角效果
            this.ctx.beginPath();
            this.ctx.roundRect(
                segment.x * this.gridSize + 1,
                segment.y * this.gridSize + 1,
                this.gridSize - 2,
                this.gridSize - 2,
                3
            );
            this.ctx.fill();
        });
        
        // 绘制食物
        this.ctx.fillStyle = '#e53e3e';
        this.ctx.beginPath();
        this.ctx.roundRect(
            this.food.x * this.gridSize + 2,
            this.food.y * this.gridSize + 2,
            this.gridSize - 4,
            this.gridSize - 4,
            5
        );
        this.ctx.fill();
        
        // 添加食物发光效果
        this.ctx.shadowColor = '#e53e3e';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.gamePaused = false;
        
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
            this.gameLoop = null;
        }
        
        // 更新最高分
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('snakeHighScore', this.highScore);
        }
        
        this.updateDisplay();
        this.updateButtons();
        this.showGameOver();
    }
    
    updateDisplay() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('highScore').textContent = this.highScore;
        document.getElementById('finalScore').textContent = this.score;
    }
    
    updateButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (this.gameRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
            pauseBtn.textContent = this.gamePaused ? '继续' : '暂停';
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
            pauseBtn.textContent = '暂停';
        }
    }
    
    showGameOver() {
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    hideGameOver() {
        document.getElementById('gameOver').classList.add('hidden');
    }
}

// 添加 roundRect 方法支持（如果浏览器不支持）
if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
        this.beginPath();
        this.moveTo(x + radius, y);
        this.lineTo(x + width - radius, y);
        this.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.lineTo(x + width, y + height - radius);
        this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.lineTo(x + radius, y + height);
        this.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.lineTo(x, y + radius);
        this.quadraticCurveTo(x, y, x + radius, y);
        this.closePath();
    };
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new SnakeGame();
});

// 防止页面滚动（移动端）
document.addEventListener('touchmove', (e) => {
    e.preventDefault();
}, { passive: false });

// 防止双击缩放（移动端）
document.addEventListener('touchstart', (e) => {
    if (e.touches.length > 1) {
        e.preventDefault();
    }
});

let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = (new Date()).getTime();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);