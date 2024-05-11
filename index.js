const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;


// middleware
app.use(cors(
    {
        origin: [
          "http://localhost:5173",
          "assignment-no-11-2de58.web.app",
          "https://assignment-no-11-2de58.web.app",
        ],
        credentials: true,
        optionsSuccessStatus: 200,
      }
));
app.use(express.json());

app.get('/', (req, res) => {
    res.send('CareerLinkup Server running');
  })
  

app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})
