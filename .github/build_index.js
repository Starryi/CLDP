var fs = require("fs");
var path = require("path");

const WORKSPACE = "/home/runner/work/CLDP/CLDP";

const CLDPP = WORKSPACE + "/CLDPP";
const CLDP = WORKSPACE + "/CLDP";

const CLDP_ORIGIN = CLDP + "/LDP/LDP";
const CLDP_CLAIM = CLDP + "/Claimed/LDP";
const CLDP_TRANSLATE = CLDP + "/Translated/LDP";

const SKIP = "HOWTO-INDEX";


function fetchTranslators(translatorsPath) {
    const translators = [];
    if (fs.existsSync(translatorsPath)) {
        const data = fs.readFileSync(translatorsPath);
        data.toString().split('\n').forEach(name => {
            name = name.trim();
            if (name !== '') {
                translators.push({
                    name,
                    github: `https://github.com/${name}`
                });
            }
        });
    }
    
    return translators;
}

function createDocEntry(category, format, docName) {
    const claimedDocDirPath = `${CLDP_CLAIM}/${category}/${format}/${docName}`;
    const translatedDocDirPath = `${CLDP_TRANSLATE}/${category}/${format}/${docName}`;
    
    const isClaimed = fs.existsSync(claimedDocDirPath) && fs.statSync(claimedDocDirPath).isDirectory();
    const isTranslated = fs.existsSync(translatedDocDirPath) && fs.statSync(translatedDocDirPath).isDirectory();

    const originPagePath = `origin/${category}/${docName}/${docName}`;
    const translatedPagePath = `translated/${category}/${docName}/${docName}`;

    const entry = {
        name: docName,
        origin: {
            txt: `${originPagePath}.txt`,
            pdf: `${originPagePath}.pdf`,
            html: `${originPagePath}.html`,
            singleHtml: `${originPagePath}-single.html`,
        },
        translated: {
            txt: `${translatedPagePath}.txt`,
            pdf: `${translatedPagePath}.pdf`,
            html: `${translatedPagePath}.html`,
            singleHtml: `${translatedPagePath}-single.html`,
        },
        isClaimed: false,
        isTranslated: false,
        translators: [],
    };
    if (isTranslated) {
        entry.isTranslated = true;
        entry.translators = fetchTranslators(`${translatedDocDirPath}/TRANSLATORS.txt`);
    } else if (isClaimed) {
        entry.isClaimed = true;
        entry.translators = fetchTranslators(`${claimedDocDirPath}/TRANSLATORS.txt`);
    }

    return entry;
}

function statDocsByCategory(category) {
    const translated = [];
    const claimed = [];
    const remained = [];

    ["docbook", "linuxdoc"].forEach(function (format) {
        const formatDirPath = `${CLDP_ORIGIN}/${category}/${format}`;
        if (!fs.existsSync(formatDirPath)) {
            return;
        }
        fs.readdirSync(formatDirPath).forEach(function(docName) {
            const docPath = `${CLDP_ORIGIN}/${category}/${format}/${docName}`;
            if (fs.statSync(docPath).isFile) {
                docName = path.basename(docPath, path.extname(docPath));
            }
            if (docName === SKIP) {
                return;
            }
            const entry = createDocEntry(category, format, docName);
            if (entry.isTranslated) {
                translated.push(entry);
            } else if (entry.isClaimed) {
                claimed.push(entry);
            } else {
                remained.push(entry);
            }
        });
    });

    return {
        translated,
        claimed,
        remained,
    };
}

function createCategoryHtml(category, translatedEntries, claimedEntries, remainedEntries) {
    const content =`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLDPP-${category}</title>
</head>
<body>
    <h1>已翻译: ${translatedEntries.length}篇</h1>
    ${translatedEntries.map(function(entry) { return `
    <h2>${entry.name}</h2>
    <h3>原文</h3>
    <ul>
        <li><a href="${entry.origin.txt}">${entry.name}.txt</a></li>
        <li><a href="${entry.origin.pdf}">${entry.name}.pdf</a></li>
        <li><a href="${entry.origin.html}">${entry.name}.html</a></li>
        <li><a href="${entry.origin.singleHtml}">${entry.name}-single.html</a></li>
    </ul>
    <h3>译文</h3>
    <ul>
        <li><a href="${entry.translated.txt}">${entry.name}.txt</a></li>
        <li><a href="${entry.translated.pdf}">${entry.name}.pdf</a></li>
        <li><a href="${entry.translated.html}">${entry.name}.html</a></li>
        <li><a href="${entry.translated.singleHtml}">${entry.name}-single.html</a></li>
    </ul>
    <h3>译者</h3>
    <ul>
        ${entry.translators.map(function(translator) {
            return `<li><a href="${translator.github}">${translator.name}</a></li>`;
        }).join('')}
    </ul>
    `}).join('')}
    <h1>已认领: ${claimedEntries.length}篇</h1>
    ${claimedEntries.map(function(entry) { return `
    <h2>${entry.name}</h2>
    <h3>原文</h3>
    <ul>
        <li><a href="${entry.origin.txt}">${entry.name}.txt</a></li>
        <li><a href="${entry.origin.pdf}">${entry.name}.pdf</a></li>
        <li><a href="${entry.origin.html}">${entry.name}.html</a></li>
        <li><a href="${entry.origin.singleHtml}">${entry.name}-single.html</a></li>
    </ul>
    <h3>译者</h3>
    <ul>
        ${entry.translators.map(function(translator) {
            return `<li><a href="${translator.github}">${translator.name}</a></li>`;
        }).join('')}
    </ul>
    `}).join('')}
    <h1>未认领: ${remainedEntries.length}篇</h1>
    ${remainedEntries.map(function(entry) { return `
    <h2>${entry.name}</h2>
    <h3>原文</h3>
    <ul>
        <li><a href="${entry.origin.txt}">${entry.name}.txt</a></li>
        <li><a href="${entry.origin.pdf}">${entry.name}.pdf</a></li>
        <li><a href="${entry.origin.html}">${entry.name}.html</a></li>
        <li><a href="${entry.origin.singleHtml}">${entry.name}-single.html</a></li>
    </ul>
    `}).join('')}
</body>
</html>`;

    const html = `${CLDPP}/${category}.html`;
    if (fs.existsSync(html)) {
        fs.unlinkSync(html);
    }
    fs.writeFileSync(html, content);
}


function build() {
    ["faq", "ref", "guide", "howto"].forEach(function(category) {
        const stat = statDocsByCategory(category);
        createCategoryHtml(category, stat.translated, stat.claimed, stat.remained);
    });
}

build();


