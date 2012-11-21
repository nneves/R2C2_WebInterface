var path = require('path');
var url = require('url');
var http = require('http');
var fs = require('fs');
var write_file;
//what global variable do we have?
var complete = false;
var content_length = 0;
var downloaded_bytes = 0;

var local_path = __dirname+"/";

// source: http://www.jezra.net/blog/file_downloader_in_Nodejs_that_handles_redirects

//create the downloader 'class'
var Downloader = function() {

  //we will need to be able to set the remote file to download
  this.set_remote_file = function(file) {
    remote_file = file;
    local_file = path.basename( remote_file );
  }
  
  //we want to set the local file to write to
  this.set_local_file = function(file) {
    local_file = file;
  }

  // set local path
  this.set_local_path = function(path) {
    local_path = path;
  }

//run this fukker!
  this.run = function() {
    //start the download
    this.download( remote_file, local_file, 0 );
  }

  this.download = function(remote, local, num) {
    console.log( "Download file: %s", remote );
    // overwrite filename with original name
    local_file = local_path+url.parse(remote).pathname.split('/').pop();
    console.log("Filename: %s", local_file);
    console.log("Local Path: %s", local_path);

    if ( num > 10 ) {
      console.log( 'Too many redirects' );
    }
    //remember who we are
    var self = this;
    //set some default values  
    var redirect = false;
    var new_remote = null;
    var write_to_file = false;
    var write_file_ready = false;
    //parse the url of the remote file
    var u = url.parse(remote);
    //set the options for the 'get' from the remote file
    var opts = {
      host: u.hostname,
      port: u.port,
      path: u.pathname
    };
    //get the file
    var request = http.get(opts, function(response ) {
      switch(response.statusCode) {
        case 200:
          //this is good
          //what is the content length?
          content_length = response.headers['content-length'];
          break;
        case 302:
          new_remote = response.headers.location;
          self.download(new_remote, local_file, num+1 );
          return;
          break;
        case 404:
          console.log("File Not Found");
        default:
          //what the hell is default in this situation? 404?
          request.abort();
          return;
      }
      response.on('data', function(chunk) {
        //are we supposed to be writing to file?
        if(!write_file_ready) {
          //set up the write file
          write_file = fs.createWriteStream(local_file);
          write_file_ready = true;
        }
        write_file.write(chunk);
        downloaded_bytes+=chunk.length;
        percent = parseInt( (downloaded_bytes/content_length)*100 );
        console.log( "Download: %d %%", percent );
      });
      response.on('end', function() {
        complete = true;
        write_file.end();

		complete = false;
		content_length = 0;
		downloaded_bytes = 0;        
      });
    });
    request.on('error', function(e) {
      console.log("Got error: " + e.message);
    });
  }
}
//------------------------------------------------------------------
// export
//------------------------------------------------------------------
module.exports = {
	Downloader: Downloader
}
//------------------------------------------------------------------