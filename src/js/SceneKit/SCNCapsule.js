'use strict'

import SCNGeometry from './SCNGeometry'
import SCNGeometryElement from './SCNGeometryElement'
import SCNGeometryPrimitiveType from './SCNGeometryPrimitiveType'
import SCNGeometrySource from './SCNGeometrySource'
import SCNMaterial from './SCNMaterial'
import SCNVector3 from './SCNVector3'

/**
 * A right circular cylinder geometry whose ends are capped with hemispheres.
 * @access public
 * @extends {SCNGeometry}
 * @see https://developer.apple.com/documentation/scenekit/scncapsule
 */
export default class SCNCapsule extends SCNGeometry {
  static get _propTypes() {
    return {
      capsulecapRadius: ['float', 'capRadius'],
      capsulecapSegmentCount: ['integer', 'capSegmentCount'],
      capsuleheight: ['float', null],
      capsuleheightSegmentCount: ['integer', null],
      capsuleprimitiveType: ['integer', null],
      capsuleradialSegmentCount: ['integer', 'radialSegmentCount'],
      materials: 'NSArray',
      subdivisionLevel: 'integer',
      subdivisionSettings: ['bytes', null],
      tessellator: 'SCNGeometryTessellator',
      wantsAdaptiveSubdivision: 'boolean'
    }
  }

  // Creating a Capsule

  /**
   * Creates a capsule geometry with the specified radius and height.
   * @access public
   * @constructor
   * @param {number} capRadius - The radius both of the capsule’s cylindrical body and of its hemispherical ends.
   * @param {number} height - The height of the capsule along the y-axis of its local coordinate space.
   * @desc The capsule is centered in its local coordinate system. For example, if you create a capsule whose cap radius is 5.0 and height is 20.0, it extends from -10.0 to 10.0 in the y-axis, and the circular cross section at the center of its body extends from -5.0 to 5.0 along the x- and z-axes.
   * @see https://developer.apple.com/documentation/scenekit/scncapsule/1523790-init
   */
  constructor(capRadius = 0.5, height = 2.0) {
    super([], [])

    // Adjusting a Capsule’s Dimensions

    /**
     * The radius both of the capsule’s circular center cross section and of its hemispherical ends. Animatable.
     * @type {number}
     * @see https://developer.apple.com/documentation/scenekit/scncapsule/1523926-capradius
     */
    this.capRadius = capRadius

    /**
     * The extent of the capsule along its y-axis. Animatable.
     * @type {number}
     * @see https://developer.apple.com/documentation/scenekit/scncapsule/1522789-height
     */
    this.height = height


    // Adjusting Geometric Detail

    /**
     * The number of subdivisions around the lateral circumference of the capsule. Animatable.
     * @type {number}
     * @see https://developer.apple.com/documentation/scenekit/scncapsule/1522735-radialsegmentcount
     */
    this.radialSegmentCount = 24

    /**
     * The number of subdivisions in the height of each hemispherical end of the capsule. Animatable.
     * @type {number}
     * @see https://developer.apple.com/documentation/scenekit/scncapsule/1523561-capsegmentcount
     */
    this.capSegmentCount = 48

    /**
     * The number of subdivisions in the sides of the capsule along its y-axis. Animatable.
     * @type {number}
     * @see https://developer.apple.com/documentation/scenekit/scncapsule/1523697-heightsegmentcount
     */
    this.heightSegmentCount = 1

    this._createGeometry()
    this.materials.push(new SCNMaterial())
  }

  _createGeometry() {
    const sourceData = []
    const indexData = []
    const vectorCount = (this.radialSegmentCount * 2 + 1) * (this.capSegmentCount + 4)
    //const primitiveCount = this.radialSegmentCount * this.capSegmentCount * 4

    const yNom = []
    const ySin = []
    for(let lat=0; lat<=this.capSegmentCount; lat++){
      yNom.push(-Math.cos(Math.PI * lat / this.capSegmentCount))
      ySin.push(Math.sin(Math.PI * lat / this.capSegmentCount))
    }

    const cylinderHeight = this.height - this.capRadius * 2
    const hemiLen = this.capSegmentCount / 2
    const rad2 = this.radialSegmentCount * 2
    for(let lng=0; lng<=rad2; lng++){
      const x = -Math.sin(2.0 * Math.PI * lng / rad2)
      const z = -Math.cos(2.0 * Math.PI * lng / rad2)
      const tx = lng / rad2
      let y = -cylinderHeight * 0.5
      for(let lat=0; lat<=hemiLen; lat++){
        const xNom = x * ySin[lat]
        const zNom = z * ySin[lat]

        // vertex
        sourceData.push(xNom * this.capRadius, y + yNom[lat] * this.capRadius, zNom * this.capRadius)

        // normal
        sourceData.push(xNom, yNom[lat], zNom)

        // texcoord
        sourceData.push(tx, 1.0 - 0.25 * lat / hemiLen)

        if(lat === hemiLen){
          // put the same data again
          sourceData.push(xNom * this.capRadius, y + yNom[lat] * this.capRadius, zNom * this.capRadius)
          sourceData.push(xNom, yNom[lat], zNom)
          sourceData.push(tx, 1.0 - 0.25 * lat / hemiLen)
        }
      }

      y = cylinderHeight * 0.5
      for(let lat=hemiLen; lat<=this.capSegmentCount; lat++){
        const xNom = x * ySin[lat]
        const zNom = z * ySin[lat]

        // vertex
        sourceData.push(xNom * this.capRadius, y + yNom[lat] * this.capRadius, zNom * this.capRadius)

        // normal
        sourceData.push(xNom, yNom[lat], zNom)

        // texcoord
        sourceData.push(tx, 0.50 - 0.25 * lat / hemiLen)

        if(lat === hemiLen){
          // put the same data again
          sourceData.push(xNom * this.capRadius, y + yNom[lat] * this.capRadius, zNom * this.capRadius)
          sourceData.push(xNom, yNom[lat], zNom)
          sourceData.push(tx, 0.50 - 0.25 * lat / hemiLen)
        }
      }
    }

    // index
    const capLen = this.capSegmentCount
    const radLen = this.radialSegmentCount * 2 + 1
    for(let i=0; i<capLen; i++){
      let index1 = i * (this.capSegmentCount + 4)
      let index2 = index1 + this.capSegmentCount + 5

      indexData.push(index1, index2, index1 + 1)
      index1 += 1
      for(let j=0; j<radLen; j++){
        if(Math.abs(j - this.radialSegmentCount) !== 1){
          indexData.push(index1, index2 + 1, index1 + 1)
          indexData.push(index1, index2, index2 + 1)
        }
        index1 += 1
        index2 += 1
      }
      indexData.push(index1, index2, index2 + 1)
    }

    const vertexSource = new SCNGeometrySource(
      sourceData, // data
      SCNGeometrySource.Semantic.vertex, // semantic
      vectorCount, // vectorCount
      true, // floatComponents
      3, // componentsPerVector
      4, // bytesPerComponent
      0, // offset
      32 // sride
    )

    const normalSource = new SCNGeometrySource(
      sourceData, // data
      SCNGeometrySource.Semantic.normal, // semantic
      vectorCount, // vectorCount
      true, // floatComponents
      3, // componentsPerVector
      4, // bytesPerComponent
      12, // offset
      32 // stride
    )

    const texcoordSource = new SCNGeometrySource(
      sourceData, // data
      SCNGeometrySource.Semantic.texcoord, // semantic
      vectorCount, // vectorCount
      true, // floatComponents
      2, // componentsPerVector
      4, // bytesPerComponent
      24, // offset
      32 // stride
    )

    const element = new SCNGeometryElement(indexData, SCNGeometryPrimitiveType.triangles)

    this._geometryElements = [element]
    this._geometrySources = [vertexSource, normalSource, texcoordSource]

    this.boundingBox = {
      min: new SCNVector3(-this.capRadius, -this.height * 0.5, -this.capRadius),
      max: new SCNVector3(this.capRadius, this.height * 0.5, this.capRadius)
    }
  }

  /**
   * @access private
   * @returns {Ammo.btCollisionShape} -
   * @desc call Ammo.destroy(shape) after using it.
   */
  _createBtCollisionShape() {
    //const height = (this.height - this.capRadius) * 0.5
    //const shape = new Ammo.btCapsuleShape(this.capRadius, height)
    //return shape
  }

  /**
   * The center point and radius of the object’s bounding sphere.
   * @type {Object}
   * @parameter {SCNVector3} _boundingSphere.center -
   * @parameter {number} _boundingSphere.radius -
   * @returns {Object} -
   * @desc Scene Kit defines a bounding sphere in the local coordinate space using a center point and a radius. For example, if a node’s bounding sphere has the center point {3, 1, 4} and radius 2.0, all points in the vertex data of node’s geometry (and any geometry attached to its child nodes) lie within 2.0 units of the center point.The coordinates provided when reading this property are valid only if the object has a volume to be measured. For a geometry containing no vertex data or a node containing no geometry (and whose child nodes, if any, contain no geometry), the values center and radius are both zero.
   * @see https://developer.apple.com/documentation/scenekit/scnboundingvolume/2034707-boundingsphere
   */
  getBoundingSphere() {
    const c = new SCNVector3(0, 0, 0)
    const r = this.height * 0.5

    return { center: c, radius: r }
  }

  _updateBoundingBoxForSkinner(skinner = null){
    if(skinner === null){
      return this.boundingBox
    }
    return super._updateBoundingBoxForSkinner(skinner)
  }
}
