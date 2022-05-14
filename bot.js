const Telegraf = require('telegraf');
const User = require('./models/user');

// Import botId
const botId = require('./config/keys').botId;

// initialize bot
const bot = new Telegraf(botId);


const startMessage = `
  Это телеграм бот для приложения ProDez
  Для начала Вам нужно зарегистрироваться.
  Для этого напишите /register <email>
  Вместо <email> введите email, при помощи которого заходите в ProDez.
`;


bot.command('start', (ctx) => {
  ctx.reply(startMessage);

  // ctx.telegram.sendMessage(ctx.chat.id, startMessage, {
  //   reply_markup: {
  //     inline_keyboard: [
  //       [{ text: 'Зарегистрироваться', callback_data: 'register' }]
  //     ]
  //   }
  // });
});


// // register button clicked
// bot.action('register', (ctx) => {
//   ctx.reply('Введите email, при помощи которого заходите в Pro Team');

//   // user enters email
//   bot.on('text', (emailContext) => {
//     const email = emailContext.message.text;
//     console.log('email', email);


//   });
// });


bot.command('register', (ctx) => {
  ctx.reply('Подождите...');
  const input = ctx.message.text.split(' ');
  if (input.length !== 2) {
    return ctx.reply(`
      Вы ввели неправильный формат.
      Напишите: /register <email>
      Здесь введите email, при помощи которого заходите в ProDez`);
  }

  const email = input[1];

  User.findOne({
    email,
    disabled: false
  })
    .then(user => {
      if (!user) {
        return ctx.reply('Пользователь не найден');
      }
      user.tgChat = ctx.chat.id;
      ctx.reply(`Вы зарегистрированы!
          Детали Пользователя:
          Имя: ${user.name}
          Должность: ${user.occupation}
          Телефон: ${user.phone}
        `);
      user.save();
    });
});


module.exports = bot;