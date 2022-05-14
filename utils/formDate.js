// this function takes in dateFrom and timeFrom and returns Date
// dateFrom is string YYYY-MM-DD
// timeFrom is string HH:MM
exports.formDate = ({ dateFrom, timeFrom }) => {
  // console.log('formDate dateFrom', dateFrom);
  // console.log('formDate timeFrom', timeFrom);
  // console.log('===========');

  let date = new Date(dateFrom);

  const hours = Number(timeFrom.split(':')[0]);
  const minutes = Number(timeFrom.split(':')[1]);

  date.setHours(hours);
  date.setMinutes(minutes);

  // console.log('formDate date', date);
  // console.log('formDate typeof', typeof date);

  return date;
};