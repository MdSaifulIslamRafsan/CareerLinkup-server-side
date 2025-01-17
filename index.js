const express = require("express");
const cookieParser = require('cookie-parser')
const jwt = require("jsonwebtoken");
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
      "https://assignment-no-11-2de58.web.app",
      "https://assignment-no-11-2de58.firebaseapp.com",
    ],
    credentials: true,
    optionsSuccessStatus: 200,
  })
);
app.use(express.json());
app.use(cookieParser());

// jwt middleware

  const tokenVerify = (req , res , next) => {
    const token = req.cookies?.token;
    if(!token){
      return res.status(401).send({message: "unauthorized access"})
    }
      if(token){
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET , (err , decoded)=>{
          if(err){
           return res.status(401).send({message: "unauthorized access"});
          }
          req.user = decoded;
          next();
        });
      }
  }

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
    const resumeCollection = client
      .db("CareerLinkup")
      .collection("resume");

    // jwt
    app.post("/jwt", async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "180d",
      });
      // save cookie when user login
      res.cookie('token' , token , {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
      }).send({success: true});
    });

    // clear token on logout
    app.get('/logout', (req ,res)=>{
      res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge:0,
        
      }).send({success: true});
    });

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
       // check duplicate request 
       const query = {
        email: applyJobsData.email,
        jobID: applyJobsData.jobID

       };
       const alreadyApplied = await applyJobsCollection.findOne(query);
       if(alreadyApplied){
        return res.status(400).send('You have already applied this job')
       }
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
    app.get("/jobs/:email", tokenVerify, async (req, res) => {
      const tokenEmail = req.user.email;
      const userEmail = req.params.email;
    if(tokenEmail !== userEmail){
      return res.status(403).send({message: "forbidden access"})
    }
      const query = { "jobUser.email": userEmail };
      const result = await jobsCollection.find(query).toArray();
      res.send(result);
    });
    // get applied jobs posted by a specific user
    app.get("/appliedJobs/:email", tokenVerify, async (req, res) => {
      const tokenEmail = req.user.email;
      const userEmail = req.params.email;
      const filter = req.query.filter;
      let query = {};
      if(filter){
        query = { email: userEmail , category : filter };
       }else{
         query = {email: userEmail}
       }
 
      
    if(tokenEmail !== userEmail){
      return res.status(403).send({message: "forbidden access"})
    }
      
      const result = await applyJobsCollection.find(query).toArray();
      res.send(result);
    });
    // delete a job data from mongodb
    app.delete("/job/:id", async (req, res) => {
      const jobId = req.params.id;
      const query = { _id: new ObjectId(jobId) };
      const result = await jobsCollection.deleteOne(query);
      res.send(result);
    });
    // update a job data
    app.put("/job/:id", async (req, res) => {
      const jobId = req.params.id;
      const jobData = req.body;
      const query = { _id: new ObjectId(jobId) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          ...jobData,
        },
      };
      const result = await jobsCollection.updateOne(query, updateDoc, options);
      res.send(result);
    });
    // get all jobs data from mongodb for pagination
    app.get("/all-jobs", async (req, res) => {
      const size = parseInt(req.query.size);
      const page = parseInt(req.query.page - 1);
      const search = req.query.search;
      const query = {
        jobTitle : {$regex : search , $options:'i'}
      }
      const result = await jobsCollection.find(query).skip(page * size).limit(size).toArray();
      res.send(result);
    });
    // get all jobs data count from mongodb
    app.get("/jobs-count", async (req, res) => {
      const search = req.query.search;
      const query = {
        jobTitle : {$regex : search , $options:'i'}
      }
      const count = await jobsCollection.countDocuments(query);
      res.send({count});
    });
    
    // post mongodb resume 
    app.post("/resume/:email", async (req, res) => {
      const resumeData = req.body;
      const email = req.params.email;
      const userAlreadyExist = await resumeCollection.findOne({userEmail: email});
      
      if(userAlreadyExist){
        return res.status(400).send('You have already resume added')
      }
      const result = await resumeCollection.insertOne(resumeData);
      res.send(result);
    });
    // post mongodb resume 
    app.get("/resume/:email",  tokenVerify, async (req, res) => {
      const email = req.params.email;
      const query = {userEmail : email};
     
      const result = await resumeCollection.find(query).toArray();
      res.send(result);
    });

    // Send a ping to confirm a successful connection
  
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
