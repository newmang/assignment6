function Block(type)
{
  this.x = 4;
  this.y = 0;
  this.r = 0;
  this.type = type;

  this.cells = new Array();
  switch( this.type )
  {
    case 0:
      this.cells[0] = [ [-1,0], [0,0], [1,0], [2,0] ];
      this.cells[1] = [ [0,1], [0,0], [0,-1], [0,-2] ];
      this.cells[2] = this.cells[0];
      this.cells[3] = this.cells[1];
      this.color = "#FF0000";
      break;

    case 1:
      this.cells[0] = [ [-1,0], [0,0], [0,1], [1,1] ];
      this.cells[1] = [ [0,1], [0,0], [1,0], [1,-1] ];
      this.cells[2] = [ [1,0], [0,0], [0,-1], [-1,-1] ];
      this.cells[3] = [ [0,-1], [0,0], [-1,0], [-1,1] ];
      this.color = "#00FF00";
      break;

    case 2:
      this.cells[0] = [ [-1,0], [0,0], [1,0], [0,1] ];
      this.cells[1] = [ [0,1], [0,0], [0,-1], [1,0] ];
      this.cells[2] = [ [1,0], [0,0], [-1,0], [0,-1] ];
      this.cells[3] = [ [0,-1], [0,0], [0,1], [-1,0] ];
      this.color = "#0000FF";
      break;

    case 3:
      this.cells[0] = [ [-1,1], [0,1], [0,0], [1,0] ];
      this.cells[1] = [ [1,1], [1,0], [0,0], [0,-1] ];
      this.cells[2] = [ [1,-1], [0,-1], [0,0], [-1,0] ];
      this.cells[3] = [ [-1,-1], [-1,0], [0,0], [0,1] ];
      this.color = "#FFFF00";
      break;

    case 4:
      this.cells[0] = [ [-1,0], [0,0], [1,0], [-1,1] ];
      this.cells[1] = [ [0,1], [0,0], [0,-1], [1,1] ];
      this.cells[2] = [ [1,0], [0,0], [-1,0], [1,-1] ];
      this.cells[3] = [ [0,-1], [0,0], [0,1], [-1,-1] ];
      this.color = "#00FFFF";
      break;

    case 5:
      this.cells[0] = [ [-1,0], [0,0], [1,0], [1,1] ];
      this.cells[1] = [ [0,1], [0,0], [0,-1], [1,-1] ];
      this.cells[2] = [ [1,0], [0,0], [-1,0], [-1,-1] ];
      this.cells[3] = [ [0,-1], [0,0], [0,1], [-1,1] ];
      this.color = "#FF00FF";
      break;

    case 6:
      this.cells[0] = [ [0,-1], [1,-1], [0,0], [1,0] ];
      this.cells[1] = this.cells[0];
      this.cells[2] = this.cells[0];
      this.cells[3] = this.cells[0];
      this.color = "#999999";
      break;
  }
}

Block.prototype.draw = function(tetris, canvas) {
  for( var i = 0; i < this.cells[this.r].length; i++ ) {
    var y = this.y + this.cells[this.r][i][1];
    var x = this.x + this.cells[this.r][i][0];
    if( x>= 0 && x < tetris.width && y >= 0 && y < tetris.height )
      tetris.drawCell(x, y, this.color, canvas);
  }
};

Block.prototype.canMove = function(tetris, delta_x, delta_y) {
  var x_pos = this.x + delta_x;
  var y_pos = this.y + delta_y;

  var canMove = true;
  for( var i = 0; i<this.cells[this.r].length; i++ ) {
    var deadCol = tetris.deadCells[x_pos + this.cells[this.r][i][0]];
    if( deadCol && deadCol[y_pos + this.cells[this.r][i][1]] ) {
      canMove = false;
      break;
    }

    if( (y_pos + this.cells[this.r][i][1]) >= tetris.height ) {
      canMove = false;
      break;
    }

    if( (x_pos + this.cells[this.r][i][0]) < 0 || (x_pos + this.cells[this.r][i][0]) >= tetris.width ) {
      canMove = false;
      break;
    }
  }

  return canMove;
};

Block.prototype.move = function(delta_x, delta_y) {
  this.x += delta_x;
  this.y += delta_y;
};

Block.prototype.canRotate = function(tetris) {
  var rotation = this.r;
  if( this.r == 3 ) {
    this.r = 0;
  }
  else {
    ++this.r;
  }

  var moveable = this.canMove(tetris, 0, 0);
  this.r = rotation;

  return moveable;
};

Block.prototype.rotate = function() {
  if( this.r == 3 )
    this.r = 0;
  else
    ++this.r;
};

Block.prototype.kill = function(tetris) {
  // Transfer all the block's cells into the deadCells array
  for( var i = 0; i<this.cells[this.r].length; i++ ) {
    tetris.deadCells[this.x + this.cells[this.r][i][0]][this.y + this.cells[this.r][i][1]] = this.color;
  }
};