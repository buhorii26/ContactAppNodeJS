const mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/crud", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => {
    console.log("Database connected to MongoDB");
  })
  .catch((err) => {
    console.log(err);
  });
