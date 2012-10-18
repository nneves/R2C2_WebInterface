var eventemitter = require('events').EventEmitter,
	util = require('util');

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
var eventemit = EVTClass();

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
	getEventEmitter: getEventEmitter
};
//------------------------------------------------------------------