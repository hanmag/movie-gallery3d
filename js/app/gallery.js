define(["three", "tween", "CSS3DRenderer", "TrackballControls", "jQuery"],
  function (THREE, Tween) {
    var gallery = {
      container: document.getElementById('threejs-container'),
      objects: [],
      targets: {
        table: [],
        sphere: [],
        helix: [],
        grid: []
      },
      camera: {},
      renderer: new THREE.CSS3DRenderer(),
      scene: new THREE.Scene(),
      controls: {},
      tweenCount: 0,
      canUpdateControls: true,
      lastCameraPosition: undefined,
      lastCameraRotation: undefined,
      updateSize: function () {
        gallery.camera.aspect = gallery.container.offsetWidth / gallery.container.offsetHeight;
        gallery.camera.updateProjectionMatrix();
        gallery.renderer.setSize(gallery.container.offsetWidth, gallery.container.offsetHeight);
      },
      transform: function (targets, duration) {
        TWEEN.removeAll();
        gallery.tweenCount = 0;

        for (var i = 0; i < gallery.objects.length; i++) {

          var object = gallery.objects[i];
          var target = targets[i];

          new TWEEN.Tween(object.position)
            .to({
              x: target.position.x,
              y: target.position.y,
              z: target.position.z
            }, Math.random() * duration + duration)
            .onComplete(function () {
              gallery.tweenCount--;
            })
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

          new TWEEN.Tween(object.rotation)
            .to({
              x: target.rotation.x,
              y: target.rotation.y,
              z: target.rotation.z
            }, Math.random() * duration + duration)
            .onComplete(function () {
              gallery.tweenCount--;
            })
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

          gallery.tweenCount += 2;
        }
      },
      focus: function (target, duration) {
        if (gallery.tweenCount === 0) {
          TWEEN.removeAll();

          if (gallery.canUpdateControls) {
            gallery.canUpdateControls = false;
            gallery.lastCameraPosition = gallery.camera.position.clone();
            gallery.lastCameraRotation = gallery.camera.rotation.clone();
          }

          var newPos = target.position;
          var vectorR = new THREE.Vector3(0, 0, 1);
          var newRot = target.rotation;
          vectorR.applyAxisAngle(new THREE.Vector3(1, 0, 0), newRot.x);
          vectorR.applyAxisAngle(new THREE.Vector3(0, 1, 0), newRot.y);
          vectorR.applyAxisAngle(new THREE.Vector3(0, 0, 1), newRot.z);

          new TWEEN.Tween(gallery.camera.position)
            .to({
              x: newPos.x + 1000 * vectorR.x,
              y: newPos.y + 1000 * vectorR.y,
              z: newPos.z + 1000 * vectorR.z
            }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();

          new TWEEN.Tween(gallery.camera.rotation)
            .to({
              x: newRot.x,
              y: newRot.y,
              z: newRot.z
            }, duration)
            .easing(TWEEN.Easing.Exponential.InOut)
            .start();
        }
      },
      init: function () {

        gallery.camera = new THREE.PerspectiveCamera(40, gallery.container.offsetWidth / gallery.container.offsetHeight, 1, 10000);
        gallery.camera.position.z = 4000;
        gallery.updateSize();

        gallery.controls = new THREE.TrackballControls(gallery.camera, gallery.renderer.domElement);
        gallery.controls.rotateSpeed = 1.0;
        gallery.controls.zoomSpeed = 0.2;
        gallery.controls.enableDamping = true;
        gallery.controls.dynamicDampingFactor = 0.4;
        gallery.controls.minDistance = 0;
        gallery.controls.maxDistance = 6000;

        gallery.renderer.domElement.addEventListener('click', function (event) {
          if (!gallery.canUpdateControls) {
            TWEEN.removeAll();
            new TWEEN.Tween(gallery.camera.position)
              .to({
                x: gallery.lastCameraPosition.x,
                y: gallery.lastCameraPosition.y,
                z: gallery.lastCameraPosition.z
              }, 1000)
              .easing(TWEEN.Easing.Exponential.InOut)
              .start();

            new TWEEN.Tween(gallery.camera.rotation)
              .to({
                x: gallery.lastCameraRotation.x,
                y: gallery.lastCameraRotation.y,
                z: gallery.lastCameraRotation.z
              }, 1000)
              .onComplete(function () {
                gallery.canUpdateControls = true;
              })
              .easing(TWEEN.Easing.Exponential.InOut)
              .start();
          }
        }, false);

        window.addEventListener('resize', gallery.updateSize, false);
        bindButtons();

        function bindButtons() {
          var button = document.getElementById('table');
          button.addEventListener('click', function (event) {
            gallery.transform(gallery.targets.table, 2000);
          }, false);

          button = document.getElementById('sphere');
          button.addEventListener('click', function (event) {
            gallery.transform(gallery.targets.sphere, 2000);
          }, false);

          button = document.getElementById('helix');
          button.addEventListener('click', function (event) {
            gallery.transform(gallery.targets.helix, 2000);
          }, false);

          button = document.getElementById('grid');
          button.addEventListener('click', function (event) {
            gallery.transform(gallery.targets.grid, 2000);
          }, false);

          button = document.getElementById('reset');
          button.addEventListener('click', function (event) {
            gallery.canUpdateControls = true;
            gallery.controls.reset();
          }, false);
        }
      },
      setData: function (targets) {
        gallery.targets.table = [];
        gallery.targets.sphere = [];
        gallery.targets.helix = [];
        gallery.targets.grid = [];

        gallery.container.innerHTML = "";

        initSceneContent(targets);

        gallery.transform(gallery.targets.helix, 2000);


        function initSceneContent(objects) {
          for (var i = 0; i < objects.length; i++) {
            var element = document.createElement('div');
            element.className = 'element';
            element.id = 'element-' + i;
            element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

            var img = document.createElement('img');
            img.src = objects[i].img;
            element.appendChild(img);

            var cssObject = new THREE.CSS3DObject(element);
            cssObject.position.x = Math.random() * 4000 - 2000;
            cssObject.position.y = Math.random() * 4000 - 2000;
            cssObject.position.z = Math.random() * 4000 - 2000;
            element.addEventListener('click', function (event) {
              event.preventDefault();
              event.stopPropagation();

              var obj3d = gallery.objects[event.currentTarget.id.split('-')[1]];
              obj3d.element.style.borderColor = 'rgba(127, 255, 255, 0.25)';
              obj3d.element.style.boxShadow = '0px 0px 12px rgba(0, 255, 255, 0.5)';
              obj3d.element.style.animationIterationCount = '0';
              obj3d.element.style.backgroundColor = 'rgba(0,127,127,' + (Math.random() * 0.5 + 0.25) + ')';

              obj3d.element.children[obj3d.element.children.length - 1].style.animationIterationCount = '0';
              obj3d.element.children[obj3d.element.children.length - 1].style.backgroundColor = 'rgba(0, 196, 196, 0.85)';

              gallery.focus(obj3d, 2000);
            });

            gallery.scene.add(cssObject);

            gallery.objects.push(cssObject);
          }

          gallery.container.appendChild(gallery.renderer.domElement);

          initTableLayout(objects);
          initSphereLayout(objects);
          initHelixLayout(objects);
          initGridLayout(objects);
        }

        function initTableLayout(objects) {
          for (var i = 0; i < objects.length; i++) {
            var object = new THREE.Object3D();

            object.position.x = ((i % 9) * 300) - 1200;
            object.position.y = -(Math.floor(i / 9) * 300) + 800;

            gallery.targets.table.push(object);
          }
        }

        function initSphereLayout(objects) {
          var vector = new THREE.Vector3();
          for (var i = 0, l = objects.length; i < l; i++) {
            var phi = Math.acos(-1 + (2 * i) / l);
            var theta = Math.sqrt(l * Math.PI) * phi;

            var object = new THREE.Object3D();

            object.position.x = 800 * Math.cos(theta) * Math.sin(phi);
            object.position.y = 800 * Math.sin(theta) * Math.sin(phi);
            object.position.z = 800 * Math.cos(phi);

            vector.copy(object.position).multiplyScalar(2);

            object.lookAt(vector);

            gallery.targets.sphere.push(object);
          }
        }

        function initHelixLayout(objects) {
          var vector = new THREE.Vector3();
          for (var i = 0, l = objects.length; i < l; i++) {

            var phi = i * 0.0666666 * Math.PI + Math.PI;

            var object = new THREE.Object3D();
            object.position.x = 650 * Math.sin(phi);
            object.position.y = -(i * 8) + 450;
            object.position.z = 1300 * Math.cos(phi);

            vector.x = object.position.x * 2;
            vector.y = object.position.y;
            vector.z = object.position.z * 2;

            object.lookAt(vector);

            gallery.targets.helix.push(object);
          }
        }

        function initGridLayout(objects) {
          for (var i = 0; i < objects.length; i++) {
            var object = new THREE.Object3D();

            object.position.x = ((i % 3) * 300) - 300;
            object.position.y = (-(Math.floor(i / 3) % 3) * 300) + 800;
            object.position.z = -(Math.floor(i / 9)) * 1000 + 1500;

            gallery.targets.grid.push(object);
          }
        }
      },
      animate: function () {
        window.requestAnimationFrame(gallery.animate);
        if (gallery.canUpdateControls) gallery.controls.update();
        TWEEN.update();
        gallery.render();
      },
      render: function () {
        gallery.renderer.render(gallery.scene, gallery.camera);
      },
      buildGUI: function () {
        var docHeight = $(document).height();

        $("#options").css({
          "visibility": "visible",
          "top": docHeight / 2,
          "bottom": docHeight / 2
        }).animate({
          "top": 0,
          "bottom": 0,
          "padding-top": 46
        }, 800, function complete() {
          $("#thumbprint").animate({
            opacity: 1
          });
          $("#thumbprint").click(function () {
            if (!open) {
              open = true;
              gallery.openOptions();
            } else {
              open = false;
              gallery.closeOptions();
            }
          });

          setTimeout(function () {
            open = true;
            gallery.openOptions();
          }, 1500);
        });
      },
      openOptions: function () {
        var headerTopPosition = $("#header-top").position().top;
        var headerBottomPosition = $("#header-bottom").position().top;
        var headerHeight = $("#header-top").outerHeight(); /* margins or something, whatever */
        $(".header-animator").offset({
          top: $(document).height() / 2,
          left: 25
        });
        $(".header-animator").height(0);

        $("#options").data("left", $("#options").css("left"));
        $("#thumbprint").data("left", $("#thumbprint").css("left"));
        $("#threejs-container").data("marginLeft", $("#threejs-container").css("marginLeft"));
        $("#options").animate({
          left: 0
        }, 500);
        $("#thumbprint").animate({
          left: 215
        }, 500);
        $("#threejs-container").animate({
          marginLeft: 150
        }, 500);
        $("#options-content").delay(1500).animate({
          opacity: 1
        }, 500);

        setTimeout(function () {
          $(".header-animator").css("visibility", "visible");

          $("#header-animator-outside").animate({
            top: headerTopPosition,
            height: headerBottomPosition - headerTopPosition + headerHeight
          }, 500);

          $("#header-animator-inside").animate({
            top: headerTopPosition + headerHeight,
            height: headerBottomPosition - headerTopPosition - headerHeight
          }, 500);
        }, 500);

        setTimeout(function () {
          $(".header-animator").css("visibility", "hidden");
          $(".header").css("visibility", "visible");
        }, 1000);
      },
      closeOptions: function () {
        $("#options").animate({
          left: $("#options").data("left")
        }, 500);
        $("#thumbprint").animate({
          left: $("#thumbprint").data("left")
        }, 500);
        $("#threejs-container").animate({
          marginLeft: $("#threejs-container").data("marginLeft")
        }, 500);
        $("#options-content").animate({
          opacity: 0
        }, 500);
        $(".header").css("visibility", "hidden");
      }
    };
    return gallery;
  });