const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { getDocument, setDocument } = require('./database');
const crypto = require('crypto');

// Store temporary verification data
const verificationSessions = new Map();
const captchaCodes = new Map();
const emailCodes = new Map();

async function handleVerification(interaction) {
    const guildId = interaction.guild.id;
    const userId = interaction.user.id;
    const customId = interaction.customId;
    
    try {
        const config = await getDocument('verification', guildId);
        if (!config || !config.enabled) {
            return interaction.reply({
                content: '❌ Verification system is not enabled on this server.',
                ephemeral: true
            });
        }

        const verifiedRole = interaction.guild.roles.cache.get(config.roleId);
        if (!verifiedRole) {
            return interaction.reply({
                content: '❌ Verification role not found. Please contact an administrator.',
                ephemeral: true
            });
        }

        // Check if user already has the role
        if (interaction.member.roles.cache.has(config.roleId)) {
            return interaction.reply({
                content: '✅ You are already verified!',
                ephemeral: true
            });
        }

        switch (customId) {
            case 'verify_button':
                await handleButtonVerification(interaction, config, verifiedRole);
                break;
            case 'verify_captcha':
                await handleCaptchaStart(interaction, config);
                break;
            case 'verify_captcha_submit':
                await handleCaptchaSubmit(interaction, config, verifiedRole);
                break;
            case 'verify_email':
                await handleEmailStart(interaction, config);
                break;
            case 'verify_email_code':
                await handleEmailCodeSubmit(interaction, config, verifiedRole);
                break;
        }

        // Log verification attempt
        await logVerificationAttempt(guildId, userId, customId, true);

    } catch (error) {
        console.error('Verification error:', error);
        await interaction.reply({
            content: '❌ An error occurred during verification. Please try again.',
            ephemeral: true
        });
        
        await logVerificationAttempt(guildId, userId, customId, false, error.message);
    }
}

async function handleButtonVerification(interaction, config, verifiedRole) {
    try {
        await interaction.member.roles.add(verifiedRole);
        
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Verification Successful!')
            .setDescription(`Welcome to **${interaction.guild.name}**! You have been successfully verified.`)
            .addFields(
                { name: '🎭 Role Assigned', value: `${verifiedRole}`, inline: true },
                { name: '📅 Verified At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: 'Skyfall Verification System' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed], ephemeral: true });
        
        // Send welcome DM if enabled
        if (config.dmWelcome) {
            await sendWelcomeDM(interaction.user, interaction.guild, config.welcomeMessage);
        }

        // Log successful verification
        await logVerification(interaction.guild.id, interaction.user.id, 'button', true);
        
    } catch (error) {
        console.error('Role assignment error:', error);
        await interaction.reply({
            content: '❌ Failed to assign verification role. Please contact an administrator.',
            ephemeral: true
        });
    }
}

async function handleCaptchaStart(interaction, config) {
    const userId = interaction.user.id;
    const captchaCode = generateCaptchaCode();
    
    captchaCodes.set(userId, {
        code: captchaCode,
        expires: Date.now() + 300000, // 5 minutes
        attempts: 0
    });

    const captchaImage = generateCaptchaText(captchaCode);
    
    const embed = new EmbedBuilder()
        .setColor('#ff9500')
        .setTitle('🧩 Captcha Verification')
        .setDescription(`Please solve the captcha below:\n\n\`\`\`\n${captchaImage}\n\`\`\`\n\nClick "Submit Answer" and enter the code you see above.`)
        .addFields(
            { name: '⏰ Time Limit', value: '5 minutes', inline: true },
            { name: '🔄 Attempts', value: '3 maximum', inline: true }
        )
        .setFooter({ text: 'The code is case-insensitive' })
        .setTimestamp();

    const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('verify_captcha_submit')
            .setLabel('Submit Answer')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('📝')
    );

    await interaction.reply({ embeds: [embed], components: [button], ephemeral: true });
}

async function handleCaptchaSubmit(interaction, config, verifiedRole) {
    const userId = interaction.user.id;
    const captchaData = captchaCodes.get(userId);
    
    if (!captchaData || Date.now() > captchaData.expires) {
        captchaCodes.delete(userId);
        return interaction.reply({
            content: '❌ Captcha expired. Please start verification again.',
            ephemeral: true
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('captcha_answer_modal')
        .setTitle('Enter Captcha Code');

    const codeInput = new TextInputBuilder()
        .setCustomId('captcha_code')
        .setLabel('Enter the code from the image')
        .setStyle(TextInputStyle.Short)
        .setMinLength(4)
        .setMaxLength(6)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(codeInput));
    
    await interaction.showModal(modal);
    
    // Handle modal submission
    const filter = i => i.customId === 'captcha_answer_modal' && i.user.id === userId;
    try {
        const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 });
        const userAnswer = modalInteraction.fields.getTextInputValue('captcha_code').toLowerCase();
        
        if (userAnswer === captchaData.code.toLowerCase()) {
            // Correct answer
            captchaCodes.delete(userId);
            await interaction.member.roles.add(verifiedRole);
            
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Captcha Verified!')
                .setDescription(`Congratulations! You have successfully completed the captcha verification.`)
                .addFields(
                    { name: '🎭 Role Assigned', value: `${verifiedRole}`, inline: true }
                )
                .setTimestamp();

            await modalInteraction.reply({ embeds: [successEmbed], ephemeral: true });
            
            if (config.dmWelcome) {
                await sendWelcomeDM(interaction.user, interaction.guild, config.welcomeMessage);
            }
            
            await logVerification(interaction.guild.id, userId, 'captcha', true);
            
        } else {
            // Wrong answer
            captchaData.attempts++;
            if (captchaData.attempts >= 3) {
                captchaCodes.delete(userId);
                await modalInteraction.reply({
                    content: '❌ Too many incorrect attempts. Please start verification again.',
                    ephemeral: true
                });
            } else {
                await modalInteraction.reply({
                    content: `❌ Incorrect code. You have ${3 - captchaData.attempts} attempts remaining.`,
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        console.error('Modal timeout or error:', error);
    }
}

async function handleEmailStart(interaction, config) {
    const modal = new ModalBuilder()
        .setCustomId('email_verification_modal')
        .setTitle('Email Verification');

    const emailInput = new TextInputBuilder()
        .setCustomId('email_address')
        .setLabel('Enter your email address')
        .setStyle(TextInputStyle.Short)
        .setPlaceholder('your.email@example.com')
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(emailInput));
    await interaction.showModal(modal);
    
    // Handle email submission
    const filter = i => i.customId === 'email_verification_modal' && i.user.id === interaction.user.id;
    try {
        const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 });
        const email = modalInteraction.fields.getTextInputValue('email_address');
        
        if (!isValidEmail(email)) {
            return modalInteraction.reply({
                content: '❌ Please enter a valid email address.',
                ephemeral: true
            });
        }

        const verificationCode = generateEmailCode();
        emailCodes.set(interaction.user.id, {
            email: email,
            code: verificationCode,
            expires: Date.now() + 600000, // 10 minutes
            attempts: 0
        });

        // In a real implementation, you would send the email here
        // For demo purposes, we'll show the code in the response
        const embed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('📧 Email Verification Code Sent')
            .setDescription(`A verification code has been sent to **${email}**`)
            .addFields(
                { name: '🔢 Demo Code', value: `\`${verificationCode}\``, inline: true },
                { name: '⏰ Expires In', value: '10 minutes', inline: true }
            )
            .setFooter({ text: 'In production, this would be sent via email' });

        const button = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('verify_email_code')
                .setLabel('Enter Code')
                .setStyle(ButtonStyle.Success)
                .setEmoji('🔑')
        );

        await modalInteraction.reply({ embeds: [embed], components: [button], ephemeral: true });
        
    } catch (error) {
        console.error('Email modal error:', error);
    }
}

async function handleEmailCodeSubmit(interaction, config, verifiedRole) {
    const userId = interaction.user.id;
    const emailData = emailCodes.get(userId);
    
    if (!emailData || Date.now() > emailData.expires) {
        emailCodes.delete(userId);
        return interaction.reply({
            content: '❌ Verification code expired. Please start email verification again.',
            ephemeral: true
        });
    }

    const modal = new ModalBuilder()
        .setCustomId('email_code_modal')
        .setTitle('Enter Verification Code');

    const codeInput = new TextInputBuilder()
        .setCustomId('verification_code')
        .setLabel('Enter the 6-digit code from your email')
        .setStyle(TextInputStyle.Short)
        .setMinLength(6)
        .setMaxLength(6)
        .setRequired(true);

    modal.addComponents(new ActionRowBuilder().addComponents(codeInput));
    await interaction.showModal(modal);
    
    // Handle code submission
    const filter = i => i.customId === 'email_code_modal' && i.user.id === userId;
    try {
        const modalInteraction = await interaction.awaitModalSubmit({ filter, time: 60000 });
        const userCode = modalInteraction.fields.getTextInputValue('verification_code');
        
        if (userCode === emailData.code) {
            // Correct code
            emailCodes.delete(userId);
            await interaction.member.roles.add(verifiedRole);
            
            const successEmbed = new EmbedBuilder()
                .setColor('#00ff00')
                .setTitle('✅ Email Verified!')
                .setDescription(`Your email **${emailData.email}** has been successfully verified!`)
                .addFields(
                    { name: '🎭 Role Assigned', value: `${verifiedRole}`, inline: true }
                )
                .setTimestamp();

            await modalInteraction.reply({ embeds: [successEmbed], ephemeral: true });
            
            if (config.dmWelcome) {
                await sendWelcomeDM(interaction.user, interaction.guild, config.welcomeMessage);
            }
            
            await logVerification(interaction.guild.id, userId, 'email', true);
            
        } else {
            // Wrong code
            emailData.attempts++;
            if (emailData.attempts >= 3) {
                emailCodes.delete(userId);
                await modalInteraction.reply({
                    content: '❌ Too many incorrect attempts. Please start email verification again.',
                    ephemeral: true
                });
            } else {
                await modalInteraction.reply({
                    content: `❌ Incorrect code. You have ${3 - emailData.attempts} attempts remaining.`,
                    ephemeral: true
                });
            }
        }
    } catch (error) {
        console.error('Email code modal error:', error);
    }
}

// Utility functions
function generateCaptchaCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 5; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function generateCaptchaText(code) {
    // Simple ASCII art style captcha
    const lines = ['', '', '', '', ''];
    
    for (const char of code) {
        const ascii = getCharAscii(char);
        for (let i = 0; i < 5; i++) {
            lines[i] += ascii[i] + ' ';
        }
    }
    
    return lines.join('\n');
}

function getCharAscii(char) {
    const patterns = {
        'A': ['▄▀█', '█▀█', '█▄▄', '▀▀▀', '▀▀▀'],
        'B': ['█▀▄', '█▀▄', '█▄▀', '▀▀▀', '▀▀▀'],
        'C': ['▄▀█', '█▄▄', '▀▀▀', '▀▀▀', '▀▀▀'],
        '0': ['▄▀█', '█▄█', '▀▀▀', '▀▀▀', '▀▀▀'],
        '1': ['▄█▄', '▀█▀', '▀▀▀', '▀▀▀', '▀▀▀'],
        '2': ['▄▀▄', '▄▀▄', '▀▀▀', '▀▀▀', '▀▀▀'],
        '3': ['▄▀▄', '▄▀▄', '▀▀▀', '▀▀▀', '▀▀▀'],
        '4': ['█▄█', '▀▀█', '▀▀▀', '▀▀▀', '▀▀▀'],
        '5': ['█▀▄', '▄▀█', '▀▀▀', '▀▀▀', '▀▀▀'],
        '6': ['▄▀▄', '█▀█', '▀▀▀', '▀▀▀', '▀▀▀'],
        '7': ['▀▀█', '▄▀▀', '▀▀▀', '▀▀▀', '▀▀▀'],
        '8': ['▄▀▄', '█▀█', '▀▀▀', '▀▀▀', '▀▀▀'],
        '9': ['▄▀▄', '▀▀█', '▀▀▀', '▀▀▀', '▀▀▀']
    };
    return patterns[char] || ['███', '███', '███', '▀▀▀', '▀▀▀'];
}

function generateEmailCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

async function sendWelcomeDM(user, guild, message) {
    try {
        const embed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle(`Welcome to ${guild.name}! 🎉`)
            .setDescription(message)
            .setThumbnail(guild.iconURL())
            .setFooter({ text: 'Skyfall Bot' })
            .setTimestamp();

        await user.send({ embeds: [embed] });
    } catch (error) {
        console.error('Failed to send welcome DM:', error);
    }
}

async function logVerification(guildId, userId, type, success) {
    try {
        const logs = await getDocument('verification_logs', guildId) || { entries: [] };
        logs.entries.unshift({
            userId,
            type,
            success,
            timestamp: Date.now(),
            id: crypto.randomUUID()
        });
        
        // Keep only last 1000 entries
        if (logs.entries.length > 1000) {
            logs.entries = logs.entries.slice(0, 1000);
        }
        
        await setDocument('verification_logs', guildId, logs);
    } catch (error) {
        console.error('Failed to log verification:', error);
    }
}

async function logVerificationAttempt(guildId, userId, action, success, error = null) {
    try {
        const attempts = await getDocument('verification_attempts', guildId) || { entries: [] };
        attempts.entries.unshift({
            userId,
            action,
            success,
            error,
            timestamp: Date.now(),
            id: crypto.randomUUID()
        });
        
        // Keep only last 500 attempts
        if (attempts.entries.length > 500) {
            attempts.entries = attempts.entries.slice(0, 500);
        }
        
        await setDocument('verification_attempts', guildId, attempts);
    } catch (error) {
        console.error('Failed to log verification attempt:', error);
    }
}

module.exports = {
    handleVerification,
    logVerification,
    verificationSessions,
    captchaCodes,
    emailCodes
};
