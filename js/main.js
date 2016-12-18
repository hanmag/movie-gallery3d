(function () {
  if (!Detector.webgl) {
    Detector.addGetWebGLMessage();
  }

  var objects = [],
    targets = [],
    movies = [],
    comments = {};

  var camera, scene = new THREE.Scene(),
    renderer = new THREE.CSS3DRenderer(),
    container = document.getElementById('threejs-container');

  var tweenCount;

  var currentTarget;

  // init three.js scene
  initScene();

  $.ajaxSetup({
    cache: false
  });

  $.getJSON("movies/comments.json", function (data) {
    comments = data;
  });

  $.getJSON("movies/items.json", function (data) {
    container.innerHTML = "";

    movies = data.movies;
    $('#date').text(data.time);
    setData(movies);
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
    camera.position.z = 1800;

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

        sortMovies(event.currentTarget);
        transform(1500);
      });

      var cssObject = new THREE.CSS3DObject(element);
      cssObject.position.x = Math.random() * 1000 - 500;
      cssObject.position.y = Math.random() * 1000 - 500;
      cssObject.position.z = Math.random() * 1000 - 1000;

      scene.add(cssObject);
      objects.push(cssObject);
    }
  }

  function transform(duration) {
    TWEEN.removeAll();
    tweenCount = 0;

    currentTarget.className = 'element selected';

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
        .easing(TWEEN.Easing.Exponential.InOut)
        .start();

      tweenCount++;
    }
  }

  function initLayout() {
    var vector = new THREE.Vector3();
    for (var i = 0, l = objects.length; i < l; i++) {

      var phi = i === 0 ? 0 : (2 * (i + 0.25) * Math.PI) / (l + 0.5);

      var object = new THREE.Object3D();
      object.position.x = 700 * Math.sin(phi);
      object.position.y = i === 0 ? -15 : -30;
      object.position.z = 700 * Math.cos(phi);

      vector.x = object.position.x * 2;
      vector.y = object.position.y;
      vector.z = object.position.z * 2;

      object.lookAt(vector);

      targets.push(object);
    }

    sortMovies(objects[0].element);
  }

  function sortMovies(target) {
    if (currentTarget !== undefined)
      currentTarget.className = 'element unselected';
    currentTarget = target;

    var index = parseInt(currentTarget.id.substring(2))

    var l = objects.length;
    objects.sort(function (a, b) {
      var aIndex = parseInt(a.element.id.substring(2));
      var bIndex = parseInt(b.element.id.substring(2));

      var aValue = (aIndex < index) ? (aIndex + l - index) : (aIndex - index);
      var bValue = (bIndex < index) ? (bIndex + l - index) : (bIndex - index);

      return aValue - bValue;
    });

    setInfo(movies[index]);
    setScore(movies[index]);
    setComments(movies[index]);
  }

  function animate() {
    window.requestAnimationFrame(animate);
    TWEEN.update();
    renderer.render(scene, camera);
  }

  function setInfo(movie) {
    $("#title").html(movie.title +
      '<a title="访问豆瓣网页" target="_blank" href="https://movie.douban.com/subject/' +
      movie.subject +
      '"><i class="fa fa-external-link" aria-hidden="true"></i></a>');

    if (isArray(movie.info["导演"]))
      $("#director").html('<span>' + movie.info["导演"].join('</span> / <span>') + '</span>');
    else
      $("#director").html('<span>' + movie.info["导演"] + '</span>');

    if (isArray(movie.info["编剧"]))
      $("#writer").html('<span>' + movie.info["编剧"].join('</span> / <span>') + '</span>');
    else
      $("#writer").html('<span>' + movie.info["编剧"] + '</span>');

    if (isArray(movie.info["主演"]))
      $("#actors").html('<span>' + movie.info["主演"].join('</span> / <span>') + '</span>');
    else
      $("#actors").html('<span>' + movie.info["主演"] + '</span>');

    if (isArray(movie.info["类型"]))
      $("#genre").html('<span>' + movie.info["类型"].join('</span> / <span>') + '</span>');
    else
      $("#genre").html('<span>' + movie.info["类型"] + '</span>');

    if (isArray(movie.info["制片国家/地区"]))
      $("#country").html('<span>' + movie.info["制片国家/地区"].join('</span> / <span>') + '</span>');
    else
      $("#country").html('<span>' + movie.info["制片国家/地区"] + '</span>');

    if (isArray(movie.info["语言"]))
      $("#language").html('<span>' + movie.info["语言"].join('</span> / <span>') + '</span>');
    else
      $("#language").html('<span>' + movie.info["语言"] + '</span>');

    if (isArray(movie.info["片长"]))
      $("#runtime").html('<span>' + movie.info["片长"].join('</span> / <span>') + '</span>');
    else
      $("#runtime").html('<span>' + movie.info["片长"] + '</span>');

    $("#infos").scrollTop(0);
  }

  function setScore(movie) {
    $("#ratingnum").text((movie.score === '') ? '尚未上映' : movie.score);

    $(".stars").each(function () {
      // Get the value
      let rating = (movie.score === '') ? 0 : parseFloat(movie.score) / 2;
      let numStars = 5;

      let fullStar = new Array(Math.floor(rating + 1)).join('<i class="fa fa-star"></i>');

      let halfStar = ((rating % 1) !== 0) ? '<i class="fa fa-star-half-empty"></i>' : '';

      let noStar = new Array(Math.floor(numStars + 1 - rating)).join('<i class="fa fa-star-o"></i>');

      $(this).html(fullStar + halfStar + noStar);
    });

    $("#ratingsum").text(movie.ratingsum);

    if (movie.ratings.length === 0) {
      $("#starswrap").css("visibility", "hidden");
      $("#starsscore").css("visibility", "hidden");
      return;
    } else {
      $("#starswrap").css("visibility", "visible");
      $("#starsscore").css("visibility", "visible");
    }

    let index = 0;
    $('.rating_per').each(function () {
      $(this).text(movie.ratings[index++]);
    });

    index = 0;
    $('.power').each(function () {
      $(this).css('width', (Math.floor(parseFloat(movie.ratings[index++].replace("%", "")) * 1.5) + 2) + "px");
    });
  }

  function setComments(movie) {
    if (comments[movie.subject] === undefined) {
      setTimeout(function () {
        setComments(movie);
      }, 1000);
    } else {
      htmlComments(movie);
    }
  }

  function htmlComments(movie) {
    $("#comments-content").html(comments[movie.subject].comments.map(function (data) {
      return '<p>' + data + '</p>';
    }).join(''));
    $("#comments-content").scrollTop(0);
  }

  function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }
})();