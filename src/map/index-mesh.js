import createMap from "./map/map"
import * as THREE from "three"
import lerp from "lerp"

console.log(lerp(1, 3, 0.5))
;(async () => {
  const map = createMap()

  function createAttackParticle({ attack }) {
    let alpha = Math.random()
    let speedFactor = 0.5 + Math.random() * 0.5
    const sourceCoords = map.reverseProjection({ lat: attack.source.lat, lng: attack.source.lng })
    const targetCoords = map.reverseProjection({ lat: attack.target.lat, lng: attack.target.lng })
    const currentCoods = { x: sourceCoords.x, y: sourceCoords.y }

    var geometry = new THREE.BoxBufferGeometry(0.1, 0.1, 0.1)
    var material = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.3,
    })
    var mesh = new THREE.Mesh(geometry, material)

    map.addMesh(mesh)

    return {
      update(dt) {
        alpha += (dt * speedFactor) / 500
        if (alpha > 1) {
          alpha = 0
        }
        // console.log(alpha)
        currentCoods.x = lerp(sourceCoords.x, targetCoords.x, alpha)
        currentCoods.y = lerp(sourceCoords.y, targetCoords.y, alpha)
        // console.log(currentCoods.x, currentCoods.y)
        mesh.position.set(currentCoods.x, currentCoods.y, 0)
      },
    }
  }

  const zscalerAttacks = await (await fetch("/zscaler-data.json")).json()
  const attackParticles = []
  for (const attack of zscalerAttacks) {
    // for (let i = 0; i < attack.count/5; i++) {
    //   attackParticles.push(createAttackParticle({ attack }))
    // }
  }
  console.log(attackParticles.length)

  map.onUpdate((dt) => {
    // console.log("onUpdate")
    for (const attackParticle of attackParticles) {
      attackParticle.update(dt)
    }
  })
})()
