// Componente para hacer que los árboles oscilen
AFRAME.registerComponent('tree-oscillation', {
    schema: {
      amplitude: {type: 'number', default: 0.01},
      speed: {type: 'number', default: 0.002}
    },
    
    init: function() {
      this.originalRotation = this.el.object3D.rotation.clone();
      this.time = Math.random() * 1000; // Tiempo inicial aleatorio para que no oscilen sincronizados
    },
    
    tick: function(t, dt) {
      this.time += dt * this.data.speed;
      
      // Oscilación en X (adelante y atrás)
      const oscillationX = Math.sin(this.time * 0.001) * this.data.amplitude;
      
      // Oscilación en Z (lados)
      const oscillationZ = Math.sin(this.time * 0.0007) * this.data.amplitude;
      
      // Aplicar rotación
      this.el.object3D.rotation.x = this.originalRotation.x + oscillationX;
      this.el.object3D.rotation.z = this.originalRotation.z + oscillationZ;
    }
  });
  
  // Esperar a que la escena esté cargada
  document.querySelector('a-scene').addEventListener('loaded', function() {
    const forest = document.getElementById('forest');
    
    // Crear varios pinos
    for (let i = 0; i < 15; i++) {
      createPineTree(
        (Math.random() - 0.5) * 30, // Posición X aleatoria
        0,  // Posición Y (suelo)
        (Math.random() - 0.5) * 30, // Posición Z aleatoria
        0.8 + Math.random() * 0.5   // Tamaño aleatorio
      );
    }
    
    function createPineTree(x, y, z, scale) {
      // Crear el árbol completo
      const tree = document.createElement('a-entity');
      tree.setAttribute('position', {x: x, y: y, z: z});
      tree.setAttribute('scale', {x: scale, y: scale, z: scale});
      
      // Tronco del árbol
      const trunk = document.createElement('a-cylinder');
      trunk.setAttribute('position', {x: 0, y: 1.5, z: 0});
      trunk.setAttribute('height', 3);
      trunk.setAttribute('radius', 0.2);
      trunk.setAttribute('color', '#8B4513');
      trunk.setAttribute('shadow', 'cast: true');
      
      // Contenedor para las copas del pino (las que oscilan)
      const foliage = document.createElement('a-entity');
      foliage.setAttribute('position', {x: 0, y: 2.5, z: 0});
      foliage.setAttribute('tree-oscillation', {
        amplitude: 0.01 + Math.random() * 0.01, // Amplitud aleatoria
        speed: 0.0015 + Math.random() * 0.001   // Velocidad aleatoria
      });
      
      // Añadir varias capas de copas
      for (let i = 0; i < 4; i++) {
        const cone = document.createElement('a-cone');
        cone.setAttribute('position', {x: 0, y: i * 0.6, z: 0});
        cone.setAttribute('height', 1.5);
        cone.setAttribute('radius-bottom', 1 - (i * 0.15));
        cone.setAttribute('radius-top', 0.1);
        cone.setAttribute('color', '#2E8B57');
        cone.setAttribute('shadow', 'cast: true');
        foliage.appendChild(cone);
      }
      
      // Estructura del árbol: tronco + follaje con oscilación
      tree.appendChild(trunk);
      tree.appendChild(foliage);
      
      // Añadir a la escena
      forest.appendChild(tree);
    }
  });