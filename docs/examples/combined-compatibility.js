// Contoh pengujian payload interaktif dan Rich Response.
// Jalankan dari command handler bot setelah mengimpor:
// const { tokenizeCode } = require("./lib/Utils/rich-message-utils");
async function combinedCompatibilityExamples(sock, jid, quoted) {
    await sock.sendMessage(jid, {
        interactiveMessage: {
            title: "Test Interactive",
            footer: "Combined Baileys",
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "Test",
                        id: "#test"
                    })
                }]
            }
        }
    }, { quoted });

    await sock.sendMessage(jid, {
        disclaimerText: "RAW submessages structure example",
        richResponse: [{
            text: "Example Usage"
        }, {
            language: "javascript",
            code: [{
                highlightType: 0,
                codeContent: 'console.log("Hello, World!")'
            }]
        }, {
            text: "Pretty simple, right?"
        }, {
            title: "Runtime Comparison",
            table: [
                { isHeading: true, items: ["", "Node.js", "Bun", "Deno"] },
                { isHeading: false, items: ["Engine", "V8 (C++)", "JavaScriptCore (C++)", "V8 (C++)"] }
            ]
        }]
    });
}
module.exports = { combinedCompatibilityExamples };
