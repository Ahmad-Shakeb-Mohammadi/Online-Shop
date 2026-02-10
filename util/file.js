const fs = require("fs")

const deleteFile = (pathurl)=>{
    fs.unlink(pathurl,(err)=>{
        if(err){
            console.log(err);
        }
    })
}

exports.deleteFile = deleteFile;