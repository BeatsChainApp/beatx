import fs from 'fs';
import path from 'path';

// SAMRO PDF processing service
export async function generatePDF(data: any) {
  // Use existing SAMRO PDF from chrome-extension/assets/
  const templatePath = path.resolve('./chrome-extension/assets/Composer-Split-Confirmation.pdf');
  
  if (!fs.existsSync(templatePath)) {
    throw new Error('SAMRO PDF template not found at: ' + templatePath);
  }
  
  const pdfBytes = fs.readFileSync(templatePath);
  
  // Create filled PDF data structure
  const filledData = {
    originalPDF: pdfBytes,
    userData: data,
    fillInstructions: generateFillInstructions(data),
    metadata: {
      generated: new Date().toISOString(),
      template: 'SAMRO-Composer-Split-Confirmation',
      version: '1.0'
    }
  };
  
  return filledData;
}

export async function fillSAMROForm(userData: any, contributors: any[]) {
  // Generate SAMRO form completion instructions
  const instructions = {
    trackInfo: {
      title: userData.trackTitle || 'Track Title',
      artist: userData.artistName || 'Artist Name',
      isrc: userData.isrc || 'ZA-80G-25-XXXXX'
    },
    contributors: contributors.map(c => ({
      name: c.name || 'Contributor Name',
      percentage: c.percentage || 0,
      role: c.role || 'Composer'
    })),
    completion: [
      '1. Print the SAMRO Composer Split Confirmation PDF',
      '2. Fill in track title: ' + (userData.trackTitle || '[Track Title]'),
      '3. Fill in artist name: ' + (userData.artistName || '[Artist Name]'),
      '4. Add ISRC code: ' + (userData.isrc || '[ISRC Code]'),
      '5. List all contributors with percentages',
      '6. Ensure percentages total 100%',
      '7. Sign and date the form',
      '8. Submit to SAMRO for processing'
    ]
  };
  
  return instructions;
}

function generateFillInstructions(data: any) {
  return [
    'SAMRO PDF Completion Instructions:',
    '1. Track Title: ' + (data.trackTitle || '[Enter track title]'),
    '2. Artist Name: ' + (data.artistName || '[Enter artist name]'),
    '3. ISRC Code: ' + (data.isrc || '[Generate ISRC first]'),
    '4. Contributors: Add all composers/writers',
    '5. Percentages: Must total 100%',
    '6. Signatures: All contributors must sign',
    '7. Date: Current date',
    '8. Submit: Send to SAMRO for registration'
  ].join('\n');
}