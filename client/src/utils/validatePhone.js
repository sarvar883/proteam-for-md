const validatePhoneNumber = (phone = '') => {
  const object = {
    isValid: true,
    message: '',
  };

  // phone must not be empty string
  if (phone.length === 0) {
    object.isValid = false;
    object.message = 'Телефонный номер не должен быть пустым';

    return object;
  }

  // phone number must be of length 13 (+998901234567 is 13 characters)
  if (phone.length !== 13) {
    object.isValid = false;
    object.message = 'Телефонный номер должен содержать 13 символов. Введите в формате +998XXXXXXXXX';

    return object;
  }

  // phone must start with + sign
  if (phone[0] !== '+') {
    object.isValid = false;
    object.message = 'Телефонный номер должен начинаться с "+". Введите в формате +998XXXXXXXXX';

    return object;
  }

  // phone characters should be digits (12 digits and 1 plus sign)
  let numberCharacters = 0;
  for (let i = 1; i <= 12; i++) {
    if (phone[i] >= '0' && phone[i] <= '9') {
      numberCharacters++;
    }
  }

  if (numberCharacters !== 12) {
    object.isValid = false;
    object.message = 'Телефонный номер должен содержать "+" и 12 цифр';

    return object;
  }

  return object;
};

export default validatePhoneNumber;