/**
 * Cache Service for Vedic Rajkumar App
 * Implements caching strategy to reduce database load and improve performance
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

class CacheService {
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000; // Maximum entries in memory cache

  /**
   * Get data from cache
   */
  async get<T>(key: string): Promise<T | null> {
    // Try memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      console.log(`Cache hit (memory): ${key}`);
      return memoryEntry.data;
    }

    // Try localStorage cache
    try {
      const localStorageEntry = localStorage.getItem(`cache_${key}`);
      if (localStorageEntry) {
        const entry: CacheEntry<T> = JSON.parse(localStorageEntry);
        if (!this.isExpired(entry)) {
          console.log(`Cache hit (localStorage): ${key}`);
          // Update memory cache
          this.memoryCache.set(key, entry);
          return entry.data;
        } else {
          // Remove expired entry
          localStorage.removeItem(`cache_${key}`);
        }
      }
    } catch (error) {
      console.warn('localStorage cache error:', error);
    }

    console.log(`Cache miss: ${key}`);
    return null;
  }

  /**
   * Set data in cache
   */
  async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.DEFAULT_TTL
    };

    // Update memory cache
    this.memoryCache.set(key, entry);
    
    // Update localStorage cache
    try {
      localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('localStorage set error:', error);
      // If localStorage is full, clear oldest entries
      this.cleanupLocalStorage();
    }

    // Clean up if cache is too large
    if (this.memoryCache.size > this.MAX_CACHE_SIZE) {
      this.cleanupMemoryCache();
    }
  }

  /**
   * Delete data from cache
   */
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.warn('localStorage delete error:', error);
    }
  }

  /**
   * Clear all cache
   */
  async clear(): Promise<void> {
    this.memoryCache.clear();
    try {
      // Clear all cache_ prefixed items
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('localStorage clear error:', error);
    }
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Clean up memory cache (remove oldest entries)
   */
  private cleanupMemoryCache(): void {
    const entries = Array.from(this.memoryCache.entries());
    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
    
    // Remove oldest entries until we're under the limit
    const entriesToRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE / 2);
    entriesToRemove.forEach(([key]) => this.memoryCache.delete(key));
    
    console.log(`Cleaned up ${entriesToRemove.length} entries from memory cache`);
  }

  /**
   * Clean up localStorage cache
   */
  private cleanupLocalStorage(): void {
    try {
      const entries: Array<{ key: string; entry: CacheEntry<any> }> = [];
      
      // Collect all cache entries
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const entry = JSON.parse(value);
              entries.push({ key, entry });
            } catch (error) {
              // Remove invalid entries
              localStorage.removeItem(key);
            }
          }
        }
      }

      // Remove expired entries
      const now = Date.now();
      entries.forEach(({ key, entry }) => {
        if (now - entry.timestamp > entry.ttl) {
          localStorage.removeItem(key);
        }
      });

      // If still too many entries, remove oldest
      if (entries.length > this.MAX_CACHE_SIZE) {
        // Sort by timestamp (oldest first)
        entries.sort((a, b) => a.entry.timestamp - b.entry.timestamp);
        const entriesToRemove = entries.slice(0, entries.length - this.MAX_CACHE_SIZE / 2);
        entriesToRemove.forEach(({ key }) => localStorage.removeItem(key));
        
        console.log(`Cleaned up ${entriesToRemove.length} entries from localStorage`);
      }
    } catch (error) {
      console.error('localStorage cleanup error:', error);
    }
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const memoryStats = {
      size: this.memoryCache.size,
      entries: Array.from(this.memoryCache.entries()).map(([key, entry]) => ({
        key,
        age: Date.now() - entry.timestamp,
        ttl: entry.ttl,
        expired: this.isExpired(entry)
      }))
    };

    let localStorageStats = { size: 0, entries: [] };
    try {
      const localStorageEntries = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('cache_')) {
          localStorageStats.size++;
          const value = localStorage.getItem(key);
          if (value) {
            try {
              const entry = JSON.parse(value);
              localStorageEntries.push({
                key,
                age: Date.now() - entry.timestamp,
                ttl: entry.ttl,
                expired: this.isExpired(entry)
              });
            } catch (error) {
              // Skip invalid entries
            }
          }
        }
      }
      localStorageStats.entries = localStorageEntries;
    } catch (error) {
      console.warn('localStorage stats error:', error);
    }

    return {
      memory: memoryStats,
      localStorage: localStorageStats,
      total: memoryStats.size + localStorageStats.size
    };
  }

  /**
   * Pre-cache common calculations
   */
  async precacheCommonCalculations(): Promise<void> {
    // Cache common city coordinates
    const commonCities = [
      { name: 'Delhi', lat: 28.61, lon: 77.23 },
      { name: 'Mumbai', lat: 19.08, lon: 72.88 },
      { name: 'Bangalore', lat: 12.97, lon: 77.59 },
      { name: 'Kolkata', lat: 22.57, lon: 88.36 },
      { name: 'Chennai', lat: 13.08, lon: 80.27 },
      { name: 'Hyderabad', lat: 17.39, lon: 78.49 },
      { name: 'Ahmedabad', lat: 23.03, lon: 72.58 },
      { name: 'Pune', lat: 18.52, lon: 73.86 },
      { name: 'Jaipur', lat: 26.91, lon: 75.79 },
      { name: 'Indore', lat: 22.72, lon: 75.86 }
    ];

    for (const city of commonCities) {
      await this.set(`city_${city.name.toLowerCase()}`, city, 24 * 60 * 60 * 1000); // 24 hours
    }

    // Cache planetary positions for today (updated daily)
    const today = new Date().toISOString().split('T')[0];
    await this.set(`planets_today`, { date: today, positions: {} }, 24 * 60 * 60 * 1000);

    console.log('Common calculations precached');
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Helper functions for specific cache types
export const CalculationCache = {
  // Birth chart calculations
  async getBirthChart(birthDetails: any) {
    const key = `birth_chart_${JSON.stringify(birthDetails)}`;
    return cacheService.get(key);
  },

  async setBirthChart(birthDetails: any, chartData: any) {
    const key = `birth_chart_${JSON.stringify(birthDetails)}`;
    await cacheService.set(key, chartData, 60 * 60 * 1000); // 1 hour
  },

  // Transit calculations
  async getTransits(moonRashiIndex: number, date: string) {
    const key = `transits_${moonRashiIndex}_${date}`;
    return cacheService.get(key);
  },

  async setTransits(moonRashiIndex: number, date: string, transitData: any) {
    const key = `transits_${moonRashiIndex}_${date}`;
    await cacheService.set(key, transitData, 24 * 60 * 60 * 1000); // 24 hours
  },

  // User profile data
  async getUserProfile(userId: string) {
    const key = `user_profile_${userId}`;
    return cacheService.get(key);
  },

  async setUserProfile(userId: string, profileData: any) {
    const key = `user_profile_${userId}`;
    await cacheService.set(key, profileData, 30 * 60 * 1000); // 30 minutes
  }
};