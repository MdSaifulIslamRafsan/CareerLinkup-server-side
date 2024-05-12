const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edk1eij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // mongodb collection setup
    const jobsCollection = client.db("CareerLinkup").collection("jobs");
    const applyJobsCollection = client.db("CareerLinkup").collection("applyJobs");

    // get all jobs data from mongodb 
    app.get('/jobs', async(req , res)=> {
        const result = await jobsCollection.find().toArray();
        res.send(result);
    });
    // get single jobs data from mongodb 

    app.get('/job/:id', async(req ,res)=>
        {
            const id = req.params.id;
            const query = {_id : new ObjectId(id)}
        const result = await jobsCollection.findOne(query);
        res.send(result);
    });

    
    // update Applicants Number in mongodb
    app.put('/job/:id', async(req , res)=>{
       const jobId  = req.params.id;
       const query = {_id : new ObjectId(jobId)}
       const result = await jobsCollection.updateOne(query ,  { $inc: { applicantsNumber: 1 } });
       res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error

  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('CareerLinkup Server running');
  })
  

app.listen(port, ()=> {
    console.log(`Example app listening on port ${port}`)
})
