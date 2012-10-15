var fs = require('fs'),
	events = require('events'),
	util = require('util'),
	params = require('./engineparams.js'),
	serialport = require('./engineserialport.js');

var gcode_linescounter = 0,
    gcode_array_block = [],
    gcode_array_strbuffer = "";

var sp_queue_total = 0,
	sp_queue_current = 0;

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------
serialport.initialize(params.getSerialPort());

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------
function sendSerialPortCmd (spcmd) {
	serialport.write(spcmd);
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
	        serialport.write(gcode_cmd+"\r\n");
	    }
	}
	else {
	    var gcode0=gcode;
	    gcode0=unescape(gcode0.replace(/\+/g, " ")); // url decode
	    console.log("GCODE="+gcode0);
	    serialport.write(gcode0+"\r\n");
	}

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();
};

function streamGCodeFile (filename) {

	var filepath = process.cwd()+'/gcode/'+filename;
	console.log('Streaming GCODE file: '+filepath);

	getGCodeFileLinesCount(filepath);
	// when readstream finishes to read gcode data lines, 
	// getGCodeFileData will then be called (to be replaced with eventEmitter)

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();	
};

function getGCodeFileLinesCount (filepath) {

	var countfiledatalines = 0;
	console.log('GCODE file count lines: '+filepath);

	var readableStream = fs.createReadStream(filepath, {'bufferSize': 1 * 512});

	readableStream.setEncoding('utf8');

	readableStream.on('data', function(data) {

	  countfiledatalines += (data.match(/\n/g)||[]).length;
	});

	readableStream.on('end', function() {
	  //console.log(filepath+' contains '+countfiledatalines+' lines');
	  getGCodeFileData(filepath, countfiledatalines)
	});	
};

function getGCodeFileData (filepath, countfiledatalines) {

	var readableStream = fs.createReadStream(filepath, {'bufferSize': 1 * 512});
	var internalcounter = 0;
	var percent = 0.0;

	// set serialport new callback
	serialport.setCallback(spRxCallback);

	readableStream.setEncoding('utf8');

	readableStream.on('data', function(data) {
	  //console.log('['+data+']\r\n');
	  
	  internalcounter = (data.match(/\n/g)||[]).length;
	  gcode_linescounter += internalcounter;
	  percent = (gcode_linescounter/countfiledatalines)*100.0;
	  //console.log(percent+'\%\r\n');

	  // pause stream read
	  readableStream.pause();

	  gcode_array_block = data.split("\n");
	  if (gcode_array_block.length > 0)
	  	gcode_array_block[0] = gcode_array_strbuffer + gcode_array_block[0];

	  gcode_array_strbuffer = "";
	  if (gcode_array_block.length > 1) {
	  	gcode_array_strbuffer = gcode_array_block[gcode_array_block.length - 1];
	  	gcode_array_block.splice(gcode_array_block.length - 1);
	  }

	  sp_queue_total = gcode_array_block.length,
	  sp_queue_current = 0;

	  // send gcode to serialport
	  serialport.write(';dummytrigger');
/*	  
	  for(var i=0; i<=(gcode_array_block.length - 1); i++) {
	  	console.log(gcode_array_block[i]);
	  	serialport.write(gcode_array_block[i]);

	  	// still require serial port write flow control
	  	// will require to send only a few gcode lines and wait for printer response [WIP]
	  }
*/

	  // set timer to resume stream read
	  /*
	  setTimeout(function () {
	  	console.log('\r\nGCode Stream Read WakeUp\r\n');
	  	readableStream.resume();
	  }, 5000); */

	});

	readableStream.on('end', function() {
	  console.log(filepath+' contains '+countfiledatalines+' lines');
	});
};

function spRxCallback (data) {
	console.log("spRxCallback: [Board TX] -> [Node.JS RX]: "+data);
	if (data.indexOf("ok") != -1) {
		// checks if all queue lines were sent
		if (sp_queue_current == sp_queue_total - 1) {
	  		sp_queue_total = 0,
	  		sp_queue_current = 0;	
	  		//readableStream.resume();		
		}

		console.log(gcode_array_block[sp_queue_current]);
	  	serialport.write(gcode_array_block[sp_queue_current]);
		sp_queue_current += 1;
	}
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