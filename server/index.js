const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const port = process.env.PORT || 8000

// middleware
const corsOptions = {
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
  optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())
app.use(cookieParser())
app.use(morgan('dev'))
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token
  if (!token) {
    return res.status(401).send({ message: 'unauthorized access' })
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log(err)
      return res.status(401).send({ message: 'unauthorized access' })
    }
    req.user = decoded
    next()
  })
}



const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
})
async function run() {
  try {


    await client.connect();
    const usersCollection=client.db("stay-vista").collection("users");
    const roomsCollection=client.db("stay-vista").collection("rooms");
    const bookingsCollection=client.db("stay-vista").collection("bookings");


    // auth related api
    app.post('/jwt', async (req, res) => {
      const user = req.body
      const token = jwt.sign(user, process.env.SECRET_TOKEN, {
        expiresIn: '365d',
      })
      res
        .cookie('token', token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === 'production',
          sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })
        .send({ success: true })
    })

    // Logout
    app.get('/logout', async (req, res) => {
      try {
        res
          .clearCookie('token', {
            maxAge: 0,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
          })
          .send({ success: true })
        console.log('Logout successful')
      } catch (err) {
        res.status(500).send(err)
      }
    })

    // stripe payment
    app.post("/create-payment-intent",async(req,res)=>{
      const {price}=req.body;
      
      const amount=parseInt(price * 100);
      console.log(amount)
      if(!price && amount<1){
        return
      }
      const paymentIntent = await stripe.paymentIntents.create({
      amount: amount,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      }
      });
      res.send({clientSecret: paymentIntent.client_secret});
    })
  // all useers data
  app.get("/users",async(req,res)=>{
    const result=await usersCollection.find().toArray();
    res.send(result)
  })
  //role update of users
  app.put("/users/update/:email",async(req,res)=>{
    const email=req.params.email;
    const user=req.body;
    const query={email:email};
    const options = { upsert: true };
    const updateDoc = {
      $set: { ...user, timestamp: Date.now() },
    };
    const result = await usersCollection.updateOne(query, updateDoc, options);
    res.send(result);

  })
  app.put("/users/roled/:email",async(req,res)=>{
    const email=req.params.email;
    const user=req.body;
    const query={email:email};
    const options = { upsert: true };
    const updateDoc = {
      $set: { ...user },
    };
    const result = await usersCollection.updateOne(query, updateDoc, options);
    res.send(result);

  })

  app.post("/bookings",async(req,res)=>{
    const data=req.body;
    const result=await bookingsCollection.insertOne(data);
    res.send(result);
  })

  app.get("/bookings/:email",async(req,res)=>{
    const email=req.params.email;
    const query={"guest.email":email}
    const result=await bookingsCollection.find(query).toArray();
    res.send(result);
  })

  app.get("/bookings/host/:email",async(req,res)=>{
    const email=req.params.email;
    const query={host:email}
    const result=await bookingsCollection.find(query).toArray();
    res.send(result);
  })

  app.patch("/bookings/status/:id",async(req,res)=>{
    const id=req.params.id;
    const status=req.body.status;
    const query={_id : new ObjectId(id)}
    const options = { upsert: true };

    const updateDoc = {
      $set: {
        booking:status
      },
    };
    const result = await roomsCollection.updateOne(query, updateDoc, options);
    res.send(result);
  })

    // Save or modify user email, status in DB
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email
      const user = req.body
      const query = { email: email }
      const options = { upsert: true }
      const isExist = await usersCollection.findOne(query)
      console.log('User found?----->', isExist)
      if (isExist) return res.send(isExist)
      const result = await usersCollection.updateOne(
        query,
        {
          $set: { ...user, timestamp: Date.now() },
        },
        options
      )
      res.send(result)
    });

    app.get("/users/:email",async(req,res)=>{
      const email=req.params.email;
      const query={email:email}
      const result=await usersCollection.findOne(query);
      res.send(result)
    });

    //rooms data
    app.get("/room",async(req,res)=>{
      const result=await roomsCollection.find().toArray();
      res.send(result)
    });
    //single room data based on Id
    app.get("/room/:id",async(req,res)=>{
      const id=req.params.id;
      const query={_id:new ObjectId(id)}
      const result=await roomsCollection.findOne(query);
      res.send(result)
    });
    //email based data
    app.get("/rooms/:email",async(req,res)=>{
      const email=req.params.email;
      const query={'host.email':email}
      const result=await roomsCollection.find(query).toArray();
      res.send(result)
    });

    app.post("/room",async(req,res)=>{
      const data=req.body;
      const result=await roomsCollection.insertOne(data);
      res.send(result)
    });

    // Send a ping to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    )
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir)

app.get('/', (req, res) => {
  res.send('Hello from StayVista Server..')
})

app.listen(port, () => {
  console.log(`StayVista is running on port ${port}`)
})
