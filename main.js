import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import {TextGeometry} from 'three/examples/jsm/geometries/TextGeometry'

//load the 3d asset 
const loader2 = new FontLoader();
var raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

let textGeometry;
let textMaterial;
let textObjects = [];
const loader = new GLTFLoader();
//load table asset 
loader.load( 'family-table.glb', function ( gltf ) {
    scene.add( gltf.scene );
    let object = gltf.scene.children[0];
    
    
    // table.computeBoundingSphere();
    //let table = object;
    const table = new THREE.Box3().setFromObject(object);

    const center = new THREE.Vector3();
    table.getCenter(center);


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
//const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );

// Create a cube geometry
const cubeGeometry = new THREE.BoxGeometry();

// Create a material for the cube
const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

// Create a mesh by combining the geometry and material
const cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);

// Add the mesh to the scene
scene.add(cubeMesh);

//add bounding sphere !!!!!!
// let g = new THREE.Group();
// scene.add(g);
// for (let i = 0; i < 5; i++) {

//     // geometry
//     var geometryb = new THREE.BoxGeometry(20, 20, 20);

//     // material
//     var material2 = new THREE.MeshToonMaterial({
//         color: 0xff0000,
//         opacity: 0.7,
//     });

//     // mesh
//     let mesh2;
//     mesh2 = new THREE.Mesh(geometryb, material2);
//     mesh2.position.set(100 * Math.random(), 100 * Math.random(), 100 * Math.random());
//     g.add(mesh2);
// }

//     //g.updateWorldMatrix(true);

//     var gridHelper = new THREE.GridHelper(400, 40, 0x0000ff, 0x808080);
//     gridHelper.position.y = 0;
//     gridHelper.position.x = 0;
//     scene.add(gridHelper);

//     let bbox = new THREE.Box3().setFromObject(g);
//     let helper = new THREE.Box3Helper(bbox, new THREE.Color(0, 255, 0));
//     scene.add(helper);

    

//     let bsphere = object.getBoundingSphere(new THREE.Sphere(center));
//     let m = new THREE.MeshStandardMaterial({
//         color: 0xffffff,
//         opacity: 0.3,
//         transparent: true
//     });
//     var geometryb = new THREE.SphereGeometry(bsphere.radius, 32, 32);
//     let sMesh = new THREE.Mesh(geometryb, m);
//     scene.add(sMesh);
//     sMesh.position.copy(center);
    //!
camera.position.z = 5;

function animate() {
	requestAnimationFrame( animate );
    for (var i = 0; i < texts.length; i++) {
        texts[i].texture.needsUpdate = true;
    }

    // update the picking ray with the camera and pointer position
    raycaster.setFromCamera( pointer, camera );

    // calculate objects intersecting the picking ray
    const intersects = raycaster.intersectObjects( scene.children );
    

    for ( let i = 0; i < intersects.length; i ++ ) {
        intersects[ i ].object.material.color.set( 0xff0000 );
        console.log("interscects");

    }

	renderer.render( scene, camera );
    // window.addEventListener('dblclick', onDoubleClick, false);
    window.addEventListener( 'pointermove', onPointerMove );


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
    renderer.setSize(window.innerWidth, window.innerHeight);
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
    /*
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

        if (intersects.length > 0) {
            // Get the position where the user clicked
            var position = intersects[0].point;
            console.log("intersects",intersects, position);
            // Display text at the clicked position
            textMesh.position.copy(position);

            //add a canvas, make a texture, make a plane, add the texture to the plane,combine to mesh called myMesh
            //set the location of your mesh, called myMesh using 
            
			textMesh.lookAt( intersects[ 0 ].face.normal );
            console.log(intersects);
        
			textMesh.position.copy( intersects[ 0 ].point );
        }
        
        scene.add(textMesh);
        textObjects.push(textMesh);
        
        // Update the camera to re-render the scene
        camera.updateProjectionMatrix();
        
        
    });
    */
    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onPointerMove( event ) {

	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components

	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

}


