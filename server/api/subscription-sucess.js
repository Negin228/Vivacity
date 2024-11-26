const rootUrl = process.env.REACT_APP_CANONICAL_ROOT_URL;
module.exports = async (req, res) => {
  try {
    const { userId } = req.query;
    if (userId) {
      res.redirect(`${rootUrl}/membership/success`);
    }
  } catch (e) {
    console.log('error in subscription success', e);
  }
};
