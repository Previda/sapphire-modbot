#!/usr/bin/env node

// Simple interactive config helper for Skyfall
// Lets you configure bot token and website/Pi connection via CLI.

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rootDir = __dirname;
const ENV_FILES = ['.env', '.env.local'];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  const content = fs.readFileSync(filePath, 'utf8');
  const env = {};

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIndex = trimmed.indexOf('=');
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const value = trimmed.slice(eqIndex + 1).trim();
    env[key] = value;
  }

  return env;
}

function writeEnvFile(filePath, env) {
  const lines = Object.entries(env).map(([key, value]) => `${key}=${value}`);
  fs.writeFileSync(filePath, lines.join('\n') + '\n', 'utf8');
}

function getCombinedEnv() {
  const combined = {};
  for (const file of ENV_FILES) {
    const filePath = path.join(rootDir, file);
    const env = readEnvFile(filePath);
    Object.assign(combined, env);
  }
  return combined;
}

function applyUpdates(updates) {
  for (const file of ENV_FILES) {
    const filePath = path.join(rootDir, file);
    const existing = readEnvFile(filePath);
    const next = { ...existing, ...updates };
    writeEnvFile(filePath, next);
    console.log(`➡️  Updated ${file} with: ${Object.keys(updates).join(', ')}`);
  }
}

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

function ask(rl, question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function configureBotToken(rl) {
  console.log('\n=== Discord Bot Token (Backend) ===');
  const env = getCombinedEnv();
  console.log(`Current DISCORD_BOT_TOKEN: ${env.DISCORD_BOT_TOKEN ? '(set)' : '(not set)'}`);

  const token = await ask(rl, 'Enter Discord bot token (leave blank to keep current): ');
  if (!token) {
    console.log('No changes made to bot token.');
    return;
  }

  applyUpdates({ DISCORD_BOT_TOKEN: token });
  console.log('✅ Bot token saved. Make sure to restart the bot process.');
}

async function configureWebsiteAndPi(rl) {
  console.log('\n=== Website & Pi Connection (Dashboard) ===');
  const env = getCombinedEnv();

  console.log(`Current NEXTAUTH_URL: ${env.NEXTAUTH_URL || '(not set)'}`);
  console.log(`Current PI_BOT_API_URL: ${env.PI_BOT_API_URL || '(not set)'}`);
  console.log(`Current PI_BOT_TOKEN: ${env.PI_BOT_TOKEN ? '(set)' : '(not set)'}`);

  const nextUrl = await ask(
    rl,
    'Dashboard URL (NEXTAUTH_URL) e.g. https://your-site.vercel.app or http://localhost:3000 (blank = keep): '
  );
  const piUrl = await ask(
    rl,
    'Pi bot API URL (PI_BOT_API_URL) e.g. https://<your-tunnel>.ngrok-free.app (blank = keep): '
  );
  const piToken = await ask(
    rl,
    'Pi bot API token (PI_BOT_TOKEN) (blank = keep, type none to clear): '
  );

  console.log('\nOptional: Discord OAuth (used by website login)');
  console.log(`Current DISCORD_CLIENT_ID: ${env.DISCORD_CLIENT_ID || '(not set)'}`);
  console.log(`Current DISCORD_CLIENT_SECRET: ${env.DISCORD_CLIENT_SECRET ? '(set)' : '(not set)'}`);
  console.log(`Current NEXTAUTH_SECRET: ${env.NEXTAUTH_SECRET ? '(set)' : '(not set)'}`);

  const discordClientId = await ask(rl, 'Discord client ID (blank = keep): ');
  const discordClientSecret = await ask(rl, 'Discord client secret (blank = keep): ');
  const nextAuthSecret = await ask(rl, 'NextAuth secret (NEXTAUTH_SECRET) (blank = keep): ');

  const updates = {};
  if (nextUrl) updates.NEXTAUTH_URL = nextUrl;
  if (piUrl) updates.PI_BOT_API_URL = piUrl;
  if (piToken.toLowerCase() === 'none') updates.PI_BOT_TOKEN = '';
  else if (piToken) updates.PI_BOT_TOKEN = piToken;

  if (discordClientId) {
    updates.DISCORD_CLIENT_ID = discordClientId;
    updates.NEXT_PUBLIC_DISCORD_CLIENT_ID = discordClientId;
  }
  if (discordClientSecret) updates.DISCORD_CLIENT_SECRET = discordClientSecret;
  if (nextAuthSecret) updates.NEXTAUTH_SECRET = nextAuthSecret;

  if (Object.keys(updates).length === 0) {
    console.log('No changes made.');
    return;
  }

  applyUpdates(updates);
  console.log('✅ Website / Pi configuration saved.');
  console.log('   Remember: in production (Vercel), also update these in your project environment settings.');
}

async function main() {
  console.log('Skyfall Configuration Helper');
  console.log('-------------------------------------');
  console.log('This will create or update .env and .env.local in this folder.');

  const rl = createInterface();

  while (true) {
    console.log('\nSelect what you want to configure:');
    console.log('  1) Discord bot token (backend)');
    console.log('  2) Website & Pi connection (dashboard)');
    console.log('  3) Exit');

    const choice = await ask(rl, 'Enter choice [1-3]: ');

    if (choice === '1') {
      await configureBotToken(rl);
    } else if (choice === '2') {
      await configureWebsiteAndPi(rl);
    } else if (choice === '3' || choice === '') {
      break;
    } else {
      console.log('Unknown option, please choose 1, 2, or 3.');
    }
  }

  rl.close();
  console.log('\nDone.');
}

main().catch((err) => {
  console.error('Config helper failed:', err);
  process.exit(1);
});
