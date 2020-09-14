import "./styles.css"
import * as THREE from "three"
import * as d3 from "d3"
import Stats from "stats.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader"
import * as topojson from "topojson"
// data
// import world from "./data/countries-50m.json"
//import land10m from "./data/land-10m.json";
import countryCodes from "./data/country-codes.json"
import delay from "delay"

export default async () => {
  let camera, scene, renderer, controls
  let projection
  const updateListeners = []

  const mapRawData = await (await fetch("/countries-50m.json")).json()
  console.log(mapRawData)

  //console.log(world);
  // let mapData = topojson.feature(world, world.objects.countries).features
  let mapData = topojson.feature(mapRawData, mapRawData.objects.countries).features
  console.log(mapData)

  function getCountryCode(alpha3) {
    return countryCodes.find((i) => i["alpha-3"] == alpha3)["country-code"]
  }

  const stats = new Stats()
  document.body.appendChild(stats.dom)

  async function init() {
    // camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100000)
    camera = new THREE.OrthographicCamera(
      window.innerWidth / -2,
      window.innerWidth / 2,
      window.innerHeight / 2,
      window.innerHeight / -2,
      0.1,
      10000
    )

    scene = window.mapScene = new THREE.Scene()
    scene.background = new THREE.Color(0x001a48)
    //scene.fog = new THREE.Fog(0xffffff, 0, 750);

    var light = new THREE.PointLight(0xffffff, 1, 100)
    light.position.set(20, 30, 22)
    scene.add(light)

    // var light = new THREE.AmbientLight(0xff0000, 10, 100);
    // light.position.set(30, 30, 30);
    // scene.add(light);

    renderer = new THREE.WebGLRenderer({ antialias: true })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    window.addEventListener("resize", onWindowResize, false)

    controls = new OrbitControls(camera, renderer.domElement)

    var geometry = new THREE.BoxBufferGeometry(1, 1, 1)
    var material = new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    var cube = new THREE.Mesh(geometry, material)
    scene.add(cube)

    let svgString

    // svgString = `
    // <svg width="28" height="10" viewBox="0 0 28 10" fill="none" xmlns="http://www.w3.org/2000/svg">
    // <path d="M6.88477 1.39453H4.14258V9H3.02344V1.39453H0.287109V0.46875H6.88477V1.39453Z" fill="black"/>
    // <path d="M12.9727 5.05664H9.27539V8.08008H13.5703V9H8.15039V0.46875H13.5117V1.39453H9.27539V4.13672H12.9727V5.05664Z" fill="black"/>
    // <path d="M17.4844 5.19727C16.5195 4.91992 15.8164 4.58008 15.375 4.17773C14.9375 3.77148 14.7188 3.27148 14.7188 2.67773C14.7188 2.00586 14.9863 1.45117 15.5215 1.01367C16.0605 0.572266 16.7598 0.351562 17.6191 0.351562C18.2051 0.351562 18.7266 0.464844 19.1836 0.691406C19.6445 0.917969 20 1.23047 20.25 1.62891C20.5039 2.02734 20.6309 2.46289 20.6309 2.93555H19.5C19.5 2.41992 19.3359 2.01562 19.0078 1.72266C18.6797 1.42578 18.2168 1.27734 17.6191 1.27734C17.0645 1.27734 16.6309 1.40039 16.3184 1.64648C16.0098 1.88867 15.8555 2.22656 15.8555 2.66016C15.8555 3.00781 16.002 3.30273 16.2949 3.54492C16.5918 3.7832 17.0938 4.00195 17.8008 4.20117C18.5117 4.40039 19.0664 4.62109 19.4648 4.86328C19.8672 5.10156 20.1641 5.38086 20.3555 5.70117C20.5508 6.02148 20.6484 6.39844 20.6484 6.83203C20.6484 7.52344 20.3789 8.07812 19.8398 8.49609C19.3008 8.91016 18.5801 9.11719 17.6777 9.11719C17.0918 9.11719 16.5449 9.00586 16.0371 8.7832C15.5293 8.55664 15.1367 8.24805 14.8594 7.85742C14.5859 7.4668 14.4492 7.02344 14.4492 6.52734H15.5801C15.5801 7.04297 15.7695 7.45117 16.1484 7.75195C16.5312 8.04883 17.041 8.19727 17.6777 8.19727C18.2715 8.19727 18.7266 8.07617 19.043 7.83398C19.3594 7.5918 19.5176 7.26172 19.5176 6.84375C19.5176 6.42578 19.3711 6.10352 19.0781 5.87695C18.7852 5.64648 18.2539 5.41992 17.4844 5.19727Z" fill="black"/>
    // <path d="M27.9902 1.39453H25.248V9H24.1289V1.39453H21.3926V0.46875H27.9902V1.39453Z" fill="black"/>
    // </svg>

    // `;

    const countryData = mapData.find((i) => i.id === getCountryCode("FRA"))
    svgString = `<svg xmlns="http://www.w3.org/2000/svg">`
    projection = d3.geoMercator().scale(10).translate([0, 0])
    const computeSvgPath = d3.geoPath().projection(projection)

    for (const country of mapData) {
      svgString += `<path d="${computeSvgPath(country)}"/>`
    }

    // console.log(svgString)

    const pathMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      opacity: 1,
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
      // wireframe: true
    })

    var group = new THREE.Group()
    // group.scale.multiplyScalar(0.1);
    group.scale.y *= -1

    const { paths } = new SVGLoader().parse(svgString)
    for (const path of paths) {
      for (const shape of path.toShapes(true)) {
        const pathMaterial = new THREE.MeshBasicMaterial({
          //color: 0x001a48,
          color: 0x002478,
          opacity: 0.3 + Math.random() * 0.7,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false,
          // wireframe: true
        })

        var mesh = new THREE.Mesh(new THREE.ShapeBufferGeometry(shape), pathMaterial)
        group.add(mesh)
      }
    }
    scene.add(group)

    // zoom to paris
    const { x, y } = reverseProjection({ lat: 48.8534, lng: 2.3488 })

    // room to estados
    // console.log(reverseProjection({ lat: -54.720372, lng: -63.808354 }))
    // const { x, y } = reverseProjection({ lat: -54.720372, lng: -63.808354 })

    camera.position.x = x
    camera.position.y = y
    camera.position.z = 30
    camera.zoom = 300
    camera.updateProjectionMatrix()
    camera.lookAt(new THREE.Vector3(x, y, 0))

    renderLoop()
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()

    renderer.setSize(window.innerWidth, window.innerHeight)
  }

  let dt = 0
  let lastRenderTime = new Date().getTime()

  async function renderLoop() {
    //controls.update();
    stats.begin()
    dt = new Date().getTime() - lastRenderTime
    if (dt > 10000) {
      dt = 1000 / 60
    }
    for (const updateListener of updateListeners) {
      updateListener(dt)
    }
    renderer.render(scene, camera)
    lastRenderTime = new Date().getTime()
    stats.end()
    requestAnimationFrame(renderLoop)
    // await delay(1000/10)
    // renderLoop()
  }

  function reverseProjection({ lat, lng }) {
    const [x, y] = projection([lng, lat])
    return { x, y: -y }
  }

  init()

  return {
    addMesh(mesh) {
      scene.add(mesh)
    },
    onUpdate(fn) {
      updateListeners.push(fn)
    },
    reverseProjection,
    panTo() {
      alert("todo")
    },
  }
}
