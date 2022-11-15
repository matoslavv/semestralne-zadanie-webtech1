const boardElement = document.getElementById('board');

const SIZE = 3;
const BASE_VALUE = 3;

const Board = {
	desk: [],
	init: function() {
		console.log('Board init');
		for (let i = 0; i < SIZE; i++) {
			this.desk[i] = [];
			for (let j = 0; j < SIZE; j++) {
				const box = {
					x: i,
					y: j,
					value: 0
				};
				this.desk[i][j] = box;
			}
		}
	},
	generateBox: function () { // get one random tile from 2D array where value == 0 & set 3
		const freeTiles = this.desk.flatMap(x => x).filter((box) => box.value === 0);
		const selectedTile = freeTiles[Math.floor(Math.random()*freeTiles.length)];

		this.desk[selectedTile.x][selectedTile.y].value = BASE_VALUE;
		console.log(this.desk[selectedTile.x][selectedTile.y]);
	},
}


const Draw = {
	init: function () {
		for (let i = 0; i < SIZE; i++) {
			for (let j = 0; j < SIZE; j++) {
				const box = document.createElement('div');
				box.classList.add('box');
				boardElement.appendChild(box);
			}
		}
	},
	drawBox: function () {
	},
	createBox: function (x, y) { // je potreba suradnice?
		const box = document.createElement('div');
		box.classList.add('box');
		boardElement.appendChild(box);
	},
	updateBox: function (x, y, value) {

	}
}

const Player = {
	score: 0,
	makeMove: function () {

	},
	incrementScore: function (value) {
		this.score += value;
	},
	resetScore: function () {
		this.score = 0;
	}
}

const Game = {

}

document.onkeydown = function (e) {
	switch (e.key) {
		case "ArrowLeft":
        // Left pressed
        break;
   		case "ArrowRight":
        // Right pressed
        break;
    	case "ArrowUp":
        // Up pressed
        break;
    	case "ArrowDown":
        // Down pressed
        break;
	}
}

Board.init();
Draw.init();
Board.generateBox();
