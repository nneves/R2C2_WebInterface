var iserialport = require("serialport"),
	iSerialPort = iserialport.SerialPort, // Serial Port - Localize object constructor
	sp;

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------
function initialize (paramsGetSerialPort, paramsGetBaudRate) {

	if (paramsGetBaudRate === undefined) {
		paramsGetBaudRate = 115200;
		console.log('Serial Port Baudrate default value: '+paramsGetBaudRate);
	}

	// SerialPort object initialization
	sp = new iSerialPort(paramsGetSerialPort, {
	    baudrate: paramsGetBaudRate,
	    parser: iserialport.parsers.readline("\n")
	});

	// Register Serial Port RX callback
	sp.on("data", function (data) {
	   console.log("[Board TX] -> [Node.JS RX]: "+data);
	});
};

function write (cmd) {
	sp.write(cmd);
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