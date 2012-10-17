var fs = require('fs'),
	eventemitter = require('events').EventEmitter,
	util = require('util'),
	params = require('./engineparams.js'),
	serialport = require('./engineserialport.js');

var gcode_readablestream,
	gcode_linescounter = 0,
    gcode_array_block = [],
    gcode_array_strbuffer = "";

var sp_queue_total = 0,
	sp_queue_current = 0;

//------------------------------------------------------------------
// Event Emitter
//------------------------------------------------------------------
var EVTClass = function() {

	//var eventemit = EVTClass();
	if(!(this instanceof arguments.callee)) {
		console.log("Auto create and return object!");
		return new arguments.callee();
	}
	console.log("Creating EVTClass object.");
}
util.inherits(EVTClass, eventemitter);

EVTClass.prototype.getGCodeFileLinesCount = function (filepath) {

	this.emit('getGCodeFileLinesCount', filepath);
}

EVTClass.prototype.endGCodeFileLinesCount = function (filepath, count) {

	this.emit('endGCodeFileLinesCount', filepath, count);
}

EVTClass.prototype.getGCodeFileData = function (filepath, countfiledatalines) {

	this.emit('getGCodeFileData', filepath, countfiledatalines);
}

EVTClass.prototype.sendGCodeBlockData = function () {

	this.emit('sendGCodeBlockData');
}

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------
serialport.initialize(params.getSerialPort());

var eventemit = EVTClass();

eventemit.on('getGCodeFileLinesCount', getGCodeFileLinesCount);

eventemit.on('endGCodeFileLinesCount', endGCodeFileLinesCount);

eventemit.on('getGCodeFileData', getGCodeFileData);

eventemit.on('sendGCodeBlockData', sendGCodeBlockData);

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

	// send event to trigger getGCodeFileLinesCount(..) function
	eventemit.getGCodeFileLinesCount(filepath);

	// responding back to the brower request
	this.res.writeHead(200, {'Content-Type':'text/plain'});
	this.res.write('ACK');
	this.res.end();	
};

function getGCodeFileLinesCount (filepath) {

	var countfiledatalines = 0;
	console.log('GCODE file count lines: '+filepath);

	var localReadableStream = fs.createReadStream(filepath, {'bufferSize': 1 * 512});

	localReadableStream.setEncoding('utf8');

	localReadableStream.on('data', function(data) {

	  countfiledatalines += (data.match(/\n/g)||[]).length;
	});

	localReadableStream.on('end', function() {
		// send event to trigger getGCodeFileLinesCount(..) function
		eventemit.endGCodeFileLinesCount(filepath, countfiledatalines);	  
	});	
};

function endGCodeFileLinesCount (filepath, count) {
	console.log('GCODE file count lines: '+count.toString());
	// send event to trigger getGCodeFileLinesCount(..) function
	eventemit.getGCodeFileData(filepath, count);	  
}

function getGCodeFileData (filepath, countfiledatalines) {

	gcode_readablestream = fs.createReadStream(filepath, {'bufferSize': 1 * 512});
	var internalcounter = 0;
	var percent = 0.0;

	console.log('GCODE file send data: '+filepath);

	// set serialport new/additional (local) callback
	serialport.setCallback(spRxCallback);

	gcode_readablestream.setEncoding('utf8');

	gcode_readablestream.on('data', function(data) {
		
		//console.log('['+data+']\r\n');
	  
		internalcounter = (data.match(/\n/g)||[]).length;
		gcode_linescounter += internalcounter;
		percent = (gcode_linescounter/countfiledatalines)*100.0;
		console.log(percent.toFixed(3)+'\%\r\n');

		// pause stream read
		gcode_readablestream.pause();

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

		// send event to trigger sendGCodeBlockData(..) function
		eventemit.sendGCodeBlockData();
	});

	gcode_readablestream.on('end', function() {
	  console.log(filepath+' job terminated, sent '+countfiledatalines+' lines');
	});
};

function sendGCodeBlockData () {
	// NOTE: 'NOT' passing sp_queue_current, sp_queue_total, gcode_array_block 
	// into parameters -> fetching local vars instead, need to check if parameters 
	// are duplicaded locally - avoid to duplicate gcode_array_block

	// checks if all queue lines were sent
	if (sp_queue_current == sp_queue_total) {
	  	sp_queue_total = 0,
	  	sp_queue_current = 0;	
	  	console.log('GCode ReadStream Resume\r\n');
	  	gcode_readablestream.resume();	
	  	return;	
	}

	console.log(gcode_array_block[sp_queue_current]);
	serialport.write(gcode_array_block[sp_queue_current]);
	sp_queue_current += 1;	

	// normal conditions: serialport (cnc/reprap/3dprinter) will responde 'ok' and spRxCallback() is triggered
	// special condition: /dev/null needs to emulate serialport callback (using setTimeout for additional delay)
	if (params.getSerialPort().toUpperCase() === '/DEV/NULL') {

		setTimeout(function () {

			console.log('SerialPort simulated callback response (/dev/null): ok\r\n');
			// send event to trigger sendGCodeBlockData(..) function
			eventemit.sendGCodeBlockData();
			
		}, 100);
	}
}

function spRxCallback (data) {

	console.log("spRxCallback: [Board TX] -> [Node.JS RX]: "+data);
	if (data.indexOf("ok") != -1) {
		// send event to trigger sendGCodeBlockData(..) function
		eventemit.sendGCodeBlockData();
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