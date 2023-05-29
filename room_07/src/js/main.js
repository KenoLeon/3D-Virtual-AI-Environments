import * as THREE from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';

let camera, scene, renderer;
let cube;
let backWallBottomLeft, backWallBottomRight, backWallTop, frontWallBottomLeft, frontWallBottomRight, frontWallTop;
let leftWall, rightWall;
let moveForward = false,
    moveBackward = false,
    moveLeft = false,
    moveRight = false,
    rotateLeft = false,
    rotateRight = false;
let characterSpeed = 0.08;
let rotationSpeed = 0.05;
let previousCubePosition = new THREE.Vector3();
const mazeWalls = [];
const tileSize = 1;

// Couple of test mazes :

// const maze = [
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 1, 1, 1, 1, 1, 1, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 1, 1, 1, 1, 1, 1, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
//     [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
//   ];

// const maze = [
//     [0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
//     [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
//     [1, 1, 1, 0, 1, 0, 1, 1, 1, 1],
//     [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
//     [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
//     [1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
//     [1, 0, 1, 1, 0, 0, 0, 1, 0, 1],
//     [1, 0, 1, 0, 0, 1, 0, 0, 0, 1],
//     [1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
//     [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
//     [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
//     [0, 0, 0, 0, 0, 2, 0, 0, 0, 0]
//   ];

const maze = [
    [0, 0, 0, 0, 0, 3, 0, 0, 0, 0],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 1, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 0]
  ];

function init() {

    // SCENE
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x898989);

    // MAIN CAMERA
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);    
    camera.position.set(6,11,2);

    //Lights

    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(-10, 30, -10);    
    light.shadow.camera.near = 0.1;
    light.shadow.camera.far = 1000;
    light.intensity = 1;
    light.shadow.mapSize.width = 1200;
    light.shadow.mapSize.height = 1200;    
    var shadowIntensity = 0.7; // between 0 and 1
    const light2 = light.clone();
    light.castShadow = true;
    light2.castShadow = false;
    light.intensity = shadowIntensity;
    light2.intensity = 1 - shadowIntensity;
    scene.add(light);
    scene.add(light2);

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


    // Entry and Exit Platforms
    const platformGeometry = new THREE.BoxGeometry(1.2, 0.001, 1.2);
    const exitPlatformMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
    const entryPlatformMaterial = new THREE.MeshStandardMaterial({ color: 0xffa500 });

    const exitPlatform = new THREE.Mesh(platformGeometry, exitPlatformMaterial);
    exitPlatform.position.set(0.5, -0.5, -5.6); // Adjust position as needed
    scene.add(exitPlatform);

    const entryPlatform = new THREE.Mesh(platformGeometry, entryPlatformMaterial);
    entryPlatform.position.set(0.5, -0.5, 5.6); // Adjust position as needed
    scene.add(entryPlatform);

    createGrid(10)
    buildMaze(scene, maze, tileSize, 0.5, 0.5);
    


    const cubeTextureFace = new THREE.TextureLoader().load("cubeTextureFace.png");
    var cubeMaterial = new THREE.MeshBasicMaterial({ map: cubeTextureFace });

    // Cube
    const cubeGeometry = new THREE.BoxGeometry(0.90, 0.90, 0.90);
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);    
    cube.castShadow = true;
    cube.receiveShadow = true;    
    cube.position.set(0.5, 0, 5.6);
    scene.add(cube);

    // Walls :
    
    // Wall Material
    const wallMaterial = new THREE.MeshLambertMaterial({
        color: 0xADD8E6, // Light Blue color
        emissive: 0xADD8E6,
        emissiveIntensity: 0.5,
        transparent: true,
        opacity: 0.8
    });

    // BOTTOM Wall Geometry (width,height,depth)
    const bottomWallGeometry_01 = new THREE.BoxGeometry(5.0, 1.1, 0.01);
    const bottomWallGeometry_02 = new THREE.BoxGeometry(4.0, 1.1, 0.01);
    // TOP Wall Geometry
    const topWallGeometry = new THREE.BoxGeometry(10, 3.9, 0.01);

    // Wall Mesh
    backWallBottomLeft = new THREE.Mesh(bottomWallGeometry_01, wallMaterial);
    backWallBottomLeft.position.set(-2.5, 0.05, -5);
    scene.add(backWallBottomLeft);

    backWallBottomRight = new THREE.Mesh(bottomWallGeometry_02, wallMaterial);
    backWallBottomRight.position.set(3, 0.05, -5);
    scene.add(backWallBottomRight);

    backWallTop = new THREE.Mesh(topWallGeometry, wallMaterial);
    backWallTop.position.set(0, 2.55, -5);
    scene.add(backWallTop);
 
    frontWallBottomLeft = new THREE.Mesh(bottomWallGeometry_01, wallMaterial);
    frontWallBottomLeft.position.set(-2.5, 0.05, 5); 
    scene.add(frontWallBottomLeft);

    frontWallBottomRight = new THREE.Mesh(bottomWallGeometry_02, wallMaterial);
    frontWallBottomRight.position.set(3, 0.05, 5); 
    scene.add(frontWallBottomRight);

    frontWallTop = new THREE.Mesh(topWallGeometry, wallMaterial);
    frontWallTop.position.set(0, 2.55, 5); 
    scene.add(frontWallTop);


    leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.01, 5, 10), wallMaterial);
    leftWall.position.set(-5, 2, 0);
    scene.add(leftWall);

    rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.01, 5, 10), wallMaterial);
    rightWall.position.set(5, 2, 0);
    scene.add(rightWall);

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


function createGrid(size) {
    const tileWidth = 10 / size; // Width of each tile
    const tileHeight = 10 / size; // Height of each tile

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const tileGeometry = new THREE.PlaneGeometry(tileWidth, tileHeight);
            const tileMaterial = new THREE.MeshStandardMaterial({
                color: (i + j) % 2 === 0 ? 0xAAAAAA : 0x666666 // Alternate colors for a chessboard pattern
            });
            const tile = new THREE.Mesh(tileGeometry, tileMaterial);
            tile.position.set(
                -5 + tileWidth * i + tileWidth / 2,
                -0.49,
                -5 + tileHeight * j + tileHeight / 2
            );
            tile.rotation.x = -Math.PI / 2;
            tile.receiveShadow = true;
            scene.add(tile);
        }
    }
}


function buildMaze(scene, maze, tileSize, xOffset = 0, yOffset = 0) {
    const wallMaterial = new THREE.MeshLambertMaterial({
      color: 0xFFEBCD, // Blanched almond
      emissive: 0xFFEBCD,
      emissiveIntensity: 0.5,
      transparent: false,
      opacity: 1
    });
  
    const wallGeometry = new THREE.BoxGeometry(tileSize, 2, tileSize);
  
    // Remove entrance Exit rows    
    maze.shift()
    maze.pop()

    // Cycle through maze tiles    
    for (let row = 0; row < maze.length; row++) {
      for (let col = 0; col < maze[row].length; col++) {
        const cell = maze[row][col];
  
        if (cell === 1) {
          const wall = new THREE.Mesh(wallGeometry, wallMaterial);
          const x = (col - maze[0].length / 2) * tileSize + xOffset;
          const z = (row - maze.length / 2) * tileSize + yOffset;
          wall.position.set(x, 0.5, z);
          wall.castShadow = true;
          wall.receiveShadow = true; 
          scene.add(wall);
          mazeWalls.push(wall)
        }
      }
    }
  }


function checkCollision() {
    // Create a bounding box for the cube
    const cubeBoundingBox = new THREE.Box3().setFromObject(cube);

    // Create a bounding box for the walls
    const backWallBottomLeftBoundingBox = new THREE.Box3().setFromObject(backWallBottomLeft);
    const backWallBottomRightBoundingBox = new THREE.Box3().setFromObject(backWallBottomRight);
    const frontWallBottomLeftBoundingBox = new THREE.Box3().setFromObject(frontWallBottomLeft);
    const frontWallBottomRightBoundingBox = new THREE.Box3().setFromObject(frontWallBottomRight);
    const rightWallBoundingBox = new THREE.Box3().setFromObject(rightWall)
    const leftWallBoundingBox = new THREE.Box3().setFromObject(leftWall)


    for (let i = 0; i < mazeWalls.length; i++) {
        const wallBoundingBox = new THREE.Box3().setFromObject(mazeWalls[i]);
        if (cubeBoundingBox.intersectsBox(wallBoundingBox)) {
          // If there is a collision, move the cube back to its previous position
          cube.position.copy(previousCubePosition);
          return; // Exit the function early since collision occurred
        }
      }

    // Check for collision between the cube and the wall
    if (cubeBoundingBox.intersectsBox(backWallBottomLeftBoundingBox) ||
        cubeBoundingBox.intersectsBox(backWallBottomRightBoundingBox) ||
        cubeBoundingBox.intersectsBox(frontWallBottomLeftBoundingBox) ||
        cubeBoundingBox.intersectsBox(frontWallBottomRightBoundingBox) ||
        cubeBoundingBox.intersectsBox(rightWallBoundingBox) ||
        cubeBoundingBox.intersectsBox(leftWallBoundingBox)) {
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