import Redis from "ioredis"
import config from "../../config"

export class RedisClient {
  private client: Redis

  constructor() {
    this.client = new Redis(config.redis.url, {
      password: config.redis.password,
    })
  }

  async ping(): Promise<string> {
    return this.client.ping()
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<"OK"> {
    if (ttlSeconds) {
      return this.client.set(key, value, "EX", ttlSeconds)
    }
    return this.client.set(key, value)
  }

  async del(key: string): Promise<number> {
    return this.client.del(key)
  }

  async close(): Promise<void> {
    await this.client.quit()
  }
}
