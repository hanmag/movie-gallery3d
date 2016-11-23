// Start the gallery
require(['detector', 'gallery'],
  function (Detector, gallery) {
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }

    // Initialize our gallery and start the animation loop (animate is expected to call itself)
    gallery.init();
    gallery.animate();
  });
