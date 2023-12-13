import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import "https://cdnjs.cloudflare.com/ajax/libs/three.js/102/three.min.js";
import "https://cdn.jsdelivr.net/npm/p5@1.2.0/lib/p5.js";
import "https://www.gstatic.com/firebasejs/9.6.8/firebase-app-compat.js";
import "https://www.gstatic.com/firebasejs/9.6.8/firebase-database-compat.js";
import "firebase/app";
import "firebase/compat/database";

//Main Code
// const in_front_of_you = new THREE.Object3D();
const loader = new GLTFLoader();
let in_front_of_you;
//load table asset 
loader.load( 'family-table.glb', function ( gltf ) {
    gltf.scene.scale.set(30, 30, 30); 
    scene.add( gltf.scene );
    let object = gltf.scene.children[0];

}, undefined, function ( error ) {
	console.error( error );
} );
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
const renderer = new THREE.WebGLRenderer();
let texts = [];
// Set the background color of the scene to warm white
scene.background = new THREE.Color(0xfff5e6); // Warm white color
// Lights
const light = new THREE.AmbientLight( 0xffffff ); // soft white light
scene.add( light );
const directionalLight = new THREE.DirectionalLight( 0xfff5e6, 1 );
scene.add( directionalLight );
//tiny little dot (could be invisible) for placing things in front of you
var geometryFront = new THREE.BoxGeometry(1, 1, 1);
var materialFront = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
in_front_of_you = new THREE.Mesh(geometryFront, materialFront);
camera.add(in_front_of_you); // then add in front of the camera so it follow it
in_front_of_you.position.set(0, 0, -600);

const controls = new OrbitControls( camera, renderer.domElement );
renderer.setSize( window.innerWidth, window.innerHeight );
document.getElementById('container').appendChild( renderer.domElement );
//const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
camera.position.z = 0;
camera.position.x = 3;
camera.position.y = 1;
//initialization some values 
let group = "3DRoomTextMouse";
let typeOfThing = "words";
let currentKey = -1;
/////MOUSE STUFF
// let onMouseDownMouseX = 0;
// let onMouseDownMouseY = 0;
let onPointerDownLon = 0;
let onPointerDownLat = 0;
let onPointerDownPointerX = 0;
let onPointerDownPointerY = 0;
let lon = -90;
let onMouseDownLon = 0;
let lat = 0;
let onMouseDownLat = 0;
let isUserInteracting = false;
let zPosition = -34.00499597512203;



animate();
moveCameraWithMouse();
initFirebase();

//Functions

function animate() {
    requestAnimationFrame(animate);
    //console.log("texts", texts);
    for (var key in texts) {
        texts[key].texture.needsUpdate = true;
    }
    renderer.render(scene, camera);
}


var textInput = document.getElementById("text");  //get a hold of something in the DOM
textInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  //checks whether the pressed key is "Enter"
        const posInWorld = new THREE.Vector3();
        // //remember we attached a tiny to the  front of the camera in init, now we are asking for its position

        in_front_of_you.position.set(0, 0, -(600 - camera.fov * 7));  //base the the z position on camera field of view
        in_front_of_you.getWorldPosition(posInWorld);
        createNewText(textInput.value, posInWorld); 
    }
});


function createNewText(text_msg, posInWorld, dbKey) {
    console.log("Created New Text Has been called");
    var canvas = document.createElement("canvas");
    canvas.width = 800;
    canvas.height = 800;
    var context = canvas.getContext("2d");
    context.clearRect(0, 0, canvas.width, canvas.height);
    var fontSize = Math.max(camera.fov / 2, 72);
    context.font = fontSize + "pt Arial";
    context.textAlign = "center";
    context.fillStyle = "black";
    context.fillText(text_msg, canvas.width / 2, canvas.height / 2);
    var textTexture = new THREE.Texture(canvas);
    textTexture.needsUpdate = true;
    var material = new THREE.MeshBasicMaterial({ map: textTexture, transparent: true });
    var geo = new THREE.PlaneGeometry(1, 1);
    var mesh = new THREE.Mesh(geo, material);


    mesh.position.x = posInWorld.x;
    mesh.position.y = posInWorld.y;
    mesh.position.z = posInWorld.z;


    console.log(posInWorld);
    mesh.lookAt(0, 0, 0);
    mesh.scale.set(10, 10, 10);
    scene.add(mesh);
    texts[dbKey] = { "object": mesh, "texture": textTexture, "text": text_msg, "position": posInWorld };
}


function moveCameraWithMouse() {
    //document.addEventListener('keydown', onDocumentKeyDown, false);
    let threeContainer = document.getElementById('container')
    threeContainer.addEventListener('mousedown', onDocumentMouseDown, false);
    threeContainer.addEventListener('mousemove', onDocumentMouseMove, false);
    threeContainer.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('wheel', onDocumentMouseWheel, false);
    window.addEventListener('resize', onWindowResize, false);
    camera.target = new THREE.Vector3(0, 0, 0);
}

function onDocumentMouseDown(event) {
    console.log("mousDown");
    onPointerDownPointerX = event.clientX;
    onPointerDownPointerY = event.clientY;
    onPointerDownLon = lon;
    onPointerDownLat = lat;
    if (event.shiftKey == true) {
        console.log("ShiftKeyIsPressed");
        let vector = new THREE.Vector3();
        vector.set(
            (event.clientX / window.innerWidth) * 2 - 1,
            - (event.clientY / window.innerHeight) * 2 + 1,
            0.5
        );
        vector.unproject(camera);
        vector.multiplyScalar(100)
        let location = { x: vector.x, y: vector.y, z: vector.z };
        sendTextToDB(textInput.value, location)
        //send it to firebase and when it comes back as "added" from firebase, it will be created locally
    } else {
        isUserInteracting = true;
    }
}

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
    camera.fov += event.deltaY * 0.05;
    camera.updateProjectionMatrix();
}

function computeCameraOrientation() {
 
    lat = Math.max(- 30, Math.min(30, lat));  //restrict movement
    let phi = THREE.Math.degToRad(90 - lat);  //restrict movement
    let theta = THREE.Math.degToRad(lon);
    camera.target.x = 100 * Math.sin(phi) * Math.cos(theta);
    camera.target.y = 100 * Math.cos(phi);
    camera.target.z = 100 * Math.sin(phi) * Math.sin(theta);
    camera.lookAt(camera.target);
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    console.log('Resized');
}


//firebase js


function initFirebase() {
    console.log("init");
    //let nameField = document.createElement('name');
    //document.body.append(nameField);
    //
    // //let name = localStorage.getItem('fb_name');
    // if (!name) {
    //     name = prompt("Enter Your Name Here");
    //     //localStorage.setItem('fb_name', name);  //save name
    // }
    // console.log("name", name);
    // if (name) {
    //     nameField.value = name;
    // }
    
    const firebaseConfig = {
        apiKey: "AIzaSyBHa9CiIxr2AtYJRFJ5ZXmR5pszgCJ8nZE",
        authDomain: "shared-minds-void-letters.firebaseapp.com",
        databaseURL: "https://shared-minds-void-letters-default-rtdb.firebaseio.com",
        projectId: "shared-minds-void-letters",
        storageBucket: "shared-minds-void-letters.appspot.com",
        messagingSenderId: "828962089602",
        appId: "1:828962089602:web:a2a0f5f2211c5586d7229b",
        measurementId: "G-3Y1CYM8P3Z"
      };
      
    firebase.initializeApp(firebaseConfig);
    // Initialize Realtime Database and get a reference to the service
    const db = firebase.database();

    subscribeToFirebase(db)
}

/////FIREBASE STUFF
function sendTextToDB(inputText, pos) {
    // let pos = inputBox.position();
    let mydata = {
        location: pos,
        text: inputText,
    };
    //add a stroke
    if (currentKey == -1) {
        //new one
        let idOfNew = db.ref("group/" + group + "/" + typeOfThing + "/").push(mydata);
    } else {
        let idOfOld = db.ref("group/" + group + "/" + typeOfThing + "/" + currentKey).update(mydata);
    }
}

function subscribeToFirebase(db) {
    var myRef = db.ref("group/" + group + "/" + typeOfThing + "/");
    myRef.on("child_added", (data) => {
        console.log("add", data.key, data.val());
        let key = data.key;
        let value = data.val();
        //update our local variable
        console.log("Calling New Text");
        createNewText(value.text, value.location, key);
    });

    myRef.on("child_changed", (data) => {
        console.log("changed", data.key, data.val());
        let key = data.key;
        let value = data.val();
        createNewText(value.text, value.location, key);
    });

    myRef.on("child_removed", (data) => {
        console.log("removed", data.key);
        delete texts[data.key];
    });
}
