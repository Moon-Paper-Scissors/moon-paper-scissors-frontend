export const formatAddressShort = (address: string): string => {
  if (!address) return ``;

  return `${address.slice(0, 8)}…${address.slice(
    address.length - 4,
    address.length,
  )}`;
};
