const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFYING ALL COMMANDS\n');
console.log('=' .repeat(60));

let totalCommands = 0;
let validCommands = 0;
let invalidCommands = 0;
const issues = [];

function verifyCommand(filePath) {
    const relativePath = path.relative(process.cwd(), filePath);
    
    try {
        // Clear require cache
        delete require.cache[require.resolve(filePath)];
        
        const command = require(filePath);
        
        // Check if command has required properties
        if (!command.data) {
            issues.push(`❌ ${relativePath} - Missing 'data' property`);
            invalidCommands++;
            return false;
        }
        
        if (!command.execute) {
            issues.push(`❌ ${relativePath} - Missing 'execute' function`);
            invalidCommands++;
            return false;
        }
        
        if (typeof command.execute !== 'function') {
            issues.push(`❌ ${relativePath} - 'execute' is not a function`);
            invalidCommands++;
            return false;
        }
        
        // Check if data has name
        const commandName = command.data.name || command.data._name;
        if (!commandName) {
            issues.push(`❌ ${relativePath} - Missing command name`);
            invalidCommands++;
            return false;
        }
        
        console.log(`✅ ${commandName.padEnd(20)} - ${relativePath}`);
        validCommands++;
        return true;
        
    } catch (error) {
        issues.push(`❌ ${relativePath} - Error: ${error.message}`);
        invalidCommands++;
        return false;
    }
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            scanDirectory(filePath);
        } else if (file.endsWith('.js')) {
            totalCommands++;
            verifyCommand(filePath);
        }
    }
}

// Scan commands directory
const commandsDir = path.join(__dirname, 'src', 'commands');
scanDirectory(commandsDir);

console.log('\n' + '='.repeat(60));
console.log('\n📊 SUMMARY:');
console.log(`Total Commands: ${totalCommands}`);
console.log(`✅ Valid: ${validCommands}`);
console.log(`❌ Invalid: ${invalidCommands}`);

if (issues.length > 0) {
    console.log('\n⚠️  ISSUES FOUND:');
    issues.forEach(issue => console.log(issue));
} else {
    console.log('\n🎉 ALL COMMANDS ARE VALID!');
}

console.log('\n' + '='.repeat(60));

process.exit(invalidCommands > 0 ? 1 : 0);
