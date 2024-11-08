# Archival

My plans for the .postcard format changed significantly in ealry 2024; please visit [jphastings/dotpostcard](https://github.com/jphastings/dotpostcard) to learn about the significantly simpler tool & ecosystem I switched to building!

# Postcards

A low-level typescript library for reading `.postcard` files in the browser.

If you want to display a `.postcard` file on a webpage, use the [postcard-html](https://github.com/dotpostcard/postcard-html) web component.

## Usage

```ts
import { Postcard, fetchPostcard } from '@dotpostcard/postcards'

const run = async (postcardFileUrl) => {
  const pc: Postcard = await fetchPostcard(postcardFileUrl)

  console.log(pc.metadata.size.front())
  // { w: "14.8cm", h: "10.5cm" }
  console.log(pc.metadata.description)
  // { "en-GB": "A polaroid-style framed photo of the Palacio de Cristal in Madrid's Retiro Park in Autumn." }

  const frontData: Uint8Array = await pc.frontData
  const frontUrl: string = URL.createObjectURL(new Blob([frontData]))

  // Show the image on a page
  document.getElementsByTagName('img')[0].src = frontUrl
}

run('https://raw.githubusercontent.com/dotpostcard/postcards-go/main/fixtures/hello.postcard')
```
