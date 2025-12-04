#!/usr/bin/env node

const fs = require('fs');
const { execSync } = require('child_process');

// Find all files with useAccount() calls
const output = execSync('grep -r "useAccount()" /workspaces/beatx/packages/app/src --include="*.tsx" --include="*.ts" -l', { encoding: 'utf8' });
const files = output.split('\n').filter(f => f.trim());

console.log('Files with useAccount() calls:', files);

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace useAccount() calls
  content = content.replace(
    /const\s*{\s*address\s*}\s*=\s*useAccount\(\)/g,
    'const account = useActiveAccount()\n  const address = account?.address'
  );
  
  // Replace more complex destructuring
  content = content.replace(
    /const\s*{\s*address,\s*isConnected\s*}\s*=\s*useAccount\(\)/g,
    'const account = useActiveAccount()\n  const address = account?.address\n  const isConnected = !!account'
  );
  
  content = content.replace(
    /const\s*{\s*address,\s*isConnected,\s*chainId\s*}\s*=\s*useAccount\(\)/g,
    'const account = useActiveAccount()\n  const address = account?.address\n  const isConnected = !!account\n  const chainId = account?.chainId'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
});

console.log('All remaining useAccount() calls fixed!');