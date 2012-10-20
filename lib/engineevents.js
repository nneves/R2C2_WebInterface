var util = require('util'),
	eventemitter = require('events').EventEmitter;
	
//------------------------------------------------------------------
// Event Emitter
//------------------------------------------------------------------
var EvntClass = function() {

	//var eventemit = EVTClass();
	if(!(this instanceof arguments.callee)) {
		console.log("Create EvntClass and return object!");
		return new arguments.callee();
	}
	console.log("EVTClass object.");
}
util.inherits(EvntClass, eventemitter);

EvntClass.prototype.getGCodeFileLinesCount = function (omsg) {
	this.emit('getGCodeFileLinesCount', omsg);
}

EvntClass.prototype.endGCodeFileLinesCount = function (omsg) {
	this.emit('endGCodeFileLinesCount', omsg);
}

EvntClass.prototype.getGCodeFileData = function (omsg) {
	this.emit('getGCodeFileData', omsg);
}

EvntClass.prototype.sendGCodeBlockData = function (omsg) {
	this.emit('sendGCodeBlockData', omsg);
}

//------------------------------------------------------------------
// Initialize objects
//------------------------------------------------------------------
var evnt = EvntClass();

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	emit: evnt
};
//------------------------------------------------------------------