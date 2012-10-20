var iserialport = require("serialport");
	iSerialPort = iserialport.SerialPort; // Serial Port - Localize object constructor
	sp = undefined;

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------
function initialize (paramsSerialPort, paramsBaudRate) {

	// verify if object was already initialized
	if (sp !== undefined)
		return sp;

	if (paramsBaudRate === undefined) {
		paramsBaudRate = 115200;
		console.log('Serial Port Baudrate default value: '+paramsBaudRate);
	}

	// SerialPort object initialization
	sp = new iSerialPort(paramsSerialPort, {
	    baudrate: paramsBaudRate,
	    parser: iserialport.parsers.readline("\n")
	});

	// Register Serial Port RX callback
	sp.on("data", function (data) {
	   console.log("[Board TX] -> [Node.JS RX]: "+data);
	});
};

function write (cmd) {
	
	if (cmd === undefined || cmd.length == 0)
		return;
	
	// verifiy if cmd last char equals to '\n'
	var endchar = '';
	if (cmd.charAt(cmd.length-1) != '\n')
		endchar = '\n';

	//console.log('SerialPort Write: '+cmd+endchar);	

	// writes data to serialport
	sp.write(cmd+endchar);
};

function setCallback (cbfunc) {
	// Register (additional) Serial Port RX callback
	sp.on("data", cbfunc);
};

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	initialize: initialize,
	write: write,
	setCallback: setCallback
};
//------------------------------------------------------------------