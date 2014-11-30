
/*

Game loop:
 * Every frame, we need to move the timeline
 * Every frame, we need to shift the active block according to player input
 * Every 30 frames, we need to fall the active blocks
 *

*/

function init() {

  // Set up globals and constants
  WIDTH = $("#canvas").attr("width");
  HEIGHT = $("#canvas").attr("height");
  FRAMERATE = 300;
  KEYS = {97: 'a', 100: 'd'};
  g.c = $("#canvas")[0].getContext("2d");
  g.board = new Board(12, 8);
  g.input = undefined;

  // Initialize board state
  randomFill(g.board);
  g.board.fall();
  g.board.setActives([1,1,1,1]);
  g.board.draw();

  setInterval(loop, FRAMERATE);
}

function loop() {
  var activeMovement;
  switch (g.input) {
    case 'left':
      activeMovement = -1;
      break;
    case 'right':
      activeMovement = 1;
      break;
  }
  g.board.update(activeMovement);

  // Reset state
  g.input = undefined;
}

$(window).keypress(function(e) {
  var key = KEYS[e.which];
  if (key == 'a') {
    g.input = 'left';
  } else if (key == 'd') {
    g.input = 'right';
  }
});

function randomFill(board) {

  for (var i = 0; i < board.w; i++) {
    for (var j = 0; j < board.h; j++) {
      var r = Math.random();
      var color;
      if (r < 0.6) {
        color = 0;
      } else if (r < 0.8) {
        color = 1;
      } else {
        color = 2;
      }
      board.setColor(i, j, color);
    }
  }
}

function Board(w, h) {
  this.x = 60;
  this.y = 250;
  this.w = w;
  this.h = h;
  this.TILESIZE = 40;
  this.tiles = [];
  this.BUFFFER = 4;
  this.timeline = 0;
  this.actives_x = [];
  this.actives_y = [];
  for (var i = 0; i < w; i++) {
    this.tiles.push([])
    for (var j = 0; j < h; j++) {
      this.tiles[i].push(new Tile(i, j));
    }
  }
}

Board.prototype.update = function(activeMovement) {
  var changedColumns = [];

  // Tick timeline
  var timelineCol = this.updateTimeline();
  changedColumns.push(timelineCol);
  changedColumns.push((timelineCol+this.w-1)%this.w);

  // Move active blocks left or right
  var ch;
  switch (g.input) {
    case 'left':
      ch = this.moveActive(-1);
      break;
    case 'right':
      ch = this.moveActive(1);
      break;
  }
  changedColumns = changedColumns.concat(ch);

  // Update all changed columns
  for (var i = 0; i < changedColumns.length; i++) {
    this.draw(changedColumns[i]);
  }
};

Board.prototype.getActives = function() {
  var actives = [];
  for (var i = 0; i < this.actives_x.length; i++) {
    actives.push(this.tiles[this.actives_x[i]][this.actives_y[i]]);
  }
  return actives;
}

// Takes 1 for right, -1 for left. Returns array of changed columns.
Board.prototype.moveActive = function(direction) {

  // Ignore pushing the block past the border
  if (direction == 1 && this.actives_x[2] == this.w-1) {
    return [];
  } else if (direction == -1 && this.actives_x[0] == 0) {
    return [];
  }

  var changedColumns = [this.actives_x[0]-1, this.actives_x[0], this.actives_x[2], this.actives_x[2]+1];

  // Adjust every active coordinate
  for (var i = 0; i < this.actives_x.length; i++) {
    this.actives_x[i] += direction;
  }

  // Update the colors
  var actives = this.getActives();
  for (var i = 0; i < actives.length; i++) {
    this.setColor(this.actives_x[i], this.actives_y[i], this.actives_color[i]);
  }
  // Insert the empty space
  if (direction == 1) {
    this.setColor(this.actives_x[0]-direction, this.actives_y[0], 0);
    this.setColor(this.actives_x[1]-direction, this.actives_y[1], 0);
  } else {
    this.setColor(this.actives_x[2]-direction, this.actives_y[2], 0);
    this.setColor(this.actives_x[3]-direction, this.actives_y[3], 0);
  }
  return changedColumns;
}

Board.prototype.updateTimeline = function() {
  this.timeline = (this.timeline + 5) % (this.w*this.TILESIZE);
  return Math.floor(this.timeline / this.TILESIZE);
}

// Takes an array of color-numbers
Board.prototype.setActives = function(colors) {
  var x = 0;
  var y = 0;
  this.actives_x = [0+x, 0+x, 1+x, 1+x];
  this.actives_y = [0+y, 1+y, 0+y, 1+y];
  this.actives_color = colors;
  for (var i = 0; i < this.actives_x.length; i++) {
    this.setColor(this.actives_x[i], this.actives_y[i], colors[i]);
  }

}

Board.prototype.draw = function(col) {
  if (col == undefined) {
    g.c.fillRect(this.x, this.y, this.w*this.TILESIZE + 5, this.h*this.TILESIZE + 5);
    for (var i = 0; i < this.w; i++) {
      this.drawCol(i);
    }
  } else {
    this.drawCol(col);
  }
  this.drawTimeline();
};

Board.prototype.drawCol = function(col) {
  if (col < 0 || col == this.w) {
    console.log('Ignoring invalid column draw');
    return;
  }
  for (var j = 0; j < this.h; j++) {
    this.tiles[col][j].draw();
  }
};

Board.prototype.drawTimeline = function() {
  g.c.fillStyle = "#00FFFF";
  g.c.fillRect(this.x + this.timeline, this.y, 5, this.h*this.TILESIZE);
  g.c.fillStyle = "#000000";
}

Board.prototype.setColor = function(x, y, color) {

  // Ensure color is valid
  if (!Tile.prototype.validColor(color)) {
    console.error("Invalid color " + color);
    return;
  }

  // If coordinates are valid, set color
  if (x >= 0 && y >= 00 && x < this.w && y < this.h) {
    this.tiles[x][y].color = color;
  }

  // Otherwise error about invalid coordinates
  else {
    console.error("Invalid coordinate " + x + " " + y);
  }
}

Board.prototype.fall = function(col) {
  if (col == undefined) {
    for (var i = 0; i < this.w; i++) {
      this.fallCol(i);
    }
  } else {
    this.fallCol(col);
  }
}

Board.prototype.fallCol = function(column) {
  var filledBlocks = [];
  var emptyBlocks = [];
  for (var j = 0; j < this.h; j++) {
    var block = this.tiles[column][j];
    if (block.color == 0) {
      emptyBlocks.push(block.color);
    } else {
      filledBlocks.push(block.color);
    }
  }
  var newColors = emptyBlocks.concat(filledBlocks);
  for (var j = 0; j < this.h; j++) {
    this.tiles[column][j].color = newColors[j];
  }
  this.draw();
};

function Tile(x, y) {
  /* 0 = empty
   * 1 = blue
   * 2 = red
   */
  this.color = 0;
  this.border = 1;
  this.x = x;
  this.y = y;
  this.SIZE = 40;
  this.BORDERSIZE = 5;
}

Tile.prototype.validColor = function(n) {
  return n <= 2;
}

Tile.prototype.draw = function() {
  g.c.fillRect(this.x*this.SIZE + g.board.x, this.y*this.SIZE + g.board.y, this.SIZE, this.SIZE);
  if (this.color == 0)
    g.c.fillStyle = "#ffffff"
  else if (this.color == 1)
    g.c.fillStyle = "#aa0044";
  else if (this.color == 2)
    g.c.fillStyle = "#0044aa";
  else {
    g.c.fillStyle = "#FF00FF";
    console.error("Weird value of " + this.color + "for tile " + this.x + "," + this.y);
  }
  g.c.fillRect(this.x*this.SIZE + this.BORDERSIZE + g.board.x, this.y*this.SIZE + this.BORDERSIZE + g.board.y, this.SIZE - this.BORDERSIZE, this.SIZE - this.BORDERSIZE);
  g.c.fillStyle = "#000000";

};

function blockColors(tiles) {
  list = [];
  for (var i = 0; i < tiles.length; i++) {
    list.push(tiles[i].color);
  }
  return list;
}