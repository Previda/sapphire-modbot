/**
 * Command Validation Test Script
 * Tests all commands for proper structure and syntax
 */

const fs = require('fs');
const path = require('path');

let totalCommands = 0;
let validCommands = 0;
let invalidCommands = [];
let warnings = [];

function validateCommand(filePath, command, fileName) {
    const issues = [];
    
    // Check required properties
    if (!command.data) {
        issues.push('Missing "data" property');
    } else {
        if (!command.data.name) {
            issues.push('Missing "name" in data');
        }
        if (!command.data.description) {
            issues.push('Missing "description" in data');
        }
    }
    
    if (!command.execute) {
        issues.push('Missing "execute" function');
    } else if (typeof command.execute !== 'function') {
        issues.push('"execute" is not a function');
    }
    
    return issues;
}

function testCommands(dir, category = '') {
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory()) {
            testCommands(filePath, file);
        } else if (file.endsWith('.js')) {
            totalCommands++;
            
            try {
                // Clear cache
                delete require.cache[require.resolve(filePath)];
                
                const command = require(filePath);
                const issues = validateCommand(filePath, command, file);
                
                if (issues.length === 0) {
                    validCommands++;
                    console.log(`✅ ${category}/${file} - ${command.data?.name || 'unnamed'}`);
                } else {
                    invalidCommands.push({
                        file: `${category}/${file}`,
                        issues: issues
                    });
                    console.log(`❌ ${category}/${file}`);
                    issues.forEach(issue => console.log(`   - ${issue}`));
                }
                
                // Check for common issues
                if (command.execute) {
                    const executeStr = command.execute.toString();
                    
                    // Check for missing defer
                    if (executeStr.includes('interaction.reply') && 
                        !executeStr.includes('deferReply') && 
                        !executeStr.includes('defer')) {
                        warnings.push({
                            file: `${category}/${file}`,
                            warning: 'May need deferReply for long operations'
                        });
                    }
                    
                    // Check for missing error handling
                    if (!executeStr.includes('try') && !executeStr.includes('catch')) {
                        warnings.push({
                            file: `${category}/${file}`,
                            warning: 'Missing try-catch error handling'
                        });
                    }
                }
                
            } catch (error) {
                invalidCommands.push({
                    file: `${category}/${file}`,
                    issues: [`Syntax error: ${error.message}`]
                });
                console.log(`❌ ${category}/${file} - SYNTAX ERROR`);
                console.log(`   - ${error.message}`);
            }
        }
    }
}

console.log('🔍 Testing all commands...\n');

const commandsPath = path.join(__dirname, 'src', 'commands');
if (fs.existsSync(commandsPath)) {
    testCommands(commandsPath);
}

// Test root verification command
const verificationPath = path.join(__dirname, 'verification.js');
if (fs.existsSync(verificationPath)) {
    totalCommands++;
    try {
        const command = require(verificationPath);
        const issues = validateCommand(verificationPath, command, 'verification.js');
        
        if (issues.length === 0) {
            validCommands++;
            console.log(`✅ root/verification.js - ${command.data?.name || 'unnamed'}`);
        } else {
            invalidCommands.push({
                file: 'root/verification.js',
                issues: issues
            });
            console.log(`❌ root/verification.js`);
            issues.forEach(issue => console.log(`   - ${issue}`));
        }
    } catch (error) {
        invalidCommands.push({
            file: 'root/verification.js',
            issues: [`Syntax error: ${error.message}`]
        });
        console.log(`❌ root/verification.js - SYNTAX ERROR`);
    }
}

// Print summary
console.log('\n' + '='.repeat(60));
console.log('📊 COMMAND TEST SUMMARY');
console.log('='.repeat(60));
console.log(`Total Commands: ${totalCommands}`);
console.log(`✅ Valid: ${validCommands}`);
console.log(`❌ Invalid: ${invalidCommands.length}`);
console.log(`⚠️  Warnings: ${warnings.length}`);
console.log('='.repeat(60));

if (invalidCommands.length > 0) {
    console.log('\n❌ INVALID COMMANDS:');
    invalidCommands.forEach(cmd => {
        console.log(`\n${cmd.file}:`);
        cmd.issues.forEach(issue => console.log(`  - ${issue}`));
    });
}

if (warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    warnings.forEach(warn => {
        console.log(`\n${warn.file}:`);
        console.log(`  - ${warn.warning}`);
    });
}

if (invalidCommands.length === 0) {
    console.log('\n✅ All commands are valid and ready to use!');
    process.exit(0);
} else {
    console.log('\n❌ Some commands have issues that need to be fixed.');
    process.exit(1);
}
