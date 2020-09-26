let ip = '13.89.172.22'

let ellipse_size = 3;
let xspacing = ellipse_size; // Distance between each horizontal location
let w; // Width of entire wave
let theta = 0.0; // Start angle at 0
let amplitude = 75.0; // Height of wave
let period = 500.0; // How many pixels before the wave repeats
let dx; // Value for incrementing x
let yvalues; // Using an array to store height values for the wave
let basetime;

let button;
let signal = [];
let passed_signal = []
let passed_time = []
let other_yvalues;
let start_time = Date.now();
let first_sig = true;

function setup() {
  createCanvas(windowWidth, windowHeight);
  w = width + ellipse_size;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(floor(w / xspacing));
  my_basetime = new Array(yvalues.length);
  other_yvalues = new Array(yvalues.length);
  other_basetime = new Array(yvalues.length);

  socket = io.connect('http://' + ip + ':3000');
  socket.on('bci', passSignal);

  button = createButton('Generate Signal');
  button.position(19, 19);
  button.mousePressed(generateSignal);
}

function passSignal(data) {
  passed_signal = data.signal
  passed_time = data.time
}

function draw() {
  background(0);
  translate(0, height/2); 
  client_time = passed_time
  signal, client_time, yvalues, my_basetime = processSignal(signal, client_time, yvalues, my_basetime, 'me', color(255))
  passed_signal,passed_time, other_yvalues, other_basetime= processSignal(passed_signal, passed_time, other_yvalues, other_basetime, 'you', color(255,0,100))
}

function calcWave(sig,t,yvals,bt) {
  yvals.shift();
  bt.shift();
  if (sig.length > 0) {
    if (first_sig){
      start_time = Date.now();
      first_sig = false;
    }
    yvals.push(sig.shift())
    bt.push(t.shift())
  } else {
    yvals.push(null)
    bt.push(null)
  }
  return sig, t, yvals, bt
}

function renderWave(yvals,bt,usr,c) {
  // A simple way to draw the wave with an ellipse at each location
  for (let x = 0; x < yvals.length-1; x++) {
    stroke(c);
    x1 = x * xspacing
    y1 = yvals[x]
    // Normal Plot Scaling
    push()
    scale(1, -1);
    line(x1, y1, (x+1) * xspacing, yvals[x+1]);
    // Default p5 Scaling
    pop()
    // if ((x % 20) == 0 && usr=='you') {
    //   fill(255)
    //   stroke(255);
    //   text(round(y1),  x1, -3*height/12)
    //   text(round(((bt[x]/1000)*100))/100,  x1, -4*height/12)
    // }
  }
  // if (usr=='you') {
  // stroke(255);
  // text(round(((Date.now() - start_time)/1000)* 100)/100,  width/2, -5*height/12)
  // }
}

function processSignal(sig,t,yvals,bt, usr,col){
  sig, t, yvals, bt = calcWave(sig,t,yvals,bt);
  renderWave(yvals,bt,usr,col);
  return sig, t, yvals, bt
}

function generateSignal() {
  // Generate 1 second of sample data at 512 Hz
  // Contains 8 μV / 8 Hz and 4 μV / 17 Hz
  let samplerate = frameRate() ;
  signal = bci.generateSignal([25, 50], [2, 4], samplerate, 1);

  var data = {
    signal: signal,
    time: my_basetime
  }
  
  socket.emit('bci', data)
}