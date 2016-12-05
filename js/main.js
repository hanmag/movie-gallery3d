(function () {
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  var objects = [],
    targets = [];

  var camera, scene = new THREE.Scene(),
    renderer = new THREE.CSS3DRenderer(),
    container = document.getElementById('threejs-container');

  var tweenCount;

  // init three.js scene
  initScene();

  $.ajaxSetup({
    cache: false
  });
  $.getJSON("movies/meta.json", function (data) {
    container.innerHTML = "";

    setData(data);
    initLayout();

    // Start the gallery
    container.appendChild(renderer.domElement);
    transform(2500);

  }).fail(function () {
    console.log("error");
  });

  function updateSize() {
    camera.aspect = container.offsetWidth / container.offsetHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.offsetWidth, container.offsetHeight);
  }

  function initScene() {
    camera = new THREE.PerspectiveCamera(40, container.offsetWidth / container.offsetHeight, 1, 10000);
    camera.position.z = 3000;

    updateSize();
    window.addEventListener('resize', updateSize, false);

    animate();
  }

  function setData(movies) {
    for (var i = 0; i < movies.length; i++) {
      var element = document.createElement('div');
      element.className = 'element';
      element.id = 'el' + i;

      var img = document.createElement('img');
      img.src = movies[i].img;
      element.appendChild(img);
      element.addEventListener('click', function (event) {
        if (tweenCount !== 0) return;

        event.preventDefault();
        event.stopPropagation();

        restructLayout(parseInt(event.currentTarget.id.substring(2)));
        transform(1500);
      });

      var cssObject = new THREE.CSS3DObject(element);
      cssObject.position.x = Math.random() * 4000 - 2000;
      cssObject.position.y = Math.random() * 4000 - 2000;
      cssObject.position.z = Math.random() * 4000 - 2000;

      scene.add(cssObject);
      objects.push(cssObject);
    }
  }

  function transform(duration) {
    TWEEN.removeAll();
    tweenCount = 0;

    for (var i = 0; i < objects.length; i++) {

      var object = objects[i];
      var target = targets[i];

      new TWEEN.Tween(object.position)
        .to({
          x: target.position.x,
          y: target.position.y,
          z: target.position.z
        }, duration)
        .onComplete(function () {
          tweenCount--;
        })
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      new TWEEN.Tween(object.rotation)
        .to({
          x: target.rotation.x,
          y: target.rotation.y,
          z: target.rotation.z
        }, Math.random() * duration)
        .onComplete(function () {
          tweenCount--;
        })
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      tweenCount += 2;
    }
  }

  function initLayout() {
    var vector = new THREE.Vector3();
    for (var i = 0, l = objects.length; i < l; i++) {

      var phi = (2 * i * Math.PI) / l;

      var object = new THREE.Object3D();
      object.position.x = 700 * Math.sin(phi);
      object.position.y = 0;
      object.position.z = 700 * Math.cos(phi);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);

      targets.push(object);
    }
  }

  function restructLayout(index) {
    var l = objects.length;
    objects.sort(function (a, b) {
      var aIndex = parseInt(a.element.id.substring(2));
      var bIndex = parseInt(b.element.id.substring(2));

      var aValue = (aIndex < index) ? (aIndex + l - index) : (aIndex - index);
      var bValue = (bIndex < index) ? (bIndex + l - index) : (bIndex - index);

      return aValue - bValue;
    });
  }

  function animate() {
    window.requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
  }
})();