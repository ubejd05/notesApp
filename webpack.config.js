const path = require('path');

module.exports = {
  mode: 'development',
  entry: ['./src/index.js', './src/login.js', './src/signup.js'],
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js'
  },
  watch: true,
}