
// This bootstrapper checks for compatibility before we know it's ok to load the rest of the app.
// Crucially, we use no recent language features here so this phase will work even on very old browsers.

import '../css/main.css'

if (typeof WebAssembly !== 'object') {
  document.getElementById('root').insertAdjacentHTML('afterbegin', `
    <div>
      <p>This uses WebAssembly, but your browser doesn&apos;t seem to support it.</p>
      <p>
        Please make sure you&apos;re using an up to date version of a web browser that would support it, like Firefox,
        Chrome or Safari. The mobile versions should also be fine.
      </p>
    </div>
  `)
} else {
  // If we have wasm support, then we can assume the promise support necessary for dynamic imports

  import(/* webpackChunkName: "main" */ './main')
    .then(main => {
      main.start()
    })
  // TODO handle errors
}
