// this function is the same as function in directory /client/src/utils dateStringElements.js
// this function takes in date and returns an object with date details
exports.getDateStringElements = (date) => {
  const givenDate = new Date(date);

  // all fields in object are strings
  const object = {
    // format YYYY
    year: '',

    // format MM
    month: '',

    // format DD
    day: '',

    // format HH
    hours: '',

    // format MM
    minutes: '',
  };

  // year
  object.year = `${givenDate.getFullYear()}`;

  // month
  if (givenDate.getMonth() < 9) {
    object.month = `0${givenDate.getMonth() + 1}`;
  } else {
    object.month = `${givenDate.getMonth() + 1}`;
  }

  // day
  if (givenDate.getDate() < 10) {
    object.day = `0${givenDate.getDate()}`;
  } else {
    object.day = `${givenDate.getDate()}`;
  }

  // hours
  object.hours = givenDate.getHours() < 10 ? `0${givenDate.getHours()}` : `${givenDate.getHours()}`;

  // minutes
  object.minutes = givenDate.getMinutes() < 10 ? `0${givenDate.getMinutes()}` : `${givenDate.getMinutes()}`;

  return object;
};