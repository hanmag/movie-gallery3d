// Configure Require.js
var require = {
  // Default load path for js files
  baseUrl: 'js/app',
  shim: {
    'detector': {
      exports: 'Detector'
    },
    'tween': {
      exports: 'Tween'
    }
  },
  // Third party code lives in js/lib
  paths: {
    three: '../lib/three.min',
    TrackballControls: '../lib/TrackballControls',
    CSS3DRenderer: '../lib/CSS3DRenderer',

    detector: '../lib/Detector',

    tween: '../lib/tween.min'
  }
};