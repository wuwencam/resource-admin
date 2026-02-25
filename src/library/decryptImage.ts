import CryptoJS from 'crypto-js'

const urlCache: Record<string,string> = {}
const isProcessing: Record<string, boolean> = {}

export const decryptImage = async (url: string): Promise<string> => {
    const cacheKey = url
    if (urlCache[cacheKey]) {
      return urlCache[cacheKey]
    }
  
    isProcessing[cacheKey] = true
  
    try {
      const response = await fetch(url)
      if (!response.ok) throw new Error(`网络响应错误: ${response.status}`)
  
      const encryptedData = await response.arrayBuffer()
      const encryptedBytes = new Uint8Array(encryptedData)
  
      const key = CryptoJS.enc.Utf8.parse("k9:3zeFq~]-EQMF,gpGx*uRw+x,n]xw9")
      const iv = CryptoJS.enc.Utf8.parse("Zd3!t#t1YN=!fs)D")
      const cipherText = CryptoJS.lib.WordArray.create(encryptedBytes)
  // 2. 使用 CipherParams.create 包装，使其符合类型定义
        const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: cipherText
        });
      const decrypted = CryptoJS.AES.decrypt(
        cipherParams,
        key,
        { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      )
  
      const decryptedData = new Uint8Array(decrypted.words.flatMap((word:number) => [
        (word >> 24) & 0xFF,
        (word >> 16) & 0xFF,
        (word >> 8) & 0xFF,
        word & 0xFF
      ])).slice(0, decrypted.sigBytes)
  
      const blob = new Blob([decryptedData], { type: "image/jpeg" })
      const blobUrl = URL.createObjectURL(blob)
  
      urlCache[cacheKey] = blobUrl
      delete isProcessing[cacheKey]
  
      return blobUrl
    } catch (err) {
      delete isProcessing[cacheKey]
      console.error('图片解密失败:', url, err)
      throw err
    }
}

export const decryptImageBytes = async(encryptedBytes:Uint8Array<ArrayBuffer>,) : Promise<string> => {
      const key = CryptoJS.enc.Utf8.parse("k9:3zeFq~]-EQMF,gpGx*uRw+x,n]xw9")
      const iv = CryptoJS.enc.Utf8.parse("Zd3!t#t1YN=!fs)D")
      const cipherText = CryptoJS.lib.WordArray.create(encryptedBytes)
        const cipherParams = CryptoJS.lib.CipherParams.create({
        ciphertext: cipherText
        });
      const decrypted = CryptoJS.AES.decrypt(
        cipherParams,
        key,
        { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
      )
  
      const decryptedData = new Uint8Array(decrypted.words.flatMap((word:number) => [
        (word >> 24) & 0xFF,
        (word >> 16) & 0xFF,
        (word >> 8) & 0xFF,
        word & 0xFF
      ])).slice(0, decrypted.sigBytes)
  
      const blob = new Blob([decryptedData], { type: "image/jpeg" })
      const blobUrl = URL.createObjectURL(blob)

      return blobUrl
}