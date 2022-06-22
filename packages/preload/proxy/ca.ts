import { readFileAsync, writeFileAsync, existsAsync, mkdirAsync } from 'fs-extra-promise'
import { md, pki } from 'node-forge'
import { v4 as uuid } from 'uuid'
import { CERT_DIR_PATH, CERT_FILE_PATH, CERT_KEY_FILE_PATH } from '../const'

type PEM = string | string[] | Buffer | Buffer[]

type GeneratedCertificate = {
  key: string
  cert: string
  ca: string
}

const CERT_LENGTH = 2048
const MIN_CERT_REFRESH_TIME = 1000 * 60 * 60 * 24 // one day

export async function getCA() {
  const cert = await generateCA()
  return new CA(cert.key, cert.cert)
}

export async function downloadCA() {
  await generateCA()
}

async function generateCA() {
  if (!(await existsAsync(CERT_DIR_PATH))) {
    await mkdirAsync(CERT_DIR_PATH)
  }

  return await Promise.all([
    readFileAsync(CERT_KEY_FILE_PATH, 'utf8'),
    readFileAsync(CERT_FILE_PATH, 'utf8').then((certContent) => {
      checkCertExpiry(certContent)
      return certContent
    }),
    existsAsync(CERT_KEY_FILE_PATH),
    existsAsync(CERT_FILE_PATH),
  ])
    .then(([key, cert]) => ({ key, cert }))
    .catch(async () => {
      // Cert doesn't exist, or is too close/past expiry. Generate a new one:
      const newCertPair = await generateCACertificate()

      await Promise.all([
        writeFileAsync(CERT_FILE_PATH, newCertPair.cert),
        writeFileAsync(CERT_KEY_FILE_PATH, newCertPair.key),
      ])
      console.log('generate cert success')
      return newCertPair
    })
}

function checkCertExpiry(certContents: string) {
  const cert = pki.certificateFromPem(certContents)
  const remainingLifetime = cert.validity.notAfter.valueOf() - Date.now()

  if (remainingLifetime < MIN_CERT_REFRESH_TIME) {
    throw new Error('Certificate regeneration required')
  }
}

function updateCABaseData(cert: pki.Certificate, validateYear = 10) {
  cert.serialNumber = uuid().replace(/-/g, '')
  cert.validity.notBefore = new Date()
  // Make it valid for the last 24h - helps in cases where clocks slightly disagree.
  cert.validity.notBefore.setDate(cert.validity.notBefore.getDate() - 1)
  cert.validity.notAfter = new Date()
  cert.validity.notAfter.setFullYear(cert.validity.notAfter.getFullYear() + validateYear)
}

async function generateCACertificate() {
  const keyPair = await new Promise<pki.rsa.KeyPair>((resolve, reject) => {
    pki.rsa.generateKeyPair({ bits: CERT_LENGTH }, (error, keyPair) => {
      if (error) {
        reject(error)
        return
      }
      resolve(keyPair)
    })
  })

  const cert = pki.createCertificate()
  cert.publicKey = keyPair.publicKey
  updateCABaseData(cert)

  cert.setSubject([{ name: 'commonName', value: 'aProxy' }])

  cert.setExtensions([
    {
      name: 'basicConstraints',
      cA: true,
    },
  ])
  cert.setIssuer(cert.subject.attributes)
  cert.sign(keyPair.privateKey, md.sha256.create())

  return {
    key: pki.privateKeyToPem(keyPair.privateKey),
    cert: pki.certificateToPem(cert),
  }
}

let KEY_PAIR:
  | {
      publicKey: pki.rsa.PublicKey
      privateKey: pki.rsa.PrivateKey
    }
  | undefined

export class CA {
  private caCert: pki.Certificate
  private caKey: pki.PrivateKey
  private certCache: { [domain: string]: GeneratedCertificate }

  constructor(caKey: PEM, caCert: PEM) {
    this.caKey = pki.privateKeyFromPem(caKey.toString('utf8'))
    this.caCert = pki.certificateFromPem(caCert.toString('utf8'))
    this.certCache = {}

    if (!KEY_PAIR) {
      KEY_PAIR = pki.rsa.generateKeyPair(CERT_LENGTH)
    }
  }

  generateCertificate(domain: string): GeneratedCertificate {
    // TODO: Expire domains from the cache? Based on their actual expiry?
    if (this.certCache[domain]) return this.certCache[domain]

    const cert = pki.createCertificate()

    cert.publicKey = KEY_PAIR!.publicKey
    updateCABaseData(cert, 1)

    cert.setSubject([
      { name: 'commonName', value: domain },
      { name: 'organizationName', value: 'aProxy Cert' },
    ])
    cert.setIssuer(this.caCert.subject.attributes)

    cert.setExtensions([
      {
        name: 'keyUsage',
        keyCertSign: true,
        digitalSignature: true,
        nonRepudiation: true,
        keyEncipherment: true,
        dataEncipherment: true,
      },
      {
        name: 'subjectAltName',
        altNames: [
          {
            type: 2,
            value: domain,
          },
        ],
      },
    ])

    cert.sign(this.caKey, md.sha256.create())

    const generatedCertificate = {
      key: pki.privateKeyToPem(KEY_PAIR!.privateKey),
      cert: pki.certificateToPem(cert),
      ca: pki.certificateToPem(this.caCert),
    }

    this.certCache[domain] = generatedCertificate
    return generatedCertificate
  }
}
