var CPULabels = []
var firsttime = true
var datasetsCPU = []

var ctxCPU = document.getElementById('ChartCPU').getContext('2d');
var ChartCPU = new Chart(ctxCPU, {
    type: "line",
    data: {
        datasets: datasetsCPU
    },
    options: {
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            }]
        }
    }   
})

var ctxRAM = document.getElementById('ChartRAM').getContext('2d');
var datasetsRAM = [
    {
        label: "Pourcentage mémoire utilisé",
        borderColor: getRandomColor(),
    },
   {
       label: "Pourcentage Swap utilisé",
       borderColor: getRandomColor(),
   } 
]
var ChartRAM = new Chart(ctxRAM, {
    type: "line",
    data: {
        datasets: datasetsRAM
    },
    options: {
        scales: {
            xAxes: [{
                ticks: {
                    autoSkip: true,
                    maxTicksLimit: 10
                }
            }]
        }
    }   
})

// Récupération de l'api
async function GetData()
{
    var response = await fetch("http://localhost:8000/hostinfo")
    var data = await response.json();

    /* Partie CPU */
    GetCPUsName(data)
    if(firsttime == true)
    {
        CreateCPUDatasets(CPULabels)
        firsttime = false
    }
    //Update des info de CPU de l'api
    UpdateCPUData(data, "CPU")
    UpdateCPUData(data, "RAM")
    UpdatableTable(data)
    UpdateNetInfo(data)
    
    
}

function UpdatableTable(json){
    document.getElementById("hostname").innerHTML = json.Host.hostname;
    document.getElementById("uptime").innerHTML = parseInt(json.Host.uptime/60);
    document.getElementById("os").innerHTML = json.Host.os;
    document.getElementById("kernelVersion").innerHTML = json.Host.kernelVersion;
    document.getElementById("arch").innerHTML = json.Host.kernelArch;
    document.getElementById("hostid").innerHTML = json.Host.hostid;
} 

function UpdateNetInfo(json)
{
    var ips = []  
    // lancement au démarrage
    if(document.getElementById("body_table_net") == null )
    {
        // récupération du tableau net
        var table = document.getElementById("net_table")
        // creation du tbody
        var tbody = document.createElement("tbody")
        tbody.setAttribute("id","body_table_net")
        // ajout du tbody dans le tableau
        table.appendChild(tbody)

        json.Interfaces.forEach(element =>{
            tr = document.createElement("tr")

            tdnom = document.createElement("td")
            tdnom.innerHTML = element.name

            tdmac= document.createElement("td")
            tdmac.innerHTML = element.hardwareaddr

            tdmtu = document.createElement("td")
            tdmtu.innerHTML = element.mtu

            tdip = document.createElement("td")

            element.addrs.forEach(element => {
                ips.push(element.addr)
            })

            tdip.innerHTML = ips

            tdstatus = document.createElement("td")
            tdstatus.innerHTML = element.flags[0]

            // Liason des elements

            tbody.appendChild(tr)
            tr.appendChild(tdnom)
            tr.appendChild(tdmac)
            tr.appendChild(tdmtu)
            tr.appendChild(tdip)
            tr.appendChild(tdstatus)
        } )
    }
    else
   {
       // On supprime le body
        var tbody = document.getElementById("body_table_net")
        tbody.parentNode.removeChild(tbody)

        // récupération du tableau net
        var table = document.getElementById("net_table")
        // creation du tbody
        var tbody = document.createElement("tbody")
        tbody.setAttribute("id","body_table_net")
        // ajout du tbody dans le tableau
        table.appendChild(tbody)

        json.Interfaces.forEach(element =>{
            tr = document.createElement("tr")

            tdnom = document.createElement("td")
            tdnom.innerHTML = element.name

            tdmac= document.createElement("td")
            tdmac.innerHTML = element.hardwareaddr

            tdmtu = document.createElement("td")
            tdmtu.innerHTML = element.mtu

            tdip = document.createElement("td")

            element.addrs.forEach(element => {
                ips.push(element.addr)
            })

            tdip.innerHTML = ips

            tdstatus = document.createElement("td")
            tdstatus.innerHTML = element.flags[0]

            // Liason des elements

            tbody.appendChild(tr)
            tr.appendChild(tdnom)
            tr.appendChild(tdmac)
            tr.appendChild(tdmtu)
            tr.appendChild(tdip)
            tr.appendChild(tdstatus)
        } )
   } 
}


// Formatage des noms des coeurs des Cpu
function GetCPUsName(data)
{
    for (let i = 0; i< data.CPUUsage.length;i++)
    {
        CPULabels.push("Coeur "+i)
    }
    
}

// Creation des datasets pour le CPU
function CreateCPUDatasets(labels)
{
    
    labels.forEach(element => {
        var dataset = {
            label: element,
            borderColor: getRandomColor(),
        }
        datasetsCPU.push(dataset)
    });
    ChartCPU.data.datasets = datasetsCPU
    ChartCPU.update()
}

// Mise à jours des Données CPU
function UpdateCPUData(data, type)
{
    date = new Date()
    if(type == "CPU")
    {
        var i = 0
        data.CPUUsage.forEach(element => {
            ChartCPU.data.datasets[i].data.push(element)
            i++
        });
        ChartCPU.data.labels.push(date.getHours()+":"+date.getMinutes()+":"+date.getSeconds())
        ChartCPU.update()
    }
    else if(type == "RAM")
    {
        ChartRAM.data.datasets[0].data.push(data.MemoryInfo.usedPercent)
        ChartRAM.data.datasets[1].data.push(data.SwapINFO.usedPercent)
        ChartRAM.data.labels.push(date.getHours()+":"+date.getMinutes()+":"+date.getSeconds())
        ChartRAM.update()
    }
    
    
}

// Randomise la couleur
function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

setInterval(GetData, 5000)
//GetData()