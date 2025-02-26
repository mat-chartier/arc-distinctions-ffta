import * as crypto from 'crypto';
import { ArcDistinctionsConfig } from '../config';

class EncryptionUtils {
    private static keyBytes: Buffer = Buffer.from(ArcDistinctionsConfig.encryptionKey!, 'hex');

    private static _encode(inputString: string, encoding: BufferEncoding, encryptionKey: Buffer, useEmptyIV: boolean): string {
        try {
            if (encryptionKey.length !== 16) {
                throw new Error('Encryption key must be 16 bytes long for AES-128');
            }
            
            const input = Buffer.from(inputString, encoding);
            let cipher: crypto.Cipher;
            const iv = Buffer.alloc(16, 0); // IV toujours défini (nécessaire pour CBC)
            
            if (useEmptyIV) {
                cipher = crypto.createCipheriv('aes-128-cbc', encryptionKey, iv);
            } else {
                cipher = crypto.createCipheriv('aes-128-ecb', encryptionKey, null); // ECB n'a pas besoin d'IV
            }
            
            const cipherText = Buffer.concat([cipher.update(input), cipher.final()]);
            return cipherText.toString('hex');
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Encryption failed: ${error.message}`);
            }
            throw new Error('Encryption failed due to an unknown error');
        }
    }

    private static _decode(cipherText: string, encoding: BufferEncoding, encryptionKey: Buffer, useEmptyIV: boolean): string {
        try {
            if (encryptionKey.length !== 16) {
                throw new Error('Encryption key must be 16 bytes long for AES-128');
            }
            
            const encryptedBuffer = Buffer.from(cipherText, 'hex');
            let decipher: crypto.Decipher;
            const iv = Buffer.alloc(16, 0); // IV toujours défini (nécessaire pour CBC)
            
            if (useEmptyIV) {
                decipher = crypto.createDecipheriv('aes-128-cbc', encryptionKey, iv);
            } else {
                decipher = crypto.createDecipheriv('aes-128-ecb', encryptionKey, null); // ECB n'a pas besoin d'IV
            }
            
            const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
            return decrypted.toString(encoding);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(`Decryption failed: ${error.message}`);
            }
            throw new Error('Decryption failed due to an unknown error');
        }
    }


    static encode(inputString: string): string {
        return this._encode(inputString, 'utf8', this.keyBytes, false);
    }

    static decode(cipherText: string): string {
        return this._decode(cipherText, 'utf8', this.keyBytes, false);
    }
}

export default EncryptionUtils;
