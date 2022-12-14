const { v4 } = require('uuid');

module.exports.isDev = process.env.NODE_ENV !== 'production';
module.exports.generateId = () => v4();