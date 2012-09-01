Compile Node.js v0.6.20 on a RaspberryPi with Linux Debian armel squeeze/wheezy
======================================================================
source: http://blog.tomg.co/post/21322413373/how-to-install-node-js-on-your-raspberry-pi

Install the necessary dependecies:
```bash
sudo apt-get install git-core build-essential libssl-dev
```

Get Node.js source and apply patch:
```bash
git clone https://github.com/gflarity/node_pi.git
git clone -b v0.6.20 git://github.com/joyent/node.git
cd node
git apply --stat --apply ../node_pi/v0.8.2-release-raspberrypi.patch
```

Set EXPORT vars to be used during compilation:
```bash
export CCFLAGS='-march=armv6'
export CXXFLAGS='-march=armv6'
```

Configure, make (disable snapshot) and install:
```bash
./configure --openssl-libpath=/usr/lib/ssl --without-snapshot
make
make test
sudo make install
```