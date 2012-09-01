Compile Node.js v0.8.x on a RaspberryPi with Linux Debian armel wheezy
======================================================================
source: https://github.com/gflarity/node_pi

distro: 2012-06-18-wheezy-beta.zip

Install the necessary dependecies:
```bash
sudo apt-get install git-core build-essential libssl-dev
```

Get Node.js source and apply patch:
```bash
git clone https://github.com/gflarity/node_pi.git
git clone -b v0.8.2 git://github.com/joyent/node.git
cd node
git apply --stat --apply ../node_pi/v0.8.2-release-raspberrypi.patch
```

Set EXPORT vars to be used during compilation:
```bash
export GYP_DEFINES='armv7=0'
export CCFLAGS='-march=armv6'
export CXXFLAGS='-march=armv6'
```

Configure and make (disable snapshot):
```bash
./configure --shared-openssl --without-snapshot

make

(optional)
make test
```

Expose the previous exported vars to su before making sudo make install (necessary to avoid re-compile in su)
```bash
sudo GYP_DEFINES='armv7=0' CCFLAGS='-march=armv6' CXXFLAGS='-march=armv6' make install
```

[Tested: OK]

Compile time: 134m52.277s

make test failling with message: "IOError: [Errno 11] Resource temporarily unavailable"

Tested npm install [OK]

Launched R2C2_WebInterface node app + serialport [OK]

Compile Node.js v0.8.x on a RaspberryPi with Linux Debian armhf (hardware floating point) wheezy (raspbian)
===========================================================================================================
source: https://gist.github.com/3119325

distro: 2012-07-15-wheezy-raspbian.zip

Install the necessary dependecies:
```bash
sudo apt-get install git-core build-essential libssl-dev
```

Get Node.js source and apply patch:
```bash
git clone https://github.com/gflarity/node_pi.git
git clone -b v0.8.2 git://github.com/joyent/node.git
cd node
git apply --stat --apply ../node_pi/v0.8.2-release-raspberrypi.patch
```

Set EXPORT vars to be used during compilation:
```bash
export GYP_DEFINES='armv7=0'
export CXXFLAGS='-march=armv6 -mfpu=vfp -mfloat-abi=hard -DUSE_EABI_HARDFLOAT'
export CCFLAGS='-march=armv6 -mfpu=vfp -mfloat-abi=hard -DUSE_EABI_HARDFLOAT'
```

Configure and make (disable snapshot):
```bash
./configure --shared-openssl --without-snapshot

make

(optional)
make test
```
Expose the previous exported vars to su before making sudo make install (necessary to avoid re-compile in su)
```bash
sudo GYP_DEFINES='armv7=0' CXXFLAGS='-march=armv6 -mfpu=vfp -mfloat-abi=hard -DUSE_EABI_HARDFLOAT' CCFLAGS='-march=armv6 -mfpu=vfp -mfloat-abi=hard  -DUSE_EABI_HARDFLOAT' make install
```

[Tested: OK]

Compile time: 120m35.631s

make test failling with message: "IOError: [Errno 11] Resource temporarily unavailable"

Tested npm install [OK]

Launched R2C2_WebInterface node app + serialport [OK]
