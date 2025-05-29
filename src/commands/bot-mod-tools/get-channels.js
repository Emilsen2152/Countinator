const {
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  MessageFlags,
  ChannelType,
  PermissionFlagsBits,
} = require('discord.js');

function getChannelTypeName(typeNumber) {
  return Object.entries(ChannelType).find(([_, v]) => v === typeNumber)?.[0] || 'Unknown';
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('get-channels')
    .setDescription('Get the channels for a specific guild.')
    .addStringOption((option) =>
      option
        .setName('guild-id')
        .setDescription('The ID of the guild to get the channels for.')
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  run: async ({ interaction, client }) => {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral }).catch(console.warn);

    const guildId = interaction.options.getString('guild-id');

    if (!guildData) {
      return interaction.editReply({
        content: 'This server has not been set up yet.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const targetGuild = client.guilds.cache.get(guildId);
    if (!targetGuild) {
      return interaction.editReply({
        content: 'Guild not found. Please check the guild ID.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const channels = targetGuild.channels.cache
      .filter(ch => ch.type !== ChannelType.GuildCategory)
      .sort((a, b) => a.rawPosition - b.rawPosition)
      .map(channel => ({
        id: channel.id,
        name: channel.name,
        type: getChannelTypeName(channel.type),
        topic: channel.topic || 'No topic',
      }));

    if (channels.length === 0) {
      return interaction.editReply({
        content: 'No channels found in this guild.',
        flags: MessageFlags.Ephemeral,
      });
    }

    const pageSize = 25;
    const totalPages = Math.ceil(channels.length / pageSize);
    let currentPage = 0;

    const generateEmbed = (page) => {
      const start = page * pageSize;
      const end = Math.min(start + pageSize, channels.length);
      const pageChannels = channels.slice(start, end);

      const embed = new EmbedBuilder()
        .setTitle(`Channels in ${targetGuild.name} (Page ${page + 1}/${totalPages})`)
        .setColor(0x0099ff)
        .setDescription('Here are the channels in the specified guild:')
        .setTimestamp()
        .setFooter({ text: `Channels ${start + 1}–${end} of ${channels.length}` });

      pageChannels.forEach(channel => {
        embed.addFields({
          name: `${channel.name} (${channel.type})`,
          value: `ID: \`${channel.id}\`\nTopic: ${channel.topic}`,
          inline: false,
        });
      });

      return embed;
    };

    const generateButtons = (page) => {
      return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('← Previous')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === 0),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Next →')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(page === totalPages - 1)
      );
    };

    const initialEmbed = generateEmbed(currentPage);
    const initialButtons = generateButtons(currentPage);

    const reply = await interaction.editReply({
      content: `Showing ${channels.length} channels in ${targetGuild.name}:`,
      embeds: [initialEmbed],
      components: [initialButtons],
    });

    const collector = reply.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 1000 * 60 * 2, // 2 minutes
    });

    collector.on('collect', async (btnInt) => {
      if (btnInt.user.id !== interaction.user.id) {
        return btnInt.reply({
          content: "This isn't your interaction!",
          ephemeral: true,
        });
      }

      await btnInt.deferUpdate();

      if (btnInt.customId === 'next') currentPage++;
      if (btnInt.customId === 'prev') currentPage--;

      const updatedEmbed = generateEmbed(currentPage);
      const updatedButtons = generateButtons(currentPage);

      await interaction.editReply({
        embeds: [updatedEmbed],
        components: [updatedButtons],
      });
    });

    collector.on('end', async () => {
      await interaction.editReply({
        components: [],
      });
    });

    console.log(`Fetched ${channels.length} channels for guild: ${targetGuild.name} (${guildId})`);
  },

  options: {
    devOnly: true,
    userPermissions: [],
    botPermissions: [],
    deleted: false,
  },
};
