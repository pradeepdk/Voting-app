var mongoose = require('mongoose');

const votingSchema = mongoose.Schema({
    title:{
        type:String,
        required:true,
        unique:true
    },
    contestants:Array,
});

module.exports = mongoose.model('VotingModel',votingSchema);