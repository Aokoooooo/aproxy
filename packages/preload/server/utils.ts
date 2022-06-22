import isTextOrBinary from 'istextorbinary'
import zlib from 'zlib'

export type HTTPEncodeType = 'gzip' | 'deflate'

export function unpackBody(buffer: Buffer, encoding: HTTPEncodeType) {
  if (encoding === 'gzip') {
    return new Promise<Buffer>((ok) => {
      zlib.unzip(buffer, (e, r) => {
        if (e) {
          ok(buffer)
          return
        }
        ok(r)
      })
    })
  }
  if (encoding === 'deflate') {
    // differentiate whether encoding is zlib or raw deflate
    // RFC 1950 Section 2.2
    // CM field (least-significant 4 bits) must be 8
    // FCHECK field ensures first 16-bit BE int is a multiple of 31
    if ((buffer[0] & 0x0f) === 8 && ((buffer[0] << 8) + buffer[1]) % 31 === 0) {
      return new Promise<Buffer>((ok) => {
        zlib.inflate(buffer, (e, r) => {
          if (e) {
            ok(buffer)
            return
          }
          ok(r)
        })
      })
    }
    return new Promise<Buffer>((ok) => {
      zlib.inflateRaw(buffer, (e, r) => {
        if (e) {
          ok(buffer)
          return
        }
        ok(r)
      })
    })
  }
  return Promise.resolve<Buffer>(buffer)
}

export function getResourceType(contentType: string) {
  if (contentType && contentType.match) {
    if (contentType.match('text/css')) {
      return 'Stylesheet'
    }
    if (contentType.match('text/html')) {
      return 'Document'
    }
    if (contentType.match('/(x-)?javascript')) {
      return 'Script'
    }
    if (contentType.match('image/')) {
      return 'Image'
    }
    if (contentType.match('video/')) {
      return 'Media'
    }
    if (contentType.match('font/') || contentType.match('/(x-font-)?woff')) {
      return 'Font'
    }
    if (contentType.match('/(json|xml)')) {
      return 'XHR'
    }
  }

  return 'Other'
}

export function isBinary(contentType: string, buffer: Buffer) {
  const type = getResourceType(contentType)
  if (['Image', 'Media', 'Font'].includes(type)) {
    return true
  }
  if (type === 'Other' && isTextOrBinary.isBinary('', buffer)) {
    return true
  }
  return false
}
