const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
const { loadGuildConfig } = require('../utils/configManager');

// Store pending verifications with timestamps
const pendingVerifications = new Map();
const verificationCooldowns = new Map();

// Generate random verification code
function generateVerificationCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking characters
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// Generate simple math problem
function generateMathProblem() {
    const num1 = Math.floor(Math.random() * 20) + 1;
    const num2 = Math.floor(Math.random() * 20) + 1;
    const operations = ['+', '-'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let answer;
    if (operation === '+') {
        answer = num1 + num2;
    } else {
        answer = num1 - num2;
    }
    
    return {
        question: `${num1} ${operation} ${num2}`,
        answer: answer
    };
}

async function handleVerificationButton(interaction) {
    try {
        const { guild, member, user } = interaction;
        
        // Load guild config
        const config = await loadGuildConfig(guild.id);
        
        if (!config.verificationEnabled) {
            return interaction.reply({
                content: '❌ Verification system is not enabled on this server.',
                ephemeral: true
            });
        }
        
        // Get verified role
        const verifiedRole = guild.roles.cache.get(config.verifiedRole);
        if (!verifiedRole) {
            console.error(`Verified role not found: ${config.verifiedRole}`);
            return interaction.reply({
                content: '❌ An error occurred during verification. Please contact an administrator.',
                ephemeral: true
            });
        }
        
        // Check if already verified
        if (member.roles.cache.has(verifiedRole.id)) {
            return interaction.reply({
                content: '✅ You are already verified!',
                ephemeral: true
            });
        }
        
        // Check cooldown (prevent spam)
        const cooldownKey = `${guild.id}-${user.id}`;
        const lastAttempt = verificationCooldowns.get(cooldownKey);
        if (lastAttempt && Date.now() - lastAttempt < 10000) { // 10 second cooldown
            const remaining = Math.ceil((10000 - (Date.now() - lastAttempt)) / 1000);
            return interaction.reply({
                content: `⏳ Please wait ${remaining} seconds before trying again.`,
                ephemeral: true
            });
        }
        
        // Set cooldown
        verificationCooldowns.set(cooldownKey, Date.now());
        
        // Generate verification challenge
        const verificationMethod = config.verificationMethod || 'button'; // button, code, math, or captcha
        
        if (verificationMethod === 'button') {
            // Simple button verification
            await member.roles.add(verifiedRole);
            
            const successEmbed = new EmbedBuilder()
                .setTitle('✅ Verification Successful!')
                .setDescription(
                    `Welcome to **${guild.name}**, ${user}!\n\n` +
                    'You now have access to all channels.\n' +
                    'Please read the rules and enjoy your stay!'
                )
                .setColor('#00ff00')
                .setTimestamp();
            
            // Log verification
            if (config.verificationLogChannel) {
                const logChannel = guild.channels.cache.get(config.verificationLogChannel);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setTitle('✅ New Member Verified')
                        .setDescription(`${user} (${user.tag})`)
                        .addFields(
                            { name: 'User ID', value: user.id, inline: true },
                            { name: 'Account Created', value: `<t:${Math.floor(user.createdTimestamp / 1000)}:R>`, inline: true }
                        )
                        .setColor('#00ff00')
                        .setThumbnail(user.displayAvatarURL())
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }
            
            return interaction.reply({
                embeds: [successEmbed],
                ephemeral: true
            });
            
        } else if (verificationMethod === 'code') {
            // Code verification
            const code = generateVerificationCode();
            pendingVerifications.set(user.id, {
                code: code,
                roleId: verifiedRole.id,
                timestamp: Date.now(),
                type: 'code'
            });
            
            // Auto-expire after 5 minutes
            setTimeout(() => {
                pendingVerifications.delete(user.id);
            }, 300000);
            
            const codeEmbed = new EmbedBuilder()
                .setTitle('🔐 Verification Code')
                .setDescription(
                    'To complete verification, please type the following code in this channel:\n\n' +
                    `**\`${code}\`**\n\n` +
                    '⏱️ This code expires in 5 minutes.\n' +
                    '❌ Do not share this code with anyone!'
                )
                .setColor('#5865F2')
                .setFooter({ text: 'Code is case-sensitive' })
                .setTimestamp();
            
            return interaction.reply({
                embeds: [codeEmbed],
                ephemeral: true
            });
            
        } else if (verificationMethod === 'math') {
            // Math problem verification
            const problem = generateMathProblem();
            pendingVerifications.set(user.id, {
                answer: problem.answer.toString(),
                roleId: verifiedRole.id,
                timestamp: Date.now(),
                type: 'math'
            });
            
            // Auto-expire after 3 minutes
            setTimeout(() => {
                pendingVerifications.delete(user.id);
            }, 180000);
            
            const mathEmbed = new EmbedBuilder()
                .setTitle('🧮 Verification Challenge')
                .setDescription(
                    'To prove you\'re human, please solve this simple math problem:\n\n' +
                    `**What is ${problem.question}?**\n\n` +
                    'Type your answer in this channel.\n' +
                    '⏱️ You have 3 minutes to answer.'
                )
                .setColor('#5865F2')
                .setFooter({ text: 'Type only the number' })
                .setTimestamp();
            
            return interaction.reply({
                embeds: [mathEmbed],
                ephemeral: true
            });
        }
        
    } catch (error) {
        console.error('Error in verification handler:', error);
        console.error('Stack trace:', error.stack);
        
        return interaction.reply({
            content: '❌ An error occurred during verification. Please contact an administrator.\n' +
                     `Error: ${error.message}`,
            ephemeral: true
        }).catch(err => {
            console.error('Failed to send error message:', err);
        });
    }
}

// Handle verification code/answer messages
async function handleVerificationMessage(message) {
    if (message.author.bot) return;
    
    const pending = pendingVerifications.get(message.author.id);
    if (!pending) return;
    
    const config = await loadGuildConfig(message.guild.id);
    if (!config.verificationEnabled) return;
    
    // Check if message is in verification channel
    if (message.channel.id !== config.verificationChannel) return;
    
    const userInput = message.content.trim();
    
    if (pending.type === 'code') {
        if (userInput === pending.code) {
            // Correct code
            const role = message.guild.roles.cache.get(pending.roleId);
            if (role) {
                await message.member.roles.add(role);
                pendingVerifications.delete(message.author.id);
                
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Verification Successful!')
                    .setDescription(
                        `Welcome to **${message.guild.name}**!\n\n` +
                        'You now have access to all channels.'
                    )
                    .setColor('#00ff00');
                
                await message.reply({ embeds: [successEmbed] });
                
                // Delete verification messages after 5 seconds
                setTimeout(async () => {
                    try {
                        await message.delete();
                    } catch (err) {
                        console.error('Failed to delete message:', err);
                    }
                }, 5000);
                
                // Log verification
                if (config.verificationLogChannel) {
                    const logChannel = message.guild.channels.cache.get(config.verificationLogChannel);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('✅ New Member Verified')
                            .setDescription(`${message.author} (${message.author.tag})`)
                            .addFields(
                                { name: 'Method', value: 'Code Verification', inline: true },
                                { name: 'User ID', value: message.author.id, inline: true }
                            )
                            .setColor('#00ff00')
                            .setTimestamp();
                        
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }
            }
        } else {
            await message.reply({
                content: '❌ Incorrect code. Please try again or click the verify button for a new code.',
                ephemeral: true
            });
        }
    } else if (pending.type === 'math') {
        if (userInput === pending.answer) {
            // Correct answer
            const role = message.guild.roles.cache.get(pending.roleId);
            if (role) {
                await message.member.roles.add(role);
                pendingVerifications.delete(message.author.id);
                
                const successEmbed = new EmbedBuilder()
                    .setTitle('✅ Verification Successful!')
                    .setDescription(
                        `Correct! Welcome to **${message.guild.name}**!\n\n` +
                        'You now have access to all channels.'
                    )
                    .setColor('#00ff00');
                
                await message.reply({ embeds: [successEmbed] });
                
                // Delete verification messages after 5 seconds
                setTimeout(async () => {
                    try {
                        await message.delete();
                    } catch (err) {
                        console.error('Failed to delete message:', err);
                    }
                }, 5000);
                
                // Log verification
                if (config.verificationLogChannel) {
                    const logChannel = message.guild.channels.cache.get(config.verificationLogChannel);
                    if (logChannel) {
                        const logEmbed = new EmbedBuilder()
                            .setTitle('✅ New Member Verified')
                            .setDescription(`${message.author} (${message.author.tag})`)
                            .addFields(
                                { name: 'Method', value: 'Math Challenge', inline: true },
                                { name: 'User ID', value: message.author.id, inline: true }
                            )
                            .setColor('#00ff00')
                            .setTimestamp();
                        
                        await logChannel.send({ embeds: [logEmbed] });
                    }
                }
            }
        } else {
            await message.reply({
                content: '❌ Incorrect answer. Please try again or click the verify button for a new challenge.',
                ephemeral: true
            });
        }
    }
}

module.exports = {
    handleVerificationButton,
    handleVerificationMessage
};
