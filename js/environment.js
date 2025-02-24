AFRAME.registerComponent('interactive-object', {
  init: function() {
    let el = this.el;
    
    el.addEventListener('mouseenter', function() {
      el.setAttribute('scale', {x: 1.2, y: 1.2, z: 1.2});
    });

    el.addEventListener('mouseleave', function() {
      el.setAttribute('scale', {x: 1, y: 1, z: 1});
    });

    el.addEventListener('click', function() {
      let currentColor = el.getAttribute('color');
      let newColor = '#' + Math.floor(Math.random()*16777215).toString(16);
      el.setAttribute('color', newColor);
    });
  }
});

AFRAME.registerComponent('model-error', {
  init: function () {
    this.el.addEventListener('model-error', function (e) {
      console.error('Error loading 3D model:', e);
    });
  }
});

AFRAME.registerComponent('custom-controls', {
  init: function() {
    this.camera = this.el;
    this.moveSpeed = 0.15;
    this.currentSpeed = { x: 0, z: 0 };
    
    // Create joystick
    const options = {
      zone: document.getElementById('movement-controls'),
      mode: 'static',
      position: { left: '60px', bottom: '60px' },
      color: 'white',
      size: 120
    };

    const manager = nipplejs.create(options);
    
    // Handle joystick movement - Note the inverted x value (added minus sign)
    manager.on('move', (evt, data) => {
      const angle = data.angle.radian;
      const force = Math.min(data.force, 1);
      
      // Invert the x-axis movement by adding a minus sign
      this.currentSpeed.x = Math.cos(angle) * force * this.moveSpeed; 
      this.currentSpeed.z = -Math.sin(angle) * force * this.moveSpeed;
    });

    // Reset speed when joystick is released
    manager.on('end', () => {
      this.currentSpeed.x = 0;
      this.currentSpeed.z = 0;
    });

    // Set up animation loop
    this.tick = AFRAME.utils.throttleTick(this.tick.bind(this), 16);
  },

  tick: function() {
    if (this.currentSpeed.x !== 0 || this.currentSpeed.z !== 0) {
      const rotation = this.camera.object3D.rotation.y;
      const moveX = this.currentSpeed.x * Math.cos(rotation) - this.currentSpeed.z * Math.sin(rotation);
      const moveZ = this.currentSpeed.x * Math.sin(rotation) + this.currentSpeed.z * Math.cos(rotation);
      
      const currentPosition = this.camera.object3D.position;
      currentPosition.x += moveX;
      currentPosition.z += moveZ;
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const shapes = document.querySelectorAll('a-box, a-sphere, a-cylinder');
  shapes.forEach(shape => {
    shape.setAttribute('interactive-object', '');
    shape.setAttribute('animation__rotate', {
      property: 'rotation',
      dur: 8000,
      easing: 'linear',
      loop: true,
      to: '0 360 0'
    });
  });

  const models = document.querySelectorAll('[gltf-model], [obj-model]');
  models.forEach(model => {
    model.setAttribute('model-error', '');
  });

  // Add custom controls to camera
  const camera = document.querySelector('a-camera');
  camera.setAttribute('custom-controls', '');
});