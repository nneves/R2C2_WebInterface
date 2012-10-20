var tcpport = 8080;
    serialport = "/dev/ttyACM0";

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

//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
    tcpport: tcpport,
    serialport: serialport
};
//------------------------------------------------------------------