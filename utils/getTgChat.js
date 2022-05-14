const User = require('../models/user');


exports.getTelegramChatIdOfUser = async (userId = '') => {
  try {
    const user = await User.findById(userId, { tgChat: 1 });

    if (!user || !user.tgChat) {
      return {
        success: false,
        tgChat: ''
      }
    }

    return {
      success: true,
      tgChat: user.tgChat
    }
  } catch (error) {
    return {
      success: false,
      tgChat: ''
    }
  }
};