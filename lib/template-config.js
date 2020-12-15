
const fs = require('fs')
const path = require('path')
const home = require('user-home')
const logger = require('./logger')
const chalk = require('chalk')

const ideaConfigPath = path.join(home, '.idea-templates', 'idea.config.json')

function getConfig () {
    if (!fs.existsSync(ideaConfigPath)) {
        fs.writeFileSync(ideaConfigPath, JSON.stringify({}));

        return {}
    }

    const config = JSON.parse(fs.readFileSync(ideaConfigPath));

    return config
}

exports.getTemplateConfig = function (key) {
    let config = getConfig()

    return config[key]
}

exports.showTemplate = function (key) {
    let config = getConfig()

    if (key) {
        if (!config[key]) {
        logger.fatal(`未找到${key}模板配置属性`)
        return
        }
        config = config[key]

        logTemplate(key, config)
    } else {
        for(let key in config) {
            logTemplate(key, config[key])
        }
    }
}

function logTemplate (key, config) {
    console.log()
    console.log('repository: ' + chalk.blue(`${key}`) + ' ' + chalk.green(`${config.repository.url}`) + ' ' + chalk.yellow(`${config.directory}`) )
    console.log()
    for (let dest in config.destinationRepository) {
        console.log('destinationRepository: ' + chalk.blue(`${dest}`) + ' ' + chalk.green(`${config.destinationRepository[dest].url}`) + ' ' + chalk.yellow(`${config.destinationRepository[dest].disabled}`))
        console.log()
    }
}

exports.setTemplate = function (key, url, directory) {
    const config = getConfig()

    if (!config[key]) {
        config[key] = {
            repository: {
              url: ''
            },
            destinationRepository: {
            }
        }
    }

    config[key].repository.url = url
    config[key].directory = directory

    writeTemplateFile(config)
    logger.success(`添加${key}模板配置成功`)
}

exports.removeTemplate = function (key) {
    const config = getConfig()

    if (!config[key]) {
        logger.fatal(`未找到${key}模板配置属性`)
        return
    }

    delete config[key]

    writeTemplateFile(config)
    logger.success(`移除${key}模板配置成功`)
}

exports.setTemplateDestination = function (key, dest, url) {
    const config = getConfig()
    if (!config[key]) {
        logger.fatal(`未找到${key}模板配置属性`)
        return
    }

    // 写入发布推送的代码库
    if (!config[key].destinationRepository[dest]) {
        config[key].destinationRepository[dest] = {
            url: '',
            disabled: false
        }
    }
    config[key].destinationRepository[dest].url = url

    writeTemplateFile(config)
    logger.success(`设置${key}模板推送库${dest}配置成功`)
}

exports.removeTemplateDestination = function (key, dest) {
    const config = getConfig()

    if (!config[key] || !config[key].destinationRepository[dest]) {
        logger.fatal(`未找到${key}模板或者${dest}推送库配置属性`)
        return
    }

    delete config[key].destinationRepository[dest]
    writeTemplateFile(config)
    logger.success(`移除${key}模板推送库${dest}配置成功`)
}

function writeTemplateFile (config) {
    fs.writeFileSync(ideaConfigPath, JSON.stringify(config));
}

/**
 * 写入模板配置
 */
exports.writeTmpConfigToIdeaConfig = function (tmpConfig, metadata, src, dest, program) {
    const template = program.args[0]
    const branch = program.branch || 'master'
    const config = getConfig()[template]
    const ideaConfigPath = path.join(dest, 'idea.config.json')

    let ideaConfig

    if (!fs.existsSync(ideaConfigPath)) {
        ideaConfig = {}
    } else {
        ideaConfig = JSON.parse(fs.readFileSync(ideaConfigPath))
    }

    if (!ideaConfig[template]) {
        ideaConfig[template] = {}
    }

    const templateConfig = ideaConfig[template]
    Object.assign(templateConfig, tmpConfig || {}, { 
        // 仓库地址
        repository: config.repository,
        // 模板元数据
        metadata: metadata,
        // 当前分支
        branch: branch
    })

    fs.writeFileSync(ideaConfigPath, JSON.stringify(ideaConfig))
}

exports.updateTmpConfigToIdeaConfig = function (src, dest, program) {
    const template = program.args[0]
    const branch = program.branch || 'master'
    const tmpConfigPath = path.join(src, 'idea.tmp.config.json')
    const ideaConfigPath = path.join(dest, 'idea.config.json')

    let ideaConfig
    let tmpConfig

    if (!fs.existsSync(ideaConfigPath)) {
        ideaConfig = {}
    } else {
        ideaConfig = JSON.parse(fs.readFileSync(ideaConfigPath))
    }

    if (!ideaConfig[template]) {
        ideaConfig[template] = {}
    }

    if (!fs.existsSync(tmpConfigPath)) {
        tmpConfig = {}
    } else {
        tmpConfig = JSON.parse(fs.readFileSync(tmpConfigPath))
    }

    ideaConfig[template] = Object.assign(tmpConfig, { 
        ...ideaConfig[template],
        // 当前分支
        branch: branch
    })

    fs.writeFileSync(ideaConfigPath, JSON.stringify(ideaConfig));
}
