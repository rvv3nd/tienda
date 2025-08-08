import CryptoJS from 'crypto-js'

// Obtener la clave secreta desde las variables de entorno
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY

if (!SECRET_KEY) {
  throw new Error('VITE_SECRET_KEY no está definida en las variables de entorno')
}

export function encrypt(text: string): string {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, SECRET_KEY).toString()
    //console.log('Texto encriptado:', encrypted)
    return encrypted
  } catch (error) {
    console.error('Error al encriptar:', error)
    throw new Error('Error en el proceso de encriptación')
  }
}

export function decrypt(encryptedText: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, SECRET_KEY)
    const decrypted = bytes.toString(CryptoJS.enc.Utf8)

    if (!decrypted) {
      throw new Error('No se pudo desencriptar el texto')
    }

    return decrypted
  } catch (error) {
    console.error('Error al desencriptar:', error)
    throw new Error('Error en el proceso de desencriptación')
  }
}
