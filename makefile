.PHONY: install

BINARY_LOCATION?="/usr/local/bin"
STATIC_LOCATION?="/var/sysmonitor"
CONF_LOCATION?="/usr/local/etc/sysmonitor"

/root/go: /usr/local/bin/go
	go get -u github.com/shirou/gopsutil && go get -u golang.org/x/sys/unix && go get -u "gopkg.in/ini.v1"

back-sysmonitor: /root/go back/main.go
	go build -o back-sysmonitor back/main.go


install: back-sysmonitor
	cp back-sysmonitor $(BINARY_LOCATION) && mkdir -p $(STATIC_LOCATION) && cp -r front/ $(STATIC_LOCATION) && mkdir -p $(CONF_LOCATION) && cp etc/sysmonitor.conf $(CONF_LOCATION)

uninstall:
	rm $(BINARY_LOCATION)/back-sysmonitor && rm -r $(STATIC_LOCATION)

clean:
	rm -r /root/go && rm ./back-sysmonitor