const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

const manifest = {
    id: "org.animevietsub.dragonballz.v2",
    version: "2.0.0",
    name: "Dragon Ball Z - Vietsub (Direct HD)",
    description: "Trọn bộ 291 tập Dragon Ball Z chất lượng cao kèm Phụ đề Tiếng Việt phát mượt mà trên Smart TV.",
    resources: ["catalog", "meta", "stream"],
    types: ["anime", "series"],
    idPrefixes: ["dbz_hd_"],
    catalogs: [
        {
            type: 'anime',
            id: 'dbz_hd_catalog',
            name: '7 Viên Ngọc Rồng Z (Vietsub HD)'
        }
    ]
};

const builder = new addonBuilder(manifest);

// 1. Khai báo Catalog
builder.defineCatalogHandler(async (args) => {
    if (args.type === 'anime' && args.id === 'dbz_hd_catalog') {
        return {
            metas: [{
                id: 'dbz_hd_series',
                type: 'anime',
                name: '7 Viên Ngọc Rồng Z (Dragon Ball Z)',
                poster: 'https://m.media-amazon.com/images/M/MV5BNjUzZTc4ZGQtNDYwZi00NGFlLWI0NGYtM2ZmMzNjZjU4YjYyXkEyXkFqcGdeQXVyNTUyNDk3OQ@@._V1_FMjpg_UX1000_.jpg',
                description: 'Trọn bộ 291 tập phim Dragon Ball Z chất lượng cao kèm Vietsub mượt mà.',
                genres: ['Anime', 'Action', 'Shonen', 'Classic', 'Vietsub']
            }]
        };
    }
    return { metas: [] };
});

// 2. Khai báo Danh sách 291 Tập phim
builder.defineMetaHandler(async (args) => {
    if (args.id === 'dbz_hd_series') {
        let episodes = [];
        for (let i = 1; i <= 291; i++) {
            episodes.push({
                id: `dbz_hd_ep_${i}`,
                season: 1,
                episode: i,
                title: `Tập ${i} (Vietsub HD)`,
                released: new Date(2026, 0, i).toISOString(),
                overview: `7 Viên Ngọc Rồng Z Tập ${i} - Bản HD vietsub chuẩn.`
            });
        }
        return {
            meta: {
                id: 'dbz_hd_series',
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

// 3. Xử lý Stream: Ghép nguồn Video Direct + Subtitles Vietsub
builder.defineStreamHandler(async (args) => {
    const epMatch = args.id.match(/dbz_hd_ep_(\d+)/);
    if (!epMatch) return { streams: [] };

    const episodeNum = parseInt(epMatch[1]);

    // Định dạng số tập 3 chữ số (VD: Tập 1 -> 001, Tập 12 -> 012)
    const formattedEp = String(episodeNum).padStart(3, '0');

    // Nguồn Stream Video HD trực tiếp (Tương thích 100% với Stremio Player)
    const streamUrl = `https://archive.org/download/dragon-ball-z-hd-remux/DBZ_Episode_${formattedEp}.mp4`;
    
    // Nguồn file Phụ đề Tiếng Việt (Vietsub)
    const subUrl = `https://raw.githubusercontent.com/stremio-vietsub/dbz-subs/main/subs/ep_${episodeNum}.vtt`;

    return {
        streams: [{
            title: `Vietsub HD 1080p - Tập ${episodeNum}`,
            url: streamUrl,
            subtitles: [
                {
                    id: "vietsub",
                    url: subUrl,
                    lang: "vie" // Ngôn ngữ Tiếng Việt cho Stremio tự bật
                }
            ],
            behaviorHints: {
                notSupported: false
            }
        }]
    };
});

const port = process.env.PORT || 7000;
serveHTTP(builder.getInterface(), { port: port });
console.log(`Addon DBZ Direct Vietsub đang chạy trên cổng ${port}`);
