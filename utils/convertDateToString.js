// this function converts date object into string DD/MM/YYYY HH:mm

exports.convertDateToString = (date = new Date()) => {
  const dd = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
  // MM - month.   date.getMonth() is zero-based
  const MM = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1;
  const yyyy = date.getFullYear();
  const hh = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours();
  // mm - minutes
  const mm = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes();

  let string = `${dd}/${MM}/${yyyy} ${hh}:${mm}`;

  return string;
};