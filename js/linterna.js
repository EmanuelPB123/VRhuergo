    // Script para activar/desactivar la linterna
    document.querySelector('#toggle-light').addEventListener('click', function() {
      const flashlight = document.querySelector('#flashlight');
      const currentIntensity = flashlight.getAttribute('light').intensity;
      
      // Si está encendida, apagar; si está apagada, encender
      const newIntensity = currentIntensity > 0 ? 0 : 1.0;
      flashlight.setAttribute('light', 'intensity', newIntensity);
    });