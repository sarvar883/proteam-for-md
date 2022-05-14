// this function calculates average admin score of user (disinfector and subadmin)

// percent that is subtracted from average score for each failed order
const PERCENT_PER_FAIL = 5;

// this object has structure:
// {
//   average_admin_grade: number
//   failedOrdersCount: number
// }
const calcFinalAdminGrade = (object = {}) => {
  // penalty for failed orders
  let percentToSubtract = PERCENT_PER_FAIL * object.failedOrdersCount;

  if (object.failedOrdersCount > 100 / PERCENT_PER_FAIL) {
    return 0;
  } else {
    return object.average_admin_grade * (1 - percentToSubtract / 100).toFixed(2);
  }
};

export default calcFinalAdminGrade;