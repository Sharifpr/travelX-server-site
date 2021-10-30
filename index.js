const express = require('express')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
require('dotenv').config()
const cors = require("cors");

const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.diumk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect();
        const database = client.db("world_turisom");
        const Package_Collection = database.collection("packages");
        const cart_Collection = database.collection('cart')

        // get all data
        app.get('/packages', async (req, res) => {
            const size = parseInt(req.query.size);
            const page = req.query.page;
            const cursor = Package_Collection.find({});
            const count = await cursor.count()
            let packages;
            if (size && page) {
                packages = await cursor
                    .skip(size * page)
                    .limit(size)
                    .toArray();
            }
            else {
                packages = await cursor.toArray();
            }
            res.json({ count, packages })

        });

        // load single data
        app.get('/packages/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const package = await Package_Collection.findOne(query);
            res.json(package)
        });


        // load cart data according to user id get api
        app.get("/cart/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cart_Collection.find(query).toArray();
            res.json(result);
        });



        // add data to cart collection with additional info
        app.post("/package/add", async (req, res) => {
            const package = req.body;
            const result = await cart_Collection.insertOne(package);
            res.json(result);
        });




        // delete data from cart delete api
        app.delete("/delete/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await cart_Collection.deleteOne(query);
            res.json(result);
        });

        // app.delete('/cart/:id', async (req, res) => {
        //     const productId = req.params.id;
        //     const qurey = { _id: ObjectId(productId) };
        //     const result = await cart_Callection.deleteOne(qurey);
        //     console.log('deletein an user', result);
        //     res.json(result);

        // })



        // purchase delete api
        app.delete("/purchase/:uid", async (req, res) => {
            const uid = req.params.uid;
            const query = { uid: uid };
            const result = await cart_Collection.deleteMany(query);
            res.json(result);
        });

        // // orders get api
        // app.get("/orders", async (req, res) => {
        //     const result = await cart_Collection.find({}).toArray();
        //     res.json(result);
        // });

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('database connected')
})

app.listen(port, () => {
    console.log("server is runnig", port)
})