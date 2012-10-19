var params = require('./engineparams.js'),
	serialport = require('./engineserialport.js'),
	evnt = require('./engineevents.js'),
	gcodestream = require('./enginegcodestream.js'),
	gcodeparser = require('./enginegcodeparser.js');

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------
params.initialize();

serialport.initialize(params.getSerialPort());

evnt.initialize();

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------
function sendSerialPortCmd (spcmd) {
	serialport.write(spcmd);
};

function parseGCodeCmd (cmd) {
	
	gcodeparser.GCodeCmd(cmd);

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();
};

function streamGCodeFile (filename) {

	gcodestream.getGCodeData().filepath = process.cwd()+'/gcode/'+filename;
	console.log('Streaming GCODE file: '+gcodestream.getGCodeData().filepath);

	// send event to trigger getGCodeFileLinesCount(..) function
	evnt.getEventEmitter().getGCodeFileLinesCount(gcodestream.getGCodeData());

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();	
};

//------------------------------------------------------------------
// Getters, Setters
//------------------------------------------------------------------
function getTcpPort () {
	return params.getTcpPort();
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