package main

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/shirou/gopsutil/cpu"
	"github.com/shirou/gopsutil/disk"
	"github.com/shirou/gopsutil/host"
	"github.com/shirou/gopsutil/mem"
	"github.com/shirou/gopsutil/net"
	"gopkg.in/ini.v1"
)

// Conf : Struct contenant les informations de configuration
type Conf struct {
	httpEnable string
	apiPORT    string
	httpPORT   string
}

// HostInfo contient les attributs des informations systèmes de l'hote
type HostInfo struct {
	CPUUsage     []float64
	SwapINFO     *mem.SwapMemoryStat
	MemoryInfo   *mem.VirtualMemoryStat
	Partition    []disk.PartitionStat
	Storageusage ListStorageusage
	Interfaces   []net.InterfaceStat
	Host         *host.InfoStat
}

// ListStorageusage contient les inforamtions d'utilisation du disque.
type ListStorageusage struct {
	ListUsageStat []*disk.UsageStat
}

// GetHostInfo récupère toutes les informations systèmes et les enregistre dans une struct Hostinfo qui est retournée
func GetHostInfo() HostInfo {

	/*
		CPU
	*/
	cpuusage, err := cpu.Percent(time.Second, true)
	if err != nil {
		panic(err)
	}

	/*
		SWAP
	*/

	swapinfo, err := mem.SwapMemory()
	if err != nil {
		panic(err)
	}

	/*
		RAM
	*/

	meminfo, err := mem.VirtualMemory()
	if err != nil {
		panic(err)
	}

	/*
		Partition
	*/

	partitions, err := disk.Partitions(true)
	if err != nil {
		panic(err)
	}

	/*
		FileSystem Usage
		On itère sur les partitions qui contient le mountpath car la fonction Usage à besoin du point de montage pour déterminer l'espace utilisé
	*/
	var storageusage ListStorageusage
	for _, element := range partitions {
		usage, err := disk.Usage(element.Mountpoint)
		if err != nil {
			panic(err)
		}
		storageusage.ListUsageStat = append(storageusage.ListUsageStat, usage)
	}

	/*
		Interfaces
	*/
	interfaces, err := net.Interfaces()
	if err != nil {

	}

	/*
		Information systeme
	*/

	infoStat, err := host.Info()
	if err != nil {
		panic(err)
	}
	var hostinfo HostInfo = HostInfo{
		CPUUsage:     cpuusage,
		SwapINFO:     swapinfo,
		MemoryInfo:   meminfo,
		Partition:    partitions,
		Storageusage: storageusage,
		Interfaces:   interfaces,
		Host:         infoStat,
	}

	return hostinfo
}

// GetSettings retourne sous la forme d'une struct les paramètres de configuration contenu dans le fichier de conf
func GetSettings(configfilepath string) Conf {

	cfg, err := ini.Load(configfilepath)
	if err != nil {
		panic(err)
	}

	var settings Conf

	settings.httpEnable = cfg.Section("global").Key("ENABLEHTTP").String()

	settings.apiPORT = cfg.Section("net").Key("APIPORT").String()

	settings.httpPORT = cfg.Section("net").Key("HTTPPORT").String()

	return settings
}

// ServeAPI est une fonction permettant d'exposer en JSON les informations récupéré par la fonction GetHostInfo
func ServeAPI(responsewriter http.ResponseWriter, r *http.Request) {

	// On définie qu'on envoit du JSON
	responsewriter.Header().Set("content-type", "application/json")
	responsewriter.Header().Set("Access-Control-Allow-Origin", "*")

	// On convertie notre struct en JSON
	jsondata, err := json.Marshal(GetHostInfo())
	if err != nil {
		panic(err)
	}

	responsewriter.Write([]byte(jsondata))
}

func main() {

	var settings Conf = GetSettings("/usr/local/etc/sysmonitor/sysmonitor.conf")
	finish := make(chan bool)

	serverapi := http.NewServeMux()
	serverapi.HandleFunc("/hostinfo", ServeAPI)

	serverhttp := http.NewServeMux()
	var rootdir string = "/var/sysmonitor"
	serverhttp.Handle("/", http.FileServer(http.Dir(rootdir)))

	// Run API
	go http.ListenAndServe(settings.apiPORT, serverapi)

	if settings.httpEnable == "true" {
		// RUN APP
		go http.ListenAndServe(settings.httpPORT, serverhttp)
	}

	<-finish

}
