require('dotenv').config()
var express = require("express")
const cookieParser = require('cookie-parser'); // Import cookie-parser
var cors = require('cors');
const fs = require('fs');

const cors_origin = process.env.CORS_ORIGIN.split(',');

var app=express()
app.use(cors({
  origin: cors_origin,
  credentials: true,
  allowedHeaders: ['Content-Type', 'x-access-token'],

}));

var bodyParser = require("body-parser");
app.use(cookieParser()); // Use cookie-parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

var db = require("./database.js")
var md5 = require("md5")
const { VerifyToken } = require("./VerifyToken");
var { GenerateToken } = require("./GenerateToken");
const { RefreshToken } = require('./RefreshToken.js');
const { Logout } = require("./Logout.js");

var multer = require('multer');
var path = require('path');
var router = express.Router();


//server port
var port=process.env.PORT

//#region mico-services
var advanced_prosthesis = require("./advanced_prosthesis.js")
var appointment = require("./appointment.js")
var compliants = require("./compliants.js")
var orthodontics = require("./orthodontics.js")
var patient = require("./patient.js")
var rct = require("./rct.js")
var removable_prosthesis = require("./removable_prosthesis.js")
var treatment = require("./treatment.js")
var user = require("./user.js")
//#endregion mico-services

//#region Server Level Function


app.listen(port,()=>{
    console.log("Server is running on port " + port)
});

//#Token Generation
app.post('/login', GenerateToken);
// Logout endpoint
app.post('/logout', Logout); // Use the Logout module here
app.get('/protected', VerifyToken, (req, res) => {
  res.send('This is a protected route');
});

// Refresh token route
app.post('/refresh-token', RefreshToken);
//root endpoint
app.get("/",(req,res,next)=>{res.json({"message":"You are dealing with risk and confidential area which can be legaly actioned."})});

//insert here other API endpoints
app.get("/version", (req, res, next) => {
    var sql = "select * from version order by id desc"
    var params = []
    db.query(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.send((rows[0]));//{
        //    "message":"success",
        //    "data":rows
        //})
      });
});

//#endregion Server Level Function

//#region FileUpload/ Download Functions

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const folderName = req.body.folderName || 'defaultFolder';
    const destinationPath = path.join(process.env.NEW_IMAGE_PATH, folderName);

    if (!fs.existsSync(destinationPath)) {
      try {
        fs.mkdirSync(destinationPath, { recursive: true });
      } catch (err) {
        console.error('Error creating directory:', err);
        // Handle the error, perhaps by sending an error response to the client
        return cb(err);
      }
    }

    cb(null, destinationPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});


const upload = multer({ storage: storage });

//app.use('/ProfileImages', express.static('C:/orodataplus_images'));
app.use('/ProfileImages', express.static(path.join(__dirname, process.env.NEW_IMAGE_PATH)));


app.post('/ProfileImages', upload.single('image'), (req, res) => {
  try {
    const imageUrl = req.file.filename;
    const imagePath = path.join(req.body.folderName || 'defaultFolder', imageUrl);
    
    // Save only the filename to the database
    // Example: const image = new ImageModel({ filename: imageUrl });
    //          image.save();

    res.json({ imageUrl: imagePath });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.post('/ClinicImages', upload.array('image', 10), (req, res) => {
  try {
    const imageUrls = req.files.map(file => path.join(req.body.folderName || 'defaultFolder', file.filename));
    res.json({ imageUrls });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/image/:folderName/:filename', (req, res) => {
  console.log("/image/:folderName/:filename---->");
  const filename = req.params.filename;
  const folderName = req.params.folderName;
  const imagePath = path.join( process.env.NEW_IMAGE_PATH,folderName, filename);
  console.log(":imagePath'---->" + imagePath);

  // Send the image file
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(404).send("Image not found");
    }
  });
});

app.get('/image/:folderName1/:folderName2/:filename', (req, res) => {
  console.log("/image/:folderName1/:folderName2/:filename---->");
  const filename = req.params.filename;
  const folderName1 = req.params.folderName1;
  const folderName2 = req.params.folderName2;
  const imagePath = path.join( process.env.NEW_IMAGE_PATH,folderName1,folderName2, filename);
  console.log(":imagePath'---->" + imagePath);

  // Send the image file
  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(404).send("Image not found");
    }
  });
});

/* app.get('/image/*', (req, res) => {
  console.log("/image/*---->");
  const pathParts = req.params[0].split('/');
  const filename = pathParts.pop(); // Extract the filename (last part of the path)
  const folderPath = path.join(process.env.NEW_IMAGE_PATH, ...pathParts); // Join the remaining parts as folders
  const imagePath = path.join(folderPath, filename);

  console.log("imagePath---->" + imagePath);

  res.sendFile(imagePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(404).send("Image not found");
    }
  });
}); */



app.get('/get-images', (req, res) => {
  console.log("/get-images---->");
  const clinicNo = req.query.clinicNo;
  console.log(clinicNo);
  const folderName = path.join(process.env.NEW_IMAGE_PATH, clinicNo);

  // Check if the folder exists
  if (!fs.existsSync(folderName)) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  // Read the files in the folder
  fs.readdir(folderName, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    // Filter out non-image files if necessary
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif'];
    const images = files.filter(file => {
      const ext = path.extname(file).toLowerCase();
      return imageExtensions.includes(ext);
    }).map(file => `${clinicNo}/${file}`); // Construct the relative URL path
    console.log(images);
    res.json({ images });
  });
});

app.delete('/delete-image', async (req, res) => {
  console.log("/delete-image---->");
  const { image } = req.body;
  console.log("/delete-image---->"+image);
  const { folderName, subfolder, filename } = extractFileInfo(image);
  console.log("/delete-image---->folderName :" + folderName);
  console.log("/delete-image---->subfolder :" + subfolder);
  console.log("/delete-image---->filename :" + filename);
  const imagePath = path.join(process.env.NEW_IMAGE_PATH, folderName, subfolder, filename);
  console.log("/delete-image---->imagePath :" + imagePath);
  try {
    fs.unlinkSync(imagePath);

    console.log(`Deleted image: ${image}`);
    res.status(200).json({ message: 'Image deleted successfully' });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Function to extract folder, subfolder, and filename from URL
const extractFileInfo = (imageUrl) => {
  console.log("extractFileInfo---->"+imageUrl);
  // Remove 'http://' or 'https://' and the domain part
  let imagePath = imageUrl.replace(/^https?:\/\/[^/]+/, '');
  console.log("imagePath---->"+imagePath);
  // Remove '/image/' part
  imagePath = imagePath.replace(/^\/image\//, '');
  console.log("imagePath---->"+imagePath);

  // Split the remaining path into folderName, subfolder, and filename
  const parts = imagePath.split('/');
  const folderName = parts[0];
  const subfolder = parts[1];
  const filename = parts[2];

  return { folderName, subfolder, filename };
};


//#endregion FileUpload/ Download Functions

//#region advanced_prosthesis


app.get("/advanced_prosthesis/byClinicNo/:id",VerifyToken, (req, res, next) => {
  advanced_prosthesis.GetAdvanceProsthesisByClinicNo(req, res, next);
});

app.get("/advanced_prosthesis/byId/:id",VerifyToken, (req, res, next) => {
  advanced_prosthesis.GetAdvanceProsthesisById(req, res, next);
});

app.get("/advanced_prosthesis/visit/:id",VerifyToken, (req, res, next) => {
  advanced_prosthesis.GetAdvanceProsthesisVisitsByClinicNo(req, res, next);
});

app.post("/advanced_prosthesis/save",VerifyToken, (req, res, next) => {
  advanced_prosthesis.SaveAdvanceProsthesis(req, res, next);
});

app.put("/advanced_prosthesis/edit",VerifyToken, (req, res, next) => {
  advanced_prosthesis.UpdateAdvanceProsthesis(req, res, next);
});

//#endregion advanced_prosthesis

//#region appointment
 
app.get("/appointment/asattoday",VerifyToken, (req, res, next) => {
  appointment.GetAppointmentsByToday(req, res,next);
});


app.post("/appointment/save",VerifyToken, (req, res, next) => {
  appointment.SaveAppointment(req, res,next);
});

app.put("/appointment/updatestatus",VerifyToken, (req, res, next) => {
  appointment.UpdateAppointmentStatus(req, res,next);
});

//#endregion appointment

//#region compliants
app.post("/compliants/save",VerifyToken, (req, res, next) => {
  compliants.SaveCompliants(req, res, next);
});

app.get("/compliants/all/:id",VerifyToken, (req, res, next) => {
  compliants.GetCompliantsByClinicNo(req, res, next);
});

app.put("/compliants/edit",VerifyToken, (req, res, next) => {
  compliants.UpdateCompliants(req, res, next);
});
//#endregion compliants

//#region history
app.get("/api/history",VerifyToken, (req, res, next) => {
    var sql = "select * from history"
    var params = []
    db.all(sql, params, (err, rows) => {
        if (err) {
          res.status(400).json({"error":err.message});
          return;
        }
        res.json({
            "message":"success",
            "data":rows
        })
      });
});
//#endregion history

//#region orthodontics
app.post("/orthodontics/save",VerifyToken, (req, res, next) => {
  orthodontics.SaveOrthodontics(req, res, next);
});

app.get("/orthodontics/byclinicno/:id",VerifyToken, (req, res, next) => {
  orthodontics.GetOrthodonticsByClinicNo(req, res, next);
});

app.get("/orthodontics/byid/:id",VerifyToken, (req, res, next) => {
  orthodontics.GetOrthodonticsByID(req, res, next);
});

app.get("/orthodontics/visit/:id",VerifyToken, (req, res, next) => {
  orthodontics.GetOrthodonticVisitsByClinicNo(req, res, next);
});

app.put("/orthodontics/edit",VerifyToken, (req, res, next) => {
  orthodontics.UpdateOrthodontics(req, res, next);
});
//#endregion orthodontics

//#region patient
app.get("/patient/byfirstname/:firstname/:next",VerifyToken, (req, res, next) => {
    patient.GetPatientByFirstName(req,res,next);
});

app.get("/patient/bymiddlename/:middlename/:next",VerifyToken, (req, res, next) => {
  patient.GetPatientByMiddleName(req,res,next);
});

app.get("/patient/bylastname/:lastname/:next",VerifyToken, (req, res, next) => {
  patient.GetPatientByLastName(req,res,next);
});

app.get("/patient/bynic/:nic/:next",VerifyToken, (req, res, next) => {
  patient.GetPatientByNic(req,res,next);
});

app.get("/patient/bycity/:city/:next",VerifyToken, (req, res, next) => {
  patient.GetPatientByCity(req,res,next);
});

app.get("/patient/bybirthday/:date/:next",VerifyToken, (req, res, next) => {
  patient.GetPatientByBirthDay(req,res,next);
});

app.get("/patient/byclinicno/:clinicno/:next",VerifyToken, (req, res, next) => {
  patient.GetPatientByClinicNo(req,res,next);
});

app.post("/patient/save",VerifyToken, async (req, res) => {
  patient.SavePatient(req,res);
});

app.put("/patient/edit",VerifyToken, async (req, res) => {
  patient.UpdatePatient(req,res);
});

app.get("/patient/nextclinicno/:com_code",VerifyToken, async (req, res) => {
  patient.GetNextClinicNo(req,res);
});

//app.post('/patient/save',VerifyToken, upload.single('profile_pic'), patient.SavePatient);


//#endregion patient

//#region rct
app.post("/rct/save", (req, res, next) => {
  rct.SaveRct(req, res, next);
});

app.get("/rct/byclinicno/:id",VerifyToken, (req, res, next) => {
  rct.GetRctByClinicNo(req, res, next);
});

app.get("/rct/byid/:id",VerifyToken, (req, res, next) => {
  rct.GetRctById(req, res, next);
});

app.get("/rct/visit/:id",VerifyToken, (req, res, next) => {
  rct.GetRctVisitsByClinicNo(req, res, next);
});

app.put("/rct/edit",VerifyToken, (req, res, next) => {
  rct.UpdateRct(req, res, next);
});
//#endregion rct

//#region removable_prosthesis

app.post("/rem_prosthesis/save", VerifyToken,(req, res, next) => {
  removable_prosthesis.SaveRemovableProsthesis(req, res, next);
});

app.get("/rem_prosthesis/byClinicNo/:id",VerifyToken, (req, res, next) => {
  removable_prosthesis.GetRemovableProsthesisByClinicNo(req, res, next);
});

app.get("/rem_prosthesis/byId/:id",VerifyToken, (req, res, next) => {
  removable_prosthesis.GetRemovableProsthesisById(req, res, next);
});

app.get("/rem_prosthesis/visit/:id",VerifyToken, (req, res, next) => {
  removable_prosthesis.GetRemovableProsthesisVisitsByClinicNo(req, res, next);
});

app.put("/rem_prosthesis/edit",VerifyToken, (req, res, next) => {
  removable_prosthesis.UpdateRemovableProsthesis(req, res, next);
});

//#endregion removable_prosthesis

//#region treatment
app.post("/treatment/save", (req, res, next) => {
  treatment.SaveTreatment(req, res, next);
});

app.get("/treatment/all/:id",VerifyToken, (req, res, next) => {
  treatment.GetTreatmentByClinicNo(req, res, next);
});

app.get("/treatment/id/:id",VerifyToken, (req, res, next) => {
  treatment.GetTreatmentById(req, res, next);
});

app.put("/treatment/edit",VerifyToken, (req, res, next) => {
  treatment.UpdateTreatment(req, res, next);
});

app.get("/treatment/visit/:id",VerifyToken, (req, res, next) => {
  console.log('visits');
  treatment.GetTreatmentVisitsByClinicNo(req, res, next);
});

//#endregion treatment

//#region user

app.post("/user/authorize", VerifyToken,(req, res, next) => {
  user.AuthorizedUserLogin(req, res,next);
});

app.get("/user/permission/:id",VerifyToken, (req, res, next) => {
  user.GetUserPermission(req, res,next);
});

app.put("/user/updatepassword/:userid/:oldPassword/:newPassword",VerifyToken, (req, res, next) => {
  user.UpdatePassword(req, res,next);
});



//#endregion User

//Default response for any other request
//app.use(function(req,res){res.status(404)});
