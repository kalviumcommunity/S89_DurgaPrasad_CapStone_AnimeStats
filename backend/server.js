const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const dotenv=require('dotenv');
dotenv.config();

const app=express();

app.use(express.json());
app.use(cors());
const port=8080;


app.get("/ping", (req, res) => {
    res.send("ping pong ");
  });
  

mongoose.connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("MongoDB connected successfully");

    app.listen(port, () => {
      console.log(`Example app listening at http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Error connecting to MongoDB:", error);
    process.exit(1);
  });


