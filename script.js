var c;
var ctx;
var map;

var P = 30;
var W;
var H;
var wCount;
var hCount;
var interval = 200;
var isFlag = false;

window.onload = function(){
	W = window.innerWidth - 25;
	H = window.innerHeight - 25;
	wCount = Math.ceil(W/P)+1;
	hCount = Math.ceil(H/P)+1;
	c = document.createElement("canvas");
	c.width = W;
	c.height = H;
	c.style.border = "1px solid #d3d3d3";
	ctx = c.getContext("2d");
	c.addEventListener('dblclick', toggleTimer, true);
	c.addEventListener('mousedown', mouseDown, true);
	c.addEventListener('mouseup', mouseUp, true);
	document.body.appendChild(c);
	initMap();
}

function mouseDown(e){
	curP.x = -1;
	curP.y = -1;
	addPixel(e);
	c.addEventListener('mousemove', addPixel, true);
}

function mouseUp(e){
	c.removeEventListener('mousemove', addPixel, true);
}

var toggleTimer = function(){
	var id;
	return function(){
		if(id){
			id = window.clearInterval(id);
		}else{
			id = window.setInterval(onTick, interval);	
		}
	}
}();

function onTick(){
	isFlag = !isFlag;
	drawMap();
}

function initMap(){
	map = new Array(wCount);
	for(var i=0; i<wCount; i++){
		map[i] = new Array(hCount);
	}
}

function drawMap(){
	for(var x=0; x<wCount; x++){
		for(var y=0; y<hCount; y++){
			drawPixel(x,y,map[x][y]);
		}
	}
}

function drawPixel(x,y,active){
	ctx.fillStyle = (!!active !== !!isFlag) ? "black": "white";
	ctx.fillRect(x*P,y*P,P,P);
}

function getSq(x,y){
	x -= x % P;
	y -= y % P;
}

var curP = {x:-1,y:-1}

function addPixel(e){
	var x = e.pageX - c.offsetLeft;  
	var y = e.pageY - c.offsetTop;
	x = Math.floor(x/P);
	y = Math.floor(y/P);
 	if(curP.x != x || curP.y != y){
		curP.x = x;
		curP.y = y;
		map[x][y] = !map[x][y];
		drawPixel(x,y,map[x][y]);
 	}
}

function rgb1(r,g,b){
	return "rgb("+Math.round(r*255)+","+Math.round(g*255)+","+Math.round(b*255)+")"
}