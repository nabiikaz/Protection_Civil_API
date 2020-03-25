const Intervention = require("./../models/interventionModel");
const catchAsync = require('../utils/catchAsync');
const dateTime = require('../utils/moment').dateTime;
const APIFeatures = require('../utils/apiFeatures')

exports.getAllInterventions = catchAsync(async (req, res) => {
    // EXECUTE QUERY
    const features = new APIFeatures(Intervention.find(), req.query).filter().sort().limitFields();

    const interventions = await features.query;
    // SEND RESPONSE
    res.status(200).json({
        status: "success",
        data: {
            interventions
        }
    })
});



exports.addDateTimeDepart = catchAsync(async (req, res) => {
    Intervention.updateOne({
        "chef": req.user._id
    }, {
        $set: {
            dateTimeDepart: dateTime
        }
    });
    res.status(200).json({
        status: "success"
    });
});