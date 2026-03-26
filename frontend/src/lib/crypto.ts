/**
 * End-to-End Encryption Utility
 * Derives a secure AES-GCM key from a shared group join code.
 */
export async function deriveKey(joinCode: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(joinCode),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: encoder.encode("TulasiAI_Salt_" + joinCode), // fixed salt per group
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

function arrayBufferToBase64(buffer: ArrayBuffer | Uint8Array) {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function encryptMessage(text: string, joinCode: string): Promise<{ ciphertext: string; iv: string }> {
  const key = await deriveKey(joinCode);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoder = new TextEncoder();
  
  const encryptedBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text)
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuf),
    iv: arrayBufferToBase64(iv),
  };
}

export async function decryptMessage(payload: string, joinCode: string): Promise<string> {
  try {
    if (!payload.includes(":")) return payload;
    
    const [ivB64, ctB64] = payload.split(":");
    const key = await deriveKey(joinCode);
    const iv = base64ToArrayBuffer(ivB64);
    const ct = base64ToArrayBuffer(ctB64);
    
    const decryptedBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ct
    );
    
    return new TextDecoder().decode(decryptedBuf);
  } catch (e) {
    console.error("Decryption failed", e);
    return "🔐 [Encrypted Message]";
  }
}
