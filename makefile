.PHONY: install uninstall clean

BINARY_LOCATION?="/usr/local/bin"
STATIC_LOCATION?="/var/sysmonitor"
CONF_LOCATION?="/usr/local/etc/sysmonitor"

/root/go: /usr/local/bin/go
	go get -u github.com/shirou/gopsutil && go get -u golang.org/x/sys/unix && go get -u "gopkg.in/ini.v1"

sysmonitor: /root/go back/main.go
	go build -o sysmonitor back/main.go


install: sysmonitor
	cp sysmonitor $(BINARY_LOCATION) && mkdir -p $(STATIC_LOCATION) && cp -r front/ $(STATIC_LOCATION) && mkdir -p $(CONF_LOCATION) && cp etc/sysmonitor.conf $(CONF_LOCATION) && cp rc/sysmonitor /etc/rc.d/

uninstall:
	rm $(BINARY_LOCATION)/sysmonitor && rm -r $(STATIC_LOCATION) && rm -r $(CONF_LOCATION) && rm /etc/rc.d/sysmonitor

clean:
	rm -r /root/go && rm ./sysmonitor