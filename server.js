const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const app = express();
const PORT = process.env.PORT || 3000;

let latestRate = null;

const fetchRate = async () => {
    try {
        const response = await axios.get('https://www.investing.com/currencies/usd-rub-chart');
        const html = response.data;

        const $ = cheerio.load(html);

        const rateSelector = 'div[data-test="instrument-price-last"]';
        const rate = $(rateSelector).text();

        if (rate) {
            latestRate = rate.trim(); 
            console.log(`Текущий курс USD/RUB: ${latestRate}`);
        } else {
            console.error('Курс не найден');
        }
    } catch (error) {
        console.error('Ошибка при fetching', error);
    }
};

fetchRate();

setInterval(fetchRate, 60 * 1000); 

app.get('/api/rate', (req, res) => {
    if (latestRate) {
        res.json({ rate: latestRate });
    } else {
        res.status(404).json({ error: 'Курс еще не загружен' });
    }
});

app.listen(PORT, () => {
    console.log(`Сервер работает на http://localhost:${PORT}`);
});