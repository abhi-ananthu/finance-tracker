async function handleUpload(event) {
    event.preventDefault();
    
    const fileInput = document.querySelector('input')
    const file = fileInput.files[0]
    
    try {
        if (file) {
            const formData = new FormData();
            
            formData.append('file', file);
            const response = await fetch('http://localhost:3030/upload', {
                method: 'POST',
                body: formData
            })
            
            const data = await response.json();
            
            if (data && data.message) {
                alert(data.message)
                // Refresh files list after successful upload
                renderFiles();
                // Clear the file input
                fileInput.value = '';
                document.getElementById('computeStats').classList.add('hidden');
            }
        }
    } catch(err) {
        console.log(err);
    }
}

async function renderFiles() {
    const filesList = document.getElementById('filesList');
    const noFiles = document.getElementById('noFiles');
    const filesLoading = document.getElementById('filesLoading');
    const filesError = document.getElementById('filesError');
    const filesErrorMessage = document.getElementById('filesErrorMessage');
    
    try {
        // Show loading state
        if (filesLoading) filesLoading.classList.remove('hidden');
        if (noFiles) noFiles.classList.add('hidden');
        if (filesError) filesError.classList.add('hidden');
        if (filesList) filesList.innerHTML = '';
        
        const response = await fetch('http://localhost:3030/get-all-files', {
            method: 'GET',
        })
        
        const data = await response.json();
        
        // Hide loading state
        if (filesLoading) filesLoading.classList.add('hidden');
        
        if (data && data.files && data.files.length > 0) {
            // Display files
            filesList.innerHTML = data.files.map(file => `
                <div class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition duration-200">
                    <div class="flex items-center justify-between">
                        <div class="flex-1">
                            <h3 class="font-medium text-gray-800">${file.name || file}</h3>
                            <p class="text-sm text-gray-500">
                                ${file.uploadDate ? `Uploaded: ${file.uploadDate}` : ''}
                                ${file.size ? ` • Size: ${file.size}` : ''}
                            </p>
                        </div>
                        <div class="flex space-x-2 ml-4">
                            <button 
                                onclick="computeFileStatistics('${file.name || file}')"
                                class="bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-1 px-3 rounded transition duration-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                Compute Stats
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            // Show no files message
            if (noFiles) noFiles.classList.remove('hidden');
        }
        
    } catch (err) {
        console.error(err);
        // Hide loading state and show error
        if (filesLoading) {
            filesLoading.classList.add('hidden');
        } else {
            console.error("Element 'filesLoading' not found.");
        }
        if (filesError) {
            filesError.classList.remove('hidden');
        } else {
            console.error("Element 'filesError' not found.");
        }
        if (filesErrorMessage) {
            filesErrorMessage.textContent = 'Failed to load files. Please try again.';
        } else {
            console.error("Element 'filesErrorMessage' not found.");
        }
    }
}

// Function to format currency values
function formatCurrency(value) {
    if (typeof value === 'number') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(value);
    }
    return value;
}

// Function to format key names
function formatKey(key) {
    return key.replace(/([A-Z])/g, ' $1')
             .replace(/^./, str => str.toUpperCase())
             .replace(/_/g, ' ');
}

// Function to render distribution data
function renderDistribution(distributionData, title) {
    return `
        <div class="bg-gray-50 p-4 rounded-lg border">
            <h5 class="font-semibold text-gray-800 mb-3">${formatKey(title)}</h5>
            <div class="space-y-2 max-h-60 overflow-y-auto">
                ${Object.entries(distributionData).map(([key, value]) => `
                    <div class="flex justify-between items-center bg-white p-2 rounded border">
                        <span class="text-sm text-gray-700">${formatKey(key)}</span>
                        <span class="text-sm font-medium text-gray-900">${formatCurrency(value)}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

// Function to update net value display
function updateNetValue(data) {
    const netValueSection = document.getElementById('netValueSection');
    const netValue = document.getElementById('netValue');
    const netValueStatus = document.getElementById('netValueStatus');
    const netValueDate = document.getElementById('netValueDate');
    
    if (!netValueSection || !netValue || !netValueStatus || !netValueDate) {
        console.error('Net value elements not found');
        return;
    }

    // Try to find income and expense values from the data
    let totalIncome = 0;
    let totalExpenses = 0;
    let netAmount = 0;
    
    // Look for common income/expense field names
    Object.entries(data).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (typeof value === 'number') {
            if (lowerKey.includes('income') || lowerKey.includes('credit') || lowerKey.includes('revenue')) {
                totalIncome += value;
            } else if (lowerKey.includes('expense') || lowerKey.includes('debit') || lowerKey.includes('cost')) {
                totalExpenses += value;
            } else if (lowerKey.includes('net') || lowerKey.includes('balance')) {
                netAmount = value;
            }
        }
    });

    // If no direct net amount found, calculate it
    if (netAmount === 0 && (totalIncome > 0 || totalExpenses > 0)) {
        netAmount = totalIncome - totalExpenses;
    }

    // Update the display
    netValue.textContent = formatCurrency(netAmount);
    
    // Update status and styling based on positive/negative
    if (netAmount > 0) {
        netValueStatus.textContent = `Surplus of ${formatCurrency(netAmount)}`;
        netValueSection.className = 'mt-6 bg-gradient-to-r from-green-500 to-blue-600 rounded-lg shadow-lg p-6 text-white';
    } else if (netAmount < 0) {
        netValueStatus.textContent = `Deficit of ${formatCurrency(Math.abs(netAmount))}`;
        netValueSection.className = 'mt-6 bg-gradient-to-r from-red-500 to-red-600 rounded-lg shadow-lg p-6 text-white';
    } else {
        netValueStatus.textContent = 'Break-even';
        netValueSection.className = 'mt-6 bg-gradient-to-r from-gray-500 to-gray-600 rounded-lg shadow-lg p-6 text-white';
    }
    
    netValueDate.textContent = `Last updated: ${new Date().toLocaleString()}`;
    netValueSection.classList.remove('hidden');
}

// Function to compute statistics for a specific file
async function computeFileStatistics(fileName) {
    const statistics = document.getElementById('statistics');
    const statsContent = document.getElementById('statsContent');
    const netValueSection = document.getElementById('netValueSection');
    
    try {
        // Show loading state in statistics
        if (statistics) statistics.classList.remove('hidden');
        if (statsContent) {
            statsContent.innerHTML = `
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                    <span class="ml-3 text-gray-600">Computing statistics for ${fileName}...</span>
                </div>
            `;
        }
        
        const response = await fetch('http://localhost:3030/statistics', {
            headers: {
                'content-type': 'application/json',
            },
            method: 'POST',
            body: JSON.stringify({
                name: fileName,
            })
        });
        
        const data = await response.json();
        
        if (data && statsContent) {
            // Update net value first
            updateNetValue(data);
            
            // Separate simple values from complex objects
            const simpleStats = {};
            const complexStats = {};
            
            Object.entries(data).forEach(([key, value]) => {
                if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                    complexStats[key] = value;
                } else {
                    simpleStats[key] = value;
                }
            });
            
            statsContent.innerHTML = `
                <h4 class="font-medium text-purple-800 mb-4">Statistics for: ${fileName}</h4>
                
                ${Object.keys(simpleStats).length > 0 ? `
                    <div class="mb-6">
                        <h5 class="font-medium text-gray-800 mb-3">Summary Statistics</h5>
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${Object.entries(simpleStats).map(([key, value]) => `
                                <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                                    <div class="text-2xl font-bold text-blue-600">${formatCurrency(value)}</div>
                                    <div class="text-sm text-gray-600 mt-1">${formatKey(key)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${Object.keys(complexStats).length > 0 ? `
                    <div class="mb-6">
                        <h5 class="font-medium text-gray-800 mb-3">Detailed Breakdowns</h5>
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            ${Object.entries(complexStats).map(([key, value]) => 
                                renderDistribution(value, key)
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
                
                ${Object.keys(simpleStats).length === 0 && Object.keys(complexStats).length === 0 ? `
                    <div class="text-center py-8">
                        <div class="text-gray-500">No statistics data available for this file.</div>
                    </div>
                ` : ''}
                
                <div class="mt-6 pt-4 border-t border-gray-200">
                    <div class="text-xs text-purple-600">
                        Statistics computed on ${new Date().toLocaleString()}
                    </div>
                </div>
            `;
            
            // Scroll to net value section first, then to statistics
            if (netValueSection) {
                netValueSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
        
    } catch (err) {
        console.error('Error computing statistics:', err);
        
        if (statsContent) {
            statsContent.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-600 mb-2">
                        <svg class="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                    </div>
                    <div class="text-red-800 font-medium">Failed to compute statistics</div>
                    <div class="text-red-600 text-sm mt-1">Please try again or check if the file is valid.</div>
                </div>
            `;
        }
        
        alert('Failed to compute statistics. Please try again.');
    }
}

// Show compute button when file is selected
document.getElementById('upload').addEventListener('change', function() {
    const computeButton = document.getElementById('computeStats');
    const fileInfo = document.getElementById('fileInfo');
    const fileName = document.getElementById('fileName');
    
    if (this.files && this.files[0]) {
        const file = this.files[0];
        if (computeButton) computeButton.classList.remove('hidden');
        if (fileInfo && fileName) {
            fileName.textContent = `Selected: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
            fileInfo.classList.remove('hidden');
        }
    } else {
        if (computeButton) computeButton.classList.add('hidden');
        if (fileInfo) fileInfo.classList.add('hidden');
    }
});

// Handle compute statistics for selected file
document.getElementById('computeStats').addEventListener('click', function() {
    const fileInput = document.getElementById('upload');
    const file = fileInput.files[0];
    
    if (file) {
        computeFileStatistics(file.name);
    }
});

// Add refresh button functionality
document.getElementById('refreshFiles').addEventListener('click', renderFiles);

// Form submission handler
document.querySelector('#uploadForm').addEventListener('submit', handleUpload);

// Load files when page loads
document.addEventListener('DOMContentLoaded', renderFiles);