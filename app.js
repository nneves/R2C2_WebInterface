// R2C2 Remote Control WebInterface
// $ node server.js 8080 /dev/ttyACM0
// $ npm start (for testing, will use port 8080 and /dev/null interface)

var flatiron = require('flatiron'),
    path = require('path'),
    ecstatic = require('ecstatic'),
    app = flatiron.app,    
    ecore = require('./lib/enginecore.js');

// flatiron configurations
app.config.file({ file: path.join(__dirname, 'config', 'config.json') });

// flatiron plugins
app.use(flatiron.plugins.http);

// flatiron - ecstatic (server resources from directory - html, css, js, images)
app.http.before = [
  ecstatic(__dirname + '/public')
];

// flatiron router - API for GCODE commands - call parseGCodeCmd from enginecore.js
app.router.get('/gcode/:cmd', ecore.parseGCodeCmd);

// launch app on tcpoprt
app.start(ecore.getTcpPort());
console.log('WebInterface Server running on port '+ecore.getTcpPort());
