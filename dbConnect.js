const mongoose = require("mongoose");

module.exports = async () => {
  const mongoUri =
    "mongodb+srv://super111222333000:K5lMxVIigJeFuvh3@cluster0.usvwuwu.mongodb.net/?retryWrites=true&w=majority";

  try {
    const connect = await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB connected: ${connect.connection.host}`);
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
};
