const fs = require('fs').promises
const path = require('path')

const Mustache = require('mustache')
const YAML = require('yaml')
const {glob} = require('glob')


async function generateIndex(config) {
    const indexHtml = `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8" />
        </head>
        <body>
            <ul>` +
                Object.keys(config.members).map(name => `<li><a href="${name}.html">${name}</a></li>`).join("\n") +
            `</ul>
        </body>
    </html`
    await fs.writeFile(path.join(__dirname, 'dist', 'index.html'), indexHtml)
}

async function templateArgs(member) {
    const imgData = await fs.readFile(path.join(__dirname, member.avatar_path))

    return {
        ...member,
        avatar_img: `data:image/png;base64,${imgData.toString('base64')}`
    }
}

async function main() {
    const confFile = await fs.readFile(path.join(__dirname, 'members.yml'))
    const config = YAML.parse(confFile.toString('utf-8'))

    const templateFile = await fs.readFile(path.join(__dirname, 'template.html.mustache'))
    const template = templateFile.toString('utf-8')

    for (const f of await glob(path.join(__dirname, 'dist/*'))) {
        await fs.rm(f)
    }

    for (const [key, member] of Object.entries(config.members)) {
        const html = Mustache.render(template, await templateArgs(member))
        await fs.writeFile(path.join(__dirname, 'dist', `${key}.html`), html)
    }

    await generateIndex(config)
}

main()
