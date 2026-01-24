const mongoose = require("mongoose");


const resumeSchema = new mongoose.Schema({
    userId: {
       type:mongoose.Schema.Types.ObjectId,
       ref:"User",
       
    },
    orginalText: String,
      
    
    parsedData: {
       skills:[String],
       experienceLevel:String,
       domains:[String]
     } ,
       version: Number
},
      { timestamps: true }
);

const Resume = mongoose.model('Resume', resumeSchema);
module.exports = Resume