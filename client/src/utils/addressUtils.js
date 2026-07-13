export const EMPTY_ADDRESS_FORM = {
  label: 'Home',
  fullName: '',
  address: '',
  city: '',
  postalCode: '',
  country: 'US',
  isDefault: false
};

export function addressToShipping(addr) {
  if (!addr) return null;
  return {
    fullName: addr.fullName,
    address: addr.address,
    city: addr.city,
    postalCode: addr.postalCode,
    country: addr.country || 'US'
  };
}

export function formatAddressLine(addr) {
  return `${addr.address}, ${addr.city} ${addr.postalCode}, ${addr.country || 'US'}`;
}
