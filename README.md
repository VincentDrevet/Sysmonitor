# Sysmonitor
a small app for monitoring host

![Sysmonitor](https://github.com/VincentDrevet/Sysmonitor/blob/master/demo/sysmonitor.png)


## Requirements

* go 1.13

## Setting up

### Installation

make install required root priviledge so run commands with sudo or doas
```
git clone https://github.com/VincentDrevet/Sysmonitor.git
cd sysmonitor
make install
make clean
echo "sysmonitor_enable >> /etc/rc.conf"
service sysmonitor start
```

### Uninstall

make uninstall required root priviledge
```
make uninstall
```

## Defaults settings

By default, the api is running on the 8000 port.
Web interface is running on the port 8001 port.

## Change settings

For change default value, just edit the sysmonitor.conf which is located in /usr/local/etc

