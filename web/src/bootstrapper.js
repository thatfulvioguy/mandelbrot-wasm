
if (typeof WebAssembly !== 'object') {
  document.getElementById('root').insertAdjacentHTML('afterbegin', `
    <div>
      <p>This uses WebAssembly, but your browser doesn&apos;t seem to support it.</p>
      <p>
        Please make sure you&apos;re using an up to date version of a web browser that would support it, like Firefox,
        Chrome or Safari. Even the mobile versions should be fine.
      </p>
    </div>
  `)
} else {
  import('./main')
    .then(main => {
      main.start()
    })
}
