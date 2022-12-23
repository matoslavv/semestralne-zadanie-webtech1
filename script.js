const boardElement = document.getElementById('board');
const levelValue = document.getElementById('level-value');
const scoreValue = document.getElementById('score-value');

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
	size: 0,
	init: function(desk, size) {
		console.log('Board init');
		this.size = size;
		for (let i = 0; i < this.size; i++) {
			this._desk[i] = [];
			for (let j = 0; j < this.size; j++) {
				this._desk[i][j] = this.getEmptyBox(i, j);
				this._desk[i][j].value = desk[i][j].value;
			}
		}
		this._saveOldState();
		Draw.drawDesk();
	},
	getDesk: function() {
		return this._desk;
	},
	_saveOldState: function () {
		this._oldDesk = JSON.parse(JSON.stringify(this._desk));
	},
	isMoved: function() {
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
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
		for (let i = 0; i < this.size; i++) {
			for (let j = 0; j < this.size; j++) {
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
		else if (x == this.size-1 && y == 0) {
			coordsNeighbours.push([x-1, y], [x, y+1]);
			return coordsNeighbours;
		}
		else if (x == 0 && y == this.size-1) {
			coordsNeighbours.push([x+1, y], [x, y-1]);
			return coordsNeighbours;
		}
		else if (x == this.size-1 && y == this.size-1) {
			coordsNeighbours.push([x, y-1], [x-1, y]);
			return coordsNeighbours;
		}
		else if (y == 0 && (x !== 0 || x !== this.size-1)) {
			coordsNeighbours.push([x, y+1], [x-1, y], [x+1, y]);
			return coordsNeighbours;
		}
		else if (y == this.size-1 && (x !== 0 || x !== this.size-1)) {
			coordsNeighbours.push([x, y-1], [x-1, y], [x+1, y]);
			return coordsNeighbours;
		}
		else if (x == 0 && (y !== 0 || y !== this.size-1)) {
			coordsNeighbours.push([x, y-1], [x, y+1], [x+1, y]);
			return coordsNeighbours;
		}
		else if (x == this.size-1 && (y !== 0 || y !== this.size-1)) {
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

		for(let s = 0;s < this.size; s++){
			const columnBoxes = [];

			if (direction === DIRECTION.UP) {
				for (let i = 0; i < this.size; i++) {
					columnBoxes.push(this._desk[s][i]);
				}
			} else if (direction === DIRECTION.DOWN) {
				for (let i = this.size-1; i >= 0; i--) {
					columnBoxes.push(this._desk[s][i]);
				}
			} else if (direction === DIRECTION.LEFT) {
				for (let i = 0; i < this.size; i++) {
					columnBoxes.push(this._desk[i][s]);
				}
			} else if (direction === DIRECTION.RIGHT) {
				for (let i = this.size-1; i >= 0; i--) {
					columnBoxes.push(this._desk[i][s]);
				}
			}

			let filteredColumnBoxes = columnBoxes.filter(box => box.value !== 0);

			for (let j = 0; j < filteredColumnBoxes.length - 1; j++) {
				if (filteredColumnBoxes[j].value === filteredColumnBoxes[j+1].value) {
					filteredColumnBoxes[j].value *= 2;
					filteredColumnBoxes.splice(j+1, 1);
				}
			}

			for (let i=filteredColumnBoxes.length;i<this.size;i++) {
				filteredColumnBoxes.push(this.getEmptyBox(0,0));
			}

			if (filteredColumnBoxes.length>0) {
				if (direction === DIRECTION.UP) {
					for (let j = 0; j < this.size; j++) {
						this._desk[s][j].value = filteredColumnBoxes[j].value;
					}
				}
				if (direction === DIRECTION.DOWN) {
					for (let j = this.size-1; j >= 0; j--) {
						this._desk[s][j].value = filteredColumnBoxes[this.size-1-j].value;
					}
				}
				if (direction === DIRECTION.LEFT) {
					for (let j = 0; j < this.size; j++) {
						this._desk[j][s].value = filteredColumnBoxes[j].value;
					}
				}
				if (direction === DIRECTION.RIGHT) {
					for (let j = this.size-1; j >= 0; j--) {
						this._desk[j][s].value = filteredColumnBoxes[this.size-1-j].value;
					}
				}
			}
		}
	}
}

const Draw = {
	init: function () {
		boardElement.innerHTML = "";
	},
	calculatePixelPosition: function (x, y) {
		const left = boardElement.getBoundingClientRect().width / Board.size * x;
		const top = boardElement.getBoundingClientRect().width / Board.size * y;

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
		for (let i = 0; i < Board.size; i++) {
			for (let j = 0; j < Board.size; j++) {
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
		if (!Board._getFreeTiles() || !Board.isMoved()) {
			return;
		}

		Board.generateBox();
		Draw.drawDesk();
		Game.saveGame();
	},
	setScore: function (value) {
		this.score = value;
		scoreValue.innerHTML = value;
		if (this.score === Game.goal) {
			Game.win();
		}
	},
}

const Game = {
	activeLevel: 0,
	levels: [],
	tutorial: "",
	goal: 0,
	init: function () {
		this.loadData();
		Draw.init();
	},
	reset: function () {
		this.setLevel(this.levels[0].id);
		this.goal = this.levels[0].goal;
		Player.setScore(Math.max(...this.levels[0].data.flatMap(x => x).map(x => x.value)));
		Board.init(this.levels[0].data, this.levels[0].size);
		this.saveGame();
	},
	lost: function () {
		console.log('Game over');
		this.reset();
	},
	win: function () {
		console.log('You won');
		this.nextLevel();
	},
	setLevel: function (value) {
		this.activeLevel = value;
		levelValue.innerHTML = value;
	},
	loadData: function () {
		fetch('./data.json')
			.then(res => res.json())
			.then(data => {
				if (data) {
					this.tutorial = data.tutorial;
					this.levels = data.levels;
				}
			}).then(() => this.loadSave());
	},
	nextLevel: function () {
		const nextLevelData = this.levels.filter(x => x.id === this.activeLevel + 1)[0];
		this.setLevel(++this.activeLevel);
		this.goal = nextLevelData.goal;
		Player.setScore(Math.max(...nextLevelData.data.flatMap(x => x).map(x => x.value)));
		Board.init(nextLevelData.data, nextLevelData.size);
		this.saveGame();
	},
	loadSave: function () {
		const gameSave = JSON.parse(localStorage.getItem('game-save')) || this.levels[0];
		console.log(gameSave);

		this.setLevel(gameSave.id);
		this.goal = gameSave.goal;
		Board.init(gameSave.data, gameSave.size);
		console.log(gameSave.hasOwnProperty('score') ? gameSave.score : Math.max(...gameSave.data.flatMap(x => x).map(x => x.value)));
		Player.setScore(gameSave.hasOwnProperty('score') ? gameSave.score : Math.max(...gameSave.data.flatMap(x => x).map(x => x.value)));
	},
	saveGame: function () {
		const gameSave = {
			score: Player.score,
			id: this.activeLevel,
			title: "Level " + this.activeLevel,
			size: Board.size,
			goal: this.goal,
			data: Board.getDesk(),
		}

		localStorage.setItem('game-save', JSON.stringify(gameSave));
		console.log(JSON.parse(localStorage.getItem('game-save')));
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


// What kind of device is used
if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  // Implement sensor
  console.log('mobile');
}else{
  console.log('desktop');
}

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevents the default mini-infobar or install dialog from appearing on mobile
  e.preventDefault();
  // Save the event because you'll need to trigger it later.
  deferredPrompt = e;
  // Show your customized install prompt for your PWA
  // Your own UI doesn't have to be a single element, you
  // can have buttons in different locations, or wait to prompt
  // as part of a critical journey.
  showInAppInstallPromotion();
});
