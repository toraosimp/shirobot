const express = require("express");
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder } = require("discord.js");
const cron = require("node-cron");
const moment = require("moment-timezone");
const fs = require("fs").promises;

const app = express();
app.get("/", (req, res) => res.send("Bot is running!"));
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessageReactions
    ],
});

const PREFIX = "u!";
const DATA_FILE = "./data.json";

// Default puns and songs
const PUNS = [/* keep your existing puns */];
const DEFAULT_SONGS = [/* keep your existing songs */];

let botData = {
    birthdays: {},
    occasions: {},
    songs: [],
    channels: { birthday: null, occasion: null, welcome: null },
    messages: {
        birthday: "Happy Birthday {user}! 🎉🎂 Wishing you an amazing day!",
        occasion: "Happy {occasion} {user}! 🎊",
        welcome: "Welcome to the server, {user}! 👋"
    },
    roleReactions: {},
    broadcastRole: null,
    lastBroadcast: {}
};

// Load data
async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf8");
        botData = { ...botData, ...JSON.parse(data) };
        if (!botData.songs.length) botData.songs = [...DEFAULT_SONGS];
        console.log("Data loaded successfully");
    } catch {
        botData.songs = [...DEFAULT_SONGS];
        await saveData();
        console.log("No existing data file, starting fresh");
    }
}

async function saveData() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(botData, null, 2));
    } catch (err) {
        console.error("Error saving data:", err);
    }
}

// Scheduler for birthdays and occasions (JST)
function startScheduler() {
    cron.schedule("0 0 * * *", async () => {
        const now = moment.tz("Asia/Tokyo");
        const month = now.month() + 1;
        const day = now.date();

        for (const [userId, data] of Object.entries(botData.birthdays)) {
            if (data.month === month && data.day === day) sendMessage(botData.channels.birthday, botData.messages.birthday.replace("{user}", `<@${userId}>`));
        }

        for (const [userId, occasions] of Object.entries(botData.occasions)) {
            occasions.forEach(o => {
                if (o.month === month && o.day === day)
                    sendMessage(botData.channels.occasion, botData.messages.occasion.replace("{user}", `<@${userId}>`).replace("{occasion}", o.name));
            });
        }
    }, { timezone: "Asia/Tokyo" });

    console.log("Scheduler started (JST)");
}

async function sendMessage(channelId, content) {
    if (!channelId) return;
    try {
        const channel = await client.channels.fetch(channelId);
        if (channel) await channel.send(content);
    } catch (err) {
        console.error("Error sending message:", err);
    }
}

// Event Handlers
client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await loadData();
    startScheduler();
});

client.on("guildMemberAdd", async member => {
    if (!botData.channels.welcome) return;
    sendMessage(botData.channels.welcome, botData.messages.welcome.replace("{user}", `<@${member.id}>`));
});

// Role reaction add/remove
async function handleReaction(reaction, user, add) {
    if (user.bot) return;
    if (reaction.partial) await reaction.fetch().catch(console.error);

    const messageId = reaction.message.id;
    const emojiKey = reaction.emoji.id || reaction.emoji.name;
    const roleId = botData.roleReactions[messageId]?.[emojiKey];
    if (!roleId) return;

    const member = reaction.message.guild.members.cache.get(user.id);
    const role = reaction.message.guild.roles.cache.get(roleId);
    if (!member || !role) return;

    try {
        if (add) await member.roles.add(role);
        else await member.roles.remove(role);
    } catch (err) {
        console.error(`Error ${add ? "adding" : "removing"} role:`, err);
    }
}

client.on("messageReactionAdd", (r, u) => handleReaction(r, u, true));
client.on("messageReactionRemove", (r, u) => handleReaction(r, u, false));

// Command Handling
const commands = {
    pun: async (message) => message.reply(PUNS[Math.floor(Math.random() * PUNS.length)]),
    song: async (message) => message.reply(botData.songs.length ? `Listen to: "${botData.songs[Math.floor(Math.random()*botData.songs.length)]}"` : "No songs available."),
    listsongs: async (message) => message.reply(botData.songs.map((s,i)=>`${i+1}. ${s}`).join("\n") || "No songs added."),
    // add all other commands here, similar to your existing handlers
};

client.on("messageCreate", async message => {
    if (!message.content.startsWith(PREFIX) || message.author.bot) return;
    const [cmd, ...args] = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = commands[cmd.toLowerCase()];
    if (command) command(message, args).catch(err => message.reply("Error executing command."));
});

// Login
client.login(process.env.DISCORD_BOT_TOKEN);

