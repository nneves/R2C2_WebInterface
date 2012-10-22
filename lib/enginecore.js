var params = require('./engineparams.js'),
	serialport = require('./engineserialport.js'),
	evnt = require('./engineevents.js'),
	gcodestream = require('./enginegcodestream.js'),
	gcodeparser = require('./enginegcodeparser.js');

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------
serialport.initialize(params.serialport, params.baudrate);

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------

function parseGCodeCmd (cmd) {
	
	gcodeparser.GCodeCmd(cmd);

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();
};

function streamGCodeFile (filename) {

	gcodestream.gcodedata.filepath = process.cwd()+'/gcode/'+filename;
	console.log('Streaming GCODE file: '+gcodestream.gcodedata.filepath);

	// send event to trigger getGCodeFileLinesCount(..) function
	evnt.emit.getGCodeFileLinesCount(gcodestream.gcodedata);

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();	
};

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	getTcpPort: params.tcpport,
	sendSerialPortCmd: serialport.write,
	parseGCodeCmd: parseGCodeCmd,
	streamGCodeFile: streamGCodeFile
};
//------------------------------------------------------------------