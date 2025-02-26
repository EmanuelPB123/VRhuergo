AFRAME.registerComponent('light-flicker', {
    schema: {
        minIntensity: { default: 0.7 },
        maxIntensity: { default: 0.9 },
        speed: { default: 0.01 }
    },

    init: function () {
        this.light = this.el.components.light;
        this.originalIntensity = this.light.data.intensity;
        this.time = 0;
    },

    tick: function (time, deltaTime) {
        this.time += deltaTime * this.data.speed;
        // Usando una combinación de funciones seno para crear un efecto más natural
        const flicker =
            Math.sin(this.time * 0.1) *
            Math.sin(this.time * 0.5) *
            Math.sin(this.time * 1.0);

        const intensityRange = this.data.maxIntensity - this.data.minIntensity;
        const newIntensity = this.data.minIntensity + ((flicker + 1) / 2) * intensityRange;

        this.el.setAttribute('light', 'intensity', newIntensity);
    }
});