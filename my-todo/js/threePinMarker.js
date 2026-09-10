(function () {
  "use strict";

  /**
   * Google Maps用の3Dピンを作成する
   *
   * @param {string} id 観光スポットID
   * @param {Object} customOptions ピン設定
   * @returns {HTMLDivElement}
   */
  function createThreePinMarker(id, customOptions = {}) {
    if (typeof THREE === "undefined") {
      console.error(
        "Three.jsが読み込まれていません。" +
        "three.min.jsをthreePinMarker.jsより先に読み込んでください。"
      );

      const errorMarker = document.createElement("div");

      errorMarker.textContent = "!";
      errorMarker.style.width = "36px";
      errorMarker.style.height = "36px";
      errorMarker.style.borderRadius = "50%";
      errorMarker.style.background = "#e63946";
      errorMarker.style.color = "#ffffff";
      errorMarker.style.display = "flex";
      errorMarker.style.justifyContent = "center";
      errorMarker.style.alignItems = "center";
      errorMarker.style.fontWeight = "bold";

      return errorMarker;
    }

    const defaultOptions = {
      width: 76,
      height: 100,
      color: getPinColor(id),
      scale: 1,
      rotationSpeed: 0.012,
      metalness: 0.22,
      roughness: 0.3,
      lightPower: 1.8
    };

    const options = Object.assign(
      {},
      defaultOptions,
      customOptions
    );

    const wrapper = document.createElement("div");

    wrapper.className = "three-marker";
    wrapper.dataset.id = id;

    wrapper.style.width = "0px";
    wrapper.style.height = "0px";
    wrapper.style.position = "relative";
    wrapper.style.display = "block";
    wrapper.style.pointerEvents = "auto";
    wrapper.style.cursor = "pointer";

    createThreePinScene(
      wrapper,
      options
    );

    return wrapper;
  }


  /**
   * プレビュー用のピンを作成する
   *
   * @param {string} containerId 表示先ID
   * @param {Object} customOptions ピン設定
   */
  function createThreePinPreview(
    containerId,
    customOptions = {}
  ) {
    const container =
      document.getElementById(containerId);

    if (!container) {
      console.error(
        "表示先が見つかりません:",
        containerId
      );

      return;
    }

    container.innerHTML = "";

    const defaultOptions = {
      width: 220,
      height: 280,
      color: "#e63946",
      scale: 1,
      rotationSpeed: 0.012,
      metalness: 0.22,
      roughness: 0.3,
      lightPower: 1.8
    };

    const options = Object.assign(
      {},
      defaultOptions,
      customOptions
    );

    createThreePinScene(
      container,
      options
    );
  }


  /**
   * Three.jsによる共通描画処理
   *
   * @param {HTMLElement} parentElement
   * @param {Object} options
   */
  function createThreePinScene(
    parentElement,
    options
  ) {
    const width = options.width;
    const height = options.height;

    const scene =
      new THREE.Scene();

    /*
     * マップ上では背景を透明にする
     */
    scene.background = null;


    /* ==============================
       カメラ
    ============================== */

    const camera =
      new THREE.PerspectiveCamera(
        45,
        width / height,
        0.1,
        100
      );

    camera.position.set(
      0,
      0.25,
      7.2
    );

    camera.lookAt(
      0,
      0,
      0
    );


    /* ==============================
       レンダラー
    ============================== */

    const renderer =
      new THREE.WebGLRenderer({
        antialias: true,
        alpha: true
      });

    renderer.setSize(
      width,
      height
    );

    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        2
      )
    );

    renderer.setClearColor(
      0x000000,
      0
    );

    renderer.domElement.style.display =
      "block";

    renderer.domElement.style.position =
      "absolute";

    renderer.domElement.style.left =
      "0";

    renderer.domElement.style.top =
      "0";

    renderer.domElement.style.marginLeft =
      "-" + (width / 2) + "px";

    renderer.domElement.style.marginTop =
      "-" + height + "px";

    renderer.domElement.style.width =
      width + "px";

    renderer.domElement.style.height =
      height + "px";

    renderer.domElement.style.pointerEvents =
      "none";

    parentElement.appendChild(
      renderer.domElement
    );


    /* ==============================
       ピングループ
    ============================== */

    const pinGroup =
      new THREE.Group();

    pinGroup.scale.set(
      options.scale,
      options.scale,
      options.scale
    );

    scene.add(pinGroup);


    /* ==============================
       Google Maps風の輪郭
    ============================== */

    const pinShape =
      new THREE.Shape();

    /*
     * 下の先端
     */
    pinShape.moveTo(
      0,
      -2.25
    );

    /*
     * 左下から左側へ
     */
    pinShape.bezierCurveTo(
      -0.2,
      -1.65,
      -1.3,
      -0.7,
      -1.3,
      0.45
    );

    /*
     * 左側から上へ
     */
    pinShape.bezierCurveTo(
      -1.3,
      1.5,
      -0.72,
      2.1,
      0,
      2.1
    );

    /*
     * 上から右側へ
     */
    pinShape.bezierCurveTo(
      0.72,
      2.1,
      1.3,
      1.5,
      1.3,
      0.45
    );

    /*
     * 右側から先端へ
     */
    pinShape.bezierCurveTo(
      1.3,
      -0.7,
      0.2,
      -1.65,
      0,
      -2.25
    );

    pinShape.closePath();


    /* ==============================
       中央の丸い穴
    ============================== */

    const centerHole =
      new THREE.Path();

    centerHole.absarc(
      0,
      0.55,
      0.48,
      0,
      Math.PI * 2,
      true
    );

    pinShape.holes.push(
      centerHole
    );


    /* ==============================
       3D化
    ============================== */

    const pinGeometry =
      new THREE.ExtrudeGeometry(
        pinShape,
        {
          depth: 0.48,

          bevelEnabled: true,
          bevelThickness: 0.1,
          bevelSize: 0.08,
          bevelOffset: 0,
          bevelSegments: 4,

          curveSegments: 36,
          steps: 1
        }
      );

    /*
     * Z方向の中心を合わせる
     */
    pinGeometry.translate(
      0,
      0,
      -0.24
    );


    /* ==============================
       ピンの材質
    ============================== */

    const pinMaterial =
      new THREE.MeshStandardMaterial({
        color:
          new THREE.Color(
            options.color
          ),

        metalness:
          options.metalness,

        roughness:
          options.roughness
      });


    const pin =
      new THREE.Mesh(
        pinGeometry,
        pinMaterial
      );

    pinGroup.add(pin);


    /* ==============================
       白い内側リング
    ============================== */

    const ringGeometry =
      new THREE.TorusGeometry(
        0.48,
        0.065,
        16,
        48
      );

    const ringMaterial =
      new THREE.MeshStandardMaterial({
        color: 0xffffff,
        metalness: 0.08,
        roughness: 0.25
      });

    const centerRing =
      new THREE.Mesh(
        ringGeometry,
        ringMaterial
      );

    centerRing.position.set(
      0,
      0.55,
      0.34
    );

    pinGroup.add(
      centerRing
    );


    /* ==============================
       地面に見える影
    ============================== */

    const shadowGeometry =
      new THREE.CircleGeometry(
        0.65,
        48
      );

    const shadowMaterial =
      new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.18,
        side: THREE.DoubleSide,
        depthWrite: false
      });

    const shadow =
      new THREE.Mesh(
        shadowGeometry,
        shadowMaterial
      );

    shadow.rotation.x =
      -Math.PI / 2;

    shadow.position.set(
      0,
      -2.32,
      -0.1
    );

    shadow.scale.set(
      1,
      0.42,
      1
    );

    pinGroup.add(
      shadow
    );


    /* ==============================
       ライト
    ============================== */

    const ambientLight =
      new THREE.AmbientLight(
        0xffffff,
        1.4
      );

    scene.add(
      ambientLight
    );


    const directionalLight =
      new THREE.DirectionalLight(
        0xffffff,
        options.lightPower
      );

    directionalLight.position.set(
      3,
      5,
      6
    );

    scene.add(
      directionalLight
    );


    const backLight =
      new THREE.DirectionalLight(
        0xaacfff,
        0.65
      );

    backLight.position.set(
      -4,
      2,
      -3
    );

    scene.add(
      backLight
    );


    /* ==============================
       最初の角度
    ============================== */

    pinGroup.rotation.x =
      0.04;

    pinGroup.rotation.y =
      -0.35;


    /* ==============================
       アニメーション
    ============================== */

    let direction = 1;

    function animate() {
      requestAnimationFrame(animate);

      pinGroup.rotation.y +=
        options.rotationSpeed * direction;

      if (pinGroup.rotation.y >= 0.45) {
        direction = -1;
      }

      if (pinGroup.rotation.y <= -0.45) {
        direction = 1;
      }

      renderer.render(
        scene,
        camera
      );
    }

    animate();
  }


  /**
   * 観光スポットごとのピン色
   *
   * @param {string} id 観光スポットID
   * @returns {string}
   */
  function getPinColor(id) {
    const colors = {
      hal: "#1d3557",
      ise: "#e63946",
      taki: "#2a9d8f",
      izumo: "#8e44ad",
      kapumen: "#f4a261"
    };

    return colors[id] || "#e63946";
  }


  /*
   * マップ.htmlやpin-preview.htmlから
   * 関数を呼び出せるようにする
   */
  window.createThreePinMarker =
    createThreePinMarker;

  window.createThreePinPreview =
    createThreePinPreview;

  window.getPinColor =
    getPinColor;

})();