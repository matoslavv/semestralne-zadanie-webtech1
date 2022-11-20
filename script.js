const boardElement = document.getElementById('board');

const SIZE = 3;
const BASE_VALUE = 3;

const DIRECTION = {
	UP: 'UP',
	DOWN: 'DOWN',
	LEFT: 'LEFT',
	RIGHT: 'RIGHT'
}

const Board = {
	_desk: [],
	_oldDesk: [],
	init: function() {
		console.log('Board init');
		for (let i = 0; i < SIZE; i++) {
			this._desk[i] = [];
			for (let j = 0; j < SIZE; j++) {
				this._desk[i][j] = this.getEmptyBox(i, j);
			}
		}

		this._saveOldState();
	},
	getDesk: function() {
		return this._desk;
	},
	_saveOldState: function () {
		this._oldDesk = JSON.parse(JSON.stringify(this._desk));
	},
	isMoved: function() {
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (this._desk[i][j].value !== this._oldDesk[i][j].value) {
					return true;
				}
			}
		}
		return false;
	},
	generateBox: function () {
		const freeTiles = this._desk.flatMap(x => x).filter((box) => box.value === 0);

		if (freeTiles.length === 0) {
			Game.lost();
			return;
		}

		const selectedTile = freeTiles[Math.floor(Math.random()*freeTiles.length)];
		this._desk[selectedTile.x][selectedTile.y].value = BASE_VALUE;

		Draw.drawBox(this._desk[selectedTile.x][selectedTile.y]);
	},
	getDirectionCoords: function (direction) {
		switch (direction) {
			case DIRECTION.UP:
				return {x: 0, y: -1}
			case DIRECTION.DOWN:
				return {x: 0, y: 1};
			case DIRECTION.LEFT:
				return {x: 1, y: 0};
			case DIRECTION.RIGHT:
				return {x: -1, y: 0};
		}
	},
	getEmptyBox: function (x, y) {
		return {x, y, value: 0};
	},
	mergeBoxes: function (direction) {
		this._saveOldState();

		for(let s = 0;s < SIZE; s++){
			// console.log(this._desk);
			const columnBoxes = [];

			if (direction === DIRECTION.UP) {
				for (let i = 0; i < SIZE; i++) {
					columnBoxes.push(this._desk[s][i]);
					console.log(this._desk[s][i]);
				}
			} else if (direction === DIRECTION.DOWN) {
				for (let i = SIZE-1; i >= 0; i--) {
					columnBoxes.push(this._desk[s][i]);
				}
			} else if (direction === DIRECTION.LEFT) {
				for (let i = 0; i < SIZE; i++) {
					columnBoxes.push(this._desk[i][s]);
				}
			} else if (direction === DIRECTION.RIGHT) {
				for (let i = SIZE-1; i >= 0; i--) {
					columnBoxes.push(this._desk[i][s]);
				}
			}

			let filteredColumnBoxes = columnBoxes.filter(box => box.value !== 0);

			// for (let j = 0; j < filteredColumnBoxes.length; j++) {
			// 	console.log(filteredColumnBoxes[j].value);
			// }

			for (let j = 0; j < filteredColumnBoxes.length - 1; j++) {
				if (filteredColumnBoxes[j].value === filteredColumnBoxes[j+1].value) {
					filteredColumnBoxes[j].value *= 2;
					filteredColumnBoxes.splice(j+1, 1);
					console.log(filteredColumnBoxes);
				}
			}

			for (let i=filteredColumnBoxes.length;i<SIZE;i++) {
				filteredColumnBoxes.push(this.getEmptyBox(0,0));
			}

			if (filteredColumnBoxes.length>0) {
				if (direction === DIRECTION.UP) {
					for (let j = 0; j < SIZE; j++) {
						this._desk[s][j].value = filteredColumnBoxes[j].value;
					}
				}
				if (direction === DIRECTION.DOWN) {
					for (let j = SIZE-1; j >= 0; j--) {
						this._desk[s][j].value = filteredColumnBoxes[SIZE-1-j].value;
					}
				}
				if (direction === DIRECTION.LEFT) {
					for (let j = 0; j < SIZE; j++) {
						this._desk[j][s].value = filteredColumnBoxes[j].value;
					}
				}
				if (direction === DIRECTION.RIGHT) {
					for (let j = SIZE-1; j >= 0; j--) {
						this._desk[j][s].value = filteredColumnBoxes[SIZE-1-j].value;
					}
				}
			}

			// console.log(this._desk);
		}
	}
}

const Draw = {
	init: function () {
		boardElement.innerHTML = "";
	},
	calculatePixelPosition: function (x, y) {
		const left = boardElement.getBoundingClientRect().width / SIZE * x;
		const top = boardElement.getBoundingClientRect().width / SIZE * y;

		return {x: left, y: top};
	},
	drawBox: function (box) {
		const pixelPosition = this.calculatePixelPosition(box.x, box.y);
		const boxElement = this.createBox({x: pixelPosition.x, y: pixelPosition.y, value: box.value});

		boardElement.appendChild(boxElement);
	},
	createBox: function (box) {
		const boxEl = document.createElement('div');
		boxEl.classList.add('box');
		boxEl.classList.add(`box-${box.value}`);
		boxEl.style.left = box.x + 'px';
		boxEl.style.top = box.y + 'px';

		const boxNumber = document.createElement('span');
		boxNumber.classList.add('boxNumber');
		boxNumber.textContent = box.value;
		boxEl.appendChild(boxNumber);

		return boxEl;
	},
	drawDesk: function () {
		Draw.init();
		const desk = Board.getDesk();

		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (desk[i][j].value) {
					this.drawBox(desk[i][j]);
				}
			}
		}
	}
}

const Player = {
	score: 0,
	makeMove: function (direction) {
		console.log(direction);

		Board.mergeBoxes(direction);

		if (!Board.isMoved()) {
			return;
		}
		Board.generateBox(); // last
		Draw.drawDesk();
	},
	incrementScore: function (value) {
		this.score += value;
	},
	resetScore: function () {
		this.score = 0;
	}
}

const Game = {
	init: function () {
		Board.init();
		Draw.init();
		Board.generateBox();
	},
	reset: function () {
		Player.resetScore();
		Board.init();
		Draw.init();
	},
	lost: function () {
		console.log('Game over');
		this.reset();
	},
	win: function () {
		console.log('You won');
		this.reset();
	}
}

document.onkeydown = function (e) {
	switch (e.key) {
		case "ArrowLeft":
			Player.makeMove(DIRECTION.LEFT);
        	break;
   		case "ArrowRight":
			Player.makeMove(DIRECTION.RIGHT);
	        break;
    	case "ArrowUp":
			Player.makeMove(DIRECTION.UP);
    	    break;
    	case "ArrowDown":
			Player.makeMove(DIRECTION.DOWN);
        	break;
	}
}

Game.init();
