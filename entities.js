var Entity = function() {};
Entity.prototype = {
  engine: null,
  ctx: null,
  update: function() {},
  draw: function() {}
};

var util = {};
util.getColor = function() {
  var rgb = [0, 0, 0];
  rgb[Math.floor(Math.random() * 3)] = 255;
  return 'rgb(' + rgb.join(',') + ')';
};


var Background = function() {
  this._tileX = 10;
  this._tileY = 10;
  this._y = 0;
  this._speed = .5;
};
Background.prototype = new Entity;
Background.prototype.update = function() {
  this._y = (this._y + this._speed) % this._tileY;
};
Background.prototype.draw = function() {
  this.ctx.save();
  this.ctx.fillStyle = 'rgba(0,255,0,.5)';
  for (var i = 0; i < this.ctx.canvas.width; i += this._tileX) {
    this.ctx.fillRect(i, 0, 1, this.ctx.canvas.height);
  }
  for (var i = this._y; i < this.ctx.canvas.height; i += this._tileY) {
    this.ctx.fillRect(0, i, this.ctx.canvas.width, 1);
  }
  this.ctx.restore();
};


var Bullet = function(x, y, slope) {
  this._startX = x;
  this._y = y;
  this._slope = slope || 0;
  this._size = {
    w: 2,
    h: 10
  };
  this._speed = 15;
};
Bullet.prototype = new Entity;
Bullet.prototype.update = function() {
  this._y = this._y - this._speed;
  this._x = this._startX + (this._slope * (this.ctx.canvas.height - this._y));
  if (this._y < 0)  {
    return false;
  }
};
Bullet.prototype.draw = function() {
  this.ctx.save();
  this.ctx.fillStyle = util.getColor();
  this.ctx.fillRect(this._x, this._y, this._size.w, this._size.h);

  this.ctx.beginPath();
  this.ctx.moveTo(this._x + this._size.w/2, this._y + this._size.h - 5);
  this.ctx.lineTo(this._x + (this._size.w/2) + 2.5, this._y + this._size.h);
  this.ctx.lineTo(this._x + (this._size.w/2) - 2.5, this._y + this._size.h);
  this.ctx.fill();

  //this.ctx.fillRect(this._x - 3, this._y + 16, this._size.w + 6, 2);
  this.ctx.restore();
};


var Bomb = function(x, y, dir) {
  this._startX = x;
  this._y = y;
  this._r = 5;
  this._speed = 2;
  this._dir = dir || 1;
};
Bomb.prototype = new Entity;
Bomb.prototype.update = function() {
  this._y = this._y - this._speed;
  this._x = this._startX + 20 * Math.log(this.ctx.canvas.height - this._y) * this._dir;
  if (this._y < 0)  {
    return false;
  }
};
Bomb.prototype.draw = function() {
  this.ctx.save();
  this.ctx.fillStyle = util.getColor();
  this.ctx.beginPath();
  this.ctx.arc(this._x, this._y, this._r, 0, Math.PI * 2, true);
  this.ctx.closePath();
  this.ctx.fill();
  this.ctx.restore();
};


var Pad = function() {
  document.addEventListener('keydown', this);
  document.addEventListener('keyup', this);

  this._size = 15;
  this._dir = 0;
  this._pos = 0;
  this._acceleration = 20;
};
Pad.prototype = new Entity;

Pad.prototype.onLeftDown = function(e) {
  this._dir = -1;
  this._goingLeft = true;
  this._goingRight = false;
};

Pad.prototype.onRightDown = function(e) {
  this._dir = 1;
  this._goingLeft = false;
  this._goingRight = true;
};

Pad.prototype.onLeftUp = function(e) {
  this._goingLeft = false;
  if (this._goingRight) {
    this._dir = 1;
  } else {
    this._dir = 0;
  }
};

Pad.prototype.onRightUp = function(e) {
  this._goingRight = false;
  if (this._goingLeft) {
    this._dir = -1;
  } else {
    this._dir = 0;
  }
};

Pad.prototype.fireDouble = function() {
  this.engine.addEntity(new Bullet(this._pos, this.ctx.canvas.height - 20));
  this.engine.addEntity(new Bullet(this._pos + this._size, this.ctx.canvas.height - 20));
};

Pad.prototype.fireRainbow = function() {
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, -.2));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, -.15));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, -.1));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, -.05));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, .05));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, .1));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, .15));
  this.engine.addEntity(new Bullet(this._pos + this._size / 2, this.ctx.canvas.height - 20, .2));
};

Pad.prototype.bomb = function() {
  this.engine.addEntity(new Bomb(this._pos + (this._size / 2), this.ctx.canvas.height - 20));
  this.engine.addEntity(new Bomb(this._pos + (this._size / 2), this.ctx.canvas.height - 20, -1));
};

Pad.prototype.onSpaceDown = function(e) {
  this._firing = true;
};

Pad.prototype.onSpaceUp = function(e) {
  this._firing = false;
};

Pad.prototype.onCtrlDown = function(e) {
  this.bomb();
};

Pad.prototype.handleEvent = function(e) {
  if (e.type === 'keydown') {
    if (e.keyCode === 37) {
      this.onLeftDown(e);
    } else if (e.keyCode === 39) {
      this.onRightDown(e);
    } else if (e.keyCode === 32) {
      this.onSpaceDown(e);
    } else if (e.keyCode === 17) {
      this.onCtrlDown(e);
    }
  } else if (e.type === 'keyup') {
    if (e.keyCode === 37) {
      this.onLeftUp(e);
    } else if (e.keyCode === 39) {
      this.onRightUp(e);
    } else if (e.keyCode === 32) {
      this.onSpaceUp(e);
    }
  }
};

Pad.prototype.update = function() {
  var pos = this._pos + (this._dir * this._acceleration);
  if (this._dir === -1) {
    this._pos = Math.max(pos, 0);
  } else if (this._dir === 1) {
    this._pos = Math.min(pos, this.ctx.canvas.width - this._size);
  }

  if (this._firing) {
    this.fireRainbow();
  }
};

Pad.prototype.draw = function() {
  this.ctx.save();
  this.ctx.fillStyle = 'white';
  this.ctx.beginPath();
  this.ctx.moveTo(this._pos, this.ctx.canvas.height - (this._size / 2));
  this.ctx.lineTo(this._pos + this._size / 2, this.ctx.canvas.height - this._size);
  this.ctx.lineTo(this._pos + this._size, this.ctx.canvas.height - (this._size / 2));
  this.ctx.fill();

  this.ctx.restore();
};