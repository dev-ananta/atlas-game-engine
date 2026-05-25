# FILE_FORMAT

## `.game` Package (Atlas v1.1.0)

`.game` is a JSON container with checksummed metadata and encoded payload.

## Top-Level Structure

```json
{
  "header": {
    "magic": "ATLAS_GAME",
    "version": "1.1.0",
    "created": "...",
    "distribution": "open|closed",
    "encryption": { "mode": "none|symmetric-aes-256-gcm|hybrid-rsa-oaep-aes-256-gcm" },
    "checksum": "sha256..."
  },
  "metadata": { ... },
  "runtime": { ... },
  "qualityProfiles": { ... },
  "payload": {
    "encoding": "base64",
    "data": "...",
    "iv": "...",
    "tag": "...",
    "salt": "...",
    "encryptedDataKey": "..."
  }
}
```

## Manifest Fields

Required key groups:

- `metadata`: title, creator, release date, genre, description, version, quality tiers, hardware hints, distribution.
- `runtime`: startup/runtime settings (entry scene etc.).
- `qualityProfiles`: thresholds for automatic hardware tier selection.
- `scene`: entities + asset registry.

Legacy manifest shape is normalized by build-tools.

## Payload Contents (decoded JSON)

```json
{
  "manifest": { ...normalized manifest... },
  "assets": {
    "version": "1.1.0",
    "compression": "gzip",
    "tiers": {
      "Ultra": { "assets": { ... } },
      "High": { "assets": { ... } },
      "Medium": { "assets": { ... } },
      "Low": { "assets": { ... } },
      "Potato": { "assets": { ... } }
    },
    "hashes": { "path": "sha256..." }
  },
  "scripts": {
    "version": "1.1.0",
    "scripts": {
      "path.lua": {
        "language": "lua",
        "encoding": "utf8",
        "hash": "sha256...",
        "source": "..."
      }
    }
  }
}
```

## Encryption Modes

1. **none**
   - Payload data is plain JSON encoded as base64.

2. **symmetric-aes-256-gcm** (open collaborative protected)
   - Key derived from shared passphrase + random salt using scrypt.
   - Payload encrypted with AES-256-GCM.

3. **hybrid-rsa-oaep-aes-256-gcm** (closed distribution)
   - Random AES-256 key encrypts payload.
   - AES key encrypted with RSA-OAEP SHA-256 public key.
   - Private key holder is required for repacking workflows.
