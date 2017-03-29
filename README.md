# FCrDNS
NodeJS Forward-confirmed reverse DNS by Joshua Davison

## What is it?
FCrDNS will check the PTR records of an IP address, and will check that there is a valid A/AAAA name entry pointing back to the DNS.

In simpler terms, it checks the hostname of the IP address, and the IP address of the hostname match.

## Installation
    npm install --save fcrdns

## Usage:
Usage is simple, and often best shown in code...

    var FCrDNS = require('fcrdns'),
        rDNS = new FCrDNS();

    rDNS.get('8.8.8.8', function(hostname) {
      if (hostname === null)
        console.log('Unable to verify Google DNS hostname.');
      else
        console.log('The hostname for Google DNS is ' + hostname);
    });

### FCrDNS(config)
* `config` &lt;object&gt; (not yet implemented)
 * `ttl` &lt;number&gt;

### FCrDNS.get(address, callback)
* `address` &lt;string&gt;
* `callback` &lt;Function&gt;
 * `hostname` &lt;string&gt;
 * `cached` &lt;Boolean&gt;

Note that `hostname` will be `null` if verification failed, or if there was an error.
