import { Flip, isHeteroriented } from "./types"

export type Size = {w: number, h: number}
type Length = [ a: number, b: number ]
type ScalerFn = (w: Length, h: Length) => Size
type MashalledSize = {pxW: number, pxH: number, cmW?: string, cmH?: string}

// The standard UK postcard's longest side is 14.8cm
const fallBackLongestSide: Length = [148, 10]

export class DoubleSidedSize {
  physical?: string
  isHeteroriented: boolean
  
  private fw: Length
  private fh:  Length
  private biggest: Length | undefined
  private scaler!: ScalerFn

  constructor(size: MashalledSize, flip: Flip) {
    if (typeof size !== 'object' || typeof size.pxW !== 'number' || typeof size.pxH !== 'number') {
      throw 'Missing size attribute'
    }
    this.isHeteroriented = isHeteroriented(flip)

    if (size.cmW && size.cmH) {
      this.fw = parseRational(size.cmW)
      this.fh = parseRational(size.cmH)
      this.physical = `${rationalString(this.fw)}cm x ${rationalString(this.fh)}cm`

      if ((this.fw[0] / this.fw[1]) > (this.fh[0] / this.fh[1])) {
        this.biggest = this.fw
      } else {
        this.biggest = this.fh
      }
    } else {
      this.biggest = fallBackLongestSide
      
      if (size.pxW > size.pxH) {
        this.fw = this.biggest
        this.fh = [this.biggest[0] * size.pxH, this.biggest[1] * size.pxW]
      } else {
        this.fh = this.biggest
        this.fw = [this.biggest[0] * size.pxW, this.biggest[1] * size.pxH]
      }
    }

    this.setBounds({ w: size.pxW, h: size.pxH })
  }

  front(): Size {
    return this.scaler(this.fw, this.fh)
  }

  back(): Size {
    const bw = (this.isHeteroriented) ? this.fh : this.fw
    const bh = (this.isHeteroriented) ? this.fw : this.fh
    return this.scaler(bw, bh)
  }

  // For homoriented postcards, this will be the same size as the front (and the back)
  // For heteroriented postcards, this will be a square of side equal to the largest side of the front
  outer(): Size {
    const ow = (this.isHeteroriented) ? this.biggest! : this.fw
    const oh = (this.isHeteroriented) ? this.biggest! : this.fh
    return this.scaler(ow, oh)
  }

  // Takes a bounding box and provides a function which scales the sizes stored
  // within this class to fit entirely within the bounding box.
  setBounds(bounds?: Size | number) {
    if (!bounds || (typeof bounds !== 'number' && !bounds.w && !bounds.h)) {
      bounds = 100
    }

    let scaleFactor: number
    if (typeof bounds === 'number') {
      // https://www.smashingmagazine.com/2021/07/css-absolute-units/#:~:text=1cm%20%3D
      scaleFactor = (bounds/100) * 37.7952756 * window.devicePixelRatio
    } else if (this.isHeteroriented) {
      let maxBound = bounds.w
      if (!maxBound || bounds.h > bounds.w) {
        maxBound = bounds.h
      }
      scaleFactor = this.biggest![1] * maxBound / this.biggest![0]
    } else {
      const scaleW = this.fw[1] * bounds.w / this.fw[0]
      const scaleH = this.fh[1] * bounds.h / this.fh[0]      
      scaleFactor = (!scaleW || scaleH > scaleW) ? scaleH : scaleW
    }

   this.scaler = (w: Length, h: Length) => ({
      w: w[0] * scaleFactor / w[1],
      h: h[0] * scaleFactor / h[1],
    })
  }
}

const ratLengthFormat = /^(\d+)\/(\d+)$/

const parseRational = (ratLength: string): [number, number] => {
  const m = ratLength.match(ratLengthFormat)
  if (!m) {
    throw `invalid rational length: ${ratLength}`
  }

  return [parseInt(m[1]), parseInt(m[2])]
}

const rationalString = (rat: [number, number]): string => (rat[0] / rat[1]).toFixed(1)