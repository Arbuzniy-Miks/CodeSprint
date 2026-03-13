const askQuestion = async (req, res, next) => {
  try {
    res.json({
      success: true,
      message: 'Ask endpoint пока не реализован'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  askQuestion
};