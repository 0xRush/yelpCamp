const mongoose = require('mongoose');
const cities = require('./cities');
const Campground = require('../models/campground');
const { places, descriptors } = require('./seedHelpers');

// useCreateIndex: true should be in the options but it is deprecated and the solution was to remove it
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// this is for connection
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=> {
    console.log('Database connected');
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 50) + 10;
        const camp = new Campground({
            author: '64e636862620f5d171b54e39',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi debitis ducimus ipsum iusto quidem sit ex deserunt culpa dolorem blanditiis? Voluptatum rerum ullam qui veritatis ab, harum quisquam necessitatibus fugit?',
            price,
            geometry: { 
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ] 
            },
            images: [
                {
                  url: 'https://res.cloudinary.com/deix5txqy/image/upload/v1693328537/YelpCamp/hwl0lylx7ex0nqyotsre.jpg',
                  filename: 'YelpCamp/ss8zt9z8lqt6tlvjlgpp'
                },
                {
                  url: 'https://res.cloudinary.com/deix5txqy/image/upload/v1693328536/YelpCamp/b0fqvdcak4wdc2ykopxc.jpg',
                  filename: 'YelpCamp/wgtovaex9nc5wb2t3kwv'
                }
              ]
        });
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})