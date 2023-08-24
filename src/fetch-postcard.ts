import { Metadata, Postcard } from "./types"
import { ByteReader } from "./bytereader"
import { Size } from "./size"

const checkStatus = (res: Response): Response => {
  if (res.status !== 200) {
    throw 'Unable to load file'
  }
  return res
}

export const fetchPostcard = async (url: string | URL): Promise<Postcard> => {
  const stream = await fetch(url).then(res => checkStatus(res).body)
  if (stream === null) {
    throw new Error(`Unable to retrieve postcard`)
  }

  const r = new ByteReader(stream)

  let postcard = {} as Postcard;

  postcard.frontData = Promise.resolve(await r.readWebP())

  const magicBytes = await r.read(8)
  const magicStr = new TextDecoder().decode(magicBytes)
  if (magicStr !== "postcard") {
    throw new Error(`Not a postcard file; incorrect postcard magic bytes (${magicStr})`)
  }

  const versionBytes = new DataView((await r.read(3)).buffer)
  const major = versionBytes.getUint8(0)
  const minor = versionBytes.getUint8(1)
  const patch = versionBytes.getUint8(2)
  postcard.version = `${major}.${minor}.${patch}`
  
  const metaBytes = await r.readSized()
  const dec = new TextDecoder("utf-8")
  postcard.metadata = processMetadata(JSON.parse(dec.decode(metaBytes)))

  postcard.backData = postcard.frontData.then(() => r.readWebP())

  return postcard
}

const processMetadata = (obj: any): Metadata => {
  const {
    flip, frontSize, sentOn,
    front, back, context,
    ...others
  } = obj

  
  return {
    ...others,
    flip,
    sentOn: sentOn && new Date(sentOn),
    size: new Size(frontSize, flip),
    front: front && {
      description: front.description,
      transcription: front.transcription,
      secrets: front.secrets,
    },
    back: back && {
      description: back.description,
      transcription: back.transcription,
      secrets: back.secrets,
    },
    context: context && {
      author: context.author,
      description: context.description,
    }
  } as Metadata
}
