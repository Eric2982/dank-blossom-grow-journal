import { describe, it, expect } from 'vitest'
import isValidHostname from 'is-valid-hostname'

describe('is valid hostname', () => {
  it('tld and subdomains', () => {
    expect(isValidHostname('example.com')).toBe(true)
    expect(isValidHostname('example.com.')).toBe(true)
    expect(isValidHostname('foo.example.com')).toBe(true)
    expect(isValidHostname('bar.foo.example.com')).toBe(true)
    expect(isValidHostname('exa-mple.co.uk')).toBe(true)
    expect(isValidHostname('a.com')).toBe(true)
    expect(isValidHostname('.com.')).toBe(false)
    expect(isValidHostname('a.b')).toBe(true)
    expect(isValidHostname('foo.bar.baz')).toBe(true)
    expect(isValidHostname('foo-bar.ba-z.qux')).toBe(true)
    expect(isValidHostname('hello.world')).toBe(true)
    expect(isValidHostname('ex-am-ple.com')).toBe(true)
    expect(isValidHostname('xn--80ak6aa92e.com')).toBe(true)
    expect(isValidHostname('example.a9')).toBe(true)
    expect(isValidHostname('example.9a')).toBe(true)
    expect(isValidHostname('example.99')).toBe(true)
    expect(isValidHostname('4chan.com')).toBe(true)
    expect(isValidHostname('9gag.com')).toBe(true)
    expect(isValidHostname('37signals.com')).toBe(true)
  })

  it('invalid tld and subdomains', () => {
    expect(isValidHostname('exa_mple.com')).toBe(false)
    expect(isValidHostname('')).toBe(false)
    expect(isValidHostname('ex*mple.com')).toBe(false)
    expect(isValidHostname('@#$@#$%fd')).toBe(false)
    expect(isValidHostname('_example.com')).toBe(false)
    expect(isValidHostname('-example.com')).toBe(false)
    expect(isValidHostname('foo._example.com')).toBe(false)
    expect(isValidHostname('foo.-example.com')).toBe(false)
    expect(isValidHostname('foo.example-.co.uk')).toBe(false)
    expect(isValidHostname('example-.com')).toBe(false)
    expect(isValidHostname('example_.com')).toBe(false)
    expect(isValidHostname('foo.example-.com')).toBe(false)
    expect(isValidHostname('foo.example_.com')).toBe(false)
    expect(isValidHostname('example.com-')).toBe(false)
    expect(isValidHostname('example.com_')).toBe(false)
    expect(isValidHostname('-foo.example.com_')).toBe(false)
    expect(isValidHostname('_foo.example.com_')).toBe(false)
    expect(isValidHostname('*.com_')).toBe(false)
    expect(isValidHostname('*.*.com_')).toBe(false)
  })

  it('more subdomains', () => {
    expect(isValidHostname('example.co.uk')).toBe(true)
    expect(isValidHostname('-foo.example.com')).toBe(false)
    expect(isValidHostname('foo-.example.com')).toBe(false)
    expect(isValidHostname('-foo-.example.com')).toBe(false)
    expect(isValidHostname('foo-.bar.example.com')).toBe(false)
    expect(isValidHostname('-foo.bar.example.com')).toBe(false)
    expect(isValidHostname('-foo-.bar.example.com')).toBe(false)
  })

  it('wildcard', () => {
    expect(isValidHostname('*.example.com')).toBe(false)
  })

  it("hostnames can't have underscores", () => {
    expect(isValidHostname('_dnslink.ipfs.io')).toBe(false)
    expect(isValidHostname('xn--_eamop-.donata.com')).toBe(false)
  })

  it('punycode', () => {
    expect(isValidHostname('xn--6qq79v.xn--fiqz9s')).toBe(true)
    expect(isValidHostname('xn--ber-goa.com')).toBe(true)
  })

  it('IPs', () => {
    expect(isValidHostname('127.0.0.1')).toBe(true)
    expect(isValidHostname('100.1.2.3')).toBe(true)
    expect(isValidHostname('8.8.8.8')).toBe(true)
    expect(isValidHostname('127.0.0.1:3000')).toBe(false)
    expect(isValidHostname('1.1.1.3com')).toBe(true)
  })

  it('valid labels', () => {
    expect(isValidHostname('localhost')).toBe(true)
    expect(isValidHostname('example')).toBe(true)
    expect(isValidHostname('exa-mple')).toBe(true)
    expect(isValidHostname('3434')).toBe(true)
    expect(isValidHostname('bar.q-ux')).toBe(true)
    expect(isValidHostname('a'.repeat(63))).toBe(true)
  })

  it('valid length', () => {
    expect(isValidHostname(`${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'c'.repeat(61)}`)).toBe(true)
    expect(isValidHostname(`${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'c'.repeat(61)}.`)).toBe(true)
    expect(isValidHostname(`${'a'.repeat(63)}.${'b'.repeat(63)}.${'c'.repeat(63)}.${'c'.repeat(62)}`)).toBe(false)
  })

  it('invalid labels', () => {
    expect(isValidHostname('example.com:3000')).toBe(false)
    expect(isValidHostname('localhost:3000')).toBe(false)
    expect(isValidHostname('example..comw')).toBe(false)
    expect(isValidHostname('a'.repeat(64))).toBe(false)
    expect(isValidHostname('-exa-mple')).toBe(false)
    expect(isValidHostname('-exa-mple-')).toBe(false)
    expect(isValidHostname('exa-mple-')).toBe(false)
    expect(isValidHostname('example-')).toBe(false)
    expect(isValidHostname('.')).toBe(false)
    expect(isValidHostname('..')).toBe(false)
    expect(isValidHostname('example..')).toBe(false)
    expect(isValidHostname('..example')).toBe(false)
    expect(isValidHostname('.example')).toBe(false)
  })

  it('contains em-dash', () => {
    expect(isValidHostname('xn–pple-43d.com')).toBe(false)
  })

  it('invalid types', () => {
    expect(isValidHostname(3434)).toBe(false)
    expect(isValidHostname({})).toBe(false)
    expect(isValidHostname(() => {})).toBe(false)
  })

  it('invalid values', () => {
    expect(isValidHostname('foo.example.com*')).toBe(false)
    expect(isValidHostname(`google.com"\'\"\""\\"\\'test test`)).toBe(false)
    expect(isValidHostname(`google.com.au'"\'\"\""\\"\\'test`)).toBe(false)
    expect(isValidHostname('...')).toBe(false)
    expect(isValidHostname('.example.')).toBe(false)
    expect(isValidHostname('.example.com')).toBe(false)
    expect(isValidHostname('"example.com"')).toBe(false)
  })
})
