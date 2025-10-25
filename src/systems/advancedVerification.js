const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const fs = require('fs').promises;
const path = require('path');

/**
 * Advanced Verification System with Multi-Layer Security
 * Features: CAPTCHA, Math challenges, Account age check, Rate limiting, Anti-bot detection
 */

class AdvancedVerification {
    constructor() {
        this.dataPath = path.join(__dirname, '../../data/verification');
        this.verifiedUsersFile = path.join(this.dataPath, 'verified-users.json');
        this.configFile = path.join(this.dataPath, 'config.json');
        this.pendingVerifications = new Map(); // userId -> verification data
        this.rateLimits = new Map(); // userId -> timestamp
        this.init();
    }

    async init() {
        try {
            await fs.mkdir(this.dataPath, { recursive: true });
        } catch (error) {
            console.error('Error creating verification data directory:', error);
        }
    }

    // Load verified users
    async loadVerifiedUsers() {
        try {
            const data = await fs.readFile(this.verifiedUsersFile, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return {};
        }
    }

    // Save verified users
    async saveVerifiedUsers(data) {
        try {
            await fs.writeFile(this.verifiedUsersFile, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving verified users:', error);
        }
    }

    // Load configuration
    async loadConfig(guildId) {
        try {
            const data = await fs.readFile(this.configFile, 'utf8');
            const allConfigs = JSON.parse(data);
            return allConfigs[guildId] || this.getDefaultConfig();
        } catch (error) {
            return this.getDefaultConfig();
        }
    }

    // Default configuration
    getDefaultConfig() {
        return {
            enabled: true,
            verificationMethod: 'captcha', // 'simple', 'captcha', 'math', 'hybrid'
            requireAccountAge: true,
            minAccountAgeDays: 7,
            requireCaptcha: true,
            requireMath: false,
            rateLimitSeconds: 60,
            maxAttempts: 3,
            verifiedRoleName: 'Verified',
            logChannel: null,
            welcomeMessage: true,
            antiRaidMode: false,
            suspiciousAccountCheck: true
        };
    }

    // Generate CAPTCHA challenge
    generateCaptcha() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed confusing chars
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Generate math challenge
    generateMathChallenge() {
        const operations = ['+', '-', '*'];
        const operation = operations[Math.floor(Math.random() * operations.length)];
        
        let num1, num2, answer;
        
        switch (operation) {
            case '+':
                num1 = Math.floor(Math.random() * 50) + 1;
                num2 = Math.floor(Math.random() * 50) + 1;
                answer = num1 + num2;
                break;
            case '-':
                num1 = Math.floor(Math.random() * 50) + 20;
                num2 = Math.floor(Math.random() * 20) + 1;
                answer = num1 - num2;
                break;
            case '*':
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
                answer = num1 * num2;
                break;
        }
        
        return {
            question: `${num1} ${operation} ${num2}`,
            answer: answer.toString()
        };
    }

    // Check if account is suspicious
    async checkSuspiciousAccount(user) {
        const suspiciousFactors = [];
        const accountAge = Date.now() - user.createdTimestamp;
        const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
        
        // Very new account (< 1 day)
        if (accountAgeDays < 1) {
            suspiciousFactors.push('Account less than 1 day old');
        }
        
        // Default avatar
        if (user.avatar === null) {
            suspiciousFactors.push('Using default avatar');
        }
        
        // Suspicious username patterns
        const suspiciousPatterns = [
            /discord/i,
            /nitro/i,
            /free/i,
            /gift/i,
            /\d{4,}/, // Many numbers
            /^[a-z]{20,}$/ // Very long random string
        ];
        
        for (const pattern of suspiciousPatterns) {
            if (pattern.test(user.username)) {
                suspiciousFactors.push('Suspicious username pattern');
                break;
            }
        }
        
        return {
            isSuspicious: suspiciousFactors.length >= 2,
            factors: suspiciousFactors,
            riskLevel: suspiciousFactors.length >= 3 ? 'high' : suspiciousFactors.length >= 2 ? 'medium' : 'low'
        };
    }

    // Check rate limit
    checkRateLimit(userId, limitSeconds) {
        const lastAttempt = this.rateLimits.get(userId);
        if (lastAttempt) {
            const timeSince = (Date.now() - lastAttempt) / 1000;
            if (timeSince < limitSeconds) {
                return {
                    limited: true,
                    remainingSeconds: Math.ceil(limitSeconds - timeSince)
                };
            }
        }
        return { limited: false };
    }

    // Setup verification panel
    async setupPanel(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ You need Administrator permission!',
                flags: 64
            });
        }

        const config = await this.loadConfig(interaction.guild.id);

        const embed = new EmbedBuilder()
            .setColor(0x5865F2)
            .setTitle('🛡️ Server Verification')
            .setDescription(
                '**Welcome to the server!**\n\n' +
                'To access all channels, please verify yourself by clicking the button below.\n\n' +
                '**Why verify?**\n' +
                '🔒 Protects against bots and spam\n' +
                '✅ Ensures you\'re a real person\n' +
                '🛡️ Keeps our community safe\n\n' +
                '**Click the button below to get started!**'
            )
            .addFields(
                { name: '🔐 Security Level', value: config.verificationMethod.toUpperCase(), inline: true },
                { name: '⏱️ Time Required', value: '< 30 seconds', inline: true },
                { name: '🎯 One-Time Only', value: 'Verify once, access forever', inline: true }
            )
            .setFooter({ text: '🛡️ Skyfall Security System | Powered by Advanced Verification' })
            .setTimestamp();

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('verify_button')
                    .setLabel('✅ Verify Me')
                    .setEmoji('🛡️')
                    .setStyle(ButtonStyle.Success)
            );

        await interaction.reply({
            content: '✅ Advanced verification panel created!',
            flags: 64
        });

        await interaction.channel.send({
            embeds: [embed],
            components: [row]
        });
    }

    // Handle verification button click
    async handleVerificationButton(interaction) {
        try {
            const { guild, user, member } = interaction;
            const config = await this.loadConfig(guild.id);

            // Check if already verified
            const verifiedUsers = await this.loadVerifiedUsers();
            if (verifiedUsers[guild.id]?.[user.id]) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0x57F287)
                        .setTitle('✅ Already Verified')
                        .setDescription('You are already verified in this server!')
                        .setTimestamp()
                    ],
                    flags: 64
                });
            }

            // Check rate limit
            const rateLimit = this.checkRateLimit(user.id, config.rateLimitSeconds);
            if (rateLimit.limited) {
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xFEE75C)
                        .setTitle('⏳ Please Wait')
                        .setDescription(`You're trying to verify too quickly!\n\nPlease wait **${rateLimit.remainingSeconds} seconds** before trying again.`)
                        .setTimestamp()
                    ],
                    flags: 64
                });
            }

            // Check account age
            if (config.requireAccountAge) {
                const accountAge = Date.now() - user.createdTimestamp;
                const accountAgeDays = accountAge / (1000 * 60 * 60 * 24);
                
                if (accountAgeDays < config.minAccountAgeDays) {
                    return interaction.reply({
                        embeds: [new EmbedBuilder()
                            .setColor(0xED4245)
                            .setTitle('❌ Account Too New')
                            .setDescription(
                                `Your Discord account must be at least **${config.minAccountAgeDays} days old** to verify.\n\n` +
                                `**Your account age:** ${Math.floor(accountAgeDays)} days\n` +
                                `**Required:** ${config.minAccountAgeDays} days\n\n` +
                                `This is a security measure to protect our community.`
                            )
                            .setFooter({ text: 'Please try again when your account is older' })
                            .setTimestamp()
                        ],
                        flags: 64
                    });
                }
            }

            // Check for suspicious account
            if (config.suspiciousAccountCheck) {
                const suspiciousCheck = await this.checkSuspiciousAccount(user);
                if (suspiciousCheck.isSuspicious) {
                    // Log to staff
                    if (config.logChannel) {
                        const logChannel = guild.channels.cache.get(config.logChannel);
                        if (logChannel) {
                            const logEmbed = new EmbedBuilder()
                                .setColor(0xFEE75C)
                                .setTitle('⚠️ Suspicious Verification Attempt')
                                .setDescription(`${user} (${user.tag}) attempted to verify`)
                                .addFields(
                                    { name: 'Risk Level', value: suspiciousCheck.riskLevel.toUpperCase(), inline: true },
                                    { name: 'User ID', value: user.id, inline: true },
                                    { name: 'Account Age', value: `${Math.floor((Date.now() - user.createdTimestamp) / (1000 * 60 * 60 * 24))} days`, inline: true },
                                    { name: 'Suspicious Factors', value: suspiciousCheck.factors.join('\n') || 'None', inline: false }
                                )
                                .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                                .setTimestamp();
                            
                            await logChannel.send({ embeds: [logEmbed] });
                        }
                    }
                }
            }

            // Set rate limit
            this.rateLimits.set(user.id, Date.now());

            // Show verification challenge based on method
            switch (config.verificationMethod) {
                case 'simple':
                    await this.completeVerification(interaction, guild, user, member, config);
                    break;
                    
                case 'captcha':
                    await this.showCaptchaChallenge(interaction, guild, user, config);
                    break;
                    
                case 'math':
                    await this.showMathChallenge(interaction, guild, user, config);
                    break;
                    
                case 'hybrid':
                    // Random between captcha and math
                    if (Math.random() < 0.5) {
                        await this.showCaptchaChallenge(interaction, guild, user, config);
                    } else {
                        await this.showMathChallenge(interaction, guild, user, config);
                    }
                    break;
                    
                default:
                    await this.showCaptchaChallenge(interaction, guild, user, config);
            }

        } catch (error) {
            console.error('Verification button error:', error);
            console.error('Stack:', error.stack);
            
            await interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xED4245)
                    .setTitle('❌ Verification Error')
                    .setDescription('An error occurred during verification. Please contact an administrator.')
                    .setFooter({ text: 'Error has been logged' })
                    .setTimestamp()
                ],
                flags: 64
            }).catch(console.error);
        }
    }

    // Show CAPTCHA challenge
    async showCaptchaChallenge(interaction, guild, user, config) {
        const captchaCode = this.generateCaptcha();
        
        // Store pending verification
        this.pendingVerifications.set(user.id, {
            guildId: guild.id,
            code: captchaCode,
            type: 'captcha',
            attempts: 0,
            timestamp: Date.now()
        });

        const modal = new ModalBuilder()
            .setCustomId('verify_captcha_modal')
            .setTitle('🛡️ Security Verification');

        const captchaInput = new TextInputBuilder()
            .setCustomId('captcha_code')
            .setLabel('Enter the code below (case-sensitive)')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder(captchaCode)
            .setRequired(true)
            .setMaxLength(6)
            .setMinLength(6);

        const row = new ActionRowBuilder().addComponents(captchaInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    // Show math challenge
    async showMathChallenge(interaction, guild, user, config) {
        const mathChallenge = this.generateMathChallenge();
        
        // Store pending verification
        this.pendingVerifications.set(user.id, {
            guildId: guild.id,
            answer: mathChallenge.answer,
            type: 'math',
            attempts: 0,
            timestamp: Date.now()
        });

        const modal = new ModalBuilder()
            .setCustomId('verify_math_modal')
            .setTitle('🛡️ Security Verification');

        const mathInput = new TextInputBuilder()
            .setCustomId('math_answer')
            .setLabel(`Solve: ${mathChallenge.question} = ?`)
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Enter your answer')
            .setRequired(true)
            .setMaxLength(10);

        const row = new ActionRowBuilder().addComponents(mathInput);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    // Handle CAPTCHA modal submission
    async handleCaptchaModal(interaction) {
        const user = interaction.user;
        const pending = this.pendingVerifications.get(user.id);

        if (!pending || pending.type !== 'captcha') {
            return interaction.reply({
                content: '❌ Verification session expired. Please click the verify button again.',
                flags: 64
            });
        }

        const userInput = interaction.fields.getTextInputValue('captcha_code');
        const config = await this.loadConfig(pending.guildId);

        // Check if correct
        if (userInput === pending.code) {
            this.pendingVerifications.delete(user.id);
            const guild = interaction.client.guilds.cache.get(pending.guildId);
            const member = guild.members.cache.get(user.id);
            await this.completeVerification(interaction, guild, user, member, config);
        } else {
            pending.attempts++;
            
            if (pending.attempts >= config.maxAttempts) {
                this.pendingVerifications.delete(user.id);
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Verification Failed')
                        .setDescription(`Too many incorrect attempts.\n\nPlease wait ${config.rateLimitSeconds} seconds and try again.`)
                        .setTimestamp()
                    ],
                    flags: 64
                });
            }

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFEE75C)
                    .setTitle('❌ Incorrect Code')
                    .setDescription(`The code you entered is incorrect.\n\n**Attempts remaining:** ${config.maxAttempts - pending.attempts}\n\nPlease try again by clicking the verify button.`)
                    .setTimestamp()
                ],
                flags: 64
            });
        }
    }

    // Handle math modal submission
    async handleMathModal(interaction) {
        const user = interaction.user;
        const pending = this.pendingVerifications.get(user.id);

        if (!pending || pending.type !== 'math') {
            return interaction.reply({
                content: '❌ Verification session expired. Please click the verify button again.',
                flags: 64
            });
        }

        const userAnswer = interaction.fields.getTextInputValue('math_answer').trim();
        const config = await this.loadConfig(pending.guildId);

        // Check if correct
        if (userAnswer === pending.answer) {
            this.pendingVerifications.delete(user.id);
            const guild = interaction.client.guilds.cache.get(pending.guildId);
            const member = guild.members.cache.get(user.id);
            await this.completeVerification(interaction, guild, user, member, config);
        } else {
            pending.attempts++;
            
            if (pending.attempts >= config.maxAttempts) {
                this.pendingVerifications.delete(user.id);
                return interaction.reply({
                    embeds: [new EmbedBuilder()
                        .setColor(0xED4245)
                        .setTitle('❌ Verification Failed')
                        .setDescription(`Too many incorrect attempts.\n\nPlease wait ${config.rateLimitSeconds} seconds and try again.`)
                        .setTimestamp()
                    ],
                    flags: 64
                });
            }

            return interaction.reply({
                embeds: [new EmbedBuilder()
                    .setColor(0xFEE75C)
                    .setTitle('❌ Incorrect Answer')
                    .setDescription(`The answer you provided is incorrect.\n\n**Attempts remaining:** ${config.maxAttempts - pending.attempts}\n\nPlease try again by clicking the verify button.`)
                    .setTimestamp()
                ],
                flags: 64
            });
        }
    }

    // Complete verification
    async completeVerification(interaction, guild, user, member, config) {
        try {
            // Find or create verified role
            let verifiedRole = guild.roles.cache.find(role => role.name === config.verifiedRoleName);
            
            if (!verifiedRole) {
                verifiedRole = await guild.roles.create({
                    name: config.verifiedRoleName,
                    color: 0x57F287,
                    reason: 'Advanced Verification System'
                });
            }

            // Add role
            await member.roles.add(verifiedRole);

            // Save to database
            const verifiedUsers = await this.loadVerifiedUsers();
            if (!verifiedUsers[guild.id]) {
                verifiedUsers[guild.id] = {};
            }
            verifiedUsers[guild.id][user.id] = {
                username: user.tag,
                verifiedAt: new Date().toISOString(),
                method: config.verificationMethod
            };
            await this.saveVerifiedUsers(verifiedUsers);

            // Send success message
            const successEmbed = new EmbedBuilder()
                .setColor(0x57F287)
                .setTitle('✅ Verification Successful!')
                .setDescription(
                    `**Welcome to ${guild.name}, ${user}!** 🎉\n\n` +
                    `You've been verified and now have full access to the server.\n\n` +
                    `**What's next?**\n` +
                    `📖 Read the rules\n` +
                    `👋 Introduce yourself\n` +
                    `💬 Start chatting!\n\n` +
                    `Enjoy your stay! ✨`
                )
                .setThumbnail(user.displayAvatarURL({ dynamic: true, size: 256 }))
                .setFooter({ text: '🛡️ Verified by Skyfall Security' })
                .setTimestamp();

            await interaction.reply({
                embeds: [successEmbed],
                flags: 64
            });

            // Log verification
            if (config.logChannel) {
                const logChannel = guild.channels.cache.get(config.logChannel);
                if (logChannel) {
                    const logEmbed = new EmbedBuilder()
                        .setColor(0x57F287)
                        .setTitle('✅ User Verified')
                        .addFields(
                            { name: 'User', value: `${user.tag}\n\`${user.id}\``, inline: true },
                            { name: 'Method', value: config.verificationMethod.toUpperCase(), inline: true },
                            { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:F>`, inline: true }
                        )
                        .setThumbnail(user.displayAvatarURL({ dynamic: true }))
                        .setTimestamp();
                    
                    await logChannel.send({ embeds: [logEmbed] });
                }
            }

            console.log(`✅ Verified: ${user.tag} in ${guild.name} using ${config.verificationMethod}`);

        } catch (error) {
            console.error('Error completing verification:', error);
            throw error;
        }
    }
}

module.exports = new AdvancedVerification();
