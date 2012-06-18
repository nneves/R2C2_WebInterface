var posx = 0.00000,
    posy = 0.00000,
    posz = 0.00000;

_getXmlHttpRequestObject = function () {

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

sendCmd = function (cmd) {

	// internal ajax request object
	var sendReq = _getXmlHttpRequestObject();	

	var url_cmd = '/gcode/'+cmd;

	if (sendReq.readyState == 4 || sendReq.readyState == 0) {
		sendReq.open("GET",url_cmd,true);
        sendReq.setRequestHeader('Accept','application/json');
        sendReq.setRequestHeader('Content-Type','text/xml');
		sendReq.onreadystatechange = _sendCmdCB(url_cmd);
        console.log("-> AJAX cmd: "+cmd);
		sendReq.send(null);
	}	
};

_sendCmdCB = function (url) {
	return function() {
		if (this.readyState == 4 || this.readyState == 0) {
			console.log('<- AJAX cmd['+url+'] = '+this.responseText);
		}
	};
};

// auxiliar function to compose absolute gcode move command (just for testing)
gcodeMove = function (coord, dir, jog, fr) {

	// moving X
	if(coord == 1) {
		if(dir == 1) {
			posx = posx + jog;
		}
		else if(dir == -1) {
			posx = posx - jog;
		}		
	}			
	else if(coord == 2) { // moving Y
		if(dir == 1) {
			posy = posy + jog;
		}
		else if(dir == -1) {
			posy = posy - jog;
		}		
	}
	else if(coord == 3) { // moving Z
		if(dir == 1) {
			posz = posz + jog;
		}
		else if(dir == -1) {
			posz = posz - jog;
		}		
	}

	var igcode = 	"G1 X"+posx.toFixed(6).toString(10)+
					" Y"+posy.toFixed(6).toString(10)+
					" Z"+posz.toFixed(6).toString(10)+
					" F"+fr.toString(10);

	//console.log("GCode Move Command: "+igcode);
	sendCmd(igcode);
};

moveXPlus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	gcodeMove(1, 1, ijog, ifr);
}

moveXMinus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	gcodeMove(1, -1, ijog, ifr);
}

moveYPlus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	gcodeMove(2, 1, ijog, ifr);
}

moveYMinus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	gcodeMove(2, -1, ijog, ifr);
}

moveZPlus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(zfeedrate.value, 10);

	gcodeMove(3, 1, ijog, ifr);
}

moveZMinus = function() {
	// need to convert jog (to float) and fr (to int)
	var ijog = parseFloat(jogname.value);
	var ifr = parseInt(xyfeedrate.value, 10);

	gcodeMove(3, -1, ijog, ifr);
}