const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('roll')
        .setDescription('🎲 Roll dice with various options')
        .addStringOption(option =>
            option.setName('dice')
                .setDescription('Dice to roll (e.g., 1d6, 2d20, 3d10+5)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides (if not using dice notation)')
                .setMinValue(2)
                .setMaxValue(1000)
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('count')
                .setDescription('Number of dice to roll (if using sides)')
                .setMinValue(1)
                .setMaxValue(10)
                .setRequired(false)),

    async execute(interaction) {
        const diceInput = interaction.options.getString('dice');
        const sides = interaction.options.getInteger('sides');
        const count = interaction.options.getInteger('count') || 1;

        let results = [];
        let total = 0;
        let diceString = '';

        try {
            if (diceInput) {
                // Parse dice notation (e.g., 2d20+5, 1d6-2)
                const diceRegex = /^(\d+)d(\d+)([+-]\d+)?$/i;
                const match = diceInput.match(diceRegex);

                if (!match) {
                    return interaction.reply({
                        content: '❌ Invalid dice format. Use format like: `1d6`, `2d20`, `3d10+5`',
                        ephemeral: true
                    });
                }

                const numDice = parseInt(match[1]);
                const numSides = parseInt(match[2]);
                const modifier = match[3] ? parseInt(match[3]) : 0;

                if (numDice > 10 || numSides > 1000 || numDice < 1 || numSides < 2) {
                    return interaction.reply({
                        content: '❌ Invalid dice parameters. Use 1-10 dice with 2-1000 sides.',
                        ephemeral: true
                    });
                }

                for (let i = 0; i < numDice; i++) {
                    const roll = Math.floor(Math.random() * numSides) + 1;
                    results.push(roll);
                    total += roll;
                }

                total += modifier;
                diceString = `${numDice}d${numSides}${modifier !== 0 ? (modifier > 0 ? '+' + modifier : modifier) : ''}`;

            } else if (sides) {
                // Simple dice rolling
                for (let i = 0; i < count; i++) {
                    const roll = Math.floor(Math.random() * sides) + 1;
                    results.push(roll);
                    total += roll;
                }
                diceString = count > 1 ? `${count}d${sides}` : `1d${sides}`;
                
            } else {
                // Default: single d6
                const roll = Math.floor(Math.random() * 6) + 1;
                results.push(roll);
                total = roll;
                diceString = '1d6';
            }

            // Create result string
            let resultText = '';
            if (results.length === 1) {
                resultText = `**${results[0]}**`;
            } else {
                resultText = `[${results.join(', ')}] = **${total}**`;
            }

            // Determine color based on results
            let color = 0x3498db; // Blue default
            if (results.length === 1) {
                if (results[0] === 1) color = 0xe74c3c; // Red for natural 1
                else if (results[0] === sides || results[0] === 20) color = 0x2ecc71; // Green for max roll
            }

            const embed = new EmbedBuilder()
                .setTitle('🎲 Dice Roll')
                .setColor(color)
                .addFields(
                    { name: '🎯 Dice', value: diceString, inline: true },
                    { name: '🎲 Result', value: resultText, inline: true }
                )
                .setFooter({ text: `Rolled by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() })
                .setTimestamp();

            // Add special messages for natural 1s and 20s
            if (results.includes(1) && (sides === 20 || sides === 6)) {
                embed.addFields({ name: '💀 Critical Failure!', value: 'Natural 1 rolled!', inline: false });
            } else if (results.includes(20) && sides === 20) {
                embed.addFields({ name: '⭐ Critical Success!', value: 'Natural 20 rolled!', inline: false });
            } else if (results.includes(sides) && sides > 6 && sides !== 20) {
                embed.addFields({ name: '🎯 Perfect Roll!', value: `Maximum value (${sides}) rolled!`, inline: false });
            }

            await interaction.reply({ embeds: [embed] });

        } catch (error) {
            console.error('Roll command error:', error);
            await interaction.reply({
                content: '❌ Failed to roll dice. Please try again.',
                ephemeral: true
            });
        }
    }
};
