/* DEMO CODE
var r2c2_webinterface = new R2C2.WebInterface(); // explicit contructor call
or
var r2c2_webinterface = R2C2.WebInterface();

	<!-- Demo code to be used in the main HTML file -->
	<script type="text/javascript" src="javascripts/r2c2.js"></script>
	<script type="text/javascript">
		var r2c2_webinterface = R2C2.WebInterface();
	</script>
*/
//-----------------------------------------------------------------------------
var R2C2 = {};
//-----------------------------------------------------------------------------
R2C2.WebInterface = function () {
	//var r2c2_webinterface = R2C2.WebInterface();	
	if(!(this instanceof arguments.callee)) {
		console.log("Auto create and return object!");
		return new arguments.callee();
	}	
	console.log("Creating R2C2.WebInterface object.");

	//-------------------------------------------------------------------------
	this.posx = 0.00000;
    this.posy = 0.00000;
    this.posz = 0.00000;
};
//-----------------------------------------------------------------------------

//-----------------------------------------------------------------------------
// Public - R2C2 namespace Scope
//-----------------------------------------------------------------------------	
R2C2.WebInterface.prototype.sendCmd = function (cmd) {

	// internal ajax request object
	var sendReq = this._getXmlHttpRequestObject();	
	var cmd_alt = cmd.replace(/ /g, "_");
	    cmd_alt = cmd_alt.replace(/;/g, "--");
	var url_cmd = '/gcode/'+cmd_alt;

	if (sendReq.readyState == 4 || sendReq.readyState == 0) {
		sendReq.open("GET",url_cmd,true);
        sendReq.setRequestHeader('Accept','application/json');
        sendReq.setRequestHeader('Content-Type','text/xml');
		sendReq.onreadystatechange = this._sendCmdCB(url_cmd);
        console.log("-> AJAX cmd["+url_cmd+"]");
		sendReq.send(null);
	}	
};

R2C2.WebInterface.prototype.selectFile2Print = function (filename) {

	// internal ajax request object
	var sendReq = this._getXmlHttpRequestObject();	
	var url_cmd = '/gcodestream/'+filename;

	if (sendReq.readyState == 4 || sendReq.readyState == 0) {
		sendReq.open("GET",url_cmd,true);
        sendReq.setRequestHeader('Accept','application/json');
        sendReq.setRequestHeader('Content-Type','text/xml');
		sendReq.onreadystatechange = this._sendCmdCB(url_cmd);
        console.log("-> AJAX cmd["+url_cmd+"]");
		sendReq.send(null);
	}	
};

//-----------------------------------------------------------------------------	

//-----------------------------------------------------------------------------
// Private - R2C2 namespace Scope
//-----------------------------------------------------------------------------	
R2C2.WebInterface.prototype._getXmlHttpRequestObject = function () {

	if (window.XMLHttpRequest) {
		return new XMLHttpRequest();
	} else if(window.ActiveXObject) {
		return new ActiveXObject("Microsoft.XMLHTTP");
	} else {
		alert(
		'Status: Could not create XmlHttpRequest Object.' +
		'Consider upgrading your browser.');
	}
};
//-----------------------------------------------------------------------------	

R2C2.WebInterface.prototype._sendCmdCB = function (url) {
	return function() {
		if (this.readyState == 4 || this.readyState == 0) {
			console.log('<- AJAX cmd['+url+'] = '+this.responseText);
		}
	};
};
//-----------------------------------------------------------------------------	


//-----------------------------------------------------------------------------
// AUX - demo functionality
//-----------------------------------------------------------------------------

// auxiliar function to compose absolute gcode move command (just for testing)
R2C2.WebInterface.prototype.gcodeMove = function (coord, dir, jog, fr) {

	// moving X
	if(coord == 1) {
		if(dir == 1) {
			this.posx = this.posx + jog;
		}
		else if(dir == -1) {
			this.posx = this.posx - jog;
		}		
	}			
	else if(coord == 2) { // moving Y
		if(dir == 1) {
			this.posy = this.posy + jog;
		}
		else if(dir == -1) {
			this.posy = this.posy - jog;
		}		
	}
	else if(coord == 3) { // moving Z
		if(dir == 1) {
			this.posz = this.posz + jog;
		}
		else if(dir == -1) {
			this.posz = this.posz - jog;
		}		
	}

	var igcode = 	"G1 X"+this.posx.toFixed(6).toString(10)+
					" Y"+this.posy.toFixed(6).toString(10)+
					" Z"+this.posz.toFixed(6).toString(10)+
					" F"+fr.toString(10);

	//console.log("GCode Move Command: "+igcode);
	this.sendCmd(igcode);
};

R2C2.WebInterface.prototype.moveXPlus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	this.gcodeMove(1, 1, ijog, ifr);
}

R2C2.WebInterface.prototype.moveXMinus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	this.gcodeMove(1, -1, ijog, ifr);
}

R2C2.WebInterface.prototype.moveYPlus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	this.gcodeMove(2, 1, ijog, ifr);
}

R2C2.WebInterface.prototype.moveYMinus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	this.gcodeMove(2, -1, ijog, ifr);
}

R2C2.WebInterface.prototype.moveZPlus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(zfeedrate.value, 10);

	this.gcodeMove(3, 1, ijog, ifr);
}

R2C2.WebInterface.prototype.moveZMinus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	this.gcodeMove(3, -1, ijog, ifr);
}

R2C2.WebInterface.prototype.resetXYZ = function() {
	this.posx = 0.00000;
    this.posy = 0.00000;
    this.posz = 0.00000;
}
