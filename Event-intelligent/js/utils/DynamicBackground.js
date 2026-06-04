export class DynamicBackground {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if(!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.colors = ['rgba(6, 182, 212, 0.15)', 'rgba(139, 92, 246, 0.1)', 'rgba(255, 153, 0, 0.05)'];
        this.init();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        for (let i = 0; i < 40; i++) {
            this.particles.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                radius: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                color: this.colors[Math.floor(Math.random() * this.colors.length)]
            });
        }
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        // Breathing Gradient Base
        const time = Date.now() * 0.0005;
        const breath = (Math.sin(time) + 1) / 2; // 0 to 1
        
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width
        );
        
        const theme = document.body.getAttribute('data-theme');
        if(theme === 'light') {
            gradient.addColorStop(0, `rgba(255, 255, 255, ${0.8 + breath * 0.2})`);
            gradient.addColorStop(1, '#F3F4F6');
        } else {
            gradient.addColorStop(0, `rgba(13, 13, 18, 1)`);
            gradient.addColorStop(1, `rgba(0, 0, 0, 1)`);
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // Draw Particles
        this.particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > this.width) p.vx *= -1;
            if (p.y < 0 || p.y > this.height) p.vy *= -1;

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.radius + (breath * 1), 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
        });

        requestAnimationFrame(this.animate);
    }
}
