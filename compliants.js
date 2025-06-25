var express = require("express")
var app=express()
var db = require("./database.js")
var common = require("./common.js")

function GetCompliantsByClinicNo(req, res, next)
{
    console.log("GetCompliantsByClinicNo---->");
    var errors=[]

    if (!req.params.id){
      errors.push("No clinic no specified");
    }

    if (errors.length){
        res.status(400).json({"error":errors.join(",")});
        return;
      }

    var sql = "SELECT * FROM compliants  WHERE CLINIC_NO = ? ORDER BY visit_date DESC  LIMIT 1;";
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


async function SaveCompliants(req, res, next)
{
    
    console.log("SaveCompliants---->");
    var errors=[]
    if (!req.body.clinic_no){
      errors.push("No clinic no specified");
    }

    const patientExists = await common.ValidatePatient(req.body.clinic_no);

    if (!patientExists) {
        errors.push("Patient with clinic number does not exist.");
    }
    

    if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
    }

    var data = {
        clinic_no : req.body.clinic_no,      
        visit_date: common.convertToSLDate(req.body.visit_date),
        com_pain: req.body.com_pain,
        com_swelling: req.body.com_swelling,
        com_shaking: req.body.com_shaking,
        com_decayed: req.body.com_decayed,
        com_cracked: req.body.com_cracked,
        com_gum: req.body.com_gum,
        com_assault: req.body.com_assault,
        com_accident: req.body.com_accident,
        com_discolor: req.body.com_discolor,        
        com_malformed: req.body.com_malformed,
        com_jutting: req.body.com_jutting,
        com_smell: req.body.com_smell,
        com_artificial: req.body.com_artificial,
        com_probartificial : req.body.com_probartificial,
        com_nonhealing: req.body.com_nonhealing,
        com_cleaning: req.body.com_cleaning,
        com_other: req.body.com_other,
        med_nothing: req.body.med_nothing,
        med_cardiac: req.body.med_cardiac,
        med_kidney: req.body.med_kidney,
        med_skeletal: req.body.med_skeletal,
        med_bleeding: req.body.med_bleeding,
        med_diabetes: req.body.med_diabetes,
        med_hypertension: req.body.med_hypertension,
        med_rheumatic: req.body.med_rheumatic,
        med_anesthetic: req.body.med_anesthetic,
        med_endocrine: req.body.med_endocrine,
        med_hepatitis: req.body.med_hepatitis,
        med_gastric: req.body.med_gastric,
        med_gastric_general: req.body.med_gastric_general,
        med_gastric_drug: req.body.med_gastric_drug,
        med_asthma: req.body.med_asthma,
        med_epilepsy: req.body.med_epilepsy,
        med_allergies: req.body.med_allergies,
        med_historyof: req.body.med_historyof,
        med_onregular: req.body.med_onregular,
        med_other: req.body.med_other,
        den_nothing: req.body.den_nothing,
        den_ffilling: req.body.den_ffilling,
        den_painafter: req.body.den_painafter,
        den_forthorx: req.body.den_forthorx,
        den_bleeding: req.body.den_bleeding,
        den_frct: req.body.den_frct,
        den_fprosthesis: req.body.den_fprosthesis,
        den_extraction: req.body.den_extraction,
        den_other: req.body.den_other,
        on_other: req.body.on_other,
        on_gingivitis: req.body.on_gingivitis,
        on_stains: req.body.on_stains,
        on_periodontitis: req.body.on_periodontitis,
        on_malocclusion: req.body.on_malocclusion,
        on_calculus: req.body.on_calculus,
        on_wear: req.body.on_wear,
        on_present: req.body.on_present,
        on_pain: req.body.on_pain,
        on_swelling: req.body.on_swelling,
        on_fractured: req.body.on_fractured,
        on_caries: req.body.on_caries,
        on_abscess: req.body.on_abscess,
        on_mobile: req.body.on_mobile,        
        create_dt: common.convertToSLDateTime(req.body.create_dt),
        create_by: req.body.create_by,
        com_code: req.body.com_code
    }

    var sql = "INSERT INTO compliants ( \
                    clinic_no, \
                    visit_date, \
                    com_pain, \
                    com_swelling, \
                    com_shaking, \
                    com_decayed, \
                    com_cracked, \
                    com_gum, \
                    com_assault, \
                    com_accident, \
                    com_discolor, \
                    com_malformed, \
                    com_jutting, \
                    com_smell, \
                    com_artificial, \
                    com_probartificial, \
                    com_nonhealing, \
                    com_cleaning, \
                    com_other, \
                    med_nothing, \
                    med_cardiac, \
                    med_kidney, \
                    med_skeletal, \
                    med_bleeding, \
                    med_diabetes, \
                    med_hypertension, \
                    med_rheumatic, \
                    med_anesthetic, \
                    med_endocrine, \
                    med_hepatitis, \
                    med_gastric, \
                    med_gastric_general, \
                    med_gastric_drug, \
                    med_asthma, \
                    med_epilepsy, \
                    med_allergies, \
                    med_historyof, \
                    med_onregular, \
                    med_other, \
                    den_nothing, \
                    den_ffilling, \
                    den_painafter, \
                    den_forthorx, \
                    den_bleeding, \
                    den_frct, \
                    den_fprosthesis, \
                    den_extraction, \
                    den_other, \
                    on_other, \
                    on_gingivitis, \
                    on_stains, \
                    on_periodontitis, \
                    on_malocclusion, \
                    on_calculus, \
                    on_wear, \
                    on_present, \
                    on_pain, \
                    on_swelling, \
                    on_fractured, \
                    on_caries, \
                    on_abscess, \
                    on_mobile, \
                    com_code, \
                    create_dt, \
                    create_by \
                ) \
                VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";

                var params = [
                    data.clinic_no,
                    data.visit_date,
                    data.com_pain,
                    data.com_swelling, 
                    data.com_shaking,
                    data.com_decayed, 
                    data.com_cracked,
                    data.com_gum,
                    data.com_assault,
                    data.com_accident,
                    data.com_discolor,
                    data.com_malformed,
                    data.com_jutting,
                    data.com_smell,
                    data.com_artificial,
                    data.com_probartificial,
                    data.com_nonhealing,
                    data.com_cleaning,
                    data.com_other,
                    data.med_nothing,
                    data.med_cardiac,
                    data.med_kidney,
                    data.med_skeletal,
                    data.med_bleeding,
                    data.med_diabetes,
                    data.med_hypertension,
                    data.med_rheumatic,
                    data.med_anesthetic,
                    data.med_endocrine,
                    data.med_hepatitis,
                    data.med_gastric,
                    data.med_gastric_general,
                    data.med_gastric_drug,
                    data.med_asthma,
                    data.med_epilepsy,
                    data.med_allergies,
                    data.med_historyof,
                    data.med_onregular,
                    data.med_other,
                    data.den_nothing,
                    data.den_ffilling,
                    data.den_painafter,
                    data.den_forthorx,
                    data.den_bleeding,
                    data.den_frct,
                    data.den_fprosthesis,
                    data.den_extraction,
                    data.den_other,
                    data.on_other,
                    data.on_gingivitis,
                    data.on_stains,
                    data.on_periodontitis,
                    data.on_malocclusion,
                    data.on_calculus,
                    data.on_wear,
                    data.on_present,
                    data.on_pain,
                    data.on_swelling,
                    data.on_fractured,
                    data.on_caries,
                    data.on_abscess,
                    data.on_mobile,
                    data.com_code,                     
                    data.create_dt,
                    data.create_by
                  ]
    db.query(sql, params, (err, rows) => {
    if (err) {
        res.status(400).json({"error":err.message});
        return;
    }
    res.json({
        "message":"success",
        "data":this.lastId
    })
 });

}

function UpdateCompliants(req, res, next)
{
    console.log("UpdateCompliants---->");
    var errors=[]
    if (!req.body.clinic_no){
      errors.push("No clinic no specified");
    }

    if (!req.body.id){
        errors.push("No id specified");
      }

    if (errors.length){
      res.status(400).json({"error":errors.join(",")});
      return;
    }

    var data = {
        id : req.body.id,
        com_pain: req.body.com_pain,
        com_swelling: req.body.com_swelling,
        com_shaking: req.body.com_shaking,
        com_decayed: req.body.com_decayed,
        com_cracked: req.body.com_cracked,
        com_gum: req.body.com_gum,
        com_assault: req.body.com_assault,
        com_accident: req.body.com_accident,
        com_discolor: req.body.com_discolor,        
        com_malformed: req.body.com_malformed,
        com_jutting: req.body.com_jutting,
        com_smell: req.body.com_smell,
        com_artificial: req.body.com_artificial,
        com_probartificial : req.body.com_probartificial,
        com_nonhealing: req.body.com_nonhealing,
        com_cleaning: req.body.com_cleaning,
        com_other: req.body.com_other,
        med_nothing: req.body.med_nothing,
        med_cardiac: req.body.med_cardiac,
        med_kidney: req.body.med_kidney,
        med_skeletal: req.body.med_skeletal,
        med_bleeding: req.body.med_bleeding,
        med_diabetes: req.body.med_diabetes,
        med_hypertension: req.body.med_hypertension,
        med_rheumatic: req.body.med_rheumatic,
        med_anesthetic: req.body.med_anesthetic,
        med_endocrine: req.body.med_endocrine,
        med_hepatitis: req.body.med_hepatitis,
        med_gastric: req.body.med_gastric,
        med_gastric_general: req.body.med_gastric_general,
        med_gastric_drug: req.body.med_gastric_drug,
        med_asthma: req.body.med_asthma,
        med_epilepsy: req.body.med_epilepsy,
        med_allergies: req.body.med_allergies,
        med_historyof: req.body.med_historyof,
        med_onregular: req.body.med_onregular,
        med_other: req.body.med_other,
        den_nothing: req.body.den_nothing,
        den_ffilling: req.body.den_ffilling,
        den_painafter: req.body.den_painafter,
        den_forthorx: req.body.den_forthorx,
        den_bleeding: req.body.den_bleeding,
        den_frct: req.body.den_frct,
        den_fprosthesis: req.body.den_fprosthesis,
        den_extraction: req.body.den_extraction,
        den_other: req.body.den_other,
        on_other: req.body.on_other,
        on_gingivitis: req.body.on_gingivitis,
        on_stains: req.body.on_stains,
        on_periodontitis: req.body.on_periodontitis,
        on_malocclusion: req.body.on_malocclusion,
        on_calculus: req.body.on_calculus,
        on_wear: req.body.on_wear,
        on_present: req.body.on_present,
        on_pain: req.body.on_pain,
        on_swelling: req.body.on_swelling,
        on_fractured: req.body.on_fractured,
        on_caries: req.body.on_caries,
        on_abscess: req.body.on_abscess,
        on_mobile: req.body.on_mobile,        
        update_dt: common.convertToSLDateTime(req.body.update_dt),
        update_by: req.body.update_by,
        com_code: req.body.com_code
    }

    var sql = "UPDATE compliants  \
                    SET com_pain =?,  \
                        com_swelling = ?,\
                        com_shaking = ?, \
                        com_decayed = ?, \
                        com_cracked = ?, \
                        com_gum = ?, \
                        com_assault = ?, \
                        com_accident = ?, \
                        com_discolor = ?, \
                        com_malformed = ?, \
                        com_jutting = ?, \
                        com_smell = ?, \
                        com_artificial = ?, \
                        com_probartificial = ?, \
                        com_nonhealing = ?, \
                        com_cleaning = ?, \
                        com_other = ?, \
                        med_nothing = ?, \
                        med_cardiac = ?, \
                        med_kidney = ?, \
                        med_skeletal = ?, \
                        med_bleeding = ?, \
                        med_diabetes = ?, \
                        med_hypertension = ?, \
                        med_rheumatic = ?, \
                        med_anesthetic = ?, \
                        med_endocrine = ?, \
                        med_hepatitis = ?, \
                        med_gastric = ?, \
                        med_gastric_general = ?, \
                        med_gastric_drug = ?, \
                        med_asthma = ?, \
                        med_epilepsy = ?, \
                        med_allergies = ?, \
                        med_historyof = ?, \
                        med_onregular = ?, \
                        med_other = ?, \
                        den_nothing = ?, \
                        den_ffilling = ?, \
                        den_painafter = ?, \
                        den_forthorx = ?, \
                        den_bleeding = ?, \
                        den_frct = ?, \
                        den_fprosthesis = ?, \
                        den_extraction = ?, \
                        den_other = ?, \
                        on_other = ?, \
                        on_gingivitis = ?, \
                        on_stains = ?, \
                        on_periodontitis = ?, \
                        on_malocclusion = ?, \
                        on_calculus = ?, \
                        on_wear = ?, \
                        on_present = ?, \
                        on_pain = ?, \
                        on_swelling = ?, \
                        on_fractured = ?, \
                        on_caries = ?, \
                        on_abscess = ?, \
                        on_mobile = ?, \
                        update_dt = ?, \
                        update_by = ? \
                WHERE id = ?  "  ;

        var params = [
                        data.com_pain,
                        data.com_swelling, 
                        data.com_shaking,
                        data.com_decayed, 
                        data.com_cracked,
                        data.com_gum,
                        data.com_assault,
                        data.com_accident,
                        data.com_discolor,
                        data.com_malformed,
                        data.com_jutting,
                        data.com_smell,
                        data.com_artificial,
                        data.com_probartificial,
                        data.com_nonhealing,
                        data.com_cleaning,
                        data.com_other,
                        data.med_nothing,
                        data.med_cardiac,
                        data.med_kidney,
                        data.med_skeletal,
                        data.med_bleeding,
                        data.med_diabetes,
                        data.med_hypertension,
                        data.med_rheumatic,
                        data.med_anesthetic,
                        data.med_endocrine,
                        data.med_hepatitis,
                        data.med_gastric,
                        data.med_gastric_general,
                        data.med_gastric_drug,
                        data.med_asthma,
                        data.med_epilepsy,
                        data.med_allergies,
                        data.med_historyof,
                        data.med_onregular,
                        data.med_other,
                        data.den_nothing,
                        data.den_ffilling,
                        data.den_painafter,
                        data.den_forthorx,
                        data.den_bleeding,
                        data.den_frct,
                        data.den_fprosthesis,
                        data.den_extraction,
                        data.den_other,
                        data.on_other,
                        data.on_gingivitis,
                        data.on_stains,
                        data.on_periodontitis,
                        data.on_malocclusion,
                        data.on_calculus,
                        data.on_wear,
                        data.on_present,
                        data.on_pain,
                        data.on_swelling,
                        data.on_fractured,
                        data.on_caries,
                        data.on_abscess,
                        data.on_mobile,
                        data.update_dt,
                        data.update_by,
                        data.id
                     ];

    db.query(sql, params, (err, rows) => {
    if (err) {
        console.error("Update error:", err);
        res.status(400).json({"error":err.message});
        return;
    }

    res.json({
        "message":"success",
        "data":data.com_pain
    })
    });
}

module.exports = {
    GetCompliantsByClinicNo,
    SaveCompliants,
    UpdateCompliants
}
