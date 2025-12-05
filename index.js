// Enhanced countdown timer with circular mascot track
var remainingMs = 60000;
var totalDurationMs = 60000;
var isBlink = false;
var isLight = true;
var isRun = false;
var isWarned = false;
var handler = null;
var lastTickTime = null;
var audioRemind = null;
var audioEnd = null;
var startAngle = -90;

var show, adjust, toggle, reset, blink, tick, resize, updateMascots, applyCustomTime, formatTime, updateDisplay, setTimer;

var newAudio = function (file) {
  var node = new Audio();
  node.src = file;
  node.loop = false;
  node.load();
  document.body.appendChild(node);
  return node;
};

var soundToggle = function (des, state) {
  if (!des) {
    return null;
  }
  if (state) {
    return des.play();
  }
  des.currentTime = 0;
  des.pause();
  return des;
};

show = function () {
  return $('.fbtn').css('opacity', 1.0);
};

formatTime = function (ms) {
  var totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  var hours = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds % 3600) / 60);
  var seconds = totalSeconds % 60;
  var pad = function (n) {
    return (n < 10 ? '0' : '') + n;
  };
  return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
};

setTimer = function (ms) {
  remainingMs = Math.max(0, ms);
  if (!isRun) {
    totalDurationMs = remainingMs || 1000;
  }
  isWarned = remainingMs <= 60000 ? isWarned : false;
  if (!isWarned) {
    soundToggle(audioRemind, false);
  }
  return updateDisplay();
};

adjust = function (seconds) {
  if (isBlink) {
    return;
  }
  var delta = seconds * 1000;
  remainingMs = Math.max(0, remainingMs + delta);
  if (!isRun) {
    totalDurationMs = remainingMs || 1000;
  } else {
    totalDurationMs = Math.max(totalDurationMs + delta, remainingMs || 1000);
  }
  isWarned = remainingMs <= 60000 ? isWarned : false;
  if (!isWarned) {
    soundToggle(audioRemind, false);
  }
  return updateDisplay();
};

applyCustomTime = function () {
  var hours = parseInt($('#hoursInput').val(), 10) || 0;
  var minutes = parseInt($('#minutesInput').val(), 10) || 0;
  var seconds = parseInt($('#secondsInput').val(), 10) || 0;
  var totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
  if (totalSeconds < 0) {
    totalSeconds = 0;
  }
  isBlink = false;
  isWarned = false;
  $('#timer').css('color', '#f3fbff');
  return setTimer(totalSeconds * 1000);
};

toggle = function () {
  if (isRun) {
    isRun = false;
    $('#toggle').text('RUN');
    if (handler) {
      clearInterval(handler);
      handler = null;
    }
    lastTickTime = null;
    soundToggle(audioEnd, false);
    soundToggle(audioRemind, false);
    return;
  }

  if (isBlink) {
    isBlink = false;
    $('#timer').css('color', '#f3fbff');
    soundToggle(audioEnd, false);
  }
  if (remainingMs === 0) {
    remainingMs = totalDurationMs || 1000;
  }
  if (totalDurationMs === 0) {
    totalDurationMs = remainingMs || 1000;
  }
  isWarned = remainingMs <= 60000 ? isWarned : false;
  if (!isWarned) {
    soundToggle(audioRemind, false);
  }

  isRun = true;
  $('#toggle').text('STOP');
  lastTickTime = new Date().getTime();
  if (handler) {
    clearInterval(handler);
  }
  handler = setInterval(function () {
    if (isBlink) {
      return blink();
    }
    return tick();
  }, 100);
};

reset = function () {
  if (handler) {
    clearInterval(handler);
    handler = null;
  }
  isBlink = false;
  isRun = false;
  isLight = true;
  isWarned = false;
  lastTickTime = null;
  remainingMs = 60000;
  totalDurationMs = 60000;
  $('#timer').css('color', '#f3fbff');
  $('#toggle').text('RUN');
  soundToggle(audioRemind, false);
  soundToggle(audioEnd, false);
  return updateDisplay();
};

blink = function () {
  isLight = !isLight;
  $('#timer').css('color', isLight ? '#f3fbff' : '#ff5252');
};

tick = function () {
  var now = new Date().getTime();
  if (lastTickTime === null) {
    lastTickTime = now;
  }
  var diff = now - lastTickTime;
  lastTickTime = now;
  remainingMs = Math.max(0, remainingMs - diff);
  if (remainingMs <= 60000 && !isWarned && remainingMs > 0) {
    soundToggle(audioRemind, true);
    isWarned = true;
  }
  if (remainingMs <= 55000 || remainingMs <= 0) {
    soundToggle(audioRemind, false);
  }
  if (remainingMs <= 0 && !isBlink) {
    remainingMs = 0;
    isBlink = true;
    isRun = false;
    $('#toggle').text('RUN');
    soundToggle(audioEnd, true);
    if (handler) {
      clearInterval(handler);
    }
    handler = setInterval(function () {
      return blink();
    }, 500);
  }
  return updateDisplay();
};

updateMascots = function () {
  var container = document.querySelector('.circle-area');
  var border = document.querySelector('.circle-border');
  var size = Math.min(container.clientWidth, container.clientHeight);
  var hydrant = document.getElementById('hydrant');
  var truck = document.getElementById('truck');
  var mascotSize = hydrant.getBoundingClientRect().width || 78;
  var borderWidth = border ? parseFloat(window.getComputedStyle(border).borderWidth) || 0 : 0;
  var radius = Math.max(0, (size / 2) - (mascotSize / 2) + (borderWidth / 2));
  var progress = totalDurationMs > 0 ? Math.min(1, Math.max(0, 1 - (remainingMs / totalDurationMs))) : 0;
  var truckAngle = startAngle + (progress * 360);

  var positionMascot = function (el, angle) {
    var transform = 'rotate(' + angle + 'deg) translate(' + radius + 'px) rotate(' + (-angle) + 'deg)';
    el.style.transform = transform;
    el.style.webkitTransform = transform;
  };

  positionMascot(hydrant, startAngle);
  positionMascot(truck, truckAngle);
};

updateDisplay = function () {
  $('#timer').text(formatTime(remainingMs));
  resize();
  return updateMascots();
};

resize = function () {
  var timer = $('#timer');
  var w = timer.width();
  var len = timer.text().length;
  if (len < 5) {
    len = 5;
  }
  timer.css('font-size', (1.6 * w / len) + 'px');
  return timer.css('line-height', timer.height() + 'px');
};

window.onload = function () {
  updateDisplay();
  audioRemind = newAudio('audio/smb_warning.mp3');
  audioEnd = newAudio('audio/smb_mariodie.mp3');
};

window.onresize = function () {
  return updateDisplay();
};
