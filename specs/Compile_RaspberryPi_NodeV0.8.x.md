Compile Node.js v0.8.x on a RaspberryPi with Linux Debian armel wheezy [Testing ...]
======================================================================
source: https://github.com/gflarity/node_pi

Install the necessary dependecies:
```bash
sudo apt-get install git-core build-essential libssl-dev
```

Get Node.js source and apply patch:
```bash
git clone https://github.com/gflarity/node_pi.git
git clone https://github.com/joyent/node.git
cd node
git checkout origin/v0.8.2-release -b v0.8.2-release
git apply --stat ../node_pi/v0.8.2-release-raspberrypi.patch
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
make test
```

Set the EXPORT vars to su before making sudo make install (necessary to avoid re-compile in su)
```bash
sudo GYP_DEFINES='armv7=0' CCFLAGS='-march=armv6' CXXFLAGS='-march=armv6' make install
```

Compile Node.js v0.8.x on a RaspberryPi with Linux Debian armhf (hardware floating point) wheezy (raspbian) [Un-Tested]
===========================================================================================================
source: https://gist.github.com/3119325

Install the necessary dependecies:
```bash
sudo apt-get install git-core build-essential libssl-dev
```

Get Node.js source and apply patch:
```bash
git clone https://github.com/gflarity/node_pi.git
git clone https://github.com/joyent/node.git
cd node
git checkout origin/v0.8.2-release -b v0.8.2-release
git apply --stat ../node_pi/v0.8.2-release-raspberrypi.patch
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
make test
```
Set the EXPORT vars to su before making sudo make install (necessary to avoid re-compile in su)
```bash
sudo export GYP_DEFINES='armv7=0' export CXXFLAGS='-march=armv6 -mfpu=vfp -mfloat-abi=hard -DUSE_EABI_HARDFLOAT' export CCFLAGS='-march=armv6 -mfpu=vfp -mfloat-abi=hard  -DUSE_EABI_HARDFLOAT' make install
```