const tgBot = require('../bot');
const { getTelegramChatIdOfUser } = require('./getTgChat');

// id of admin Temur Mukhtorov
const ADMIN_ID = require('../config/keys').ADMIN_USER_ID;


// send Telegram notification to admin Temur Mukhtorov
exports.sendNotifToAdminOnMaterialDistrib = async ({ sender, receiver, materials }) => {
  // expected input parameters
  // {
  //   sender: {
  //     name: String,
  //     occupation: String
  //   },
  //   receiver: {
  //     name: String,
  //     occupation: String
  //   },
  //   materials: [
  //     { material: String, amount: Number, unit: String },
  //   ]
  // }

  const get_admin_tg_chat = await getTelegramChatIdOfUser(ADMIN_ID);
  // send notif to Sarvar
  // const get_admin_tg_chat = await getTelegramChatIdOfUser('5f5f3da31380aa0035e0c5fb');

  if (!get_admin_tg_chat.success) {
    return;
  }

  const admin_tg_chat_id = get_admin_tg_chat.tgChat;

  // get materials string to display in tg notification
  let materialsString = '';
  materials.forEach(item => {
    materialsString += `\n${item.material}: ${item.amount} ${item.unit}`;
  });

  tgBot.telegram.sendMessage(admin_tg_chat_id, `
РАЗДАЧА МАТЕРИАЛОВ:

Отправитель: ${sender.occupation} ${sender.name} 
Получатель: ${receiver.occupation} ${receiver.name} 

Розданные материалы:
${materialsString}
  `);
};