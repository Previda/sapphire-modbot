// Quick test for music dependencies
const ytdl = require('@distube/ytdl-core');
const ytsr = require('youtube-sr').default;

async function test() {
    console.log('Testing ytdl-core...');
    try {
        const valid = ytdl.validateURL('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
        console.log('✅ ytdl-core loaded:', valid);
    } catch (error) {
        console.error('❌ ytdl-core error:', error.message);
    }

    console.log('\nTesting youtube-sr...');
    try {
        const results = await ytsr.search('test song', { limit: 1 });
        console.log('✅ youtube-sr loaded:', results.length > 0);
        if (results.length > 0) {
            console.log('   Found:', results[0].title);
        }
    } catch (error) {
        console.error('❌ youtube-sr error:', error.message);
    }
}

test().then(() => {
    console.log('\n✅ All tests complete!');
    process.exit(0);
}).catch(err => {
    console.error('\n❌ Test failed:', err);
    process.exit(1);
});
