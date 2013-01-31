function Tetris(canvas, canvasPreview, scoreBoard){
  this.cellSize = 25;
  this.interval = 600;	// milliseconds
  this.width = 10;
  this.height = 17;
  this.canvas = canvas.getContext('2d');
  this.canvasElem = canvas;

  this.nextPiece = 0;
  this.prevWidth = 6;
  this.prevHeight = 4;
  this.canvasPreview = canvasPreview;
  this.scoreBoard = scoreBoard;
  this.score = 0;
  this.level = 0;
  this.lines = 0;
  this.timeHandle = null;

  // initialize the dead cell matrix (width X height)
  this.deadCells = new Array(this.width);
  for( var i = 0; i<this.deadCells.length; i++ ) {
    this.deadCells[i] = new Array(this.height);
  }
}

Tetris.prototype.drawCell = function(x, y, color, canvasCtx) {
  canvasCtx.fillStyle = color;
  canvasCtx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
};

Tetris.prototype.clearGrid = function(width, height, canvasCtx) {
  canvasCtx.fillStyle = "#FFCCCC";
  canvasCtx.fillRect(0, 0, width * this.cellSize, height * this.cellSize);
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

  // draw the active block
  this.activeBlock.draw(this, this.canvas);
};

Tetris.prototype.drawScore = function() {
  if( this.scoreBoard == -1 )
    return;

  this.scoreBoard.score.value = this.score;
  this.scoreBoard.lines.value = this.lines;
  this.scoreBoard.level.value = this.level;
};

Tetris.prototype.touch = function(e) {
  alert(e);
};

Tetris.prototype.click = function(e) {
  // Get relative "touch" position
  var gameEventX = e.originalEvent.touches[0].pageX - this.canvasElem.offsetLeft;
  var gameEventY = e.originalEvent.touches[0].pageY - this.canvasElem.offsetTop;

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

  // The boundingBox is just relative game cell offsets to the active block at this point
  // Turn them into pixels.
  boundingBox.minX = (this.activeBlock.x + boundingBox.minX) * this.cellSize;
  boundingBox.maxX = (this.activeBlock.x + boundingBox.maxX) * this.cellSize + this.cellSize;
  boundingBox.minY = (this.activeBlock.y + boundingBox.minY) * this.cellSize;
  boundingBox.maxY = (this.activeBlock.y +boundingBox.maxY) * this.cellSize + this.cellSize;

  if( gameEventX > boundingBox.minX && gameEventX < boundingBox.maxX && gameEventY > boundingBox.minY && gameEventY < boundingBox.maxY )
    this.rotate();
  else if( gameEventY > this.canvasElem.offsetHeight - (this.canvasElem.offsetHeight/5) ) {
    this.move(0, 1);
    }
  else if( gameEventX < this.activeBlock.x * this.cellSize ) {
    this.move(-1, 0);
    }
  else if( gameEventX > this.activeBlock.x * this.cellSize ) {
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
      this.interval = this.interval - (this.interval/4);

      var _this = this;
      this.timeHandle = setInterval(function(){ _this.tick(); }, this.interval);
    }

    this.drawScore();
  }

  return linesWon;
};

Tetris.prototype.gameOver = function() {
  // game lost
  clearInterval(this.timeHandle);
  alert("GAME OVER");
};

Tetris.prototype.chooseNextPiece = function() {
  this.nextPiece = this.randomBlock();

  if( this.canvasPreview == -1 )
    return;

  this.clearGrid(this.prevWidth, this.prevHeight, this.canvasPreview);

  var previewBlock = new Block(this.nextPiece);
  previewBlock.x = 2;
  previewBlock.y = 2;

  // certain blocks need better preview postions
  if( !this.nextPiece !== 0 && this.nextPiece !== 6 ) {
    --previewBlock.y;
  }

  // draw the block to the preview area
  if( this.canvasPreview != -1 ) {
    previewBlock.draw(this, this.canvasPreview);    
  }
}

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

Tetris.prototype.randomBlock = function() {
  return Math.floor(Math.random()*7);
};

Tetris.prototype.run = function() {
  // reset the score board
  this.score = 0;
  this.lines = 0;
  this.level = 0;
  this.drawScore();

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