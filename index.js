const express = require("express");
const { Client, GatewayIntentBits, PermissionsBitField, EmbedBuilder, ActivityType } = require("discord.js");
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
const BIRTHDAY_MESSAGE = "Happy Birthday {user}! 🎉🎂 We hope you have an amazing day! <:paw:1424057688492347509>";
const WELCOME_MESSAGE = "Hello and welcome to the server, {user}! We hope you enjoy your time here. Make sure to read the rules in the <#1421050879234281565> channel and pick out your roles in the <#1422275724697665607> channel. 😊<:paw:1424057688492347509>";

// Welcome embeds
const WELCOME_EMBEDS = [
    new EmbedBuilder()
        .setColor("#90ab9e")
        .setTitle("<:haruheart:1424206041020891226>⠀ Server Rules⠀ <:boaruka:1424203440883630201>")
        .setDescription(
            "**<:paw:1424057688492347509>⠀ Be Kind & Respectful**\n" +
            "⠀▸ Treat everyone with respect and friendliness.\n" +
            "⠀▸ Avoid being rude, harassment, or insulting other characters or ships.\n" +
            "⠀▸ Avoid excessive spamming.\n\n" +
            "**<:paw:1424057688492347509> ⠀PG-13 & Suggestive Content**\n" +
            "⠀▸ This is a **PG-13 server**, so please keep any 18+ content or discussions strictly in the <#1422306500583624766> channel.\n" +
            "⠀▸ To access it, you can select the <@&1422307305806106724> in <#1422275724697665607>. You **must be 18 or older**.\n" +
            "⠀▸ NSFW art or links must always be **spoiler-tagged** and include a brief description. Explicit pornographic content is not allowed in this server. \n\n" +
            "**<:paw:1424057688492347509> ⠀Sharing Fanart**\n" +
            "⠀▸ Always link the **original source** when sharing fanart.\n" +
            "⠀▸ **Generative AI art or content of any kind is not allowed** in this server.\n\n" +
            "**<:paw:1424057688492347509> ⠀Use Appropriate Channels**\n" +
            "⠀▸ Respect channel purposes to avoid spoiling content for anime-only members or those who aren't caught up.\n" +
            "⠀▸ To discuss main story content beyond Part 3, please use the designated channels for Parts 4, 5, 6, and beyond accordingly.\n\n" +
            "**<:paw:1424057688492347509> ⠀Consequences for Rule-Breaking**\n" +
            "⠀▸ Rule violations may result in **warnings or immediate bans**, depending on severity.\n" +
            "⠀▸ More than **3 warnings** will result in a ban.\n\n" +
            "**<:paw:1424057688492347509> ⠀Questions & Suggestions**\n" +
            "⠀▸ If you ever have questions, concerns, or suggestions, don't hesitate to contact a mod. We're always happy to help!\n\n" +
            "**<:paw:1424057688492347509> ⠀Have Fun!**\n" +
            "⠀▸ Enjoy your time in the server and express your love for ŹOOĻ to your heart's content — as long as you follow the rules!\n\nLovely ŹOOĻ, Enjoy ŹOOĻ.  <:paw:1424057688492347509>"
        ),
    
    new EmbedBuilder()
        .setColor("#771e2f")
        .setTitle("<:tomaheart:1424206048226578562>⠀ <:booster:1426343756608573552> Server Booster Perks <:booster:1426343756608573552>⠀ <:dogmaru:1424205918098428100>")
        .setDescription(
            "**Boost the server and unlock special perks!**\n" +
            "<:paw:1424057688492347509>⠀ Receive the **<@&1424178417447735309>** role and badge next to your name immediately.\n" +
            "<:paw:1424057688492347509>⠀ Gain **custom roles, titles, normal or gradient role colors, and role icons** (once we unlock Level 2)!\n" +
            "<:paw:1424057688492347509>⠀ Server Boosters appear separately in the members list.\n" +
            "<:paw:1424057688492347509>⠀ Boosting also helps us maintain the **ŹOOĻ server tag**!"
        ),
    
    new EmbedBuilder()
        .setColor("#b3a28d")
        .setTitle("<:minaheart:1424206043268911154>⠀ Our Custom Bots⠀ <:snakenami:1424205913245356144>")
        .setDescription(
            "\n**ŹOOĻ Radio:**\n" +
            "<:paw:1424057688492347509>⠀ Plays **ŹOOĻ's music** (including every song they've featured in) **24/7 on shuffle** in the <#1422898697850720277> channel.\n" +
            "<:paw:1424057688492347509>⠀ You can always see the song currently being played in the bot's status!\n" +
            "<:paw:1424057688492347509>⠀ Use `z!help` to view commands.\n\n" +
            "**Shiro Utsugi (Me!):**\n" +
            "<:paw:1424057688492347509>⠀ Mods use this bot to manage the server.\n" +
            "<:paw:1424057688492347509>⠀ Members can use it to:\n" +
            "  ▸  Set their birthday (wishes go out at 12 AM JST)\n" +
            "  ▸  View a list of special IDOLiSH7 occasions like character birthdays and anniversaries\n" +
            "  ▸  Get song recommendations or dad jokes\n" +
            "<:paw:1424057688492347509>⠀ Commands: `u!help`\n\n" +
            "**Moonlight Ichiro / Ryo Tsukumo:**\n" +
            "<:paw:1424057688492347509>⠀ Markov-style bot that picks up words and phrases from members' texts and creates random sentences.\n" +
            "<:paw:1424057688492347509>⠀ Works in select channels only.\n" +
            "<:paw:1424057688492347509>⠀ Fun commands: you can ask him for jokes, confessions, fortunes, or apologies. (Good luck.)\n" +
            "<:paw:1424057688492347509>⠀ Commands: `r!help`\n\n" +
            "**Bot Issues or Suggestions**\n" +
            "<:paw:1424057688492347509>⠀ If a bot suddenly goes offline or isn't working properly, please ping <@526821200639295490>!\n" +
            "<:paw:1424057688492347509>⠀ If you have any suggestions, new command ideas or new bot ideas, you can share them in <#1422302452689932409> — anonymously, if you prefer, using the `?suggest [your suggestion]` command from any channel."
        ),
    
    new EmbedBuilder()
        .setColor("8f7577")
        .setTitle("<:toraheart:1424206045823369256>⠀ Channels Overview⠀ <:tigerao:1424205920476598363>")
        .setDescription(
            "<:paw:1424057688492347509>⠀ <#1422311794382475284>:\n⠀▸ Greeting channel to welcome new members!\n" +
            "<:paw:1424057688492347509>⠀ <#1421050879234281565>:\n⠀▸ Full server rules and explanations.\n" +
            "<:paw:1424057688492347509>⠀ <#1422287272706965657>:\n⠀▸ Important server announcements.\n" +
            "<:paw:1424057688492347509>⠀ <#1422287378353225909>:\n⠀▸ ŹOOĻ news, updates and translations. Members with the <@&1424090197305593936> role will be pinged.\n" +
            "<:paw:1424057688492347509>⠀ <#1422275724697665607>:\n⠀▸ Pick your roles here. Server boosters can request custom roles from mods.\n" +
            "<:paw:1424057688492347509>⠀ <#1422295153762107483>:\n⠀▸ Introductions channel! Use the pinned template if you like.\n" +
            "<:paw:1424057688492347509>⠀ <#1422302452689932409>:\n⠀▸ Suggestions for anything in the server. Use `?suggest [your suggestion]` for anonymity.\n\n" +
            "<:paw:1424057688492347509>⠀ <#1421050807989567509>:\n⠀▸ General chat about anything ŹOOĻ/i7 related. You can talk about parts 1-3 without spoiler tags, but keep longer discussions in the #main-story-content channel.\n" +
            "<:paw:1424057688492347509>⠀ <#1422307723667574794>:\n⠀▸ Share fanart, merch, memes, and promotions.\n" +
            "<:paw:1424057688492347509>⠀ <#1422310557863907360>:\n⠀▸ Talk about ŹOOĻ or i7 music.\n" +
            "<:paw:1424057688492347509>⠀ <#1422312080534667325>:\n⠀▸ Discuss analyses, theories, and deep dives.\n" +
            "<:paw:1424057688492347509>⠀ <#1422315968796823572>:\n⠀▸ Main story discussion (Parts 1-3 and anime).\n" +
            "<:paw:1424057688492347509>⠀ <#1422313980827009114>, <#1422314507438657586>, <#1422314830353666239>:\n⠀▸ Discussions for later parts. Get the roles for these channels from #roles to access them.\n" +
            "<:paw:1424057688492347509>⠀ <#1422314877342711818>:\n⠀▸ Rabbit Chats and TVs, event stories, kuji stories, books, drama CDs, etc.\n" +
            "<:paw:1424057688492347509>⠀ <#1422319489608974356>:\n⠀▸ Gameplay discussion, gacha pulls, etc.\n" +
            "<:paw:1424057688492347509>⠀ <#1422312476208529438>:\n⠀▸ Ship discussions (Please keep it PG). Ships that include incest or a large age gap between a minor and an adult are not allowed here!\n" +
            "<:paw:1424057688492347509>⠀ <#1422323857624268820>:\n⠀▸ Headcanons, AUs, fanfiction.\n" +
            "<:paw:1424057688492347509>⠀ <#1422341311444418670>:\n⠀▸ Roleplays and roleplay discussions. You can use Tupperbots here. If you ask the mods, we can create threads for your RPs.\n" +
            "<:paw:1424057688492347509>⠀ <#1422341971384471592>:\n⠀▸ Use bot commands here.\n\n" +
            "<:paw:1424057688492347509>⠀ **Character-Specific Channels (Sasagero -You Are Theirs- Category)**\n" +
            "⠀▸ Dedicated channels to appreciate, gush, share merch or art, and scream over the individual characters.\n\n" +
            "<:paw:1424057688492347509>⠀ <#1422338837073498162>:\n⠀▸ Non-i7 general discussions go here.\n" +
            "<:paw:1424057688492347509>⠀ <#1422338927641235496>:\n⠀▸ Non-i7 related games, movies, shows, etc.\n" +
            "<:paw:1424057688492347509>⠀ <#1422305834590929086>:\n⠀▸ Vent channel (requires Vent role; see pinned rules).\n\n" +
            "<:paw:1424057688492347509>⠀ <#1422546276578496543>:\n⠀▸ Chat while in VC or control the ŹOOĻ Radio bot here.\n" +
            "<:paw:1424057688492347509>⠀ <#1422899506537566340>:\n⠀▸ Streaming events/watch parties chat."
        )
];

let botData = {
    birthdays: {},
    songs: [],
    lastBroadcast: {},
    braincellCounter: 0,
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

        if (botData.braincellCounter === undefined) {
            botData.braincellCounter = 0;
        }

        await saveData();
        console.log("Data loaded successfully");
    } catch (error) {
        console.log("No existing data file, starting fresh");
        botData.songs = [...DEFAULT_SONGS];
        botData.braincellCounter = 0;
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
    
    // Set bot status - Fixed to use ActivityType
    client.user.setActivity("ŹOOĻ's Manager 🐾", { type: ActivityType.Playing });
    
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
            case "counter":
                await handleCounter(message);
                break;
            case "welcomerules":
                await handleWelcomeRules(message);
                break;
            case "boosterperks":
                await handleBoosterPerks(message);
                break;
            case "botinfo":
                await handleBotInfo(message);
                break;
            case "channelguide":
                await handleChannelGuide(message);
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
    if (args.length < 2) {
        return message.reply("Usage: u!addbirthday @user MM/DD");
    }

    const userMention = message.mentions.users.first();
    if (!userMention) {
        return message.reply("Please mention a valid user.");
    }

    // Allow users to set their own birthday, or admins to set any birthday
    if (userMention.id !== message.author.id && 
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("You can only set your own birthday. Admins can set birthdays for others.");
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

    // Check if today is the birthday that was just set
    const now = moment.tz("Asia/Tokyo");
    const currentMonth = now.month() + 1;
    const currentDay = now.date();
    
    if (monthNum === currentMonth && dayNum === currentDay) {
        // Send birthday message immediately with a 1-minute delay
        setTimeout(async () => {
            await sendBirthdayMessage(userMention.id);
        }, 60000); // 1 minute delay
    }

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
        list += `▪ ${data.username}: ${data.month}/${data.day}\n`;
    }

    message.reply(list);
}

async function handleListOccasions(message) {
    try {
        // Discord has a limit of 25 fields per embed, so we need to split into multiple embeds
        const occasionsPerEmbed = 25;
        const totalOccasions = SPECIAL_OCCASIONS.length;
        
        if (totalOccasions <= occasionsPerEmbed) {
            // Single embed for small lists
            const embed = new EmbedBuilder()
                .setColor("#8b8b8c")
                .setTitle("Special Occasions")
                .setDescription("Here's a list of special occasions!")
                .addFields(
                    SPECIAL_OCCASIONS.map(occasion => ({
                        name: occasion.date,
                        value: occasion.event,
                        inline: true
                    }))
                );

            await message.reply({ embeds: [embed] });
        } else {
            // Multiple embeds for large lists
            const embeds = [];
            for (let i = 0; i < totalOccasions; i += occasionsPerEmbed) {
                const chunk = SPECIAL_OCCASIONS.slice(i, i + occasionsPerEmbed);
                const embed = new EmbedBuilder()
                    .setColor("#8b8b8c")
                    .setTitle(`Special Occasions ${i === 0 ? '' : `(${Math.floor(i/occasionsPerEmbed) + 1})`}`)
                    .setDescription(i === 0 ? "Here's a list of special occasions!" : "Continued...")
                    .addFields(
                        chunk.map(occasion => ({
                            name: occasion.date,
                            value: occasion.event,
                            inline: true
                        }))
                    );
                embeds.push(embed);
            }

            // Send multiple embeds
            for (const embed of embeds) {
                await message.channel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error("Error creating occasions embed:", error);
        // Fallback to regular message if embed fails
        let list = "**Special Occasions:**\n";
        for (const occasion of SPECIAL_OCCASIONS) {
            const line = `▪ ${occasion.date} - ${occasion.event}\n`;
            if (list.length + line.length > 1900) {
                await message.reply(list);
                list = "";
            }
            list += line;
        }
        if (list.length > 0) {
            await message.reply(list);
        }
    }
}

async function handleRemoveBirthday(message, args) {
    if (args.length < 1) {
        return message.reply("Usage: u!removebirthday @user");
    }

    const userMention = message.mentions.users.first();
    if (!userMention) {
        return message.reply("Please mention a valid user.");
    }

    // Allow users to remove their own birthday, or admins to remove any birthday
    if (userMention.id !== message.author.id && 
        !message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("You can only remove your own birthday. Admins can remove birthdays for others.");
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
    if (args.length === 0) {
        return message.reply("Usage: u!addsong Song Name - Artist");
    }

    const songName = args.join(" ");
    botData.songs.push(songName);
    await saveData();

    message.reply(`Song added: ${songName}`);
}

async function handleRemoveSong(message, args) {
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

    try {
        // Discord has a limit of 25 fields per embed, so we need to split into multiple embeds
        const songsPerEmbed = 25;
        const totalSongs = botData.songs.length;
        
        if (totalSongs <= songsPerEmbed) {
            // Single embed for small lists
            const embed = new EmbedBuilder()
                .setColor("#8b8b8c")
                .setTitle("Current Song List")
                .setDescription("Here are all the songs in the list:")
                .addFields(
                    botData.songs.map((song, index) => ({
                        name: `${index + 1}.`,
                        value: song,
                        inline: false
                    }))
                );

            await message.reply({ embeds: [embed] });
        } else {
            // Multiple embeds for large lists
            const embeds = [];
            for (let i = 0; i < totalSongs; i += songsPerEmbed) {
                const chunk = botData.songs.slice(i, i + songsPerEmbed);
                const embed = new EmbedBuilder()
                    .setColor("#8b8b8c")
                    .setTitle(`Current Song List ${i === 0 ? '' : `(${Math.floor(i/songsPerEmbed) + 1})`}`)
                    .setDescription(i === 0 ? "Here are all the songs in the list:" : "Continued...")
                    .addFields(
                        chunk.map((song, index) => ({
                            name: `${i + index + 1}.`,
                            value: song,
                            inline: false
                        }))
                    );
                embeds.push(embed);
            }

            // Send multiple embeds
            for (const embed of embeds) {
                await message.channel.send({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error("Error creating songs embed:", error);
        // Fallback to regular message if embed fails
        let list = "**Current Song List:**\n";
        for (let i = 0; i < botData.songs.length; i++) {
            const line = `${i + 1}. ${botData.songs[i]}\n`;
            if (list.length + line.length > 1900) {
                await message.reply(list);
                list = "";
            }
            list += line;
        }
        if (list.length > 0) {
            await message.reply(list);
        }
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
        .setColor("#8b8b8c")
        .setTitle("Shiro Bot Commands")
        .setDescription("Here are all available commands:")
        .addFields(
            {
                name: "**Birthday Commands**",
                value: "`u!addbirthday @user MM/DD` - Add a birthday (Users can set their own, Admins can set any)\n`u!removebirthday @user` - Remove a birthday (Users can remove their own, Admins can remove any)\n`u!listbirthdays` - List all birthdays of server members\n**Note:** The bot will send your birthday message at 12:00 AM JST if your birthday is set before the day. If you set it on the same day (JST), the message will be sent one minute later.",
                inline: false,
            },
            {
                name: "**IDOLiSH7 Occasion Commands**",
                value: "`u!listoccasions` - List all the special IDOLiSH7 occasions",
                inline: false,
            },
            {
                name: "**Fun Commands**",
                value: "`u!pun` - Get a random dad joke\n`u!song` - Get a random song recommendation",
                inline: false,
            },
            {
                name: "**Song Management**",
                value: "`u!addsong Song Name` - Add a song to the list\n`u!removesong Song Name` - Remove a song from the list\n`u!listsongs` - List all songs currently in the list",
                inline: false,
            }
       )
      .setFooter({ text: 'ŹOOĻ Management Bot ▪ Created by pinkmagic (Sky)' })
      .setTimestamp();

    message.reply({ embeds: [embed] });
}

async function handleCounter(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return; // Silent fail for non-admins
    }

    botData.braincellCounter++;
    await saveData();
    
    await message.reply(`Braincell Counter Updated: ${botData.braincellCounter}`);
}

// New welcome embed commands
async function handleWelcomeRules(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("You need Administrator permission to use this command.");
    }

    try {
        await message.channel.send({
            content: "**Welcome to ŹOOĻ World Domination! <:paw:1424057688492347509>**\nWe're so glad you're here! This is a friendly and safe space for fans of ŹOOĻ to chat, share, and have fun.\n\nTo make sure everyone has a good experience, please take a moment to read the rules, guidelines, and information about our server below.\n\n<:haruheart:1424206041020891226><:boaruka:1424203440883630201> <:tomaheart:1424206048226578562><:dogmaru:1424205918098428100> <:minaheart:1424206043268911154><:snakenami:1424205913245356144> <:toraheart:1424206045823369256><:tigerao:1424205920476598363> <:haruheart:1424206041020891226><:boaruka:1424203440883630201> <:tomaheart:1424206048226578562><:dogmaru:1424205918098428100> <:minaheart:1424206043268911154><:snakenami:1424205913245356144> <:toraheart:1424206045823369256><:tigerao:1424205920476598363>\n",
            embeds: [WELCOME_EMBEDS[0]]
        });
    } catch (error) {
        console.error("Error sending welcome rules embed:", error);
        message.reply("An error occurred while sending the welcome rules.");
    }
}

async function handleBoosterPerks(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("You need Administrator permission to use this command.");
    }

    try {
        await message.channel.send({ embeds: [WELCOME_EMBEDS[1]] });
    } catch (error) {
        console.error("Error sending booster perks embed:", error);
        message.reply("An error occurred while sending the booster perks.");
    }
}

async function handleBotInfo(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("You need Administrator permission to use this command.");
    }

    try {
        await message.channel.send({ embeds: [WELCOME_EMBEDS[2]] });
    } catch (error) {
        console.error("Error sending bot info embed:", error);
        message.reply("An error occurred while sending the bot information.");
    }
}

async function handleChannelGuide(message) {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
        return message.reply("You need Administrator permission to use this command.");
    }

    try {
        await message.channel.send({ embeds: [WELCOME_EMBEDS[3]] });
    } catch (error) {
        console.error("Error sending channel guide embed:", error);
        message.reply("An error occurred while sending the channel guide.");
    }
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
    if (!channel) {
        console.error(`Birthday channel ${BIRTHDAY_CHANNEL_ID} not found`);
        return;
    }

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











