// this function checks if the is Super Admin
// in Pro Team, only Temurbek Muhtorov is Super Admin
// 5de35831fd9b04001663c9c6 - is the _id of user Temurbek Muhtorov
// 5f5f3da31380aa0035e0c5fb - is the _id of user Sarvar Sharapov
const userIsSuperAdmin = (user) => {
  return user.id === '5de35831fd9b04001663c9c6' || user.id === '5f5f3da31380aa0035e0c5fb';
  // return user.name === 'Temurbek Mukhtorov' && user.email === 'temur@prodez.uz';
};

export default userIsSuperAdmin;