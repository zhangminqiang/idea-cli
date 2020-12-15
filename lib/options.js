const path = require('path')
const metadata = require('read-metadata')
const exists = require('fs').existsSync

/**
 * Read prompts metadata.
 *
 * @param {String} dir
 * @return {Object}
 */

module.exports = function options (name, dir) {
  const opts = getMetadata(name, dir)

  return opts
}

/**
 * Gets the metadata from either a meta.json or meta.js file.
 *
 * @param  {String} dir
 * @return {Object}
 */

function getMetadata (name, dir) {
  const json = path.join(dir, `idea.${name}.meta.json`)
  const js = path.join(dir, `idea.${name}.meta.js`)
  let opts = {}

  if (exists(json)) {
    opts = metadata.sync(json)
  } else if (exists(js)) {
    const req = require(path.resolve(js))
    if (req !== Object(req)) {
      throw new Error(`idea.${name}.meta.js needs to expose an object`)
    }
    opts = req
  }

  return opts
}

