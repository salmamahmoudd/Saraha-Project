import { client } from "./redis.connection.js";

export function getBlackListTokenKey({ userId, tokenId }) {
  return `blackListToken:${userId}:${tokenId}`;
}

export function getOTPKey({ email, emailType }) {
  return `OTP::${email}:${emailType}`;
}

export function getOTPReqNoKey({ email, emailType }) {
  return `OTP::${email}::${emailType}::No`;
}

export function getOTPBlockedKey({ email, emailType }) {
  return `OTP::${email}::${emailType}::Blocked`
}

export async function set({ key, value, exType = "EX", exValue = 50 }) {
  return await client.set(key , value, {
  expiration:{ type:exType, value: Math.floor(exValue) }
})
}

export async function incr( key) {
  return await client.incr(key )
}

export async function hset({ key, field, value }) {
  return await client.hSet(key, field, value);
}

export async function update({ key, value }) {
  return await client.set(key, value);
}

export async function remove(key) {
  return await client.del(key);
}

export async function ttl(key) {
  return await client.ttl(key);
}

export async function setExpire(key, seconds) {
  return await client.expire(key, seconds);
}

export async function removeExpire(key) {
  return await client.persist(key);
}

export async function get(key) {
  return await client.get(key);
}

export async function mget(key) {
  return await client.mget(key);
}

export async function exists(key) {
  return await client.exists(key);
}