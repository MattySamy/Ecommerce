exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    addresses: user.addresses.length === 0 ? undefined : user.addresses,
    phone: user.phone || undefined,
    profileImg: user.profileImg || undefined,
  };
};
