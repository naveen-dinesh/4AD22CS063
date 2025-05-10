const express = require("express")
const axios = require('axios')
const app = express()
const portNumber = 3000
const windowSize = 10;
const aqcceptableIDs = ['p', 'f', 'e', 'r'];
let numberWindow = []

function calculateAverage(lst){
    if(lst.length === 0)
        return 0
    const sum = lst.reduce((acc,num)=>acc+num,0)
    return parseFloat((sum / lst.length).toFixed(2));
}

app.get('/numbers/{numberid}', async (req, res) => {
    const numberId = req.params.numberid;
    if (!aqcceptableIDs.includes(numberId)) {
        return res.status(400).json({ error: 'Invalid number ID' });
    }
    const windowPrevState = [...numberWindow];
    const apiUrl = `http://20.244.56.144/evaluation-service/primes`;

    let fetchedNumbers = [];

    try {
        const response = await axios.get(apiUrl);
        fetchedNumbers = response.data.numbers || [];
    } catch (error) {
        fetchedNumbers = [];
    }

    const uniqueNewNumbers = [];

    for (let num of fetchedNumbers) {
        if (!numberWindow.includes(num)) {
            if (numberWindow.length >= windowSize) {
                numberWindow.shift();
            }
            numberWindow.push(num);
            uniqueNewNumbers.push(num);
        }
    }

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