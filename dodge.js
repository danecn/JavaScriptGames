(function() {
  "use strict";

  var Ball, accelRate, addRanking, blue, canvas, context, controlBlue, coulombConst, demo1, demo2, draw, epsiolon, evaluate, fps, frame, friction, gameOver, generateRed, getInput, getRanking, incRate, initialize, isGameOver, keyEventHandler, keyState, main, mode, modulo, mouseEventHandler, newGame, now, ontap, radius, randomPoint, rankData, rankMax, rankOrder, ranking, reds, replay, setOnTap, setRanking, time, toFunction, toString, touchEventHandler, touchRatio, touchState, touchend, touchmove, touchstart, update, version, wait, writeText;

  version = "10.0";

  radius = 0.01;

  fps = 25;

  incRate = 5 * fps;

  wait = fps;

  friction = 2;

  coulombConst = 0.0008;

  epsiolon = 0.1;

  accelRate = 0.004;

  touchRatio = 10;

  frame = blue = reds = mode = time = null;

  newGame = function() {
    initialize();
    mode = "newGame";
    draw();
    setOnTap(function() {
      time = now();
      main();
    });
  };

  main = function() {
    generateRed(randomPoint);
    controlBlue(getInput);
    update();
    mode = "main";
    draw();
    if (isGameOver()) {
      gameOver();
    } else {
      setTimeout(main, time - now());
    }
    setOnTap(function() {});
  };

  gameOver = function() {
    mode = "gameOver";
    draw();
    setOnTap(function() {});
    setOnTap(ranking, 1000);
  };

  ranking = function() {
    addRanking();
    mode = "ranking";
    draw();
    setOnTap(function() {});
    setOnTap(newGame, 1000);
  };

  ontap = function() {};

  setOnTap = function(func, delay) {
    if (delay == null) {
      delay = 0;
    }
    setTimeout((function() {
      return ontap = func;
    }), delay);
  };

  evaluate = function(generate, control) {
    initialize();
    while (true) {
      if (!generateRed(generate) || !controlBlue(control) || !update() || isGameOver()) {
        return frame;
      }
    }
  };

  replay = function(generate, control) {
    var intervalID;
    initialize();
    mode = "newGame";
    draw();
    if (typeof intervalID !== "undefined" && intervalID !== null) {
      clearInterval(intervalID);
    }
    intervalID = setInterval((function() {
      if (!generateRed(generate) || !controlBlue(control) || !update() || isGameOver()) {
        clearInterval(intervalID);
        mode = "gameOver";
        draw();
      } else {
        mode = "main";
        draw();
      }
    }), 1000 / fps);
  };

  initialize = function() {
    frame = 0;
    blue = new Ball("#00f", +1, 0, 0);
    reds = [new Ball("#f00", -1, -0.3, -0.3), new Ball("#f00", -1, +0.3, +0.3)];
  };

  update = function() {
    var k, l, len, len1, len2, m, red, red2;
    frame++;
    for (k = 0, len = reds.length; k < len; k++) {
      red = reds[k];
      red.coulomb(blue);
      for (l = 0, len1 = reds.length; l < len1; l++) {
        red2 = reds[l];
        red.coulomb(red2);
      }
    }
    blue.update();
    for (m = 0, len2 = reds.length; m < len2; m++) {
      red = reds[m];
      red.update();
    }
    if (time != null) {
      time += 1000 / fps;
    }
    return true;
  };

  isGameOver = function() {
    return reds.some(function(red) {
      return blue.isCaught(red);
    });
  };

  generateRed = function(func) {
    var coord;
    if ((frame + wait) % incRate === 0) {
      coord = func();
      if (coord != null) {
        reds.push(new Ball("#f00", -1, coord.x, coord.y, wait));
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  };

  randomPoint = function() {
    return {
      x: modulo(Math.random()),
        y: modulo(Math.random())
    };
  };

  controlBlue = function(func) {
    var accel, r;
    accel = func();
    if (accel != null) {
      r = Math.sqrt(accel.x * accel.x + accel.y * accel.y);
      if (r > 1) {
        accel.x /= r;
        accel.y /= r;
      }
      blue.dx += accelRate * accel.x;
      blue.dy += accelRate * accel.y;
      return true;
    } else {
      return false;
    }
  };

  getInput = function() {
    var id, t, x, y;
    x = y = 0;
    if (keyState[37]) {
      x--;
    }
    if (keyState[38]) {
      y--;
    }
    if (keyState[39]) {
      x++;
    }
    if (keyState[40]) {
      y++;
    }
    for (id in touchState) {
      t = touchState[id];
      x += (t.x - t.x0) / touchRatio;
      y += (t.y - t.y0) / touchRatio;
      t.x0 = t.x;
      t.y0 = t.y;
    }
    return {
      x: x,
        y: y
    };
  };

  Ball = (function() {
    function Ball(color1, charge, x1, y1, wait1) {
      this.color = color1;
      this.charge = charge;
      this.x = x1;
      this.y = y1;
      this.wait = wait1 != null ? wait1 : 0;
      this.dx = 0;
      this.dy = 0;
    }

    Ball.prototype.update = function() {
      var v;
      if (this.wait > 0) {
        this.wait--;
      } else {
        v = Math.sqrt(this.dx * this.dx + this.dy * this.dy);
        this.dx /= Math.exp(friction * v);
        this.dy /= Math.exp(friction * v);
        this.x = modulo(this.x + this.dx);
        this.y = modulo(this.y + this.dy);
      }
    };

    Ball.prototype.coulomb = function(ball) {
      var r, x, y;
      if (this.wait === 0 && ball.wait === 0) {
        x = 2 * Math.PI * (ball.x - this.x);
        y = 2 * Math.PI * (ball.y - this.y);
        r = Math.sqrt(2 - Math.cos(x) - Math.cos(y));
        if (r > 0) {
          this.dx -= coulombConst * this.charge * ball.charge * Math.sin(x) / r / (r * r + epsiolon);
          this.dy -= coulombConst * this.charge * ball.charge * Math.sin(y) / r / (r * r + epsiolon);
        }
      }
    };

    Ball.prototype.isCaught = function(ball) {
      var a, b, c, d, dx, dy, t, x, y;
      if (ball.wait === 0) {
        x = modulo(ball.x - this.x);
        y = modulo(ball.y - this.y);
        dx = ball.dx - this.dx;
        dy = ball.dy - this.dy;
        a = dx * dx + dy * dy;
        b = x * dx + y * dy;
        c = x * x + y * y;
        d = (radius + radius) * (radius + radius);
        if (b <= 0 && c <= d) {
          return true;
        } else if ((0 < b && b < a) && c - b * b / a <= d) {
          t = b / a;
          this.x -= t * this.dx;
          this.y -= t * this.dy;
          ball.x -= t * ball.dx;
          ball.y -= t * ball.dy;
          return true;
        } else {
          return false;
        }
      } else {
        return false;
      }
    };

    Ball.prototype.draw = function() {
      var i, j, k, l;
      for (i = k = -1; k <= 1; i = ++k) {
        for (j = l = -1; l <= 1; j = ++l) {
          context.fillStyle = this.wait % 2 === 0 ? this.color : "#fff";
          context.beginPath();
          context.arc(this.x + i, this.y + j, radius, 0, 2 * Math.PI);
          context.fill();
        }
      }
    };

    return Ball;

  })();

  keyState = {};

  keyEventHandler = function(event) {
    var down;
    down = event.type === "keydown";
    keyState[event.keyCode] = down;
    if (down) {
      ontap();
    }
  };

  addEventListener("keydown", keyEventHandler);

  addEventListener("keyup", keyEventHandler);

  touchState = {};

  touchstart = function(id, x, y) {
    setTimeout(ontap);
    touchState[id] = {
      x: x,
      y: y,
      x0: x,
      y0: y
    };
  };

  touchmove = function(id, x, y) {
    if (touchState[id] != null) {
      touchState[id].x = x;
      touchState[id].y = y;
    }
  };

  touchend = function(id) {
    if (touchState[id] != null) {
      delete touchState[id];
    }
  };

  mouseEventHandler = function(event) {
    switch (event.type) {
      case "mousedown":
        touchstart("mouse", event.clientX, event.clientY);
        break;
      case "mousemove":
        touchmove("mouse", event.clientX, event.clientY);
        break;
      case "mouseup":
        touchend("mouse");
    }
  };

  addEventListener("mousedown", mouseEventHandler);

  addEventListener("mousemove", mouseEventHandler);

  addEventListener("mouseup", mouseEventHandler);

  touchEventHandler = function(event) {
    var k, len, ref, t;
    event.preventDefault();
    ref = event.changedTouches;
    for (k = 0, len = ref.length; k < len; k++) {
      t = ref[k];
      switch (event.type) {
        case "touchstart":
          touchstart(t.identifier, t.clientX, t.clientY);
          break;
        case "touchmove":
          touchmove(t.identifier, t.clientX, t.clientY);
          break;
        case "touchend":
          touchend(t.identifier);
      }
    }
  };

  rankMax = 10;

  rankData = rankOrder = null;

  addRanking = function() {
    var i, k, ref, ref1;
    getRanking();
    rankOrder = 1;
    while (rankOrder <= rankMax && (rankData[rankOrder] != null) && rankData[rankOrder] > frame) {
      rankOrder++;
    }
    if (rankOrder <= rankMax) {
      for (i = k = ref = rankMax, ref1 = rankOrder; ref <= ref1 ? k < ref1 : k > ref1; i = ref <= ref1 ? ++k : --k) {
        rankData[i] = rankData[i - 1];
      }
      rankData[rankOrder] = frame;
    }
    setRanking();
  };

  getRanking = function() {
    if (localStorage.getItem("dodge.version") === version) {
      rankData = JSON.parse(localStorage.getItem("dodge.ranking"));
    } else {
      rankData = [];
    }
  };

  setRanking = function() {
    localStorage.setItem("dodge.version", version);
    localStorage.setItem("dodge.ranking", JSON.stringify(rankData));
  };

  canvas = document.getElementById("canvas");

  context = canvas.getContext("2d");

  draw = function() {
    var color, i, k, l, len, red, ref, scale;
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    scale = Math.floor(Math.min(canvas.width, canvas.height) / 1.4);
    context.setTransform(scale, 0, 0, scale, canvas.width / 2, canvas.height / 2);
    context.fillStyle = "#0f0";
    context.fillRect(-3 / 2, -3 / 2, 3, 3);
    context.lineWidth = 0.002;
    context.strokeStyle = "#0a0";
    context.strokeRect(-3 / 2, -1 / 2, 3, 1);
    context.strokeRect(-1 / 2, -3 / 2, 1, 3);
    writeText(toString(frame), 0.05, -1 / 2, -1 / 2, "right", "bottom", "#000");
    writeText("ver " + version, 0.04, 1 / 2, 1 / 2, "left", "top", "#000");
    blue.draw();
    for (k = 0, len = reds.length; k < len; k++) {
      red = reds[k];
      red.draw();
    }
    switch (mode) {
      case "newGame":
        writeText("Tap to Start", 0.08, 0, 0, "center", "middle", "#000");
        break;
      case "gameOver":
        writeText("Game Over", 0.08, 0, 0, "center", "middle", "#000");
        break;
      case "ranking":
        writeText("Ranking", 0.08, 0, -1 / 2, "center", "bottom", "#000");
        for (i = l = 1, ref = rankMax; 1 <= ref ? l <= ref : l >= ref; i = 1 <= ref ? ++l : --l) {
          if (rankData[i] != null) {
            color = i === rankOrder ? "#f00" : "#000";
            writeText(String(i), 0.8 / rankMax, -1 / 2, i / rankMax - 1 / 2, "left", "bottom", color);
            writeText(toString(rankData[i]), 0.8 / rankMax, 1 / 2, i / rankMax - 1 / 2, "right", "bottom", color);
          }
        }
    }
  };

  addEventListener("resize", draw);

  writeText = function(text, size, x, y, align, baseline, color) {
    context.save();
    context.transform(size / 10, 0, 0, size / 10, x, y);
    context.font = "10px Courier, monospace";
    context.textAlign = align;
    context.textBaseline = baseline;
    context.fillStyle = color;
    context.fillText(text, 0, 0);
    context.restore();
  };

  toString = function(f) {
    var t;
    t = f / fps;
    return (Math.floor(t)) + "." + (Math.floor(t * 10) % 10) + (Math.round(t * 100) % 10) + "s";
  };

  modulo = function(x) {
    return x - Math.round(x);
  };

  now = function() {
    return new Date().getTime();
  };

  toFunction = function(array) {
    var cnt;
    cnt = 0;
    return function() {
      return array[cnt++];
    };
  };

  demo1 = function() {
    var back, cnt, controlArray, countMax, dtheta, f, generateArray, i, k, l, length, m, n, ref, ref1, ref2, ref3, ref4, theta;
    length = 100 * fps;
    generateArray = [];
    for (i = k = 0, ref = length / incRate; 0 <= ref ? k < ref : k > ref; i = 0 <= ref ? ++k : --k) {
      generateArray[i] = randomPoint();
    }
    theta = 3 / 4 * Math.PI;
    controlArray = [];
    for (i = l = 0, ref1 = length; 0 <= ref1 ? l < ref1 : l > ref1; i = 0 <= ref1 ? ++l : --l) {
      controlArray[i] = {
        theta: theta,
        x: Math.cos(theta),
        y: Math.sin(theta)
      };
    }
    countMax = 100;
    dtheta = 1 / 4 * Math.PI;
    back = fps;
    for (cnt = m = 0, ref2 = countMax; 0 <= ref2 ? m < ref2 : m > ref2; cnt = 0 <= ref2 ? ++m : --m) {
      f = evaluate(toFunction(generateArray), toFunction(controlArray));
      theta = controlArray[f].theta + dtheta;
      for (i = n = ref3 = f - back, ref4 = length; ref3 <= ref4 ? n < ref4 : n > ref4; i = ref3 <= ref4 ? ++n : --n) {
        controlArray[i] = {
          theta: theta,
          x: Math.cos(theta),
          y: Math.sin(theta)
        };
      }
    }
    console.log(toString(evaluate(toFunction(generateArray), toFunction(controlArray))));
    initialize();
    mode = "newGame";
    draw();
    setOnTap(function() {
      return replay(toFunction(generateArray), toFunction(controlArray));
    });
  };

  demo2 = function() {
    var control;
    control = function() {
      var dx, dy, k, len, r, r0, red, x, x0, y, y0;
      x0 = y0 = dx = dy = null;
      r0 = Infinity;
      for (k = 0, len = reds.length; k < len; k++) {
        red = reds[k];
        x = modulo(red.x - blue.x);
        y = modulo(red.y - blue.y);
        r = Math.sqrt(x * x + y * y);
        if (r < r0) {
          x0 = x;
          y0 = y;
          r0 = r;
          dx = red.dx - blue.dx;
          dy = red.dy - blue.dy;
        }
      }
      if (x0 * dy - y0 * dx > 0) {
        return {
          x: +y0 / r0,
            y: -x0 / r0
        };
      } else {
        return {
          x: -y0 / r0,
            y: +x0 / r0
        };
      }
    };
    initialize();
    mode = "newGame";
    draw();
    setOnTap(function() {
      return replay(randomPoint, control);
    });
  };

  newGame();

})();
