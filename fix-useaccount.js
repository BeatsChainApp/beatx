#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Find all files with useAccount
const files = execSync('grep -r "useAccount" /workspaces/beatx/packages/app/src --include="*.tsx" --include="*.ts" -l', { encoding: 'utf8' })
  .split('\n')
  .filter(f => f.trim());

console.log('Files to fix:', files);

files.forEach(filePath => {
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Skip if already using useActiveAccount
  if (content.includes('useActiveAccount')) {
    console.log(`Skipping ${filePath} - already uses useActiveAccount`);
    return;
  }
  
  // Add ThirdWeb import if not present
  if (!content.includes('useActiveAccount')) {
    if (content.includes("from 'thirdweb/react'")) {
      // Add to existing import
      content = content.replace(
        /import\s*{\s*([^}]+)\s*}\s*from\s*['"]thirdweb\/react['"]/,
        (match, imports) => {
          if (!imports.includes('useActiveAccount')) {
            return `import { ${imports.trim()}, useActiveAccount } from 'thirdweb/react'`;
          }
          return match;
        }
      );
    } else {
      // Add new import after other imports
      const importMatch = content.match(/^(import.*\n)+/m);
      if (importMatch) {
        const lastImportIndex = importMatch.index + importMatch[0].length;
        content = content.slice(0, lastImportIndex) + 
                 "import { useActiveAccount } from 'thirdweb/react'\n" + 
                 content.slice(lastImportIndex);
      }
    }
  }
  
  // Replace useAccount destructuring with useActiveAccount
  content = content.replace(
    /const\s*{\s*address[^}]*}\s*=\s*useAccount\(\)/g,
    'const account = useActiveAccount()\n  const address = account?.address'
  );
  
  // Replace simple useAccount calls
  content = content.replace(
    /const\s*{\s*address\s*}\s*=\s*useAccount\(\)/g,
    'const account = useActiveAccount()\n  const address = account?.address'
  );
  
  fs.writeFileSync(filePath, content);
  console.log(`Fixed ${filePath}`);
});

console.log('All useAccount imports fixed!');