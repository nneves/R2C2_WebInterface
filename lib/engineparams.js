var tcpport = 8080;
    serialport = "/dev/ttyACM0",
    baudrate = 115200,
    slic3r = '/home/pi/work/appdev/3d/Slic3r/slic3r.pl',
    slic3rconf = '/home/pi/work/appdev/3d/Slic3r/config.ini';

//------------------------------------------------------------------
// Initialize
//------------------------------------------------------------------
if(process.argv[2] !== undefined && process.argv[2].trim() !== '') {
    tcpport = process.argv[2];
    console.log("Tcp/ip port parameter defined: "+tcpport);    
}
else {
    console.log("Using default tcp/ip port: "+tcpport);
}

if(process.argv[3] !== undefined && process.argv[3].trim() !== '') {
    serialport = process.argv[3];
    console.log("Serial Port device parameter defined: "+serialport);    
}
else {
    console.log("Using default Serial Port device: "+serialport);
}

if(process.argv[4] !== undefined && process.argv[4].trim() !== '') {
    baudrate = process.argv[4];
    console.log("Serial Port speed parameter defined: "+baudrate);    
}
else {
    console.log("Using default Serial Port speed: "+baudrate);
}

if(process.argv[5] !== undefined && process.argv[5].trim() !== '') {
    slic3r = process.argv[5];
    console.log("Slic3r path: "+slic3r);    
}
else {
    console.log("Using Slic3r default path: "+slic3r);
}

if(process.argv[6] !== undefined && process.argv[6].trim() !== '') {
    slic3rconf = process.argv[6];
    console.log("Slic3r config.ini path: "+slic3rconf);    
}
else {
    console.log("Using Slic3r config.ini default path: "+slic3rconf);
}

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
    tcpport: tcpport,
    serialport: serialport,
    baudrate: baudrate,
    slic3r: slic3r,
    slic3rconf: slic3rconf
};
//------------------------------------------------------------------