import * as THREE from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';

let camera, scene, renderer;
let cube, backWall, leftWall, rightWall, frontWall, coin;
let moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false,
    rotateLeft = false,
    rotateRight = false;
let characterSpeed = 0.1;
let rotationSpeed = 0.05;
let previousCubePosition = new THREE.Vector3();

function init() {

    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x898989);

    // MAIN CAMERA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
    camera.position.z = 5;

    //Lights

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 30, -10);
    light.castShadow = true;
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 100;
    light.intensity = 1;
    light.shadow.mapSize.width = 1200;
    light.shadow.mapSize.height = 1200;
    scene.add(light);

    // OBJECTS

    const planeGeometry = new THREE.PlaneGeometry(10, 10);
    const planeMaterial = new THREE.MeshStandardMaterial({
        color: 0xFFF2DB
    });
    const plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.position.set(0, -0.5, 0);
    plane.rotation.x = -Math.PI / 2;
    plane.receiveShadow = true;
    scene.add(plane);
    const cubeTextureFace = new THREE.TextureLoader().load("cubeTextureFace.png");
    var cubeMaterial = new THREE.MeshBasicMaterial({ map: cubeTextureFace });

    // Cube
    const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.castShadow = true;
    cube.receiveShadow = true;
    scene.add(cube);

    // Walls :

    const wallGeometry = new THREE.BoxGeometry(10, 5, 0.01);

    // MATERIALS:

    const wallMaterial = new THREE.MeshLambertMaterial({
        color: 0xC0C0C0,
        emissive: 0xC0C0C0,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.5
    });

    const blueGridText = new THREE.TextureLoader().load("grid_10x5_blue.png");
    const blueGridMat = new THREE.MeshBasicMaterial({
        map: blueGridText,
        transparent: true,
        opacity: 0.8
    });

    const redGridText = new THREE.TextureLoader().load("grid_10x5_red.png");
    const redGridMat = new THREE.MeshBasicMaterial({
        map: redGridText,
        transparent: true,
        opacity: 0.8
    });

    const greenGridText = new THREE.TextureLoader().load("grid_10x5_green.png");
    const greenGridMat = new THREE.MeshBasicMaterial({
        map: greenGridText,
        transparent: true,
        opacity: 0.8
    });

    const greyGridText = new THREE.TextureLoader().load("grid_10x5_grey.png");
    const greyGridMat = new THREE.MeshBasicMaterial({
        map: greyGridText,
        transparent: true,
        opacity: 0.8
    });


    backWall = new THREE.Mesh(wallGeometry, blueGridMat);
    backWall.position.set(0, 2, -5);

    const leftWallGeometry = new THREE.BoxGeometry(0.01, 5, 10);
    leftWall = new THREE.Mesh(leftWallGeometry, redGridMat);
    leftWall.position.set(-5, 2, 0);

    const rightWallGeometry = new THREE.BoxGeometry(0.01, 5, 10);
    rightWall = new THREE.Mesh(rightWallGeometry, greenGridMat);
    rightWall.position.set(5, 2, 0);

    const frontWallGeometry = new THREE.BoxGeometry(10, 5, 0.01);
    frontWall = new THREE.Mesh(frontWallGeometry, greyGridMat);
    frontWall.position.set(0, 2, 5);

    scene.add(backWall);
    scene.add(leftWall);
    scene.add(rightWall);
    scene.add(frontWall);

    //Renderer Main
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 1;
    controls.maxDistance = 50;
    controls.maxPolarAngle = Math.PI / 2;

    window.addEventListener('keydown', onKeyDown, false);
    window.addEventListener('keyup', onKeyUp, false);

}

function checkCollision() {
    // Create a bounding box for the cube
    const cubeBoundingBox = new THREE.Box3().setFromObject(cube);

    // Create a bounding box for the walls
    const backWallBoundingBox = new THREE.Box3().setFromObject(backWall);
    const leftWallBoundingBox = new THREE.Box3().setFromObject(leftWall);
    const rightWallBoundingBox = new THREE.Box3().setFromObject(rightWall);
    const frontWallBoundingBox = new THREE.Box3().setFromObject(frontWall);

    // Check for collision between the cube and the wall
    if (cubeBoundingBox.intersectsBox(backWallBoundingBox) ||
        cubeBoundingBox.intersectsBox(leftWallBoundingBox) ||
        cubeBoundingBox.intersectsBox(rightWallBoundingBox) ||
        cubeBoundingBox.intersectsBox(frontWallBoundingBox)) {
        // If there is a collision, move the cube back to its previous position
        cube.position.copy(previousCubePosition); //<<
    } else {
        // Update the previous cube position if there was no collision
        previousCubePosition.copy(cube.position);
    }


}

function animate() {
    checkCollision()
    requestAnimationFrame(animate);

    

    moveCubeRandomly();

    // Rotate the cube
    if (rotateLeft) {
        cube.rotateY(rotationSpeed);
    }
    if (rotateRight) {
        cube.rotateY(-rotationSpeed);
    }

    // Move fron/back/left/right 
    if (moveForward && cube.position.z > -10 + characterSpeed) {
        cube.translateZ(-characterSpeed);
        // console.log('F');
    }
    if (moveBackward && cube.position.z < 10 - characterSpeed) {
        cube.translateZ(characterSpeed);
    }
    if (moveLeft && cube.position.x > -10 + characterSpeed) {
        cube.translateX(-characterSpeed);
    }
    if (moveRight && cube.position.x < 10 - characterSpeed) {
        cube.translateX(characterSpeed);
    }

    renderer.render(scene, camera);

}

function moveCubeRandomly() {
    const randomVector = new THREE.Vector3(
        Math.random() - 0.5, // random x component between -0.5 and 0.5
        0, // no change in y component
        Math.random() - 0.5 // random z component between -0.5 and 0.5
    );
    randomVector.normalize(); // make the vector unit length
    randomVector.multiplyScalar(0.1); // scale down the vector to control the magnitude of the movement  
    cube.position.add(randomVector); // add the random vector to the current position of the cube
}

function onKeyDown(event) {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = true;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = true;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = true;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = true;
            break;

        case 'KeyQ':
            rotateLeft = true;
            break;

        case 'KeyE':
            rotateRight = true;
            break;

    }

}

function onKeyUp(event) {

    switch (event.code) {

        case 'ArrowUp':
        case 'KeyW':
            moveForward = false;
            break;

        case 'ArrowLeft':
        case 'KeyA':
            moveLeft = false;
            break;

        case 'ArrowDown':
        case 'KeyS':
            moveBackward = false;
            break;

        case 'ArrowRight':
        case 'KeyD':
            moveRight = false;
            break;

        case 'KeyQ':
            rotateLeft = false;
            break;

        case 'KeyE':
            rotateRight = false;
            break;

    }

}


window.addEventListener('resize', function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}, false);


init();
animate();