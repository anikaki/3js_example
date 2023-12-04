import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry'

//load the 3d asset 
const loader2 = new FontLoader();
var raycaster = new THREE.Raycaster();

let textGeometry;
let textMaterial;
let textObjects = [];
const loader = new GLTFLoader();
//load table asset 
loader.load( 'family-table.glb', function ( gltf ) {

	scene.add( gltf.scene );

    let object = gltf.scene.children[0];
    let vertices = object.geometry.attributes.position.array
    console.log(object);
    console.log(vertices);

}, undefined, function ( error ) {

	console.error( error );

} );

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
let camera3D;
let texts = [];
// Set the background color of the scene to warm white
scene.background = new THREE.Color(0xfff5e6); // Warm white color
// Lights
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xfff5e6, 1 );
scene.add( directionalLight );

const controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );
const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
    for (var i = 0; i < texts.length; i++) {
        texts[i].texture.needsUpdate = true;
    }
	renderer.render( scene, camera );
    window.addEventListener('dblclick', onDoubleClick, false);

}
animate();

/////MOUSE STUFF

//let onMouseDownMouseX = 0;
//let onMouseDownMouseY = 0;
let onPointerDownPointerX = 0;
let onPointerDownPointerY = 0;
let lon = -90;
let onMouseDownLon = 0;
let lat = 0;
let onMouseDownLat = 0;
let isUserInteracting = false;


function moveCameraWithMouse() {
    //document.addEventListener('keydown', onDocumentKeyDown, false);
    let threeContainer = document.getElementById('container')
    threeContainer.addEventListener('mousedown', onDocumentMouseDown, false);
    threeContainer.addEventListener('mousemove', onDocumentMouseMove, false);
    threeContainer.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResize, false);
    camera3D.target = new THREE.Vector3(0, 0, 0);
}


// function onDocumentMouseDown(event) {
//     onPointerDownPointerX = event.clientX;
//     onPointerDownPointerY = event.clientY;
//     onPointerDownLon = lon;
//     onPointerDownLat = lat;
//     isUserInteracting = true;
// }

function onDocumentMouseMove(event) {
    if (isUserInteracting) {
        lon = (onPointerDownPointerX - event.clientX) * 0.1 + onPointerDownLon;
        lat = (event.clientY - onPointerDownPointerY) * 0.1 + onPointerDownLat;
        computeCameraOrientation();
    }
}

function onDocumentMouseUp(event) {
    isUserInteracting = false;
}

function onDocumentMouseWheel(event) {
    camera3D.fov += event.deltaY * 0.05;
    camera3D.updateProjectionMatrix();
}

function computeCameraOrientation() {
    lat = Math.max(- 30, Math.min(30, lat));  //restrict movement
    let phi = THREE.Math.degToRad(90 - lat);  //restrict movement
    let theta = THREE.Math.degToRad(lon);
    camera3D.target.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera3D.target.y = 100 * Math.cos(phi);queueMicrotask
    camera3D.target.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera3D.lookAt(camera3D.target);
}


function onWindowResize() {
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer.setnSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}
function onDocumentMouseDown(event) {
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    if (event.shiftKey == true) {
        let vector = new THREE.Vector3();
        vector.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        vector.unproject(camera3D);
        vector.multiplyScalar(100)
        createNewText(textInput.value, vector);
    } else {
        isUserInteracting = true;
    }
}
function onDoubleClick(event) {
    console.log("double clicked");
    loader2.load('fonts/helvetiker_regular.typeface.json', function (font) {
        textGeometry = new TextGeometry('Your Text', {
            font: font,
            size: 0.2,
            height: 0.02,
        });
        
        console.log("loaded");
       
        textMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        
        const textMesh = new THREE.Mesh(textGeometry, textMaterial);

        var intersects = raycaster.intersectObjects(scene.children);
        console.log(scene.children);

        if (intersects.length > 0) {
            // Get the position where the user clicked
            var position = intersects[0].point;
            console.log("intersects",intersects);
            // Display text at the clicked position
            textMesh.position.copy(position);
        }
        
        scene.add(textMesh);
        textObjects.push(textMesh);
        
        // Update the camera to re-render the scene
        camera.updateProjectionMatrix();
    });
}


