let song;
let fft;
let amp;
let started = false;
let scrubbing = false;

const BAR_HEIGHT = 60;
const BTN_SIZE = 36;
const BTN_MARGIN = 20;
const SEEK_LEFT = BTN_SIZE + BTN_MARGIN * 3;
const SEEK_RIGHT_PAD = 80;

function preload() {
  song = loadSound("TheHeavyThing_experiment.mp3");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  fft = new p5.FFT();
  amp = new p5.Amplitude();
}

// --- transport bar helpers ---

function barY() {
  return height - BAR_HEIGHT;
}

function seekX() {
  return SEEK_LEFT;
}

function seekW() {
  return width - SEEK_LEFT - SEEK_RIGHT_PAD;
}

function inPlayBtn(x, y) {
  let cx = BTN_MARGIN + BTN_SIZE / 2;
  let cy = barY() + BAR_HEIGHT / 2;
  return dist(x, y, cx, cy) < BTN_SIZE / 2;
}

function inSeekBar(x, y) {
  let sy = barY() + BAR_HEIGHT / 2;
  return x >= seekX() && x <= seekX() + seekW() && abs(y - sy) < 12;
}

function seekToMouse() {
  let t = constrain((mouseX - seekX()) / seekW(), 0, 1);
  song.jump(t * song.duration());
}

function drawTransportBar() {
  // background strip
  noStroke();
  fill(20, 20, 20, 220);
  rect(0, barY(), width, BAR_HEIGHT);

  let cy = barY() + BAR_HEIGHT / 2;
  let isPlaying = song.isPlaying();

  // play/pause button
  let cx = BTN_MARGIN + BTN_SIZE / 2;
  fill(255);
  if (isPlaying) {
    // pause icon: two rectangles
    rect(cx - 10, cy - 10, 7, 20, 2);
    rect(cx + 3,  cy - 10, 7, 20, 2);
  } else {
    // play triangle
    triangle(cx - 7, cy - 11, cx - 7, cy + 11, cx + 11, cy);
  }

  // seek bar track
  let sw = seekW();
  let sx = seekX();
  stroke(80);
  strokeWeight(3);
  line(sx, cy, sx + sw, cy);

  // seek bar fill
  let progress = song.duration() > 0 ? song.currentTime() / song.duration() : 0;
  stroke(255);
  line(sx, cy, sx + sw * progress, cy);

  // scrub handle
  noStroke();
  fill(255);
  ellipse(sx + sw * progress, cy, 14);

  // time display
  let cur = formatTime(song.currentTime());
  let dur = formatTime(song.duration());
  fill(200);
  noStroke();
  textAlign(RIGHT, CENTER);
  textSize(13);
  text(cur + " / " + dur, width - 10, cy);
}

function formatTime(s) {
  let m = floor(s / 60);
  let sec = floor(s % 60);
  return m + ":" + nf(sec, 2);
}

// --- main ---

function draw() {
  background(0, 20);

  if (!started) {
    fill(255);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(20);
    text("click to start", width / 2, height / 2);
    return;
  }

  let volume = amp.getLevel();
  fft.analyze();
  let bass   = fft.getEnergy("bass");
  let treble = fft.getEnergy("treble");
  let size   = map(volume, 0, 0.3, 50, 500);

  fill(treble, 100, bass, 180);
  noStroke();
  ellipse(width / 2, height / 2, size);

  if (scrubbing) seekToMouse();

  drawTransportBar();
}

function mousePressed() {
  if (!started) {
    song.play();
    started = true;
    return;
  }

  if (inPlayBtn(mouseX, mouseY)) {
    song.isPlaying() ? song.pause() : song.play();
    return;
  }

  if (inSeekBar(mouseX, mouseY)) {
    scrubbing = true;
    seekToMouse();
  }
}

function mouseReleased() {
  scrubbing = false;
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
