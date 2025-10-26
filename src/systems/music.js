const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus, getVoiceConnection } = require('@discordjs/voice');
const play = require('play-dl');

// Music queue for each guild
const queues = new Map();

// Helper function to format duration
function formatDuration(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

// Get or create queue for guild
function getQueue(guildId) {
  if (!queues.has(guildId)) {
    queues.set(guildId, {
      songs: [],
      volume: 50,
      playing: false,
      loop: false,
      connection: null,
      player: null,
      textChannel: null
    });
  }
  return queues.get(guildId);
}

// Play command
async function play(interaction) {
  const { guild, member, channel } = interaction;
  const query = interaction.options.getString('query');

  if (!member.voice.channel) {
    return interaction.reply({
      content: '❌ You need to be in a voice channel!',
      flags: 64
    });
  }

  await interaction.deferReply();

  try {
    const queue = getQueue(guild.id);
    queue.textChannel = channel;

    // Search for song
    let song;
    if (play.yt_validate(query) === 'video') {
      const info = await play.video_info(query);
      song = {
        title: info.video_details.title,
        url: info.video_details.url,
        duration: formatDuration(info.video_details.durationInSec),
        thumbnail: info.video_details.thumbnails[0]?.url,
        requester: interaction.user.tag
      };
    } else {
      const searchResults = await play.search(query, { limit: 1 });
      if (!searchResults || searchResults.length === 0) {
        return interaction.editReply('❌ No results found!');
      }
      const video = searchResults[0];
      song = {
        title: video.title,
        url: video.url,
        duration: formatDuration(video.durationInSec),
        thumbnail: video.thumbnails[0]?.url,
        requester: interaction.user.tag
      };
    }

    // Add to queue
    queue.songs.push(song);

    if (!queue.playing) {
      playSong(guild, member.voice.channel);
      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('🎵 Now Playing')
          .setDescription(`[${song.title}](${song.url})`)
          .setThumbnail(song.thumbnail)
          .addFields(
            { name: 'Duration', value: song.duration.toString(), inline: true },
            { name: 'Requested by', value: song.requester, inline: true }
          )
        ]
      });
    } else {
      await interaction.editReply({
        embeds: [new EmbedBuilder()
          .setColor('#5865F2')
          .setTitle('📝 Added to Queue')
          .setDescription(`[${song.title}](${song.url})`)
          .setThumbnail(song.thumbnail)
          .addFields(
            { name: 'Position', value: `#${queue.songs.length}`, inline: true },
            { name: 'Requested by', value: song.requester, inline: true }
          )
        ]
      });
    }
  } catch (error) {
    console.error('Play error:', error);
    await interaction.editReply('❌ An error occurred while playing the song.');
  }
}

// Play song function
async function playSong(guild, voiceChannel) {
  const queue = getQueue(guild.id);
  
  if (!queue.songs.length) {
    queue.playing = false;
    if (queue.connection) {
      queue.connection.destroy();
      queue.connection = null;
    }
    return;
  }

  const song = queue.songs[0];
  queue.playing = true;

  try {
    // Join voice channel
    if (!queue.connection) {
      queue.connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: guild.id,
        adapterCreator: guild.voiceAdapterCreator,
      });
    }

    // Create audio player
    if (!queue.player) {
      queue.player = createAudioPlayer();
      queue.connection.subscribe(queue.player);

      queue.player.on(AudioPlayerStatus.Idle, () => {
        if (!queue.loop) {
          queue.songs.shift();
        }
        playSong(guild, voiceChannel);
      });

      queue.player.on('error', error => {
        console.error('Audio player error:', error);
        queue.songs.shift();
        playSong(guild, voiceChannel);
      });
    }

    // Create audio resource
    const stream = await play.stream(song.url);

    const resource = createAudioResource(stream.stream, {
      inputType: stream.type,
      inlineVolume: true
    });
    resource.volume.setVolume(queue.volume / 100);

    queue.player.play(resource);

  } catch (error) {
    console.error('Play song error:', error);
    queue.songs.shift();
    playSong(guild, voiceChannel);
  }
}

// Pause command
async function pause(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (!queue.playing || !queue.player) {
    return interaction.reply({
      content: '❌ Nothing is playing!',
      flags: 64
    });
  }

  queue.player.pause();
  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#FEE75C')
      .setTitle('⏸️ Paused')
      .setDescription('Music has been paused.')
    ]
  });
}

// Resume command
async function resume(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (!queue.playing || !queue.player) {
    return interaction.reply({
      content: '❌ Nothing is playing!',
      flags: 64
    });
  }

  queue.player.unpause();
  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#57F287')
      .setTitle('▶️ Resumed')
      .setDescription('Music has been resumed.')
    ]
  });
}

// Skip command
async function skip(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (!queue.playing || !queue.songs.length) {
    return interaction.reply({
      content: '❌ Nothing is playing!',
      flags: 64
    });
  }

  queue.player.stop();
  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('⏭️ Skipped')
      .setDescription('Skipped to next song.')
    ]
  });
}

// Stop command
async function stop(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (!queue.playing) {
    return interaction.reply({
      content: '❌ Nothing is playing!',
      flags: 64
    });
  }

  queue.songs = [];
  queue.playing = false;
  
  if (queue.player) {
    queue.player.stop();
  }
  
  if (queue.connection) {
    queue.connection.destroy();
    queue.connection = null;
  }

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#ED4245')
      .setTitle('⏹️ Stopped')
      .setDescription('Music stopped and queue cleared.')
    ]
  });
}

// Queue command
async function showQueue(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (!queue.songs.length) {
    return interaction.reply({
      content: '❌ Queue is empty!',
      flags: 64
    });
  }

  const queueList = queue.songs.slice(0, 10).map((song, index) => {
    return `${index + 1}. [${song.title}](${song.url}) - ${song.requester}`;
  }).join('\n');

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('📝 Music Queue')
      .setDescription(queueList)
      .setFooter({ text: `${queue.songs.length} song(s) in queue` })
    ]
  });
}

// Now playing command
async function nowPlaying(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (!queue.playing || !queue.songs.length) {
    return interaction.reply({
      content: '❌ Nothing is playing!',
      flags: 64
    });
  }

  const song = queue.songs[0];

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🎵 Now Playing')
      .setDescription(`[${song.title}](${song.url})`)
      .setThumbnail(song.thumbnail)
      .addFields(
        { name: 'Duration', value: song.duration.toString(), inline: true },
        { name: 'Requested by', value: song.requester, inline: true },
        { name: 'Loop', value: queue.loop ? '✅ On' : '❌ Off', inline: true }
      )
    ]
  });
}

// Volume command
async function setVolume(interaction) {
  const queue = getQueue(interaction.guild.id);
  const volume = interaction.options.getInteger('level');

  if (volume < 0 || volume > 100) {
    return interaction.reply({
      content: '❌ Volume must be between 0 and 100!',
      flags: 64
    });
  }

  queue.volume = volume;

  if (queue.player && queue.player.state.resource) {
    queue.player.state.resource.volume.setVolume(volume / 100);
  }

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🔊 Volume Changed')
      .setDescription(`Volume set to ${volume}%`)
    ]
  });
}

// Loop command
async function toggleLoop(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (!queue.playing) {
    return interaction.reply({
      content: '❌ Nothing is playing!',
      flags: 64
    });
  }

  queue.loop = !queue.loop;

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🔁 Loop')
      .setDescription(queue.loop ? '✅ Loop enabled' : '❌ Loop disabled')
    ]
  });
}

// Shuffle command
async function shuffle(interaction) {
  const queue = getQueue(interaction.guild.id);

  if (queue.songs.length < 2) {
    return interaction.reply({
      content: '❌ Not enough songs in queue!',
      flags: 64
    });
  }

  const currentSong = queue.songs.shift();
  
  for (let i = queue.songs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [queue.songs[i], queue.songs[j]] = [queue.songs[j], queue.songs[i]];
  }
  
  queue.songs.unshift(currentSong);

  await interaction.reply({
    embeds: [new EmbedBuilder()
      .setColor('#5865F2')
      .setTitle('🔀 Shuffled')
      .setDescription(`Shuffled ${queue.songs.length - 1} songs in queue.`)
    ]
  });
}

module.exports = {
  play,
  pause,
  resume,
  skip,
  stop,
  showQueue,
  nowPlaying,
  setVolume,
  toggleLoop,
  shuffle
};
