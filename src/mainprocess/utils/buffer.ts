export class BufferUtil {
  public static mergeBuffers(buff1: Buffer, buff2: Buffer): Buffer|null {
    let mergedBuff = null;
    let mergedBuffLen = 0;
    let buffArray: Buffer[] = [];
    if (buff1 != null) {
      buffArray.push(buff1);
      mergedBuffLen += buff1.length;
    }
    if (buff2 != null) {
      buffArray.push(buff2);
      mergedBuffLen += buff2.length;
    }
    if (buffArray.length > 0) {
      mergedBuff = Buffer.concat(buffArray, mergedBuffLen);
    }
    return mergedBuff;
  }
}
