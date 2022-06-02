const createPayloadJwt = (user) => {
  return {
    _id: user._id,
    name: user.name,
    username: user.username,
    role: user.role,
  };
};

module.exports = createPayloadJwt;
