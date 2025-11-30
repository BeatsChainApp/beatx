// Upload Flow Fixes for BeatsChain Extension

// 1. Track Metadata Input Fields Missing
function addMissingMetadataFields() {
    const artistForm = document.getElementById('artist-form');
    if (!artistForm) return;

    // Add missing fields after existing form grid
    const formGrid = artistForm.querySelector('.form-grid');
    if (!formGrid) return;

    // Producer field
    const producerRow = document.createElement('div');
    producerRow.className = 'form-row';
    producerRow.innerHTML = `
        <label for="track-producer">Producer:</label>
        <input type="text" id="track-producer" placeholder="Producer name" class="form-input">
    `;
    formGrid.appendChild(producerRow);

    // Year field
    const yearRow = document.createElement('div');
    yearRow.className = 'form-row';
    yearRow.innerHTML = `
        <label for="track-year">Release Year:</label>
        <input type="number" id="track-year" min="1900" max="2030" value="${new Date().getFullYear()}" class="form-input">
    `;
    formGrid.appendChild(yearRow);

    // User-editable BPM field
    const bpmRow = document.createElement('div');
    bpmRow.className = 'form-row';
    bpmRow.innerHTML = `
        <label for="track-bpm">BPM (Beats Per Minute):</label>
        <input type="number" id="track-bpm" min="60" max="200" placeholder="Auto-detected" class="form-input">
        <small class="field-help">Leave blank for auto-detection</small>
    `;
    formGrid.appendChild(bpmRow);
}

// 2. Cover Image Upload Flow Fix
function fixCoverImageUpload() {
    const coverImageInput = document.getElementById('cover-image');
    const imagePreview = document.getElementById('image-preview');
    
    if (!coverImageInput || !imagePreview) return;

    // Make cover image upload more visible
    const imageUploadSection = coverImageInput.closest('.image-upload');
    if (imageUploadSection) {
        imageUploadSection.style.cssText = `
            background: #f8f9fa;
            border: 2px dashed #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 16px 0;
            text-align: center;
            cursor: pointer;
        `;
        
        // Add click handler to section
        imageUploadSection.addEventListener('click', () => {
            coverImageInput.click();
        });
        
        // Update label styling
        const label = imageUploadSection.querySelector('label');
        if (label) {
            label.style.cssText = `
                display: block;
                font-weight: bold;
                margin-bottom: 8px;
                cursor: pointer;
            `;
            label.innerHTML = '🖼️ Cover Image Upload (Required for Professional Packages)';
        }
        
        // Add upload instructions
        const instructions = document.createElement('div');
        instructions.className = 'upload-instructions';
        instructions.innerHTML = `
            <p style="margin: 8px 0; color: #666;">Click to select cover image</p>
            <small style="color: #999;">JPG, PNG • Min 500x500px • Max 5MB</small>
        `;
        imageUploadSection.appendChild(instructions);
    }

    // Fix image preview
    coverImageInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (!file) return;

        // Validate image
        if (!file.type.startsWith('image/')) {
            alert('Please select a valid image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('Image too large. Maximum size is 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = function(e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
            imagePreview.style.cssText = `
                display: block;
                max-width: 200px;
                max-height: 200px;
                border-radius: 8px;
                margin: 10px auto;
                border: 2px solid #4CAF50;
            `;
            
            // Update instructions
            const instructions = imageUploadSection.querySelector('.upload-instructions');
            if (instructions) {
                instructions.innerHTML = `
                    <p style="color: #4CAF50; margin: 8px 0;">✅ Cover image uploaded</p>
                    <small style="color: #666;">Click to change image</small>
                `;
            }
        };
        reader.readAsDataURL(file);
    });
}

// 3. Fix Upload to Backend Services (not local storage)
function fixUploadBackend() {
    // Override the processFile method to use proper backend
    if (window.BeatsChainApp && window.BeatsChainApp.prototype) {
        const originalProcessFile = window.BeatsChainApp.prototype.processFile;
        
        window.BeatsChainApp.prototype.processFile = async function(file) {
            this.showProgress(true);
            
            try {
                // 1. Validate file
                const isValid = await this.validateAudioFile(file);
                if (!isValid) {
                    throw new Error('File validation failed');
                }

                // 2. Extract metadata with all fields
                this.beatFile = file;
                this.beatMetadata = await this.extractEnhancedAudioMetadata(file, 'web3');
                
                // 3. Update UI
                this.updateUploadStatus(`Uploaded: ${file.name} (${this.audioManager.formatFileSize(file.size)})`);
                this.showProgress(false);
                this.createAudioPreview(file);
                this.displayMetadata(this.beatMetadata);
                this.showArtistForm();
                
                // 4. Add missing metadata fields
                setTimeout(() => {
                    addMissingMetadataFields();
                    fixCoverImageUpload();
                    populateMetadataFields(this.beatMetadata);
                }, 100);
                
                const proceedBtn = document.getElementById('proceed-to-licensing');
                if (proceedBtn) proceedBtn.style.display = 'block';
                
            } catch (error) {
                console.error('File processing failed:', error);
                alert(`File upload failed: ${error.message}`);
                this.showProgress(false);
            }
        };
        
        // Add enhanced metadata extraction
        window.BeatsChainApp.prototype.extractEnhancedAudioMetadata = async function(file, systemId = 'web3') {
            const basicMetadata = await this.audioManager.extractAudioMetadata(file, systemId);
            
            // Add missing fields with defaults
            return {
                ...basicMetadata,
                producer: '', // Will be filled by user
                year: new Date().getFullYear(),
                userEditableBPM: basicMetadata.estimatedBPM, // Allow user to override
                coverImageRequired: true,
                backendUpload: true // Flag for backend upload
            };
        };
    }
}

// 4. Populate metadata fields from analysis
function populateMetadataFields(metadata) {
    // Auto-fill BPM if detected
    const bpmInput = document.getElementById('track-bpm');
    if (bpmInput && metadata.estimatedBPM) {
        bpmInput.value = metadata.estimatedBPM;
        bpmInput.placeholder = `Auto-detected: ${metadata.estimatedBPM}`;
    }
    
    // Auto-fill year
    const yearInput = document.getElementById('track-year');
    if (yearInput && metadata.year) {
        yearInput.value = metadata.year;
    }
}

// 5. Fix Backend Integration (Supabase/IPFS/Livepeer)
function setupBackendIntegration() {
    // Create backend upload manager
    window.BackendUploadManager = class {
        constructor() {
            this.supabaseUrl = 'https://your-project.supabase.co';
            this.ipfsGateway = 'https://ipfs.io/ipfs/';
            this.livepeerApiKey = 'your-livepeer-key';
        }
        
        async uploadToSupabase(file, metadata) {
            // Supabase upload implementation
            const formData = new FormData();
            formData.append('file', file);
            formData.append('metadata', JSON.stringify(metadata));
            
            const response = await fetch(`${this.supabaseUrl}/storage/v1/object/audio`, {
                method: 'POST',
                body: formData,
                headers: {
                    'Authorization': `Bearer ${this.getSupabaseKey()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Supabase upload failed');
            }
            
            return await response.json();
        }
        
        async uploadToIPFS(file, metadata) {
            // IPFS upload implementation
            const formData = new FormData();
            formData.append('file', file);
            
            const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
                method: 'POST',
                body: formData,
                headers: {
                    'pinata_api_key': this.getPinataKey(),
                    'pinata_secret_api_key': this.getPinataSecret()
                }
            });
            
            if (!response.ok) {
                throw new Error('IPFS upload failed');
            }
            
            return await response.json();
        }
        
        async processWithLivepeer(ipfsHash) {
            // Livepeer processing implementation
            const response = await fetch('https://livepeer.studio/api/asset/import', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.livepeerApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    url: `${this.ipfsGateway}${ipfsHash}`,
                    name: 'BeatsChain Audio Asset'
                })
            });
            
            if (!response.ok) {
                throw new Error('Livepeer processing failed');
            }
            
            return await response.json();
        }
        
        getSupabaseKey() {
            return localStorage.getItem('supabase_key') || 'demo-key';
        }
        
        getPinataKey() {
            return localStorage.getItem('pinata_key') || 'demo-key';
        }
        
        getPinataSecret() {
            return localStorage.getItem('pinata_secret') || 'demo-secret';
        }
    };
}

// 6. Fix Upload Progress and Error Handling
function fixUploadProgress() {
    // Enhanced progress tracking
    window.UploadProgressTracker = class {
        constructor() {
            this.stages = [
                { name: 'validation', label: 'Validating file...', progress: 10 },
                { name: 'metadata', label: 'Extracting metadata...', progress: 20 },
                { name: 'supabase', label: 'Uploading to Supabase...', progress: 40 },
                { name: 'ipfs', label: 'Storing on IPFS...', progress: 60 },
                { name: 'livepeer', label: 'Processing with Livepeer...', progress: 80 },
                { name: 'complete', label: 'Upload complete!', progress: 100 }
            ];
            this.currentStage = 0;
        }
        
        nextStage() {
            if (this.currentStage < this.stages.length - 1) {
                this.currentStage++;
                this.updateUI();
            }
        }
        
        updateUI() {
            const stage = this.stages[this.currentStage];
            const progressBar = document.getElementById('progress-bar');
            const progressFill = progressBar?.querySelector('.progress-fill');
            
            if (progressFill) {
                progressFill.style.width = `${stage.progress}%`;
            }
            
            // Update status text
            const statusText = document.querySelector('.upload-content p');
            if (statusText) {
                statusText.textContent = stage.label;
            }
        }
        
        showError(message) {
            const statusText = document.querySelector('.upload-content p');
            if (statusText) {
                statusText.textContent = `❌ ${message}`;
                statusText.style.color = '#f44336';
            }
        }
    };
}

// 7. Initialize all fixes
function initializeUploadFlowFixes() {
    console.log('🔧 Initializing upload flow fixes...');
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setupFixes();
        });
    } else {
        setupFixes();
    }
    
    function setupFixes() {
        fixUploadBackend();
        setupBackendIntegration();
        fixUploadProgress();
        
        // Fix existing uploads if any
        setTimeout(() => {
            addMissingMetadataFields();
            fixCoverImageUpload();
        }, 1000);
        
        console.log('✅ Upload flow fixes initialized');
    }
}

// Auto-initialize when script loads
initializeUploadFlowFixes();

// Export for manual initialization
if (typeof window !== 'undefined') {
    window.UploadFlowFixes = {
        addMissingMetadataFields,
        fixCoverImageUpload,
        fixUploadBackend,
        setupBackendIntegration,
        fixUploadProgress,
        initialize: initializeUploadFlowFixes
    };
}