const express = require('express')
const app = express()
require('dotenv').config()
const cors = require('cors')
const cookieParser = require('cookie-parser')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')
const morgan = require('morgan')
const nodemailer = require("nodemailer");
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

//token verified
const verifyToken = async (req, res, next) => {
  const token = req.cookies?.token;

  if (!token) {
    console.log('No token found in cookies');
    return res.status(401).send({ message: 'Unauthorized access: No token provided' });
  }

  jwt.verify(token, process.env.SECRET_TOKEN, (err, decoded) => {
    if (err) {
      console.log('Token verification failed:', err.message);
      return res.status(401).send({ message: 'Unauthorized access: Invalid token' });
    }

    req.user = decoded;
    next();
  });
}
//sending email confi
const sendEmail = (emailAddress, emailData) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use `true` for port 465, `false` for all other ports
    auth: {
      user: process.env.TRANSPORTER_EMAIL,
      pass: process.env.TRANSPORTER_PASS,
    },
  })

  // verify transporter
  // verify connection configuration
  transporter.verify(function (error, success) {
    if (error) {
      console.log(error)
    } else {
      console.log('Server is ready to take our messages',success)
    }
  })
  const mailBody = {
    from: `"StayVista" <${process.env.TRANSPORTER_EMAIL}>`, // sender address
    to: emailAddress, // list of receivers
    subject: emailData.subject, // Subject line
    html: emailData.message, // html body
  }

  transporter.sendMail(mailBody, (error, info) => {
    if (error) {
      console.log(error)
    } else {
      console.log('Email Sent: ' + info.response)
    }
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

//admin verify
    const verifyAdmin = async (req, res, next) => {
      const User = req.user
      const query = { email: User?.email }
      const result = await usersCollection.findOne(query)
      if (!result || result?.role !== 'admin')
        return res.status(401).send({ message: 'unauthorized access!!' })
      next()
    }
//Host verify
    const verifyHost = async (req, res, next) => {
      const User = req.user
      const query = { email: User?.email }
      const result = await usersCollection.findOne(query)
      if (!result || result?.role !== 'host')
        return res.status(401).send({ message: 'unauthorized access!!' })
      next()
    }

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
  app.get("/users",verifyToken,verifyAdmin,async(req,res)=>{
    const result=await usersCollection.find().toArray();
    res.send(result)
  })
  //role update of users
  app.put("/users/update/:email",verifyToken,verifyAdmin,async(req,res)=>{
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

  //user request for role
  app.put("/users/roled/:email",verifyToken,async(req,res)=>{
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

  app.post("/bookings",verifyToken,async(req,res)=>{
    const data=req.body;
    const result=await bookingsCollection.insertOne(data);
     // send email to guest
      sendEmail(data?.guest?.email, {
        subject: 'Booking Successful!',
        message: `You've successfully booked a room through TravelBook. Transaction Id: ${data.transactionId}`,
      })
      // send email to host
      sendEmail(data?.host?.email, {
        subject: `Your room got booked! by ${data?.guest?.name}`,
        message: `Get ready to welcome ${data.guest.name}.`,
      })
    res.send(result);
  })
// user booking data
  app.get("/bookings/:email",verifyToken,async(req,res)=>{
    const email=req.params.email;
    const query={"guest.email":email}
    const result=await bookingsCollection.find(query).toArray();
    res.send(result);
  })
//show own hotel booked data by host
  app.get("/bookings/host/:email",verifyToken,verifyHost,async(req,res)=>{
    const email=req.params.email;
    const query={host:email}
    const result=await bookingsCollection.find(query).toArray();
    res.send(result);
  })
//updation booking status
  app.patch("/bookings/status/:id",verifyToken,async(req,res)=>{
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
      // console.log('User found?----->', isExist)
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
    app.get("/rooms/:email",verifyToken,verifyHost,async(req,res)=>{
      const email=req.params.email;
      const query={'host.email':email}
      const result=await roomsCollection.find(query).toArray();
      res.send(result)
    });

    app.post("/room",verifyToken,verifyHost,async(req,res)=>{
      const data=req.body;
      const result=await roomsCollection.insertOne(data);
      res.send(result)
    });


    // delete a booking
    app.delete('/booking/:id', verifyToken, async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await bookingsCollection.deleteOne(query)
      res.send(result)
    })

    // Admin Statistics
    app.get('/admin-stat', verifyToken, verifyAdmin, async (req, res) => {
      const bookingDetails = await bookingsCollection
        .find(
          {},
          {
            projection: {
              date: 1,
              price: 1,
            },
          }
        )
        .toArray()

      const totalUsers = await usersCollection.countDocuments()
      const totalRooms = await roomsCollection.countDocuments()
      const totalPrice = bookingDetails.reduce(
        (sum, booking) => sum + booking.price,
        0
      )
      const chartData = bookingDetails.map(booking => {
        const day = new Date(booking.date).getDate()
        const month = new Date(booking.date).getMonth() + 1
        const data = [`${day}/${month}`, booking?.price]
        return data
      })
      chartData.unshift(['Day', 'Sales'])
      // chartData.splice(0, 0, ['Day', 'Sales'])

      console.log(chartData)

      console.log(bookingDetails)
      res.send({
        totalUsers,
        totalRooms,
        totalBookings: bookingDetails.length,
        totalPrice,
        chartData,
      })
    })

    // Host Statistics
    app.get('/host-stat', verifyToken, verifyHost, async (req, res) => {
      const { email } = req.user
      const bookingDetails = await bookingsCollection
        .find(
          { 'host.email': email },
          {
            projection: {
              date: 1,
              price: 1,
            },
          }
        )
        .toArray()

      const totalRooms = await roomsCollection.countDocuments({
        'host.email': email,
      })
      const totalPrice = bookingDetails.reduce(
        (sum, booking) => sum + booking.price,
        0
      )
      const { timestamp } = await usersCollection.findOne(
        { email },
        { projection: { timestamp: 1 } }
      )

      const chartData = bookingDetails.map(booking => {
        const day = new Date(booking.date).getDate()
        const month = new Date(booking.date).getMonth() + 1
        const data = [`${day}/${month}`, booking?.price]
        return data
      })
      chartData.unshift(['Day', 'Sales'])
      // chartData.splice(0, 0, ['Day', 'Sales'])

      console.log(chartData)

      console.log(bookingDetails)
      res.send({
        totalRooms,
        totalBookings: bookingDetails.length,
        totalPrice,
        chartData,
        hostSince: timestamp,
      })
    })

    // Guest Statistics
    app.get('/guest-stat', verifyToken, async (req, res) => {
      const { email } = req.user
      const bookingDetails = await bookingsCollection
        .find(
          { 'guest.email': email },
          {
            projection: {
              date: 1,
              price: 1,
            },
          }
        ).toArray()

      const totalPrice = bookingDetails.reduce(
        (sum, booking) => sum + booking.price,
        0
      )
      const { timestamp } = await usersCollection.findOne(
        { email },
        { projection: { timestamp: 1 } }
      )

      const chartData = bookingDetails.map(booking => {
        const day = new Date(booking.date).getDate()
        const month = new Date(booking.date).getMonth() + 1
        const data = [`${day}/${month}`, booking?.price]
        return data
      })
      chartData.unshift(['Day', 'Sales'])
      // chartData.splice(0, 0, ['Day', 'Sales'])

      console.log(chartData)

      console.log(bookingDetails)
      res.send({
        totalBookings: bookingDetails.length,
        totalPrice,
        chartData,
        guestSince: timestamp,
      })
    })

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
