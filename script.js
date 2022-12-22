const boardElement = document.getElementById('board');

const SIZE = 3;
const BASE_VALUE = 3;

const BOARD_STYLING = {
	3: {boxWidth: '133px', boxHeight: '130px', fontSize: '40px', repeating: '133.333px'},
	4: {boxWidth: '99px', boxHeight: '99px', fontSize: '32px', repeating: '99.333px'}
}

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
	loadLevel: function (desk) {
		for (let i = 0; i < SIZE; i++) {
			this._desk[i] = [];
			for (let j = 0; j < SIZE; j++) {
				this._desk[i][j] = this.getEmptyBox(i, j);
				this._desk[i][j].value = desk[i][j].value;
			}
		}
		this._saveOldState();
		Draw.drawDesk();
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
	_getFreeTiles: function () {
		const freeTiles = this._desk.flatMap(x => x).filter((box) => box.value === 0);

		if (freeTiles.length === 0 && !Board._isMergableBox()) {
			Game.lost();
			return;
		}
		return freeTiles;
	},
	generateBox: function () {
		const freeTiles = this._getFreeTiles();
		const selectedTile = freeTiles[Math.floor(Math.random()*freeTiles.length)];
		if (selectedTile) {
			this._desk[selectedTile.x][selectedTile.y].value = BASE_VALUE;
			Draw.drawBox(this._desk[selectedTile.x][selectedTile.y]);
		}
	},
	_isMergableBox: function () {
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const t = this.getNeighbours(i, j);
				for (let k = 0; k < t.length; k++) {
					if (this._desk[i][j].value === this._desk[t[k][0]][t[k][1]].value) {
						return true;
					}
				}
			}
		}
		return false
	},
	getNeighbours: function (x,y) { // test it
		const coordsNeighbours = [];
		if (x == 0 && y == 0) {
			coordsNeighbours.push([x+1, y], [x, y+1]);
			return coordsNeighbours;
		}
		else if (x == SIZE-1 && y == 0) {
			coordsNeighbours.push([x-1, y], [x, y+1]);
			return coordsNeighbours;
		}
		else if (x == 0 && y == SIZE-1) {
			coordsNeighbours.push([x+1, y], [x, y-1]);
			return coordsNeighbours;
		}
		else if (x == SIZE-1 && y == SIZE-1) {
			coordsNeighbours.push([x, y-1], [x-1, y]);
			return coordsNeighbours;
		}
		else if (y == 0 && (x !== 0 || x !== SIZE-1)) {
			coordsNeighbours.push([x, y+1], [x-1, y], [x+1, y]);
			return coordsNeighbours;
		}
		else if (y == SIZE-1 && (x !== 0 || x !== SIZE-1)) {
			coordsNeighbours.push([x, y-1], [x-1, y], [x+1, y]);
			return coordsNeighbours;
		}
		else if (x == 0 && (y !== 0 || y !== SIZE-1)) {
			coordsNeighbours.push([x, y-1], [x, y+1], [x+1, y]);
			return coordsNeighbours;
		}
		else if (x == SIZE-1 && (y !== 0 || y !== SIZE-1)) {
			coordsNeighbours.push([x, y-1], [x, y+1], [x-1, y]);
			return coordsNeighbours;
		}
		else {
			coordsNeighbours.push([x, y-1], [x-1, y], [x+1, y], [x, y+1]);
			return coordsNeighbours;
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
					// console.log(filteredColumnBoxes);
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
		console.log(desk);
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				if (desk[i][j].value) {
					this.drawBox(desk[i][j]);
				}
			}
		}
	},
	// getBoxSize: function (size, resolution) {
	// 	switch (size) {
	// 		case BOARD_WIDTH[400]:
	// 			return {boxWidth: '133px', boxHeight: '130px', repeating: '133.333px'} // 99.333px repeating 4x4
	// 		case BOARD_WIDTH[700]:
	// 			return {boxWidth: '133px', boxHeight: '130px', repeating: '175px'}

	// 	}
	// }
}

const Player = {
	score: 0,
	makeMove: function (direction) {
		Board.mergeBoxes(direction);

		Player.setScore(Math.max(...Board.getDesk().flatMap(x => x).map(x => x.value)));
		console.log(Board.getDesk().flatMap(x => x).map(x => x.value));
		if (!Board._getFreeTiles() || !Board.isMoved()) {
			return;
		}

		Board.generateBox();
		Draw.drawDesk();
	},
	setScore: function (value) {
		console.log(value);
		this.score = value;

		if (this.score === Game.goal) {
			Game.win();
		}
	},
	resetScore: function () {
		this.score = 0;
	}
}

const Game = {
	activeLevel: null,
	levels: [],
	tutorial: "",
	goal: 0,
	init: function () {
		this.loadData();
		Draw.init();
	},
	reset: function () {
		Player.resetScore();
		// Board.init();
		console.log("reset");
		console.log(this.activeLevel);
		// this.activeLevel = this.levels[0].id;
		// this.goal = this.levels[0].goal;
		
		Board.loadLevel(this.levels[this.activeLevel].data);

		// Board.loadLevel(this.activeLevel.data);
		Draw.init();
		Draw.drawDesk();
	},
	lost: function () {
		console.log('Game over');
		this.reset();
	},
	win: function () {
		console.log('You won');
		// this.reset();
		this.nextLevel();
	},
	loadData: function () {
		fetch('./data.json')
			.then(res => res.json())
			.then(data => {
				if (data) {
					this.tutorial = data.tutorial;
					this.levels = data.levels;
					this.activeLevel = data.levels[0].id;
					this.goal = data.levels[0].goal;
					Board.loadLevel(data.levels[0].data);
				}
			});
	},
	nextLevel: function () {
		const nextLevelData = this.levels.filter(x => x.id === this.activeLevel + 1)[0];
		console.log(nextLevelData);
		this.activeLevel++;
		this.goal = nextLevelData.goal;
		Board.loadLevel(nextLevelData.data);
	},
	loadSave: function () {
		const gameSave = localStorage.getItem('game-save') || this.levels[0];

		Board._desk = gameSave;
		Draw.drawDesk();
		console.log(gameSave);
	},
	removeSave: function () {
		localStorage.removeItem('game-save');
	}
}

window.addEventListener('keydown', (e) => {
	switch (e.key) {
		case "ArrowLeft":
		case "Left":
		case "a":
			Player.makeMove(DIRECTION.LEFT);
        	break;
   		case "ArrowRight":
   		case "Right":
   		case "d":
			Player.makeMove(DIRECTION.RIGHT);
	        break;
    	case "ArrowUp":
    	case "UP":
    	case "w":
			Player.makeMove(DIRECTION.UP);
    	    break;
    	case "ArrowDown":
    	case "Down":
    	case "s":
			Player.makeMove(DIRECTION.DOWN);
        	break;
	}
});



Game.init();

// Game.loadData();
// Game.loadSave();

// console.log(Board.getDesk(), Player.score, Game.activeLevel);

// Save state before closing tab/game
 window.addEventListener('beforeunload', function (e) {
	e.preventDefault();
	// e.returnValue = '';
	// this.localStorage.setItem('game-save', 'kks')
});

// PWA
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(res => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}
