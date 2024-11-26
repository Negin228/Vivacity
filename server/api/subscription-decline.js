const rootUrl = process.env.REACT_APP_CANONICAL_ROOT_URL;
module.exports = async (req, res) => {
  try {
    res.redirect(`${rootUrl}/membership/cancel`);
  } catch (e) {
    console.log('error in subscription success', e);
  }
};
