const minimatch = require('minimatch')

module.exports = (files, includes, excludes, data, done) => {
  if (!excludes) {
    excludes = []
  }

  excludes.push('idea.*.meta.*')

  // includes为空，默认全部文件
  // excludes排除文件
  const fileNames = Object.keys(files)
  const includesDD = parseIncludes(fileNames, includes)
  const excludesDD = parseExcludes(fileNames, excludes)

  if (includesDD) {
    // 并且存在排除文件
    if (excludesDD) {
      // 移除排除文件
      for (const fileName in includesDD) {
        if (excludesDD[fileName]) {
          delete includesDD[fileName]
          continue
        }
      }
    }

    Object.keys(files).forEach((fileName) => {
      if (!includesDD[fileName]) {
        delete files[fileName]
      }
    })
  } else if (excludesDD) {
    Object.keys(files).forEach((fileName) => {
      // 包含在排除文件中则删除
      if (excludesDD[fileName]) {
        delete files[fileName]
      }
    })
  }

  done()
}

function parseIncludes (fileNames, includes) {
  const includesDD = {
    // '保留文件name': '文件名'
  }

  if (includes && includes.length > 0) {
    for (let j = 0, jLen = includes.length; j < jLen; j++) {
      const m = new minimatch.Minimatch(includes[j], { dot: true })
      const negate = m.negate

      // 有一个包含就包含，但有一个排除就不包含
      for (let i = fileNames.length - 1; i >= 0; i--) {
        const fileName = fileNames[i]
        const save = m.match(fileName)

        // 在排除文件中，直接fileNames里删除
        if (negate) {
          if (!save) {
            if (includesDD.hasOwnProperty(fileName)) {
              delete includesDD[fileName]
            }

            fileNames.splice(i, 1)
          }
          continue
        }

        if (save) {
          includesDD[fileName] = fileName
          continue
        }
      }
    }
  } else {
    return null
  }

  return includesDD
}

function parseExcludes (fileNames, excludes) {
  const excludesDD = {
    // '排除文件name': '文件名'
  }

  if (excludes && excludes.length > 0) {
    for (let j = 0, jLen = excludes.length; j < jLen; j++) {
      const m = new minimatch.Minimatch(excludes[j], { dot: true })
      const negate = m.negate

      for (let i = fileNames.length - 1; i >= 0; i--) {
        const fileName = fileNames[i]
        const val = m.match(fileName)

        // 有排除就排除，但有非排除就不排除
        if (negate) {
          if (!val) {
            if (excludesDD.hasOwnProperty(fileName)) {
              delete excludesDD[fileName]
            }
            fileNames.splice(i, 1)
          }
          continue
        }

        if (val) {
          excludesDD[fileName] = true
          continue
        }
      }
    }
  } else {
    return null
  }

  return excludesDD
}
