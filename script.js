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
	init: function() {
		console.log('Board init');
		for (let i = 0; i < SIZE; i++) {
			this._desk[i] = [];
			for (let j = 0; j < SIZE; j++) {
				this._desk[i][j] = this.getEmptyBox(i, j);
			}
		}
	},
	getDesk: function() {
		return this._desk;
	},
	generateBox: function () { // urobime tu counter, ktory pocita kolko krat zasebou bol dany smer. Ak mame zasebou 2x dole, tak uz nebude generovat novy box - musi sa ist do inej strany
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
	getHgfg: function (direction) {
		switch (direction) {
			case DIRECTION.LEFT:
			case DIRECTION.UP:
				return {start: 0, end: SIZE, kremes: 1}
			case DIRECTION.RIGHT:
			case DIRECTION.DOWN:
				return {start: SIZE-1, end: -1, kremes: -1}
		}
	},
	mergeBoxes: function (direction) {
		// for (let i = 0; i < SIZE; i++) {
		// 	// [SIZE-i]
		// 	for (let j = 0; j < SIZE; j++) {
		// 		const substractPosition = this.getDirectionCoords(direction);
		// 		if (this._desk[i][j].value === this._desk[i+substractPosition.x][j+substractPosition.y].value && this._desk[i][j].value) {
		// 			// merge
		// 			const consumerBox = this._desk[i][j];
		// 			const producerBox = this._desk[i+substractPosition.x][j+substractPosition.y];
		// 		}
		// 	}
		// }

		console.log(this._desk);
		const columnBoxes = [];
		// console.log(this._desk[0]);
		const hgfg = this.getHgfg(direction);
		console.log(hgfg);
		// for (let i = 0; i < SIZE; i++) { // ak ideme Zhora dole, tak otocime pole?
		// 	columnBoxes.push(this._desk[0][i]);
		// }

		// for (let s = 0; s < SIZE; s++) {
			const s = 0;

			// for (let i = hgfg.start; i > hgfg.end; i+=hgfg.kremes) {
			for (let i = hgfg.start; i > hgfg.end; i+=hgfg.kremes) {
				// if (direction === DIRECTION.UP || DIRECTION === DIRECTION.DOWN) {
					columnBoxes.push(this._desk[s][i]);
				// } else {
				// 	columnBoxes.push(this._desk[i][s]);
				// }
				// columnBoxes.push(this._desk[0][i]);
			}

			let filteredColumnBoxes = columnBoxes.filter(box => box.value !== 0);
			console.log(filteredColumnBoxes);
			for (let j = 0; j < filteredColumnBoxes.length - 1; j++) {
				if (filteredColumnBoxes[j].value === filteredColumnBoxes[j+1].value) {
					filteredColumnBoxes[j].value *= 2;
					filteredColumnBoxes.splice(j+1, 1);
					console.log(filteredColumnBoxes);
				}
			}

			if (filteredColumnBoxes.length) {
				for (let j = hgfg.start; j > hgfg.end; j+=hgfg.kremes) {
					if (j < filteredColumnBoxes.length) {
						// if (direction === DIRECTION.UP || DIRECTION === DIRECTION.DOWN) {
							this._desk[s][j].value = filteredColumnBoxes[j].value; // fix
						// } else {
						// 	this._desk[j][s].value = filteredColumnBoxes[j].value; // fix
						// }

						// this._desk[0][j].value = filteredColumnBoxes[j].value; // fix
					} else {
						// if (direction === DIRECTION.UP || DIRECTION === DIRECTION.DOWN) {
							this._desk[s][j].value = 0; // fix
						// } else {
						// 	this._desk[j][s].value = 0; // fix
						// }
						// this._desk[0][j].value = 0; // fix
					}
				}
				// for (let j = 0; j < SIZE; j++) {
				// 	if (j < filteredColumnBoxes.length) {
				// 		this._desk[0][j].value = filteredColumnBoxes[j].value; // fix
				// 	} else {
				// 		this._desk[0][j].value = 0; // fix
				// 	}
				// }
			}

		// }
		console.log(this._desk);

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
