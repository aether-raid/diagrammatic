module.exports = {
  presets: [
    '@babel/preset-env',  // Handles ES6+ transformations
    '@babel/preset-react', // Handles JSX
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-transform-runtime',  // Handle async/await and other modern features
  ],
};