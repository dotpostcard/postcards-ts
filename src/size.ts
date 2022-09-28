import { Flip, isHeteroriented } from "./types"

export type Size = {w: number, h: number}
type Length = [ a: number, b: number ]
type ScalerFn = (w: Length, h: Length) => Size

export class DoubleSidedSize {
  fw: Length
  fh:  Length
  biggest: Length | undefined
  isHeteroriented: boolean
  scaler!: ScalerFn

  constructor({ w, h }: {w: string, h: string}, flip: Flip) {
    if (typeof w !== 'string' || typeof h !== 'string') {
      throw 'missing size attribute'
    }

    this.fw = parseRational(w)
    this.fh = parseRational(h)
    this.isHeteroriented = isHeteroriented(flip)

    if (this.isHeteroriented) {
      if ((this.fw[0] / this.fw[1]) > (this.fh[0] / this.fh[1])) {
        this.biggest = this.fw
      } else {
        this.biggest = this.fh
      }
    }

    this.setBounds()
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
      scaleFactor = (!scaleW || scaleW < scaleH) ? scaleW : scaleH
    }

   this.scaler = (w: Length, h: Length) => ({
      w: w[0] * scaleFactor / w[1],
      h: h[0] * scaleFactor / h[1],
    })
  }
}

const ratLengthFormat = /^(\d+)\/(\d+)cm$/

const parseRational = (ratLength: string): [number, number] => {
  const m = ratLength.match(ratLengthFormat)
  if (!m) {
    throw `invalid rational length: ${ratLength}`
  }

  return [parseInt(m[1]), parseInt(m[2])]
}