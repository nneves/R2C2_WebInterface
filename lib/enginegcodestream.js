var fs = require('fs'),
	params = require('./engineparams.js'),
	serialport = require('./engineserialport.js'),
	evnt = require('./engineevents.js'),
	stream = require('stream');

//------------------------------------------------------------------
// Class definition
//------------------------------------------------------------------
var GCodeDataClass = function() {

	if(!(this instanceof arguments.callee)) {
		console.log("Create GCodeDataClass and return object!");
		return new arguments.callee();
	}
	console.log("GCodeDataClass object.");

	this.filepath = "";
	this.linescounter = 0;
	this.totalcounter = 0;
	this.jobpercent = 0.0;
	this.readablestream;
    this.array_block = [];
    this.array_strbuffer = "";

	this.sp_queue_total = 0;
	this.sp_queue_current = 0;

	this.sp_flag_setcallback = false;
}
var gcodedata = GCodeDataClass();

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------

evnt.emit.on('getGCodeFileLinesCount', getGCodeFileLinesCount);
evnt.emit.on('endGCodeFileLinesCount', endGCodeFileLinesCount);
evnt.emit.on('getGCodeFileData', getGCodeFileData);
evnt.emit.on('sendGCodeBlockData', sendGCodeBlockData);

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------

function getGCodeFileLinesCount (igcodedata) {

	var nlines = 0;
	console.log('GCODE file count lines: '+igcodedata.filepath);

	var localReadableStream = fs.createReadStream(igcodedata.filepath, {'bufferSize': 1 * 512});

	localReadableStream.setEncoding('utf8');

	localReadableStream.on('data', function(data) {

	  nlines += (data.match(/\n/g)||[]).length;
	});

	localReadableStream.on('end', function() {

		igcodedata.totalcounter = nlines;
		// send event to trigger getGCodeFileLinesCount(..) function
		evnt.emit.endGCodeFileLinesCount(igcodedata);	  
	});	
};

function endGCodeFileLinesCount (igcodedata) {

	console.log('GCODE file count lines: '+igcodedata.totalcounter.toString());
	// send event to trigger getGCodeFileLinesCount(..) function
	evnt.emit.getGCodeFileData(igcodedata);	  
}

function getGCodeFileData (igcodedata) {

	delete igcodedata.readablestream;
	igcodedata.readablestream = new stream.Stream(),
	igcodedata.readablestream.readable = true;
	igcodedata.readablestream = fs.createReadStream(igcodedata.filepath, {'bufferSize': 1 * 512});
	igcodedata.readablestream.setEncoding('utf8');

	var internalcounter = 0;

	console.log('GCODE file send data: '+igcodedata.filepath);

	// set serialport new/additional (local) callback
	if (igcodedata.sp_flag_setcallback === false) {
		igcodedata.sp_flag_setcallback = true;
		serialport.setCallback(spRxCallback);
	}

	igcodedata.readablestream.on('data', function(data) {
		
		//console.log('['+data+']\r\n');
	  
		internalcounter = (data.match(/\n/g)||[]).length;
		igcodedata.linescounter += internalcounter;
		igcodedata.jobpercent = (igcodedata.linescounter/igcodedata.totalcounter)*100.0;
		console.log(igcodedata.jobpercent.toFixed(3)+'\%\r\n');

		// pause stream read
		igcodedata.readablestream.pause();

		igcodedata.array_block = data.split("\n");
		if (igcodedata.array_block.length > 0)
			igcodedata.array_block[0] = igcodedata.array_strbuffer + igcodedata.array_block[0];

		igcodedata.array_strbuffer = "";
		if (igcodedata.array_block.length > 1) {
			igcodedata.array_strbuffer = igcodedata.array_block[igcodedata.array_block.length - 1];
			igcodedata.array_block.splice(igcodedata.array_block.length - 1);
		}

		igcodedata.sp_queue_total = igcodedata.array_block.length,
		igcodedata.sp_queue_current = 0;

		// send event to trigger sendGCodeBlockData(..) function
		evnt.emit.sendGCodeBlockData(igcodedata);
	});

	igcodedata.readablestream.on('end', function() {		
		console.log(igcodedata.filepath+' job terminated, sent '+igcodedata.totalcounter+' lines');

		console.log('Reseting cached data ...');
		// reset gcode stream data
		igcodedata.filepath = "";
		igcodedata.linescounter = 0;
		igcodedata.totalcounter = 0;
		igcodedata.jobpercent = 0.0;

	    igcodedata.array_block = [];
	    igcodedata.array_strbuffer = "";

		igcodedata.sp_queue_total = 0;
		igcodedata.sp_queue_current = 0;

		// reset serialport additional (local) callback
		if (igcodedata.sp_flag_setcallback === true) {
			//igcodedata.sp_flag_setcallback = false;
			//serialport.resetCallback(spRxCallback);
		}					
	});
};

function sendGCodeBlockData (igcodedata) {

	// checks if all queue lines were sent
	if (igcodedata.sp_queue_current == igcodedata.sp_queue_total) {
	  	igcodedata.sp_queue_total = 0,
	  	igcodedata.sp_queue_current = 0;	
	  	console.log('GCode ReadStream Resume\r\n');
	  	igcodedata.readablestream.resume();	
	  	return;	
	}

	console.log(igcodedata.array_block[igcodedata.sp_queue_current]);
	serialport.write(igcodedata.array_block[igcodedata.sp_queue_current]);
	igcodedata.sp_queue_current += 1;	

	// normal conditions: serialport (cnc/reprap/3dprinter) will responde 'ok' and spRxCallback() is triggered
	// special condition: /dev/null needs to emulate serialport callback (using setTimeout for additional delay)
	if (params.serialport.toUpperCase() === '/DEV/NULL') {

		setTimeout(function () {

			console.log('SerialPort simulated callback response (/dev/null): ok\r\n');
			// send event to trigger sendGCodeBlockData(..) function
			evnt.emit.sendGCodeBlockData(igcodedata);
			
		}, 1 /*250*/);
	}
}

function spRxCallback (data) {

	console.log("GCode Stream Local spRxCallback: [Board_TX]->[Node.JS_RX]: "+data);
	if (data.indexOf("ok") != -1) {
		// send event to trigger sendGCodeBlockData(..) function
		evnt.emit.sendGCodeBlockData(gcodedata);
	}
};

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	gcodedata: gcodedata
}
//------------------------------------------------------------------