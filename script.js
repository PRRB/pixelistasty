/* written by P.B. - 2017 */
/* https://github.com/PhilRB/ */

// Settings
var cellSize = 9; //px
var interval = 50; //initial interval (ms)
var color1 = 'white';
var color2 = 'black';
var noWrap = false;
var randSeed = 0.3; //between 0 and 1

function testSpeed() {
	// param
	var saved = {
		cellSize: cellSize,
		noWrap: noWrap,
		randSeed: randSeed,
		wCount: wCount,
		hCount: hCount,
		xHigh: xHigh,
		yHigh: yHigh,
		interval: interval
	}
	cellSize = 2;
	noWrap = false;
	randSeed = 0.3;
	wCount = 673;
	hCount = 326;
	xHigh = 672;
	yHigh = 325;
	interval = 0;
	// setup
	toggleClock(true);
	initMap();
	// run test
	var testTime = 5000;
	function endTest() {
		toggleClock(true);
		console.log("generations per second: " + genCount/s);
	}
	var timerId = setTimeout(endTest, testTime);
	toggleClock();
	// end
	cellSize = saved.cellSize;
	noWrap = saved.noWrap;
	randSeed = saved.randSeed;
	wCount = saved.wCount;
	hCount = saved.hCount;
	xHigh = saved.xHigh;
	yHigh = saved.yHigh;
	interval = saved.interval;
	// results
	// 6.6 gen/s
}

// Globals
var body;
var slider;
var canvas;
var window;
var ctx;
var map;
var wCount, xHigh;
var hCount, yHigh;
var genCount;

window.onload = function () {
	window = window;
	body = document.body;
	body.style.overflow = "hidden";
	var W = window.innerWidth - 18;
	var H = window.innerHeight - 18;
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
	currentPx = null;
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
		genCount++;
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
		for (var y = 0; y < hCount; y++) {
			map[x][y] = new Pixel(x, y);
		}
	}
	map.each = (f) => {
		map.forEach((col) => {
			col.forEach((px) => {
				f(px);
			})
		})
	}
	map.each(orient);
	reset();
}

function orient(px) {
	var T = px.y === 0 ? yHigh : px.y - 1;
	var B = px.y === yHigh ? 0 : px.y + 1;
	var L = px.x === 0 ? xHigh : px.x - 1;
	var R = px.x === xHigh ? 0 : px.x + 1;
	px.adjuncts = [
		map[L][T],
		map[L][px.y],
		map[L][B],
		map[px.x][T],
		map[px.x][B],
		map[R][T],
		map[R][px.y],
		map[R][B]
	]
}

function reset(e) {
	timerId && toggleClock(true);
	map.each((px) => { px.reset() });
	drawMap();
	genCount = 0;
}

function evolve() {
	map.each((px) => { px.evolve() })
}

function drawMap() {
	map.each((px) => {
		if (px.change) {
			px.active = !px.active;
			drawPixel(px);
			px.change = false;
		}
	});
}

function seed() {
	return Math.random() > randSeed;
}

function Pixel(x, y) {
	this.x = x;
	this.y = y;
	this.left = x * cellSize;
	this.top = y * cellSize;
	this.isEdge = noWrap && (y === 0 || y === yHigh || x === 0 || x === xHigh);
	this.active = false;
	this.change = true;
	this.reset = () => { this.active = seed(); this.change = true };
	this.evolve = () => {
		if (this.isEdge) { return -1 };
		var p = 0;
		this.adjuncts.forEach((px) => { px.active && p++ })
		if (p === 3) {
			!this.active && (this.change = true); //grow
		} else if (p !== 2) {
			this.active && (this.change = true); //die
		}
	}
}

function drawPixel(px) {
	ctx.fillStyle = px.active ? color1 : color2;
	ctx.fillRect(px.left, px.top, cellSize, cellSize);
}

function eAddPixel(e) {
	addPixel(e.pageX, e.pageY);
}

var currentPx;
function addPixel(pageX, pageY) {
	var x = pageX - canvas.offsetLeft;
	var y = pageY - canvas.offsetTop;
	x = Math.floor(x / cellSize);
	x = Math.max(0, Math.min(x, xHigh));
	y = Math.floor(y / cellSize);
	y = Math.max(0, Math.min(y, yHigh));
	px = map[x][y];
	if (currentPx !== px) {
		currentPx = px;
		currentPx.active = true;
		drawPixel(currentPx);
	}
}