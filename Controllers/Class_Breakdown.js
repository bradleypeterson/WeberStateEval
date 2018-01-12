//right here you should take the data passed in from selection flow and put it into an array
//formatted such as ["crn-semester-year","crn-semester-year"] for each course selected in the else 
//part of the statement. The first part is if the URL has arguments such as:
//https://chitester1dev.weber.edu:6838/misc/weber/csevals/class_breakdown.html?CRN=30611&Semester=3&Year=2013
//other wise the URL will have no arguments and you will use the data from selection flow.
var crnArray = [];
crn = getURLParameter('CRN');
if (crn != null) {
    semester = getURLParameter('Semester');
    year = getURLParameter('Year');
    crnArray.push(crn+"-"+semester+"-"+year);
} else {
    //this should come from selection flow but it is hard coded for now.
    crnArray = ["30611-3-2013", "30611-3-2013", "30611-3-2013"];
}


window.onload = (function () {
    loadCRNData(crnArray);
});