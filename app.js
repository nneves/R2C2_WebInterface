// R2C2 Remote Control WebInterface
// $ node server.js 8080 /dev/ttyACM0
// $ npm start (for testing, will use port 8080 and /dev/null interface)

var flatiron = require('flatiron'),
    path = require('path'),
    ecstatic = require('ecstatic'),
    app = flatiron.app,
    serialport = require("serialport"),
    tcpport = 8080,
    spdev = "/dev/ttyACM0";

// Processing parameters
if(process.argv[2] !== undefined && process.argv[2].trim() !== '') {
    tcpport = process.argv[2];
    console.log("Tcp/ip port parameter defined: "+tcpport);    
}
else {
    console.log("Using default tcp/ip port: "+tcpport);
}
if(process.argv[3] !== undefined && process.argv[3].trim() !== '') {
    spdev = process.argv[3];
    console.log("Serial Port device parameter defined: "+spdev);    
}
else {
    console.log("Using default Serial Port device: "+spdev);
}

// Serial Port - Localize object constructor
var SerialPort = serialport.SerialPort;

// SerialPort object initialization
var sp = new SerialPort(spdev, {
    baudrate: 115200,
    parser: serialport.parsers.readline("\n")
});

// Register Serial Port RX callback
sp.on("data", function (data) {
   console.log("R2C2 TX-> Node.JS RX: "+data);
});

// flatiron configurations
app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

// flatiron plugins
app.use(flatiron.plugins.http);

// flatiron - ecstatic (server resources from directory - html, css, js, images)
app.http.before = [
  ecstatic(__dirname + '/public')
];

//app.router.configure({ "strict": false });

// flatiron router - API for GCODE commands
app.router.get('/gcode/:cmd', function (cmd) {

	console.log('\r\nParsing REST gcode command: '+cmd);

	// decode SPACE and ; chars (previously encoded in client)
	var gcode = cmd.replace(/_/g, " ");
	gcode = gcode.replace(/--/g, ";");

	console.log('Decoded gcode command: '+gcode);

	/* 
	// Serial Port callback function already defined and in async mode, should only be used here for sync!
	//
	sp.on("data", function (data) {
	   console.log("RX-> "+data);
	   // need to bind callback/closure with response and send data from SP->RX to Http response 
	   // note: to make this to work sync may require some aditional/diferent thinking ...
	});
	*/

	// check if it contains a multiple gcode commands (will use ; as separator)
	if(gcode.indexOf(";") != -1) {

	    var gcode_array=gcode.split(";");
	    var gcode_cmd;

	    for(var i=0, len=gcode_array.length; i<len; i++) {
	        gcode_cmd=unescape(gcode_array[i].replace(/\+/g, " ")); // url decode
	        console.log("GCODE"+i.toString()+"="+gcode_cmd);
	        sp.write(gcode_cmd+"\r\n");
	    }
	}
	else {
	    var gcode0=gcode;
	    gcode0=unescape(gcode0.replace(/\+/g, " ")); // url decode
	    console.log("GCODE="+gcode0);
	    sp.write(gcode0+"\r\n");
	}

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();
	//return;
});

// launch app on tcpoprt
app.start(tcpport);
console.log('R2C2 WebInterface Server running on port '+tcpport);
