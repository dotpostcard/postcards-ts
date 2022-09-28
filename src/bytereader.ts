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
