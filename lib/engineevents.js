var util = require('util'),
	eventemitter = require('events').EventEmitter,
	eventemit = undefined;
	
//------------------------------------------------------------------
// Event Emitter
//------------------------------------------------------------------
var EVTClass = function() {

	//var eventemit = EVTClass();
	if(!(this instanceof arguments.callee)) {
		console.log("Create EVTClass and return object!");
		return new arguments.callee();
	}
	console.log("EVTClass object.");
}
util.inherits(EVTClass, eventemitter);

EVTClass.prototype.getGCodeFileLinesCount = function (omsg) {
	this.emit('getGCodeFileLinesCount', omsg);
}

EVTClass.prototype.endGCodeFileLinesCount = function (omsg) {
	this.emit('endGCodeFileLinesCount', omsg);
}

EVTClass.prototype.getGCodeFileData = function (omsg) {
	this.emit('getGCodeFileData', omsg);
}

EVTClass.prototype.sendGCodeBlockData = function (omsg) {
	this.emit('sendGCodeBlockData', omsg);
}

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------

function initialize () {
	if (eventemit === undefined) {
		console.log('Creating eventemit object.');	
		eventemit = EVTClass();
	}
	return eventemit;
}

//------------------------------------------------------------------
// Getters, Setters
//------------------------------------------------------------------
function getEventEmitter () {
	return eventemit;
}

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	initialize: initialize,
	getEventEmitter: getEventEmitter
};
//------------------------------------------------------------------