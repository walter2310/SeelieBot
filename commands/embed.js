require('dotenv').config();
const axios = require('axios');

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, 
	ButtonBuilder, ButtonStyle, ButtonInteraction } = require('discord.js');

const MAL_TOKEN = process.env.MAL_TOKEN;

module.exports = {
	data: new SlashCommandBuilder()
		.setName('embed')
		.setDescription('search the anime you want')
		.addStringOption(option =>
			option.setName('animename')
				.setDescription('search the anime')),

	async execute( interaction ) {
		const animeName = interaction.options.getString('animename');

		const result = await axios.get(`https://api.myanimelist.net/v2/anime?q=${animeName}`,{
            headers:{
                'X-MAL-CLIENT-ID': MAL_TOKEN
            }
        });
        
        const animes = result.data.data.map(anime => {
            return {
                    id: anime.node.id,
                    name: anime.node.title,
                    picture: anime.node.main_picture
                }           
        });		

		const searchAnimeEmbed = new EmbedBuilder()
			.setColor(0x0099FF)
			.setDescription('This is my description')
			.setTitle(animes[0].name)
			.setURL('https://discord.js.org/')
			.setAuthor({ name: 'Heisenberg', iconURL: 'https://i.imgur.com/AfFp7pu.png', url: 'https://discord.js.org' })
			.setDescription('Find info about your favorite anime!')
			.setThumbnail(animes[0].picture.medium)
			.setImage(animes[0].picture.medium)
			.setTimestamp()

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('left')
					.setLabel('<-')
					.setStyle(ButtonStyle.Secondary),
			
				new ButtonBuilder()
					.setCustomId('success')
					.setLabel('Yes!')
					.setStyle(ButtonStyle.Success),			
					
				new ButtonBuilder()
					.setCustomId('right')
					.setLabel('->')
					.setStyle(ButtonStyle.Secondary),
		);

		await interaction.reply({
			embeds: [searchAnimeEmbed], 
			content: 'This is the anime you wanted?', 
			components: [row], 
			ephmeral:true 
		});	

		const filter = (btnInt = ButtonInteraction) => {
			return interaction.user.id === btnInt.user.id
		};	

		const collector = interaction.channel.createMessageComponentCollector({
			filter,
			time: 1000 * 15
		});

		collector.on('collect', async (i) => {
			let j = 1;

			while( i.customId === 'right'){
				let rightOption = EmbedBuilder.from(searchAnimeEmbed)
									.setTitle(animes[0+j].name)
									.setThumbnail(animes[0+j].picture.medium)
									.setImage(animes[0+j].picture.medium)

				j++;
				
				await i.reply({ embeds: [rightOption], components: [row], ephmeral: true });	
			}
		});

		collector.on('end', async (collection) => {
			collection.forEach(click => {
				console.log(click.user.id, click.customId)
			});
		});
	},
};