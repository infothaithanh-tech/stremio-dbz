const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    id: "org.animevietsub.dragonballz.pro",
    version: "3.0.0",
    name: "Dragon Ball Z - Direct Link",
    description: "Addon xem 291 tập Dragon Ball Z trực tiếp từ AnimeVietSub",
    resources: ["catalog", "meta", "stream"],
    types: ["anime", "series"],
    idPrefixes: ["dbz_"],
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

// 2. Khai báo danh sách 291 tập phim
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

// 3. Xử lý Stream: Trả về link Web gốc để Stremio mở qua trình duyệt hoặc External Player mượt mà nhất
builder.defineStreamHandler(async (args) => {
    const epMatch = args.id.match(/dbz_ep_(\d+)/);
    if (!epMatch) return { streams: [] };

    const episodeNum = epMatch[1];
    const targetUrl = `https://animevietsub.sale/phim/7-vien-ngoc-rong-z-i2-a976/tap-${episodeNum}.html`;

    // Cung cấp stream trỏ thẳng về trang web nguồn với cơ chế external player
    return {
        streams: [{
            title: `Xem ngay Tập ${episodeNum} (Mở Web trực tiếp)`,
            url: targetUrl,
            behaviorHints: {
                notSupported: false
            }
        }]
    };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
console.log(`Addon DBZ Direct đang chạy ổn định trên cổng ${port}`);
