// SIMULACIÓN DE ÓRBITA - Física y Renderizado
// Movimiento orbital y fuerzas gravitacionales

class OrbitalSimulation {
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
        // Centro de la órbita
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;

        // Cuerpo central (Sol)
        this.sun = {
            x: this.centerX,
            y: this.centerY,
            radius: 20,
            mass: 1000
        };

        // Planeta orbitador
        this.planet = {
            x: this.centerX + 150,
            y: this.centerY,
            vx: 0,
            vy: -3,
            radius: 8,
            mass: 1,
            distance: 150
        };

        // Gravitational constant
        this.G = 0.5;
        this.trails = [];
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
        this.trails = [];
        this.initializeSimulation();
        this.draw();
        document.getElementById('playPauseBtn').textContent = 'Reproducir';
    }

    updatePhysics() {
        // Calcular vector de gravedad
        const dx = this.sun.x - this.planet.x;
        const dy = this.sun.y - this.planet.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Fuerza gravitacional
        const force = this.G * this.sun.mass / (distance * distance);
        const ax = force * dx / distance;
        const ay = force * dy / distance;

        // Actualizar velocidad
        this.planet.vx += ax;
        this.planet.vy += ay;

        // Actualizar posición
        this.planet.x += this.planet.vx;
        this.planet.y += this.planet.vy;

        // Registrar rastro
        if (this.frameCount % 2 === 0) {
            this.trails.push({
                x: this.planet.x,
                y: this.planet.y
            });
            if (this.trails.length > 200) this.trails.shift();
        }

        // Actualizar distancia
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const velocity = Math.sqrt(this.planet.vx * this.planet.vx + this.planet.vy * this.planet.vy);
        const acceleration = Math.sqrt(ax * ax + ay * ay);

        this.updateInfoPanel(velocity, currentDistance, acceleration);
    }

    updateInfoPanel(velocity, distance, acceleration) {
        document.getElementById('velocity').textContent = `Velocidad: ${velocity.toFixed(2)} m/s`;
        document.getElementById('distance').textContent = `Distancia: ${distance.toFixed(0)} px`;
        document.getElementById('acceleration').textContent = `Aceleración: ${acceleration.toFixed(4)} m/s²`;
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar rastro
        this.drawTrail();

        // Dibujar Sol
        this.drawBody(this.sun, '#fbbf24');

        // Dibujar Planeta
        this.drawBody(this.planet, '#3b82f6');

        // Dibujar línea de órbita
        this.drawOrbitLine();
    }

    drawBody(body, color) {
        this.ctx.fillStyle = color;
        this.ctx.beginPath();
        this.ctx.arc(body.x, body.y, body.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Glow effect
        this.ctx.strokeStyle = color;
        this.ctx.globalAlpha = 0.3;
        this.ctx.lineWidth = 10;
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawTrail() {
        if (this.trails.length < 2) return;
        
        this.ctx.strokeStyle = '#60a5fa';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.6;
        this.ctx.beginPath();
        this.ctx.moveTo(this.trails[0].x, this.trails[0].y);
        
        for (let i = 1; i < this.trails.length; i++) {
            this.ctx.lineTo(this.trails[i].x, this.trails[i].y);
        }
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawOrbitLine() {
        const distance = Math.sqrt(
            Math.pow(this.planet.x - this.sun.x, 2) +
            Math.pow(this.planet.y - this.sun.y, 2)
        );

        this.ctx.strokeStyle = '#475569';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.3;
        this.ctx.beginPath();
        this.ctx.arc(this.sun.x, this.sun.y, distance, 0, Math.PI * 2);
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
    new OrbitalSimulation('canvas');
});
