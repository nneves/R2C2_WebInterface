// R2C2 Remote Control WebInterface
// >node server.js 8080 /dev/ttyACM0

var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs'),    
    tcpport = 8080,
    spdev = "/dev/ttyACM0";

// Processing parameters
if(process.argv[2] !== undefined && process.argv[2].trim() !== '') {
    tcpport = process.argv[2];
    console.log("Tcp/ip port parameter defined: "+tcpport);    
}
else {
    console.log("Using default tcp/ip port: "+tcpport);
}
if(process.argv[3] !== undefined && process.argv[3].trim() !== '') {
    spdev = process.argv[3];
    console.log("Serial Port device parameter defined: "+spdev);    
}
else {
    console.log("Using default Serial Port device: "+spdev);
}

// Serial Port
var serialport = require("serialport");
// Localize object constructor
var SerialPort = serialport.SerialPort;

// SerialPort object initialization
var sp = new SerialPort(spdev, {
    baudrate: 115200,
    parser: serialport.parsers.readline("\n")
});

// Register Serial Port RX callback
sp.on("data", function (data) {
   console.log("R2C2 TX-> Node.JS RX: "+data);
});

// Http server
var mimeTypes = {
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"};

http.createServer(function(req, res) {
    // checking for default path /
    var uri = "";
    if(url.parse(req.url).pathname === "/") {
        uri = "/index.html";
    }
    else {
        uri = url.parse(req.url).pathname;
    }    
    var filename = path.join(process.cwd(), uri);

    console.log('\r\nRequest for:'+uri+' filename:'+filename);

    // REST uri for GCODE interface
    var cmd = uri.split("/")[1];
    if(cmd.toUpperCase() === "GCODE") {
        console.log('Parsing REST gcode command');

        // spliting request in 2 and fetch parameter (only using 1 GET param)
        var gcode = uri.split("/")[2];
        console.log('Request Params: '+gcode);

        /* 
        // Serial Port callback function already defined and in async mode, should only be used here for sync!
        //
        sp.on("data", function (data) {
           console.log("RX-> "+data);
           // need to bind callback/closure with response and send data from SP->RX to Http response 
           // note: to make this to work sync may require some aditional/diferent thinking ...
        });
        */

        // check if it contains a multiple gcode commands (will use ; as separator)
        if(gcode.indexOf(";") != -1) {

            var gcode_array=gcode.split(";");
            var gcode_cmd;

            for(var i=0, len=gcode_array.length; i<len; i++) {
                gcode_cmd=unescape(gcode_array[i].replace(/\+/g, " ")); // url decode
                console.log("GCODE"+i.toString()+"="+gcode_cmd);
                sp.write(gcode_cmd+"\r\n");
            }
        }
        else {
            var gcode0=gcode;
            gcode0=unescape(gcode0.replace(/\+/g, " ")); // url decode
            console.log("GCODE="+gcode0);
            sp.write(gcode0+"\r\n");
        }

        // responding back to the brower request
        res.writeHead(200, {'Content-Type':'text/plain'});
        res.write('ACK');
        res.end();
        return;
    }

    // HTTP Server interface (serving html, css, js, jpeg, png ... files)
    path.exists(filename, function(exists) {
        if(!exists) {
            console.log("not exists: " + filename);
            res.writeHead(404, {'Content-Type':'text/plain'});
            res.write('Not Found\n');
            res.end();
            return;
        }
        // determine file mimeType from file extension
        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200,  {'Content-Type':mimeType});

        // streaming file content using fileStream.pipe
        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);

    }); //end path.exists
}).listen(tcpport);

console.log('R2C2 WebInterface Server running on port '+tcpport);
