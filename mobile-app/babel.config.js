// module.exports = {
//   presets: ['module:@react-native/babel-preset'],
//   plugins: ['module:react-native-dotenv'],
// };


module.exports = function(api) {
  api.cache(false);
  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: ['module:react-native-dotenv'] // <----- Add this line
  };
};
