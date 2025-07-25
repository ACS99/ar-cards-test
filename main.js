// main.js

// --- Global Variables ---
let scene, camera, renderer;
let arToolkitSource, arToolkitContext;
let markerRoot; // This will be the Three.js group attached to the marker
let cube;       // Our red cube
let loaderElement; // Reference to the loading overlay

// --- Initialization Function ---
function init() {
    // Prevent multiple initializations
    if (arToolkitSource && arToolkitSource.ready) return;

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
        // Optional: Select back camera if available (facingMode: { exact: "environment" })
        // sourceParameters: { facingMode: { exact: "environment" } }
    });

    arToolkitSource.init(function onReady() {
        // When the webcam is ready, resize the renderer to match the video feed
        arToolkitSource.copyElementSizeTo(renderer.domElement);
        // Also copy to the AR Toolkit context
        arToolkitSource.copyElementSizeTo(arToolkitContext.domElement);

        // Hide the loading message now that the camera source is ready
        if (loaderElement) {
            loaderElement.classList.add('hidden');
        }
        // Start the animation loop only after source is ready
        animate();
    });

    arToolkitSource.domElement.onerror = function(e) {
        console.error("AR Toolkit Source Error:", e);
        if (loaderElement) {
            loaderElement.innerHTML = '<div>Camera access failed. Please ensure permissions are granted and try again.</div>';
        }
    };


    // 5. Setup AR.js Context (Marker Detection)
    arToolkitContext = new THREEx.ArToolkitContext({
        cameraParametersUrl: './camera_para.dat', // Consider downloading this to your repo
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
}

// --- Animation Loop ---
function animate() {
    requestAnimationFrame(animate);

    // Only update and render if AR Toolkit source is ready
    if (arToolkitSource && arToolkitSource.ready === true) {
        arToolkitContext.update(arToolkitSource.domElement);
        renderer.render(scene, camera);
    }
}

// --- Handle Window Resizing ---
function onWindowResize() {
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

// --- Entry Point: Wait for DOM to load, then setup tap listener ---
document.addEventListener('DOMContentLoaded', function() {
    loaderElement = document.getElementById('arjs-loader');

    // Add a single listener to the loader element that covers the whole screen
    // This handles both click (desktop) and touch (mobile)
    loaderElement.addEventListener('click', onInitialTap);
    loaderElement.addEventListener('touchend', onInitialTap);

    // Initial message on page load
    console.log("Waiting for user tap to start AR experience.");
});

function onInitialTap() {
    // Remove the listeners to prevent multiple calls
    if (loaderElement) {
        loaderElement.removeEventListener('click', onInitialTap);
        loaderElement.removeEventListener('touchend', onInitialTap);
    }

    // Attempt to initialize AR
    console.log("Tap detected. Initializing AR...");
    init();
}
