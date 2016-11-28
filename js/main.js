// Start the gallery
require(['detector', 'gallery', 'jQuery'],
  function (Detector, gallery) {
    if (!Detector.webgl) {
      Detector.addGetWebGLMessage();
    }

    // Initialize our gallery and start the animation loop (animate is expected to call itself)
    $.ajaxSetup({
      cache: false
    });
    $.getJSON("movies/meta.json", function (data) {
      gallery.setData(data);

      gallery.init();
      gallery.buildGUI();
      gallery.animate();
    });
  }
);