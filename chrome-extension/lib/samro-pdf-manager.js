/**
 * SAMRO PDF Manager - Auto-fill Composer Split Confirmation PDF
 * Handles automatic population of SAMRO official forms with user data
 */

class SAMROPDFManager {
    constructor() {
        this.pdfPath = '/assets/Composer-Split-Confirmation.pdf';
        this.initialized = false;
    }

    async initialize() {
        if (this.initialized) return;
        
        try {
            // Verify PDF exists
            const response = await fetch(chrome.runtime.getURL('assets/Composer-Split-Confirmation.pdf'));
            if (!response.ok) {
                throw new Error(`SAMRO PDF not found: ${response.status}`);
            }
            
            this.initialized = true;
            console.log('✅ SAMRO PDF Manager initialized');
        } catch (error) {
            console.error('❌ SAMRO PDF Manager initialization failed:', error);
            throw error;
        }
    }

    async generateFilledPDF(userData, contributorsData) {
        try {
            if (!this.initialized) {
                await this.initialize();
            }

            // Load the original PDF
            const response = await fetch(chrome.runtime.getURL('assets/Composer-Split-Confirmation.pdf'));
            const pdfBytes = await response.arrayBuffer();

            // Create filled PDF content (text overlay approach)
            const filledPDFData = await this.createFilledPDFData(userData, contributorsData);
            
            // For now, return the original PDF with metadata
            // In a full implementation, would use PDF-lib to fill form fields
            return {
                pdfBlob: new Blob([pdfBytes], { type: 'application/pdf' }),
                metadata: filledPDFData,
                filename: 'SAMRO-Composer-Split-Confirmation-Filled.pdf'
            };

        } catch (error) {
            console.error('❌ SAMRO PDF generation failed:', error);
            throw error;
        }
    }

    async createFilledPDFData(userData, contributorsData) {
        const today = new Date().toLocaleDateString();
        const createdBy = `BeatsChain Chrome Extension v${chrome.runtime?.getManifest()?.version || '2.0.0'}`;
        
        return {
            date: today,
            compositionTitle: userData.trackTitle || userData.title || 'Untitled Track',
            composers: this.formatComposers(contributorsData),
            filledAt: new Date().toISOString(),
            generatedBy: createdBy,
            createdBy: createdBy,
            disclaimer: 'This document shall not be construed as legal advice. The purpose of the document is solely to record the percentage splits in the composition.',
            instructions: {
                step1: 'Print this document',
                step2: 'Fill in any missing information by hand',
                step3: 'Sign in the designated signature areas',
                step4: 'Submit to SAMRO with your music registration',
                step5: 'Keep copies for all parties involved'
            },
            packageInfo: {
                createdBy: createdBy,
                packageType: 'Radio Submission Package',
                compliance: 'SAMRO South African Music Rights Organisation'
            }
        };
    }

    formatComposers(contributorsData) {
        if (!contributorsData || contributorsData.length === 0) {
            return [{
                name: 'Unknown Composer',
                contribution: 'Music and Lyrics',
                percentage: '100%',
                signature: '_________________________',
                idNumber: '_________________________'
            }];
        }

        return contributorsData.map(contributor => ({
            name: contributor.name || 'Unknown',
            contribution: this.mapRoleToContribution(contributor.role),
            percentage: `${contributor.percentage || 0}%`,
            signature: '_________________________',
            idNumber: contributor.idNumber || '_________________________',
            samroNumber: contributor.samroNumber || 'Not provided',
            idType: this.detectIdType(contributor.idNumber)
        }));
    }

    mapRoleToContribution(role) {
        const roleMapping = {
            'artist': 'Performance and Vocals',
            'producer': 'Music Production',
            'songwriter': 'Music and Lyrics',
            'vocalist': 'Vocals and Performance'
        };
        
        return roleMapping[role] || 'Music and Lyrics';
    }
    
    detectIdType(idNumber) {
        if (!idNumber) return 'Not provided';
        
        const saIdPattern = /^[0-9]{13}$/;
        const passportPattern = /^[A-Z0-9]{6,9}$/;
        
        if (saIdPattern.test(idNumber)) {
            return 'South African ID';
        } else if (passportPattern.test(idNumber)) {
            return 'Passport';
        } else {
            return 'Invalid format';
        }
    }

    generateInstructionSheet(userData, contributorsData) {
        const composers = this.formatComposers(contributorsData);
        const totalPercentage = composers.reduce((sum, c) => sum + parseFloat(c.percentage), 0);
        const createdBy = `BeatsChain Chrome Extension v${chrome.runtime?.getManifest()?.version || '2.0.0'}`;

        return `SAMRO COMPOSER SPLIT CONFIRMATION - COMPLETION INSTRUCTIONS

═══════════════════════════════════════════════════════════════
TRACK INFORMATION
═══════════════════════════════════════════════════════════════

Generated: ${new Date().toLocaleString()}
Track: "${userData.trackTitle || userData.title || 'Untitled Track'}"
Artist: ${userData.artistName || userData.artist || 'Unknown Artist'}
Created by: ${createdBy}

═══════════════════════════════════════════════════════════════
FORM COMPLETION CHECKLIST
═══════════════════════════════════════════════════════════════

□ Date field: ${new Date().toLocaleDateString()}
□ Composition title: "${userData.trackTitle || userData.title || 'Untitled Track'}"

COMPOSER INFORMATION:
${composers.map((composer, index) => `
□ Composer ${index + 1}:
  Name: ${composer.name}
  Contribution: ${composer.contribution}
  Split: ${composer.percentage}
  SAMRO Number: ${composer.samroNumber}
  Signature: [Sign here]
  ID/Passport: [Fill in manually]
`).join('')}

═══════════════════════════════════════════════════════════════
VERIFICATION CHECKLIST
═══════════════════════════════════════════════════════════════

□ Total percentage: ${totalPercentage}% (Must equal 100%)
□ All signatures completed
□ All ID/Passport numbers filled
□ Date signed
□ All composer names match contributors

═══════════════════════════════════════════════════════════════
SUBMISSION PROCESS
═══════════════════════════════════════════════════════════════

□ Submit to SAMRO with music registration
□ Keep copy for your records
□ Include with radio submission package
□ Ensure all parties receive copies

═══════════════════════════════════════════════════════════════
CONTACT SAMRO
═══════════════════════════════════════════════════════════════

Website: https://samro.org.za
Email: info@samro.org.za
Phone: +27 11 712 8000

═══════════════════════════════════════════════════════════════
CREATED BY
═══════════════════════════════════════════════════════════════

${createdBy}
Radio Submission Package Generator
Professional Music Industry Tools

═══════════════════════════════════════════════════════════════
`;
    }

    async createSAMROPackage(userData, contributorsData) {
        try {
            const filledPDF = await this.generateFilledPDF(userData, contributorsData);
            const instructions = this.generateInstructionSheet(userData, contributorsData);
            
            return {
                pdf: filledPDF,
                instructions: {
                    content: instructions,
                    filename: 'SAMRO-Completion-Instructions.txt'
                },
                metadata: filledPDF.metadata
            };

        } catch (error) {
            console.error('❌ SAMRO package creation failed:', error);
            throw error;
        }
    }

    // Validate SAMRO compliance
    validateSAMROCompliance(contributorsData) {
        const validation = {
            isValid: true,
            errors: [],
            warnings: []
        };

        if (!contributorsData || contributorsData.length === 0) {
            validation.isValid = false;
            validation.errors.push('At least one composer must be specified');
            return validation;
        }

        // Check total percentage
        const totalPercentage = contributorsData.reduce((sum, c) => sum + (c.percentage || 0), 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
            validation.isValid = false;
            validation.errors.push(`Total percentage must equal 100% (current: ${totalPercentage}%)`);
        }

        // Check required fields including ID numbers
        contributorsData.forEach((contributor, index) => {
            if (!contributor.name || contributor.name.trim().length < 2) {
                validation.isValid = false;
                validation.errors.push(`Composer ${index + 1}: Name is required`);
            }

            if (!contributor.percentage || contributor.percentage <= 0) {
                validation.isValid = false;
                validation.errors.push(`Composer ${index + 1}: Valid percentage is required`);
            }
            
            // ID number validation (critical for SAMRO compliance)
            if (!contributor.idNumber || contributor.idNumber.trim().length === 0) {
                validation.isValid = false;
                validation.errors.push(`Composer ${index + 1}: ID/Passport number is required for SAMRO compliance`);
            } else {
                // Validate ID format
                const saIdPattern = /^[0-9]{13}$/;
                const passportPattern = /^[A-Z0-9]{6,9}$/;
                if (!saIdPattern.test(contributor.idNumber) && !passportPattern.test(contributor.idNumber)) {
                    validation.isValid = false;
                    validation.errors.push(`Composer ${index + 1}: Invalid ID format (SA ID: 13 digits, Passport: 6-9 alphanumeric)`);
                }
            }

            if (!contributor.samroNumber || contributor.samroNumber.trim().length === 0) {
                validation.warnings.push(`Composer ${index + 1}: SAMRO number not provided (optional but recommended)`);
            }
        });

        return validation;
    }
}

// Export for Chrome extension compatibility
window.SAMROPDFManager = SAMROPDFManager;