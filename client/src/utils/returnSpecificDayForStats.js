// this function takes in Date
// and converts it to string with format YYYY-MM-DD
const convertDate = (date) => {
  const yyyy = date.getFullYear().toString();
  const mm = (date.getMonth() + 1).toString();
  const dd = date.getDate().toString();

  const mmChars = mm.split('');
  const ddChars = dd.split('');

  return yyyy + '-' + (mmChars[1] ? mm : "0" + mmChars[0]) + '-' + (ddChars[1] ? dd : "0" + ddChars[0]);
}


// this function returns specific day with format YYYY-MM-DD
// param is a string, possible values - ['previous', 'current']
const returnSpecificDayForStats = (param) => {
  let currentDate = new Date();

  if (param === 'previous') {
    // subtract 1 day from currentDate
    currentDate.setDate(currentDate.getDate() - 1);
  }

  let dayString = convertDate(currentDate);

  return dayString;
};

export default returnSpecificDayForStats;