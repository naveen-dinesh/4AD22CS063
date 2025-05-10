const express = require("express");
const axios = require('axios');
const app = express();
const portNumber = 3000;
const windowSize = 10;
const acceptableIDs = ['p', 'f', 'even', 'r']; 
let numberWindow = [];

function calculateAverage(numbersList) {

    if (numbersList.length === 0) return 0;
    const sum = numbersList.reduce((acc, num) => acc + num, 0);
    return parseFloat((sum / numbersList.length).toFixed(2));
}
async function fetchNumbers(numberId) {
    const apiUrl = `http://20.244.56.144/evaluation-service/{numberId}`;

    try {
        console.log(`Fetching numbers for numberId: ${numberId}`);
        const response = await axios.get(apiUrl,{timeout: 5000 });
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching numbers for ${numberId}: ${error.message}`);
        return [];
    }
}

function updateNumberWindow(fetchedNumbers) {
    const uniqueNewNumbers = [];

    fetchedNumbers.forEach((num) => {
        if (!numberWindow.includes(num)) {
            if (numberWindow.length >= windowSize) {
                numberWindow.shift();
            }
            numberWindow.push(num);
            uniqueNewNumbers.push(num);
        }
    });

    return uniqueNewNumbers;
}

app.get('/numbers/:numberid', async (req, res) => {
    const numberId = req.params.numberid;
    if (!acceptableIDs.includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }
    const windowPrevState = [...numberWindow];
    const fetchedNumbers = await fetchNumbers(numberId);
    const uniqueNewNumbers = updateNumberWindow(fetchedNumbers);
    const windowCurrState = [...numberWindow];
    const avg = calculateAverage(numberWindow);
    res.json({
        windowPrevState,
        windowCurrState,
        numbers: uniqueNewNumbers,
        avg
    });
});
app.listen(portNumber, () => {
    console.log(`Average Calculator service running on http://localhost:${portNumber}`);
});