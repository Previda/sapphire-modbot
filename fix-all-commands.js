const fs = require('fs');
const path = require('path');

console.log('🔧 Checking all command files for errors...\n');

let totalCommands = 0;
let errorCommands = 0;
const errors = [];

function checkCommands(dir) {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            checkCommands(filePath);
        } else if (file.endsWith('.js')) {
            totalCommands++;
            try {
                // Clear require cache
                delete require.cache[require.resolve(filePath)];
                
                const command = require(filePath);
                
                // Check if command has required properties
                if (!command.data) {
                    errors.push({
                        file: filePath,
                        error: 'Missing "data" property'
                    });
                    errorCommands++;
                    console.log(`❌ ${file}: Missing "data" property`);
                } else if (!command.execute) {
                    errors.push({
                        file: filePath,
                        error: 'Missing "execute" function'
                    });
                    errorCommands++;
                    console.log(`❌ ${file}: Missing "execute" function`);
                } else if (!command.data.name) {
                    errors.push({
                        file: filePath,
                        error: 'Missing command name'
                    });
                    errorCommands++;
                    console.log(`❌ ${file}: Missing command name`);
                } else {
                    console.log(`✅ ${file}: OK (/${command.data.name})`);
                }
            } catch (error) {
                errors.push({
                    file: filePath,
                    error: error.message
                });
                errorCommands++;
                console.log(`❌ ${file}: ${error.message}`);
            }
        }
    }
}

const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    checkCommands(commandsPath);
}

console.log(`\n📊 Summary:`);
console.log(`   Total commands: ${totalCommands}`);
console.log(`   Working commands: ${totalCommands - errorCommands}`);
console.log(`   Broken commands: ${errorCommands}`);

if (errorCommands > 0) {
    console.log(`\n❌ Found ${errorCommands} command(s) with errors:`);
    errors.forEach(err => {
        console.log(`   - ${path.basename(err.file)}: ${err.error}`);
    });
    console.log(`\n💡 Fix these commands and run: node deploy-commands.js`);
    process.exit(1);
} else {
    console.log(`\n✅ All commands are working!`);
    console.log(`💡 Run: node fix-duplicates.js to remove duplicates`);
    console.log(`💡 Then: pm2 restart skyfall-bot`);
}
