import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

export class ThreeAvatar {
    constructor(containerId, shapeType = 'cube') {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.scene = new THREE.Scene();
        
        const width = this.container.clientWidth || 130;
        const height = this.container.clientHeight || 130;
        
        this.camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
        this.camera.position.z = 4;

        this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.container.innerHTML = '';
        this.container.appendChild(this.renderer.domElement);

        this.createMesh(shapeType);
        this.addLighting();

        this.animate = this.animate.bind(this);
        this.animationId = requestAnimationFrame(this.animate);
    }

    createMesh(shapeType) {
        if(this.meshGroup) this.scene.remove(this.meshGroup);
        this.meshGroup = new THREE.Group();
        
        const material = new THREE.MeshPhysicalMaterial({
            color: 0x06B6D4,
            metalness: 0.3,
            roughness: 0.4,
            transmission: 0.5,
            thickness: 0.5,
            emissive: 0x8B5CF6,
            emissiveIntensity: 0.2
        });

        const addPart = (geom, x, y, z) => {
            const mesh = new THREE.Mesh(geom, material);
            mesh.position.set(x, y, z);
            
            const wireframe = new THREE.LineSegments(
                new THREE.EdgesGeometry(geom),
                new THREE.LineBasicMaterial({ color: 0xFF9900, transparent: true, opacity: 0.5 })
            );
            mesh.add(wireframe);
            this.meshGroup.add(mesh);
        };

        if(shapeType === 'bear') {
            addPart(new THREE.BoxGeometry(1.4, 1.2, 1.2), 0, 0, 0); // Head
            addPart(new THREE.BoxGeometry(0.5, 0.5, 0.3), -0.7, 0.6, 0); // Ear L
            addPart(new THREE.BoxGeometry(0.5, 0.5, 0.3), 0.7, 0.6, 0); // Ear R
            addPart(new THREE.BoxGeometry(0.6, 0.4, 0.4), 0, -0.2, 0.6); // Snout
        } else if (shapeType === 'fox') {
            addPart(new THREE.BoxGeometry(1.2, 1.0, 1.2), 0, 0, 0); // Head
            addPart(new THREE.ConeGeometry(0.3, 0.8, 4), -0.4, 0.8, 0); // Ear L
            addPart(new THREE.ConeGeometry(0.3, 0.8, 4), 0.4, 0.8, 0); // Ear R
            const snout = new THREE.ConeGeometry(0.4, 0.8, 4);
            snout.rotateX(Math.PI / 2);
            addPart(snout, 0, -0.2, 0.8); // Snout
        } else {
            // Fallback: Rabbit
            addPart(new THREE.BoxGeometry(1.2, 1.2, 1.2), 0, 0, 0); // Head
            addPart(new THREE.BoxGeometry(0.3, 1.5, 0.3), -0.4, 1.2, 0); // Ear L
            addPart(new THREE.BoxGeometry(0.3, 1.5, 0.3), 0.4, 1.2, 0); // Ear R
            addPart(new THREE.BoxGeometry(0.4, 0.3, 0.4), 0, -0.2, 0.6); // Snout
        }

        this.scene.add(this.meshGroup);
        this.camera.position.z = 5;
    }

    addLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0xff9900, 2, 10);
        pointLight.position.set(2, 2, 2);
        this.scene.add(pointLight);

        const pointLight2 = new THREE.PointLight(0x06b6d4, 2, 10);
        pointLight2.position.set(-2, -2, 2);
        this.scene.add(pointLight2);
    }

    setShape(shapeType) {
        this.createMesh(shapeType);
    }

    animate() {
        if(this.meshGroup) {
            this.meshGroup.rotation.x += 0.005;
            this.meshGroup.rotation.y += 0.01;
            
            // Floating effect
            this.meshGroup.position.y = Math.sin(Date.now() * 0.002) * 0.1;
        }
        this.renderer.render(this.scene, this.camera);
        this.animationId = requestAnimationFrame(this.animate);
    }

    destroy() {
        cancelAnimationFrame(this.animationId);
        this.renderer.dispose();
    }
}
