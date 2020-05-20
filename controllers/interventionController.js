const Intervention = require("./../models/interventionModel");
const Appel = require("./../models/appelModel");
const Unite = require("./../models/uniteModel");
const catchAsync = require("../utils/catchAsync");
const dateTime = require("../utils/moment").dateTime;
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const {
  Types: {
    ObjectId
  },
} = (mongoose = require("mongoose"));

exports.getAllIntervention = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  let features, interventions = [];
  if (req.unite.type == "secondaire") {
    if (req.body.date) {
      features = new APIFeatures(
        Intervention.find({
          id_unite: ObjectId(req.agent.id_unite),
          dateTimeAppel: req.body.date
        }),
        req.query
      ).search().paginate().sort();
    } else {
      features = new APIFeatures(
        Intervention.find({
          id_unite: ObjectId(req.agent.id_unite),
        }),
        req.query
      ).search().paginate().sort();
    }
    interventions = await features.query;
  } else {
    const unites = await Unite.find({
      unite_principale: ObjectId(req.unite._id),
    }, {
      _id: 1
    });
    let unite = unites.map((x) => ObjectId(x._id));
    if (req.body.date) {
      features = new APIFeatures(Intervention.find({
        id_unite: {
          $in: unite
        },
        dateTimeAppel: req.body.date
      }), req.query).search().paginate().sort();
    } else {
      features = new APIFeatures(Intervention.find({
        id_unite: {
          $in: unite
        },
      }), req.query).search().paginate().sort();
    }
    interventions = await features.query;
    console.log(interventions)
  }
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions.length,
  });
});

exports.getAllIntervention_EnCours = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  let features, interventions = [];
  if (req.unite.type == "secondaire") {
    if (req.body.date) {
      features = new APIFeatures(
        Intervention.find({
          id_unite: ObjectId(req.agent.id_unite),
          dateTimeAppel: dateTime,
          statut: "en cours"
        }),
        req.query
      ).search().paginate().sort();
    } else {
      features = new APIFeatures(
        Intervention.find({
          id_unite: ObjectId(req.agent.id_unite),
          dateTimeAppel: dateTime,
          statut: "en cours"
        }),
        req.query
      ).search().paginate().sort();
    }
    interventions = await features.query;
  } else {
    const unites = await Unite.find({
      unite_principale: ObjectId(req.unite._id),
    }, {
      _id: 1
    });
    let unite = unites.map((x) => ObjectId(x._id));
    if (req.body.date) {
      features = new APIFeatures(Intervention.find({
        id_unite: {
          $in: unite
        },
        dateTimeAppel: req.body.date,
        dateTimeAppel: dateTime,
        statut: "en cours"
      }), req.query).search().paginate().sort();
    } else {
      features = new APIFeatures(Intervention.find({
        id_unite: {
          $in: unite
        },
        dateTimeAppel: dateTime,
        statut: "en cours"
      }), req.query).search().paginate().sort();
    }
    interventions = await features.query;
  }
  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions.length,
  });
});

exports.getAllIntervention_Recue = catchAsync(async (req, res) => {
  // EXECUTE QUERY
  let features, interventions = [];

  features = new APIFeatures(
    Intervention.find({
      id_unite: ObjectId(req.agent.id_unite),
      statut: "recu"
    }),
    req.query
  );
  interventions = await features.query;

  // SEND RESPONSE
  res.status(200).json({
    status: "success",
    interventions,
    interventions_total: interventions.length,
  });
});

exports.getIntervention = catchAsync(async (req, res, next) => {
  let intervention = await Intervention.findOne({
    _id: req.body.id_intervention,
  });
  if (!intervention) {
    return next(new AppError("cette intervention n'existe pas", 404));
  } else {
    if (req.unite.type == "secondaire") {
      if (!intervention.id_unite.equals(req.agent.id_unite)) {
        return next(
          new AppError(
            "Vous n'avez pas la permission pour cette intervention",
            403
          )
        );
      }
    } else {
      const unites = await Unite.findOne({
        _id: ObjectId(intervention.id_unite),
        unite_principale: ObjectId(req.unite._id),
      });
      console.log(unites)
      if (!unites) {
        return next(
          new AppError(
            "Vous n'avez pas la permission pour cette intervention",
            403
          )
        );
      }
    }
  }
  res.status(200).json({
    status: "success",
    intervention,
  });
});

exports.addDateTimeDepart = catchAsync(async (req, res) => {
  Intervention.updateOne({
    chef: req.user._id,
  }, {
    $set: {
      dateTimeDepart: dateTime,
    },
  });
  res.status(200).json({
    status: "success",
  });
});

exports.envoyerIntervention = catchAsync(async (req, res, next) => {
  console.log("envoyerIntervention : manque id_node + description");

  await Intervention.create({
    numTel: req.body.numTel,
    adresse: {
      wilaya: req.body.wilaya,
      daira: req.body.daira,
      adresse_rue: req.body.adresse_rue,
      gps_coordonnee: {
        lat: req.body.gps_coordonnee.lat,
        lng: req.body.gps_coordonnee.lng,
      },
    },
    cco_agent: req.agent._id,
    id_unite: req.agent.id_unite,
    id_node: req.body.id_node,
    dateTimeAppel: dateTime,
    statut: "envoye",
  });

  // sans await parce qu'on s'en fout des données supprimé
  // Appel.deleteOne({
  //     numTel: appel.numTel
  // });

  res.status(200).json({
    status: "success",
  });
});