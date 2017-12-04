var c;
var ctx;
var map;
	
var P = 6 //pixel size
var W;
var H;
var wCount;
var hCount;

window.onload = function(){
	document.body.style.overflow = "hidden";
	W = window.innerWidth - 20;
	H = window.innerHeight - 20;
	wCount = Math.ceil(W/P)+1;
	hCount = Math.ceil(H/P)+1;
	c = document.createElement("canvas");
	c.width = W;
	c.height = H;
	c.style.border = "1px solid #d3d3d3";
	ctx = c.getContext("2d");
// 	c.addEventListener('dblclick', toggleClock, true);
	c.addEventListener('mousedown', mouseDown, true);
	c.addEventListener('mouseup', mouseUp, true);
	c.addEventListener('contextmenu', onRightClick, true);
	document.body.addEventListener('keydown', keyDown, true);
	document.body.appendChild(c);
	initMap();
}

function keyDown(e){
	if(e.keyCode==32){
		toggleClock();
	}
}

function onRightClick(e){
	e.preventDefault();
	reset();
	return false;
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

var cid;
function toggleClock(){
	cid = cid ? window.clearTimeout(cid) : onTick();
};

var flag = true;
function onTick(){
	evolve();
	drawMap();
	var interval = 20; //tick interval millisecs
	cid = window.setTimeout(onTick, interval);
}

function initMap(){
	map = new Array(wCount);
	for(var x=0; x<wCount; x++){
		map[x] = new Array(hCount);
	}
	map.each = (f)=>{
		for(var x=0; x<wCount; x++){
			for(var y=0; y<hCount; y++){
				f(x,y);
			}
		}
	}
	reset();
}

function reset(e){
	cid && toggleClock();
	map.each((x,y)=>{map[x][y]=0});
	drawMap();	
}

function pressure(x,y){
	var count = 0;
	if(x>0){
		map[x-1][y-1] % 2 && ++count;
		map[x-1][y]   % 2 && ++count;
		map[x-1][y+1] % 2 && ++count;
	}
	map[x][y-1] % 2 && ++count;
	map[x][y+1] % 2 && ++count;
	if(x<wCount-1){
		map[x+1][y-1] % 2 && ++count;
		map[x+1][y]   % 2 && ++count;
		map[x+1][y+1] % 2 && ++count;
	}
	return count;
}

function evolve(){
	function grow(x,y){
		map[x][y] += 2;
	}
	function stay(x,y){
		map[x][y] && (map[x][y] = 3);
	}
	map.each((x,y)=>{
		var p = pressure(x,y);
		if(p==2){
			grow(x,y);
		}else if(p==3){
			stay(x,y);
		};
	})
} 

function drawMap(){
	map.each((x,y)=>{
		map[x][y] = map[x][y] > 1 ? 1 : 0;
	});
	// flag = !flag;
	if(flag){
		map.each((x,y)=>{
			drawPixel(x,y,map[x][y]);
		})
	}
}

function drawPixel(x,y,active){
	ctx.fillStyle = active ? "white": "black";
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
		map[x][y] = 1;//map[x][y] ? 0 : 1;
		drawPixel(x,y,map[x][y]);
 	}
}