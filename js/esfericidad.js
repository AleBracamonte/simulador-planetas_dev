// SIMULACIÓN DE ESFERICIDAD - Geometría y Propiedades de Esferas

class SphericitySimulation {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.isPlaying = false;
        this.frameCount = 0;

        this.setupCanvas();
        this.initializeSimulation();
        this.setupEventListeners();
    }

    setupCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight || 600;
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    initializeSimulation() {
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Parámetros de la esfera
        this.sphere = {
            x: this.centerX,
            y: this.centerY,
            radius: 80,
            rotationX: 0,
            rotationY: 0,
            rotationZ: 0
        };

        this.particles = this.generateSurfaceParticles(200);
    }

    generateSurfaceParticles(count) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const x = Math.sin(phi) * Math.cos(theta);
            const y = Math.sin(phi) * Math.sin(theta);
            const z = Math.cos(phi);

            particles.push({
                x, y, z,
                originalX: x,
                originalY: y,
                originalZ: z,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
        return particles;
    }

    setupEventListeners() {
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('gifBtn').addEventListener('click', () => this.captureGIF());
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        document.getElementById('playPauseBtn').textContent = this.isPlaying ? 'Pausar' : 'Reproducir';
        if (this.isPlaying) this.animate();
    }

    reset() {
        this.isPlaying = false;
        this.frameCount = 0;
        this.initializeSimulation();
        this.draw();
        document.getElementById('playPauseBtn').textContent = 'Reproducir';
    }

    rotateParticle(particle, angleX, angleY, angleZ) {
        // Rotación en X
        let y = particle.y * Math.cos(angleX) - particle.z * Math.sin(angleX);
        let z = particle.y * Math.sin(angleX) + particle.z * Math.cos(angleX);
        particle.y = y;
        particle.z = z;

        // Rotación en Y
        let x = particle.x * Math.cos(angleY) + z * Math.sin(angleY);
        z = -particle.x * Math.sin(angleY) + z * Math.cos(angleY);
        particle.x = x;
        particle.z = z;

        // Rotación en Z
        x = particle.x * Math.cos(angleZ) - particle.y * Math.sin(angleZ);
        y = particle.x * Math.sin(angleZ) + particle.y * Math.cos(angleZ);
        particle.x = x;
        particle.y = y;
    }

    updatePhysics() {
        // Actualizar rotaciones
        this.sphere.rotationX += 0.005;
        this.sphere.rotationY += 0.008;
        this.sphere.rotationZ += 0.003;

        // Aplicar rotaciones a partículas
        this.particles.forEach(particle => {
            particle.x = particle.originalX;
            particle.y = particle.originalY;
            particle.z = particle.originalZ;

            this.rotateParticle(particle, this.sphere.rotationX, this.sphere.rotationY, this.sphere.rotationZ);
        });

        // Calcular propiedades
        this.updateInfoPanel();
    }

    updateInfoPanel() {
        const radius = this.sphere.radius;
        const volume = (4/3) * Math.PI * Math.pow(radius, 3);
        const surface = 4 * Math.PI * Math.pow(radius, 2);

        document.getElementById('radius').textContent = `Radio: ${radius.toFixed(2)} unidades`;
        document.getElementById('volume').textContent = `Volumen: ${(volume / 1000).toFixed(2)} u³ (×10³)`;
        document.getElementById('surface').textContent = `Superficie: ${(surface / 100).toFixed(2)} u² (×10²)`;
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Ordenar partículas por profundidad
        this.particles.sort((a, b) => b.z - a.z);

        // Dibujar partículas
        this.particles.forEach(particle => {
            const screenX = this.centerX + particle.x * this.sphere.radius;
            const screenY = this.centerY + particle.y * this.sphere.radius;

            // Aplicar perspectiva
            const scale = 0.5 + (particle.z + 1) * 0.25;

            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = 0.6 + scale * 0.4;
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, 3 * scale, 0, Math.PI * 2);
            this.ctx.fill();
        });

        this.ctx.globalAlpha = 1;

        // Dibujar marco
        this.ctx.strokeStyle = '#60a5fa';
        this.ctx.lineWidth = 2;
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, this.sphere.radius, 0, Math.PI * 2);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    animate() {
        if (!this.isPlaying) return;

        this.updatePhysics();
        this.draw();
        this.frameCount++;

        requestAnimationFrame(() => this.animate());
    }

    captureGIF() {
        alert('Función de captura de GIF pendiente de implementar con gifshot.js');
    }
}

// Inicializar simulación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new SphericitySimulation('canvas');
});
