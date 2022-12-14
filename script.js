const boardElement = document.getElementById('board');
const levelValue = document.getElementById('level-value');
const scoreValue = document.getElementById('score-value');
const goalValue = document.getElementById('goal-value');
const gyroButton = document.getElementById("start-gyro");
const hintButton = document.getElementById("show-hint");
const solutionButton = document.getElementById("show-solution");
const hint = document.getElementById("hint-text");
const solution = document.getElementById("solution");
const hintContainer = document.getElementById("container-hint");
const solutionContainer = document.getElementById("container-solution");
const modal = document.getElementById("myModal");
const close = document.getElementsByClassName("close")[0];

const BASE_VALUE = 3;

const BOARD_STYLING = {
	3: {boxSize: 'board-3-box', repeating: 'board3'},
	4: {boxSize: 'board-4-box', repeating: 'board4'},
	5: {boxSize: 'board-5-box', repeating: 'board5'}
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
	getNeighbours: function (x,y) {
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

let oldClass = "";
const Draw = {
	init: function () {
		boardElement.innerHTML = "";

		if(oldClass != "") {
			boardElement.classList.remove(oldClass);
		}

		if(Board.size > 2) {
			boardElement.classList.add(BOARD_STYLING[Board.size].repeating);
			oldClass = BOARD_STYLING[Board.size].repeating;
		}

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
		boxEl.classList.add(BOARD_STYLING[Board.size].boxSize);
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
	hint: "",
	solution: "",
	goal: 0,
	init: function () {
		this.loadData();
		Draw.init();
	},
	reset: function () {
		this.setLevel(this.levels[0].id);
		this.setGoal(this.levels[0].goal);
		this.setHint(this.levels[0].hint);
		this.setSolution(this.levels[0].solution);
		Player.setScore(Math.max(...this.levels[0].data.flatMap(x => x).map(x => x.value)));
		Board.init(this.levels[0].data, this.levels[0].size);
		this.saveGame();
	},
	lost: function () {
		this.reset();
	},
	win: function () {
		this.nextLevel();
	},
	setLevel: function (value) {
		this.activeLevel = value;
		levelValue.innerHTML = value;
	},
	setHint: function (value) {
		this.hint = value;
		hint.innerHTML = value;
	},
	setSolution: function (value) {
		this.solution = value;
		solution.src = value;
	},
	setGoal: function (value) {
		this.goal = value;
		goalValue.innerHTML = value;
	},
	loadData: function () {
		fetch('./data.json')
			.then(res => res.json())
			.then(data => {
				if (data) {
					this.tutorial = data.tutorial;
					this.levels = data.levels.sort((a, b) => a.id - b.id);
				}
			}).then(() => this.loadSave());
	},
	nextLevel: function () {
		if(this.activeLevel==10){
			modal.style.display = "block";
			this.reset();
			return;
		}
		const nextLevelData = this.levels.filter(x => x.id === this.activeLevel + 1)[0];
		this.setLevel(++this.activeLevel);
		this.setGoal(nextLevelData.goal);
		this.setHint(nextLevelData.hint);
		this.setSolution(nextLevelData.solution);
		Player.setScore(Math.max(...nextLevelData.data.flatMap(x => x).map(x => x.value)));
		Board.init(nextLevelData.data, nextLevelData.size);
		this.saveGame();
	},
	loadSave: function () {
		const gameSave = JSON.parse(localStorage.getItem('game-save')) || this.levels[0];
		this.setLevel(gameSave.id);
		this.setGoal(gameSave.goal);
		this.setHint(gameSave.hint);
		this.setSolution(gameSave.solution);
		Board.init(gameSave.data, gameSave.size);
		Player.setScore(gameSave.hasOwnProperty('score') ? gameSave.score : Math.max(...gameSave.data.flatMap(x => x).map(x => x.value)));
	},
	saveGame: function () {
		const gameSave = {
			score: Player.score,
			id: this.activeLevel,
			title: "Level " + this.activeLevel,
			size: Board.size,
			goal: this.goal,
			hint: this.hint,
			solution: this.solution,
			data: Board.getDesk(),
		}

		localStorage.setItem('game-save', JSON.stringify(gameSave));
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

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/serviceWorker.js")
      .then(() => console.log("service worker registered"))
      .catch(err => console.log("service worker not registered", err))
  })
}


if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)){
  	screen.orientation.lock("portrait");
	gyroButton.style.display = 'block';
  	let is_running = false;
  	gyroButton.onclick = function(e) {
		e.preventDefault();

		if (DeviceMotionEvent && typeof DeviceMotionEvent.requestPermission === "function") {
			DeviceMotionEvent.requestPermission();
		}

		if (is_running){
			window.removeEventListener("devicemotion", handleMotion);
			gyroButton.innerHTML = "Start gyro";
			gyroButton.classList.add('btn-success');
			gyroButton.classList.remove('btn-danger');
			is_running = false;
		}else{
			window.addEventListener("devicemotion", handleMotion);
			document.getElementById("start-gyro").innerHTML = "Stop gyro";
			gyroButton.classList.remove('btn-success');
			gyroButton.classList.add('btn-danger');
			is_running = true;
		}
	};

	let touchstartX = 0;
	let touchendX = 0;
	let touchstartY = 0;
	let touchendY = 0;

	if(!is_running){
		function checkDirection() {

				var xDiff = touchstartX - touchendX;
				var yDiff = touchstartY - touchendY;

				if ( Math.abs( xDiff ) > Math.abs( yDiff ) ) {
					if ( xDiff > 0 ) {
						Player.makeMove(DIRECTION.LEFT);
					} else {
						Player.makeMove(DIRECTION.RIGHT);
					}
				} else if ( Math.abs( xDiff ) < Math.abs( yDiff ) ){
					if ( yDiff > 0 ) {
						Player.makeMove(DIRECTION.UP);
					} else {
						Player.makeMove(DIRECTION.DOWN);
					}
				}
				xDown = null;
   				yDown = null;
			}

			document.addEventListener('touchstart', e => {
				touchstartX = e.changedTouches[0].screenX
				touchstartY = e.changedTouches[0].screenY
			})

			document.addEventListener('touchend', e => {
				touchendX = e.changedTouches[0].screenX
				touchendY = e.changedTouches[0].screenY
				checkDirection()
			})
	}
}else{
  gyroButton.style.display = 'none';
}


isMoving = false;
function handleMotion(event) {

    if(event.rotationRate.alpha>150 && !isMoving){
		Player.makeMove(DIRECTION.DOWN);
        isMoving = true;
        setTimeout(function (){
            isMoving = false;
          }, 650);

    } else if(event.rotationRate.alpha<-150 && !isMoving){
		Player.makeMove(DIRECTION.UP);
        isMoving = true;
        setTimeout(function (){
            isMoving = false;
          }, 650);

    }else if(event.rotationRate.beta<-150 && !isMoving){
		Player.makeMove(DIRECTION.LEFT);
        isMoving = true;
        setTimeout(function (){
            isMoving = false;
          }, 650);

    }else if(event.rotationRate.beta>150 && !isMoving){
		Player.makeMove(DIRECTION.RIGHT);
        isMoving = true;
        setTimeout(function (){
            isMoving = false;
          }, 650);
    };
}



var maxWidth = window.matchMedia("(max-width: 540px)")
var minWidth = window.matchMedia("(min-width: 540px)")

maxWidth.addEventListener("change", () => {
	Draw.drawDesk();
});

minWidth.addEventListener("change", () => {
	Draw.drawDesk();
});


hintButton.addEventListener('click', () => {
	if(hintContainer.style.display == "none"){
		hintContainer.style.display = "block"
		hintButton.classList.remove('btn-success');
		hintButton.classList.add('btn-danger');
	}else{
		hintContainer.style.display = "none"
		hintButton.classList.remove('btn-danger');
		hintButton.classList.add('btn-success');
	}
});

solutionButton.addEventListener('click', () => {
	if(solutionContainer.style.display == "none"){
		solutionContainer.style.display = "block"
		solutionButton.classList.remove('btn-success');
		solutionButton.classList.add('btn-danger');
	}else{
		solutionContainer.style.display = "none"
		solutionButton.classList.remove('btn-danger');
		solutionButton.classList.add('btn-success');
	}
});

close.onclick = function() { 
	modal.style.display = "none";
	slideShow = 0;
}