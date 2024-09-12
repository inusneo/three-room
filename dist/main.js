import * as THREE from 'three';
import * as CANNON from 'cannon-es';
// import { OrbitControls } from 'three/addons/controls/OrbitControls';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshObject, Lamp, Roborock } from './meshObj.js';
import { KeyController } from './KeyController.js';
import { TouchController } from './TouchController.js';
import { Player } from './player.js';

// Renderer
const canvas = document.querySelector('#three-canvas');
const renderer = new THREE.WebGLRenderer({
	canvas,
	antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 2: 1);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

// Scene
const scene = new THREE.Scene();
scene.background = new THREE.Color('white');

// Camera
const camera = new THREE.PerspectiveCamera(
	60, // fov
	window.innerWidth / window.innerHeight, // aspect
	0.1, // near
	1000 // far
);
camera.position.set(0, 3, 7);
scene.add(camera);

// Cannon.js
const cannonWorld = new CANNON.World();
cannonWorld.gravity.set(0, -10, 0);

const defaultCannonMaterial = new CANNON.Material('default');
const playerCannonMaterial = new CANNON.Material('player');
const defaultContactMaterial = new CANNON.ContactMaterial(
	defaultCannonMaterial,
	defaultCannonMaterial,
	{
		friction: 1,
		restitution: 0.2
	}
);
const playerContactMaterial = new CANNON.ContactMaterial(
	playerCannonMaterial,
	defaultCannonMaterial,
	{
		friction: 100,
		restitution: 0
	}
);
cannonWorld.defaultContactMaterial = defaultContactMaterial;
cannonWorld.addContactMaterial(playerContactMaterial);

const cannonObject = [];

// const controls = new OrbitControls(camera, renderer.domElement);
const gltfloader = new GLTFLoader();
const textureLoader = new THREE.TextureLoader();
const keyController = new KeyController();
const touchController = new TouchController();

// Light
const ambientLight = new THREE.AmbientLight('white', 2);
const pointLight = new THREE.PointLight('white', 100, 100);
pointLight.castShadow = true;
pointLight.shadow.mapSize.width = 2048; // 512 is basic
pointLight.shadow.mapSize.height = 2048; // 512 is basic
pointLight.position.y = 10;
scene.add(ambientLight, pointLight);

// Mesh
const ground = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'ground',
	width: 50,
	height: 0.1,
	depth: 50,
	color: '#E0E5B6',
	y: -0.05,
	differenceY: '0'
});

const floor = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'floor',
	width: 5,
	height: 0.4,
	depth: 5,
	color: '#FEFAE0',
	differenceY: '0'
});

const wall1 = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'wall1',
	width: 5,
	height: 3,
	depth: 0.2,
	color: '#FEFAE0',
	z: -2.4
});

const wall2 = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	name: 'wall2',
	width: 0.2,
	height: 3,
	depth: 4.8,
	color: '#FEFAE0',
	x: 2.4,
	z: 0.1
});

const desk = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 20,
	loader: gltfloader,
	name: 'desk',
	width: 1.8,
	height: 0.8,
	depth: 0.75,
	color: '#FEFAE0',
	x: 1.2,
	z: -1.9,
	modelSrc: './models/desk.glb'
});

const lamp = new Lamp({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	cannonShape: new CANNON.Cylinder(0.25, 0.3, 1.8, 32), // 위 반지름, 아래 반지름, 높이, 원통 둘레의 분할된면의 수
	geometry: new THREE.CylinderGeometry(0.25, 0.25, 1.81, 32),
	mass: 10,
	loader: gltfloader,
	name: 'lamp',
	width: 0.5,
	height: 1.8,
	depth: 0.5,
	z: -1.7,
	modelSrc: './models/lamp.glb',
	callback: () => {
		const lampLight = new THREE.PointLight('#35A29F', 0, 50);
		lampLight.castShadow = true;
		lampLight.shadow.mapSize.width = 2048;
		lampLight.shadow.mapSize.height = 2048;
		lampLight.position.y = 0.75; // 0, 0, 0 부모의 가운데 위치
		lamp.mesh.add(lampLight);
		lamp.light = lampLight;
	}
});

const roborock = new Roborock({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	cannonShape: new CANNON.Cylinder(0.25, 0.25, 0.1, 32),
	geometry: new THREE.CylinderGeometry(0.25, 0.25, 0.12, 32),
	mass: 10,
	loader: gltfloader,
	name: 'roborock',
	width: 0.5,
	height: 0.1,
	depth: 0.5,
	x: -1,
	modelSrc: './models/vaccum.glb'
});

const magazine = new MeshObject({
	scene,
	cannonWorld,
	cannonMaterial: defaultCannonMaterial,
	mass: 0.5,
	loader: textureLoader,
	name: 'magazine',
	width: 0.2,
	height: 0.02,
	depth: 0.29,
	x: 0.7,
	y: 1.32,
	z: -2.2,
	rotationX: THREE.MathUtils.degToRad(52),
	mapSrc: './models/magazine.jpg'
});

const player = new Player({
	scene,
	cannonWorld,
	cannonMaterial: playerCannonMaterial,
	mass: 50,
	z: 1.5
});

cannonObject.push(ground, floor, wall1, wall2, desk, lamp, roborock, magazine);

// 모바일 버전
let device;
function setDevice() {
	const htmlEl = document.querySelector('html');
	if ('ontouchstart' in document.documentElement && window.innerWidth < 1280) {
		device = 'mobile';
		htmlEl.classList.remove('no-touchevents');
		htmlEl.classList.add('touchevents');
	} else {
		device = 'desktop';
		htmlEl.classList.remove('touchevents');
		htmlEl.classList.add('no-touchevents');
	}
}

function setLayout() {
	setDevice();
	if (device === 'mobile') {
		touchController.setPosition();
	}

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function move() {
	if (keyController.keys['KeyW'] || keyController.keys['ArrowUp']) {
		player.walk(-0.05, 'forward');
	}
	if (keyController.keys['KeyS'] || keyController.keys['ArrowDown']) {
		player.walk(0.05, 'backward');
	}
	if (keyController.keys['KeyA'] || keyController.keys['ArrowLeft']) {
		player.walk(0.05, 'left');
	}
	if (keyController.keys['KeyD'] || keyController.keys['ArrowRight']) {
		player.walk(0.05, 'right');
	}
}

function moveMobile() {
	if (!touchController.walkTouch) return false; // 컨트롤러에 손을 대는 동안만 moveMobile 실행

	const cx = touchController.cx;
	const cy = touchController.cy;
	const yy = touchController.walkTouch.clientY - cy;
	const xx = touchController.walkTouch.clientX - cx;
	const angle = Math.atan2(-yy, xx);
	const angle2 = Math.atan2(yy, xx);

	player.walkMobile(delta * 2, angle);

	touchController.setAngleOfBar(angle2);
}

let movementX = 0;
let movementY = 0;
function updateMovementValue(event) {
	movementX = event.movementX * delta;
	movementY = event.movementY * delta;
	// console.log('x:' + e.movementX);
	// console.log('x:' + e.movementY);
}

const euler = new THREE.Euler(0, 0, 0, 'YXZ');
const minPolarAngle = 0;
const maxPolarAngle = Math.PI;
function moveCamera() {
	let factor = delta * 50;
	if (device === 'mobile') {
		factor = delta * 0.3;
	}

	// rotation
	euler.setFromQuaternion(camera.quaternion);
	euler.y -= movementX * factor;
	euler.x -= movementY * factor;
	euler.x = Math.max(Math.PI/2 - maxPolarAngle, Math.min(Math.PI/2 - minPolarAngle, euler.x));
	
	movementX -= movementX * 0.1;
	movementY -= movementY * 0.1;
	if (Math.abs(movementX) < 0.1) movementX = 0;
	if (Math.abs(movementY) < 0.1) movementY = 0;

	camera.quaternion.setFromEuler(euler);
	player.rotationY = euler.y;

	// position
	camera.position.x = player.x;
	camera.position.y = player.y + 1;
	camera.position.z = player.z;
}

function setMode(mode) {
	document.body.dataset.mode = mode;

	if (mode === 'game') {
		// mousemove: 순간 순간 마우스를 움직인 거리
		document.addEventListener('mousemove', updateMovementValue);
	} else if (mode === 'website') {
		document.removeEventListener('mousemove', updateMovementValue);
	}
}

// Raycasting
const mouse = new THREE.Vector2(); // x: 0, y: 0
const raycaster = new THREE.Raycaster();
function checkIntersects() {
	raycaster.setFromCamera(mouse, camera);

	const intersects = raycaster.intersectObjects(scene.children);
	for (const item of intersects) {
		console.log(item.object.name);
		// 각 모델 클릭 시 동작할 코드 작성
		if (item.object.name === 'lamp') {
			lamp.togglePower();
			break;
		} else if (item.object.name === 'roborock') {
			roborock.togglePower();
			break;
		}
	}
}

// Draw
const clock = new THREE.Clock();
let delta;
function draw() {
	delta = clock.getDelta();

	let cannonStepTime = 1/60;
	if (delta < 0.01) cannonStepTime = 1/120;
	cannonWorld.step(cannonStepTime, delta, 3); // 3번째 인자는 움직임에 차이가 생길 경우 보정을 시도하는 횟수

	for (const obj of cannonObject) {
		if (obj.cannonBody) {
			// console.log(obj.name);
			obj.mesh.position.copy(obj.cannonBody.position);
			obj.mesh.quaternion.copy(obj.cannonBody.quaternion);
			if (obj.transparentMesh) {
				obj.transparentMesh.position.copy(obj.cannonBody.position);
				obj.transparentMesh.quaternion.copy(obj.cannonBody.quaternion);
			}
		}
	}

	if (player.cannonBody) {
		player.mesh.position.copy(player.cannonBody.position);
		player.x = player.cannonBody.position.x;
		player.y = player.cannonBody.position.y;
		player.z = player.cannonBody.position.z;

		if (device === 'mobile') {
			moveMobile();
		} else {
			move();
		}
	}

	moveCamera();
	roborock.move();

	renderer.render(scene, camera);
	renderer.setAnimationLoop(draw);
}

setDevice();
setMode('website');
draw();

// Events
window.addEventListener('resize', setLayout);

document.addEventListener('click', () => {
	if (device === 'mobile') return false;
	canvas.requestPointerLock();
});

canvas.addEventListener('click', e => {
	// 모바일에서는 가운데가 아닌 터치하는 위치가 필요
	if (device === 'mobile') {
		mouse.x = e.clientX / canvas.clientWidth * 2 - 1;
		mouse.y = -(e.clientY / canvas.clientHeight * 2 - 1);
		checkIntersects();
	} else {
		mouse.x = 0;
		mouse.y = 0;
		if (document.body.dataset.mode === 'game') {
			checkIntersects();
		}
	}
});

document.addEventListener('pointerlockchange', () => {
	if (document.pointerLockElement === canvas) {
		setMode('game');
	} else {
		setMode('website');
	}
});

// 터치 이벤트
const touchX = [];
const touchY = [];
window.addEventListener('touchstart', e => {
	if (e.target === touchController.elem) return false;

	movementX = 0;
	movementY = 0;

	touchX[0] = e.targetTouches[0].clientX;
	touchX[1] = e.targetTouches[0].clientX;
	touchY[0] = e.targetTouches[0].clientY;
	touchY[1] = e.targetTouches[0].clientY;
});

window.addEventListener('touchmove', e => {
	if (e.target === touchController.elem) return false;

	movementX = 0;
	movementY = 0;

	touchX[0] = touchX[1];
	touchX[1] = e.targetTouches[0].clientX;
	touchY[0] = touchY[1];
	touchY[1] = e.targetTouches[0].clientY;

	movementX = touchX[1] - touchX[0]; // 손가락을 움직인 거리를 계산 느리게 움직이면 작은 수 빠르면 큰 수
	movementY = touchY[1] - touchY[0];
});

window.addEventListener('touchend', e => {
	if (e.target === touchController.elem) return false;

	movementX = 0;
	movementY = 0;
	touchX[0] = touchX[1] = 0;
	touchY[0] = touchY[1] = 0;
});

window.addEventListener('gesturestart', e => {
	e.preventDefault();
});
window.addEventListener('gesturechange', e => {
	e.preventDefault();
});
window.addEventListener('gestureend', e => {
	e.preventDefault();
});