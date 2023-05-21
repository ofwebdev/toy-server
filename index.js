const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();

// middleware
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Server side home route");
});

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jufslxs.mongodb.net/?retryWrites=true&w=majority`;

console.log(process.env.DB_USER, process.env.DB_PASS);

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const toyCollection = client.db("toyDB").collection("toy");

    // GET REQUEST ALL TOY
    app.get("/toy", async (req, res) => {
      const cursor = toyCollection.find();

      const result = await cursor.toArray();
      res.send(result);
      console.log(result);
    });

    // GET REQUEST ALL TOY with search query
    app.get("/toy/search", async (req, res) => {
      const { searchQuery } = req.query;

      let cursor;
      if (searchQuery) {
        const regex = new RegExp(searchQuery, "i");
        cursor = toyCollection.find({ name: regex });
      } else {
        cursor = toyCollection.find();
      }

      const result = await cursor
        .project({ name: 1 }) // Include only the 'name' field in the result
        .limit(limit)
        .toArray();

      res.send(result);
    });

    // GET REQUEST SINGLE ID
    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;

      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.findOne(query);

      res.send(result);
    });

    // POST REQUEST
    app.post("/toy", async (req, res) => {
      const newToy = req.body;
      console.log(newToy);

      const result = await toyCollection.insertOne(newToy);
      res.send(result);
    });

    app.put("/toy/:id", async (req, res) => {
      const id = req.params.id;

      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const toyUpdate = {
        $set: {
          name: req.body.name,
          quantity: req.body.quantity,
          description: req.body.description,
          picture: req.body.picture,
          sellerName: req.body.sellerName,
          sellerEmail: req.body.sellerEmail,
          subcategory: req.body.subcategory,
          rating: req.body.rating,
          price: req.body.price,
        },
      };

      const result = await toyCollection.updateOne(filter, toyUpdate, options);

      res.send(result);
    });

    // DELETE REQUEST
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      console.log("Please delete id from database", id);

      const query = { _id: new ObjectId(id) };
      const result = await toyCollection.deleteOne(query);

      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server run on port ${port}...`);
});
