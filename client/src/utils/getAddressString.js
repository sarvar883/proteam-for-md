// this function takes in address_v2 object and returns a string of address
const getAddressString = (address_v2 = {}) => {
  // helpful address_v2 variables
  const region = address_v2.region.trim();
  const district = address_v2.district.trim();
  const block_or_street = address_v2.block_or_street.trim();
  const houseNumber = address_v2.houseNumber.trim();
  const apartmentNumber = address_v2.apartmentNumber ? address_v2.apartmentNumber.trim() : '';
  const floor = address_v2.floor ? address_v2.floor.trim() : '';
  const referencePoint = address_v2.referencePoint.trim();


  let string = `${region}, Район: ${district}, Квартал/улица: ${block_or_street}, Номер дома: ${houseNumber}`;

  if (apartmentNumber && apartmentNumber.length > 0) {
    string += `, Номер квартиры: ${apartmentNumber}`;
  }

  if (floor && floor.length > 0) {
    string += `, Этаж: ${floor}`;
  }

  string += `, Ориентир: ${referencePoint}`;

  return string;
}

export default getAddressString;