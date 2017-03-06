'use strict'

import SCNMatrix4 from './SCNMatrix4'

/**
 * A representation of a four-component vector.
 * @access public
 * @see https://developer.apple.com/reference/scenekit/scnvector4
 */
export default class SCNVector4 {
  // Initializers

  /**
   * 
   * @access public
   * @constructor
   * @param {number} x - 
   * @param {number} y - 
   * @param {number} z - 
   * @param {number} w - 
   * @see https://developer.apple.com/reference/scenekit/scnvector4/1523931-init
   */
  constructor(x, y, z, w) {
    // Instance Properties
    /** @type {number} */
    this.x = x
    /** @type {number} */
    this.y = y
    /** @type {number} */
    this.z = z
    /** @type {number} */
    this.w = w
  }

  // extensions

  /**
   * @access public
   * @param {SCNVector4} v -
   * @returns {SCNVector4} -
   */
  add(v) {
    const r = new SCNVector4()
    r.x = this.x + v.x
    r.y = this.y + v.y
    r.z = this.z + v.z
    r.w = this.w + v.w
    return r
  }

  /**
   * @access public
   * @param {SCNVector4} v -
   * @returns {SCNVector4} -
   */
  sub(v) {
    const r = new SCNVector4()
    r.x = this.x - v.x
    r.y = this.y - v.y
    r.z = this.z - v.z
    r.w = this.w - v.w
    return r
  }

  /**
   * @access public
   * @param {number} n -
   * @returns {SCNVector4} -
   */
  mul(n) {
    const r = new SCNVector4()
    r.x = this.x * n
    r.y = this.y * n
    r.z = this.z * n
    r.w = this.w * n
    return r
  }

  /**
   * @access public
   * @param {SCNVector4} v -
   * @returns {number} -
   */
  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z + this.z * v.z
  }

  /**
   * @access public
   * @param {SCNVecor4} v -
   * @returns {SCNVector4} -
   */
  cross(v) {
    const r = new SCNVector4()
    r.x = this.w * v.x + this.x * v.w + this.y * v.z - this.z * v.y
    r.y = this.w * v.y - this.x * v.z + this.y * v.w + this.z * v.x
    r.z = this.w * v.z + this.x * v.y - this.y * v.x + this.z * v.w
    r.w = this.w * v.w - this.x * v.x - this.y * v.y - this.z * v.z
    return r
  }

  /**
   * @access public
   * @param {SCNVector4} v -
   * @param {number} rate -
   * @returns {SCNVector4} -
   */
  lerp(v, rate) {
    const r = new SCNVector4()
    r.x = this.x + rate * (v.x - this.x)
    r.y = this.y + rate * (v.y - this.y)
    r.z = this.z + rate * (v.z - this.z)
    r.w = this.w + rate * (v.w - this.w)
    return r
  }

  /**
   * @access public
   * @param {SCNVector4} v -
   * @param {number} rate -
   * @returns {SCNVector4} -
   */
  slerp(v, rate) {
    const r = new SCNVector4()
    const qr = this.dot(v)

    if(qr < 0){
      r.x = this.x - (this.x + v.x) * rate
      r.y = this.y - (this.y + v.y) * rate
      r.z = this.z - (this.z + v.z) * rate
      r.w = this.w - (this.w + v.w) * rate
    }else{
      r.x = this.x + (v.x - this.x) * rate
      r.y = this.y + (v.y - this.y) * rate
      r.z = this.z + (v.z - this.z) * rate
      r.w = this.w + (v.w - this.w) * rate
    }
    return r.normalize()
  }

  /**
   * @access public
   * @returns {SCNVector4} -
   */
  normalize() {
    const r = new SCNVector4()
    const sqr = 1.0 / this.length()
    r.x = this.x * sqr 
    r.y = this.y * sqr 
    r.z = this.z * sqr 
    r.w = this.w * sqr 
    return r
  }

  /**
   * @access public
   * @returns {number} -
   */
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w)
  }

  transform(m) {
    const r = new SCNVector4()
    r.x = this.x * m.m11 + this.y * m.m21 + this.z * m.m31 + this.w * m.m41
    r.y = this.x * m.m12 + this.y * m.m22 + this.z * m.m32 + this.w * m.m42
    r.z = this.x * m.m13 + this.y * m.m23 + this.z * m.m33 + this.w * m.m43
    r.w = this.x * m.m14 + this.y * m.m24 + this.z * m.m34 + this.w * m.m44
    return r
  }

  /**
   * @access public
   * @returns {SCNVector4} -
   */
  ln() {
    const r = new SCNVector4()
    const v = this.normalize()

    const n = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z)
    if(n === 0){
      r.x = 0
      r.y = 0
      r.z = 0
      r.w = 0
      return r
    }
    const theta = Math.atan2(n, v.w) / n

    r.x = theta * v.x
    r.y = theta * v.y
    r.z = theta * v.z
    r.w = 0
    return r
  }

  /**
   * @access public
   * @returns {SCNVector4} -
   */
  exp() {
    const r = new SCNVector4()
    const n = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z)
    
    if(n > 0.0){
      const sinn = Math.sin(n)
      r.x = sinn * this.x / n
      r.y = sinn * this.y / n
      r.z = sinn * this.z / n
      r.w = Math.cos(n)
    }else{
      r.x = 0.0
      r.y = 0.0
      r.z = 0.0
      r.w = 1.0
    }
    return r
  }

  /**
   * @access public
   * @returns {SCNMatrix4} -
   */
  rotMatrix() {
    const r = new SCNMatrix4()
    const x2 = this.x * this.x * 2.0
    const y2 = this.y * this.y * 2.0
    const z2 = this.z * this.z * 2.0
    const xy = this.x * this.y * 2.0
    const yz = this.y * this.z * 2.0
    const zx = this.z * this.x * 2.0
    const xw = this.x * this.w * 2.0
    const yw = this.y * this.w * 2.0
    const zw = this.z * this.w * 2.0

    r.m11 = 1.0 - y2 - z2
    r.m12 = xy + zw
    r.m13 = zx - yw
    r.m14 = 0.0
    r.m21 = xy - zw
    r.m22 = 1.0 - z2 - x2
    r.m23 = yz + xw
    r.m24 = 0.0
    r.m31 = zx + yw
    r.m32 = yz - xw
    r.m33 = 1.0 - x2 - y2
    r.m34 = 0.0
    r.m41 = 0.0
    r.m42 = 0.0
    r.m43 = 0.0
    r.m44 = 1.0
    return r
  }

  /**
   * @access public
   * @returns {Float32Array} -
   */
  float32Array() {
    return new Float32Array([this.x, this.y, this.z, this.w])
  }
}