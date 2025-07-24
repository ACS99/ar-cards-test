// main.js

// --- Global Variables ---
let scene, camera, renderer;
let arToolkitSource, arToolkitContext;
let markerRoot; // This will be the Three.js group attached to the marker
let cube;       // Our red cube

// --- Initialization Function ---
function init() {
    // 1. Setup Three.js Scene
    scene = new THREE.Scene();

    // 2. Setup Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera);

    // 3. Setup Renderer
    renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        canvas: document.getElementById('arCanvas')
    });
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';

    // 4. Setup AR.js Source (Webcam Feed)
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });

    arToolkitSource.init(function onReady() {
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        arToolkitSource.copyElementSizeTo(arToolkitContext.domElement);
        document.getElementById('arjs-loader').classList.add('hidden');
    });

    // 5. Setup AR.js Context (Marker Detection)
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/data/camera_para.dat',
        detectionMode: 'mono',
        maxDetectionRate: 60,
        canvasForContext: renderer.domElement
    });

    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // 6. Setup Marker Controls for your CUSTOM Pattern
    markerRoot = new THREE.Group();
    scene.add(markerRoot);

    let arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        // --- IMPORTANT CHANGE HERE ---
        // This path must be relative to your index.html file
        // Make sure you place your generated 'my_custom_marker.patt' in the same directory!
        patternUrl: './my_custom_marker.patt',
        // -----------------------------
        changeMatrixMode: 'cameraTransformMatrix'
    });

    // 7. Create the Cube (our AR content)
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); // 10cm cube
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.05; // Position above the marker
    markerRoot.add(cube);
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    if (arToolkitSource.ready === false) return;

    arToolkitContext.update(arToolkitSource.domElement);
    renderer.render(scene, camera);
}

// --- Handle Window Resizing ---
function onWindowResize() {
    arToolkitSource.copyElementSizeTo(renderer.domElement);
    arToolkitSource.copyElementSizeTo(arToolkitContext.domElement);
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

// --- Start the Application ---
window.onload = function() {
    init();
    animate();
};
