require('dotenv').config();
const { Telegraf } = require('telegraf');
const config = require('./config/index');
const logger = require('./utils/logger');

require('./models/index');

const startCommand = require('./handlers/commands/start');
const handleCallbacks = require('./handlers/callbacks');
const aiModeration = require('./handlers/moderation');
const chatbotHandler = require('./handlers/commands/chatbot');

const bans = require('./handlers/commands/bans');
const mutes = require('./handlers/commands/mutes');
const warnings = require('./handlers/commands/warnings');
const adminCmds = require('./handlers/commands/admin');
const notes = require('./handlers/commands/notes');
const filters = require('./handlers/commands/filters');
const rulesH = require('./handlers/commands/rules');
const greetings = require('./handlers/commands/greetings');
const purges = require('./handlers/commands/purges');
const pins = require('./handlers/commands/pins');
const locks = require('./handlers/commands/locks');
const antiflood = require('./handlers/commands/antiflood');
const blocklists = require('./handlers/commands/blocklists');
const approval = require('./handlers/commands/approval');
const misc = require('./handlers/commands/misc');
const disabling = require('./handlers/commands/disable');
const reportsH = require('./handlers/commands/reports');
const loggingH = require('./handlers/commands/logging');
const connections = require('./handlers/commands/connections');
const captcha = require('./handlers/commands/captcha');
const antiraid = require('./handlers/commands/antiraid');
const cleaning = require('./handlers/commands/cleaning');
const topicsH = require('./handlers/commands/topics');
const federations = require('./handlers/commands/federations');
const economy = require('./handlers/commands/economy');
const games    = require('./handlers/commands/games');
const wordseek = require('./handlers/commands/wordseek');
const anime = require('./handlers/commands/anime');
const extras = require('./handlers/commands/extras');
const ownerCmds = require('./handlers/commands/owner');
const linkprotect = require('./handlers/commands/linkprotect');
const isAdmin = require('./middleware/admin');
const { init: initLogger } = require('./services/loggingService');

if (!config.botToken) {
  logger.error('❌ BOT_TOKEN is missing.');
  process.exit(1);
}

const bot = new Telegraf(config.botToken, { handlerTimeout: 90_000 });

// ------------------ MIDDLEWARES (order matters) ------------------
bot.use(isAdmin);                                  // sets ctx.isAdmin / ctx.isOwner
bot.use(disabling.disabledMiddleware);             // /disable command gate
bot.use(captcha.captchaJoinHandler);               // CAPTCHA on join
bot.use(antiraid.antiRaidJoinMiddleware);          // anti-raid on join
bot.use(federations.fedJoinCheck);                 // fed-ban on join
bot.use(greetings.newMemberHandler);               // welcomes
bot.use(greetings.leftMemberHandler);              // goodbyes
bot.use(greetings.cleanServiceMiddleware);         // clean service msgs
bot.use(pins.antiChannelPinMiddleware);            // anti-channel-pin
bot.use(locks.lockMiddleware);                     // locks
bot.use(blocklists.blacklistMiddleware);           // blocklists
bot.use(antiflood.antifloodMiddleware);            // antiflood
bot.use(linkprotect.linkProtectMiddleware);         // link protection
bot.use(aiModeration);                             // Groq AI scan
bot.use(games.triviaMiddleware);                   // trivia answers
bot.use(wordseek.wordseekMiddleware);              // wordseek word detection
bot.use(notes.hashtagMiddleware);                  // #notename
bot.use(filters.filterMiddleware);                 // text filters
bot.use(cleaning.cleanCommandMiddleware);          // delete commands after run

// ------------------ COMMANDS ------------------
bot.start(startCommand);
bot.help(async (ctx) => {
  const { Markup } = require('telegraf');
  const { ff } = require('./utils/font');
  const helpTitle =
    `<blockquote>` +
    `╔══════════════════════╗\n` +
    `║  📜  <b>${ff('Hinata Commands')}</b>  📜  ║\n` +
    `╚══════════════════════╝\n\n` +
    `sєℓєcт α cατєɢσяყ вєℓσω 👇` +
    `</blockquote>`;
  const kb = Markup.inlineKeyboard([
    [Markup.button.callback(`👮 ${ff('Admin')}`, 'help_admin'),      Markup.button.callback(`🔨 ${ff('Bans')}`, 'help_bans'),        Markup.button.callback(`🔇 ${ff('Mutes')}`, 'help_mutes')],
    [Markup.button.callback(`⚠️ ${ff('Warns')}`, 'help_warns'),      Markup.button.callback(`📝 ${ff('Notes')}`, 'help_notes'),      Markup.button.callback(`🔍 ${ff('Filters')}`, 'help_filters')],
    [Markup.button.callback(`👋 ${ff('Greetings')}`, 'help_greet'),  Markup.button.callback(`📜 ${ff('Rules')}`, 'help_rules'),      Markup.button.callback(`🔒 ${ff('Locks')}`, 'help_locks')],
    [Markup.button.callback(`🌊 ${ff('Antiflood')}`, 'help_flood'),  Markup.button.callback(`🚫 ${ff('Blocklists')}`, 'help_black'), Markup.button.callback(`✅ ${ff('Approval')}`, 'help_appr')],
    [Markup.button.callback(`📌 ${ff('Pins')}`, 'help_pins'),        Markup.button.callback(`🧹 ${ff('Purges')}`, 'help_purges'),    Markup.button.callback(`🚨 ${ff('Reports')}`, 'help_reports')],
    [Markup.button.callback(`🔗 ${ff('Connects')}`, 'help_conn'),    Markup.button.callback(`⚙️ ${ff('Disable')}`, 'help_dis'),      Markup.button.callback(`📡 ${ff('Logging')}`, 'help_log')],
    [Markup.button.callback(`🛡️ ${ff('Captcha')}`, 'help_captcha'),  Markup.button.callback(`🛡️ ${ff('AntiRaid')}`, 'help_raid'),    Markup.button.callback(`🧽 ${ff('Cleaning')}`, 'help_clean')],
    [Markup.button.callback(`🗂️ ${ff('Topics')}`, 'help_topics'),    Markup.button.callback(`🌐 ${ff('Federations')}`, 'help_fed'),  Markup.button.callback(`🧰 ${ff('Misc')}`, 'help_misc')],
    [Markup.button.callback(`💰 ${ff('Economy')}`, 'help_eco'),      Markup.button.callback(`🎮 ${ff('Games')}`, 'help_games'),      Markup.button.callback(`🌸 ${ff('Anime')}`, 'help_anime')],
    [Markup.button.callback(`🤖 ${ff('AI Chatbot')}`, 'help_ai'),    Markup.button.callback(`🔐 ${ff('Privacy')}`, 'help_priv'),     Markup.button.callback(`📐 ${ff('Format')}`, 'help_fmt')],
    [Markup.button.callback(`📦 ${ff('Import/Export')}`, 'help_io'), Markup.button.callback(`ℹ️ ${ff('About')}`, 'about')],
  ]);
  await ctx.reply(helpTitle, { parse_mode: 'HTML', ...kb });
});

// Bans
bot.command('ban', bans.ban);
bot.command('sban', bans.sban);
bot.command('dban', bans.dban);
bot.command('tban', bans.tban);
bot.command('unban', bans.unban);
bot.command('kick', bans.kick);
bot.command('skick', bans.skick);
bot.command('kickme', bans.kickme);
bot.command('banme', bans.banme);

// Mutes
bot.command('mute', mutes.mute);
bot.command('smute', mutes.smute);
bot.command('dmute', mutes.dmute);
bot.command('tmute', mutes.tmute);
bot.command('unmute', mutes.unmute);

// Warnings
bot.command('warn', warnings.warn);
bot.command('swarn', warnings.swarn);
bot.command('dwarn', warnings.dwarn);
bot.command('warns', warnings.warns);
bot.command('resetwarns', warnings.resetwarns);
bot.command('rmwarn', warnings.rmwarn);
bot.command('setwarnlimit', warnings.setwarnlimit);
bot.command('warnmode', warnings.warnmode);

// Admin
bot.command('promote', adminCmds.promote);
bot.command('fullpromote', adminCmds.fullpromote);
bot.command('demote', adminCmds.demote);
bot.command('title', adminCmds.title);
bot.command(['adminlist', 'admins'], adminCmds.adminlist);
bot.command(['invitelink', 'link'], adminCmds.invitelink);
bot.command('settitle', adminCmds.settitle);
bot.command('setdescription', adminCmds.setdescription);
bot.command('setchatphoto', adminCmds.setchatphoto);

// Notes
bot.command('save', notes.save);
bot.command('clear', notes.clear);
bot.command('clearall', notes.clearall);
bot.command('notes', notes.notes);
bot.command('get', notes.get);

// Filters
bot.command('filter', filters.filter);
bot.command('stop', filters.stop);
bot.command('stopall', filters.stopall);
bot.command('filters', filters.filters);

// Rules
bot.command('setrules', rulesH.setrules);
bot.command('clearrules', rulesH.clearrules);
bot.command(['rules', 'rule'], rulesH.rules);
bot.command('privaterules', rulesH.privaterules);

// Greetings
bot.command('setwelcome', greetings.setwelcome);
bot.command('resetwelcome', greetings.resetwelcome);
bot.command('welcome', greetings.welcome);
bot.command('cleanwelcome', greetings.cleanwelcome);
bot.command('setgoodbye', greetings.setgoodbye);
bot.command('resetgoodbye', greetings.resetgoodbye);
bot.command('goodbye', greetings.goodbye);
bot.command('cleanservice', greetings.cleanservice);

// Purges
bot.command('purge', purges.purge);
bot.command('del', purges.del);
bot.command('purgefrom', purges.purgefrom);
bot.command('purgeto', purges.purgeto);

// Pins
bot.command('pin', pins.pin);
bot.command('unpin', pins.unpin);
bot.command('unpinall', pins.unpinall);
bot.command('antichannelpin', pins.antichannelpin);

// Locks
bot.command('lock', locks.lock);
bot.command('unlock', locks.unlock);
bot.command('locks', locks.locks);
bot.command('locktypes', locks.locktypes);

// Antiflood
bot.command('setflood', antiflood.setflood);
bot.command('flood', antiflood.flood);
bot.command('floodmode', antiflood.floodmode);

// Blocklists
bot.command(['addblacklist', 'blacklistadd'], blocklists.addblacklist);
bot.command(['rmblacklist', 'blacklistrm'], blocklists.rmblacklist);
bot.command(['blacklist', 'blocklist'], blocklists.blacklist);
bot.command(['blacklistmode', 'blocklistmode'], blocklists.blacklistmode);

// Approval
bot.command('approve', approval.approve);
bot.command('unapprove', approval.unapprove);
bot.command('approval', approval.approval);
bot.command('approved', approval.approved);
bot.command('unapproveall', approval.unapproveall);

// Link Protection
bot.command('linkprotect', linkprotect.linkprotect);

// Misc
bot.command('id', misc.id);
bot.command('info', misc.info);
bot.command('ping', misc.ping);
bot.command('runs', misc.runs);
bot.command('echo', misc.echo);
bot.command('stats', misc.stats);

// Disabling
bot.command('disable', disabling.disable);
bot.command('enable', disabling.enable);
bot.command('disabled', disabling.disabled);
bot.command('disableable', disabling.disableable);

// Reports
bot.command('report', reportsH.report);
bot.command('reports', reportsH.reports);

// Logging
bot.command('logchannel', loggingH.logchannel);
bot.command('setlog', loggingH.setlog);
bot.command('unsetlog', loggingH.unsetlog);

// Connections
bot.command('connect', connections.connect);
bot.command('disconnect', connections.disconnect);
bot.command('connection', connections.connection);

// CAPTCHA
bot.command('captcha', captcha.captcha);
bot.command('captchamode', captcha.captchamode);

// AntiRaid
bot.command('antiraid', antiraid.antiraid);

// Cleaning
bot.command('cleancommand', cleaning.cleancommand);

// Topics
bot.command('topic', topicsH.topic);
bot.command('closetopic', topicsH.closetopic);
bot.command('opentopic', topicsH.opentopic);
bot.command('renametopic', topicsH.renametopic);
bot.command('deletetopic', topicsH.deletetopic);

// Federations
bot.command('newfed', federations.newfed);
bot.command('delfed', federations.delfed);
bot.command('joinfed', federations.joinfed);
bot.command('leavefed', federations.leavefed);
bot.command('fedinfo', federations.fedinfo);
bot.command('fban', federations.fban);
bot.command('unfban', federations.unfban);

// Economy
bot.command(['balance', 'wallet'], economy.balance);
bot.command('bal', economy.bal);
bot.command('daily', economy.daily);
bot.command('weekly', economy.weekly);
bot.command(['leaderboard', 'lb', 'top'], economy.leaderboard);
bot.command('give', economy.give);
bot.command('kill', economy.killGame);
bot.command('protect', economy.protect);
bot.command('rob', economy.rob);

// Anime actions
bot.command('hug', anime.hug);
bot.command('pat', anime.pat);
bot.command('slap', anime.slap);
bot.command('kiss', anime.kiss);
bot.command('poke', anime.poke);
bot.command('bite', anime.bite);
bot.command('cuddle', anime.cuddle);
bot.command('tickle', anime.tickle);
bot.command('wave', anime.wave);
bot.command(['8ball', 'eightball'], anime.eightball);
bot.command('ship', anime.ship);
bot.command('truth', anime.truth);
bot.command('dare', anime.dare);
bot.command(['tod', 'truthordare'], anime.truthordare);
bot.command('steal', anime.steal);

// Games
bot.command('wordguess', games.wordguess);
bot.command('gamew', games.gamew);
bot.command('guess', games.guess);
bot.command('trivia', games.trivia);
bot.command(['wordseek', 'ws'], wordseek.wordseekStart);
bot.command(['stopwordseek', 'wsend', 'stopws'], wordseek.stopWordseek);
bot.command(['wshint', 'wsh'], wordseek.wshint);
bot.command(['wsthemes', 'wst'], wordseek.wsthemes);

// Extras
bot.command(['formathelp', 'markdownhelp'], extras.formathelp);
bot.command('setlang', extras.setlang);
bot.command('privacy', extras.privacy);
bot.command(['exportchat', 'export'], extras.exportchat);
bot.command(['importchat', 'import'], extras.importchat);
bot.command(['protection', 'safemode', 'nsfw'], extras.protection);
bot.command('strictmode', extras.strictmode);

// Owner / Sudo commands
bot.command(['addcoins', 'givecoins'], ownerCmds.addcoins);
bot.command(['removecoins', 'takecoins', 'deductcoins'], ownerCmds.removecoins);
bot.command('setcoins', ownerCmds.setcoins);
bot.command('botban', ownerCmds.botban);
bot.command('botunban', ownerCmds.botunban);
bot.command('botbanned', ownerCmds.botbanned);
bot.command('addsudo', ownerCmds.addsudo);
bot.command('removesudo', ownerCmds.removesudo);
bot.command(['sudolist', 'sudo'], ownerCmds.sudolist);
bot.command(['setloggergroup', 'setlogger'], ownerCmds.setloggergroup);
bot.command('broadcast', ownerCmds.broadcast);
bot.command(['ownerinfo', 'owner'], ownerCmds.ownerinfo);

// AI Chatbot — run after all commands
bot.on('text', chatbotHandler);
bot.on('callback_query', handleCallbacks);

// ------------------ ERROR HANDLER ------------------
bot.catch((err, ctx) => {
  logger.error(`Error in update ${ctx.updateType}: ${err.message}`);
  logger.error(err.stack);
});

// ------------------ LAUNCH ------------------
bot.launch().then(() => logger.info('🚀 Hinata Bot polling stopped.')).catch((err) => {
  logger.error(`Bot launch error: ${err.message}`);
  process.exit(1);
});

initLogger(bot);
logger.info('🌸 Hinata starting…');

process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

module.exports = bot;
