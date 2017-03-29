// Forward-confirmed reverse DNS by Joshua Davison. MIT Licence.

const net = require('net'),
      dns = require('dns'),
      EventEmitter = require('events').EventEmitter

module.exports = class FCrDNS extends EventEmitter {
  constructor() {
    super()
    this.cache = {}
    this.ttl = 3600
  }

  get(ip, callback) {
    this.once(ip, callback)
    if (this.listenerCount(ip) === 1) {
      let hostname
      if ((hostname = this._isCached(ip)) !== false) { // It's cached
        this.emit(ip, hostname, true)
      }
      else { // Do lookup
        const family = net.isIP(ip)
        if ((family !== 4) && (family != 6)) // Unsupported IP family
          this._cache(ip, null, callback)
        else
          dns.reverse(ip, (err, hostnames) => { // PTR Lookup
            if (err !== null) // Error
              this._cache(ip, null, callback)
            else
              this._verify(ip, family, hostnames, callback)
          })
      }
    }
  }

  _cache(ip, hostname, callback) {
    this.cache[ip] = {
      hostname: hostname,
      lastUpdated: new Date().getTime()
    }
    this.emit(ip, hostname, false)
  }

  _isCached(ip) {
    let cache
    if (((cache = this.cache[ip]) !== undefined) &&
       (((new Date().getTime() - cache.lastUpdated) / 1000) <= this.ttl))
      return cache.hostname
    else
      return false
  }

  _verify(ip, family, hostnames, callback) {
    if (hostnames.length === 0)
      this._cache(ip, null, callback)
    else {
      const hostname = hostnames.shift(),
            recordType = (family === 4) ? 'A' : 'AAAA'
      dns.resolve(hostname, recordType, (err, addresses) => {
        if (err !== null) // Error
          this._verify(ip, family, hostnames, callback)
        else {
          let complete = 0
          for (const address of addresses) {
            if (address === ip) { // Success!
              complete = 1
              this._cache(ip, hostname, callback)
            }
          }
          if (complete === 0)
            this._verify(ip, family, hostnames, callback)
        }
      })
    }
  }
}
