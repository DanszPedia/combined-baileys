'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
  attachCompatMethods,
  normalizeInteractivePayload,
  makeSimpleButtonPayload,
  toNativeFlowButton,
} = require('../../lib/Compat/socket');

function createSocketStub() {
  const calls = [];
  const sock = {
    calls,
    sendMessage: async (...args) => {
      calls.push(args);
      return { key: { id: 'TEST-MESSAGE' }, args };
    },
  };
  return sock;
}

test('sendMsg is a transparent alias for sendMessage', async () => {
  const sock = attachCompatMethods(createSocketStub());
  const content = { text: 'hello world' };
  const options = { quoted: { key: { id: 'quoted' } } };
  const result = await sock.sendMsg('123@s.whatsapp.net', content, options);
  assert.equal(sock.calls.length, 1);
  assert.deepEqual(sock.calls[0], ['123@s.whatsapp.net', content, options]);
  assert.equal(result.key.id, 'TEST-MESSAGE');
});

test('sendBtn and sendBtnV1 wrap a raw interactiveMessage object', async () => {
  const sock = attachCompatMethods(createSocketStub());
  const payload = { title: 'Hello', nativeFlowMessage: { buttons: [] } };
  await sock.sendBtn('123@s.whatsapp.net', payload);
  assert.deepEqual(sock.calls[0][1], { interactiveMessage: payload });
  await sock.sendBtnV1('123@s.whatsapp.net', { interactiveMessage: payload });
  assert.deepEqual(sock.calls[1][1], { interactiveMessage: payload });
});

test('sendBtnV2 converts simple button descriptors to native-flow quick replies', async () => {
  const sock = attachCompatMethods(createSocketStub());
  await sock.sendBtnV2('123@s.whatsapp.net', {
    text: 'Choose',
    footer: 'Dansz',
    buttons: [{ id: '.menu', text: 'Menu' }],
  });
  const interactive = sock.calls[0][1].interactiveMessage;
  assert.equal(interactive.title, 'Choose');
  assert.equal(interactive.footer, 'Dansz');
  assert.equal(interactive.nativeFlowMessage.buttons[0].name, 'quick_reply');
  assert.deepEqual(JSON.parse(interactive.nativeFlowMessage.buttons[0].buttonParamsJson), {
    display_text: 'Menu',
    id: '.menu',
  });
});

test('native-flow button conversion preserves already-normalized payloads', () => {
  const raw = { name: 'cta_url', buttonParamsJson: '{"url":"https://example.com"}' };
  assert.deepEqual(toNativeFlowButton(raw, 0), raw);
});

test('interactive payload normalizer does not double-wrap', () => {
  const raw = { interactiveMessage: { title: 'ok' } };
  assert.equal(normalizeInteractivePayload(raw), raw);
  assert.deepEqual(normalizeInteractivePayload({ title: 'ok' }), { interactiveMessage: { title: 'ok' } });
});

test('rich WebUI bypassDownload builds a protocol edit envelope', () => {
  const {
    buildDownloadBypassProtocolContent,
  } = require('../../lib/Compat/rich/rich-webui');

  const message = { botForwardedMessage: { message: { richResponseMessage: {} } } };
  const wrapped = buildDownloadBypassProtocolContent(
    '123@s.whatsapp.net',
    'MSG-1',
    message
  );
  assert.deepEqual(
    wrapped.botForwardedMessage.message.protocolMessage,
    {
      key: { remoteJid: '123@s.whatsapp.net', fromMe: true, id: 'MSG-1' },
      type: 14,
      editedMessage: message,
    }
  );

  const unwrapped = buildDownloadBypassProtocolContent(
    '123@s.whatsapp.net',
    'MSG-1',
    message,
    false
  );
  assert.equal(unwrapped.protocolMessage.type, 14);
  assert.equal(unwrapped.botForwardedMessage, undefined);
});

test('sendRichMessageV1 relays an AI-rich response without changing default behavior', async () => {
  const { sendRichMessageWithBypass } = require('../../lib/Compat/rich/rich-webui');
  const calls = [];
  const sock = {
    relayMessage: async (...args) => calls.push(args),
  };
  const payload = { botForwardedMessage: { message: { richResponseMessage: {} } } };
  const result = await sendRichMessageWithBypass(
    sock,
    '123@s.whatsapp.net',
    payload,
    { messageId: 'RICH-1' }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0][0], '123@s.whatsapp.net');
  assert.equal(calls[0][1], payload);
  assert.equal(calls[0][2].messageId, 'RICH-1');
  assert.equal(result.messageId, 'RICH-1');
  assert.equal(result.bypassDownloadMessageId, undefined);
});

test('rich WebUI bypassDownload validates the target message', () => {
  const {
    buildDownloadBypassProtocolContent,
  } = require('../../lib/Compat/rich/rich-webui');
  assert.throws(
    () => buildDownloadBypassProtocolContent('', 'MSG-1', {}),
    /jid is required/
  );
});

test('socket exposes sendRichMessageV1 as an additive helper', async () => {
  const calls = [];
  const sock = attachCompatMethods({
    sendMessage: async () => ({}),
    relayMessage: async (...args) => calls.push(args),
  });
  const payload = { botForwardedMessage: { message: { richResponseMessage: {} } } };
  const result = await sock.sendRichMessageV1(
    '123@s.whatsapp.net',
    payload,
    { messageId: 'SOCKET-RICH-1' }
  );

  assert.equal(calls.length, 1);
  assert.equal(calls[0][2].messageId, 'SOCKET-RICH-1');
  assert.equal(result.messageId, 'SOCKET-RICH-1');
});

test('compat methods can only be attached once', () => {
  const sock = attachCompatMethods(createSocketStub());
  const sendMsg = sock.sendMsg;
  assert.equal(attachCompatMethods(sock), sock);
  assert.equal(sock.sendMsg, sendMsg);
});


test('bypassDownload sends the original rich message and a type-14 follow-up edit', async () => {
  const Module = require('node:module');
  const originalLoad = Module._load;
  const calls = [];
  Module._load = function(request, parent, isMain) {
    if (request === '../../Utils/messages' && parent?.filename?.endsWith('/rich-webui.js')) {
      return {
        generateWAMessageFromContent: (jid, content, options = {}) => ({
          key: { remoteJid: jid, fromMe: true, id: options.messageId || 'EDIT-1' },
          message: content,
        }),
      };
    }
    return originalLoad.call(this, request, parent, isMain);
  };
  try {
    const { sendRichMessageWithBypass } = require('../../lib/Compat/rich/rich-webui');
    const sock = { relayMessage: async (...args) => calls.push(args) };
    const payload = { botForwardedMessage: { message: { richResponseMessage: { unifiedResponse: { data: 'e30=' } } } } };
    const result = await sendRichMessageWithBypass(sock, '123@s.whatsapp.net', payload, {
      messageId: 'RICH-ORIGINAL',
      editMessageId: 'RICH-EDIT',
      bypassDownload: true,
    });
    assert.equal(calls.length, 2);
    assert.equal(calls[0][2].messageId, 'RICH-ORIGINAL');
    assert.equal(calls[1][1].botForwardedMessage.message.protocolMessage.type, 14);
    assert.equal(calls[1][1].botForwardedMessage.message.protocolMessage.key.id, 'RICH-ORIGINAL');
    assert.equal(calls[1][2].messageId, 'RICH-EDIT');
    assert.equal(result.bypassDownloadMessageId, 'RICH-EDIT');
  } finally {
    Module._load = originalLoad;
  }
});
