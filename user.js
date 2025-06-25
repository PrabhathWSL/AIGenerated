var express = require("express")
var app=express()
var db = require("./database.js")


function AuthorizedUserLogin(req, res, next)
{
  console.log("AuthenticateUserLogin---->");
  const sql = "SELECT username, profile_pic, com_code FROM users WHERE userid=? AND password=?";
  var data = {
    userid: req.body.userid,
    password: req.body.password
}

var params =[
        data.userid,
        data.password
    ]

  db.query(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
   
    res.json({
        "message":"success",
        "data":rows
    })
  });
}

function GetUserPermission(req, res, next)
{
  console.log("GetUserPermission---->");
  const sql = "SELECT p.permission as permission  \
                    FROM user_role as u,role_permissions as r, permissions as p \
                    where u.role_id=r.role_id  \
                      and r.permission_id=p.id \
                      and u.userid=? order by p.seq asc";
  var params = [req.params.id]

  db.query(sql, params, (err, rows) => {
    if (err) {
      res.status(400).json({"error":err.message});
      return;
    }
    res.json({
        "message":"success",
        "data":rows
    })
  });
}

function UpdatePassword(req, res, next) {
  console.log("UpdatePassword---->");


  var errors=[]
  if (!req.params.userid){
    errors.push("User id no specified");
  }

  if (!req.params.newPassword){
      errors.push("New password not specified");
    }

  if (!req.params.oldPassword){
      errors.push("Old password not specified");
    }    

  if (errors.length){
    res.status(400).json({"error":errors.join(",")});
    return;
  }

  // Assuming you have a 'users' table in your database
  const sql = 'SELECT password FROM users WHERE userid = ?';
  const params = [req.params.userid];
  

  db.query(sql, params, (err, row) => {
    if (err) {
      res.status(500).json({ "error": err.message });
      return;
    }

    // Check if the user exists
    if (!row) {
      res.status(400).json({ "error": "User not found" });
      return;
    }

    const hashedOldPassword = row[0].password;

    // Compare the old password with the stored hashed password
  var isMatch =true;
      if (hashedOldPassword!=req.params.oldPassword) {
        res.status(500).json({ "error": "Old password is not matched!" });
        isMatch=false;
        return;
      }

      if (isMatch) {
        // Old password matches, update the password with the new one

        const updateSql = 'UPDATE users SET password = ? WHERE userid = ?';
        const updateParams = [req.params.newPassword, req.params.userid];

        db.query(updateSql, updateParams, (updateErr) => {
          if (updateErr) {
            res.status(500).json({ "error": updateErr.message });
            return;
          }

          res.json({ "message": "Password updated successfully" });
        });
      } else {
        res.status(400).json({ "error": "Old password does not match" });
      }
    });

}


module.exports = {
    AuthorizedUserLogin,
    GetUserPermission,
    UpdatePassword
    
  }
