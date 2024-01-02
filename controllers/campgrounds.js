const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const  mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({accessToken: mapBoxToken});

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
}

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req, res) => {
    const geoData = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    const newcamp = new Campground(req.body.campground);
    newcamp.geometry = geoData.body.features[0].geometry;
    newcamp.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    newcamp.author = req.user._id;
    await newcamp.save();
    console.log(newcamp);
    req.flash('success', 'Successfully made a new campground');
    res.redirect(`/campgrounds/${newcamp._id}`);
}

module.exports.showCampground = async (req, res) => {
    // const { id } = req.params;
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/show', { campground });
}

module.exports.renderEditCampground = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground){
        req.flash('error', 'Cannot find that campground!')
        return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
    const foundCamp = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));
    foundCamp.images.push(...imgs);
    await foundCamp.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
           await cloudinary.uploader.destroy(filename);
        }
        await foundCamp.updateOne({$pull: {images: {filename : {$in: req.body.deleteImages}}}})
        console.log(foundCamp)
    }
    req.flash('success', 'Successfully updated campground');
    res.redirect(`/campgrounds/${foundCamp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    await Campground.findByIdAndDelete(req.params.id);
    req.flash('success', 'Successfully deleted a campground');
    res.redirect('/campgrounds');
}