
const express = require('express');
const fs = require('fs')
var fileupload = require("express-fileupload");
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
const { exec } = require("child_process");
const app = express();
const host = process.env.HOST
const port = 1234;


const converted_dir = 'images';
app.use(express.static(converted_dir));
app.use(fileupload());

app.get('/test', (req, res) => {
    res.send("Working");
});


app.get('/delete', (req, res) => {

    fs.readdir(converted_dir, (err, files) => {
        if (err) {
            console.log(err);
            res.send({status: 'error', message: err});
            return;
        } 
      
       
        if(files.length == 0){
            // console.log("empty dir")
            res.send({status: 'success', message: "Empty dir"});
            return;
        }

       
        for (const file of files) {

          fs.unlink(path.join(converted_dir, file), err => {
            if (err) {
                console.log(err);
                res.send({status: 'error', message: err});
                return;
            } 
          });

         
        }

        
        res.send({status: 'success', message: "deleted all files"});
        return;

      });


});

app.post('/convert', (req, res) => {
    var file;
    if(!req.files)
    {
        res.send("File was not found");
        return;
    }
    file = req.files.file;  // here is the field name of the form
    var fileLocation = converted_dir+'/'+file.name;
    file.mv( fileLocation, function(err) {
        if (err) {

            res.send({status: 'error', message: err});

            console.log(err);
        }
        // console.log(file);
     exec(`soffice --headless --convert-to html  ${fileLocation} --outdir ${converted_dir}`, (error, stdout, stderr) => {
    if (error) {
        console.log(`error: ${error.message}`);
        res.send({status: 'error', message: error});

        return;
    }

    // if (stderr) {
    //     console.log(`stderr: ${stderr}`);
    //     res.send({status: 'error', message: stderr});
    //     return;
    // }


    var images = [];
    fs.readdir(converted_dir, (err, files) => {

        if (err) {
            console.log(`err: ${err}`);
            res.send({status: 'error', message: err});
            return;
        }

        files.forEach(file => {
            if(file.includes(".jpg") || file.includes(".png")){
                console.log(file);
                images.push(`http://${host}:${port}/`+file);
            }
          
        });

        res.send({status : 'success', files: images});

        //TODO dont forget to delete the images after some time
      });

   

    console.log(`stdout: ${stdout}`);
});



       

    });

  

});
app.listen(port,'0.0.0.0', () => console.log(`Example app listening on http://${host}:${port}/`))

