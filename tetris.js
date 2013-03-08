function Tetris(canvas){
  this.cellSize = 25;
  this.interval = 600;	// milliseconds
  this.originalInterval = this.interval;
  this.width = 10;
  this.height = 17;
  this.canvas = canvas.getContext('2d');
  this.canvasElem = canvas;

  this.nextPiece = 0;
  this.previewBlock = null;
  this.score = 0;
  this.level = 0;
  this.lines = 0;

  this.timeHandle = null;
}

Tetris.prototype.drawCell = function(x, y, color, canvasCtx) {
  canvasCtx.fillStyle = color;
  canvasCtx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
};

Tetris.prototype.clearGrid = function(width, height, canvasCtx) {
  canvasCtx.clearRect(0, 2, width * this.cellSize, height * this.cellSize - 2);
};

Tetris.prototype.draw = function() {
  this.clearGrid(this.width, this.height, this.canvas);

  // draw all dead cells
  for( var i = 0; i<this.deadCells.length; i++ ) {
      for( var j = 0; j<this.deadCells[i].length; j++ ) {
        if( this.deadCells[i][j] ) {
          this.drawCell(i, j, this.deadCells[i][j], this.canvas);
        }
      }
  }

  // draw the preview strip
  this.canvas.fillStyle = this.previewBlock.color;
  this.canvas.fillRect(0, 0, this.width * this.cellSize, 2);

  // draw the active block
  this.activeBlock.draw(this, this.canvas);
};

Tetris.prototype.touch = function(e) {
// Get absolute touch position in PIXELS
var gameEventX = e.touches[0].pageX;
var gameEventY = e.touches[0].pageY;

// Convert it to relative touch position in BLOCKS
gameEventX = Math.floor((gameEventX - this.canvasElem.offsetLeft) / this.cellSize);
gameEventY = Math.floor((gameEventY - this.canvasElem.offsetTop) / this.cellSize);

// Find the bounding box for the current rotation of the active block
var boundingBox = {};
boundingBox.minX = this.width;
boundingBox.maxX = 0;
boundingBox.minY = this.height;
boundingBox.maxY = 0;

var blockCells = this.activeBlock.cells[this.activeBlock.r];
for( var i = 0; i < blockCells.length; i++ ) {
  if( blockCells[i][0] < boundingBox.minX )
    boundingBox.minX = blockCells[i][0];

  if( blockCells[i][0] > boundingBox.maxX )
    boundingBox.maxX = blockCells[i][0];

  if( blockCells[i][1] < boundingBox.minY )
    boundingBox.minY = blockCells[i][1];

  if( blockCells[i][1] > boundingBox.maxY )
    boundingBox.maxY = blockCells[i][1];
}

// Change the bounding box from relative block offsets to actual block positions
boundingBox.minX += this.activeBlock.x;
boundingBox.maxX += this.activeBlock.x;
boundingBox.minY += this.activeBlock.y;
boundingBox.maxY += this.activeBlock.y;

// Extend the bounding box 1 unit in all directions only if its min/max is not near the edge
if( boundingBox.minX > 1 )
  boundingBox.minX -= 1;
if( boundingBox.maxX < this.width - 1 )
  boundingBox.maxX += 1;

boundingBox.minY -= 1;

// Now send the game commands based on where the player touched.
// Some rules are more complicated to make the control more user-friendly
if( gameEventX == 1 ) {
  this.move(-1, 0);	// Always move left if touch is on 1st column
  }
else if( gameEventX == this.width - 1 ) {
  this.move(1, 0);	// Always move right if touch is on last column
  }
if( gameEventX >= boundingBox.minX && gameEventX <= boundingBox.maxX && gameEventY >= boundingBox.minY && gameEventY <= boundingBox.maxY && gameEventY < this.height-2 ) {
  this.rotate();
  }
else if( gameEventX >= boundingBox.minX && gameEventX <= boundingBox.maxX && gameEventY >= boundingBox.maxY ) {
  this.move(0, 1);
  }
else if( gameEventX <= this.activeBlock.x ) {
  this.move(-1, 0);
  }
else if( gameEventX >= this.activeBlock.x ) {
  this.move(1, 0);
  }
};

Tetris.prototype.checkLines = function() {
  var lines = new Array();
  for( var i = 0; i<this.deadCells[0].length; i++ ) {
    for( var j = 0; j<this.deadCells.length; j++ ) {
      if( !this.deadCells[j][i] ) {
        break;
      }
      else if( j == this.deadCells.length-1 ) {
        lines.push(i);
      }
    }
  }

  // now remove the cells from their columns
  for( var i = 0; i<lines.length; i++ ) {
    for( var j = 0; j<this.deadCells.length; j++ ) {
      this.deadCells[j].splice(lines[i],1);
      this.deadCells[j].unshift(undefined);
    }
  }

  var linesWon = lines.length;
  
  // Update the score
  if( linesWon > 0 ) {
    this.score += linesWon * linesWon * 10;
    this.lines += linesWon;

    // make the game go faster every once in a while
    if( this.score > (this.level+1)*(this.level+1)*20 ) {
      ++this.level;

      clearInterval(this.timeHandle);
      this.interval = this.interval - (this.interval/10);	// changed it from 1/4th faster to 1/10th faster for phones

      var _this = this;
      this.timeHandle = setInterval(function(){ _this.tick(); }, this.interval);
    }

    if( linesWon == 4 ) {
      navigator.notification.beep(1);
    }
  }

  return linesWon;
};

Tetris.prototype.reset = function() {
  var testSize = window.innerWidth/this.width;
  if( testSize * window.innerHeight < window.innerHeight )
    this.cellSize = testSize;
  else
    this.cellSize = window.innerHeight/this.height;

  canvas.width = this.cellSize * this.width;
  canvas.height = this.cellSize * this.height;

  // reset stuff
  this.interval = this.originalInterval;
  this.score = 0;
  this.lines = 0;
  this.level = 0;
  window.localStorage.removeItem("score");
  window.localStorage.removeItem("level");
  window.localStorage.removeItem("lines");

  // initialize the dead cell matrix (width X height)
  this.deadCells = new Array(this.width);
  for( var i = 0; i<this.deadCells.length; i++ ) {
    this.deadCells[i] = new Array(this.height);
  }
};

Tetris.prototype.gameOver = function() {
  clearInterval(this.timeHandle);

  window.localStorage.setItem("score", this.score);
  window.localStorage.setItem("level", this.level);
  window.localStorage.setItem("lines", this.lines);
  window.location = "index.html";

//  var scoreText = "Score: " + this.score + "\nLines: " + this.lines + "\nLevel: " + this.level;
//  var _this = this;
//  navigator.notification.alert(scoreText, function(){ _this.run(); }, "Game Over", "Try Again");
};

Tetris.prototype.chooseNextPiece = function() {
  this.nextPiece = Math.floor(Math.random()*7);
  this.previewBlock = new Block(this.nextPiece);

  // draw the preview strip
  this.canvas.fillStyle = this.previewBlock.color;
  this.canvas.fillRect(0, 0, this.width * this.cellSize, 2);
};

Tetris.prototype.tick = function() {
  if( this.activeBlock.canMove(this, 0, 1) )
  {
    this.activeBlock.move(0, 1);
    this.draw();
  }
  else
  {
    if( this.activeBlock.y == 0 ) {
      this.gameOver();
    }
    else {
      this.activeBlock.kill(this);

      // check for completed lines
      this.checkLines();

      this.activeBlock = new Block(this.nextPiece);
      this.draw();

      this.chooseNextPiece();
    }
  }
};

Tetris.prototype.run = function() {
  this.reset();
  this.chooseNextPiece();

  this.activeBlock = new Block(this.nextPiece);
  this.draw();

  var _this = this;
  this.timeHandle = setInterval(function(){ _this.tick(); }, this.interval);
};

Tetris.prototype.move = function(delta_x, delta_y) {
  if( this.activeBlock.canMove(this, delta_x, delta_y) )
  {
    this.activeBlock.move(delta_x, delta_y);
    this.draw();
  }
};

Tetris.prototype.rotate = function() {
  if( this.activeBlock.canRotate(this) ) {
    this.activeBlock.rotate();
    this.draw();
  }
};