// SIMULACIÓN DE LIMPIEZA - Dinámica de Partículas

class CleaningSimulation {
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
        // Limpiador (agente de limpieza)
        this.cleaner = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            radius: 15,
            vx: 0,
            vy: 0,
            speed: 2,
            angle: 0
        };

        // Partículas sucias
        this.dirtyParticles = this.generateParticles(100);
        this.cleanedParticles = [];

        // Estadísticas
        this.stats = {
            totalParticles: 100,
            cleanedCount: 0,
            efficiency: 0,
            time: 0
        };
    }

    generateParticles(count) {
        const particles = [];
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 2,
                vy: (Math.random() - 0.5) * 2,
                radius: 3,
                cleaningTime: 0
            });
        }
        return particles;
    }

    setupEventListeners() {
        document.getElementById('playPauseBtn').addEventListener('click', () => this.togglePlayPause());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('gifBtn').addEventListener('click', () => this.captureGIF());

        // Control del limpiador con mouse
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const dx = x - this.cleaner.x;
        const dy = y - this.cleaner.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance > 0) {
            this.cleaner.vx = (dx / distance) * this.cleaner.speed;
            this.cleaner.vy = (dy / distance) * this.cleaner.speed;
        }
    }

    handleKeyDown(e) {
        const speed = this.cleaner.speed;
        switch(e.key.toLowerCase()) {
            case 'arrowup':
            case 'w':
                this.cleaner.vy = -speed;
                break;
            case 'arrowdown':
            case 's':
                this.cleaner.vy = speed;
                break;
            case 'arrowleft':
            case 'a':
                this.cleaner.vx = -speed;
                break;
            case 'arrowright':
            case 'd':
                this.cleaner.vx = speed;
                break;
        }
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

    updatePhysics() {
        // Actualizar posición del limpiador
        this.cleaner.x += this.cleaner.vx;
        this.cleaner.y += this.cleaner.vy;

        // Mantener dentro del canvas
        this.cleaner.x = Math.max(this.cleaner.radius, Math.min(this.canvas.width - this.cleaner.radius, this.cleaner.x));
        this.cleaner.y = Math.max(this.cleaner.radius, Math.min(this.canvas.height - this.cleaner.radius, this.cleaner.y));

        // Actualizar partículas sucias
        const cleaningRadius = this.cleaner.radius + 30;

        for (let i = this.dirtyParticles.length - 1; i >= 0; i--) {
            const particle = this.dirtyParticles[i];

            // Movimiento aleatorio
            particle.vx += (Math.random() - 0.5) * 0.1;
            particle.vy += (Math.random() - 0.5) * 0.1;

            // Limitar velocidad
            const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
            if (speed > 1) {
                particle.vx = (particle.vx / speed) * 1;
                particle.vy = (particle.vy / speed) * 1;
            }

            // Actualizar posición
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Rebotar en bordes
            if (particle.x - particle.radius < 0 || particle.x + particle.radius > this.canvas.width) {
                particle.vx *= -1;
                particle.x = Math.max(particle.radius, Math.min(this.canvas.width - particle.radius, particle.x));
            }
            if (particle.y - particle.radius < 0 || particle.y + particle.radius > this.canvas.height) {
                particle.vy *= -1;
                particle.y = Math.max(particle.radius, Math.min(this.canvas.height - particle.radius, particle.y));
            }

            // Verificar si está siendo limpiada
            const dx = particle.x - this.cleaner.x;
            const dy = particle.y - this.cleaner.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < cleaningRadius) {
                particle.cleaningTime++;
                if (particle.cleaningTime > 20) {
                    this.cleanedParticles.push(this.dirtyParticles.splice(i, 1)[0]);
                    this.stats.cleanedCount++;
                }
            } else {
                particle.cleaningTime = Math.max(0, particle.cleaningTime - 1);
            }
        }

        // Actualizar estadísticas
        this.stats.efficiency = Math.round((this.stats.cleanedCount / this.stats.totalParticles) * 100);
        this.stats.time = Math.floor(this.frameCount / 60);
    }

    updateInfoPanel() {
        document.getElementById('particles').textContent = `Partículas: ${this.dirtyParticles.length} / ${this.stats.totalParticles}`;
        document.getElementById('efficiency').textContent = `Eficiencia: ${this.stats.efficiency}%`;
        document.getElementById('time').textContent = `Tiempo: ${this.stats.time}s`;
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#0f172a';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar partículas limpias (fantasmas)
        this.ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
        this.cleanedParticles.forEach(particle => {
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Dibujar partículas sucias
        this.ctx.fillStyle = '#ef4444';
        this.dirtyParticles.forEach(particle => {
            const intensity = particle.cleaningTime / 20;
            this.ctx.fillStyle = `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Dibujar limpiador
        this.ctx.fillStyle = '#3b82f6';
        this.ctx.beginPath();
        this.ctx.arc(this.cleaner.x, this.cleaner.y, this.cleaner.radius, 0, Math.PI * 2);
        this.ctx.fill();

        // Zona de influencia del limpiador
        this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(this.cleaner.x, this.cleaner.y, this.cleaner.radius + 30, 0, Math.PI * 2);
        this.ctx.stroke();
    }

    animate() {
        if (!this.isPlaying) return;

        this.updatePhysics();
        this.updateInfoPanel();
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
    new CleaningSimulation('canvas');
});
