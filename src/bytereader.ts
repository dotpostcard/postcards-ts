export class ByteReader {
  reader: ReadableStreamDefaultReader<Uint8Array>
  buffer: Uint8Array

  constructor(stream: ReadableStream<Uint8Array>) {
    this.reader = stream.getReader()
    this.buffer = new Uint8Array(0)
  }

  async read(n: number): Promise<Uint8Array> {
    while (this.buffer.byteLength < n) {
      await this.addToBuffer()
    }

    const out = this.buffer.slice(0, n)
    this.buffer = this.buffer.slice(n)

    return out
  }

  async readSized(): Promise<Uint8Array> {
    const data = await this.read(4)
    const size = new DataView(data.buffer).getUint32(0, false)
    return this.read(size)
  }

  async readWebP(): Promise<Uint8Array> {
    const riffData = await this.read(4)
    const riffStr = new TextDecoder().decode(riffData)
    if (riffStr !== 'RIFF') {
      throw new Error(`Invalid WebP (No RIFF header: ${riffStr})`)
    }

    const sizeData = await this.read(4)
    const size = new DataView(sizeData.buffer).getUint32(0, true)

    const webpData = await this.read(size)
  
    const data = new Uint8Array(size + 8)
    data.set(riffData, 0)
    data.set(sizeData, 4)
    data.set(webpData, 8)
  
    return data
  }

  async addToBuffer() {
    const res = await this.reader.read()
    const data = res.value
    if (!data) {
      throw 'Unexpected end of data'
    }

    const newBuffer = new Uint8Array(this.buffer.byteLength + data.byteLength)
    newBuffer.set(this.buffer, 0)
    newBuffer.set(data, this.buffer.byteLength)
    this.buffer = newBuffer
  }
}
