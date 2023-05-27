function addDividerWalls(scene, size) {
    const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 }); // Gray color
  
    // Vertical Wall Geometry
    const verticalWallGeometry = new THREE.BoxGeometry(0.2, 2, size);
    const verticalWallLeft = new THREE.Mesh(verticalWallGeometry, wallMaterial);
    verticalWallLeft.position.set(-size / 4, 1, 0);
    scene.add(verticalWallLeft);
  
    const verticalWallRight = new THREE.Mesh(verticalWallGeometry, wallMaterial);
    verticalWallRight.position.set(size / 4, 1, 0);
    scene.add(verticalWallRight);
  
    // Horizontal Wall Geometry
    const horizontalWallGeometry = new THREE.BoxGeometry(size, 2, 0.2);
    const horizontalWallTop = new THREE.Mesh(horizontalWallGeometry, wallMaterial);
    horizontalWallTop.position.set(0, 1, -size / 4);
    scene.add(horizontalWallTop);
  
    const horizontalWallBottom = new THREE.Mesh(horizontalWallGeometry, wallMaterial);
    horizontalWallBottom.position.set(0, 1, size / 4);
    scene.add(horizontalWallBottom);
  }
  