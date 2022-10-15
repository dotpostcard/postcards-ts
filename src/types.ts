import { DoubleSidedSize } from "./size"

type NotEmpty<T> = {} extends T ? never : T

export enum Flip {
  Book = "book",
  LeftHand = "left-hand",
  Calendar = "calendar",
  RightHand = "right-hand",
}

export type Person = NotEmpty<{
  name?: string;
  uri?: string;
}>

export type Context = {
  author: Person;
  description: LocalizedText;
}

export const isHeteroriented = (flip: Flip): boolean => {
  return flip == Flip.LeftHand || flip == Flip.RightHand
}

export type Metadata = {
  location: [
    latitude: number,
    longitude: number,
  ],
  flip: Flip,
  size: DoubleSidedSize,
  sentOn: Date,
  sender: Person,
  recipient: Person,
  front: SideDetails,
  back: SideDetails,
  context?: Context,
}

export type SideDetails = {
  description: LocalizedText,
  transcription: LocalizedText,
  secrets: Polygon[]
}

// A standard locale code — ISO 639-1, a dash, ISO 3166-1 alpha 2, eg. en-GB, es-VE
export type Locale = string

export class LocalizedText {
  _innerMap: Map<Locale, string>
  originalLocale?: Locale
  originalText?: string

  constructor(localizedText: {[key: string]: string}) {
    this.originalLocale = localizedText.original
    this.originalText = this.originalLocale && localizedText[this.originalLocale]
    this._innerMap = new Map(Object.entries(localizedText))
  }

  pickBest(preferredLocales: Locale[] = [], preferOriginal: boolean = true): [string, Locale] | null {
    const pickOriginal = (preferredLocales.length === 0) || preferOriginal
    if (pickOriginal && this.originalLocale && this.originalText) {
      return [this.originalText, this.originalLocale]
    }
    
    if (preferredLocales.length === 0) {
      const it = this._innerMap.entries()
      const {value: [locale, text]} = it.next()
      return [text, locale]
    }
    
    let languages: string[] = []
    for (let locale of preferredLocales) {
      if (this._innerMap.has(locale)) {
        return [this._innerMap.get(locale)!, locale]
      }
      languages.push(locale.split('-')[0])
    }

    for (let [locale, text] of this._innerMap.entries()) {
      if (languages.includes(locale.split('-')[0])) {
        return [text, locale]
      }
    }

    return null
  }
}

export type Polygon = [
  xPercent: number,
  yPercent: number
][]

export interface Postcard {
  version: string;
  metadata: Metadata;
  frontData: Promise<Uint8Array>;
  backData: Promise<Uint8Array>;
}
