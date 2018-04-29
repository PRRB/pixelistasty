/* written by P.B. - 2017 */
/* https://github.com/PhilRB/ */

// Settings
var cellSize = 9; //px
var interval = 50; //initial interval (ms)
var color1 = 'white';
var color2 = 'black';
var noWrap = false;

// Globals
var body;
var slider;
var canvas;
var window;
var ctx;
var map;
var wCount, xHigh;
var hCount, yHigh;

window.onload = function () {
	window = window;
	body = document.body;
	body.style.overflow = "hidden";
	let W = window.innerWidth - 18;
	let H = window.innerHeight - 18;
	wCount = Math.ceil(W / cellSize) - 1;
	hCount = Math.ceil(H / cellSize) - 1;
	xHigh = wCount - 1;
	yHigh = hCount - 1;
	canvas = document.createElement("canvas");
	canvas.width = wCount * cellSize;
	canvas.height = hCount * cellSize;
	canvas.style.display = "block";
	canvas.style.margin = "auto";
	canvas.style.border = "1px solid #d3d3d3";
	ctx = canvas.getContext("2d");
	canvas.addEventListener('dblclick', onDblClick, true);
	canvas.addEventListener('mousedown', mouseDown, true);
	canvas.addEventListener('mouseup', mouseUp, true);
	canvas.addEventListener('contextmenu', onRightClick, true);
	canvas.addEventListener('touchstart', onTouch, false);
	canvas.addEventListener('touchmove', onTouch, false);
	canvas.addEventListener('touchend', onTouchEnd, false);
	body.addEventListener('keydown', keyDown, true);
	body.appendChild(canvas);
	initMap();
	createSlider();
	initSplash();
}

function createSlider() {
	slider = document.createElement("input");
	slider.type = "range";
	slider.min = 0;
	slider.max = 100;
	slider.value = 75;
	slider.style.position = "fixed";
	slider.style.bottom = "18px";
	slider.style.width = "80%";
	slider.style.marginLeft = "10%";
	body.appendChild(slider);
	slider.addEventListener('input', setInterval, true);
}

function getElemById(id) {
	return document.getElementById(id);
}

function initSplash() {
	var div = getElemById('splash');
	div.style.left = (window.innerWidth - splash.offsetWidth) / 2 + 'px';
	div.style.top = (window.innerHeight - splash.offsetHeight) / 2 + 'px';
	div.addEventListener('click', function () {
		div.style.visibility = 'hidden';
	}, true);
	getElemById('wiki').addEventListener('click', function (e) {
		e.stopPropagation();
		e.cancelBubble = true;
	}, true);
}

function keyDown(e) {
	if (e.keyCode == 32) { //space
		toggleClock();
	}
}

function onTouch(e) {
	e.preventDefault();
	addPixel(e.changedTouches[0].pageX, e.changedTouches[0].pageY);
}

function onRightClick(e) {
	e.preventDefault();
	toggleClock();
	return false;
}

function onDblClick(e) {
	reset(e);
	getElemById('splash').style.visibility = 'visible';
}

function mouseDown(e) {
	currentPos.x = -1;
	currentPos.y = -1;
	eAddPixel(e);
	canvas.addEventListener('mousemove', eAddPixel, true);
}

function mouseUp(e) {
	canvas.removeEventListener('mousemove', eAddPixel, true);
}

function setInterval() {
	if (slider.value == slider.min) {
		interval = 1e16;
		isRunning = false;
	} else {
		interval = (slider.max - slider.value) * 5;
		if (isRunning) {
			clearTimeout(timerId);
			timerId = setTimeout(onTick, interval);
		} else {
			toggleClock();
		}
	}
}

var isRunning;
var timerId;
function toggleClock(isReset) {
	if (interval == 1e16) {
		return;
	}
	if (isRunning) {
		isRunning = false;
		clearTimeout(timerId);
	} else if (!isReset) {
		isRunning = true;
		onTick();
	}
}

function onTick() {
	if (isRunning) {
		evolve();
		drawMap();
		timerId = setTimeout(onTick, interval);
	}
}

var onTouchEnd = function () {
	var last = Date.now();
	return function senseDblTap(e) {
		var now = Date.now();
		var gap = now - last;
		last = now;
		if (gap < 500 && gap > 0) {
			onDblClick(e);
			event.preventDefault();
		}
	}
}();

function initMap() {
	map = new Array(wCount);
	for (var x = 0; x < wCount; x++) {
		map[x] = new Array(hCount);
	}
	map.each = (f) => {
		for (var x = 0; x < wCount; x++) {
			for (var y = 0; y < hCount; y++) {
				f(x, y);
			}
		}
	}
	reset();
}

function reset(e) {
	timerId && toggleClock(true);
	map.each((x, y) => { map[x][y] = 1 });
	drawMap();
}

function pressure(x, y) {
	if (noWrap && (y === 0 || y === yHigh || x === 0 || x === xHigh)) {
		return -1;
	}
	let count = 0;
	let T = y === 0 ? yHigh : y - 1;
	let B = y === yHigh ? 0 : y + 1;
	let L = x === 0 ? xHigh : x - 1;
	let R = x === xHigh ? 0 : x + 1;
	map[L][T] % 2 && ++count;
	map[L][y] % 2 && ++count;
	map[L][B] % 2 && ++count;
	map[x][T] % 2 && ++count;
	map[x][B] % 2 && ++count;
	map[R][T] % 2 && ++count;
	map[R][y] % 2 && ++count;
	map[R][B] % 2 && ++count;
	return count;
}

var evolve = function () {
	var grow = (x, y) => { map[x][y] += 2 }
	var stay = (x, y) => { map[x][y] && (map[x][y] = 3) }
	return function evolve() {
		map.each((x, y) => {
			var p = pressure(x, y);
			if (p === 3) {
				grow(x, y);
			} else if (p === 2) {
				stay(x, y);
			};
		})
	}
}();

function drawMap() {
	map.each((x, y) => {
		var state = map[x][y];
		if (state == 1) {
			map[x][y] = 0;
			drawPixel(x, y, 0);
		} else if (state > 1) {
			if (state == 2) {
				drawPixel(x, y, 1);
			}
			map[x][y] = 1;
		};
	})
}

function drawPixel(x, y, active) {
	ctx.fillStyle = active ? color1 : color2;
	ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
}

function eAddPixel(e) {
	addPixel(e.pageX, e.pageY);
}

var currentPos = { x: -1, y: -1 }
function addPixel(pageX, pageY) {
	var x = pageX - canvas.offsetLeft;
	var y = pageY - canvas.offsetTop;
	x = Math.floor(x / cellSize);
	x = Math.max(0, Math.min(x, xHigh));
	y = Math.floor(y / cellSize);
	y = Math.max(0, Math.min(y, yHigh));
	if (currentPos.x != x || currentPos.y != y) {
		currentPos.x = x;
		currentPos.y = y;
		map[x][y] = 1;
		drawPixel(x, y, 1);
	}
}