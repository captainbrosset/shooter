var Engine = function(canvas) {
  this._playing = false;
  this._entities = [];
  this._canvas = canvas;
  this._ctx = this._canvas.getContext('2d');

  this._animLoop(this._loop.bind(this));

  this._debugEl = document.querySelector('#debug');
};

Engine.prototype._animLoop = function(render, element) {
  var lastFrame = +new Date;
  window.requestAnimFrame = (function() {
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function(callback) {
      window.setTimeout(callback, 1000 / 60);
    };
  })();

  function loop(now) {
    requestAnimFrame(loop, element);
    render(now - lastFrame);
    lastFrame = now;
  }

  loop(lastFrame);
};

Engine.prototype.play = function() {
  this._playing = true;
};

Engine.prototype.pause = function() {
  this._playing = false;
};

Engine.prototype.toggle = function() {
  if (this._playing) {
    this.pause();
  } else {
    this.play();
  }
};

Engine.prototype.addEntity = function(entity) {
  entity.engine = this;
  entity.ctx = this._ctx;
  this._entities.push(entity);
};

Engine.prototype._loop = function() {
  if (this._playing) {
    this._entities.forEach(function(entity, index, array) {
      if (entity.update() === false) {
        array.splice(index, 1);
      }
    }.bind(this));

    this._ctx.clearRect(0, 0, this._ctx.canvas.width, this._ctx.canvas.height);

    this._entities.forEach(function(entity) {
      entity.draw();
    }.bind(this));

    this._debugEl.innerHTML = this._entities.length + ' entities';
  }
};