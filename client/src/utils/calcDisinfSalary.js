// this function calculates disinfector salary

// input parameters:
// totalSum - общая сумма заказов дезинфектора, Number
// finalAdminGrade - оценка админа после учета некач. и повт. заказов, Number

const calculateDisinfectorSalary = ({ totalSum, finalAdminGrade }) => {
  // Math.floor - оставляем целую часть числа
  let salary = Math.floor(totalSum * finalAdminGrade / 100);

  // если последние 2 цифры зарплаты <= 59, то округлить в меньшую сторону
  // если > 59, то округлить в большую сторону
  // например, salary = 5565 сум -> 5600. Если salary = 2142 сум -> 2100 сум

  let last2Digits = salary % 100;

  if (last2Digits > 59) {
    // округлить в большую сторону
    salary = Math.round(salary / 100) * 100;
  } else {
    // округлить в меньшую сторону
    salary = salary - last2Digits;
  }

  return salary;
};

export default calculateDisinfectorSalary;