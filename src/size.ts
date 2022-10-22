import { Flip, isHeteroriented } from "./types"

type Rational = [ a: number, b: number ]
type Ratio = [a: number, b: number ]
type MashalledSize = {pxW: number, pxH: number, cmW?: string, cmH?: string}

export class Size {
  isHeteroriented: boolean
  pxW: number
  pxH: number
  physical?: string
  cmW?: Rational
  cmH?: Rational

  private frontAspectRatio: Ratio

  constructor(size: MashalledSize, flip: Flip) {
    if (typeof size !== 'object' || typeof size.pxW !== 'number' || typeof size.pxH !== 'number') {
      throw 'Missing size attribute'
    }
    this.isHeteroriented = isHeteroriented(flip)
    this.pxW = size.pxW
    this.pxH = size.pxH
    this.frontAspectRatio = [this.pxW, this.pxH]

    if (size.cmW && size.cmH) {
      this.cmW = parseRational(size.cmW)
      this.cmH = parseRational(size.cmH)
      this.physical = `${rationalString(this.cmW)}cm x ${rationalString(this.cmH)}cm`

      this.frontAspectRatio = [this.cmW[0] * this.cmH[1], this.cmW[1]*this.cmH[0]]
    }

    const denom = gcd(this.frontAspectRatio[0], this.frontAspectRatio[1])
    this.frontAspectRatio = [this.frontAspectRatio[0] / denom, this.frontAspectRatio[1] / denom]
  }

  aspectRatio(isFront: boolean): Ratio {
    if (!this.isHeteroriented || isFront) {
      return this.frontAspectRatio  
    }
    return [this.frontAspectRatio[1], this.frontAspectRatio[0]]
    
  }

  css(isFront: boolean): { width: string, height: string, margin: string} {
    if (!this.isHeteroriented) {
      return {
        width: '100%',
        height: '100%',
        margin: '0 0'
      }
    }

    const [x, y] = this.aspectRatio(isFront)
    if (x > y) {
      const pc = y/x
      return {
        width: '100%',
        height: `${100*pc}%`,
        margin: `${50 * (1-pc)}% 0`
      }
    } else {
      const pc = x/y
      return {
        width: `${100*pc}%`,
        height: '100%',
        margin: `0 ${50 * (1-pc)}%`
      }
    }
  }
}

const gcd = (a: number, b: number): number => ( (!b) ? a : gcd(b, a % b) )
const ratLengthFormat = /^(\d+)\/(\d+)$/

const parseRational = (ratLength: string): [number, number] => {
  const m = ratLength.match(ratLengthFormat)
  if (!m) {
    throw `invalid rational length: ${ratLength}`
  }

  return [parseInt(m[1]), parseInt(m[2])]
}

const rationalString = (rat: [number, number]): string => (rat[0] / rat[1]).toFixed(1)