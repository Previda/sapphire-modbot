# Fix Duplicate Slash Commands

## Problem
You have duplicate slash commands registered in Discord (e.g., `/daily` appears twice).

## Solution

### Option 1: Automatic Fix (Recommended)

Run the fix script that will:
1. Detect all duplicates
2. Clear all commands
3. Re-register unique commands

```bash
node fix-duplicates.js
```

### Option 2: Manual Fix

#### Step 1: Clear all commands
```bash
node clear-commands.js
```

#### Step 2: Re-register commands
```bash
node deploy-commands.js
```

### Option 3: Using Discord Developer Portal

1. Go to https://discord.com/developers/applications
2. Select your bot application
3. Go to "General Information"
4. Copy your Application ID
5. Visit: `https://discord.com/api/v10/applications/YOUR_APP_ID/commands`
6. Delete duplicate commands manually

## After Fixing

1. **Restart your bot:**
   ```bash
   pm2 restart skyfall-bot
   ```

2. **Wait for propagation:**
   - Global commands take up to 1 hour to update
   - Guild-specific commands update instantly

3. **Verify in Discord:**
   - Type `/` in any channel
   - Check that each command appears only once

## Prevention

To prevent duplicates in the future:

1. **Don't run deploy-commands.js multiple times**
2. **Use the fix script if you see duplicates**
3. **Check the deploy script has duplicate detection** (it does!)

## Troubleshooting

### Commands still duplicated after fix?
- Wait 1 hour for global commands to propagate
- Try clearing Discord cache: Ctrl+Shift+R
- Restart Discord completely

### Script fails with authentication error?
- Check your `.env` file has `DISCORD_BOT_TOKEN`
- Check your `.env` file has `DISCORD_CLIENT_ID`
- Make sure the token is valid

### Some commands missing after fix?
- Check the console output for errors
- Make sure all command files are in `src/commands/`
- Verify command files have proper structure

## Command Structure

Each command file should have:
```javascript
module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname')
        .setDescription('Description'),
    async execute(interaction) {
        // Command logic
    }
};
```

## Need Help?

If you still have issues:
1. Check the console output for errors
2. Verify your environment variables
3. Make sure your bot has proper permissions
4. Try restarting your bot with `pm2 restart skyfall-bot`
