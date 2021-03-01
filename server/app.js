'use strict'
const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const compression = require('compression')
const serverlessExpressMiddleware = require('@vendia/serverless-express/middleware')
const S3 = require('./aws/s3')
const fs = require('fs-extra')
const VueServerRenderer = require('vue-server-renderer')
const mimeType = require('mime-types')

const app = express()
const router = express.Router()

app.set('view engine', 'pug')

router.use(compression())

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))
router.use(serverlessExpressMiddleware.eventContext())

const s3 = new S3('test-vue-ssr')
const getObject = key =>
  process.NODE_ENV === 'development'
    ? fs
        .readFile(path.join(__dirname, '../web', key))
        .catch(() => s3.getObject(key))
    : s3.getObject(key)

router.get(['/dist/*', '/public/*'], (req, res) => {
  const key = req.path.slice(1)
  console.log(key)
  try {
    getObject(key)
      .then(data => {
        if (!data.Body) return res.status(404).end('Not Found')
        const mime = mimeType.lookup(key)
        console.log(mime)

        res.type(mime || 'text/plain')
        res.end(data.Body)
      })
      .catch(err => {
        console.log(err)
        res.status(404).json(err)
      })
  } catch (err) {
    res.status(500).send('Internal Server Error\n' + JSON.stringify(err))
  }
})

router.get('/favicon.ico', (req, res) => {
  res.redirect('/public/favicon.ico')
})

const renderer = {
  template: null,
  serverBundle: null,
  clientManifest: null,
  renderer: null,
  async renderToString(ctx) {
    if (!this.template) {
      this.template = await fs.readFile('./templates/index.template.html', {
        encoding: 'utf-8'
      })
    }
    if (!this.serverBundle)
      this.serverBundle = JSON.parse(
        (await getObject('dist/vue-ssr-server-bundle.json')).Body.toString()
      )
    if (!this.clientManifest)
      this.clientManifest = JSON.parse(
        (await getObject('dist/vue-ssr-client-manifest.json')).Body.toString()
      )
    if (!this.renderer)
      this.renderer = VueServerRenderer.createBundleRenderer(
        this.serverBundle,
        {
          template: this.template,
          clientManifest: this.clientManifest
        }
      )

    const html = await this.renderer.renderToString(ctx)
    return html
  }
}

router.get('*', (req, res) => {
  const ctx = { url: req.url }
  console.log(ctx)

  renderer
    .renderToString(ctx)
    .then(html => res.type('text/html').end(html))
    .catch(err =>
      err.code === 404
        ? res.status(404).end('Page not found')
        : res.status(500).end(err + '')
    )
})

// The @vendia/serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router)

// Export your express server so you can import it in the lambda function.
module.exports = app
