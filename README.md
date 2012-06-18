R2C2 WebInterface
=================

WebInterface using Node.JS on a Linux Embedded board to remote control an R2C2 RepRap 3D printers/CNC board via USB Serial Port connection.

http://github.com/nneves/R2C2_WebInterface/raw/master/R2C2WI.png

http://github.com/nneves/R2C2_WebInterface/raw/master/R2C2WI.png

R2C2 RepRap 3D printers/CNC
===========================

Find out more about the R2C2 RepRap 3D printers/CNC solution here: http://www.3dprinting-r2c2.com/

Firmware Development: http://www.3dprinting-r2c2.com/?q=content/development

Github source code: https://github.com/bitboxelectronics

GCode Commands: http://reprap.org/wiki/G-code


How to remote control the R2C2 board
====================================

The R2C2 board connects to a PC via USB (Virtual Serial Port Communication) and can be remote controlled by sending a GCODE command, such as (GCode command to move the X Step Motor by 1mm at 8000mm/min. speed): G1 X1.0 Y0.0 Z0.0 F8000

Getting it to be remote controlled from multiple platforms such as mobile, tablets, laptops/desktops should be easy if one could use something standard and common to all platforms, such as using the web browser to display the UI and using the web protocols to communicate with the Embedded Linux board, that would then bridge the web request to the hardware layer.

By using a cheap and acessible Linux Embedded board to expand the R2C2 functionality one should have:
- easy way to use a well known/tested and secure tcp/ip stack
- ability to make your own tool/script to control the r2c2 hardware
- ability to use existing tools to deploy the WebServer service
- take the advantage of the Linux OS available tools/repository
- add extra hardware to the Linux embedded board to expand it's functionalities (Wifi card, Joystick, 3G USB Modem, etc)
- etc ... 

What Linux Embedded boards will run this WebInterface
=====================================================
The initial protptype started in a Raspberry PI (http://www.raspberrypi.org/) but the final goal should be to use an even more acessible and cheap board such as Olinuxino micro (+wifi pen). 
The great thing about this WebInterface is that even without an Embedded Linux board it is possible to test it on a Linux Debian/Ubuntu Laptop/Desktop connected to the R2C2 (maybe recycle some old Laptop), but for minimal cost or energy saving one should consider the above Embedded boards.

What WebServer is the R2C2 WebInterface using
=============================================
The R2C2 WebInterface is currently running on Node.JS and uses Javascript language (Note: Not Oracle JAVA related, Javascript is WebBrowser related and will also run on the Node.JS server). Please read more about Javascript here http://en.wikipedia.org/wiki/JavaScript and Node.JS here http://nodejs.org/

Why Node.JS? Why not, Beaglebone is prototyping with it, so this is also a good oportunity to explore some new web techology.
Node.JS will also provide additional packages to be installed and also support some of the latest and bleeding edge web protocols. 
Also, since the UI will use HTML+Javascript to compose the webinterface frontend, using Javascript in the webserver code should make it simpler to bind the 2 worlds together.

Aditionally, Node.JS will require to install an aditional package for Serial Port communication, but that's all!

What should one expect from this initial prototype
==================================================

With this prototype you should be able to control the RepRap 3D Printer/CNC XYZ Step Motor coordinates/position. 
This was inspired on the ReplicatorG control panel functionality, so just keeping it simple for the initial prototype.

Please read the nice have ideas at the end of this readme.

Can I design/customize the frontend UI or even the backend core?
================================================================

Yes! You just need to have some notions on own HTML and webserver requests works.
Adding an extra button to send some GCODE commands to the R2C2 should be pretty simple!

If you are not confortable doing an UI interface, you can always ask someone to do it for you (or even a professional) and hook things up easily.

For the Node.JS core it's a bit more tricky cause you really need to understand the node concepts, but not that difficult to acheive, just requires a bit more study (I'm also learning Node.js, so my code may need improvement)!



(INSTRUCTIONS) How to Test the R2C2 WebInterface
================================================
1- Install Node.JS
2- Get R2C2_WebInterface code from the github
3- Install the Node.js Serial Port package inside the R2C2_WebInterface directory (local package installation)
4- Connnect the R2C2 board to the PC/Laptop/Linux Embedded Board
5- Launch Node.js app
6- Browse the the Node.js server IP:Port

1- How to install Node.JS:
==========================
A) on a Linux Laptop (repository direct installation) using Linux Ubuntu 12.04 (Clean install):
> sudo apt-get update

> sudo apt-get upgrade

> sudo apt-get install build-essential

// install node.js from Ubuntu's repository
> sudo apt-get install nodejs npm

// check nodejs and npm (package manager) version
> node --version
v0.6.12

> npm --version
1.1.4


NOTE: you may have to had this to your user .bashrc file (add it to the end)
> nano ~/.bashrc
export NODE_PATH="/usr/local/lib/node"


B) on a Linux Embedded board such as Raspberry PI
... WIP (will post instructions form repository installation latter)

Compiling Node.js by hand will required 1 or 2 tweaks (also updating latter)

C) on a Linux Embedded board such as Olinuxino
... WIP

2- Get R2C2 WebInterface code from the github
=============================================
> git clone git://github.com/nneves/R2C2_WebInterface.git


3- Install the Node.js Serial Port package inside the R2C2_WebInterface directory (local package installation)
==============================================================================================================
> cd R2C2_WebInterface
> npm install serialport

4- Connnect the R2C2 board to the PC/Laptop/Linux Embedded Board
================================================================
> dmesg | grep "cdc_acm"

Should list the R2C2 USB Serial Port such as: "ttyACM0: USB ACM device"

5- Launch Node.js app
=====================
1st argument should set to the tcp/ip port number (if not defined will use the default 8080)
2nd argument should be set to the R2C2 Serial Port device (if not defined will use the default /dev/ttyACM0)
> node server.js 8080 /dev/ttyACM0

Note: to run on lower tcp/ip ports such as 80 you need to have special permissions (or allow it in the firewall)
to run in port 80 I had to use sudo, but should avoid this approach!

Note2: if you just want to test it without connecting it to the R2C2 board, just launch with:
> node server.js 8080 /dev/null

6- Browse the the Node.js server IP:Port
========================================
Open browser at: http://r2c2_webinterface_ip:8080

Dev Note: if using Chrome or Safari WebBrowser you can get more info by right clicking the webpage and selecting the Inspect elements Option (Network Requests, Javascript Console for debug messages)

Additional Dev Note: The current UI demo is using Javascript asynchronous requests (AJAX) for speed performance and also node.js request <-> serial port bridge is also in async mode, so there is 2 async layers of abstraction.

Future Dev Note: Will be prototyping Node.js and websockets communication for speed/performance boost latter, but since it requires the latest webbrowsers support, older mobile OSs may not take the advantage of this improcements. There are solutions for this using a special Node.js package that will have multiple fallback communication solutions.



List of ideas that can be usefull to implement on this R2C2 WebInterface
========================================================================
- Map HTML objects such as images, buttons, etc to send R2C2 GCode commands in order to remote control the board [DONE]

// Todo
- Send an STL 3d object file (or send the http://www.thingiverse.com/ URL for the STL object) to the R2C2 WebInterface in order for GCODE conversion (local Linux Embedded board conversion by using a specific tool such as https://github.com/alexrj/Slic3r or use a remote Linux Server to make the hard work and return the final GCODE)
Note: not really sure if this is possible, have little experience on this (feedback will be appreciated)

- List the R2C2 board existing .gcode files (cached in the R2C2 SD card) and select a specific file for re-print

- Send .gcode files to the R2C2 board SD card (force R2C2 reboot with BOOT button virtually pressed, mount the R2C2 SD card in the Linux Embedded board filesystem via USB and transfer file) OR (Support a faster communication protocol from the Linux Embedded board to the R2C2, probably using SPI - need additional investigation on this)

- Send FIRMWARE.BIN files to the R2C2 SD card for firmware upgrade. (WebInterface could list the GitHub stable available FIRMWARE.BIN files for easy firmware upgrade)

- Remotely notify the user about the printer progress via GTalk XMPP service.

- Implement support to control the 3D Printer/CNC via joystick connected to the Linux Embedded board (or maybe some game console commands - Wii, etc)

- WebCam integration in the Linux Embedded board (just for fun - may be usefull to give access from the internet to show the concept and the remote user can actually see it working)