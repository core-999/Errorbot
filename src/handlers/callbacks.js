const { Markup } = require('telegraf');
const { captchaCallback } = require('./commands/captcha');
const { ff } = require('../utils/font');

const HELP_MENU = {
  help_main: {
    title:
      `<blockquote>` +
      `╔══════════════════════╗\n` +
      `║  📜  <b>${ff('Hinata Commands')}</b>  📜  ║\n` +
      `╚══════════════════════╝\n\n` +
      `sєℓєcт α cατєɢσяყ вєℓσω 👇` +
      `</blockquote>`,
    rows: [
      [[`👮 ${ff('Admin')}`, 'help_admin'],      [`🔨 ${ff('Bans')}`, 'help_bans'],        [`🔇 ${ff('Mutes')}`, 'help_mutes']],
      [[`⚠️ ${ff('Warns')}`, 'help_warns'],      [`📝 ${ff('Notes')}`, 'help_notes'],      [`🔍 ${ff('Filters')}`, 'help_filters']],
      [[`👋 ${ff('Greetings')}`, 'help_greet'],  [`📜 ${ff('Rules')}`, 'help_rules'],      [`🔒 ${ff('Locks')}`, 'help_locks']],
      [[`🌊 ${ff('Antiflood')}`, 'help_flood'],  [`🚫 ${ff('Blocklists')}`, 'help_black'], [`✅ ${ff('Approval')}`, 'help_appr']],
      [[`📌 ${ff('Pins')}`, 'help_pins'],        [`🧹 ${ff('Purges')}`, 'help_purges'],    [`🚨 ${ff('Reports')}`, 'help_reports']],
      [[`🔗 ${ff('Connects')}`, 'help_conn'],    [`⚙️ ${ff('Disable')}`, 'help_dis'],      [`📡 ${ff('Logging')}`, 'help_log']],
      [[`🛡️ ${ff('Captcha')}`, 'help_captcha'],  [`🛡️ ${ff('AntiRaid')}`, 'help_raid'],    [`🧽 ${ff('Cleaning')}`, 'help_clean']],
      [[`🗂️ ${ff('Topics')}`, 'help_topics'],    [`🌐 ${ff('Federations')}`, 'help_fed'],  [`🧰 ${ff('Misc')}`, 'help_misc']],
      [[`💰 ${ff('Economy')}`, 'help_eco'],      [`🎮 ${ff('Games')}`, 'help_games'],      [`🌸 ${ff('Anime')}`, 'help_anime']],
      [[`🤖 ${ff('AI Chatbot')}`, 'help_ai'],    [`🔐 ${ff('Privacy')}`, 'help_priv'],     [`📐 ${ff('Format')}`, 'help_fmt']],
      [[`📦 ${ff('Import/Export')}`, 'help_io'], [`ℹ️ ${ff('About')}`, 'about']],
    ],
  },

  help_admin: {
    title: `<blockquote>╔══════════════╗\n║ 👮 <b>${ff('Admin')}</b> 👮 ║\n╚══════════════╝\n\n/promote /demote /fullpromote\n/title /adminlist /invitelink\n/settitle /setdescription /setchatphoto</blockquote>`,
    back: 'help_main',
  },
  help_bans: {
    title: `<blockquote>╔══════════════╗\n║ 🔨 <b>${ff('Bans')}</b> 🔨 ║\n╚══════════════╝\n\n/ban /sban /dban /tban /unban\n/kick /skick /kickme /banme</blockquote>`,
    back: 'help_main',
  },
  help_mutes: {
    title: `<blockquote>╔══════════════╗\n║ 🔇 <b>${ff('Mutes')}</b> 🔇 ║\n╚══════════════╝\n\n/mute /smute /dmute /tmute /unmute</blockquote>`,
    back: 'help_main',
  },
  help_warns: {
    title: `<blockquote>╔══════════════╗\n║ ⚠️ <b>${ff('Warnings')}</b> ⚠️ ║\n╚══════════════╝\n\n/warn /swarn /dwarn /warns\n/resetwarns /rmwarn\n/setwarnlimit /warnmode mute|kick|ban</blockquote>`,
    back: 'help_main',
  },
  help_notes: {
    title: `<blockquote>╔══════════════╗\n║ 📝 <b>${ff('Notes')}</b> 📝 ║\n╚══════════════╝\n\n/save name [content]\n/get name  (or #name)\n/clear name  /clearall\n/notes</blockquote>`,
    back: 'help_main',
  },
  help_filters: {
    title: `<blockquote>╔══════════════╗\n║ 🔍 <b>${ff('Filters')}</b> 🔍 ║\n╚══════════════╝\n\n/filter trigger reply\n/stop trigger  /stopall\n/filters</blockquote>`,
    back: 'help_main',
  },
  help_greet: {
    title: `<blockquote>╔══════════════╗\n║ 👋 <b>${ff('Greetings')}</b> 👋 ║\n╚══════════════╝\n\n/setwelcome  /resetwelcome\n/welcome on|off  /cleanwelcome\n/setgoodbye  /resetgoodbye\n/goodbye on|off  /cleanservice\n\n<b>${ff('Placeholders')}:</b>\n{first} {last} {fullname} {username}\n{mention} {id} {chatname} {count}</blockquote>`,
    back: 'help_main',
  },
  help_rules: {
    title: `<blockquote>╔══════════════╗\n║ 📜 <b>${ff('Rules')}</b> 📜 ║\n╚══════════════╝\n\n/setrules  /clearrules\n/rules  /privaterules on|off</blockquote>`,
    back: 'help_main',
  },
  help_locks: {
    title: `<blockquote>╔══════════════╗\n║ 🔒 <b>${ff('Locks')}</b> 🔒 ║\n╚══════════════╝\n\n/lock type [type...]\n/unlock type\n/locks  /locktypes</blockquote>`,
    back: 'help_main',
  },
  help_flood: {
    title: `<blockquote>╔══════════════╗\n║ 🌊 <b>${ff('Antiflood')}</b> 🌊 ║\n╚══════════════╝\n\n/setflood &lt;n&gt; or off\n/flood\n/floodmode mute|kick|ban|tmute &lt;dur&gt;</blockquote>`,
    back: 'help_main',
  },
  help_black: {
    title: `<blockquote>╔══════════════╗\n║ 🚫 <b>${ff('Blocklists')}</b> 🚫 ║\n╚══════════════╝\n\n/addblacklist word [word...]\n/rmblacklist word\n/blacklist\n/blacklistmode delete|warn|mute|kick|ban</blockquote>`,
    back: 'help_main',
  },
  help_appr: {
    title: `<blockquote>╔══════════════╗\n║ ✅ <b>${ff('Approval')}</b> ✅ ║\n╚══════════════╝\n\n/approve  /unapprove\n/approval  /approved\n/unapproveall</blockquote>`,
    back: 'help_main',
  },
  help_pins: {
    title: `<blockquote>╔══════════════╗\n║ 📌 <b>${ff('Pins')}</b> 📌 ║\n╚══════════════╝\n\n/pin [silent]  /unpin  /unpinall\n/antichannelpin on|off</blockquote>`,
    back: 'help_main',
  },
  help_purges: {
    title: `<blockquote>╔══════════════╗\n║ 🧹 <b>${ff('Purges')}</b> 🧹 ║\n╚══════════════╝\n\n/purge (reply)  /del (reply)\n/purgefrom + /purgeto</blockquote>`,
    back: 'help_main',
  },
  help_reports: {
    title: `<blockquote>╔══════════════╗\n║ 🚨 <b>${ff('Reports')}</b> 🚨 ║\n╚══════════════╝\n\n/report (reply) — pings admins\n/reports on|off</blockquote>`,
    back: 'help_main',
  },
  help_conn: {
    title: `<blockquote>╔══════════════╗\n║ 🔗 <b>${ff('Connections')}</b> 🔗 ║\n╚══════════════╝\n\n/connect [chatId]\n/disconnect  /connection</blockquote>`,
    back: 'help_main',
  },
  help_dis: {
    title: `<blockquote>╔══════════════╗\n║ ⚙️ <b>${ff('Disabling')}</b> ⚙️ ║\n╚══════════════╝\n\n/disable cmd  /enable cmd\n/disabled  /disableable</blockquote>`,
    back: 'help_main',
  },
  help_log: {
    title: `<blockquote>╔══════════════╗\n║ 📡 <b>${ff('Log Channel')}</b> 📡 ║\n╚══════════════╝\n\n/setlog (forward from log ch)\n/logchannel  /unsetlog</blockquote>`,
    back: 'help_main',
  },
  help_captcha: {
    title: `<blockquote>╔══════════════╗\n║ 🛡️ <b>${ff('CAPTCHA')}</b> 🛡️ ║\n╚══════════════╝\n\n/captcha on|off\n/captchamode button|math|text</blockquote>`,
    back: 'help_main',
  },
  help_raid: {
    title: `<blockquote>╔══════════════╗\n║ 🛡️ <b>${ff('AntiRaid')}</b> 🛡️ ║\n╚══════════════╝\n\n/antiraid on [duration] | off</blockquote>`,
    back: 'help_main',
  },
  help_clean: {
    title: `<blockquote>╔══════════════╗\n║ 🧽 <b>${ff('Cleaning')}</b> 🧽 ║\n╚══════════════╝\n\n/cleanservice on|off\n/cleancommand on|off</blockquote>`,
    back: 'help_main',
  },
  help_topics: {
    title: `<blockquote>╔══════════════╗\n║ 🗂️ <b>${ff('Topics')}</b> 🗂️ ║\n╚══════════════╝\n\n/topic name (create)\n/closetopic  /opentopic\n/renametopic  /deletetopic</blockquote>`,
    back: 'help_main',
  },
  help_fed: {
    title: `<blockquote>╔══════════════╗\n║ 🌐 <b>${ff('Federations')}</b> 🌐 ║\n╚══════════════╝\n\n/newfed name (in PM)\n/joinfed id  /leavefed\n/fedinfo  /fban  /unfban</blockquote>`,
    back: 'help_main',
  },
  help_misc: {
    title: `<blockquote>╔══════════════╗\n║ 🧰 <b>${ff('Misc')}</b> 🧰 ║\n╚══════════════╝\n\n/id  /info  /ping\n/runs  /stats  /echo</blockquote>`,
    back: 'help_main',
  },
  help_eco: {
    title:
      `<blockquote>╔══════════════╗\n║ 💰 <b>${ff('Economy')}</b> 💰 ║\n╚══════════════╝\n\n` +
      `/balance — check wallet\n/daily — claim daily coins\n/weekly — weekly bonus\n/leaderboard — top richest\n/give &lt;amt&gt; (reply) — send coins\n\n` +
      `<b>🗡 ${ff('Kill Game')}</b>\n/kill (reply) — earn <b>+100 coins</b>\n/protect 1day — shield <b>300 coins</b>\n/rob &lt;amt&gt; (reply) — steal coins</blockquote>`,
    back: 'help_main',
  },
  help_games: {
    title:
      `<blockquote>╔══════════════╗\n║ 🎮 <b>${ff('Games')}</b> 🎮 ║\n╚══════════════╝\n\n` +
      `🟩 /wordguess — 5-letter word guessing game\n🔤 /gamew &lt;word&gt; — submit your guess\n❓ /trivia — quick trivia (+25 coins)\n\n` +
      `🔍 <b>/wordseek [theme]</b> — Word Search puzzle!\n` +
      `   Words hidden in a 10×10 letter grid\n` +
      `   Themes: anime | nature | space | gaming | country\n` +
      `   Type any word to find it — earn <b>+40 coins</b> per word!\n` +
      `💡 /wshint — hint (costs 25 coins)\n🛑 /stopwordseek — end the game\n🎨 /wsthemes — list all themes\n\n` +
      `🎱 /8ball &lt;question&gt;\n💘 /ship (reply) — ship meter\n🎭 /truth  /dare  /tod</blockquote>`,
    back: 'help_main',
  },
  help_anime: {
    title:
      `<blockquote>╔══════════════╗\n║ 🌸 <b>${ff('Anime Actions')}</b> 🌸 ║\n╚══════════════╝\n\n` +
      `/hug  /pat  /kiss  /slap  /poke\n/bite  /cuddle  /tickle  /wave\n/steal — steal a sticker (reply)\n\n<i>${ff('All send anime GIFs')} ✨</i></blockquote>`,
    back: 'help_main',
  },
  help_ai: {
    title:
      `<blockquote>╔══════════════╗\n║ 🤖 <b>${ff('AI Chatbot')}</b> 🤖 ║\n╚══════════════╝\n\n` +
      `Mention <b>Hinata</b> or reply to me — I respond with Groq Llama + memory.\n` +
      `Hinata mirrors your mood — be romantic, she gets romantic 💗\n\n` +
      `Groq AI also moderates chat for NSFW / gore / scam content.</blockquote>`,
    back: 'help_main',
  },
  help_fmt: {
    title:
      `<blockquote>╔══════════════╗\n║ 📐 <b>${ff('Formatting')}</b> 📐 ║\n╚══════════════╝\n\n` +
      `Notes/welcome/filters use <b>HTML</b>.\n<code>&lt;b&gt; &lt;i&gt; &lt;u&gt; &lt;s&gt; &lt;code&gt; &lt;pre&gt; &lt;a href=""&gt;</code>\n\n` +
      `<b>${ff('Placeholders')}:</b>\n{first} {last} {fullname} {username}\n{mention} {id} {chatname} {count}</blockquote>`,
    back: 'help_main',
  },
  help_priv: {
    title:
      `<blockquote>╔══════════════╗\n║ 🔐 <b>${ff('Privacy')}</b> 🔐 ║\n╚══════════════╝\n\n` +
      `AI moderation only inspects message text via Groq. No content stored beyond 5-min in-memory cache.\n` +
      `Chat memory stores up to 12 recent messages per user/chat in MongoDB.</blockquote>`,
    back: 'help_main',
  },
  help_io: {
    title:
      `<blockquote>╔══════════════╗\n║ 📦 <b>${ff('Import / Export')}</b> 📦 ║\n╚══════════════╝\n\n` +
      `${ff('Full chat-config export/import — coming soon!')} 🌸</blockquote>`,
    back: 'help_main',
  },
  about: {
    title:
      `<blockquote>╔══════════════════════╗\n║  🌸  <b>${ff('About Hinata')}</b>  🌸  ║\n╚══════════════════════╝\n\n` +
      `A Rose-grade Telegram group manager with built-in Groq AI moderation, games, economy, and an AI chatbot persona.\n\n` +
      `🛠️ <b>${ff('Stack')}</b>\n• Telegraf 4 + MongoDB\n• Groq Llama-3 for AI\n• NSFWJS vision guard\n\n` +
      `👑 <b>${ff('Owner')}</b>: @aiused\n` +
      `👨‍💻 <b>${ff('Developer')}</b>: @aiused</blockquote>`,
    rows: [
      [[`👑 ${ff('Contact Owner')}`, 'owner_contact']],
    ],
    back: 'help_main',
  },
};

function buildKeyboard(node) {
  const rows = (node.rows || []).map((r) => r.map(([label, data]) => Markup.button.callback(label, data)));
  if (node.back) rows.push([Markup.button.callback(`🔙 ${ff('Back')}`, node.back)]);
  return Markup.inlineKeyboard(rows);
}

async function handleCallbacks(ctx) {
  const data = ctx.callbackQuery?.data || '';

  if (data.startsWith('captcha:')) {
    const handled = await captchaCallback(ctx);
    if (handled) return;
  }

  if (data === 'owner_contact') {
    await ctx.answerCbQuery('👑 Owner: @aiused | t.me/aiused', { show_alert: true });
    return;
  }

  if (data === 'wordseek_play') {
    await ctx.answerCbQuery('🔍 Opening WordSeek Bot…', { show_alert: false });
    try {
      await ctx.reply(
        `<blockquote>🔍 <b>${ff('WordSeek Puzzle')}</b>\n\n${ff('Tap the button below to play Word Search!')}</blockquote>`,
        {
          parse_mode: 'HTML',
          ...Markup.inlineKeyboard([
            [Markup.button.url(`🔍 ${ff('Play WordSeek')}`, 'https://t.me/WordSeekBot')],
            [Markup.button.callback(`🔙 ${ff('Back')}`, 'help_games')],
          ]),
        }
      );
    } catch {}
    return;
  }

  if (HELP_MENU[data]) {
    const node = HELP_MENU[data];
    const kb = buildKeyboard(node);
    try {
      if (ctx.callbackQuery.message?.photo || ctx.callbackQuery.message?.caption) {
        await ctx.editMessageCaption(node.title, { parse_mode: 'HTML', ...kb });
      } else {
        await ctx.editMessageText(node.title, { parse_mode: 'HTML', ...kb });
      }
    } catch {
      await ctx.reply(node.title, { parse_mode: 'HTML', ...kb });
    }
    return ctx.answerCbQuery();
  }

  return ctx.answerCbQuery();
}

module.exports = handleCallbacks;
