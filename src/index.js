import createMap from "./map/map"
import * as THREE from "three"
import lerp from "lerp"
import {MeshLine,MeshLineMaterial} from "three.meshline"

import { QuadraticBezier as QuadraticBezierInterpolation } from "three/src/extras/core/Interpolations.js"

// console.log(QuadraticBezierInterpolation)
;(async () => {
  const map = createMap()

  let particlesGeometry = new THREE.BufferGeometry()
  let particlesPositions = []

  function createAttackParticle({ attack }) {
    let alpha = Math.random()
    let speedFactor = 0.8 + Math.random() * 0.2
    const sourceCoords = map.reverseProjection({ lat: attack.source.lat, lng: attack.source.lng })
    const targetCoords = map.reverseProjection({ lat: attack.target.lat, lng: attack.target.lng })
    const currentCoods = { x: sourceCoords.x, y: sourceCoords.y }

    let verticesStartIndex = particlesPositions.length

    particlesPositions.push(currentCoods.x, currentCoods.y, 1.3)

    return {
      update(dt) {
        alpha += (dt * speedFactor) / 10000
        if (alpha > 1) {
          alpha = 0
        }
        currentCoods.x = lerp(sourceCoords.x, targetCoords.x, alpha)
        currentCoods.y = lerp(sourceCoords.y, targetCoords.y, alpha)

        var positions = particlesGeometry.attributes.position.array
        positions[verticesStartIndex] = currentCoods.x
        positions[verticesStartIndex + 1] = currentCoods.y

        // mesh.position.set(currentCoods.x, currentCoods.y, 0)
      },
    }
  }

  const zscalerAttacks = await (await fetch("/zscaler-data.json")).json()
  const attackParticles = []

  for (const attack of zscalerAttacks) {
    for (let i = 0; i < attack.count / .1; i++) {
      attackParticles.push(createAttackParticle({ attack }))
    }
  }

  console.log(attackParticles.length)

  particlesGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(particlesPositions, 3)
  )
  var particlesMaterial = new THREE.PointsMaterial({ size: 1, color: 0xff00ff })
  // var particlesMaterial = new THREE.PointsMaterial({
  //   size: 10,
  //   sizeAttenuation: false,
  //   map: new THREE.TextureLoader().load(
  //   	"https://threejs.org/examples/textures/sprites/disc.png"
  // 	),
  //   alphaTest: 0.5,
  //   transparent: true
  // });
  // particlesMaterial.color.setHSL(1.0, 0.3, 0.7);

  const points = new THREE.Points(particlesGeometry, particlesMaterial)
  map.addMesh(points)

  map.onUpdate((dt) => {
    // console.log("onUpdate")
    for (const attackParticle of attackParticles) {
      attackParticle.update(dt)
    }
    particlesGeometry.attributes.position.needsUpdate = true
  })


  ;(() => {
  	// return
    var curve = new THREE.QuadraticBezierCurve3(
      new THREE.Vector3(-20, 0, 2),
      new THREE.Vector3(0, 15, 2),
      new THREE.Vector3(20, 0, 2)
    )

    var points = curve.getPoints(40)
    // var geometry = new THREE.BufferGeometry().setFromPoints(points)
    // var material = new THREE.LineBasicMaterial({ color: 0xff00ff, linewidth: 10 })
    // var curveObject = new THREE.Line(geometry, material)
    // map.addMesh(curveObject)

	var geometry = new THREE.Geometry()
	for (const point of points) {
		geometry.vertices.push(point)
	}
	var line = new MeshLine();
	line.setGeometry( geometry );
	line.setGeometry( geometry, p => .003 );
	var material = new MeshLineMaterial({ color: 0xffffff, transparent: true, opacity: .2 });
	var mesh = new THREE.Mesh( line.geometry, material );
	map.addMesh(mesh)




    var mesh = new THREE.Mesh(
      new THREE.BoxBufferGeometry(0.2, 0.2, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    )
    mesh.position.set(
      QuadraticBezierInterpolation(0.34, -20, 0, 20),
      QuadraticBezierInterpolation(0.34, 0, 15, 0),
      0.5
    )
    map.addMesh(mesh)
  })()
})()
