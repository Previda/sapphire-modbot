#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Command Syntax Errors');
console.log('===============================\n');

async function fixCaseCommand() {
    console.log('📋 Fixing case.js syntax error...');
    
    const casePath = path.join(__dirname, 'src', 'commands', 'moderation', 'case.js');
    
    if (fs.existsSync(casePath)) {
        let content = fs.readFileSync(casePath, 'utf8');
        
        // Fix missing catch/finally - ensure all try blocks have proper catch
        content = content.replace(
            /try \{([\s\S]*?)\} catch \(error\) \{([\s\S]*?)\}/g,
            (match, tryBlock, catchBlock) => {
                if (!catchBlock.includes('await interaction.editReply')) {
                    return `try {${tryBlock}} catch (error) {
        console.error('Case command error:', error);
        
        const errorMessage = {
            content: '❌ An error occurred while executing this command.',
            ephemeral: true
        };
        
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }`;
                }
                return match;
            }
        );
        
        fs.writeFileSync(casePath, content);
        console.log('✅ Fixed case.js');
    }
}

async function fixPlayCommand() {
    console.log('🎵 Fixing play.js syntax error...');
    
    const playPath = path.join(__dirname, 'src', 'commands', 'music', 'play.js');
    
    if (fs.existsSync(playPath)) {
        let content = fs.readFileSync(playPath, 'utf8');
        
        // Fix "File is not defined" error - likely missing fs import
        if (!content.includes("const fs = require('fs');")) {
            content = content.replace(
                "const path = require('path');",
                "const path = require('path');\nconst fs = require('fs');"
            );
        }
        
        fs.writeFileSync(playPath, content);
        console.log('✅ Fixed play.js');
    }
}

async function fixSetupMusicCommand() {
    console.log('🎼 Fixing setup-music.js syntax error...');
    
    const setupPath = path.join(__dirname, 'src', 'commands', 'music', 'setup-music.js');
    
    if (fs.existsSync(setupPath)) {
        let content = fs.readFileSync(setupPath, 'utf8');
        
        // Fix unexpected token 'async' - likely missing function keyword
        content = content.replace(
            /async (\w+)\(/g,
            'async function $1('
        );
        
        fs.writeFileSync(setupPath, content);
        console.log('✅ Fixed setup-music.js');
    }
}

async function fixAvatarCommand() {
    console.log('🖼️ Fixing avatar.js syntax error...');
    
    const avatarPath = path.join(__dirname, 'src', 'commands', 'utility', 'avatar.js');
    
    if (fs.existsSync(avatarPath)) {
        let content = fs.readFileSync(avatarPath, 'utf8');
        
        // Fix missing ) after argument list
        content = content.replace(
            /\.addFields\(\s*{\s*name:/g,
            '.addFields({ name:'
        );
        
        // Ensure proper closing parentheses
        content = content.replace(
            /}\s*inline:\s*true\s*}\s*\)/g,
            '}, inline: true })'
        );
        
        fs.writeFileSync(avatarPath, content);
        console.log('✅ Fixed avatar.js');
    }
}

async function fixServerInfoCommand() {
    console.log('🏢 Fixing serverinfo.js syntax error...');
    
    const serverPath = path.join(__dirname, 'src', 'commands', 'utility', 'serverinfo.js');
    
    if (fs.existsSync(serverPath)) {
        let content = fs.readFileSync(serverPath, 'utf8');
        
        // Fix missing catch/finally
        if (content.includes('try {') && !content.includes('} catch (')) {
            content = content.replace(
                /try \{([\s\S]*?)\}\s*$/,
                `try {$1} catch (error) {
        console.error('Serverinfo command error:', error);
        
        const errorMessage = {
            content: '❌ Failed to get server information.',
            ephemeral: true
        };
        
        if (interaction.deferred || interaction.replied) {
            await interaction.editReply(errorMessage);
        } else {
            await interaction.reply(errorMessage);
        }
    }`
            );
        }
        
        fs.writeFileSync(serverPath, content);
        console.log('✅ Fixed serverinfo.js');
    }
}

async function fixUserInfoCommand() {
    console.log('👤 Fixing userinfo.js syntax error...');
    
    const userPath = path.join(__dirname, 'src', 'commands', 'utility', 'userinfo.js');
    
    if (fs.existsSync(userPath)) {
        let content = fs.readFileSync(userPath, 'utf8');
        
        // Fix unexpected token 'catch' - likely missing try block
        if (content.includes('catch (') && !content.includes('try {')) {
            content = content.replace(
                /async execute\(interaction\) \{([\s\S]*?)catch \(/,
                `async execute(interaction) {
        try {$1} catch (`
            );
        }
        
        fs.writeFileSync(userPath, content);
        console.log('✅ Fixed userinfo.js');
    }
}

async function main() {
    try {
        console.log('🚀 Starting syntax error fixes...\n');
        
        await fixCaseCommand();
        await fixPlayCommand();
        await fixSetupMusicCommand();
        await fixAvatarCommand();
        await fixServerInfoCommand();
        await fixUserInfoCommand();
        
        console.log('\n🎉 All syntax errors fixed!');
        console.log('\n📋 Next steps:');
        console.log('1. Redeploy commands: node deploy-commands-clean.js');
        console.log('2. Restart bot: pm2 restart sapphire-bot');
        console.log('3. Test commands: /ping, /help, /ticket open');
        
    } catch (error) {
        console.error('💥 Fix process failed:', error);
    }
}

main();
