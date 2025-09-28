const { Events, EmbedBuilder } = require('discord.js');
const { loadGuildConfig } = require('../utils/configManager');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isButton()) return;

        // Handle verification buttons
        if (interaction.customId === 'verify_button') {
            await handleButtonVerification(interaction);
        } else if (interaction.customId === 'verify_captcha') {
            await handleCaptchaVerification(interaction);
        } else if (interaction.customId === 'verify_email') {
            await handleEmailVerification(interaction);
        }
    },
};

async function handleButtonVerification(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        const guildConfig = await loadGuildConfig(interaction.guild.id);
        const verificationConfig = guildConfig.verification;

        if (!verificationConfig || !verificationConfig.enabled) {
            return interaction.editReply({
                content: '❌ Verification system is not configured for this server.',
            });
        }

        const verifiedRole = interaction.guild.roles.cache.get(verificationConfig.roleId);
        if (!verifiedRole) {
            return interaction.editReply({
                content: '❌ Verification role not found. Please contact an administrator.',
            });
        }

        // Check if user already has the role
        if (interaction.member.roles.cache.has(verifiedRole.id)) {
            return interaction.editReply({
                content: '✅ You are already verified!',
            });
        }

        // Add the verified role
        await interaction.member.roles.add(verifiedRole);

        const successEmbed = new EmbedBuilder()
            .setColor('#00ff00')
            .setTitle('✅ Verification Successful!')
            .setDescription(`Welcome to **${interaction.guild.name}**! You have been successfully verified.`)
            .addFields(
                { name: '🎭 Role Added', value: verifiedRole.name, inline: true },
                { name: '📅 Verified At', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
            )
            .setFooter({ text: 'Enjoy your stay in the server!' })
            .setTimestamp();

        await interaction.editReply({ embeds: [successEmbed] });

        // Send welcome DM if enabled
        if (verificationConfig.dmWelcome) {
            try {
                const dmEmbed = new EmbedBuilder()
                    .setColor('#5865f2')
                    .setTitle(`Welcome to ${interaction.guild.name}!`)
                    .setDescription(verificationConfig.welcomeMessage || `Welcome to **${interaction.guild.name}**! You have been successfully verified.`)
                    .setThumbnail(interaction.guild.iconURL())
                    .setTimestamp();

                await interaction.user.send({ embeds: [dmEmbed] });
            } catch (dmError) {
                console.log('Could not send welcome DM:', dmError.message);
            }
        }

        // Log verification
        console.log(`✅ User verified: ${interaction.user.tag} (${interaction.user.id}) in ${interaction.guild.name}`);

        // Report to dashboard API if available
        try {
            const response = await fetch(`${process.env.PI_BOT_API_URL}/api/verification/log`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.PI_BOT_TOKEN}`
                },
                body: JSON.stringify({
                    guildId: interaction.guild.id,
                    userId: interaction.user.id,
                    username: interaction.user.tag,
                    timestamp: new Date().toISOString(),
                    type: 'button'
                })
            });
        } catch (apiError) {
            // Silently fail - dashboard logging is optional
        }

    } catch (error) {
        console.error('Button verification error:', error);
        
        const errorEmbed = new EmbedBuilder()
            .setColor('#ff0000')
            .setTitle('❌ Verification Failed')
            .setDescription('An error occurred during verification. Please contact an administrator.')
            .setFooter({ text: 'Error: ' + error.message });

        if (interaction.deferred) {
            await interaction.editReply({ embeds: [errorEmbed] });
        } else {
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
    }
}

async function handleCaptchaVerification(interaction) {
    try {
        await interaction.deferReply({ ephemeral: true });

        // Generate simple math captcha
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const answer = num1 + num2;

        const captchaEmbed = new EmbedBuilder()
            .setColor('#ff9500')
            .setTitle('🔍 Captcha Verification')
            .setDescription(`Please solve this math problem to verify you're human:\n\n**${num1} + ${num2} = ?**\n\nType your answer in the chat within 60 seconds.`)
            .setFooter({ text: 'This captcha expires in 60 seconds' })
            .setTimestamp();

        await interaction.editReply({ embeds: [captchaEmbed] });

        // Wait for user response
        const filter = (message) => message.author.id === interaction.user.id;
        
        try {
            const collected = await interaction.channel.awaitMessages({
                filter,
                max: 1,
                time: 60000,
                errors: ['time']
            });

            const userAnswer = parseInt(collected.first().content);
            
            if (userAnswer === answer) {
                // Delete user's answer message
                await collected.first().delete().catch(() => {});
                
                // Proceed with verification
                await completeVerification(interaction, 'captcha');
            } else {
                await interaction.followUp({
                    content: '❌ Incorrect answer. Please try again.',
                    ephemeral: true
                });
            }
        } catch (timeoutError) {
            await interaction.followUp({
                content: '⏰ Captcha timed out. Please try again.',
                ephemeral: true
            });
        }

    } catch (error) {
        console.error('Captcha verification error:', error);
        await interaction.editReply({
            content: '❌ An error occurred during captcha verification.',
        });
    }
}

async function handleEmailVerification(interaction) {
    await interaction.reply({
        content: '📧 Email verification is not yet implemented. Please contact an administrator.',
        ephemeral: true
    });
}

async function completeVerification(interaction, type) {
    const guildConfig = await loadGuildConfig(interaction.guild.id);
    const verificationConfig = guildConfig.verification;

    const verifiedRole = interaction.guild.roles.cache.get(verificationConfig.roleId);
    await interaction.member.roles.add(verifiedRole);

    const successEmbed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('✅ Verification Successful!')
        .setDescription(`Welcome to **${interaction.guild.name}**! You have been successfully verified.`)
        .addFields(
            { name: '🎭 Role Added', value: verifiedRole.name, inline: true },
            { name: '🔐 Method', value: type.charAt(0).toUpperCase() + type.slice(1), inline: true }
        )
        .setTimestamp();

    await interaction.followUp({ embeds: [successEmbed], ephemeral: true });
}
