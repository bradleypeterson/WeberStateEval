

var Report = (function() {
	//This is where the data is being pulled from
	//Change to call from our API(?)
    var TEST_URL = "https://chitester1dev.weber.edu:6838/misc/weber/csevals/";
    //&callback=? to fix callback not being called error 
    var IsRunningInTest = true;

    crnArray = [];

    /**
     *
     */
    self.onLoad = function (){
      if (IsRunningInTest) {
        GetClassesTaughtByInstructorTesting();
      } else {
        GetClassesTaughtByInstructor();
      }
    }

    /**
     * Get User ID from url
     * @return return user ID
     */
    function getURLParameter(name) {
        return decodeURIComponent(
			(new RegExp('[?|&]' + name + '=' + '([^&;]+?)(&|#|;|$)').exec(location.search) || [, ""])
			[1].replace(/\+/g, '%20')
		) || null;
    }

    /**
     * Get Classes taught by Instructor ID from URL
     * passes the CRN Array onto Load CRN Data Function
     */
    function GetClassesTaughtByInstructor() {

      // Get instructorID from url
      instructorID = getURLParameter('instructorID');
      // download instructor crn's
      var InstructorClassesTaughtUrl = IsRunningInTest ? TEST_URL + "InstructorClassesTaught.cfm" : "InstructorClassesTaught.cfm";
      // verify that instructorID is valid
      if (instructorID == null || instructorID == "" || instructorID == 0)
      {
        $.ajax({
          url: InstructorClassesTaughtUrl,
          type: "GET",
          dataType: "json",
          success: function (data) {
              //data = JSON.parse(data);
              crnArray = [];
              if (data.DATA.length == 0) {
                  return;
              }

              $.each(data.DATA, function (i, array) {
                  var dataArray = toKeyValPair(data.COLUMNS, array);
                  crnArray.push(dataArray["BANNERCRN"] + "-" + dataArray["SEMESTER"] + "-" + dataArray["YEAR"]);
              });

              loadCRNData(crnArray);
            }
          });
      }
      else
      {
          instructorID = parseInt(instructorID);
          $.ajax({
            url: InstructorClassesTaughtUrl + '?instructorID=' + instructorID,
            type: "GET",
            dataType: "json",
            success: function (data) {
              //data = JSON.parse(data);
              crnArray = [];
              if (data.DATA.length == 0) {
                  return;
              }

              $.each(data.DATA, function (i, array) {
                  var dataArray = toKeyValPair(data.COLUMNS, array);
                  crnArray.push(dataArray["BANNERCRN"] + "-" + dataArray["SEMESTER"] + "-" + dataArray["YEAR"]);
              });

              loadCRNData(crnArray);
            }
          });
      }
    }

    /**
     * TESTING - Get Classes Taught by Insructor is Mocking the return Json from server
     * Passes on CRN Array data onto Load Crn Data Function
     */
    function GetClassesTaughtByInstructorTesting() {
	
      var data = JSON.parse('{"COLUMNS":["SECTIONID","SEMESTER","YEAR","BANNERCRN"], "DATA":[[192511,3,2013,30611]]}');

      crnArray = [];
      if (data.DATA.length == 0) {
          return;
      }

      $.each(data.DATA, function (i, array) {
          var dataArray = toKeyValPair(data.COLUMNS, array);
          crnArray.push(dataArray["BANNERCRN"] + "-" + dataArray["SEMESTER"] + "-" + dataArray["YEAR"]);
      });

      loadCRNData(crnArray);
    }

    function onReportComplete(elementList) {

        //document.getElementById('instructorName').innerHTML += elementList[0].firstName + " " + elementList[0].lastName;
        //loadChart and generate Table expect a list of objects that contain properties for it to use.
        /*
        * firstName
        * lastName
        * semesterName
        * semesterNum
        * year
        * score
        */
        loadChart(elementList);
        generateTable(elementList);
    }


    function getPixelLength(score) {
        return score * 100;
    }

    function normPixelLength(currentLengths) {
        var variance = 0;

        var max = 0;
        var maxIndex = 0;

        for (var i = 0; i < currentLengths.length; i++) {
            variance += Math.round(currentLengths[i]);
            if (currentLengths[i] > max) {
                maxIndex = i;
                max = currentLengths[i];
            }
            currentLengths[i] = Math.round(currentLengths[i]);
        }

        variance -= totalBarLength;
        currentLengths[maxIndex] = currentLengths[maxIndex] - variance;
        return currentLengths;
    }

    function getPixelLengthBasic(currentSD, currentD, currentN, currentA, currentSA, currentNA, currentTotal) {
        var result = [];
        result.push(getAnswerLength(currentSD, currentTotal));
        result.push(getAnswerLength(currentD, currentTotal));
        result.push(getAnswerLength(currentN, currentTotal));
        result.push(getAnswerLength(currentA, currentTotal));
        result.push(getAnswerLength(currentSA, currentTotal));
        result.push(getAnswerLength(currentNA, currentTotal));
        return result;
    }

    function getAnswerLength(answerCount, currentTotal) {
        if (answerCount == 0 || currentTotal == 0) {
            return 0;
        }
        var returnValue = ((answerCount / currentTotal) * window.totalBarLength);
        returnValue *= 10;
        returnValue = Math.floor(returnValue);
        returnValue /= 10;
        return returnValue;
    }

    //ESSAY QUERY FUNCTION*************************************************************************************************************************************************
    /**
    *
    */

    function essayQuery(element, crn, semester, year) {
        //jQuery.getJSON('/misc/weber/CSEvals/essayAnswers.cfm?crn='+crn+'&semester='+semester+'&year='+year, function(data)
        var essayAnswersUrl = IsRunningInTest ? TEST_URL + "EssayAnswers.cfm?crn=" : "EssayAnswers.cfm?crn=";
        $.ajax({
          url: essayAnswersUrl + crn + '&semester=' + semester + '&year=' + year,
          type: "GET",
          dataType: "json",
          success: function (data) {
              data = {"COLUMNS":["ID","CRN","SUBJECTCODE","COURSENUMBER","SEMESTER","BLOCK","ID","ID","QUESTION","ANSWER","STUDENT"],"DATA":[[192511,30611,"CS",2420,3,null,3979607,146955418,"What did you particularly like about this course?","I really liked the content, we learned methods of coding for solving a wide variety of common problems.",1],[192511,30611,"CS",2420,3,null,3979608,146955419,"What improvements would you suggest for this course?","I hate the Utah Jazz.",1],[192511,30611,"CS",2420,3,null,3979609,146955420,"Please feel free to write any additional comments about this course or instructor.","Brad is a great and motivated professor. He has a way of lightening the mood even when it comes to serious homework assignments that were tough. He is also very helpful outside of class if you need help. The course was tough but I feel it was necessary and that I am taking away a lot with me.",1],[192511,30611,"CS",2420,3,null,3979607,146955398,"What did you particularly like about this course?","The Teacher did a good job of explaining new topics",2],[192511,30611,"CS",2420,3,null,3979608,146955399,"What improvements would you suggest for this course?","More coding in class would have helped.",2],[192511,30611,"CS",2420,3,null,3979609,146955400,"Please feel free to write any additional comments about this course or instructor.","No Response",2],[192511,30611,"CS",2420,3,null,3979607,147142758,"What did you particularly like about this course?","The multi-threading assignment",3],[192511,30611,"CS",2420,3,null,3979608,147142759,"What improvements would you suggest for this course?","No Response",3],[192511,30611,"CS",2420,3,null,3979609,147142760,"Please feel free to write any additional comments about this course or instructor.","No Response",3],[192511,30611,"CS",2420,3,null,3979607,146953515,"What did you particularly like about this course?","Everything, Brad answered all questions asked and is very knowledgeable on the subject! -CW\r\n       .  .\"|\r\n      \/| \/  |  _.----._ \r\n     . |\/  |.-\"        \".  \/|\r\n    \/                    \\\/ |__\r\n   |           _.-\"\"\"\/        \/\r\n   |       _.-\"     \/.\"|     \/\r\n    \".__.-\"         \"  |            |              |       |\r\n       \/_      _.._   | ___  \/\r\n     .\"  \"\"-.-\"    \". |\/.-.\\\/\r\n    |    0  |    0  |     \/ |\r\n    \\      \/\\_     _\/    \"_\/ \r\n     \"._ _\/   \"---\"       |  \r\n     \/\"\"\"                 |  \r\n     \\__.--                |_ \r\n       )          .        | \". \r\n      \/        _.-\"\\        |  \".\r\n     \/     _.-\"             |    \".  \r\n    (_ _.-|                  |     |\"-._.\r\n      \"    \"--.             .J     _.-'\r\n              \/\\        _.-\" | _.-'\r\n             \/  \\__..--\"   _.-'\r\n            \/   |      _.-'         \r\n           \/| \/\\|  _.-'                     \r\n          \/ |\/ _.-'                              \r\n         \/|_.-'                                   \r\n       _.-'",4],[192511,30611,"CS",2420,3,null,3979608,146953516,"What improvements would you suggest for this course?","None\r\n    .       ..       .\r\n    |\\      ||      \/|\r\n    | \\     ||     \/ |\r\n    |  \\    ||    \/  |\r\n    |  :\\___JL___\/   |\r\n    |  :|##XLJ: :|   |\r\n    '\\ :|###||: X|  \/'\r\n      \\:|###||:X#| \/\r\n       |==========|\r\n        |###XXX;;|\r\n        |##XX:: :|\r\n        |##Xn:: :|\r\n        |##XU:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: n|\r\n        |##XX:: U|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##Xn:: :|\r\n        |##XU:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: n|\r\n        |##XX:: U|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##Xn:: :|\r\n        |##XU:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: n|\r\n        |##XX:: U|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##XX:: :|\r\n        |##,_,: :|\r\n        |.\/ T \\.:|\r\n        || o|o |:|\r\n        ||  |  |:|\r\n      .============.\r\n     .==============.\r\n    .================.",4],[192511,30611,"CS",2420,3,null,3979609,146953517,"Please feel free to write any additional comments about this course or instructor.","Brad you are my favorite CS instructor keep it up! -CW\r\n                c==o\r\n              _\/____\\_\r\n       _.,--'\" ||^ || \"`z._\r\n      \/_\/^ ___\\||  || _\/o\\ \"`-._\r\n    _\/  ]. L_| || .||  \\_\/_  . _`--._\r\n   \/_~7  _ . \" ||. || \/] \\ ]. (_)  . \"`--.\r\n  |__7~.(_)_ []|+--+|\/____T_____________L|\r\n  |__|  _^(_) \/^   __\\____ _   _|\r\n  |__| (_){_) J ]K{__ L___ _   _]\r\n  |__| . _(_) \\v     \/__________|________\r\n  l__l_ (_). []|+-+-<\\^   L  . _   - ---L|\r\n   \\__\\    __. ||^l  \\Y] \/_]  (_) .  _,--'\r\n     \\~_]  L_| || .\\ .\\\\\/~.    _,--'\"\r\n      \\_\\ . __\/||  |\\  \\`-+-<'\"\r\n        \"`---._|J__L|X o~~|[\\\\      \r\n               \\____\/ \\___|[\/\/\r\n                `--'   `--+-'",4],[192511,30611,"CS",2420,3,null,3979607,147622217,"What did you particularly like about this course?","No Response",5],[192511,30611,"CS",2420,3,null,3979608,147622218,"What improvements would you suggest for this course?","No Response",5],[192511,30611,"CS",2420,3,null,3979609,147622219,"Please feel free to write any additional comments about this course or instructor.","No Response",5],[192511,30611,"CS",2420,3,null,3979607,146953555,"What did you particularly like about this course?","No Response",6],[192511,30611,"CS",2420,3,null,3979608,146953556,"What improvements would you suggest for this course?","No Response",6],[192511,30611,"CS",2420,3,null,3979609,146953557,"Please feel free to write any additional comments about this course or instructor.","No Response",6],[192511,30611,"CS",2420,3,null,3979607,147312528,"What did you particularly like about this course?","Brad is an excellent instructor and made this normally very hard course more understandable and manageable for me. I would take another class from him in a heartbeat and recommend him to anyone else needing to take this course. The lectures posted online was a huge help. ",7],[192511,30611,"CS",2420,3,null,3979608,147312529,"What improvements would you suggest for this course?","The nature of the course is quite difficult. I would only suggest that Brad keep doing what he is doing to make it easier for future students. ",7],[192511,30611,"CS",2420,3,null,3979609,147312530,"Please feel free to write any additional comments about this course or instructor.","I like Brads sense of humor, it makes class more enjoyable and entertaining. He still manages his time effectively and stimulates learning. He seems to genuinely care about the students, and he makes himself available when they need him. ",7],[192511,30611,"CS",2420,3,null,3979607,146953575,"What did you particularly like about this course?","i liked the homeworks given in class",8],[192511,30611,"CS",2420,3,null,3979608,146953576,"What improvements would you suggest for this course?","n\/a",8],[192511,30611,"CS",2420,3,null,3979609,146953577,"Please feel free to write any additional comments about this course or instructor.","fun class",8],[192511,30611,"CS",2420,3,null,3979607,146954394,"What did you particularly like about this course?","No Response",9],[192511,30611,"CS",2420,3,null,3979608,146954395,"What improvements would you suggest for this course?","No Response",9],[192511,30611,"CS",2420,3,null,3979609,146954396,"Please feel free to write any additional comments about this course or instructor.","No Response",9],[192511,30611,"CS",2420,3,null,3979607,147064661,"What did you particularly like about this course?","I liked learning the algorithms that were presented for us to code.",10],[192511,30611,"CS",2420,3,null,3979608,147064662,"What improvements would you suggest for this course?","Perhaps some better pseudo code for learning algorithms.  I think many people struggled with knowing how to do a certan thing and sometimes a little pseudocode is a good place to start.",10],[192511,30611,"CS",2420,3,null,3979609,147064663,"Please feel free to write any additional comments about this course or instructor.","No Response",10],[192511,30611,"CS",2420,3,null,3979607,146954978,"What did you particularly like about this course?","Some of the side tangents taken for respite.",11],[192511,30611,"CS",2420,3,null,3979608,146954979,"What improvements would you suggest for this course?","Not much.",11],[192511,30611,"CS",2420,3,null,3979609,146954980,"Please feel free to write any additional comments about this course or instructor.","No Response",11],[192511,30611,"CS",2420,3,null,3979607,146949070,"What did you particularly like about this course?","I found this course really interesting, especially the algorithm aspect of the course. But instead of writing a long droll evaluation epic, I shall keep my response brief. Pointers are amazing and I truly appreciated this professor's help on a project outside of this class. His helpfulness and enthusiasm made this class really awesome. ",12],[192511,30611,"CS",2420,3,null,3979608,146949071,"What improvements would you suggest for this course?","I would've appreciated a much more difficult assignment on AVL and Btrees instead of just coping from the book. More structure would be nice(although I do appreciate how fluid the course is too) ",12],[192511,30611,"CS",2420,3,null,3979609,146949072,"Please feel free to write any additional comments about this course or instructor.","Figure out the next number in the sequence - \r\n1, 11, 21, 1211, 111221, 312211, 13112221\r\n\r\nI'm not sure what I'm supposed to write in this box.  Since the two previous boxes are for positive and negative comments, is this box for like neutral comments? If I feel neutral about something why would I comment it at all?",12],[192511,30611,"CS",2420,3,null,3979607,146579454,"What did you particularly like about this course?","It was very interesting",13],[192511,30611,"CS",2420,3,null,3979608,146579455,"What improvements would you suggest for this course?","Not appending \"Type\" to the name of every abstract data type, even if the book does",13],[192511,30611,"CS",2420,3,null,3979609,146579456,"Please feel free to write any additional comments about this course or instructor.","No Response",13],[192511,30611,"CS",2420,3,null,3979607,146472090,"What did you particularly like about this course?","A lot of help with assignment shells at the beginning of the course that were already compilable.",14],[192511,30611,"CS",2420,3,null,3979608,146472091,"What improvements would you suggest for this course?","After a couple assignments wean students off of compilable assignment shells. It is better to have to make the entire assignment after the initial shock of the course has passed.",14],[192511,30611,"CS",2420,3,null,3979609,146472092,"Please feel free to write any additional comments about this course or instructor.","More feedback on grading assignments and what was wrong with them specifically and how to complete them. Faster grading timeframes for assignments as well. Sometimes the class progresses quickly while students may still be wondering how\/if they went wrong in previous concepts on assignments.",14],[192511,30611,"CS",2420,3,null,3979607,147086397,"What did you particularly like about this course?","Lots of lab time was given for help with the assignments.",15],[192511,30611,"CS",2420,3,null,3979608,147086398,"What improvements would you suggest for this course?","No Response",15],[192511,30611,"CS",2420,3,null,3979609,147086399,"Please feel free to write any additional comments about this course or instructor.","No Response",15],[192511,30611,"CS",2420,3,null,3979607,147452194,"What did you particularly like about this course?","the extra challenge provided in the assignments",16],[192511,30611,"CS",2420,3,null,3979608,147452195,"What improvements would you suggest for this course?","Can't think of any",16],[192511,30611,"CS",2420,3,null,3979609,147452196,"Please feel free to write any additional comments about this course or instructor.","The instructor is excellent, he spends time making sure we understand what is being taught.",16],[192511,30611,"CS",2420,3,null,3979607,146387037,"What did you particularly like about this course?","the instructor.",17],[192511,30611,"CS",2420,3,null,3979608,146387038,"What improvements would you suggest for this course?","harder assignments.",17],[192511,30611,"CS",2420,3,null,3979609,146387039,"Please feel free to write any additional comments about this course or instructor.","the assignments were frequently extended. I feel that this was not necessary. Homework assignments would have been much better if they were more challenging for the time allotment or if there were more assignments.",17],[192511,30611,"CS",2420,3,null,3979607,146717339,"What did you particularly like about this course?","No Response",18],[192511,30611,"CS",2420,3,null,3979608,146717340,"What improvements would you suggest for this course?","No Response",18],[192511,30611,"CS",2420,3,null,3979609,146717341,"Please feel free to write any additional comments about this course or instructor.","No Response",18],[192511,30611,"CS",2420,3,null,3979607,146747812,"What did you particularly like about this course?","The best thing about this course was its transparency between online and in class structure. It provided flexibility with an ability to follow up in class for more instruction.",19],[192511,30611,"CS",2420,3,null,3979608,146747813,"What improvements would you suggest for this course?","Get somebody else to teach it and\/or use a book that can flow the information instead of the professor.",19],[192511,30611,"CS",2420,3,null,3979609,146747814,"Please feel free to write any additional comments about this course or instructor.","Brad spoke to me the 2nd day of class and said to me, \"When you are having problems, I won't help you in this course.\"  He said this because I was concurrently enrolled in 1410 which was apparently a pre-req of the class.  I didn't know this, the system allowed me to register, and with adequate assistance I probably could have passed this class. Even dismissing the conversation where he said he wouldn't help me when I had problems, Brad constantly belittled students after asking for questions and feedback.  He would ask if people had questions, and when they did, he would gripe and ask who their 1410 professor was, and sometimes he would get around to actually answering their question. About halfway through the semester, after being told I wouldn't receive any help from Brad and having seen how students were being treated for having questions, I decided to try to follow the book and try to do the assignments from that. If Brad doesn't want to teach he should at least provide assignments that can be attempted from material that flows from the book but that certainly wasn't the case either.  There is no doubt in my mind I will fail this class, and I take full responsibility for it. But what bothers me is to think Brad is going to railroad other students and belittle them to the point of losing interest from the program, from the school or from other similar life achievements. In my opinion Brad should work in industry, not in education\/academia.",19],[192511,30611,"CS",2420,3,null,3979607,146373123,"What did you particularly like about this course?","I really enjoyed the teaching methods. As a face-to-face student I didn't miss any lecture days but it was extremely helpful to be able to come back to the recorded lectures to review topics.",20],[192511,30611,"CS",2420,3,null,3979608,146373124,"What improvements would you suggest for this course?","The book wasn't terribly useful. Brad seemed to know more about the topics than the author, so my time was better spent listening to him than reading the book.",20],[192511,30611,"CS",2420,3,null,3979609,146373125,"Please feel free to write any additional comments about this course or instructor.","I really appreciate the amount of work that Brad must have put in to cook up challenging assignments for us. \r\nI wish I could rate Brad higher in the \"knowledgeable\" category, because he REALLY knows his stuff and it was really great to have him share his expertise with us.",20],[192511,30611,"CS",2420,3,null,3979607,146935310,"What did you particularly like about this course?","Flexibility.",21],[192511,30611,"CS",2420,3,null,3979608,146935311,"What improvements would you suggest for this course?","It would be nice if there were suppose to be status updates throughout the final project to ensure group member's participation. ",21],[192511,30611,"CS",2420,3,null,3979609,146935312,"Please feel free to write any additional comments about this course or instructor.","........................,,-~*~,,\r\n.......................\/:.:.:.:.:.|\r\n......................|;.;.;.;.;.\/\r\n......................|.;.;.;.;.|\r\n............._,,,,,_.).;.;.;.;.|\r\n.........,,-\":.:.:.:.\"~-,;.;.;.|\r\n........(_,,,,---,,_:.:.);.;.;..\",,\r\n......,-\":.:.:.:.:.\"\"-,,\/;.;.;.;.;.\",\r\n.....(:.__,,,,,,,,,___);.;.;.;.;.;|\r\n.....\/\"\":.:.:.:.:.:.:¯\"\"\\;.;.;.;.;.,\"\r\n....\\\",__,,,,,,,,,,,__\/;;;;;;;;;\/.....\\.::.:.:.:.:.:.:.;.);;;;;;;;;\/:.......\\,,,,,---~~~~;;;;;;;;,\"::::..........\"\"\"~~--,,,,,,,,,,-\"::::::::::...................\\::::::::::::::::::::::\\",21]]}
            //data = JSON.parse(data);
            if (currentElement != element) {
                return;
            }
            try {
                var questionsAndResponses = [];

                $.each(data.DATA, function (i, array) {
                    var dataArray = toKeyValPair(data.COLUMNS, String(array).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY
                    if (!(dataArray['QUESTION'] in questionsAndResponses)) {
                        questionsAndResponses[dataArray['QUESTION']] = [];
                    }
                    questionsAndResponses[dataArray['QUESTION']].push(dataArray['ANSWER']);
                });


                var eQuestions = "";
                printQuestion = 0;
                for (var question in questionsAndResponses) {
                    var tempArray = questionsAndResponses[question];
                    eQuestions += "<div class='question_box'><table class='essay_table_settings'><tr><td style='vertical-align:text-top; text-align:right'> <img class = 'question_image_box' src = 'images/colorItemBackground.png'> " + (printQuestion + 1) + ".  </td><td></td><td align='left'>" + question + "</td></tr>";

                    for (var responses = 0; responses < tempArray.length; responses++) {

                        var noResponse = "";

                        if (tempArray[responses] == "No Response") {
                            noResponse = "font-style:italic";
                        }
                        eQuestions += "<tr><td style='font-weight:normal; vertical-align:text-bottom; text-align:right'>&nbsp;&nbsp;" + (responses + 1) + "</td><td align='right'></td><td align='left' class='essay_responses' style='" + noResponse + "'><pre>" + tempArray[responses] + "</pre></td></tr>";
                    }
                    eQuestions += "</table></div>";
                    printQuestion++;
                }
                $(element).find("#EssayWrapper").append(eQuestions);
                essayQueryComplete(element, true);
            }
            catch (thrownError) {
                essayQueryComplete(element, false);
            }
        },
        error: function (error) {
            essayQueryComplete(element, false);
          }
        });
    }
    //END ESSAY QUERY FUNCTION*********************************************************************************************************************************************

    //MAIN QUERY FUNCTION**************************************************************************************************************************************************
    function mainQuery(element, crn, semester, year) {

      //url: '/misc/weber/CSEvals/AnswerCount.cfm?crn='+crn+'&semester='+semester+'&year='+year,
      var answerCountUrl = IsRunningInTest ? TEST_URL + "AnswerCount.cfm" : "AnswerCount.cfm";

        $.ajax(
    	{
    	    url: answerCountUrl + '?crn=' + crn + '&semester=' + semester + '&year=' + year,
    	    type: "GET",
    	    dataType: "json",
    	    success: function (data) {
                data = {"COLUMNS":["COURSE","CRN","QUESTION","ANSWERS","ANSWER COUNT","QUESTIONID","SEQUENCE","STUDENT COUNT"],"DATA":[["CS 2420",30611,"The instructor created a stimulating learning environment.","agree",5,3979590,1,19],["CS 2420",30611,"The instructor created a stimulating learning environment.","strongly agree",13,3979590,1,19],["CS 2420",30611,"The instructor created a stimulating learning environment.","strongly disagree",1,3979590,1,19],["CS 2420",30611,"The instructor was knowledgeable in the course subject material.","agree",2,3979591,2,19],["CS 2420",30611,"The instructor was knowledgeable in the course subject material.","strongly agree",17,3979591,2,19],["CS 2420",30611,"The instructor communicated clearly and was easy to understand.","agree",4,3979592,3,19],["CS 2420",30611,"The instructor communicated clearly and was easy to understand.","strongly agree",14,3979592,3,19],["CS 2420",30611,"The instructor communicated clearly and was easy to understand.","strongly disagree",1,3979592,3,19],["CS 2420",30611,"The instructor was respectful and cared about me personally as a student.","agree",6,3979593,4,19],["CS 2420",30611,"The instructor was respectful and cared about me personally as a student.","strongly agree",12,3979593,4,19],["CS 2420",30611,"The instructor was respectful and cared about me personally as a student.","strongly disagree",1,3979593,4,19],["CS 2420",30611,"The instructor was available and responded to inquiries in a timely manner.","neutral",2,3979594,5,19],["CS 2420",30611,"The instructor was available and responded to inquiries in a timely manner.","agree",5,3979594,5,19],["CS 2420",30611,"The instructor was available and responded to inquiries in a timely manner.","strongly agree",12,3979594,5,19],["CS 2420",30611,"The instructor was timely in returning grades for assignments and\/or tests.","disagree",1,3979595,6,19],["CS 2420",30611,"The instructor was timely in returning grades for assignments and\/or tests.","neutral",10,3979595,6,19],["CS 2420",30611,"The instructor was timely in returning grades for assignments and\/or tests.","agree",3,3979595,6,19],["CS 2420",30611,"The instructor was timely in returning grades for assignments and\/or tests.","strongly agree",5,3979595,6,19],["CS 2420",30611,"I was given sufficient resources and reference material throughout the course.","strongly disagree",1,3979596,7,19],["CS 2420",30611,"I was given sufficient resources and reference material throughout the course.","agree",5,3979596,7,19],["CS 2420",30611,"I was given sufficient resources and reference material throughout the course.","neutral",1,3979596,7,19],["CS 2420",30611,"I was given sufficient resources and reference material throughout the course.","strongly agree",12,3979596,7,19],["CS 2420",30611,"The course content was professional and of high quality.","agree",4,3979597,8,19],["CS 2420",30611,"The course content was professional and of high quality.","neutral",2,3979597,8,19],["CS 2420",30611,"The course content was professional and of high quality.","strongly agree",12,3979597,8,19],["CS 2420",30611,"The course content was professional and of high quality.","strongly disagree",1,3979597,8,19],["CS 2420",30611,"This course increased my knowledge of the subject matter.","strongly agree",14,3979598,9,19],["CS 2420",30611,"This course increased my knowledge of the subject matter.","agree",4,3979598,9,19],["CS 2420",30611,"This course increased my knowledge of the subject matter.","strongly disagree",1,3979598,9,19],["CS 2420",30611,"The course content prepared me for the assignments and tests.","agree",8,3979599,10,19],["CS 2420",30611,"The course content prepared me for the assignments and tests.","neutral",1,3979599,10,19],["CS 2420",30611,"The course content prepared me for the assignments and tests.","strongly agree",9,3979599,10,19],["CS 2420",30611,"The course content prepared me for the assignments and tests.","strongly disagree",1,3979599,10,19],["CS 2420",30611,"I was appropriately challenged in this course.","strongly agree",9,3979600,11,19],["CS 2420",30611,"I was appropriately challenged in this course.","strongly disagree",2,3979600,11,19],["CS 2420",30611,"I was appropriately challenged in this course.","agree",7,3979600,11,19],["CS 2420",30611,"I was appropriately challenged in this course.","neutral",1,3979600,11,19],["CS 2420",30611,"Course objectives were clearly communicated.","strongly disagree",1,3979601,12,19],["CS 2420",30611,"Course objectives were clearly communicated.","agree",6,3979601,12,19],["CS 2420",30611,"Course objectives were clearly communicated.","neutral",1,3979601,12,19],["CS 2420",30611,"Course objectives were clearly communicated.","strongly agree",11,3979601,12,19],["CS 2420",30611,"Course content and time was well spent in support of the objectives.","neutral",1,3979602,13,19],["CS 2420",30611,"Course content and time was well spent in support of the objectives.","agree",7,3979602,13,19],["CS 2420",30611,"Course content and time was well spent in support of the objectives.","strongly agree",11,3979602,13,19],["CS 2420",30611,"The course as a whole followed a logical pattern of organization.","agree",9,3979603,14,19],["CS 2420",30611,"The course as a whole followed a logical pattern of organization.","neutral",1,3979603,14,19],["CS 2420",30611,"The course as a whole followed a logical pattern of organization.","strongly agree",8,3979603,14,19],["CS 2420",30611,"The course as a whole followed a logical pattern of organization.","strongly disagree",1,3979603,14,19],["CS 2420",30611,"I feel the grading criteria for this course was fair.","agree",5,3979604,15,19],["CS 2420",30611,"I feel the grading criteria for this course was fair.","neutral",1,3979604,15,19],["CS 2420",30611,"I feel the grading criteria for this course was fair.","strongly agree",12,3979604,15,19],["CS 2420",30611,"I feel the grading criteria for this course was fair.","strongly disagree",1,3979604,15,19],["CS 2420",30611,"I felt the course was an effective use of my time.","agree",6,3979605,16,19],["CS 2420",30611,"I felt the course was an effective use of my time.","strongly agree",12,3979605,16,19],["CS 2420",30611,"I felt the course was an effective use of my time.","strongly disagree",1,3979605,16,19],["CS 2420",30611,"Please rate the quality of the texbook used in the course (choose N\/A if no book was used)","Excellent",2,3979606,17,19],["CS 2420",30611,"Please rate the quality of the texbook used in the course (choose N\/A if no book was used)","N\/A",1,3979606,17,19],["CS 2420",30611,"Please rate the quality of the texbook used in the course (choose N\/A if no book was used)","Very poor",1,3979606,17,19],["CS 2420",30611,"Please rate the quality of the texbook used in the course (choose N\/A if no book was used)","Average",5,3979606,17,19],["CS 2420",30611,"Please rate the quality of the texbook used in the course (choose N\/A if no book was used)","good",9,3979606,17,19],["CS 2420",30611,"Please rate the quality of the texbook used in the course (choose N\/A if no book was used)","poor",1,3979606,17,19]]}
            //data = JSON.parse(data);
    	        if (currentElement != element) {
    	            return;
    	        }
    	        try {
    	            var currentQuestion = " ";
    	            var currentQuestionID;
    	            var currentQuestionSequence;
    	            var finishedQuestions = [];
    	            var currentSD = 0;
    	            var currentD = 0;
    	            var currentN = 0;
    	            var currentA = 0;
    	            var currentSA = 0;
    	            var currentNA = 0;
    	            var currentTotal = 0;
    	            var currentLengths = [];
    	            var printedQuestions = [];
    	            var crnStatistics = [];
    	            var questionCollapserId = 0;
    	            var totalQuestions = 0;
    	            var questionJSON = {};
    	            var barHeight = 30;
    	            var totalRespondents = 0;
    	            $.each(data.DATA, function (i, array) {
    	                var dataArray = toKeyValPair(data.COLUMNS, String(array).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY
    	                //$.each(dataArray, function(i,array)
    	                //{
    	                //	document.write(i + ": " + array + "<br />");
    	                //});
    	                totalRespondents = dataArray['STUDENT COUNT'];

    	                element.totalRespondents = totalRespondents;
    	                window.totalRespondents[element.id] = totalRespondents;
    	                //window.currentQuestion = dataArray['QUESTION'];
    	                //window.currentQuestionID = dataArray['QUESTIONID'];
    	                //window.currentQuestionSequence = dataArray['SEQUENCE'];
    	                currentQuestion = dataArray['QUESTION'];
    	                currentQuestionID = dataArray['QUESTIONID'];
    	                currentQuestionSequence = dataArray['SEQUENCE'];

    	                $.each(data.DATA, function (i, innerArray) {
    	                    var innerDataArray = toKeyValPair(data.COLUMNS, String(innerArray).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY

    	                    if (currentQuestion == innerDataArray['QUESTION'] && finishedQuestions.indexOf(currentQuestion + " - " + innerDataArray['ANSWERS'].toLocaleLowerCase()) == -1) {
    	                        switch (innerDataArray['ANSWERS'].toLocaleLowerCase()) {
    	                            case 'strongly disagree':
    	                            case 'very poor':
    	                                currentSD += +innerDataArray['ANSWER COUNT'];
    	                                currentTotal += +innerDataArray['ANSWER COUNT'];
    	                                break;
    	                            case 'disagree':
    	                            case 'poor':
    	                                currentD += +innerDataArray['ANSWER COUNT'];
    	                                currentTotal += +innerDataArray['ANSWER COUNT'];
    	                                break;
    	                            case 'neutral':
    	                            case 'average':
    	                                currentN += +innerDataArray['ANSWER COUNT'];
    	                                currentTotal += +innerDataArray['ANSWER COUNT'];
    	                                break;
    	                            case 'agree':
    	                            case 'good':
    	                                currentA += +innerDataArray['ANSWER COUNT'];
    	                                currentTotal += +innerDataArray['ANSWER COUNT'];
    	                                break;
    	                            case 'strongly agree':
    	                            case 'excellent':
    	                                currentSA += +innerDataArray['ANSWER COUNT'];
    	                                currentTotal += +innerDataArray['ANSWER COUNT'];
    	                                break;
    	                            case 'n/a':
    	                                currentNA += +innerDataArray['ANSWER COUNT'];
    	                                currentTotal += +innerDataArray['ANSWER COUNT'];
    	                                break;
    	                        }
    	                        finishedQuestions.push(window.currentQuestion + " - " + innerDataArray['ANSWERS'].toLocaleLowerCase());
    	                    }
    	                });

    	                if (printedQuestions.indexOf(currentQuestion) == -1) {
    	                    questionCollapserId += 1;
    	                    totalQuestions++;
    	                    currentLengths = getPixelLengthBasic(currentSD, currentD, currentN, currentA, currentSA, currentNA, currentTotal);
    	                    printedQuestions.push(currentQuestion);
    	                    $(element).find("#array").append('<p style="clear:both;">' + currentQuestion + " - " + currentSD + " - " + currentD + " - " + currentN + " - " + currentA + " - " + currentSA + " - " + currentTotal + "</p>");

    	                    var buildString = '<div class="question_box question_box_collapsed ' + questionCollapserId + '"><button id="' + questionCollapserId + '" class="button">↕</button><input type="hidden" class="hiddenQuestionID" value="' + currentQuestionID + '"/><div class="toggle">';
    	                    buildString += '<img class = "question_image_box" src = "images/colorItemBackground.png"><div class="question"><h4>' + currentQuestionSequence + ". " + currentQuestion + '</h4></div><div class="question_graph"> ';

    	                    currentLengths = normPixelLength(currentLengths);

    	                    buildString += '<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="' + currentLengths[0] + 'px" height="' + barHeight + 'px" title="Strongly Disagree: ' + currentSD + '/' + currentTotal + '"> ';
    	                    buildString += '<img class="displaycolor" src = "images/colorDisagree.png" width="' + currentLengths[1] + 'px" height="' + barHeight + 'px" title="Disagree: ' + currentD + '/' + currentTotal + '"> ';
    	                    buildString += '<img class="displaycolor" src = "images/colorNeutral.png" width="' + currentLengths[2] + 'px" height="' + barHeight + 'px" title="Neutral: ' + currentN + '/' + currentTotal + '"> ';
    	                    buildString += '<img class="displaycolor" src = "images/colorAgree.png" width="' + currentLengths[3] + 'px" height="' + barHeight + 'px" title="Agree: ' + currentA + '/' + currentTotal + '"> ';
    	                    buildString += '<img class="displaycolor" src = "images/colorStronglyAgree.png" width="' + currentLengths[4] + 'px" height="' + barHeight + 'px" title="Strongly Agree: ' + currentSA + '/' + currentTotal + '"> ';
    	                    if (currentNA > 0) {
    	                        buildString += '<img class="displaycolor" src = "images/colorNA.png" width="' + currentLengths[5] + 'px" height="' + barHeight + 'px" title="N\/A: ' + currentNA + '/' + currentTotal + '"> ';
    	                    }

    	                    //					buildString += '<div class="graph_box graphStronglyDisagree" title="Strongly Disagree: '+window.currentSD+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[0]+'px;">';
    	                    //					buildString += '<div class="graph_box graphStronglyDisagree" title="Strongly Disagree: '+window.currentSD+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[0]+'px;">';
    	                    //buildString += '</div><div class="graph_box graphDisagree" title="Disagree: '+window.currentD+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[1]+'px;">';
    	                    //buildString += '</div><div class="graph_box graphNeutral" title="Neutral: '+window.currentN+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[2]+'px;">';
    	                    //buildString += '</div><div class="graph_box graphAgree" title="Agree: '+window.currentA+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[3]+'px;">';
    	                    //buildString += '</div><div class="graph_box graphStronglyAgree" title="Strongly Agree: '+window.currentSA+'/'+window.currentTotal+'"   style=" width:'+window.currentLengths[4]+'px;">';
    	                    buildString += '</div></div><table class="question_scores"><tr><td class="question_answers_collapsed">SD: ' + currentSD + '</td>';
    	                    buildString += '<td class="question_answers_collapsed">D: ' + currentD + '</td>';
    	                    buildString += '<td class="question_answers_collapsed">N: ' + currentN + '</td>';
    	                    buildString += '<td class="question_answers_collapsed">A: ' + currentA + '</td>';
    	                    buildString += '<td class="question_answers_collapsed">SA: ' + currentSA + '</td>';
    	                    if (currentNA > 0) {
    	                        buildString += '<td class="question_answers_collapsed">NA: ' + currentNA + '</td>';
    	                    }
    	                    buildString += '</tr></table><br/></div></div>';
    	                    buildString += '<!--' + currentQuestion + '-->'
    	                    buildString += '<div class="question_box question_box_expanded ' + questionCollapserId + '"></div>';
    	                    var q = {};
    	                    q[0] = currentQuestion;
    	                    q[1] = currentSD;
    	                    q[2] = currentD;
    	                    q[3] = currentN;
    	                    q[4] = currentA;
    	                    q[5] = currentSA;
    	                    q[6] = currentTotal;
    	                    q[7] = currentNA; //ADDED FOR NA
    	                    questionJSON[questionCollapserId] = q;
    	                    storedQuestions[crn] = questionJSON;
    	                    $(element).find("#questions_wrapper").append(buildString);
    	                }

    	                currentQuestion = " ";
    	                currentSD = 0;
    	                currentD = 0;
    	                currentN = 0;
    	                currentA = 0;
    	                currentSA = 0;
    	                currentNA = 0;
    	                currentTotal = 0;
    	            });
    	            mainQueryComplete(element, true);
    	        }
    	        catch (thrownError) {
    	            mainQueryComplete(element, false);
    	        }
    	    },
    	    error: function (xhr, ajaxOptions, thrownError) {
    	        if (currentElement != element) {
    	            return;
    	        }
    	        mainQueryComplete(element, false);
    	    }
    	});
    }
    //END MAIN QUERY FUNCTION**********************************************************************************************************************************************

    function titleQuery(element, crn, semester, year) {

      //url: '/misc/weber/CSEvals/CrnDetails.cfm?crn='+crn+'&semester='+semester+'&year='+year,
      var CrnDetailsUrl = IsRunningInTest ? TEST_URL + "CrnDetails.cfm" : "CrnDetails.cfm";
        $.ajax(
    	{
    	    url: CrnDetailsUrl + '?crn=' + crn + '&semester=' + semester + '&year=' + year,
    	    type: 'GET',
    	    dataType: 'json',
    	    success: function (data) {
                data = {"COLUMNS":["CLASSSTRING","BANNERCRN","SECTION","SEMESTER","SEMESTERSTRING","BLOCK","YEAR","SUBJECTCODE","COURSENUMBER","INSTRUCTORID","FIRSTNAME","LASTNAME","EMAIL","RESPONSES","STUDENTS","TESTID","TESTNAME"],"DATA":[["CS2420",30611,null,3,"Spring",null,2013,"CS",2420,887969243,"Bradley","Peterson","b_peterson@yahoo.com",323,19,64529,"Eval Dept of CS - OLD"]]}
            //data = JSON.parse(data);
    	        try {
    	            if (currentElement != element) {
    	                return;
    	            }

    	            if (data.DATA == "") //IN THE EVENT TITLE DATA CANNOT BE RETRIEVED
    	            {
    	                //$(element).find("#title_wrapper").append('<h2>Course Evaluation</h2>' + ' Semester ' + Semester + ' - CRN ' + CRN + ' - Year ' + Year);
    	                // window.ClassName = 'CRN ' + CRN;
    	                titleQueryComplete(element, false);
    	                return;
    	            }
    	            else				//RETREIVE AND UTILIZE TITLE DATA
    	            {
    	                $.each(data.DATA, function (i, array) {
    	                    var dataArray = toKeyValPair(data.COLUMNS, String(array).split(','));	//CONVERTS DATA TO A KEY VALUE PAIR FOR READABILITY
    	                    element.semesterName = dataArray['SEMESTERSTRING'];
    	                    element.className = dataArray['CLASSSTRING'];
    	                    element.firstName = dataArray['FIRSTNAME'];
    	                    element.lastName = dataArray['LASTNAME'];
    	                    element.year = dataArray['YEAR'];
    	                    element.yearOriginal = element.year; // save the original year before we change based on semester.
    	                    if (dataArray['SEMESTERSTRING'] == "Summer" || dataArray['SEMESTERSTRING'] == "Fall") {
    	                        dataArray['YEAR'] -= 1; //Set the year back one
    	                        element.year = dataArray['YEAR'];
    	                    }

    	                    $(element).find("#title_wrapper").append('<h2>Course Evaluation</h2>' + dataArray['FIRSTNAME'] + ' ' + dataArray['LASTNAME'] + ' - ' + dataArray['CLASSSTRING'] + ' - CRN ' + dataArray['BANNERCRN'] + ' - ' + dataArray['SEMESTERSTRING'] + ' ' + dataArray['YEAR'] + '');
    	                });
    	            }
    	            titleQueryComplete(element, true);
    	        }
    	        catch (thrownError) {
    	            titleQueryComplete(element, false);
    	        }
    	    },
    	    error: function (xhr, ajaxOptions, thrownError) {
    	        if (currentElement != element) {
    	            return;
    	        }
    	        titleQueryComplete(element, false);
    	    }
    	});
    }
    function topQuery(element, crn, semester, year) {
        $(element).find("#StatisticsWrapper").hide();

        //jQuery.getJSON('/misc/weber/CSEvals/CrnStatistics.cfm?crn='+crn+'&semester='+semester+'&year='+year, function(data)
        var CrnStatisticsUrl = IsRunningInTest ? TEST_URL + "CrnStatistics.cfm" : "CrnStatistics.cfm";
        $.ajax({
          url: CrnStatisticsUrl + '?crn=' + crn + '&semester=' + semester + '&year=' + year,
          type: "GET",
          dataType: "json",
          success: function (data) {
              data = {"COLUMNS":["INSTRUCTORSEMESTERAVERAGE","INSTRUCTORSEMESTERSTDEVIATION","DEPARTMENTSEMESTERAVERAGE","DEPARTMENTSEMESTERSTDEVIATION","CLASSSCORE","CLASSSTDEVIATION","DECTILE","DEPARTMENTCLASSFIVEYEARAVERAGE","DEPARTMENTCLASSFIVEYEARSTDEVIATION","INSTRUCTORCLASSFIVEYEARAVERAGE","INSTRUCTORCLASSFIVEYEARSTDEVIATION"],"DATA":[[3.203559,1.1150445601146897,3.204520,1.0093619384613277,3.392982,0.955108085942405,7,3.415384,0.881007133921016,3.415384,0.881007133921016]]}
            //data = JSON.parse(data);
            if (currentElement != element) {
                return;
            }
            try {
                var keyValPair = toKeyValPair(data.COLUMNS, String(data.DATA).split(','));

                element.score = Number(keyValPair['CLASSSCORE']).toFixed(2);
                element.stddev = Number(keyValPair['CLASSSTDEVIATION']).toFixed(2);

                var crnStatistics = keyValPair['INSTRUCTORSEMESTERAVERAGE'];
                var currentLengths = new Array(getPixelLength(keyValPair['CLASSSCORE']).toFixed(2), (400 - getPixelLength(keyValPair['CLASSSCORE']).toFixed(2)));
                currentLengths = normPixelLength(currentLengths);
                var tempString = '';
                tempString = tempString + '<table id="topTable">';
                tempString = tempString + '		<tbody><tr>';
                tempString = tempString + '			<td></td>';
                tempString = tempString + '			<td></td>';
                tempString = tempString + '			<td></td>';
                tempString = tempString + '			<td style="max-width:100px;text-align:center;font-size:12px;">Standard Deviation</td>';
                tempString = tempString + '		</tr>';
                tempString = tempString + '		<tr>';
                tempString = tempString + '			<td class="bigger bolder" style="width: 300px;"><button class="tpbutton">↕</button><input type="hidden"/> Your Overall Score</td>';
                tempString = tempString + '			<td class="bigger bolder" style="width: 60px">' + Number(keyValPair['CLASSSCORE']).toFixed(2) + '</td>';
                //TOPLINE ON GRAPH
                //tempString = tempString + '			<td><div class="container ticks"><div class="overall_ bigbar yellow ticks" style="width:'+getPixelLength(keyValPair['CLASSSCORE']).toFixed(2)+'px"></div></div></td>';
                tempString = tempString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="' + currentLengths[0] + 'px" height=40px"><img align="left" src = "images/colorTopBarBackground.png" width="' + currentLengths[1] + 'px" height=40px"><img style="position:absolute; top:0; left:0" src = "images/ticks.png"></div></td>';

                if (Number(keyValPair['CLASSSTDEVIATION']).toFixed(2) >= 1.0) {
                    tempString = tempString + '			<td style="width: 100px; text-align:center;color:red;">' + Number(keyValPair['CLASSSTDEVIATION']).toFixed(2) + '</td>';
                }
                else {
                    tempString = tempString + '			<td style="width: 100px; text-align:center">' + Number(keyValPair['CLASSSTDEVIATION']).toFixed(2) + '</td>';
                }
                //tempString = tempString + '			<td style="width: 100px; text-align:center">' + Number(keyValPair['CLASSSTDEVIATION']).toFixed(2) + '</td>';
                tempString = tempString + '		</tr>';
                tempString = tempString + '	</tbody>';
                tempString = tempString + ' </table>';
                tempString = tempString + ' <div id="top_detail"></div>';
                $(element).find("#StatisticsWrapper").prepend(tempString);
                $(element).find("#StatisticsWrapper").slideDown(200);
                $(element).find(".loadinggif").remove();

                topQueryComplete(element, true);
                var tpButton = $(element).find(".tpbutton").get(0);
                detailsTop(element, crn, semester, year, tpButton);
            }
            catch (error) {
                topQueryComplete(element, false);
            }

        }, function (reason) {
            if (currentElement != element) {
                return;
            }
            topQueryComplete(element, false);
          }
        });
    }

    self.toKeyValPair = function(names, values) {
        var result = {};
        for (var i = 0; i < names.length; i++) {
            result[names[i]] = values[i];
        }
        return result;
    }

    //TOP DETAILS FUNCTION**************************************************************************************************************************************************
    function detailsTop(element, crn, semester, year, clickedButton) {
        var UIspeed = 300;

        var originalDiv = $(element).find("#top_detail");
        if ($(originalDiv).hasClass("Already_Expanded")) {
            if ($(originalDiv).is(':visible')) {
                originalDiv.slideUp(UIspeed);
                return;
            }
            originalDiv.slideDown(UIspeed);
            return;
        }
        originalDiv.addClass("Already_Expanded");
        $(element).find("#top_detail").before('<p class="loadinggif">Calculating...</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');
        //jQuery.get('/misc/weber/CSEvals/CrnStatistics.cfm?crn='+crn+'&semester='+semester+'&year='+year, function(data)
        var CrnStatisticsUrl = IsRunningInTest ? TEST_URL + "CrnStatistics.cfm" : "CrnStatistics.cfm";
        jQuery.get(CrnStatisticsUrl + '?crn=' + crn + '&semester=' + semester + '&year=' + year, function (data) {
            data = {"COLUMNS":["INSTRUCTORSEMESTERAVERAGE","INSTRUCTORSEMESTERSTDEVIATION","DEPARTMENTSEMESTERAVERAGE","DEPARTMENTSEMESTERSTDEVIATION","CLASSSCORE","CLASSSTDEVIATION","DECTILE","DEPARTMENTCLASSFIVEYEARAVERAGE","DEPARTMENTCLASSFIVEYEARSTDEVIATION","INSTRUCTORCLASSFIVEYEARAVERAGE","INSTRUCTORCLASSFIVEYEARSTDEVIATION"],"DATA":[[3.203559,1.1150445601146897,3.204520,1.0093619384613277,3.392982,0.955108085942405,7,3.415384,0.881007133921016,3.415384,0.881007133921016]]};
            if (currentElement != element) {
                return;
            }
            var statsTableString = ' <table style="margin-top:0px">';
            statsTableString = statsTableString + ' <tbody>';

            $.each(data.DATA, function (i, array) {
                var crnStatistics2 = toKeyValPair(data.COLUMNS, String(data.DATA).split(','));

                //jQuery.get('/misc/weber/CSEvals/ScoreByCategory.cfm?crn='+crn+'&semester='+semester+'&year='+year, function(data2)
                jQuery.get(TEST_URL + 'ScoreByCategory.cfm?crn=' + crn + '&semester=' + semester + '&year=' + year, function (data2) {
                    data2 = {"COLUMNS":["AVERAGE","STANDARDDEVIATION","CATEGORYNAME","CATEGORYID","QUESTIONS"],"DATA":[[3.438596,0.9083925239297972,"Instructor",218692,"1  ,2  ,3  ,4  ,5  ,6  "],[3.347368,1.0439643173235733,"Content",218693,"10 ,11 ,7  ,8  ,9  "],[3.381578,0.9027313125812586,"Method",218694,"12 ,13 ,14 ,15 "],[3.027027,1.0523201261584747,"Other",218695,"16 ,17 "]]};
                    statsTableString = statsTableString + ''
                    $.each(data2.DATA, function (i, array2) {
                        var questionNumList = array2[4].split(',');
                        for (var i = 0; i < questionNumList.length; i++) {
                            questionNumList[i] = parseInt(questionNumList[i]);
                        }

                        questionNumList.sort(function (a, b) { return a - b });

                        var orderingPrintString = "";

                        for (var i = 0; i < questionNumList.length; i++) {
                            orderingPrintString += questionNumList[i];
                            if (i != questionNumList.length - 1) {
                                orderingPrintString += ", ";
                            }
                        }

                        statsTableString = statsTableString + '<tr style="display:none;">';
                        statsTableString = statsTableString + '	<td style="width: 300px;">' + array2[2] + ' (Qs ' + orderingPrintString + ')</td>';
                        statsTableString = statsTableString + '	<td style="width: 60px">' + Number(array2[0]).toFixed(2) + '</td>';
                        //statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar yellow littleTicks" style="width:'+getPixelLength(array2[0]).toFixed(2)+'px"></div></div></td>';
                        statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="' + getPixelLength(array2[0]).toFixed(2) + 'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="' + (400 - getPixelLength(array2[0]).toFixed(2)) + 'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';

                        if (Number(array2[1]).toFixed(2) >= 1.0) {
                            statsTableString = statsTableString + '	<td style="width: 100px; text-align:center;color:red">' + Number(array2[1]).toFixed(2) + '</td>';
                        } else {
                            statsTableString = statsTableString + '	<td style="width: 100px; text-align:center">' + Number(array2[1]).toFixed(2) + '</td>';
                        }
                        statsTableString = statsTableString + '</tr>';
                    });
                }).done(function () {
                    //if (currentElement != element) {
                    //    return;
                    //}
                    statsTableString = statsTableString + '<tr class="gap" style="display:none;">';
                    statsTableString = statsTableString + '	<td style="width: 300px;">Your Overall Semester Average</td>';
                    statsTableString = statsTableString + '	<td style="width: 60px">' + Number(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2) + '</td>';
                    //statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2)+'px"></div></div></td>';
                    statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="' + getPixelLength(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2) + 'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="' + (400 - getPixelLength(crnStatistics2['INSTRUCTORSEMESTERAVERAGE']).toFixed(2)) + 'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';

                    if (Number(crnStatistics2['INSTRUCTORSEMESTERSTDEVIATION']).toFixed(2) >= 1.0) {

                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;color:red">' + Number(crnStatistics2['INSTRUCTORSEMESTERSTDEVIATION']).toFixed(2) + '</td>';
                    }
                    else {
                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;">' + Number(crnStatistics2['INSTRUCTORSEMESTERSTDEVIATION']).toFixed(2) + '</td>';

                    }

                    statsTableString = statsTableString + '</tr>';
                    statsTableString = statsTableString + '<tr style="display:none;">';
                    statsTableString = statsTableString + '	<td style="width: 300px;">Dept. Semester Average</td>';
                    statsTableString = statsTableString + '	<td style="width: 60px">' + Number(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2) + '</td>';
                    //statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2)+'px"></div></div></td>';
                    statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="' + getPixelLength(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2) + 'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="' + (400 - getPixelLength(crnStatistics2['DEPARTMENTSEMESTERAVERAGE']).toFixed(2)) + 'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';
                    if (Number(crnStatistics2['DEPARTMENTSEMESTERSTDEVIATION']).toFixed(2) >= 1.0) {

                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;color:red">' + Number(crnStatistics2['DEPARTMENTSEMESTERSTDEVIATION']).toFixed(2) + '</td>';
                    }
                    else {
                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;">' + Number(crnStatistics2['DEPARTMENTSEMESTERSTDEVIATION']).toFixed(2) + '</td>';

                    }
                    //statsTableString = statsTableString + '	<td style="width: 100px;text-align:center">' + Number(crnStatistics2['DEPARTMENTSEMESTERSTDEVIATION']).toFixed(2) + '</td>';
                    statsTableString = statsTableString + '</tr>';
                    statsTableString = statsTableString + '<tr style="display:none;">';
                    statsTableString = statsTableString + '	<td style="width: 300px;">Dept. ' + ' 5 Year Average</td>';
                    statsTableString = statsTableString + '	<td style="width: 60px">' + Number(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2) + '</td>';
                    //statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2)+'px"></div></div></td>';
                    statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="' + getPixelLength(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2) + 'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="' + (400 - getPixelLength(crnStatistics2['DEPARTMENTCLASSFIVEYEARAVERAGE']).toFixed(2)) + 'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';

                    if (Number(crnStatistics2['DEPARTMENTCLASSFIVEYEARSTDEVIATION']).toFixed(2) >= 1.0) {

                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;color:red">' + Number(crnStatistics2['DEPARTMENTCLASSFIVEYEARSTDEVIATION']).toFixed(2) + '</td>';
                    }
                    else {
                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;">' + Number(crnStatistics2['DEPARTMENTCLASSFIVEYEARSTDEVIATION']).toFixed(2) + '</td>';

                    }
                    //statsTableString = statsTableString + '	<td style="width: 100px;text-align:center">' + Number(crnStatistics2['DEPARTMENTCLASSFIVEYEARSTDEVIATION']).toFixed(2) + '</td>';
                    statsTableString = statsTableString + '</tr>';
                    statsTableString = statsTableString + '<tr style="display:none;">';
                    statsTableString = statsTableString + '	<td style="width: 300px;">Your ' + ' 5 Year Average</td>';
                    statsTableString = statsTableString + '	<td style="width: 60px">' + Number(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2) + '</td>';
                    //statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2)+'px"></div></div></td>';
                    statsTableString = statsTableString + '	<td><div class="container"; style="position:relative"><img align="left" src = "images/colorTopBars.png" width="' + getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2) + 'px" height=20px"><img align="left" src = "images/colorTopBarBackground.png" width="' + (400 - getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2)) + 'px" height=20px"><img style="position:absolute; top:0; left:0" src = "images/littleticks.png"></div></td>';

                    if (Number(crnStatistics2['INSTRUCTORCLASSFIVEYEARSTDEVIATION']).toFixed(2) >= 1.0) {

                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;color:red">' + Number(crnStatistics2['INSTRUCTORCLASSFIVEYEARSTDEVIATION']).toFixed(2) + '</td>';
                    }
                    else {
                        statsTableString = statsTableString + '	<td style="width: 100px;text-align:center;">' + Number(crnStatistics2['INSTRUCTORCLASSFIVEYEARSTDEVIATION']).toFixed(2) + '</td>';

                    }
                    //statsTableString = statsTableString + '	<td style="width: 100px;text-align:center">' + Number(crnStatistics2['INSTRUCTORCLASSFIVEYEARSTDEVIATION']).toFixed(2) + '</td>';
                    statsTableString = statsTableString + '</tr>';
                    statsTableString = statsTableString + '<tr style="display:none;">';
                    var decile = Number(crnStatistics2['DECTILE']);
                    var suffix = decile == 1 ? 'st' : decile == 2 ? 'nd' : decile == 3 ? 'rd' : 'th';
                    statsTableString = statsTableString + '	<td class="bolder" style="text-align:center;" colspan="4">A score of ' + Number(crnStatistics2['CLASSSCORE']).toFixed(2) + ' places you in the ' + decile + suffix + ' decile of your department this semester.</td>';
                    statsTableString = statsTableString + '</tr>';
                    statsTableString = statsTableString + '<td class="bolder" style="text-align:center;" colspan="4"> Total number of respondents: ' + totalRespondents[element.id] + '</td>';
                    statsTableString = statsTableString + '</tr>';
                    statsTableString = statsTableString + '';

                    element.totalRespondents = totalRespondents[element.id];

                    originalDiv.append(statsTableString);
                    originalDiv.find(":hidden").slideDown(UIspeed);
                    $(element).find(".loadinggif").remove();
                    topDetailsComplete(element, true);
                });
            });
        });

        statsTableString = '	</tbody>';
        statsTableString = statsTableString + '	</table>';
        originalDiv.append(statsTableString);


        statsTableString = '';
    }
    //END TOP DETAILS FUNCTION**********************************************************************************************************************************************

    function detailsQuery(element, crn, semester, year, questionId, clickedButton) {
        var UIspeed = 300;
        var questionNumber = $(clickedButton).attr("id");
        var originalDiv = $(clickedButton).parent();

        var expanderDiv = $(clickedButton).parent().siblings(".question_box_expanded").filter('.' + questionNumber);

        if ($(originalDiv).hasClass("Already_Expanded")) {
            originalDiv.hide();
            expanderDiv.slideDown(UIspeed);
            return;
        }

        if ($(originalDiv).hasClass('question_box_expanded')) {
            originalDiv.hide()
            var collapseDiv = $(originalDiv).siblings(".question_box_collapsed").filter('.' + questionNumber);
            collapseDiv.slideDown(UIspeed);

            return;
        }

        originalDiv.addClass("Already_Expanded");
        originalDiv.hide();
        expanderDiv.before('<span class="loadinggif">Calculating...</span><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');
        //expanderDiv.show('<img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');

        //url:("/misc/weber/CSEvals/QuestionDetails.cfm?crn="+crn+"&semester="+semester+"&year="+year+"&questionID="+questionId),
        var QuestionDetailsUrl = IsRunningInTest ? TEST_URL + "QuestionDetails.cfm" : "QuestionDetails.cfm";

        $.ajax(
    	{
    	    url: (QuestionDetailsUrl + "?crn=" + crn + "&semester=" + semester + "&year=" + year + "&questionID=" + questionId),
    	    type: "GET",
    	    dataType: "json",
    	    success: function (data) {
              //data = JSON.parse(data);
    	        //resultString += '<p class="loadinggif">Calculating...</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif';
    	        //expanderDiv.append(resultString);
    	        //var connectionString = '';
    	        var questionJSON = storedQuestions[crn];
    	        var array = toKeyValPair(data.COLUMNS, String(data.DATA).split(','));
    	        var totalResponses = questionJSON[questionNumber][1] + questionJSON[questionNumber][2] + questionJSON[questionNumber][3] + questionJSON[questionNumber][4] + questionJSON[questionNumber][5] + questionJSON[questionNumber][7];
    	        var tableWidth;
    	        var cellWidth;

    	        if (questionJSON[questionNumber][7] > 0 || array['DPTSEMESTERAVERAGENA'] > 0 || array['PERSONALSEMESTERAVERAGENA'] > 0 || array['DPTFIVEYEARCOURSEAVERAGENA'] > 0 || array['PERSONALFIVEYEARAVERAGENA'] > 0) {
    	            tableWidth = 215;
    	            cellWidth = 38;
    	        }
    	        else {
    	            tableWidth = 225;
    	            cellWidth = 47;
    	        }

    	        resultString += '			<button id="' + questionNumber + '" class="button ' + questionNumber + '">↕</button>';
    	        if (questionJSON[questionNumber][7] > 0 || array['DPTSEMESTERAVERAGENA'] > 0 || array['PERSONALSEMESTERAVERAGENA'] > 0 || array['DPTFIVEYEARCOURSEAVERAGENA'] > 0 || array['PERSONALFIVEYEARAVERAGENA'] > 0) {
    	            resultString += '<table class="table_settings" border="0" style="position:relative; left:22px; margin-top:0px; margin-bottom:-5px; width:900px;">			';
    	        }
    	        else {
    	            resultString += '<table class="table_settings" border="0" style="position:relative; left:54px; margin-top:0px; margin-bottom:-5px; width:900px;">			'; //N/A DATA
    	        }
    	        resultString += '					<tbody><tr>	';
    	        resultString += '						<td colspan="7">';
    	        if (questionJSON[questionNumber][7] > 0 || array['DPTSEMESTERAVERAGENA'] > 0 || array['PERSONALSEMESTERAVERAGENA'] > 0 || array['DPTFIVEYEARCOURSEAVERAGENA'] > 0 || array['PERSONALFIVEYEARAVERAGENA'] > 0) {
    	            resultString += '							<div class="question hiddenQuestionNA">';
    	        }
    	        else {
    	            resultString += '							<div class="question hiddenQuestion">';
    	        }
    	        resultString += '									' + questionNumber + '. ' + questionJSON[questionNumber][0]; +'';
    	        resultString += '							</div>';
    	        resultString += '						</td>';
    	        resultString += '					</tr>';
    	        resultString += '					<tr>';
    	        resultString += '						<td align="left" style="width:' + tableWidth + 'px"> </td>'; // N/A DATA
    	        resultString += '						<td align="left" >SD</td>	';
    	        resultString += '						<td align="left" >D</td>';
    	        resultString += '						<td align="left" >N</td>';
    	        resultString += '						<td align="left" >A</td>';
    	        resultString += '						<td align="left" >SA</td>	';
    	        if (questionJSON[questionNumber][7] > 0 || array['DPTSEMESTERAVERAGENA'] > 0 || array['PERSONALSEMESTERAVERAGENA'] > 0 || array['DPTFIVEYEARCOURSEAVERAGENA'] > 0 || array['PERSONALFIVEYEARAVERAGENA'] > 0) {
    	            resultString += '						<td align="left" >N\/A</td>	';//N\A DATA
    	        }
    	        resultString += '						<td align="left"></td>';
    	        resultString += '					</tr>';
    	        resultString += '					<tr valign="bottom">';
    	        resultString += '						<td align="left" style="width:' + tableWidth + 'px">Your Score </td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + questionJSON[questionNumber][1] + '</td>	';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + questionJSON[questionNumber][2] + '</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + questionJSON[questionNumber][3] + '</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + questionJSON[questionNumber][4] + '</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + questionJSON[questionNumber][5] + '</td>	';
    	        if (questionJSON[questionNumber][7] > 0 || array['DPTSEMESTERAVERAGENA'] > 0 || array['PERSONALSEMESTERAVERAGENA'] > 0 || array['DPTFIVEYEARCOURSEAVERAGENA'] > 0 || array['PERSONALFIVEYEARAVERAGENA'] > 0) {
    	            resultString += '						<td align="left" style="width:' + cellWidth + '">' + questionJSON[questionNumber][7] + '</td>	';	//N/A DATA
    	        }
    	        resultString += '						<td align="left" valign = "middle"rowspan="2"> ';
    	        resultString += '						<div class="graph_expanded">';

    	        currentLengths = new Array(((questionJSON[questionNumber][1]) / (totalResponses)) * totalBarLength,
    										((questionJSON[questionNumber][2]) / (totalResponses)) * totalBarLength,
    										((questionJSON[questionNumber][3]) / (totalResponses)) * totalBarLength,
    										((questionJSON[questionNumber][4]) / (totalResponses)) * totalBarLength,
    										((questionJSON[questionNumber][5]) / (totalResponses)) * totalBarLength,
    										((questionJSON[questionNumber][7]) / (totalResponses)) * totalBarLength);
    	        normPixelLength(currentLengths);
    	        //				statsTableString = statsTableString + '	<td><div class="container"><div class="overall_bar littleTicks" style="width:'+getPixelLength(crnStatistics2['INSTRUCTORCLASSFIVEYEARAVERAGE']).toFixed(2)+'px"></div></div></td>';
    	        //resultString +='								<div class="colorStronglyDisagree" style="width:'+((questionJSON[questionNumber][1])/(questionJSON[questionNumber][6]))*totalBarLength+'px"></div>	';
    	        resultString += '								<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="' + currentLengths[0] + 'px" height="' + barHeight + 'px" title="Strongly Disagree: ' + questionJSON[questionNumber][1] + '/' + totalResponses + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorDisagree.png" width="' + currentLengths[1] + 'px" height="' + barHeight + 'px" title="Disagree: ' + questionJSON[questionNumber][2] + '/' + totalResponses + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorNeutral.png" width="' + currentLengths[2] + 'px" height="' + barHeight + 'px" title="Neutral: ' + questionJSON[questionNumber][3] + '/' + totalResponses + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorAgree.png" width="' + currentLengths[3] + 'px" height="' + barHeight + 'px" title="Agree: ' + questionJSON[questionNumber][4] + '/' + totalResponses + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorStronglyAgree.png" width="' + currentLengths[4] + 'px" height="' + barHeight + 'px" title="Strongly Agree: ' + questionJSON[questionNumber][5] + '/' + totalResponses + '"> ';
    	        if (questionJSON[questionNumber][7] > 0) {
    	            resultString += '								<img class="displaycolor"  src = "images/colorNA.png" width="' + currentLengths[5] + 'px" height="' + barHeight + 'px" title="N\/A: ' + questionJSON[questionNumber][7] + '/' + totalResponses + '"> ';//N/A DATA
    	        }

    	        resultString += '						</div>';
    	        resultString += '						</td>';
    	        resultString += '					</tr>';
    	        resultString += '					<tr height="40px;" valign="top" ><img class = "question_image_box" src = "images/colorItemBackground.png">';
    	        resultString += '						<td align="left" style="width:100px"></td>'; //FIXED NO TITLE FOR THIS CATEGORY
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((questionJSON[questionNumber][1] / (questionJSON[questionNumber][6])) * 100).toFixed(0) + '%</td>	';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((questionJSON[questionNumber][2] / (questionJSON[questionNumber][6])) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((questionJSON[questionNumber][3] / (questionJSON[questionNumber][6])) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((questionJSON[questionNumber][4] / (questionJSON[questionNumber][6])) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((questionJSON[questionNumber][5] / (questionJSON[questionNumber][6])) * 100).toFixed(0) + '%</td>	';
    	        if (questionJSON[questionNumber][7] > 0) {
    	            resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((questionJSON[questionNumber][7] / (questionJSON[questionNumber][6])) * 100).toFixed(0) + '%</td>	';// N/A DATA
    	        }



    	        resultString += '					</tr>	';
    	        resultString += '					<tr>';
    	        resultString += '						<td align="left" style="width:100px">Dpt Average This Semester</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTSEMESTERAVERAGESD'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTSEMESTERAVERAGED'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTSEMESTERAVERAGEN'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTSEMESTERAVERAGEA'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTSEMESTERAVERAGESA'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        if (array['DPTSEMESTERAVERAGENA'] > 0) {
    	            resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTSEMESTERAVERAGENA'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';// N/A DATA
    	        }

    	        currentLengths = new Array(((array['DPTSEMESTERAVERAGESD'] / array['DPTSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['DPTSEMESTERAVERAGED'] / array['DPTSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['DPTSEMESTERAVERAGEN'] / array['DPTSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['DPTSEMESTERAVERAGEA'] / array['DPTSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['DPTSEMESTERAVERAGESA'] / array['DPTSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['DPTSEMESTERAVERAGENA'] / array['DPTSEMESTERAVERAGETOTAL']) * totalBarLength));
    	        normPixelLength(currentLengths);
    	        resultString += '						<td align="left"> ';
    	        resultString += '						';
    	        resultString += '							<div class="graph_expanded">';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[0] + 'px" height="' + barHeight + 'px" src="images/colorStronglyDisagree.png"	title="Strongly Disagree: ' + ((array['DPTSEMESTERAVERAGESD'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[1] + 'px" height="' + barHeight + 'px" src="images/colorDisagree.png" title="Disagree: ' + ((array['DPTSEMESTERAVERAGED'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[2] + 'px" height="' + barHeight + 'px" src="images/colorNeutral.png" title="Neutral: ' + ((array['DPTSEMESTERAVERAGEN'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[3] + 'px" height="' + barHeight + 'px" src="images/colorAgree.png" title="Agree: ' + ((array['DPTSEMESTERAVERAGEA'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[4] + 'px" height="' + barHeight + 'px" src="images/colorStronglyAgree.png" title="Strongly Agree: ' + ((array['DPTSEMESTERAVERAGESA'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        if (array['DPTSEMESTERAVERAGENA'] > 0) {
    	            resultString += '									<img class="displaycolor" width="' + currentLengths[5] + 'px" height="' + barHeight + 'px" src="images/colorNA.png" title="N\/A: ' + ((array['DPTSEMESTERAVERAGENA'] / array['DPTSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        }
    	        resultString += '							</div>';
    	        resultString += '						</td>';
    	        resultString += '					</tr>';
    	        resultString += '					';
    	        resultString += '					<tr>';
    	        resultString += '						<td align="left" style="width:100px">Your Overall Semester Average</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALSEMESTERAVERAGESD'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALSEMESTERAVERAGED'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALSEMESTERAVERAGEN'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALSEMESTERAVERAGEA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALSEMESTERAVERAGESA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        if (array['PERSONALSEMESTERAVERAGENA'] > 0) {
    	            resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALSEMESTERAVERAGENA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';//N/A DATA
    	        }

    	        currentLengths = new Array(((array['PERSONALSEMESTERAVERAGESD'] / array['PERSONALSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['PERSONALSEMESTERAVERAGED'] / array['PERSONALSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['PERSONALSEMESTERAVERAGEN'] / array['PERSONALSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['PERSONALSEMESTERAVERAGEA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['PERSONALSEMESTERAVERAGESA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * totalBarLength),
    										((array['PERSONALSEMESTERAVERAGENA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * totalBarLength));
    	        normPixelLength(currentLengths);
    	        resultString += '						<td align="left"> ';
    	        resultString += '						';
    	        resultString += '							<div class="graph_expanded">';
    	        resultString += '								<img class="displaycolor" width="' + currentLengths[0] + 'px" height="' + barHeight + 'px" src="images/colorStronglyDisagree.png" title="Strongly Disagree: ' + ((array['PERSONALSEMESTERAVERAGESD'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>	';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[1] + 'px" height="' + barHeight + 'px" src="images/colorDisagree.png" title="Disagree: ' + ((array['PERSONALSEMESTERAVERAGED'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[2] + 'px" height="' + barHeight + 'px" src="images/colorNeutral.png" title="Neutral: ' + ((array['PERSONALSEMESTERAVERAGEN'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[3] + 'px" height="' + barHeight + 'px" src="images/colorAgree.png" title="Agree: ' + ((array['PERSONALSEMESTERAVERAGEA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        resultString += '									<img class="displaycolor" width="' + currentLengths[4] + 'px" height="' + barHeight + 'px" src="images/colorStronglyAgree.png" title="Strongly Agree: ' + ((array['PERSONALSEMESTERAVERAGESA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        if (array['PERSONALSEMESTERAVERAGENA'] > 0) {
    	            resultString += '									<img class="displaycolor" width="' + currentLengths[5] + 'px" height="' + barHeight + 'px" src="images/colorNA.png" title="N/\A: ' + ((array['PERSONALSEMESTERAVERAGENA'] / array['PERSONALSEMESTERAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"/>';
    	        }
    	        resultString += '							</div>';
    	        resultString += '						</td>';
    	        resultString += '					</tr>	';
    	        resultString += '					<tr>';
    	        resultString += '						<td align="left" style="width:100px">Dpt ' + ' 5 Year Average</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTFIVEYEARCOURSEAVERAGESD'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTFIVEYEARCOURSEAVERAGED'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTFIVEYEARCOURSEAVERAGEN'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTFIVEYEARCOURSEAVERAGEA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTFIVEYEARCOURSEAVERAGESA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        if (array['DPTFIVEYEARCOURSEAVERAGENA'] > 0) {
    	            resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['DPTFIVEYEARCOURSEAVERAGENA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';//N/A DATA
    	        }
    	        resultString += '						<td align="left"> ';
    	        resultString += '						';
    	        resultString += '							<div class="graph_expanded">';

    	        currentLengths = new Array((((array['DPTFIVEYEARCOURSEAVERAGESD'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL'])) * totalBarLength),
    										(((array['DPTFIVEYEARCOURSEAVERAGED'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL'])) * totalBarLength),
    										(((array['DPTFIVEYEARCOURSEAVERAGEN'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL'])) * totalBarLength),
    										(((array['DPTFIVEYEARCOURSEAVERAGEA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL'])) * totalBarLength),
    										(((array['DPTFIVEYEARCOURSEAVERAGESA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL'])) * totalBarLength),
    										(((array['DPTFIVEYEARCOURSEAVERAGENA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL'])) * totalBarLength));
    	        normPixelLength(currentLengths);
    	        //resultString +='									<div class="graph_box graphStronglyDisagree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGESD']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>	';
    	        //resultString +='									<div class="graph_box graphDisagree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGED']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
    	        //resultString +='									<div class="graph_box graphNeutral" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGEN']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
    	        //resultString +='									<div class="graph_box graphAgree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGEA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
    	        //resultString +='									<div class="graph_box graphStronglyAgree" style="width:'+((array['DPTFIVEYEARCOURSEAVERAGESA']/array['DPTFIVEYEARCOURSEAVERAGETOTAL'])*totalBarLength)+'px;"></div>				';
    	        resultString += '								<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="' + currentLengths[0] + 'px" height="' + barHeight + 'px" title="Disagree: ' + ((array['DPTFIVEYEARCOURSEAVERAGESD'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorDisagree.png" width="' + currentLengths[1] + 'px" height="' + barHeight + 'px" title="Disagree: ' + ((array['DPTFIVEYEARCOURSEAVERAGED'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor"  src = "images/colorNeutral.png" width="' + currentLengths[2] + 'px" height="' + barHeight + 'px" title="Neutral: ' + ((array['DPTFIVEYEARCOURSEAVERAGED'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorAgree.png" width="' + currentLengths[3] + 'px" height="' + barHeight + 'px" title="Agree: ' + ((array['DPTFIVEYEARCOURSEAVERAGEA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor"  src = "images/colorStronglyAgree.png" width="' + currentLengths[4] + 'px" height="' + barHeight + 'px" title="Strongly Agree: ' + ((array['DPTFIVEYEARCOURSEAVERAGESA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        if (questionJSON[questionNumber][7]) {
    	            resultString += '								<img class="displaycolor"  src = "images/colorNA.png" width="' + currentLengths[5] + 'px" height="' + barHeight + 'px" title="N\/A: ' + ((array['DPTFIVEYEARCOURSEAVERAGENA'] / array['DPTFIVEYEARCOURSEAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        }
    	        resultString += '							</div>';
    	        resultString += '						';
    	        resultString += '						</td>';
    	        resultString += '					</tr>';
    	        resultString += '					<tr>';
    	        resultString += '						<td align="left" style="width:100px">Your ' + ' 5 Year Average</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALFIVEYEARAVERAGESD'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALFIVEYEARAVERAGED'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALFIVEYEARAVERAGEN'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALFIVEYEARAVERAGEA'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(0) + '%</td>';
    	        resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALFIVEYEARAVERAGESA'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';
    	        if (array['PERSONALFIVEYEARAVERAGENA'] > 0) {
    	            resultString += '						<td align="left" style="width:' + cellWidth + '">' + ((array['PERSONALFIVEYEARAVERAGENA'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(0) + '%</td>	';//N/A DATA
    	        }
    	        resultString += '						<td align="left"> ';
    	        resultString += '							<div class="graph_expanded">';
    	        //resultString +='									<div class="graph_box graphStronglyDisagree" style="width:'+((array['PERSONALFIVEYEARAVERAGESD']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>	';
    	        //resultString +='									<div class="graph_box graphDisagree" style="width:'+((array['PERSONALFIVEYEARAVERAGED']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
    	        //resultString +='									<div class="graph_box graphNeutral" style="width:'+((array['PERSONALFIVEYEARAVERAGEN']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
    	        //resultString +='									<div class="graph_box graphAgree" style="width:'+((array['PERSONALFIVEYEARAVERAGEA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>';
    	        //resultString +='									<div class="graph_box graphStronglyAgree" style="width:'+((array['PERSONALFIVEYEARAVERAGESA']/array['PERSONALFIVEYEARAVERAGETOTAL'])*totalBarLength)+'px;"></div>				';

    	        currentLengths = new Array((((array['PERSONALFIVEYEARAVERAGESD'] / array['PERSONALFIVEYEARAVERAGETOTAL'])) * totalBarLength),
    										(((array['PERSONALFIVEYEARAVERAGED'] / array['PERSONALFIVEYEARAVERAGETOTAL'])) * totalBarLength),
    										(((array['PERSONALFIVEYEARAVERAGEN'] / array['PERSONALFIVEYEARAVERAGETOTAL'])) * totalBarLength),
    										(((array['PERSONALFIVEYEARAVERAGEA'] / array['PERSONALFIVEYEARAVERAGETOTAL'])) * totalBarLength),
    										(((array['PERSONALFIVEYEARAVERAGESA'] / array['PERSONALFIVEYEARAVERAGETOTAL'])) * totalBarLength),
    										(((array['PERSONALFIVEYEARAVERAGENA'] / array['PERSONALFIVEYEARAVERAGETOTAL'])) * totalBarLength));
    	        normPixelLength(currentLengths);
    	        resultString += '								<img class="displaycolor" src = "images/colorStronglyDisagree.png" width="' + currentLengths[0] + 'px" height="' + barHeight + 'px" title="Disagree: ' + ((array['PERSONALFIVEYEARAVERAGESD'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorDisagree.png" width="' + currentLengths[1] + 'px" height="' + barHeight + 'px" title="Disagree: ' + ((array['PERSONALFIVEYEARAVERAGED'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor"  src = "images/colorNeutral.png" width="' + currentLengths[2] + 'px" height="' + barHeight + 'px" title="Neutral: ' + ((array['PERSONALFIVEYEARAVERAGEN'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor" src = "images/colorAgree.png" width="' + currentLengths[3] + 'px" height="' + barHeight + 'px" title="Agree: ' + ((array['PERSONALFIVEYEARAVERAGEA'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        resultString += '								<img class="displaycolor"  src = "images/colorStronglyAgree.png" width="' + currentLengths[4] + 'px" height="' + barHeight + 'px" title="Strongly Agree: ' + ((array['PERSONALFIVEYEARAVERAGESA'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        if (array['PERSONALFIVEYEARAVERAGENA'] > 0) {
    	            resultString += '								<img class="displaycolor"  src = "images/colorNA.png" width="' + currentLengths[5] + 'px" height="' + barHeight + 'px" title="N\/A: ' + ((array['PERSONALFIVEYEARAVERAGENA'] / array['PERSONALFIVEYEARAVERAGETOTAL']) * 100).toFixed(2) + '%' + '"> ';
    	        }
    	        resultString += '							</div>';
    	        resultString += '						</td>';
    	        resultString += '					</tr>	';
    	        resultString += '				</tbody></table>';
    	        resultString += '				</div>';

    	        //expanderDiv.hide();
    	        expanderDiv.append(resultString);


    	        $(".loadinggif").remove();
    	        expanderDiv.slideDown(UIspeed);
    	        //originalDiv.addClass("Already_Expanded");
    	        resultString = '';

    	    },
    	    error: function (xhr, ajaxOptions, thrownError, asdf) {

    	        alert("failed to process Ajax");
    	    }
    	});
    }

    /*function printQuery(name, start, data)
    {
    	var rs = "";
    	var total = data.DATA[0][start+5];
    	var sd = (data.DATA[0][start+4] / total) * 100;
    	var d = (data.DATA[0][start+3] / total) * 100;
    	var n = (data.DATA[0][start+2] / total) * 100;
    	var a = (data.DATA[0][start+1] / total) * 100;
    	var sa = (data.DATA[0][start] / total) * 100;
    	var factor = 4;
    	rs += "<tr class='result'>";
    	rs += "<td>" + name + "</td>";
    	rs += "<td> SD: " + Math.round(sd) + "% </td>";
    	rs += "<td> D: " + Math.round(d) + "% </td>";
    	rs += "<td> N: " + Math.round(n) + "% </td>";
    	rs += "<td> A: " + Math.round(a) + "% </td>";
    	rs += "<td> SA: " +Math.round(sa) + "% </td>";
    	rs += '<td><div class="graph_box graphStronglyDisagree" style=" width:'+sd*factor+'px;"></div>';
    	rs += '<div class="graph_box graphDisagree" style=" width:'+d*factor+'px;"></div>';
    	rs += '<div class="graph_box graphNuteral" style=" width:'+n*factor+'px;"></div>';
    	rs += '<div class="graph_box graphAgree" style=" width:'+a*factor+'px;"></div>';
    	rs += '<div class="graph_box graphStronglyAgree" style=" width:'+sa*factor+'px;"></div>';
    	rs += "</td></tr>";
    	return rs;
    }*/


    function nextCrn() {
        if (currentCRNIndex < crnArray.length) {
            addToReport(crnArray[currentCRNIndex][0], crnArray[currentCRNIndex][1], crnArray[currentCRNIndex][2]);
            currentCRNIndex++;
            $('#loadingstatus').get(0).innerHTML = '<p class="loadinggif">' + currentCRNIndex + ' of ' + crnArray.length + ' classes</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>';

        }
            // we completed it so turn off the loading status div
        else if (!window.complete) {
            complete = true;

            $('#loadingstatus').remove();

            if (typeof (onReportComplete) === typeof (Function)) {
                onReportComplete(elementList);
            }
        }
    }
    function onErrorQueries(wrapperElement) {
        wrapperElement["TOPQUERY"] = false;
        wrapperElement["MAINQUERY"] = false;
        wrapperElement["TOPDETAILS"] = false;
        wrapperElement["ESSAYQUERY"] = false;
        wrapperElement["TITLEQUERY"] = false;
        wrapperElement["FAILED"] = true;
        elementList.pop();
        $('#crnErrors').append('CRN - ' + wrapperElement.crn + '| Semester - ' + wrapperElement.semesterNum + '| Year - ' + wrapperElement.year + '  is an invalid '
            + 'class<br />');
        $('#footer' + wrapperElement.crn).remove();
        //$(wrapperElement).remove();

    }
    function failedQueries(element) {
        //return !element["TOPQUERY"] && !element["TOPDETAILS"] && !element["TITLEQUERY"]
        //       && !element["MAINQUERY"] && !element["ESSAYQUERY"];
        return element["FAILED"];
    }
    function topQueryComplete(wrapperElement, passed) {

        if (!passed) {
            //execute failed event
            onErrorQueries(wrapperElement);
        }
        if (failedQueries(wrapperElement)) {
            nextCrn();
            return;
        }
        wrapperElement["TOPQUERY"] = passed;
        if (checkCompletedAllQueries(wrapperElement)) {
            //advance to next crn
            nextCrn();
        }


    }

    function topDetailsComplete(wrapperElement, passed) {


        if (!passed) {
            //execute failed event
            onErrorQueries(wrapperElement);
        }
        if (failedQueries(wrapperElement)) {
            nextCrn();
            return;
        }
        wrapperElement["TOPDETAILS"] = passed;
        if (checkCompletedAllQueries(wrapperElement)) {
            //advance to next crn
            nextCrn();
        }

    }

    function mainQueryComplete(wrapperElement, passed) {

        if (!passed) {
            //execute failed event
            onErrorQueries(wrapperElement);
        }
        if (failedQueries(wrapperElement)) {
            nextCrn();
            return;
        }
        wrapperElement["MAINQUERY"] = passed;
        if (checkCompletedAllQueries(wrapperElement)) {
            //advance to next crn
            nextCrn();
        }


    }

    function essayQueryComplete(wrapperElement, passed) {

        if (!passed) {
            //execute failed event
            onErrorQueries(wrapperElement);
        }
        if (failedQueries(wrapperElement)) {
            nextCrn();
            return;
        }
        wrapperElement["ESSAYQUERY"] = passed;
        if (checkCompletedAllQueries(wrapperElement)) {
            //advance to next crn
            nextCrn();
        }

    }

    function titleQueryComplete(wrapperElement, passed) {

        if (!passed) {
            //execute failed event
            onErrorQueries(wrapperElement);
        }
        if (failedQueries(wrapperElement)) {
            nextCrn();
            return;
        }
        wrapperElement["TITLEQUERY"] = passed;
        if (checkCompletedAllQueries(wrapperElement)) {
            //advance to next crn
            nextCrn();
        }

    }
    function checkCompletedAllQueries(element) {
        return element["TOPQUERY"] && element["TOPDETAILS"] && element["TITLEQUERY"]
               && element["MAINQUERY"] && element["ESSAYQUERY"];
    }

    function addToReport(CRN, Semester, Year) {
        var element = document.createElement('div');
        element.innerHTML = divHTML;
        document.body.appendChild(element);
        element.id = "class" + CRN + "-" + Semester + "-" + Year;
        element.crn = CRN;
        element.semesterNum = Semester;
        element.year = Year;
        elementList.push(element);
        //element.outerHTML = divHTML;
        currentElement = element;
        $(element).delegate(".button", "click", function () { detailsQuery(element, CRN, Semester, Year, $(this).siblings(".hiddenQuestionID").val(), this); });
        $(element).delegate(".tpbutton", "click", function () { detailsTop(element, CRN, Semester, Year, this); });

        $(element).find("#StatisticsWrapper").before('<p class="loadinggif">Calculating...</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>');
        titleQuery(element, CRN, Semester, Year);
        mainQuery(element, CRN, Semester, Year);
        essayQuery(element, CRN, Semester, Year);
        topQuery(element, CRN, Semester, Year);


        //add footer that adds a page break for css
        if (currentCRNIndex < crnArray.length - 2)
            $(element).after('<footer id="footer' + CRN + '"  class="pagebreak"><br /> <br />  </footer>');
    }
    var resultString = "";
    var CRN = 0;
    var Semester = 0;
    var Year = 0;


    var questionJSON = {};
    var storedQuestions = {};


    var totalRespondents = [];
    var totalBarLength = 400;
    var barHeight = 30;

    elementList = [];
    currentCRNIndex = 0;
    complete = false;

    currentElement = {};
    divHTML = "<div class=\"wrapper\">\r\n\t\r\n\t\t<div class=\"title\" id=\"title_wrapper\" style=\"margin:0px;padding:0px;\">\r\n\t\t\t<!-- course evaluation - cs1400 67877 spr 2013 -->\r\n\t\t<\/div>\r\n\t\t<div id=\"StatisticsWrapper\"><\/div>\r\n\t\t<div class=\"bar_divider\"><hr\/><\/div>\r\n\t\t<div class=\"legend_box\">\r\n\t\t\t<div class=\"legend_graph\">\r\n\t\t\t\t\r\n\t\t\t\t<div class=\"headingAndText\">\r\n\t\t\t\t\t<img id=\"barimage\" src=\"images\/colorStronglyDisagree.png\" >\t\r\n\t\t\t\t\t<p id = \"textDouble\">Strongly Disagree<\/p>\r\n\t\t\t\t<\/div>\r\n\r\n\t\t\t\t<div class=\"headingAndText\">\r\n\t\t\t\t\t<img id=\"barimage\" src=\"images\/colorDisagree.png\" >\t\r\n\t\t\t\t\t<p id = \"text\">Disagree<\/p>\r\n\t\t\t\t<\/div>\r\n\r\n\t\t\t\t<div class=\"headingAndText\">\r\n\t\t\t\t\t<img id=\"barimage\" src=\"images\/colorNeutral.png\" >\t\r\n\t\t\t\t\t<p id = \"text\">Neutral<\/p>\r\n\t\t\t\t<\/div>\r\n\t\t\t\t\r\n\t\t\t\t<div class=\"headingAndText\">\r\n\t\t\t\t\t<img id=\"barimage\" src=\"images\/colorAgree.png\" >\t\r\n\t\t\t\t\t<p id = \"text\">Agree<\/p>\r\n\t\t\t\t<\/div>\r\n\r\n\t\t\t\t<div class=\"headingAndText\">\r\n\t\t\t\t\t<img id=\"barimage\" src=\"images\/colorStronglyAgree.png\" >\t\r\n\t\t\t\t\t<p id = \"textDouble\">Strongly<br\/>Agree<\/p>\r\n\t\t\t\t<\/div>\r\n\t\t\t\t\r\n\t\t\t\t\r\n\t\t\t<\/div>\r\n\t\t<\/div>\r\n\r\n\t\r\n\t\t<div id=\"questions_wrapper\"><\/div>\r\n\t\t\r\n\t\t<div class=\"bar_divider\"><hr\/><\/div>\r\n\r\n\t\t<div id=\"EssayWrapper\"><\/div>\r\n\t\t\r\n\t\t<div class=\"footer\">\r\n\t\t\t&copy; 2014 Weber State University\r\n\t\t<\/div>\r\n  <\/div>";



    /*
    *   Starts the breakdown report. It expects an array of strings in CRN-SEMESTERNUM-YEAR format
    *   Ex. 30611-3-2013
    */
    function loadCRNData(crnArray) {

        errorCRN = [];


        var tempArray = [];

        for (var i = 0; i < crnArray.length; i++) {

            crnData = crnArray[i].split('-');
            if (crnData.length != 3) {
                $('#crnErrors').append(crnArray[i] + ' is not in a valid parameter format <br/>');
                break;
            }

            if (crnData[0].length != 5) {
                errorCRN.push(crnArray[i]);
                break;
            }
            else if (isNaN(crnData[0])) {
                errorCRN.push(crnArray[i]);
                break;
            }

            tempArray.push(crnData);

        }

        crnArray = tempArray;

        for (var e = 0; e < errorCRN.length; e++) {

            $('#crnErrors').append(errorCRN[e] + ' is not a valid CRN <br/>');
        }

        window.crnArray = crnArray;

        var loadingStatus = document.createElement('div');
        loadingStatus.id = "loadingstatus";
        loadingStatus.innerHTML = '<p class="loadinggif">0 of ' + crnArray.length + ' classes</p></br><img class="loadinggif" src=".\\images\\ajax-loader.gif" "/>';
        document.body.appendChild(loadingStatus);
        nextCrn();
    }

    return {
      onLoad: onLoad,
      toKeyValPair: toKeyValPair
    }
});
