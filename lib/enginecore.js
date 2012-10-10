var tcpport = 8080,
    spdev = "/dev/ttyACM0",
    serialport = require("serialport"),
    fs = require('fs');

//------------------------------------------------------------------
// Processing parameters
//------------------------------------------------------------------
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

//------------------------------------------------------------------
// Init
//------------------------------------------------------------------
// Serial Port - Localize object constructor
var SerialPort = serialport.SerialPort;

// SerialPort object initialization
var sp = new SerialPort(spdev, {
    baudrate: 115200,
    parser: serialport.parsers.readline("\n")
});

// Register Serial Port RX callback
sp.on("data", function (data) {
   console.log("[Board TX] -> [Node.JS RX]: "+data);
});

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------
function sendSerialPortCmd (spcmd) {
	sp.write(spcmd);
};

function parseGCodeCmd (cmd) {
	console.log('\r\nParsing REST gcode command: '+cmd);

	// decode SPACE and ; chars (previously encoded in client)
	var gcode = cmd.replace(/_/g, " ");
	gcode = gcode.replace(/--/g, ";");

	console.log('Decoded gcode command: '+gcode);

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
};

function streamGCodeFile (filename) {

	var filepath = process.cwd()+'/gcode/'+filename;
	console.log('Streaming GCODE file: '+filepath);

	var readableStream = fs.createReadStream(filepath, {'bufferSize': 1 * 1024});

	readableStream.setEncoding('utf8');

	readableStream.on('data', function(data) {
	  console.log('['+data+']');

	  readableStream.pause();
	  setTimeout(function () {
	  	console.log('WakeUp\r\n');
	  	readableStream.resume();
	  }, 1000);
	});

	readableStream.on('end', function() {
	  console.log('-- eof');
	});

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();	
};
//------------------------------------------------------------------
// Getters, Setters
//------------------------------------------------------------------
function getTcpPort () {
	return tcpport;
};

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	getTcpPort: getTcpPort,
	sendSerialPortCmd: sendSerialPortCmd,
	parseGCodeCmd: parseGCodeCmd,
	streamGCodeFile: streamGCodeFile
};
//------------------------------------------------------------------