AFRAME.registerComponent('generar-pastos-radio', {
    schema: {
      cantidad: {type: 'number', default: 20},
      centroX: {type: 'number', default: 0},  // Punto central X
      centroZ: {type: 'number', default: 0},  // Punto central Z
      radioMaximo: {type: 'number', default: 0.2}, // Radio máximo desde el centro
      alturaMin: {type: 'number', default: 1.53},
      alturaMax: {type: 'number', default: 1.55},
      rotacionMinY: {type: 'number', default: 0},
      rotacionMaxY: {type: 'number', default: 360},
      rotacionMinZ: {type: 'number', default: 0},
      rotacionMaxZ: {type: 'number', default: 25},
      escalaMin: {type: 'number', default: 0.09},
      escalaMax: {type: 'number', default: 0.12},
      modelo: {type: 'string', default: 'dry_grass.glb'}
    },
    
    init: function() {
      const data = this.data;
      const el = this.el;
      
      for (let i = 0; i < data.cantidad; i++) {
        // Crear la entidad de pasto
        const pasto = document.createElement('a-entity');
        
        // Generar posición aleatoria dentro del radio desde el punto central
        // Usando coordenadas polares para una distribución más uniforme
        const radio = Math.random() * data.radioMaximo;
        const angulo = Math.random() * Math.PI * 2; // Ángulo aleatorio en radianes (0-2π)
        
        const posX = data.centroX + radio * Math.cos(angulo);
        const posY = Math.random() * (data.alturaMax - data.alturaMin) + data.alturaMin;
        const posZ = data.centroZ + radio * Math.sin(angulo);
        
        // Generar rotación aleatoria
        const rotY = Math.random() * (data.rotacionMaxY - data.rotacionMinY) + data.rotacionMinY;
        const rotZ = Math.random() * (data.rotacionMaxZ - data.rotacionMinZ) + data.rotacionMinZ;
        
        // Generar escala aleatoria
        const escala = Math.random() * (data.escalaMax - data.escalaMin) + data.escalaMin;
        
        // Establecer atributos
        pasto.setAttribute('position', `${posX} ${posY} ${posZ}`);
        pasto.setAttribute('rotation', `0 ${rotY} ${rotZ}`);
        pasto.setAttribute('scale', `${escala} ${escala} ${escala}`);
        pasto.setAttribute('gltf-model', data.modelo);
        pasto.setAttribute('shadow', 'cast: false; receive: false');
        
        // Añadir a la escena
        el.appendChild(pasto);
      }
    }
  });