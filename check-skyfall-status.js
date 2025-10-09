#!/usr/bin/env node

const https = require('https');
const http = require('http');

console.log('📊 SKYFALL - System Status Check');
console.log('===============================\n');

async function checkPiBot() {
    return new Promise((resolve) => {
        const req = http.get('http://192.168.1.62:3004/api/status', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('✅ Pi Bot: Online');
                    console.log(`   📊 Guilds: ${parsed.guilds || 'N/A'}`);
                    console.log(`   👥 Users: ${parsed.users || 'N/A'}`);
                    console.log(`   📋 Commands: ${parsed.commands || 'N/A'}`);
                    resolve(true);
                } catch (error) {
                    console.log('❌ Pi Bot: API Error');
                    resolve(false);
                }
            });
        });
        
        req.on('error', () => {
            console.log('❌ Pi Bot: Connection Failed');
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Pi Bot: Timeout');
            req.destroy();
            resolve(false);
        });
    });
}

async function checkVercelSite() {
    return new Promise((resolve) => {
        const req = https.get('https://skyfall-omega.vercel.app/api/test-live', (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    console.log('✅ Vercel Site: Online');
                    console.log(`   🤖 Bot Name: ${parsed.botName || 'N/A'}`);
                    console.log(`   🔗 Pi URL: ${parsed.piUrl || 'N/A'}`);
                    console.log(`   📡 Connection: ${parsed.success ? 'Success' : 'Fallback'}`);
                    resolve(true);
                } catch (error) {
                    console.log('❌ Vercel Site: API Error');
                    resolve(false);
                }
            });
        });
        
        req.on('error', () => {
            console.log('❌ Vercel Site: Connection Failed');
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            console.log('❌ Vercel Site: Timeout');
            req.destroy();
            resolve(false);
        });
    });
}

async function main() {
    console.log('🔍 Checking system status...\n');
    
    const piStatus = await checkPiBot();
    const vercelStatus = await checkVercelSite();
    
    console.log('\n📋 SUMMARY:');
    console.log('==========');
    console.log(`Pi Bot API: ${piStatus ? '✅ Working' : '❌ Issues'}`);
    console.log(`Vercel Site: ${vercelStatus ? '✅ Working' : '❌ Issues'}`);
    
    if (piStatus && vercelStatus) {
        console.log('\n🎉 ALL SYSTEMS OPERATIONAL!');
        console.log('Your Skyfall ecosystem is fully functional.');
    } else {
        console.log('\n⚠️ Some issues detected. Check the logs above.');
    }
}

main();
