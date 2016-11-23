// Configure Require.js
var require = {
  // Default load path for js files
  baseUrl: 'js/app',
  shim: {
    'detector': { exports: 'Detector' },
    'stats': { exports: 'Stats' },
    'tween': { exports: 'Tween' }
  },
  // Third party code lives in js/lib
  paths: {
    three: '../lib/three.min',

    detector: '../lib/Detector',
    stats: '../lib/stats.min',
    // Require.js plugins
    // text: '../lib/text',
    // shader: '../lib/shader',
    // Where to look for shader files
    // shaders: '../shaders'
    tween: '../lib/tween.min'
  }
};