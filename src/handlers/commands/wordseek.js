const { Wallet } = require('../../models');
const { mention } = require('../../utils/helpers');
const { ff } = require('../../utils/font');

// ─── Config ───────────────────────────────────────────────────────────────────
const GRID_SIZE      = 10;
const MAX_WORDS      = 6;
const GAME_MS        = 10 * 60 * 1000; // 10 minutes per game
const HINT_COST      = 25;             // coins per hint
const WORD_REWARD    = 40;             // coins per word found
const NO_HINT_BONUS  = 60;            // bonus for finishing with 0 hints

// ─── Word themes ──────────────────────────────────────────────────────────────
const THEMES = {
  anime: [
    'NARUTO','HINATA','SAKURA','SASUKE','KAKASHI','ITACHI',
    'LUFFY','ZORO','NAMI','ROBIN','USOPP',
    'ICHIGO','RUKIA','ORIHIME','RENJI',
    'MIKASA','EREN','LEVI','ARMIN','TITAN',
    'GOKU','VEGETA','PICCOLO','GOHAN',
    'GINTOKI','KAGURA','SHINPACHI',
    'EDWARD','ALPHONSE','MUSTANG',
  ],
  nature: [
    'OCEAN','RIVER','FOREST','MOUNTAIN','DESERT','VALLEY',
    'CLOUD','STORM','THUNDER','LIGHTNING',
    'FLOWER','CHERRY','BAMBOO','LOTUS','CACTUS',
    'TIGER','EAGLE','SHARK','COBRA','PANDA',
    'GLACIER','VOLCANO','CANYON','MEADOW','LAGOON',
  ],
  space: [
    'SATURN','JUPITER','VENUS','MERCURY','NEPTUNE','URANUS',
    'COMET','GALAXY','NEBULA','PULSAR','QUASAR',
    'METEOR','ORBIT','COSMOS','SOLAR','LUNAR',
    'ASTEROID','ECLIPSE','HORIZON','ZENITH',
    'NOVA','PHOTON','PROTON','NEUTRON',
  ],
  gaming: [
    'DRAGON','CASTLE','KNIGHT','WIZARD','MAGIC','POWER',
    'SHADOW','LIGHT','THUNDER','BLADE','SHIELD',
    'CROWN','QUEST','BRAVE','DUNGEON','PORTAL',
    'ARCHER','ROGUE','PALADIN','RANGER','WARLOCK',
    'LOOT','SPAWN','RESPAWN','COMBO','ULTRA',
  ],
  country: [
    'JAPAN','INDIA','BRAZIL','FRANCE','RUSSIA',
    'EGYPT','CHINA','MEXICO','CANADA','TURKEY',
    'SPAIN','ITALY','PERU','GHANA','KENYA',
    'IRAN','IRAQ','CUBA','LAOS','CHAD',
    'NEPAL','OMAN','FIJI','MALTA','TONGA',
  ],
};

const THEME_EMOJIS = {
  anime:   '🌸',
  nature:  '🌿',
  space:   '🚀',
  gaming:  '🎮',
  country: '🌍',
};

// ─── Grid generation ──────────────────────────────────────────────────────────
// 8 directions: [dRow, dCol]
const DIRS = [
  [0,  1],  // →  right
  [0, -1],  // ←  left
  [1,  0],  // ↓  down
  [-1, 0],  // ↑  up
  [1,  1],  // ↘  diag down-right
  [1, -1],  // ↙  diag down-left
  [-1, 1],  // ↗  diag up-right
  [-1,-1],  // ↖  diag up-left
];

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeGrid() {
  return Array.from({ length: GRID_SIZE }, () => Array(GRID_SIZE).fill(''));
}

function canPlace(grid, word, r, c, dr, dc) {
  for (let i = 0; i < word.length; i++) {
    const nr = r + i * dr;
    const nc = c + i * dc;
    if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) return false;
    const existing = grid[nr][nc];
    if (existing !== '' && existing !== word[i]) return false;
  }
  return true;
}

function placeWord(grid, word) {
  const dirs = shuffle(DIRS);
  const rows = shuffle([...Array(GRID_SIZE).keys()]);
  for (const [dr, dc] of dirs) {
    for (const r of rows) {
      const cols = shuffle([...Array(GRID_SIZE).keys()]);
      for (const c of cols) {
        if (canPlace(grid, word, r, c, dr, dc)) {
          const cells = [];
          for (let i = 0; i < word.length; i++) {
            grid[r + i * dr][c + i * dc] = word[i];
            cells.push([r + i * dr, c + i * dc]);
          }
          return cells; // success
        }
      }
    }
  }
  return null; // could not place
}

function buildGame(themeName) {
  const pool = shuffle(THEMES[themeName] || THEMES.gaming).filter(w => w.length <= GRID_SIZE);
  const grid        = makeGrid();
  const words       = [];
  const placements  = {}; // word → [[r,c], ...]

  for (const word of pool) {
    if (words.length >= MAX_WORDS) break;
    const cells = placeWord(grid, word);
    if (cells) {
      words.push(word);
      placements[word] = cells;
    }
  }

  // Fill blanks
  for (let r = 0; r < GRID_SIZE; r++)
    for (let c = 0; c < GRID_SIZE; c++)
      if (grid[r][c] === '') grid[r][c] = ALPHA[Math.floor(Math.random() * 26)];

  return { grid, words, placements };
}

// ─── Rendering ────────────────────────────────────────────────────────────────
function renderGrid(grid) {
  // Column numbers header
  let out = '  ' + [...Array(GRID_SIZE).keys()].map(n => String(n + 1).padStart(2)).join('') + '\n';
  for (let r = 0; r < GRID_SIZE; r++) {
    out += String(r + 1).padStart(2) + ' ' + grid[r].join(' ') + '\n';
  }
  return out.trimEnd();
}

function renderWordList(words, found) {
  return words.map(w =>
    found.has(w)
      ? `✅ ${w}`
      : `🔍 ${w}`
  ).join('\n');
}

function buildMessage(sess) {
  const emoji      = THEME_EMOJIS[sess.theme] || '🔤';
  const minsLeft   = Math.max(0, Math.ceil((sess.expires - Date.now()) / 60_000));
  const foundCount = sess.found.size;
  const totalCount = sess.words.length;

  return (
    `${emoji} <b>${ff('Word Seek')}</b> — ${ff('Theme')}: <b>${sess.theme.toUpperCase()}</b>\n` +
    `📊 ${foundCount}/${totalCount} found  •  ⏱ ${minsLeft} min left\n\n` +
    `<code>${renderGrid(sess.grid)}</code>\n\n` +
    `<b>${ff('Words to find')}:</b>\n${renderWordList(sess.words, sess.found)}\n\n` +
    `<i>💬 Just type any word to find it!\n` +
    `💡 /wshint — hint (${HINT_COST} coins)  •  🛑 /stopwordseek — quit</i>`
  );
}

// ─── Session store ────────────────────────────────────────────────────────────
const sessions = new Map(); // chatId → session object

// ─── Commands ─────────────────────────────────────────────────────────────────

/**
 * /wordseek [theme]
 * Themes: anime | nature | space | gaming | country  (random if omitted)
 */
const wordseekStart = async (ctx) => {
  const chatId = ctx.chat.id;

  if (sessions.has(chatId)) {
    return ctx.reply(
      `🎮 <b>${ff('Word Seek is already running!')}</b>\nType a word to find it, or /stopwordseek to end.`,
      { parse_mode: 'HTML' }
    );
  }

  const arg     = (ctx.message?.text || '').split(/\s+/)[1]?.toLowerCase();
  const theme   = THEMES[arg] ? arg : shuffle(Object.keys(THEMES))[0];
  const { grid, words, placements } = buildGame(theme);
  const expires = Date.now() + GAME_MS;

  const sess = {
    chatId,
    theme,
    grid,
    words,
    placements,
    found:     new Set(),
    expires,
    msgId:     null,
    hints:     0,
    players:   new Map(),   // userId → words-found count
    timerRef:  null,
  };

  const text  = buildMessage(sess);
  const sent  = await ctx.reply(text, { parse_mode: 'HTML' });
  sess.msgId  = sent.message_id;
  sessions.set(chatId, sess);

  // Auto-expire
  sess.timerRef = setTimeout(async () => {
    const s = sessions.get(chatId);
    if (!s || s.msgId !== sent.message_id) return;
    sessions.delete(chatId);
    const missed = s.words.filter(w => !s.found.has(w));
    try {
      await ctx.reply(
        `⏰ <b>${ff('Word Seek timed out!')}</b>\n` +
        `✅ Found: ${[...s.found].join(', ') || 'none'}\n` +
        `❌ Missed: <b>${missed.join(', ')}</b>`,
        { parse_mode: 'HTML' }
      );
    } catch {}
  }, GAME_MS);
};

/** /stopwordseek */
const stopWordseek = async (ctx) => {
  const sess = sessions.get(ctx.chat.id);
  if (!sess) {
    return ctx.reply(`❌ ${ff('No active Word Seek game in this chat.')}`, { parse_mode: 'HTML' });
  }
  clearTimeout(sess.timerRef);
  sessions.delete(ctx.chat.id);

  const missed  = sess.words.filter(w => !sess.found.has(w));
  const foundArr = [...sess.found];
  await ctx.reply(
    `🛑 <b>${ff('Word Seek stopped.')}</b>\n` +
    `✅ Found (${foundArr.length}): ${foundArr.join(', ') || 'none'}\n` +
    `❌ Missed (${missed.length}): <b>${missed.join(', ') || 'none'}</b>`,
    { parse_mode: 'HTML' }
  );
};

/** /wshint — costs HINT_COST coins, reveals row+col of a random letter in an unfound word */
const wshint = async (ctx) => {
  const sess = sessions.get(ctx.chat.id);
  if (!sess) {
    return ctx.reply(`❌ ${ff('No active Word Seek game.')}`, { parse_mode: 'HTML' });
  }

  const unfound = sess.words.filter(w => !sess.found.has(w));
  if (!unfound.length) {
    return ctx.reply(`✅ ${ff('All words are already found!')}`, { parse_mode: 'HTML' });
  }

  // Charge coins
  try {
    let wallet = await Wallet.findOne({ userId: ctx.from.id })
               || await Wallet.create({ userId: ctx.from.id });
    if (wallet.coins < HINT_COST) {
      return ctx.reply(
        `❌ ${ff('You need')} <b>${HINT_COST} coins</b> ${ff('for a hint.')} ` +
        `${ff('You have')} <b>${wallet.coins}</b>.`,
        { parse_mode: 'HTML' }
      );
    }
    wallet.coins -= HINT_COST;
    await wallet.save();
  } catch {}

  const word  = unfound[Math.floor(Math.random() * unfound.length)];
  const cells = sess.placements[word];
  // Reveal a middle cell
  const midCell = cells[Math.floor(cells.length / 2)];
  const [hr, hc] = midCell;
  const letter   = sess.grid[hr][hc];
  sess.hints++;

  await ctx.reply(
    `💡 <b>${ff('Hint')}</b> (-${HINT_COST} 💰)\n` +
    `The word <b>${word}</b> has the letter <b>${letter}</b> at row <b>${hr + 1}</b>, col <b>${hc + 1}</b>.`,
    { parse_mode: 'HTML' }
  );
};

/** /wsthemes — list available themes */
const wsthemes = async (ctx) => {
  const list = Object.entries(THEMES).map(([name, words]) =>
    `${THEME_EMOJIS[name]} <b>${name}</b> — ${words.length} words`
  ).join('\n');
  await ctx.reply(
    `<b>${ff('Word Seek Themes')}</b>\n\n${list}\n\n` +
    `<i>Use /wordseek &lt;theme&gt; to pick one, e.g. /wordseek anime</i>`,
    { parse_mode: 'HTML' }
  );
};

// ─── Middleware ───────────────────────────────────────────────────────────────
async function wordseekMiddleware(ctx, next) {
  const sess = sessions.get(ctx.chat?.id);
  if (!sess) return next();

  // Ignore commands, non-text
  const raw = ctx.message?.text?.trim();
  if (!raw || raw.startsWith('/')) return next();

  const guess = raw.toUpperCase();

  // Must match a game word exactly
  if (!sess.words.includes(guess))  return next();
  if (sess.found.has(guess))        return next(); // already found

  // Mark as found
  sess.found.add(guess);
  const uid = ctx.from.id;
  sess.players.set(uid, (sess.players.get(uid) || 0) + 1);

  const allDone = sess.words.every(w => sess.found.has(w));

  if (allDone) {
    clearTimeout(sess.timerRef);
    sessions.delete(ctx.chat.id);

    // Award every player, bonus for no hints
    const hintBonus = sess.hints === 0 ? NO_HINT_BONUS : 0;
    const rewardLines = [];
    for (const [playerId, cnt] of sess.players) {
      const prize = cnt * WORD_REWARD + (playerId === uid ? hintBonus : 0);
      try {
        let w = await Wallet.findOne({ userId: playerId })
              || await Wallet.create({ userId: playerId });
        w.coins += prize;
        await w.save();
        rewardLines.push(`+${prize} 💰`);
      } catch {}
    }

    return ctx.reply(
      `🏆 <b>${ff('Puzzle Complete!')}</b>\n\n` +
      `${mention(ctx.from)} found the last word: <b>${guess}</b>! 🎉\n\n` +
      `✅ <b>${ff('All words found')}:</b> ${sess.words.join(', ')}\n` +
      `${sess.hints === 0 ? '⭐ No-hint bonus!\n' : ''}` +
      `💰 <b>${ff('Coins awarded')}:</b> ${rewardLines.join(' ')}`,
      { parse_mode: 'HTML' }
    );
  }

  // Update the game message
  try {
    await ctx.telegram.editMessageText(
      ctx.chat.id, sess.msgId, undefined,
      buildMessage(sess),
      { parse_mode: 'HTML' }
    );
  } catch {}

  const left = sess.words.filter(w => !sess.found.has(w)).length;
  await ctx.reply(
    `✅ ${mention(ctx.from)} found <b>${guess}</b>! ` +
    `+${WORD_REWARD} 💰 • ${left} word${left !== 1 ? 's' : ''} left.`,
    { parse_mode: 'HTML' }
  );

  return next();
}

module.exports = { wordseekStart, stopWordseek, wshint, wsthemes, wordseekMiddleware };
