#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Find all files with w3m-button
const output = execSync('grep -r "w3m-button" /workspaces/beatx/packages/app/src --include="*.tsx" --include="*.ts" -l', { encoding: 'utf8' });
const files = output.split('\n').filter(f => f.trim());

console.log('Files with w3m-button:', files);

const clientImport = `import { ConnectButton } from 'thirdweb/react'
import { createThirdwebClient } from 'thirdweb'

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID || '53c6d7d26b476a57e09e7706265a60bb'
})`;

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already has ConnectButton
  if (content.includes('ConnectButton')) {
    console.log(`Skipping ${filePath} - already has ConnectButton`);
    return;
  }
  
  // Add ThirdWeb imports at the top
  if (content.includes('import React')) {
    content = content.replace(
      /import React[^;]*;/,
      `import React from 'react'
${clientImport}`
    );
  } else if (content.includes("'use client'")) {
    content = content.replace(
      "'use client'",
      `'use client'

${clientImport}`
    );
  } else {
    // Add at the beginning
    content = `${clientImport}

${content}`;
  }
  
  // Replace w3m-button with ConnectButton
  content = content.replace(/<w3m-button[^>]*\/>/g, '<ConnectButton client={client} />');
  content = content.replace(/<w3m-button[^>]*><\/w3m-button>/g, '<ConnectButton client={client} />');
  
  // Replace document.querySelector('w3m-button') with null (since it won't exist)
  content = content.replace(/document\.querySelector\(['"]w3m-button['"]\)/g, 'null');
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
});

console.log('All w3m-button usages fixed!');