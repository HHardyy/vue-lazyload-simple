const express = require('express')
const app = express()

app.use(express.static(__dirname))
app.listen(3000, () => {
	console.log('service start at 3000')
})


const arr = []

for(let i=1; i<= 7; i++) {
	arr.push(`http://localhost:3000/images/${i}.jpg`)
}

app.get('/llazyimg', (req, res) => {
	res.json(arr)
})