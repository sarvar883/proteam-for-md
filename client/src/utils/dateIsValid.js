import moment from 'moment';

// this function checks if date is valid
const isValidDate = (date = new Date()) => {
  return moment(date).isValid();
}

export default isValidDate;