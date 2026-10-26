// 3. Xử lý Stream nâng cao (Tối ưu hóa chống đứng player)
builder.defineStreamHandler(async (args) => {
    const epMatch = args.id.match(/dbz_ep_(\d+)/);
    if (!epMatch) return { streams: [] };

    const episodeNum = epMatch.groups ? epMatch.groups[1] : epMatch[1];
    const targetUrl = `https://animevietsub.sale/phim/7-vien-ngoc-rong-z-i2-a976/tap-${episodeNum}.html`;

    try {
        const response = await axios.get(targetUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Referer': 'https://animevietsub.sale/',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'
            }
        });

        const html = response.data;
        let streamUrl = null;

        // Quét tìm link m3u8 hoặc mp4 trong mã nguồn
        const m3u8Regex = /(https?:\/\/[^"']+\.m3u8[^"']*)/;
        const match = html.match(m3u8Regex);
        if (match) {
            streamUrl = match[1];
        }

        // Nếu bắt được link, trả về stream kèm behaviorHints đầy đủ để player không bị đứng
        if (streamUrl) {
            return {
                streams: [{
                    title: `AnimeVietSub - Tập ${episodeNum} (HD Trực Tiếp)`,
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
        console.error(`[Lỗi cào link tập ${episodeNum}]:`, error.message);
    }

    return { streams: [] };
});
