import 'bootstrap';
import * as THREE from 'three';
import {
    OrbitControls
} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';


let camera, scene, renderer;
let cube;
let backWallBottomLeft, backWallBottomRight, backWallTop, frontWallBottomLeft, frontWallBottomRight, frontWallTop;
let leftWall, rightWall, entryPlatform, exitPlatform;
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

    exitPlatform = new THREE.Mesh(platformGeometry, exitPlatformMaterial);
    exitPlatform.position.set(0.5, -0.5, -5.6); // Adjust position as needed
    scene.add(exitPlatform);

    entryPlatform = new THREE.Mesh(platformGeometry, entryPlatformMaterial);
    entryPlatform.position.set(0.5, -0.5, 5.6); // Adjust position as needed
    scene.add(entryPlatform);

    createGrid(10)

    buildMaze(scene, maze, tileSize, 0.5, 0.5);
    
    const path = dfsSolver(maze);
    console.log("Path:", path);
    indicatePath(scene, path, tileSize);

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

    // UI:

    // Create a container for the Three.js canvas and the overlay
    const container = document.createElement('div');
    container.id = 'container';    

    //Renderer Main
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);
    // Append the container to the document body
    document.body.appendChild(container);

    // Create the overlay element
    const overlay = document.createElement('div');
    overlay.id = 'overlay';

    // Position the overlay using CSS
    overlay.style.position = 'absolute';
    overlay.style.top = '20px';
    overlay.style.left = '20px';
    overlay.style.zIndex = '1';
    // Create the sidebar with Bootstrap buttons
    const sidebar = document.createElement('div');
    sidebar.className = 'sidebar';
    // BUTTONS 
    const button1 = document.createElement('button');
    button1.className = 'btn btn-dark btn-sm';
    button1.textContent = 'Walk Maze';
    sidebar.appendChild(button1);
    overlay.appendChild(sidebar);

    // Append the overlay to the container
    container.appendChild(overlay);

    // Add event listener to the button
    button1.addEventListener("click", function() {
      // Invoke the walkPath function here, passing the path as an argument
      walkPath(path);
    });

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


  function dfsSolver(maze) {
    const start = findStart(maze);
    const goal = findGoal(maze);
    const visited = new Set();
  
    const path = dfs(maze, start, goal, visited);
  
    if (path.length === 0) {
      return null;  // Path not found
    }
  
    return path;
  }
  

  function findStart(maze) {
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 2) {
          console.log("Start:", [i, j]);
          return [i, j];
        }
      }
    }
    console.log("Start not found");
    return null;  // Start not found
  }
  
  function findGoal(maze) {
    for (let i = 0; i < maze.length; i++) {
      for (let j = 0; j < maze[i].length; j++) {
        if (maze[i][j] === 3) {
          console.log("Goal:", [i, j]);
          return [i, j];
        }
      }
    }
    console.log("Goal not found");
    return null;  // Goal not found
  }

  function dfs(maze, current, goal, visited) {
    const [x, y] = current;
  
    if (x === goal[0] && y === goal[1]) {
      // Goal reached
      return [current];  // Include the current position in the path
    }
  
    visited.add(`${x},${y}`);
  
    // Define the possible moves (up, right, down, left)
    const moves = [
      [x - 1, y], // Up
      [x, y + 1], // Right
      [x + 1, y], // Down
      [x, y - 1]  // Left
    ];
  
    for (const [nextX, nextY] of moves) {
      // Check if the move is within the maze boundaries and not a wall
      if (
        nextX >= 0 && nextX < maze.length &&
        nextY >= 0 && nextY < maze[0].length &&
        maze[nextX][nextY] !== 1 &&
        !visited.has(`${nextX},${nextY}`)
      ) {
        const path = dfs(maze, [nextX, nextY], goal, visited);
        if (path.length > 0) {
          return [current, ...path];  // Include the current position in the path
        }
      }
    }
  
    return [];  // Path not found
  }
 
  function indicatePath(scene, path, tileSize) {
    const pathMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      transparent: true,
      opacity: 0.9,
    });
  
    const tileSizeX = tileSize-0.4;
    const tileSizeY = tileSize-0.4;
  
    for (let i = 0; i < path.length; i++) {
      const position = path[i];
      const x = position[0];
      const y = position[1];
      const z = -0.49;
  
      const tileGeometry = new THREE.BoxGeometry(tileSizeX, tileSizeY, 0.01);
      const tileMesh = new THREE.Mesh(tileGeometry, pathMaterial);
      tileMesh.position.set(
        y-4.5,
        z,
        x-5.5
      );
      tileMesh.rotation.x = Math.PI / 2; // Rotate around x-axis          
      scene.add(tileMesh);
    }
  }
  
  
function walkPath(path) {
  // Set the initial position of the cube to the start of the path
  const startPosition = path[0];
  const x = startPosition[0] - 5.5;
  const z = 0;
  const y = startPosition[1] - 4.5;
  
  cube.position.set(y, z, x);

  // Loop through each coordinate in the path
  for (let i = 1; i < path.length; i++) {
    const position = path[i];
    const x = position[0] - 5.5;
    const z = 0;
    const y = position[1] - 4.5;

    // Animate the cube to the next position in the path
    gsap.to(cube.position, {
      x: y,
      y: z,
      z: x,
      duration: 0.4,
      ease: 'power1.inOut',
      delay: i*0.4
    });
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