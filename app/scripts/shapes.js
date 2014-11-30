function Triangle(x, y) {
  this.x = x;
  this.y = y;
  this.angle = 2;
  this.speed = 1;
  this._turn = 0.1;
  this.h = 10;
  this.w = 40;
}

Triangle.prototype.update = function() {
  this.x += this.speed*Math.cos(this.angle);
  this.y += this.speed*Math.sin(this.angle);
};

Triangle.prototype.turnLeft = function() {
  this.angle -= this._turn;
};

Triangle.prototype.turnRight = function() {
  this.angle += this._turn;
};

Triangle.prototype.moveTo = function(target) {
  var x = target.x;
  var y = target.y;
  console.log(x + "  " + y);
  console.log(this.x + "  " + this.y);
  var m;
  if (this.x != x) {
    m = (this.y - y) / (this.x - x);
    this.angle = Math.atan(m);
  } else {
    this.angle = 1.5*Math.PI;
  }
};

Triangle.prototype.draw = function() {

  c.save();
  c.fillStyle = "black";
  // Set up canvas so triangle is in the middle
  var x = this.x;
  var y = this.y;
  var h = this.h;
  var w = this.w;


  c.translate(x, y);

  // Draw the triangle
  c.beginPath();
  c.moveTo(x - w/2, y - h/2);
  c.lineTo(x - w/2, y + h/2);
  c.lineTo(x + w/2, y);
  c.lineTo(x - w/2, y - h/2);
  c.fill();
  c.fillStyle = "red";
  c.arc(x, y, 5, 0, 2*Math.PI);
  c.fill();
  c.fillStyle = "black";

  // Restore and finish
  c.restore();

};

function Ball(x, y) {
  this.x = x;
  this.y = y;
  this.radius = 20;
}

Ball.prototype.draw = function() {

  c.save();
  c.translate(this.x,this.y);

  // Draw the ball
  c.beginPath();
  c.arc(this.x, this.y, this.radius, 0, 2*Math.PI);
  c.fill();

  c.restore();
}