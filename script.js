/* written by P.B. - 2017 */

var b;
var s;
var c;
var w;
var ctx;
var map;
	
var P = 8; //pixel size
var interval = 50; //tick interval millisecs
var wCount;
var hCount;

window.onload = function(){
	w = window;
	b = document.body;
	b.style.overflow = "hidden";
	var W = w.innerWidth - 18;
	var H = w.innerHeight - 18;
	wCount = Math.ceil(W/P)-1;
	hCount = Math.ceil(H/P)-1;
	c = document.createElement("canvas");
	c.width = wCount * P;
	c.height = hCount * P;
	c.style.display = "block";
	c.style.margin = "auto";
	c.style.border = "1px solid #d3d3d3";
	ctx = c.getContext("2d");
	c.addEventListener('dblclick', reset, true);
	c.addEventListener('mousedown', mouseDown, true);
	c.addEventListener('mouseup', mouseUp, true);
	c.addEventListener('contextmenu', onRightClick, true);
	b.addEventListener('keydown', keyDown, true);
	b.appendChild(c);
	initMap();
	createSlider();
	initSplash();
}

function createSlider(){
	s = document.createElement("input");
	s.type = "range";
	s.min = 0;
	s.max = 100;
	s.value = 75; 
	s.style.position = "fixed";
	s.style.bottom = "18px";
 	s.style.width = "80%";
	s.style.marginLeft = "10%";
	b.appendChild(s);
	s.addEventListener('input', setInterval, true);
}

function setInterval(){
	if(s.value == s.min){
		interval = 1e16;
	}else{
		interval = (s.max - s.value) * 5;
	}
}

function getId(id){
	return document.getElementById(id);
}

function initSplash(){
	var div = getId('splash');
	div.style.left = (w.innerWidth - splash.offsetWidth)/2 + 'px';
	div.style.top = (w.innerHeight - splash.offsetHeight)/2 + 'px';
	div.addEventListener('click', function(){
		b.removeChild(div)
	}, true);
 	getId('wiki').addEventListener('click', function(e){
		 e.stopPropagation();
		 e.cancelBubble = true;
	}, true);
}

function keyDown(e){
	if(e.keyCode==32){
		toggleClock();
	}
}

function onRightClick(e){
	e.preventDefault();
	toggleClock();
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

// var tickCount;
var cid;
function toggleClock(state){
	// tickCount = 0;
	cid = cid ? window.clearTimeout(cid) : onTick();
};

var flag = true;
function onTick(){
	evolve();
	drawMap();
	cid = window.setTimeout(onTick, interval);
	// if(++tickCount==300){toggleClock()};
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
	map.each((x,y)=>{map[x][y]=1 });
	drawMap();	
}

function pressure(x,y){
	var count = 0;
	if(y==0||y==hCount-1||x==0||x==wCount-1){
		return -1;
	}
	map[x-1][y-1] % 2 && ++count;
	map[x-1][y]   % 2 && ++count;
	map[x-1][y+1] % 2 && ++count;
	map[x][y-1] % 2 && ++count;
	map[x][y+1] % 2 && ++count;
	map[x+1][y-1] % 2 && ++count;
	map[x+1][y]   % 2 && ++count;
	map[x+1][y+1] % 2 && ++count;
	return count;
}

var evolve = function(){
	var grow = (x,y)=>{map[x][y] += 2}
	var stay = (x,y)=>{map[x][y] && (map[x][y] = 3)}
	return function(){
			map.each((x,y)=>{
			var p = pressure(x,y);
			if(p==3){
				grow(x,y);
			}else if(p==2){
				stay(x,y);
			};
		})
	}
}();

function drawMap(){
	map.each((x,y)=>{
		var state = map[x][y];
		if(state==1){
			map[x][y] = 0;
 			flag && drawPixel(x,y,0);
		}else if(state>1){
			if(state==2){
 				flag && drawPixel(x,y,1);
			}
			map[x][y] = 1;	
		};
	})
}

function drawPixel(x,y,active){
	ctx.fillStyle = active ? "white" : "black";
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
	x = Math.max(0,Math.min(x,wCount-1));
	y = Math.floor(y/P);
	y = Math.max(0,Math.min(y,hCount-1));
 	if(curP.x != x || curP.y != y){
		curP.x = x;
		curP.y = y;
		map[x][y] = 1;
		drawPixel(x,y,1);
 	}
}