/**
 * Enhanced Signature Manager - DocuSign + N8N Integration
 * Minimal implementation for radio package generation
 */

class EnhancedSignatureManager extends SignatureManager {
    constructor() {
        super();
        this.mcpServerUrl = 'https://beatschain-mcp-server-production.up.railway.app';
        this.n8nWebhookUrl = 'https://n8n.beatschain.com/webhook/radio-signature-request';
    }

    async completeSignatures() {
        const contributors = this.getContributors();
        const trackData = this.getTrackData();
        
        if (this.signatureMode === 'docusign') {
            return await this.processDocuSignWorkflow(contributors, trackData);
        } else if (this.signatureMode === 'digital') {
            return await this.processEnhancedDigitalSignatures(contributors, trackData);
        } else {
            return await this.processManualSignatures();
        }
    }

    async processDocuSignWorkflow(contributors, trackData) {
        try {
            // Trigger N8N workflow
            const response = await fetch(this.n8nWebhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contributors,
                    trackData,
                    signatureMode: 'docusign',
                    submissionId: trackData.submissionId
                })
            });

            const result = await response.json();
            
            if (result.success) {
                this.showDocuSignInterface(result.signingUrls, result.envelopeId);
                return true;
            }
        } catch (error) {
            console.error('DocuSign workflow failed:', error);
            return await this.processEnhancedDigitalSignatures(contributors, trackData);
        }
    }

    async processEnhancedDigitalSignatures(contributors, trackData) {
        const signatureData = await this.collectDigitalSignatures();
        
        const response = await fetch(`${this.mcpServerUrl}/api/signatures/radio-process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contributors,
                trackData,
                signatureMode: 'digital_enhanced',
                signatures: signatureData
            })
        });

        const result = await response.json();
        
        if (result.success) {
            this.storeEnhancedSignatures(result);
            this.proceedToPackageGeneration();
            return true;
        }
    }

    showDocuSignInterface(signingUrls, envelopeId) {
        const modal = document.createElement('div');
        modal.className = 'docusign-modal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); z-index: 10000;
            display: flex; align-items: center; justify-content: center;
        `;
        
        modal.innerHTML = `
            <div class="docusign-content" style="background: white; padding: 24px; border-radius: 12px; max-width: 500px; width: 90%;">
                <h3>📝 DocuSign Professional Signatures</h3>
                <p>Legal-grade signatures for SAMRO compliance</p>
                
                <div class="signing-list">
                    ${signingUrls.map(url => `
                        <div style="margin: 12px 0; padding: 12px; border: 1px solid #ddd; border-radius: 6px;">
                            <strong>${url.signerName}</strong><br>
                            <a href="${url.signingUrl}" target="_blank" style="color: #0066cc;">Sign Document →</a>
                        </div>
                    `).join('')}
                </div>
                
                <div style="margin-top: 20px; text-align: center;">
                    <button id="check-status" style="background: #0066cc; color: white; border: none; padding: 10px 20px; border-radius: 6px;">Check Status</button>
                    <button id="close-modal" style="background: #666; color: white; border: none; padding: 10px 20px; border-radius: 6px; margin-left: 10px;">Continue</button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        modal.querySelector('#check-status').onclick = () => this.checkDocuSignStatus(envelopeId);
        modal.querySelector('#close-modal').onclick = () => {
            modal.remove();
            this.proceedToPackageGeneration();
        };
    }

    async checkDocuSignStatus(envelopeId) {
        try {
            const response = await fetch(`${this.mcpServerUrl}/api/signatures/status/${envelopeId}`);
            const result = await response.json();
            
            if (result.success && result.status.status === 'completed') {
                document.querySelector('.docusign-modal')?.remove();
                this.proceedToPackageGeneration();
            } else {
                alert('Signatures still pending. Please complete all signatures.');
            }
        } catch (error) {
            console.error('Status check failed:', error);
        }
    }

    getTrackData() {
        return {
            title: this.app?.radioMetadata?.title || 'Unknown Track',
            artist: this.app?.radioMetadata?.artist || 'Unknown Artist',
            isrc: this.app?.radioMetadata?.isrc || '',
            submissionId: `radio_${Date.now()}`
        };
    }

    async collectDigitalSignatures() {
        const signatures = [];
        for (let [index, signature] of this.signatures) {
            if (signature.signed && !signature.pad.isEmpty()) {
                signatures.push({
                    index,
                    dataUrl: signature.pad.toDataURL(),
                    timestamp: new Date().toISOString()
                });
            }
        }
        return signatures;
    }

    storeEnhancedSignatures(signatureData) {
        const enhanced = {
            ...signatureData,
            legalCompliance: true,
            timestamp: new Date().toISOString()
        };
        
        if (this.app) {
            this.app.radioSignatures = enhanced;
        }
        
        localStorage.setItem('radio-signatures', JSON.stringify(enhanced));
    }

    // Static integration method
    static enhanceApp(app) {
        const enhancedManager = new EnhancedSignatureManager();
        enhancedManager.app = app;
        app.enhancedSignatureManager = enhancedManager;
        
        return enhancedManager;
    }
}

window.EnhancedSignatureManager = EnhancedSignatureManager;