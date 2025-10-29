const play = require('play-dl');

async function setup() {
    console.log('🔧 Setting up play-dl...\n');
    
    try {
        // Check if play-dl is working
        console.log('Testing YouTube search...');
        const results = await play.search('test', { limit: 1 });
        
        if (results && results.length > 0) {
            console.log('✅ YouTube search working!');
            console.log('   Found:', results[0].title);
            
            // Test streaming
            console.log('\nTesting stream...');
            const stream = await play.stream(results[0].url);
            
            if (stream) {
                console.log('✅ Streaming working!');
                console.log('   Stream type:', stream.type);
            }
        }
        
        console.log('\n✅ play-dl is configured correctly!');
        console.log('\n📝 If music still doesn\'t work, you may need to:');
        console.log('   1. Update play-dl: npm install play-dl@latest');
        console.log('   2. Install @snazzah/davey: npm install @snazzah/davey');
        console.log('   3. Restart bot: pm2 restart skyfall-bot');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('\n🔧 Troubleshooting:');
        console.error('   1. Update play-dl: npm install play-dl@latest');
        console.error('   2. Check internet connection');
        console.error('   3. YouTube might be rate limiting');
        console.error('\n📝 Error details:', error);
    }
}

setup();
