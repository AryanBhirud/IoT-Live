let devices = [];

function addDevice() {
    const device = {
        id: document.getElementById('deviceId').value,
        name: document.getElementById('deviceName').value,
        type: document.getElementById('deviceType').value,
        status: 'online',
        firmware: '1.0.0',
        lastSeen: new Date().toLocaleString()
    };

    devices.push(device);
    updateVisualization();
    updateClusterList();
    updateAnalytics();
    clearDeviceForm();
}

function clearDeviceForm() {
    document.getElementById('deviceId').value = '';
    document.getElementById('deviceName').value = '';
    document.getElementById('deviceType').value = 'sensor';
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
                <i class="fas fa-project-diagram"></i> ${type.toUpperCase()} CLUSTER
            </div>
            ${devices.map(device => `
                <div class="device-node">
                    <i class="fas fa-${getDeviceIcon(type)}"></i>
                    <div>
                        <div>${device.name}</div>
                        <small>${device.id}</small>
                    </div>
                </div>
            `).join('')}
        `;
        clusterGrid.appendChild(clusterCard);
    }
}

function getDeviceIcon(type) {
    const icons = {
        sensor: 'thermometer-half',
        actuator: 'bolt',
        gateway: 'server'
    };
    return icons[type] || 'microchip';
}

function updateClusterList() {
    const clusterContainer = document.getElementById('clusterContainer');
    const clusterCount = Object.keys(groupDevicesIntoClusters()).length;
    clusterContainer.innerHTML = `
        <div class="cluster-item">
            <i class="fas fa-cluster"></i>
            ${clusterCount} Active Clusters
        </div>
    `;
}

function updateAnalytics() {
    document.getElementById('connectedCount').textContent = devices.length;
    document.getElementById('lastUpdate').textContent = new Date().toLocaleString();
    
    const typeCounts = devices.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
    }, {});
    
    document.getElementById('deviceStats').innerHTML = `
        <div>Total Devices: ${devices.length}</div>
        ${Object.entries(typeCounts).map(([type, count]) => `
            <div>${type.charAt(0).toUpperCase() + type.slice(1)}s: ${count}</div>
        `).join('')}
    `;
}

document.getElementById('exportJson').addEventListener('click', () => {
    const data = {
        timestamp: new Date().toISOString(),
        clusters: groupDevicesIntoClusters(),
        totalDevices: devices.length
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `iot_config_${new Date().toISOString()}.json`;
    a.click();
});

document.getElementById('deployBtn').addEventListener('click', () => {
    const clusters = groupDevicesIntoClusters();
    // Add actual deployment logic here
    updateDeploymentStatus('Deployment initiated...');
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
            status: device.status
        });
        return acc;
    }, {});
}

function updateDeploymentStatus(message) {
    const progress = document.getElementById('deploymentProgress');
    progress.innerHTML = `<div class="status-message">${message}</div>`;
}

function connectGithub() {
    const repoUrl = document.getElementById('githubRepo').value;
    if (!repoUrl) return;
    
    document.getElementById('githubStatus').textContent = `Connected to ${repoUrl}`;
}

// Initial setup
updateAnalytics();