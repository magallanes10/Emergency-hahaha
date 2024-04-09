const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = 3000;

app.get('/gdph', async (req, res) => {
    const { songlist } = req.query;

    try {
        // Set headers to mimic Mozilla browser
        const headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:91.0) Gecko/20100101 Firefox/91.0',
            'Referer': 'https://gdph.ps.fhgdps.com/',
            'Origin': 'https://gdph.ps.fhgdps.com/',
            'Content-Type': 'application/x-www-form-urlencoded'
        };

        // Fetch the HTML content bypassing Cloudflare
        const response = await axios.post('https://gdph.ps.fhgdps.com/tools/stats/songList.php', 
            `name=${encodeURIComponent(songlist)}&type=1`, 
            { headers }
        );

        // Load HTML content using cheerio
        const $ = cheerio.load(response.data);

        // Extract table rows and filter based on song name
        const songs = [];
        $('table tr').each((index, element) => {
            if (index !== 0) { // Skip header row
                const id = $(element).find('td').eq(0).text();
                const song = $(element).find('td').eq(1).text();
                const author = $(element).find('td').eq(2).text();
                const size = $(element).find('td').eq(3).text();

                if (song.toLowerCase().includes(songlist.toLowerCase())) {
                    songs.push({ id, song, author, size });
                }
            }
        });

        res.json(songs);
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
