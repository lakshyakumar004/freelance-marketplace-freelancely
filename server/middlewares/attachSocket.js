const attachSocket = (io) => (req, res, next) => {
  req.io = io;
  next();
};

module.exports = attachSocket;
