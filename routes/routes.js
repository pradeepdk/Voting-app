var mongoose = require('mongoose');
var VotingModel = require('../data/model');

var appRouter = function (app) {
   
    app.post('/createpoll', (req, res, next) => {

        let titleToSave = req.body.title;
        let contestantArray = [];

        let contestantsReq = req.body.contestants;
        contestantsReq = contestantsReq.split('\n');

        for (let i = 0; i < contestantsReq.length; i++) {
            
            if(!contestantsReq[i])
                continue;

            contestantArray.push({
                "name": contestantsReq[i],
                "votes": 0
            });
        }


        let votingModel = new VotingModel({
            title: titleToSave,
            contestants: contestantArray
        });

        votingModel.save().then(result => {
          
            res.status('200').send({
                message: "Success",
                createdObject: votingModel
            });
        }).catch(err => {
            
            let message = "Something went wrong!!"
            if (err.code && err.code === 11000) {
                message = "duplicate poll";
            }
            res.status('500').send({
                message: "Server Error!!"
            });
        });

    });

    app.get('/getall' , (req,res,next) => {
        VotingModel.find().exec()
        .then(result => {
            res.status('200').json(result);
        })
        .catch(err => {
            res.status('500').send({
                message: "Server Error!!"
            });
        })
    });
    app.get('/getpoll/:id', (req, res, next) => {
        let id = req.params.id;
        VotingModel.findById(id).exec().then(result => {
            res.status('200').send(result);
        }).catch(err => {
            res.status('500').send({
                message: "Server Error!!"
            });
        });
    });

    app.patch('/updatepoll/:id', (req,res,next) => {
        let id = req.params.id;
        let name = req.body.name;

        VotingModel.update({"_id" : id , "contestants.name" : name}, {$inc: { "contestants.$.votes" : 1}})
        .exec()
        .then(result => {
            res.status('200').json(result);
        })
        .catch(err => {
            res.send('500').send({
                message: "Server Error!!"
            });
        });

    });

    app.delete('/deletepoll/:id', (req,res,next) => {
        let id = req.params.id;
        VotingModel.remove({"_id" : id}).exec()
        .then(result => {
            res.status('200').send("Success");
        })
        .catch(err => {
            res.status('500').send({
                message: "Server Error!!"
            });
        })
    });
}



module.exports = appRouter;