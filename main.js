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
        alpha: true, // Enable transparency for the camera feed
        canvas: document.getElementById('arCanvas') // Use our specific canvas
    });
    renderer.setClearColor(0x000000, 0); // Transparent background
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.domElement.style.position = 'absolute';
    renderer.domElement.style.top = '0px';
    renderer.domElement.style.left = '0px';

    // 4. Setup AR.js Source (Webcam Feed)
    arToolkitSource = new THREEx.ArToolkitSource({
        sourceType: 'webcam',
    });

    arToolkitSource.init(function onReady() {
        // When the webcam is ready, resize the renderer to match the video feed
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        // Also copy to the AR Toolkit context
        arToolkitSource.copyElementSizeTo(arToolkitContext.domElement);

        // Hide the loading message now that the camera source is ready
        document.getElementById('arjs-loader').classList.add('hidden');
    });

    // 5. Setup AR.js Context (Marker Detection)
    arToolkitContext = new THREEx.ArToolkitContext({
        // IMPORTANT: Use a local path for camera_para.dat if you downloaded it,
        // otherwise ensure this githack link is still valid.
        // It's safer to download this file and place it in your repo as well.
        cameraParametersUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/data/camera_para.dat',
        detectionMode: 'mono',
        maxDetectionRate: 60,
        canvasForContext: renderer.domElement
    });

    // Initialize AR.js context
    arToolkitContext.init(function onCompleted() {
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // 6. Setup Marker Controls for your CUSTOM Pattern
    markerRoot = new THREE.Group();
    scene.add(markerRoot);

    let arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: './my_custom_marker.patt', // Path to your custom marker file
        changeMatrixMode: 'cameraTransformMatrix'
    });

    // 7. Create the Cube (our AR content)
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1); // 10cm cube
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    cube = new THREE.Mesh(geometry, material);
    cube.position.y = 0.05; // Position above the marker
    markerRoot.add(cube);

    // Start the animation loop once everything is set up
    animate();
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Only update and render if AR Toolkit source is ready
    if (arToolkitSource.ready === false) return;

    arToolkitContext.update(arToolkitSource.domElement);
    renderer.render(scene, camera);
}

// --- Handle Window Resizing ---
function onWindowResize() {
    // Check if arToolkitSource is initialized before trying to use it
    if (arToolkitSource && arToolkitSource.ready) {
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        arToolkitSource.copyElementSizeTo(arToolkitContext.domElement);
    }
    if (camera) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize, false);

// --- Start the Application ONLY after user interaction ---
document.getElementById('startButton').addEventListener('click', function() {
    // Remove the event listener to prevent multiple initializations
    document.getElementById('startButton').removeEventListener('click', arguments.callee);
    init(); // Call the initialization function
});

// We no longer use window.onload to directly call init(),
// instead, init() is called by the button click.
