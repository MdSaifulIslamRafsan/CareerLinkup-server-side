const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "assignment-no-11-2de58.web.app",
      "https://assignment-no-11-2de58.web.app",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.edk1eij.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // mongodb collection setup
    const jobsCollection = client.db("CareerLinkup").collection("jobs");
    const applyJobsCollection = client
      .db("CareerLinkup")
      .collection("applyJobs");

    // get all jobs data from mongodb
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });
    // get single jobs data from mongodb

    app.get("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await jobsCollection.findOne(query);
      res.send(result);
    });

    // save apply jobs data in mongodb
    app.post("/appliedJobs", async (req, res) => {
      const applyJobsData = req.body;
      const result = await applyJobsCollection.insertOne(applyJobsData);
      res.send(result);
    });

    // update Applicants Number in mongodb
    app.post("/job/:id", async (req, res) => {
      const jobId = req.params.id;
      const query = { _id: new ObjectId(jobId) };
      const result = await jobsCollection.updateOne(query, {
        $inc: { applicantsNumber: 1 },
      });
      res.send(result);
    });

    // add a job data from mongodb
    app.post("/jobs", async (req, res) => {
      const jobData = req.body;
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    });

    // get all jobs posted by a specific user
    app.get("/jobs/:email", async (req, res) => {
      const userEmail =  req.params.email;
      const query = {'jobUser.email' : userEmail}
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });
    // delete a job data from mongodb
    app.delete("/job/:id", async (req, res) => {
      const jobId =  req.params.id;
      const query = {_id : new ObjectId(jobId)}
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });
    // update a job data 
    app.put("/job/:id", async(req ,res)=>{
      const jobId =  req.params.id;
      const jobData = req.body;
      const query = {_id : new ObjectId(jobId)};
      const options = {upsert : true};
      const updateDoc = {
        $set: {
          ...jobData,
        }
      }
      const result = await jobsCollection.updateOne(query , updateDoc , options);
      res.send(result);
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("CareerLinkup Server running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
