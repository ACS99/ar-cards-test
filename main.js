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
    // We'll use a PerspectiveCamera, but AR.js will manage its projection matrix
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    scene.add(camera); // Add camera to the scene

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

        // Hide the loading message
        document.getElementById('arjs-loader').classList.add('hidden');
    });

    // 5. Setup AR.js Context (Marker Detection)
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/data/camera_para.dat', // Default camera parameters
        detectionMode: 'mono', // For simple markers like Hiro
        maxDetectionRate: 60, // Process frames faster for smoother tracking
        canvasForContext: renderer.domElement // Use our renderer's canvas
    });

    // Initialize AR.js context
    arToolkitContext.init(function onCompleted() {
        // Copy projection matrix to Three.js camera
        camera.projectionMatrix.copy(arToolkitContext.getProjectionMatrix());
    });

    // 6. Setup Marker Controls
    // This group will automatically be positioned and rotated by AR.js when the marker is found
    markerRoot = new THREE.Group();
    scene.add(markerRoot); // Add the marker group to the scene

    let arMarkerControls = new THREEx.ArMarkerControls(arToolkitContext, markerRoot, {
        type: 'pattern',
        patternUrl: 'https://raw.githack.com/AR-js-org/AR.js/master/data/patt.hiro', // Path to Hiro marker pattern
        // patternUrl: './patt.hiro', // Use this if you download patt.hiro locally
        changeMatrixMode: 'cameraTransformMatrix' // This is the default for AR.js
    });

    // 7. Create the Cube (our AR content)
    // A 10cm cube (0.1 meters)
    const geometry = new THREE.BoxGeometry(0.1, 0.1, 0.1);
    const material = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red color
    cube = new THREE.Mesh(geometry, material);

    // Position the cube slightly above the marker's center
    // 0.05 is half the cube's height, so it sits on the marker
    cube.position.y = 0.05;
    markerRoot.add(cube); // Add the cube to the marker's group
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Update AR.js source and context
    if (arToolkitSource.ready === false) return;

    arToolkitContext.update(arToolkitSource.domElement);

    // Render the scene
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
