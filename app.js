// Update the JavaScript code in app.js

let devices = [];

function addDevice() {
    const now = new Date();
    
    const device = {
        id: document.getElementById('deviceId').value,
        name: document.getElementById('deviceName').value,
        type: document.getElementById('deviceType').value,
        location: document.getElementById('deviceLocation').value,
        ipAddress: document.getElementById('deviceIp').value,
        status: document.getElementById('deviceStatus').value,
        lastPing: now.toISOString(),
        lastSeen: now.toLocaleString(),
        firmware: '1.0.0'
    };

    // Basic validation
    if (!device.id || !device.name || !device.ipAddress || !device.location) {
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
    document.getElementById('deviceType').value = 'node';
    document.getElementById('deviceLocation').value = '';
    document.getElementById('deviceIp').value = '';
    document.getElementById('deviceStatus').value = 'online';
    document.getElementById('lastPingDisplay').textContent = 'Never';
}

function updateVisualization() {
    const clusterGrid = document.getElementById('clusterGrid');
    clusterGrid.innerHTML = '';
    
    const clusters = devices.reduce((acc, device) => {
        if (!acc[device.type]) acc[device.type] = [];
        acc[device.type].push(device);
        return acc;
    }, {});

    for (const [type, devices] of Object.entries(clusters)) {
        const clusterCard = document.createElement('div');
        clusterCard.className = 'cluster-card';
        clusterCard.innerHTML = `
            <div class="cluster-header">
                <i class="fas fa-${getDeviceIcon(type)}"></i> ${type.toUpperCase()} CLUSTER
            </div>
            ${devices.map(device => `
                <div class="device-node">
                    <i class="fas fa-${getDeviceIcon(type)}"></i>
                    <div class="device-node-details">
                        <div>${device.name}</div>
                        <small>ID: ${device.id}</small>
                        <small>IP: ${device.ipAddress}</small>
                        <small>Location: ${device.location}</small>
                        <small>Last Ping: ${new Date(device.lastPing).toLocaleString()}</small>
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

function groupDevicesIntoClusters() {
    return devices.reduce((acc, device) => {
        if (!acc[device.type]) {
            acc[device.type] = {
                type: device.type,
                devices: [],
                firmware: '1.0.0'
            };
        }
        acc[device.type].devices.push({
            id: device.id,
            name: device.name,
            status: device.status,
            location: device.location,
            ipAddress: device.ipAddress,
            lastPing: device.lastPing
        });
        return acc;
    }, {});
}

document.getElementById('deployBtn').addEventListener('click', () => {
    const clusters = groupDevicesIntoClusters();
    document.getElementById('deploymentProgress').innerHTML = `
        <div class="status-message">
            Configuration ready for deployment to ${devices.length} devices
        </div>
    `;
});