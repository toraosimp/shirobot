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
    ],
});

const PREFIX = "u!";
const DATA_FILE = "./data.json";

// Hardcoded channel IDs
const BIRTHDAY_CHANNEL_ID = "1421050807989567509";
const WELCOME_CHANNEL_ID = "1422311794382475284";

const PUNS = [
    "Why don't skeletons ever fight each other? Because they don't have the guts.",
    "Why did the scarecrow win an award? Because he was outstanding in his field.",
    "What do you call fake spaghetti? An impasta.",
    "Why can't your nose be 12 inches long? Because then it would be a foot.",
    "Why don't oysters donate to charity? Because they're shellfish.",
    "I only know 25 letters of the alphabet. I don't know y.",
    "Did you hear about the claustrophobic astronaut? He just needed a little space.",
    "Why did the math book look so sad? Because it had too many problems.",
    "I told my wife she should do lunges to stay in shape. That would be a big step forward.",
    "Why did the coffee file a police report? It got mugged.",
    "What do you call a pig that does karate? A pork chop.",
    "Why can't leopards play hide-and-seek? Because they're always spotted.",
    "What do you call an alligator in a vest? An investigator.",
    "Why did the chicken go to the séance? To talk to the other side.",
    "Why don't eggs tell jokes? They'd crack each other up.",
    "I don't trust stairs. They're always up to something.",
    'I only drink on days that start with "T"… Tuesday, Thursday, Today, Tomorrow.',
    "What's brown and sticky? A stick.",
    "I'm on a seafood diet. I see food and I eat it.",
    "What do you call a fish wearing a bowtie? Sofishticated.",
    "What do you call a cow with no legs? Ground beef.",
    "Why can't you trust an atom? Because they make up everything.",
    "Why did the dog sit in the shade? He didn't want to be a hot dog.",
    "What do you call a bear with no teeth? A gummy bear.",
    "I used to hate facial hair… but then it grew on me.",
    "Wanna hear a joke about construction? … I'm still working on it.",
    "Why don't graveyards ever get overcrowded? People are dying to get in.",
    "Did you hear about the guy who invented Lifesavers? He made a mint.",
    "Why did the bicycle fall over? Because it was two-tired.",
    "What's orange and sounds like a parrot? A carrot.",
    "Why did the golfer bring two pairs of pants? In case he got a hole in one.",
    "How do you organize a space party? You planet.",
    "Why can't your hand be 12 inches long? Because then it would be a foot.",
    "Why did the tomato blush? Because it saw the salad dressing.",
];

const DEFAULT_SONGS = [
    "MONSTER GENERATiON",
    "Joker Flag",
    "GOOD NIGHT AWESOME",
    "THE FUNKY UNIVERSE",
    "MEMORiES MELODiES",
    "Perfection Gimmick",
    "RESTART POiNTER",
    "NATSU☆Shiyouze!",
    "Sakura Message",
    "Nanatsuiro REALiZE",
    "Hatsukoi Rhythm",
    "Mr.AFFECTiON",
    "Mallow Blue",
    "TOMORROW EViDENCE",
    "THANK YOU FOR YOUR EVERYTHING!",
    "PARTY TIME TOGETHER",
    "WiSH VOYAGE",
    "Dancing∞BEAT!!",
    "TODAY IS",
    "Viva! Fantastic Life!!!!!!!",
    "DiSCOVER THE FUTURE",
    "Everyday Yeah!",
    "THE POLiCY",
    "NAGISA Night Temperature",
    "Boys & Girls",
    "Everything is up to us",
    "WONDER LiGHT",
    "Because Now!!",
    "HELLO CALLiNG",
    "Ardor Life",
    "SECRET NIGHT",
    "Ayana Spinel",
    "NiGHTFALL",
    "Day/Night DiSCO",
    "Encounter Love Song",
    "MEDiUM",
    "Crz Love",
    "BE WITH YOU",
    "UNFOLDiNG HARMONY",
    "miss you...",
    "Koi no Kakera",
    "Dear Butterfly",
    "Forever Note",
    "Kizuna",
    "Tsukiakari Illuminate",
    "Ame",
    "Amasa Hikaeme",
    "Kaleidoscope",
    "Miraie",
    "Tears Over ~Kono Hoshi no Kimi to~",
    "Colorful",
    "Smile Navigation",
    "Photo Frame",
    "LOVE&GAME",
    "Pythagoras☆Fighter",
    "My Friend",
    "Danshi Tarumono! ~MATSURI~",
    "Fly away!",
    "Kaiketsu Mystery",
    "Furefure! Seishun Sanka",
    "Polished",
    "Unfoggy Sight",
    "ALL ABOARD☆",
    "Haru no Yo no Yume",
    "Crescendo",
    "Touch my magic",
    "Sunny day smile!",
    "ONE dream",
    "Love two you",
    "Mikazuki no Veil",
    "Four Leaf Ring",
    "Maybe",
    "Monologue Note",
    "June is Natural",
    "SEPTET for...",
    "Leopard Eyes",
    "Last Dimension",
    "Negai wa Shine On The Sea",
    "In the meantime",
    "DAYBREAK INTERLUDE",
    "Crescent rise",
    "Treasure!",
    "SUISAI",
    "BE AUTHENTIC",
    "DESTINY",
    "Heavenly Visitor",
    "DIAMOND FUSION",
    "My Precious World",
    "VALIANT",
    "Baratsuyu",
    "PLACES",
    "Smile Again",
    "Radiance",
    "Hidden Region",
    "BEAUTIFUL PRAYER",
    "EVOLUTION",
    "KISS IN THE MUSIC",
    "ESCAPE FROM NOW",
    "Triple Down",
    "SOL",
    "Empathy",
    "Phenomenon",
    "I believe in…",
    "Captivate Time",
    "Four Seasons Blue",
    "Shiawase de Ite",
    "Associate",
    "U COMPLETE ME",
    "Up to the nines",
    "Risky na Kanojo",
    "my 10plate",
    "SILVER SKY",
    "Dis one.",
    "NO DOUBT",
    "Taiyo no Esperanza",
    "Eiensei Riron",
    "Re-raise",
    "t(w)o...",
    "Kokoro, Harebare",
    "YOUR RHAPSODY",
    "TO MY DEAREST",
    "Kiseki",
    "Hoshikuzu Magic",
    "Gekijo",
    "Mirai Notes wo Kanadete",
    "It's ALL-for you-",
    "Fly! More Liberty",
    "Period Color",
    "Start Rec",
    "Storyteller",
    "Yume Shizuku",
    "Now & Then",
    "Journey",
    "compass",
    "Binary Vampire",
    "Get in the groove",
    "Can't Stop Emotion",
    "Tenuto",
    "100% Happiness",
    "Sennen Saki mo Zutto...",
    "Poisonous Gangster (Album Edition)",
    "ZONE OF OVERLAP",
    "Bang!Bang!Bang!",
    "Survivor",
    "Utopia",
    "LOOK AT... (Album Edition)",
    "4-ROAR",
    "Sasagero -You Are Mine-",
    "Ache",
    "No Sacrifice",
    "NEVER LOSE, MY RULE",
    "IMPERIAL CHAIN (Album Edition)",
    "Murky Oath (Album Edition)",
    "BLACK TIGER",
    "Insomnia",
    "SUNRIZE",
    "RIDING",
    "STRONGER & STRONGER",
    "Rondo",
    "DOMINO",
    "CONQUEROR",
    "FIRE",
    "What You Want",
    "BREAK THE LIMITATION",
    "Unbalance Shadow",
    "Drift driving",
    "Don't Analyze Me",
    "FANTASY",
    "Heart to Heart",
    "Aoku",
    "Labyrinth",
    "Endless",
    "Dejavu",
    "Gozen 4-ji no Dusty Love",
    "NATSU Shiyouze!",
    "Mikansei na Bokura",
    "Happy Days Creation!",
    "Incomplete Ruler",
    "Welcome, Future World!!!",
    "Wonderful Octave",
    "CROSSOVER ROTATION",
    "Pieces of The World",
    "Take my rose",
    "Chameleon",
    "Good Good Games",
    "Never Green",
    "STARDOM GENIUS",
    "Magical Power",
    "Egao no Tsuzuki",
];

// Hardcoded special occasions list
const SPECIAL_OCCASIONS = [
    { date: "03/15", event: "Mido-san's birthday" },
    { date: "06/08", event: "Natsume-san's birthday" },
    { date: "11/29", event: "Inumaru-san's birthday" },
    { date: "12/06", event: "Isumi-san's birthday" },
    { date: "08/31", event: "ŹOOĻ's anniversary!" },
    { date: "08/24", event: "My birthday 😅" },
    { date: "09/09", event: "Ryo-kun's birthday" },
    { date: "01/17", event: "President Takanashi's birthday" },
    { date: "01/25", event: "Iori Izumi-san's birthday" },
    { date: "02/03", event: "Okazaki-san's birthday" },
    { date: "02/14", event: "Nikaido-san's birthday" },
    { date: "03/03", event: "Mitsuki Izumi-san's birthday" },
    { date: "04/01", event: "Yotsuba-san's birthday" },
    { date: "04/15", event: "Re:vale's anniversary!" },
    { date: "04/23", event: "Anesagi-san's birthday" },
    { date: "05/28", event: "Osaka-san's birthday" },
    { date: "05/29", event: "President Okazaki's birthday" },
    { date: "06/10", event: "IDOLiSH7's anniversary!" },
    { date: "06/20", event: "Rokuya-san's birthday" },
    { date: "07/09", event: "Kujo and Nanase-san's birthdays" },
    { date: "08/16", event: "Yaotome-san's birthday" },
    { date: "08/20", event: "IDOLiSH7 (the game) anniversary!" },
    { date: "09/08", event: "Ogami-san's birthday" },
    { date: "09/16", event: "President Yaotome's birthday" },
    { date: "09/18", event: "TRIGGER's anniversary!" },
    { date: "10/12", event: "Tsunashi-san's birthday" },
    { date: "11/11", event: "Momo-san's birthday" },
    { date: "11/25", event: "einsatZ release anniversary" },
    { date: "12/06", event: "Źquare release anniversary" },
    { date: "12/14", event: "Źenit release anniversary" },
    { date: "12/24", event: "Yuki-san's birthday" },
];

// Hardcoded messages
const BIRTHDAY_MESSAGE = "Happy Birthday {user}! 🎉🎂 We hope you have an amazing day! :paw:";
const WELCOME_MESSAGE = "Hello and welcome to the server, {user}! We hope you enjoy your time here. 😊:paw:";

let botData = {
    birthdays: {},
    songs: [],
    lastBroadcast: {},
};

async function loadData() {
    try {
        const data = await fs.readFile(DATA_FILE, "utf8");
        botData = { ...botData, ...JSON.parse(data) };

        for (const userId in botData.birthdays) {
            botData.birthdays[userId].month = parseInt(
                botData.birthdays[userId].month,
                10,
            );
            botData.birthdays[userId].day = parseInt(
                botData.birthdays[userId].day,
                10,
            );
        }

        if (!botData.songs || botData.songs.length === 0) {
            botData.songs = [...DEFAULT_SONGS];
        }

        if (!botData.lastBroadcast) {
            botData.lastBroadcast = {};
        }

        await saveData();
        console.log("Data loaded successfully");
    } catch (error) {
        console.log("No existing data file, starting fresh");
        botData.songs = [...DEFAULT_SONGS];
        await saveData();
    }
}

async function saveData() {
    try {
        await fs.writeFile(DATA_FILE, JSON.stringify(botData, null, 2));
    } catch (error) {
        console.error("Error saving data:", error);
    }
}

client.once("ready", async () => {
    console.log(`Logged in as ${client.user.tag}!`);
    await loadData();
    startScheduler();
});

client.on("guildMemberAdd", async (member) => {
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const message = WELCOME_MESSAGE.replace("{user}", `<@${member.id}>`);
    try {
        await channel.send(message);
    } catch (error) {
        console.error("Error sending welcome message:", error);
    }
});

client.on("messageCreate", async (message) => {
    if (message.author.bot || !message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    try {
        switch (command) {
            case "addbirthday":
                await handleAddBirthday(message, args);
                break;
            case "listbirthdays":
                await handleListBirthdays(message);
                break;
            case "listoccasions":
                await handleListOccasions(message);
                break;
            case "removebirthday":
                await handleRemoveBirthday(message, args);
                break;
            case "pun":
                await handlePun(message);
                break;
            case "addsong":
                await handleAddSong(message, args);
                break;
            case "removesong":
                await handleRemoveSong(message, args);
                break;
            case "listsongs":
                await handleListSongs(message);
                break;
            case "song":
                await handleSong(message);
                break;
            case "broadcast":
                await handleBroadcast(message, args);
                break;
            case "editbroadcast":
                await handleEditBroadcast(message, args);
                break;
            case "help":
                await handleHelp(message);
                break;
            default:
                break;
        }
    } catch (error) {
        console.error(`Error executing command ${command}:`, error);
        message.reply("An error occurred while executing that command.");
    }
});

async function handleAddBirthday(message, args) {
    if (
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
        return message.reply(
            "You need Administrator permission to use this command.",
        );
    }

    if (args.length < 2) {
        return message.reply("Usage: u!addbirthday @user MM/DD");
    }

    const userMention = message.mentions.users.first();
    if (!userMention) {
        return message.reply("Please mention a valid user.");
    }

    const dateStr = args[1];
    const dateMatch = dateStr.match(/^(\d{1,2})\/(\d{1,2})$/);
    if (!dateMatch) {
        return message.reply("Please use MM/DD format for the date.");
    }

    const [, month, day] = dateMatch;
    const monthNum = parseInt(month, 10);
    const dayNum = parseInt(day, 10);

    if (monthNum < 1 || monthNum > 12 || dayNum < 1 || dayNum > 31) {
        return message.reply(
            "Invalid date. Please use MM/DD format with valid month and day.",
        );
    }

    botData.birthdays[userMention.id] = {
        month: monthNum,
        day: dayNum,
        username: userMention.username,
    };
    await saveData();

    message.reply(
        `Birthday added for ${userMention.username}: ${monthNum}/${dayNum}`,
    );
}

async function handleListBirthdays(message) {
    if (Object.keys(botData.birthdays).length === 0) {
        return message.reply("No birthdays have been added yet.");
    }

    let list = "**Birthdays:**\n";
    for (const [userId, data] of Object.entries(botData.birthdays)) {
        list += `• ${data.username}: ${data.month}/${data.day}\n`;
    }

    message.reply(list);
}

async function handleListOccasions(message) {
    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Special Occasions")
        .setDescription("Here's a list of special occasions!")
        .addFields(
            SPECIAL_OCCASIONS.map(occasion => ({
                name: occasion.date,
                value: occasion.event,
                inline: true
            }))
        );

    message.reply({ embeds: [embed] });
}

async function handleRemoveBirthday(message, args) {
    if (
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
        return message.reply(
            "You need Administrator permission to use this command.",
        );
    }

    const userMention = message.mentions.users.first();
    if (!userMention) {
        return message.reply("Please mention a valid user.");
    }

    if (botData.birthdays[userMention.id]) {
        delete botData.birthdays[userMention.id];
        await saveData();
        message.reply(`Birthday removed for ${userMention.username}.`);
    } else {
        message.reply(`No birthday found for ${userMention.username}.`);
    }
}

async function handlePun(message) {
    if (!PUNS || PUNS.length === 0) {
        return message.reply("No puns are available at the moment.");
    }
    const randomPun = PUNS[Math.floor(Math.random() * PUNS.length)];
    try {
        await message.reply(randomPun);
    } catch (err) {
        console.error("Error sending pun:", err);
    }
}

async function handleAddSong(message, args) {
    if (
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
        return message.reply(
            "You need Administrator permission to use this command.",
        );
    }

    if (args.length === 0) {
        return message.reply("Usage: u!addsong Song Name - Artist");
    }

    const songName = args.join(" ");
    botData.songs.push(songName);
    await saveData();

    message.reply(`Song added: ${songName}`);
}

async function handleRemoveSong(message, args) {
    if (
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
        return message.reply(
            "You need Administrator permission to use this command.",
        );
    }

    if (args.length === 0) {
        return message.reply("Usage: u!removesong Song Name - Artist");
    }

    const songName = args.join(" ");
    const index = botData.songs.findIndex(
        (s) => s.toLowerCase() === songName.toLowerCase(),
    );

    if (index !== -1) {
        botData.songs.splice(index, 1);
        await saveData();
        message.reply(`Song removed: ${songName}`);
    } else {
        message.reply(`Song not found: ${songName}`);
    }
}

async function handleListSongs(message) {
    if (!botData.songs || botData.songs.length === 0) {
        return message.reply("No songs have been added to the list yet.");
    }

    let list = "**Current Song List:**\n";
    for (let i = 0; i < botData.songs.length; i++) {
        const line = `${i + 1}. ${botData.songs[i]}\n`;

        if (list.length + line.length > 1990) {
            await message.reply(list);
            list = "";
        }

        list += line;
    }

    if (list.length > 0) {
        await message.reply(list);
    }
}

async function handleSong(message) {
    if (!botData.songs || botData.songs.length === 0) {
        return message.reply("I am unable to think of any songs right now.");
    }

    const randomSong =
        botData.songs[Math.floor(Math.random() * botData.songs.length)];
    message.reply(
        `Wonderful question. I strongly recommend you listen to "${randomSong}" today!`,
    );
}

async function handleBroadcast(message, args) {
    if (
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
        return message.reply("You need Administrator permission to use this command.");
    }

    if (args.length === 0) {
        return message.reply("Usage: u!broadcast Your message here");
    }

    const broadcastMessage = args.join(" ");

    try {
        await message.delete();
    } catch (error) {
        console.error("Error deleting command message:", error);
    }

    const sentMessage = await message.channel.send(broadcastMessage);

    botData.lastBroadcast[message.author.id] = {
        messageId: sentMessage.id,
        channelId: sentMessage.channel.id,
        guildId: sentMessage.guild.id,
    };
    await saveData();
}

async function handleEditBroadcast(message, args) {
    if (
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)
    ) {
        return message.reply("You need Administrator permission to use this command.");
    }

    // Check if the message is a reply to another message
    let targetMessageId = null;
    let targetChannelId = message.channel.id;

    if (message.reference && message.reference.messageId) {
        // User replied to a message
        targetMessageId = message.reference.messageId;
    } else if (botData.lastBroadcast[message.author.id]) {
        // Use the last broadcast message
        targetMessageId = botData.lastBroadcast[message.author.id].messageId;
        targetChannelId = botData.lastBroadcast[message.author.id].channelId;
    } else {
        return message.reply("Please reply to the message you want to edit, or use u!broadcast first.");
    }

    if (args.length === 0) {
        return message.reply("Usage: u!editbroadcast Your new message here");
    }

    const newMessage = args.join(" ");

    try {
        const channel = await client.channels.fetch(targetChannelId);
        const broadcastMessage = await channel.messages.fetch(targetMessageId);
        
        // Check if the bot sent the message
        if (broadcastMessage.author.id !== client.user.id) {
            return message.reply("I can only edit messages that I sent!");
        }

        await broadcastMessage.edit(newMessage);

        try {
            await message.delete();
        } catch (error) {
            console.error("Error deleting command message:", error);
        }

        const confirmation = await message.channel.send(
            "Broadcast message edited successfully!",
        );
        setTimeout(() => confirmation.delete().catch(console.error), 3000);
    } catch (error) {
        console.error("Error editing broadcast message:", error);
        message.reply(
            "Could not edit the broadcast message. It may have been deleted or is no longer accessible.",
        );
    }
}

async function handleHelp(message) {
    const embed = new EmbedBuilder()
        .setColor("#0099ff")
        .setTitle("Bot Commands")
        .setDescription("Here are all available commands:")
        .addFields(
            {
                name: "**Birthday Commands**",
                value: "`u!addbirthday @user MM/DD` - Add a birthday (Admin only)\n`u!removebirthday @user` - Remove a birthday (Admin only)\n`u!listbirthdays` - List all birthdays of server members",
                inline: false,
            },
            {
                name: "**Occasion Commands**",
                value: "`u!listoccasions` - List all special occasions",
                inline: false,
            },
            {
                name: "**Fun Commands**",
                value: "`u!pun` - Get a random dad joke\n`u!song` - Get a random song recommendation",
                inline: false,
            },
            {
                name: "**Song Management**",
                value: "`u!addsong Song Name` - Add a song to the list (Admin only)\n`u!removesong Song Name` - Remove a song from the list (Admin only)\n`u!listsongs` - List all songs currently in the list",
                inline: false,
            },
            {
                name: "**Broadcasting**",
                value: "`u!broadcast message` - Send a message as the bot (Admin only)\n`u!editbroadcast message` - Edit your last broadcast message or reply to a message to edit it (Admin only)",
                inline: false,
            },
        );

    message.reply({ embeds: [embed] });
}

function startScheduler() {
    cron.schedule(
        "0 0 * * *",
        async () => {
            const now = moment.tz("Asia/Tokyo");
            const currentMonth = now.month() + 1;
            const currentDay = now.date();

            for (const [userId, data] of Object.entries(botData.birthdays)) {
                if (data.month === currentMonth && data.day === currentDay) {
                    await sendBirthdayMessage(userId);
                }
            }
        },
        {
            timezone: "Asia/Tokyo",
        },
    );

    console.log("Scheduler started (JST timezone)");
}

async function sendBirthdayMessage(userId) {
    const channel = client.channels.cache.get(BIRTHDAY_CHANNEL_ID);
    if (!channel) return;

    const message = BIRTHDAY_MESSAGE.replace("{user}", `<@${userId}>`);

    try {
        await channel.send(message);
        console.log(`Sent birthday message for user ${userId}`);
    } catch (error) {
        console.error("Error sending birthday message:", error);
    }
}

// Login
client.login(process.env.DISCORD_BOT_TOKEN);

