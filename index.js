const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");
const axios = require("axios");
const cheerio = require("cheerio");

const manifest = {
    id: "org.animevietsub.dragonballz.pro",
    version: "2.0.0",
    name: "Dragon Ball Z - Official HD",
    description: "Addon xem trọn bộ 291 tập Dragon Ball Z chất lượng cao, tự động fix lỗi và ổn định 24/7.",
    resources: ["catalog", "meta", "stream"],
    types: ["anime", "series"],
    idPrefixes: ["dbz_"],
    // QUAN TRỌNG: Thêm trường catalogs dưới dạng một mảng để fix lỗi của SDK
    catalogs: [
        {
            type: 'anime',
            id: 'dbz_catalog',
            name: '7 Viên Ngọc Rồng Z'
        }
    ]
};

const builder = new addonBuilder(manifest);

// 1. Quản lý Catalog
builder.defineCatalogHandler(async (args) => {
    if (args.type === 'anime' && args.id === 'dbz_catalog') {
        return {
            metas: [{
                id: 'dbz_series',
                type: 'anime',
                name: '7 Viên Ngọc Rồng Z (Dragon Ball Z)',
                poster: 'https://m.media-amazon.com/images/M/MV5BNjUzZTc4ZGQtNDYwZi00NGFlLWI0NGYtM2ZmMzNjZjU4YjYyXkEyXkFqcGdeQXVyNTUyNDk3OQ@@._V1_FMjpg_UX1000_.jpg',
                description: 'Trọn bộ 291 tập lồng tiếng/phụ đề tiếng Việt chuẩn HD.',
                genres: ['Anime', 'Action', 'Shonen', 'Classic']
            }]
        };
    }
    return { metas: [] };
});

// 2. Khai báo danh sách 291 tập phim (Meta Handler)
builder.defineMetaHandler(async (args) => {
    if (args.id === 'dbz_series') {
        let episodes = [];
        for (let i = 1; i <= 291; i++) {
            episodes.push({
                id: `dbz_ep_${i}`,
                season: 1,
                episode: i,
                title: `Tập ${i}`,
                released: new Date(2026, 0, i).toISOString(),
                overview: `Xem phim Dragon Ball Z Tập ${i} Vietsub chất lượng cao.`
            });
        }
        return {
            meta: {
                id: 'dbz_series',
                type: 'anime',
                name: '7 Viên Ngọc Rồng Z (Dragon Ball Z)',
                poster: 'https://m.media-amazon.com/images/M/MV5BNjUzZTc4ZGQtNDYwZi00NGFlLWI0NGYtM2ZmMzNjZjU4YjYyXkEyXkFqcGdeQXVyNTUyNDk3OQ@@._V1_FMjpg_UX1000_.jpg',
                description: 'Trọn bộ 291 tập Dragon Ball Z.',
                videos: episodes
            }
        };
    }
    return { meta: null };
});

// 3. Xử lý Stream đa tầng, chống lỗi timeout
builder.defineStreamHandler(async (args) => {
    const epMatch = args.id.match(/dbz_ep_(\d+)/);
    if (!epMatch) return { streams: [] };

    const episodeNum = epMatch[1];
    const targetUrl = `https://animevietsub.sale/phim/7-vien-ngoc-rong-z-i2-a976/tap-${episodeNum}.html`;

    try {
        const response = await axios.get(targetUrl, {
            timeout: 8000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://animevietsub.sale/',
                'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
            }
        });

        const html = response.data;
        let streamUrl = null;

        // Tìm kiếm link m3u8 tầng 1
        const m3u8Regex = /(https?:\/\/[^"']+\.m3u8[^"']*)/;
        const match = html.match(m3u8Regex);
        if (match) {
            streamUrl = match[1];
        }

        // Tìm kiếm dự phòng tầng 2
        if (!streamUrl) {
            const playerSourceRegex = /file\s*:\s*["'](https?:\/[^"']+\.m3u8[^"']*)["']/;
            const playerMatch = html.match(playerSourceRegex);
            if (playerMatch) {
                streamUrl = playerMatch[1];
            }
        }

        if (streamUrl) {
            return {
                streams: [{
                    title: `AnimeVietSub - Tập ${episodeNum} (Server HD)`,
                    url: streamUrl,
                    behaviorHints: {
                        notSupported: false,
                        proxyHeaders: {
                            request: {
                                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                                "Referer": "https://animevietsub.sale/"
                            }
                        },
                        requestHeaders: {
                            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                            "Referer": "https://animevietsub.sale/"
                        }
                    }
                }]
            };
        }
    } catch (error) {
        console.error(`[Lỗi xử lý] Tập ${episodeNum}:`, error.message);
    }

    return { streams: [] };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
console.log(`Addon DBZ Pro đang chạy ổn định trên cổng ${port}`);
