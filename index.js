const Discord = require('discord.js')
const { prefix, token } = require('./config.json')
const client = new Discord.Client()

client.once('ready', () => {
	console.log('Ready!')
})

const embedsIds = []
const embedsDico = {}

client.on('message', (message) => {
	// console.log({ message })

	if (!message.content.startsWith(prefix) || message.author.bot) return

	const args = message.content.slice(prefix.length).split(/ +/)
	const command = args.shift().toLowerCase()

	if (command == 'game') {
		if (!args.length) {
			return message.reply('you need to provide the game name (lol, rl, destiny)!')
		}

		message.delete()

		const title = args.length > 1 ? args.splice(1).join(' ') : 'Voulez-vous faire une game ?'

		const thumbnail =
			args[0] === 'lol'
				? 'https://upload.wikimedia.org/wikipedia/fr/1/12/League_of_Legends_Logo.png'
				: args[0] === 'rl'
					? 'https://www.dafont.com/forum/attach/orig/5/1/517500.png'
					: args[0] === 'destiny' ? 'https://cdn.1min30.com/wp-content/uploads/2018/06/Symbole-Destiny.jpg' : ''

		const embed = new Discord.MessageEmbed()
			.setColor('#0099ff')
			.setTitle(title)
			// .setURL('https://discord.js.org/')
			// .setAuthor(message.author.username, message.author.avatar, 'https://discord.js.org')
			// .setDescription('Some description here')
			.setThumbnail(thumbnail)
			.addFields(
				// { name: '\u200B', value: '\u200B' },
				// { name: 'Regular field title', value: 'Some value here' },
				{ name: 'Accepted', value: '-', inline: true },
				{ name: 'Declined', value: '-', inline: true }
			)
			// .addField('Inline field title', 'Some value here', true)
			// .setImage('https://i.imgur.com/wSTFkRM.png')
			.setTimestamp()
			.setFooter(message.author.username, message.author.avatar)

		message.channel.send(embed).then((msg) => {
			msg.react('👍').then(() => msg.react('👎'))
			embedsIds.push(msg.id)
			embedsDico[msg.id] = {
				accepted: [],
				declined: []
			}
		})
	}
})

client.on('messageReactionAdd', (messageReaction, user) => {
	if (user.bot) return

	if (!embedsIds.includes(messageReaction.message.id)) return

	// console.log({ messageReactionsUsersCache: messageReaction.message.reactions.cache.get('👍').users.cache })

	if (messageReaction.emoji.name === '👍') {
		if (embedsDico[messageReaction.message.id].declined.includes(user)) {
			// console.log('delete 👎')
			messageReaction.message.reactions.cache.get('👎').users.remove(user)
		}

		embedsDico[messageReaction.message.id].accepted.push(user)
	} else if (messageReaction.emoji.name === '👎') {
		if (embedsDico[messageReaction.message.id].accepted.includes(user)) {
			// console.log('delete 👍')
			messageReaction.message.reactions.cache.get('👍').users.remove(user)
		}

		embedsDico[messageReaction.message.id].declined.push(user)
	}

	displayEmbed(messageReaction.message)
})

client.on('messageReactionRemove', (messageReaction, user) => {
	if (user.bot) return

	if (!embedsIds.includes(messageReaction.message.id)) return

	// console.log({ messageReactionEmoji: messageReaction.emoji })

	if (messageReaction.emoji.name === '👍')
		embedsDico[messageReaction.message.id].accepted.splice(
			embedsDico[messageReaction.message.id].accepted.indexOf(user),
			1
		)
	else if (messageReaction.emoji.name === '👎')
		embedsDico[messageReaction.message.id].declined.splice(
			embedsDico[messageReaction.message.id].declined.indexOf(user),
			1
		)

	displayEmbed(messageReaction.message)
})

const displayEmbed = (message) => {
	message.embeds[0].fields[0] = {
		name:
			embedsDico[message.id].accepted.length + embedsDico[message.id].declined.length > 0
				? `Accepted (${embedsDico[message.id].accepted.length}/${embedsDico[message.id].accepted.length +
						embedsDico[message.id].declined.length})`
				: 'Accepted',
		value:
			embedsDico[message.id].accepted.length > 0
				? embedsDico[message.id].accepted.map((user) => user.username).join('\n')
				: '-',
		inline: true
	}

	message.embeds[0].fields[1] = {
		name: 'Declined',
		value:
			embedsDico[message.id].declined.length > 0
				? embedsDico[message.id].declined.map((user) => user.username).join('\n')
				: '-',
		inline: true
	}

	message.edit(new Discord.MessageEmbed(message.embeds[0]))
}

client.login(token)
