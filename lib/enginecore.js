var params = require('./engineparams.js'),
	serialport = require('./engineserialport.js'),
	evnt = require('./engineevents.js'),
	gcodestream = require('./enginegcodestream.js'),
	gcodeparser = require('./enginegcodeparser.js'),
	downloadr = require('./enginedownloadr.js');

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------
serialport.initialize(params.serialport, params.baudrate);

var dl = new downloadr.Downloader(); 

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

function stlDownload (url) {
	
	console.log(url);

	
	if(url.indexOf("%3A") != -1 && url.indexOf("%2F") != -1) {
		console.log("Found encoded URI");
		url = decodeURIComponent(url);
		console.log(url);
	}

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('Downloading file: '+url);
	this.res.end();	

	// download file
	dl.set_remote_file(url); 
	dl.set_local_path(__dirname+"/../stl/");
	dl.run();	
};

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	getTcpPort: params.tcpport,
	sendSerialPortCmd: serialport.write,
	parseGCodeCmd: parseGCodeCmd,
	streamGCodeFile: streamGCodeFile,
	stlDownload: stlDownload
};
//------------------------------------------------------------------