// Crear un nuevo script: movement-scale.js

AFRAME.registerComponent('movement-scale', {
  schema: {
    scale: {type: 'number', default: 3.0} // Cada paso real son 3 pasos virtuales
  },
  
  init: function() {
    this.originalPosition = new THREE.Vector3();
    this.lastPosition = new THREE.Vector3();
    this.currentPosition = new THREE.Vector3();
    this.movement = new THREE.Vector3();
    
    // Guardar posición inicial
    this.el.object3D.getWorldPosition(this.originalPosition);
    this.lastPosition.copy(this.originalPosition);
  },
  
  tick: function() {
    // Obtener posición actual
    this.el.object3D.getWorldPosition(this.currentPosition);
    
    // Calcular movimiento real
    this.movement.subVectors(this.currentPosition, this.lastPosition);
    
    if (this.movement.length() > 0) {
      // Aplicar escala al movimiento
      this.movement.multiplyScalar(this.data.scale - 1);
      
      // Aplicar movimiento escalado
      this.el.object3D.position.add(this.movement);
      
      // Actualizar última posición
      this.el.object3D.getWorldPosition(this.lastPosition);
    }
  }
});
