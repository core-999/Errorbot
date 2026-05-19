const fiveLetterWords = require('../../utils/dictionary');
const { Wallet } = require('../../models');
const { safeReply, mention } = require('../../utils/helpers');

const sessions = new Map(); // chatId -> { word, tries, msg }

function pickWord() {
  const arr = [...fiveLetterWords];
  return arr[Math.floor(Math.random() * arr.length)];
}

function feedback(guess, target) {
  const out = [];
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) out.push('🟩');
    else if (target.includes(guess[i])) out.push('🟨');
    else out.push('⬛');
  }
  return out.join('');
}

const wordguess = async (ctx) => {
  if (sessions.has(ctx.chat.id)) {
    return safeReply(ctx, '🎮 A game is already running. Send 5-letter guesses!');
  }
  const word = pickWord();
  sessions.set(ctx.chat.id, { word, tries: 0 });
  await safeReply(ctx,
    `🎮 <b>Word Guess</b> started!\nI picked a 5-letter word. Send 5-letter guesses.\n🟩 right letter & spot, 🟨 right letter, ⬛ no.\nYou have <b>6</b> tries.`);
};

const gamew = async (ctx) => {
  const text = (ctx.message.text || '').trim().toLowerCase();
  if (text.length !== 5 || !/^[a-z]{5}$/.test(text)) return safeReply(ctx, '❌ Send a 5-letter word.');
  const sess = sessions.get(ctx.chat.id);
  if (!sess) return safeReply(ctx, '❌ Start a game with /wordguess first.');
  if (!fiveLetterWords.has(text)) return safeReply(ctx, '❌ Not in the dictionary.');
  sess.tries += 1;
  const fb = feedback(text, sess.word);
  if (text === sess.word) {
    sessions.delete(ctx.chat.id);
    const reward = Math.max(50, 200 - sess.tries * 25);
    let w = await Wallet.findOne({ userId: ctx.from.id });
    if (!w) w = await Wallet.create({ userId: ctx.from.id });
    w.coins += reward; await w.save();
    return safeReply(ctx, `${fb}\n🎉 ${mention(ctx.from)} got it in <b>${sess.tries}</b>! +<b>${reward}</b> coins`);
  }
  if (sess.tries >= 6) {
    sessions.delete(ctx.chat.id);
    return safeReply(ctx, `${fb}\n💀 Out of tries! Word was <b>${sess.word}</b>.`);
  }
  await safeReply(ctx, `${fb}\nTries: <b>${sess.tries}/6</b>`);
};

const triviaSessions = new Map(); // chatId -> { answer, expires }

const trivia = async (ctx) => {
  const qs = [
    { q: 'Capital of Japan?', a: 'tokyo' },
    { q: 'How many continents?', a: '7' },
    { q: 'Author of Naruto?', a: 'kishimoto' },
    { q: 'Largest planet?', a: 'jupiter' },
    { q: 'Square root of 144?', a: '12' },
    { q: 'Studio that made Spirited Away?', a: 'ghibli' },
    { q: 'HTTP status for "Not Found"?', a: '404' },
    { q: 'Currency of the UK?', a: 'pound' },
    { q: 'Chemical symbol for gold?', a: 'au' },
  ];
  const item = qs[Math.floor(Math.random() * qs.length)];
  triviaSessions.set(ctx.chat.id, { answer: item.a, expires: Date.now() + 30_000 });
  await safeReply(ctx, `❓ <b>Trivia</b>\n${item.q}\n\n<i>Reply within 30s.</i>`);
};

async function triviaMiddleware(ctx, next) {
  const sess = triviaSessions.get(ctx.chat?.id);
  if (!sess) return next();
  if (Date.now() > sess.expires) { triviaSessions.delete(ctx.chat.id); return next(); }
  const text = (ctx.message?.text || '').toLowerCase();
  if (text && text.includes(sess.answer)) {
    triviaSessions.delete(ctx.chat.id);
    let w = await Wallet.findOne({ userId: ctx.from.id }) || await Wallet.create({ userId: ctx.from.id });
    w.coins += 25; await w.save();
    await ctx.reply(`✅ ${mention(ctx.from)} got it! +25 coins`, { parse_mode: 'HTML' });
  }
  return next();
}

const guess = async (ctx) => {
  await safeReply(ctx, '🎥 <b>Anime/Movie guess</b> coming soon — try /trivia or /wordguess.');
};

module.exports = { wordguess, gamew, guess, trivia, triviaMiddleware };
