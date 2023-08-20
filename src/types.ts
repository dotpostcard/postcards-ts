import { Size } from "./size"

export enum Flip {
  Book = "book",
  LeftHand = "left-hand",
  Calendar = "calendar",
  RightHand = "right-hand",
}

export type Person = {
  name: string;
  uri?: string;
}

export type Context = {
  author: Person;
  description: string;
}

export const isHeteroriented = (flip: Flip): boolean => {
  return flip == Flip.LeftHand || flip == Flip.RightHand
}

type LatLong = Required<{
  latitude: number,
  longitude: number,
}>

export type Metadata = {
  locale: Locale;
  location?: { name: string } | { name: string } & LatLong,
  flip: Flip,
  size: Size,
  sentOn?: Date,
  sender?: Person,
  recipient?: Person,
  front: SideDetails,
  back: SideDetails,
  context?: Context,
}

export type SideDetails = {
  description?: string,
  transcription?: string,
  secrets?: Polygon[]
}

// A standard locale code — ISO 639-1, a dash, ISO 3166-1 alpha 2, eg. en-GB, es-VE
export type Locale = string

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
