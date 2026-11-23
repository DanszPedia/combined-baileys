"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * rich-webui.js — kirim antarmuka HTML inline (WebUI) di dalam bubble chat WhatsApp.
 *
 * Mekanisme (hasil audit Desktop/botwhatsapp, terbukti berjalan):
 *   botForwardedMessage > message > richResponseMessage > unifiedResponse.data
 *   unifiedResponse.data = base64(JSON) dengan primitive GenAIaeacdsnwHtmlPrimitive.
 *
 * Modul ini sengaja ringan dan bebas native dependency:
 * hanya memakai node:crypto (tidak import generics.js/crypto.js),
 * sehingga aman di-load di semua platform.
 */
const { randomBytes, randomUUID } = require('crypto');

/**
 * Build the follow-up edit envelope used by the AI-rich message
 * implementations when bypassDownload is enabled. This is a protocol edit
 * for an AI-rich response; it does not bypass media encryption or access checks.
 */
function buildDownloadBypassProtocolContent(jid, targetMessageId, editedMessage, forwardWrapper = true) {
    if (typeof jid !== 'string' || !jid) {
        throw new TypeError('buildDownloadBypassProtocolContent: jid is required');
    }
    if (typeof targetMessageId !== 'string' || !targetMessageId) {
        throw new TypeError('buildDownloadBypassProtocolContent: targetMessageId is required');
    }
    if (!editedMessage || typeof editedMessage !== 'object') {
        throw new TypeError('buildDownloadBypassProtocolContent: editedMessage is required');
    }
    const protocolMessage = {
        key: { remoteJid: jid, fromMe: true, id: targetMessageId },
        type: 14,
        editedMessage
    };
    return forwardWrapper
        ? { botForwardedMessage: { message: { protocolMessage } } }
        : { protocolMessage };
}

/** Nama primitive HTML (identifier obfuscated dari WA Web — bisa berubah antar-versi WA) */
const WEBUI_PRIMITIVE_TYPENAME = 'GenAIaeacdsnwHtmlPrimitive';

/** Identitas default: forward dari Meta AI (terbukti di-render app resmi) */
const DEFAULT_BOT_JID = '867051314767696@bot';
const DEFAULT_FORWARD_ORIGIN = 'META_AI';

/** Batas aman ukuran payload HTML per pesan */
const WEBUI_MAX_PAYLOAD_BYTES = 64 * 1024;

/** Generate message ID format WhatsApp (sama seperti generateMessageID, tapi tanpa import berat) */
const generateWebuiMessageId = () => '3EB0' + randomBytes(18).toString('hex').toUpperCase();

/**
 * Bangun objek pesan WebUI (belum dikirim) — bisa dipakai untuk relayMessage manual.
 *
 * @param {object} options
 * @param {string} options.html - HTML standalone (semua CSS/JS inline). WAJIB.
 * @param {string} [options.title='WebUI'] - Teks fallback di submessage.
 * @param {string} [options.botJid='867051314767696@bot'] - Identitas bot penerus.
 * @param {string} [options.forwardOrigin='META_AI'] - Origin forward.
 * @param {string} [options.responseId] - UUID custom (default: random).
 * @returns {object} objek pesan siap encode (kompatibel proto.Message rc14)
 */
function buildWebuiMessage({
    html,
    title = 'WebUI',
    botJid = DEFAULT_BOT_JID,
    forwardOrigin = DEFAULT_FORWARD_ORIGIN,
    responseId
} = {}) {
    if (typeof html !== 'string' || html.length === 0) {
        throw new TypeError('buildWebuiMessage: "html" wajib berupa string non-kosong');
    }
    const htmlBytes = Buffer.byteLength(html, 'utf-8');
    if (htmlBytes > WEBUI_MAX_PAYLOAD_BYTES) {
        console.warn(`[rich-webui] payload HTML ${htmlBytes} bytes melebihi batas aman ${WEBUI_MAX_PAYLOAD_BYTES} bytes — pesan berisiko ditolak server`);
    }
    const uuid = responseId || randomUUID();
    const unifiedResponse = {
        response_id: uuid,
        sections: [
            {
                view_model: {
                    primitive: {
                        __typename: WEBUI_PRIMITIVE_TYPENAME,
                        payload: html,
                        trusted_sources: []
                    },
                    __typename: 'GenAISingleLayoutViewModel'
                }
            }
        ]
    };
    const base64Data = Buffer.from(JSON.stringify(unifiedResponse), 'utf-8').toString('base64');
    return {
        messageContextInfo: {
            deviceListMetadata: {},
            deviceListMetadataVersion: 2,
            botMetadata: {
                botResponseId: uuid
            }
        },
        botForwardedMessage: {
            message: {
                richResponseMessage: {
                    messageType: 'AI_RICH_RESPONSE_TYPE_STANDARD',
                    submessages: [
                        {
                            messageType: 'AI_RICH_RESPONSE_TEXT',
                            messageText: title
                        }
                    ],
                    unifiedResponse: {
                        data: base64Data
                    },
                    contextInfo: {
                        forwardingScore: 1,
                        isForwarded: true,
                        forwardedAiBotMessageInfo: {
                            botJid
                        },
                        forwardOrigin
                    }
                }
            }
        }
    };
}

/**
 * Bangun + kirim pesan WebUI langsung ke JID.
 *
 * @param {object} sock - Instance Baileys socket (harus punya relayMessage)
 * @param {string} jid - JID tujuan
 * @param {string} html - HTML standalone
 * @param {string} [title='WebUI'] - Teks fallback
 * @param {object} [options] - override: botJid, forwardOrigin, responseId, messageId
 * @returns {Promise<{ messageId: string, message: object }>}
 */
/**
 * Relay an AI-rich response and optionally send the follow-up type-14 edit
 * used by the reference forks' bypassDownload option.
 *
 * This only affects rich-response rendering/update behavior. It is not a
 * media downloader bypass and does not alter encrypted media retrieval.
 */
async function sendRichMessageWithBypass(sock, jid, message, options = {}) {
    if (!sock || typeof sock.relayMessage !== 'function') {
        throw new TypeError('sendRichMessageWithBypass: sock must expose relayMessage()');
    }
    if (typeof jid !== 'string' || !jid) {
        throw new TypeError('sendRichMessageWithBypass: jid is required');
    }
    if (!message || typeof message !== 'object') {
        throw new TypeError('sendRichMessageWithBypass: message must be an object');
    }

    const {
        messageId: customMessageId,
        bypassDownload = false,
        forwardWrapper = true,
        editMessageId,
        editRelayOptions = {},
        ...relayOptions
    } = options;
    const messageId = customMessageId || generateWebuiMessageId();
    await sock.relayMessage(jid, message, { ...relayOptions, messageId });

    let bypassDownloadMessageId;
    if (bypassDownload) {
        try {
            // Lazy import keeps the ordinary WebUI startup path lightweight.
            const { generateWAMessageFromContent } = require('../../Utils/messages');
            const editContent = buildDownloadBypassProtocolContent(
                jid,
                messageId,
                message,
                forwardWrapper
            );
            const editMessage = generateWAMessageFromContent(jid, editContent, {
                messageId: editMessageId || generateWebuiMessageId()
            });
            bypassDownloadMessageId = editMessage.key.id;
            await sock.relayMessage(jid, editMessage.message, {
                ...relayOptions,
                ...editRelayOptions,
                messageId: bypassDownloadMessageId
            });
        } catch (error) {
            // The first message has already been relayed; expose its key so
            // callers can avoid blindly retrying and creating a duplicate.
            if (error && typeof error === 'object') {
                error.relayedKey = { remoteJid: jid, fromMe: true, id: messageId };
            }
            throw error;
        }
    }

    return {
        messageId,
        message,
        ...(bypassDownloadMessageId ? { bypassDownloadMessageId } : {})
    };
}

async function sendInlineWebUI(sock, jid, html, title = 'WebUI', options = {}) {
    if (!sock || typeof sock.relayMessage !== 'function') {
        throw new TypeError('sendInlineWebUI: "sock" harus instance Baileys socket yang punya relayMessage()');
    }
    const {
        messageId,
        bypassDownload = false,
        forwardWrapper = true,
        editMessageId,
        editRelayOptions,
        ...buildOptions
    } = options;
    const message = buildWebuiMessage({ html, title, ...buildOptions });
    return sendRichMessageWithBypass(sock, jid, message, {
        messageId,
        bypassDownload,
        forwardWrapper,
        editMessageId,
        editRelayOptions
    });
}

exports.WEBUI_PRIMITIVE_TYPENAME = WEBUI_PRIMITIVE_TYPENAME;
exports.DEFAULT_BOT_JID = DEFAULT_BOT_JID;
exports.DEFAULT_FORWARD_ORIGIN = DEFAULT_FORWARD_ORIGIN;
exports.WEBUI_MAX_PAYLOAD_BYTES = WEBUI_MAX_PAYLOAD_BYTES;
exports.generateWebuiMessageId = generateWebuiMessageId;
exports.buildWebuiMessage = buildWebuiMessage;
exports.sendInlineWebUI = sendInlineWebUI;
exports.sendRichMessageWithBypass = sendRichMessageWithBypass;
exports.buildDownloadBypassProtocolContent = buildDownloadBypassProtocolContent;
