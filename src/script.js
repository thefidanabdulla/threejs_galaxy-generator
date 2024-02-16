import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import GUI from 'lil-gui'

/**
 * Base
 */
// Debug
const gui = new GUI({width: 360})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()


//Galaxy
const parametres = {
  count: 100000,
  size: 0.01,
  radius: 5,
  branches: 3,
  spin: 1,
  randomness: 0.2,
  randomnessPower: 3,
  insideColor: "#ff6030",
  outsideColor: "#1b3984"
}

let geometry = null;
let material = null;
let points = null;
let galaxyContainer = null;



//Group
galaxyContainer = new THREE.Group();
scene.add(galaxyContainer)

const generateGalaxy = () => {
  //Destroy old galaxy
  galaxyContainer.remove(points)

  if(points != null){
    geometry.dispose();
    material.dispose();
    // galaxyContainer.dispose()
    scene.remove(points);
  }

  //Geometry
  geometry = new THREE.BufferGeometry();

  const positions = new Float32Array(parametres.count * 3);
  const colors = new Float32Array(parametres.count * 3);

  const colorInside = new THREE.Color(parametres.insideColor);
  const colorOutside = new THREE.Color(parametres.outsideColor);

  for (let i = 0; i < parametres.count; i++) {

    const i3 = i * 3;

    //position
    const radius = Math.random() * parametres.radius;
    const spinAngle = radius * parametres.spin
    const branchAngle = (i % parametres.branches) / parametres.branches * Math.PI * 2

    const randomX = Math.pow(Math.random(), parametres.randomnessPower) * (Math.random() < 0.5 ? 1 :  - 1)
    const randomY = Math.pow(Math.random(), parametres.randomnessPower) * (Math.random() < 0.5 ? 1 :  - 1)
    const randomZ =  Math.pow(Math.random(), parametres.randomnessPower) * (Math.random() < 0.5 ? 1 :  - 1)

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    //colors

    const mixedColor = colorInside.clone();
    mixedColor.lerp(colorOutside, radius / parametres.radius)

    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    geometry.setAttribute(
      'position',
      new THREE.BufferAttribute(positions, 3)
    )
    geometry.setAttribute(
      'color',
      new THREE.BufferAttribute(colors, 3)
    )

  }

  //Material
  material = new THREE.PointsMaterial({
    size: parametres.size,
    sizeAttenuation: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexColors: true,
  })


  //Points
  points = new THREE.Points(geometry, material);
  // scene.add(points);
  
  galaxyContainer.add(points)
}

generateGalaxy();


gui.add(parametres,'count').min(100).max(1000000).step(100).onFinishChange(generateGalaxy)
gui.add(parametres,'size').min(0.001).max(0.1).step(0.001).onFinishChange(generateGalaxy)
gui.add(parametres,'radius').min(0.01).max(20).step(0.01).onFinishChange(generateGalaxy)
gui.add(parametres,'branches').min(2).max(20).step(1).onFinishChange(generateGalaxy)
gui.add(parametres,'spin').min(- 5).max(5).step(0.001).onFinishChange(generateGalaxy)
gui.add(parametres,'randomness').min(0).max(2).step(0.001).onFinishChange(generateGalaxy)
gui.add(parametres,'randomnessPower').min(0).max(10).step(0.001).onFinishChange(generateGalaxy)
gui.add(parametres,'insideColor').onFinishChange(generateGalaxy)
gui.add(parametres,'outsideColor').onFinishChange(generateGalaxy)

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight
}

window.addEventListener('resize', () => {
  // Update sizes
  sizes.width = window.innerWidth
  sizes.height = window.innerHeight

  // Update camera
  camera.aspect = sizes.width / sizes.height
  camera.updateProjectionMatrix()

  // Update renderer
  renderer.setSize(sizes.width, sizes.height)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 3
camera.position.y = 3
camera.position.z = 3
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () => {
  const elapsedTime = clock.getElapsedTime()

  // Update controls
  controls.update()

  //galaxy rotation
  galaxyContainer.rotation.y = 0.1 * elapsedTime

  // Render
  renderer.render(scene, camera)

  // Call tick again on the next frame
  window.requestAnimationFrame(tick)
}

tick()