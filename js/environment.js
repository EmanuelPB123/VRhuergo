AFRAME.registerComponent('model-error', {
  init: function () {
    this.el.addEventListener('model-error', function (e) {
      console.error('Error loading 3D model:', e);
    });
  }
});

AFRAME.registerComponent('custom-controls', {
  init: function() {
    this.el.removeAttribute('wasd-controls');
    
    this.camera = this.el;
    this.moveSpeed = 0.15;
    this.currentSpeed = { x: 0, z: 0 };
    this.raycaster = new THREE.Raycaster();
    this.collisionDistance = 0.5;
    this.moveDirection = new THREE.Vector2(0, 0);
    this.keyboardDirection = new THREE.Vector2(0, 0);
    this.keys = {
      KeyW: false,
      KeyS: false,
      KeyA: false,
      KeyD: false,
      ArrowUp: false,
      ArrowDown: false,
      ArrowLeft: false,
      ArrowRight: false
    };
    
    // Nipplejs joystick setup
    const options = {
      zone: document.getElementById('movement-controls'),
      mode: 'static',
      position: { left: '60px', bottom: '60px' },
      color: 'white',
      size: 120
    };

    const manager = nipplejs.create(options);
    
    manager.on('move', (evt, data) => {
      const angle = (data.angle.radian + Math.PI/2); 
      const force = Math.min(data.force, 1);
      
      this.moveDirection.x = Math.sin(angle) * force;
      this.moveDirection.y = -Math.cos(angle) * force;
    });

    manager.on('end', () => {
      this.moveDirection.set(0, 0);
    });

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = true;
        e.preventDefault();
        return false;
      }
    }, true);

    window.addEventListener('keyup', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        this.keys[e.code] = false;
        e.preventDefault();
        return false;
      }
    }, true);
    
    window.addEventListener('keypress', (e) => {
      if (this.keys.hasOwnProperty(e.code)) {
        e.preventDefault();
        return false;
      }
    }, true);

    this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 16);
    
    // Collision effects setup
    this.collisionFlash = document.createElement('div');
    this.collisionFlash.className = 'collision-flash';
    document.body.appendChild(this.collisionFlash);
    
    this.isColliding = false;
    this.collisionTimeout = null;
    
    this.collisionSounds = [
      document.getElementById('collision-sound-1'),
      document.getElementById('collision-sound-2'),
      document.getElementById('collision-sound-3')
    ];
    
    this.lastSoundTime = 0;
    this.soundCooldown = 500; 
  },

  updateKeyboardDirection: function() {
    this.keyboardDirection.set(0, 0);
    
    if (this.keys.KeyW || this.keys.ArrowUp) this.keyboardDirection.y += 1;
    if (this.keys.KeyS || this.keys.ArrowDown) this.keyboardDirection.y -= 1;
    if (this.keys.KeyD || this.keys.ArrowRight) this.keyboardDirection.x += 1;
    if (this.keys.KeyA || this.keys.ArrowLeft) this.keyboardDirection.x -= 1;

    if (this.keyboardDirection.length() > 1) {
      this.keyboardDirection.normalize();
    }
  },

  playRandomCollisionSound: function() {
    const currentTime = Date.now();
    if (currentTime - this.lastSoundTime < this.soundCooldown) {
      return;
    }
    
    const randomSound = this.collisionSounds[Math.floor(Math.random() * this.collisionSounds.length)];
    randomSound.currentTime = 0;
    randomSound.play().catch(error => {
      console.log("Audio playback failed:", error);
    });
    this.lastSoundTime = currentTime;
  },

  showCollisionEffect: function() {
    if (!this.isColliding) {
      this.isColliding = true;
      this.collisionFlash.style.opacity = '1';
      this.playRandomCollisionSound();
      
      if (this.collisionTimeout) {
        clearTimeout(this.collisionTimeout);
      }
      
      this.collisionTimeout = setTimeout(() => {
        this.collisionFlash.style.opacity = '0';
        this.isColliding = false;
      }, 150);
    }
  },

  isInRestrictedZone: function(position) {
    const innerRestricted = (position.x >= -2 && position.x <= 2 && 
                           position.z >= -5 && position.z <= -1);
    
    const outsideBounds = (position.x <= -14.5 || position.x >= 14.5 || 
                          position.z <= -14.5 || position.z >= 6.5);
    
    return innerRestricted || outsideBounds;
  },

  checkCollision: function(position, direction) {
    const rays = [
      direction.clone(),
      direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 4),
      direction.clone().applyAxisAngle(new THREE.Vector3(0, 1, 0), -Math.PI / 4)
    ];

    for (let rayDir of rays) {
      this.raycaster.set(position, rayDir);
      const collisionObjects = document.querySelectorAll('[gltf-model], [obj-model], a-plane, a-box');
      const collisionArray = [];
      
      collisionObjects.forEach(object => {
        if (object.object3D) {
          object.object3D.updateMatrixWorld();
          object.object3D.traverse((node) => {
            if (node.isMesh) {
              collisionArray.push(node);
            }
          });
        }
      });

      const intersects = this.raycaster.intersectObjects(collisionArray, true);
      if (intersects.length > 0 && intersects[0].distance < this.collisionDistance) {
        return true;
      }
    }
    return false;
  },

  tick: function() {
    this.updateKeyboardDirection();
    
    const combinedMove = new THREE.Vector2(
      this.moveDirection.x + this.keyboardDirection.x,
      this.moveDirection.y + this.keyboardDirection.y
    );
    
    if (combinedMove.length() > 0) {
      const rotation = this.camera.object3D.rotation;
      const forward = new THREE.Vector3(0, 0, -1);
      const right = new THREE.Vector3(1, 0, 0);
      
      forward.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.y);
      right.applyAxisAngle(new THREE.Vector3(0, 1, 0), rotation.y);
      
      const moveVector = new THREE.Vector3();
      moveVector.addScaledVector(forward, combinedMove.y * this.moveSpeed);
      moveVector.addScaledVector(right, combinedMove.x * this.moveSpeed);
      
      const currentPosition = this.camera.object3D.position;
      const proposedPosition = currentPosition.clone();
      proposedPosition.add(moveVector);

      if (this.isInRestrictedZone(proposedPosition)) {
        this.showCollisionEffect();
        return;
      }

      const xMove = new THREE.Vector3(moveVector.x, 0, 0);
      const zMove = new THREE.Vector3(0, 0, moveVector.z);
      
      let canMoveX = true;
      let canMoveZ = true;

      if (xMove.length() > 0) {
        const xDir = xMove.clone().normalize();
        if (this.checkCollision(currentPosition, xDir)) {
          canMoveX = false;
          this.showCollisionEffect();
        }
      }

      if (zMove.length() > 0) {
        const zDir = zMove.clone().normalize();
        if (this.checkCollision(currentPosition, zDir)) {
          canMoveZ = false;
          this.showCollisionEffect();
        }
      }

      if (canMoveX) {
        currentPosition.x += moveVector.x;
      }
      if (canMoveZ) {
        currentPosition.z += moveVector.z;
      }
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const models = document.querySelectorAll('[gltf-model], [obj-model]');
  models.forEach(model => {
    model.setAttribute('model-error', '');
  });

  const camera = document.querySelector('a-camera');
  camera.removeAttribute('wasd-controls');  
  camera.setAttribute('custom-controls', '');
});
