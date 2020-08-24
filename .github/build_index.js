var fs = require("fs");
var path = require("path");

const WORKSPACE = "/home/runner/work/CLDP/CLDP";

const CLDPP = WORKSPACE + "/CLDPP";
const CLDP = WORKSPACE + "/CLDP";

const CLDP_ORIGIN = CLDP + "/LDP/LDP";
const CLDP_CLAIM = CLDP + "/Claimed/LDP";
const CLDP_TRANSLATE = CLDP + "/Translated/LDP";

const skip = "HOWTO-INDEX";
["faq", "ref", "guide", "howto"].forEach(function (type) {

    const translated_docs = [];
    const claimed_docs = [];
    const remained_docs = [];

    ["docbook", "linuxdoc"].forEach(function (format) {
        const format_doc_dir = `${CLDP_ORIGIN}/${type}/${format}`;
        if (!fs.existsSync(format_doc_dir)) {
            return;
        }
        const format_docs = fs.readdirSync(format_doc_dir);
        format_docs.forEach(function (doc) {
            const is_claimed = fs.existsSync(`${CLDP_CLAIM}/${type}/${format}/${doc}`);
            const is_translated = fs.existsSync(`${CLDP_TRANSLATE}/${type}/${format}/${doc}`);

            if (fs.statSync(`${format_doc_dir}/${doc}`).isFile) {
                doc = path.basename(doc, path.extname(doc));
            }
            if (doc === skip) {
                return;
            }
            const entry = {
                doc: doc,
                origin: {
                    txt: `origin/${type}/${doc}/${doc}.txt`,
                    pdf: `origin/${type}/${doc}/${doc}.pdf`,
                    html: `origin/${type}/${doc}/${doc}.html`,
                    single_html: `origin/${type}/${doc}/${doc}-single.html`,
                },
                is_claimed: is_claimed,
                is_translated: is_translated,
                translated: {
                    txt: `translated/${type}/${doc}/${doc}.txt`,
                    pdf: `translated/${type}/${doc}/${doc}.pdf`,
                    html: `translated/${type}/${doc}/${doc}.html`,
                    single_html: `translated/${type}/${doc}/${doc}-single.html`,
                }
            };
            if (is_translated) {
                translated_docs.push(entry);
            } else if (is_claimed) {
                claimed_docs.push(entry);
            } else {
                remained_docs.push(entry);
            }
        });
    });

    const content =`<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CLDPP-${type}</title>
</head>
<body>
    <h1>已翻译: ${translated_docs.length}篇</h1>
    ${translated_docs.map(function(entry) { return `
    <h2>${entry.doc}</h2>
    <h3>原文</h3>
    <ul>
        <li><a href="${entry.origin.txt}">${entry.doc}.txt</a></li>
        <li><a href="${entry.origin.pdf}">${entry.doc}.pdf</a></li>
        <li><a href="${entry.origin.html}">${entry.doc}.html</a></li>
        <li><a href="${entry.origin.single_html}">${entry.doc}-single.html</a></li>
    </ul>
    <h3>译文</h3>
    <ul>
        <li><a href="${entry.translated.txt}">${entry.doc}.txt</a></li>
        <li><a href="${entry.translated.pdf}">${entry.doc}.pdf</a></li>
        <li><a href="${entry.translated.html}">${entry.doc}.html</a></li>
        <li><a href="${entry.translated.single_html}">${entry.doc}-single.html</a></li>
    </ul>
    `}).join('')}
    <h1>已认领: ${claimed_docs.length}篇</h1>
    ${claimed_docs.map(function(entry) { return `
    <h2>${entry.doc}</h2>
    <h3>原文</h3>
    <ul>
        <li><a href="${entry.origin.txt}">${entry.doc}.txt</a></li>
        <li><a href="${entry.origin.pdf}">${entry.doc}.pdf</a></li>
        <li><a href="${entry.origin.html}">${entry.doc}.html</a></li>
        <li><a href="${entry.origin.single_html}">${entry.doc}-single.html</a></li>
    </ul>
    `}).join('')}
    <h1>未认领: ${remained_docs.length}篇</h1>
    ${remained_docs.map(function(entry) { return `
    <h2>${entry.doc}</h2>
    <h3>原文</h3>
    <ul>
        <li><a href="${entry.origin.txt}">${entry.doc}.txt</a></li>
        <li><a href="${entry.origin.pdf}">${entry.doc}.pdf</a></li>
        <li><a href="${entry.origin.html}">${entry.doc}.html</a></li>
        <li><a href="${entry.origin.single_html}">${entry.doc}-single.html</a></li>
    </ul>
    `}).join('')}
</body>
</html>`;

    const html = `${CLDPP}/${type}.html`;
    if (fs.existsSync(html)) {
        fs.unlinkSync(html);
    }
    fs.writeFileSync(html, content);
});

