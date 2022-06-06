const to = async promise => {
  try {
    const resp = await promise;
    return [resp, null];
  } catch (err) {
    return [null, err];
  }
};

module.exports = {
  to,
};
