var params = require('./engineparams.js'),
	serialport = require('./engineserialport.js');

//------------------------------------------------------------------
// Functions
//------------------------------------------------------------------

function GCodeCmd (cmd) {

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
};

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	GCodeCmd: GCodeCmd
}
//------------------------------------------------------------------