    import * as THREE from 'three';
    import {
        OrbitControls
    } from 'three/examples/jsm/controls/OrbitControls';

    let camera, scene, renderer;
    let topRenderer, camera2
    let cube, backWall, leftWall, rightWall, frontWall, positiveMesh, toxicMesh;
    let healthBar, healthBarFill
    let moveForward = false,
        moveBackward = false,
        moveLeft = false,
        moveRight = false,
        rotateLeft = false,
        rotateRight = false;
    let characterSpeed = 0.1;
    let rotationSpeed = 0.05;
    let health =100
    let previousCubePosition = new THREE.Vector3();

    function init() {

        // SCENE
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x898989);

        // MAIN CAMERA
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 1000);
        camera.position.z = 5;

        // TOP Camera
        camera2 = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera2.position.set(0, 0, 0); // set the position of the camera to the top right corner of the scene

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

        // CUBE/AI Textures/Material

        const cubeTextureEye = new THREE.TextureLoader().load("cubeTextureEye.png");
        const cubeTextureTop = new THREE.TextureLoader().load("cubeTextureTop.png");
        const cubeTextureFace = new THREE.TextureLoader().load("cubeTextureFace.png");
        var materialFront = new THREE.MeshBasicMaterial({ map: cubeTextureFace });
        var materialBack = new THREE.MeshBasicMaterial({ map: cubeTextureFace });
        var materialTop = new THREE.MeshBasicMaterial({ map: cubeTextureTop });
        var materialBottom = new THREE.MeshBasicMaterial({ map: cubeTextureFace });
        var materialLeft = new THREE.MeshBasicMaterial({ map: cubeTextureFace });
        var materialRight = new THREE.MeshBasicMaterial({ map: cubeTextureEye });
        
        // Create a mesh face material and assign the materials to the cube faces
        var cubeMaterial = [
            materialFront, materialBack, materialTop,
            materialBottom, materialLeft, materialRight
        ];

        // Cube
        const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
        cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.castShadow = true;
        cube.receiveShadow = true;
        cube.health = health;
        scene.add(cube);
        cube.add(camera2);
        
        // Walls :

        const wallGeometry = new THREE.BoxGeometry(10, 5, 0.01);

       // Toxic  Element
        const toxicGeom = new THREE.TetrahedronGeometry(0.4);
        const toxicMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000,
                                                                  transparent: true,
                                                                  opacity: 0.8 });
        toxicMesh = new THREE.Mesh(toxicGeom, toxicMaterial);
        scene.add(toxicMesh);     
        toxicMesh.position.set(-2, 0, -3);

       // Positive Element
        const dimensions = { width: 0.5, height: 0.5, depth: 0.1 };
        const plusShape = new THREE.Shape();
        plusShape.moveTo(-dimensions.width / 2, 0);
        plusShape.lineTo(-dimensions.width / 4, 0);
        plusShape.lineTo(-dimensions.width / 4, -dimensions.height / 2);
        plusShape.lineTo(dimensions.width / 4, -dimensions.height / 2);
        plusShape.lineTo(dimensions.width / 4, 0);
        plusShape.lineTo(dimensions.width / 2, 0);
        plusShape.lineTo(dimensions.width / 2, dimensions.height / 4);
        plusShape.lineTo(dimensions.width / 4, dimensions.height / 4);
        plusShape.lineTo(dimensions.width / 4, dimensions.height / 2);
        plusShape.lineTo(-dimensions.width / 4, dimensions.height / 2);
        plusShape.lineTo(-dimensions.width / 4, dimensions.height / 4);
        plusShape.lineTo(-dimensions.width / 2, dimensions.height / 4);
        plusShape.closePath();

        const plusGeometry = new THREE.ExtrudeGeometry(plusShape, {
        depth: dimensions.depth,
        bevelEnabled: false,
        });

        const plusMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00,
                                                           transparent: true,
                                                            opacity: 0.8,
                                                         });
        positiveMesh = new THREE.Mesh(plusGeometry, plusMaterial);

        scene.add(positiveMesh);
        positiveMesh.position.set(2, 0, -3);

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
            opacity: 0.6
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


        // UI
        healthBar = document.createElement('div');
        healthBar.style.width = '100px';
        healthBar.style.height = '10px';
        healthBar.style.backgroundColor = 'transparent';
        healthBar.style.backgroundColor = 'tomato';
        healthBar.style.borderRadius = '5px';
        healthBar.style.position = 'absolute';
        healthBar.style.top = '20px';
        healthBar.style.left = '10px';
        healthBar.style.boxSizing = 'border-box';
        healthBar.style.padding = '0px';
        healthBar.style.border = '2px solid black';
        healthBar.style.backgroundClip = 'padding-box';

        // Add an inner div to act as the health bar fill
        healthBarFill = document.createElement('div');
        healthBarFill.style.width = '100px';
        healthBarFill.style.height = '100%';    
        healthBarFill.style.backgroundColor = 'lightgreen';
        healthBarFill.style.borderRadius = 'inherit';
        healthBarFill.style.position = 'absolute';
        healthBarFill.id = 'health-bar-fill';
        healthBar.appendChild(healthBarFill);
        document.body.appendChild(healthBar);


        //Renderer Main
        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        //Renderer Top
        topRenderer = new THREE.WebGLRenderer({
            antialias: true
        });
        topRenderer.setClearColor(0x000000, 0); // set the background color to transparent
        topRenderer.setSize(window.innerWidth / 4, window.innerHeight / 4); // set the size of the viewport
        topRenderer.domElement.style.position = 'absolute'; // set the position of the viewport
        topRenderer.domElement.style.top = '10px'; // set the top position of the viewport
        topRenderer.domElement.style.right = '10px'; // set the right position of the viewport
        document.body.appendChild(topRenderer.domElement);

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

        // Create a bounding box for the plus sign
        const positiveBoundingBox = new THREE.Box3().setFromObject(positiveMesh);

        // Create a bounding box for the tetrahedron
        const toxicBoundingBox = new THREE.Box3().setFromObject(toxicMesh);

        // Check for collision between the cube and the wall
        if (cubeBoundingBox.intersectsBox(backWallBoundingBox) ||
            cubeBoundingBox.intersectsBox(leftWallBoundingBox) ||
            cubeBoundingBox.intersectsBox(rightWallBoundingBox) ||
            cubeBoundingBox.intersectsBox(frontWallBoundingBox)) {
            // If there is a collision, move the cube back to its previous position
            cube.position.copy(previousCubePosition); //<<
        } else if (cubeBoundingBox.intersectsBox(positiveBoundingBox)) {
            cube.position.copy(previousCubePosition);
            cube.health += 1;
        } else if (cubeBoundingBox.intersectsBox(toxicBoundingBox)) {
            cube.position.copy(previousCubePosition);
            cube.health -= 1;
        } else {
            // Update the previous cube position if there was no collision
            previousCubePosition.copy(cube.position);
        }


    }

    function animate() {
        checkCollision()
        requestAnimationFrame(animate);
        
        if (cube.health > 0) {

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
        
            // Update health bar fill
            cube.health -= 0.06;
            healthBarFill.style.width = (cube.health / 100 * 100) + '%';  
            
          } else {
            // Remove cube
            scene.remove(cube);
        
            // Add X texture at cube's last position
            let crossTexture = new THREE.TextureLoader().load('cubeTextureCross.png');
            let crossMaterial = new THREE.MeshBasicMaterial({ map: crossTexture,
                                                              transparent: true,
                                                              side: THREE.DoubleSide });
            let crossGeometry = new THREE.PlaneGeometry(1, 1);
            let crossMesh = new THREE.Mesh(crossGeometry, crossMaterial);
            crossMesh.rotation.x = -Math.PI / 2;
            crossMesh.position.copy(cube.position);
            crossMesh.position.y = -0.48; 
            // crossMesh.rotation.z = cube.rotation.z;
            scene.add(crossMesh);

            // Stop health drain
            cube.health = 0;
          }
        

        renderer.render(scene, camera);
        topRenderer.render(scene, camera2);

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