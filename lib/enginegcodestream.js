var fs = require('fs'),
	params = require('./engineparams.js'),
	serialport = require('./engineserialport.js'),
	evnt = require('./engineevents.js');

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------
params.initialize();

serialport.initialize(params.getSerialPort());

evnt.initialize();

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
}
var gcodedata = GCodeDataClass();

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------

evnt.getEventEmitter().on('getGCodeFileLinesCount', getGCodeFileLinesCount);
evnt.getEventEmitter().on('endGCodeFileLinesCount', endGCodeFileLinesCount);
evnt.getEventEmitter().on('getGCodeFileData', getGCodeFileData);
evnt.getEventEmitter().on('sendGCodeBlockData', sendGCodeBlockData);

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
		evnt.getEventEmitter().endGCodeFileLinesCount(igcodedata);	  
	});	
};

function endGCodeFileLinesCount (igcodedata) {

	console.log('GCODE file count lines: '+igcodedata.totalcounter.toString());
	// send event to trigger getGCodeFileLinesCount(..) function
	evnt.getEventEmitter().getGCodeFileData(igcodedata);	  
}

function getGCodeFileData (igcodedata) {

	igcodedata.readablestream = fs.createReadStream(igcodedata.filepath, {'bufferSize': 1 * 512});
	var internalcounter = 0;

	console.log('GCODE file send data: '+igcodedata.filepath);

	// set serialport new/additional (local) callback
	serialport.setCallback(spRxCallback);

	igcodedata.readablestream.setEncoding('utf8');

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
		evnt.getEventEmitter().sendGCodeBlockData(igcodedata);
	});

	igcodedata.readablestream.on('end', function() {		
	  console.log(igcodedata.filepath+' job terminated, sent '+igcodedata.totalcounter+' lines');
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
	if (params.getSerialPort().toUpperCase() === '/DEV/NULL') {

		setTimeout(function () {

			console.log('SerialPort simulated callback response (/dev/null): ok\r\n');
			// send event to trigger sendGCodeBlockData(..) function
			evnt.getEventEmitter().sendGCodeBlockData(igcodedata);
			
		}, 250);
	}
}

function spRxCallback (data) {

	console.log("spRxCallback: [Board TX] -> [Node.JS RX]: "+data);
	if (data.indexOf("ok") != -1) {
		// send event to trigger sendGCodeBlockData(..) function
		evnt.getEventEmitter().sendGCodeBlockData(gcodestream.getGCodeData());
	}
};

//------------------------------------------------------------------
// Getters, Setters
//------------------------------------------------------------------
function getGCodeData () {
	return gcodedata;
}

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	getGCodeData: getGCodeData
}
//------------------------------------------------------------------