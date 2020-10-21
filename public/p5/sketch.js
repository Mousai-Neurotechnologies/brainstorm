let url = 'https://mousai.azurewebsites.net/'

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
  createCanvas((3/4)*windowWidth, windowHeight);
  w = width + ellipse_size;
  dx = (TWO_PI / period) * xspacing;
  yvalues = new Array(200).fill(0);
  my_basetime = new Array(yvalues.length).fill(0);
  other_yvalues = new Array(yvalues.length).fill(0);
  other_basetime = new Array(yvalues.length).fill(0);

  socket = io.connect(url);
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
  signal, client_time, yvalues, my_basetime = processSignal(signal, client_time, yvalues, my_basetime, 'me', color('#FF76E9'))
  passed_signal,passed_time, other_yvalues, other_basetime= processSignal(passed_signal, passed_time, other_yvalues, other_basetime, 'you', color('#76BEFF'))
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
    bt.push(Date.now()-start_time)//t.shift())
  } else {
    yvals.push(null)
    bt.push(Date.now()-start_time) // bt.push(Date.now()-start_time)
  }
  return sig, t, yvals, bt
}

function renderWave(yvals,bt,usr,c) {
  // A simple way to draw the wave with an ellipse at each location
  for (let ind = 0; ind < yvals.length-1; ind++) {
    // c.setAlpha(100)
    stroke(c);
    strokeWeight(2)
    in_min = Math.min(...bt);
    in_max = Math.max(...bt);
    out_min = 0;
    out_max = windowWidth;
    t_inner = bt.map(x => (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min)
    
    y1 = yvals[ind]
    // Normal Plot Scaling
    push()
    scale(1, -1);
    line(t_inner[ind], y1, t_inner[ind+1], yvals[ind+1]);
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
  len = 1
  // start = Date.now()
  // t = Array.from({length: len*samplerate}, (_, index) => start - 1000);
  signal = bci.generateSignal([25, 50], [2, 4], samplerate, len);

  var data = {
    signal: signal,
    time: my_basetime
  }
  
  socket.emit('bci', data)
}
