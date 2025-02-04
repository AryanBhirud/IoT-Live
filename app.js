// app.js - Modified version without simulations

let devices = [];

function addDevice() {
    const device = {
        id: document.getElementById('deviceId').value,
        name: document.getElementById('deviceName').value,
        type: document.getElementById('deviceType').value,
        location: document.getElementById('deviceLocation').value,
        ipAddress: document.getElementById('deviceIp').value,
        task: document.getElementById('deviceTask').value, // New task field
        status: 'unknown',
        lastPing: null,
        lastSeen: null
    };

    // Basic validation
    if (!device.id || !device.name || !device.ipAddress || !device.location || !device.task) {
        alert('Please fill in all required fields');
        return;
    }

    // IP address validation
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (!ipRegex.test(device.ipAddress)) {
        alert('Please enter a valid IP address');
        return;
    }

    devices.push(device);
    updateVisualization();
    updateClusterList();
    updateAnalytics();
    clearDeviceForm();
}

function clearDeviceForm() {
    document.getElementById('deviceId').value = '';
    document.getElementById('deviceName').value = '';
    document.getElementById('deviceTask').value = '';
    document.getElementById('deviceType').value = 'node';
    document.getElementById('deviceLocation').value = '';
    document.getElementById('deviceIp').value = '';
}

function groupDevicesIntoClusters() {
    const clusterBy = document.getElementById('clusterBy').value;
    
    return devices.reduce((acc, device) => {
        const key = clusterBy === 'type' ? device.type : 
                   clusterBy === 'location' ? device.location : 
                   device.task;
        
        if (!acc[key]) {
            acc[key] = {
                type: clusterBy,
                name: key,
                devices: []
            };
        }
        acc[key].devices.push({
            id: device.id,
            name: device.name,
            status: device.status,
            task: device.task,
            location: device.location,
            ipAddress: device.ipAddress,
            lastPing: device.lastPing,
            type: device.type
        });
        return acc;
    }, {});
}

function updateVisualization() {
    const clusterGrid = document.getElementById('clusterGrid');
    clusterGrid.innerHTML = '';
    
    const clusters = groupDevicesIntoClusters();
    const clusterBy = document.getElementById('clusterBy').value;

    for (const [key, cluster] of Object.entries(clusters)) {
        const clusterCard = document.createElement('div');
        clusterCard.className = 'cluster-card';
        clusterCard.innerHTML = `
            <div class="cluster-header">
                <i class="fas fa-${getClusterIcon(cluster.type, key)}"></i> 
                ${key.toUpperCase()} ${getClusterLabel(cluster.type)}
            </div>
            ${cluster.devices.map(device => `
                <div class="device-node">
                    <i class="fas fa-${getDeviceIcon(device.type)}"></i>
                    <div class="device-node-details">
                        <div>${device.name}</div>
                        <small>ID: ${device.id}</small>
                        <small>IP: ${device.ipAddress}</small>
                        <small>Type: ${device.type}</small>
                        <small>Location: ${device.location}</small>
                        <small>Task: ${device.task}</small>
                        <small>Last Ping: ${device.lastPing ? new Date(device.lastPing).toLocaleString() : 'Never'}</small>
                    </div>
                    <span class="device-status status-${device.status.toLowerCase()}">
                        ${device.status}
                    </span>
                </div>
            `).join('')}
        `;
        clusterGrid.appendChild(clusterCard);
    }
}

function getDeviceIcon(type) {
    const icons = {
        node: 'microchip',
        hub: 'network-wired',
        gateway: 'server',
        sensor: 'thermometer-half',
        actuator: 'bolt'
    };
    return icons[type] || 'microchip';
}

function updateClusterList() {
    const clusterContainer = document.getElementById('clusterContainer');
    const clusters = groupDevicesIntoClusters();
    
    clusterContainer.innerHTML = Object.entries(clusters)
        .map(([type, cluster]) => `
            <div class="cluster-item">
                <i class="fas fa-${getDeviceIcon(type)}"></i>
                ${type.toUpperCase()}: ${cluster.devices.length} devices
            </div>
        `).join('');
}

function updateAnalytics() {
    document.getElementById('connectedCount').textContent = devices.length;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
    
    const deviceStats = countDeviceTypes();
    const statusStats = countDeviceStatuses();
    
    document.getElementById('deviceStats').innerHTML = `
        <div>Total Devices: ${devices.length}</div>
        ${Object.entries(deviceStats).map(([type, count]) => `
            <div>${type.charAt(0).toUpperCase() + type.slice(1)}s: ${count}</div>
        `).join('')}
    `;

    document.getElementById('systemHealth').innerHTML = `
        ${Object.entries(statusStats).map(([status, count]) => `
            <div>${status.charAt(0).toUpperCase() + status.slice(1)}: ${count}</div>
        `).join('')}
    `;
}

function countDeviceTypes() {
    return devices.reduce((acc, device) => {
        acc[device.type] = (acc[device.type] || 0) + 1;
        return acc;
    }, {});
}

function countDeviceStatuses() {
    return devices.reduce((acc, device) => {
        acc[device.status] = (acc[device.status] || 0) + 1;
        return acc;
    }, {});
}

// Export configuration
document.getElementById('exportJson').addEventListener('click', () => {
    const data = {
        timestamp: new Date().toISOString(),
        clusters: groupDevicesIntoClusters(),
        totalDevices: devices.length,
        deviceTypes: countDeviceTypes(),
        statusSummary: countDeviceStatuses()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iot_config_${new Date().toISOString()}.json`;
    a.click();
});

// Deploy button handler
document.getElementById('deployBtn').addEventListener('click', () => {
    const taskGroups = groupDevicesByTask();
    ipcRenderer.send('deploy-firmware', taskGroups);
});

// Cluster type change handler
document.getElementById('clusterBy').addEventListener('change', () => {
    updateVisualization();
    updateClusterList();
});

function getClusterIcon(clusterType, key) {
    return {
        type: getDeviceIcon(key),
        location: 'map-marker-alt',
        task: 'tasks'
    }[clusterType];
}

function getClusterLabel(clusterType) {
    return {
        type: 'CLUSTER',
        location: 'LOCATION',
        task: 'TASK'
    }[clusterType];
}

function groupDevicesByTask() {
    return devices.reduce((acc, device) => {
        const key = device.task;
        if (!acc[key]) {
            acc[key] = {
                task: key,
                devices: []
            };
        }
        acc[key].devices.push(device);
        return acc;
    }, {});
}