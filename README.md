## Project Summary
What is the Eval System?

The Eval System is an extension to the Chitester Eval, that is built by students for a better way of tracking, and collecting data for professors through the evaluations that are made available at the end of each semester. The goal of the project is to have an accurate and relatively easy to use system that is also mobile friendly that allows the user -- who is generally a secretary, professor, Dean, or any other relevant member of the staff -- to pull up evaluation reports on a professor for multiple courses/semesters/departments and compare them for Tenure and Promotion as well as other desired features. There is also a function that will access the Chitester site and print a list of the reports that are requested and have those printed reports formatted in a desirable way.
  
## Component overview
  
  The PinGraph takes a collection of courses based upon the selections of the Selection GUI that was created by the Summer 2016 Eval Group and displays them in a neat graph full of pins. Each pin has a color based on its accessibility. If it's blue there is no access, green you can access and view the report of that pin. 
  
  The Pin Graph Selection GUI has a various number of selection menus to more accurately pinpoint the courses and or professor evaluations that you are looking for. Tutorials for on how that GUI works can be found in the GUI folder under documentation.
  
  The Promotion and Tenure report is a report that shows the student evals for the course, and how the professor did based on those students opinions as well as supplying a chart that shows how they did compared to other semesters. It also has other important information, though most of this information is really only necessary for the dean. To see more, take a look on chitester.

## The Project So Far...
This project has passed through a number of groups at this point, and keeping track of what happened when is somewhat difficult. What follows is my best reconstruction of the project's timeline as of spring 2017:
	
Summer 2016: The project began. It was first made within .NET, but there appears to be very little documentation. In the current file structure these files can be found in Old->.NET-Project->CS Eval
	
Fall 2016: The second group took over the project. The backend technology was changed from .NET to NodeJS and much of their time was spent converting the project. Luckilly, this group did leave a fair amount of documentation behind. The explainations of each piece are generally good, though there seems to be little in the way of descriptions of how the pieces fit together. Additionally, there are a couple of important notes missing, such as there being no mention of the heroku API that was being used in some of the files. There were also a number of SQL files to add tables to the database, but little to no explaination of what they were for. How much of this group's work was simply converting to the new technology and how much focused on expanding the project, I am not sure.
		
Spring 2017: The technology requirements again changed. Now the front end technology to be used is AngularJS. As such, much of the focus has been on converting existing files to the new technology. An API was also created to allow for a better, more flexible approach to interacting with the data.

The current architecture and the technologies we used look like this...

```
Web Pages 	Front End	Back End		Database
Views		Controllers	API/api.php		DatabaseCreation, and API/Controllers
html/css	js		php			sql (in php files)
				(See API/README.md)	
```

Summer 2017: We tried to keep everything the same as far as languages from the previous group, however once we met with Chitester they told us that they were changing languages and what we had done would have to be rewritten. However, after talking with Brad, we are going to keep everything the way it is because it should be pretty independent from chitester system with the exception of the database. We created an API similar to the previous group. We had many issues with setting up the database with the scripts given to us from the previous group (see the readme under the database creation frolder). Get with chitester early on and ask for permission to access the dev website (https://chitester1dev.weber.edu). We couldn't get access to this for a while and it made things hard to debug and run.
	
## File structure explaination
### Overview of current folders:
#### API:
Content: The API used to allow comunication between the frontend and the database.
Notes: The API is written in PHP and must be hosted on a web server. Additionally, file paths and API calls will have to be updated to point to where it is hosted. The paths that need to be changed are in the following files:
			
#### Controllers:
Content: The AngularJS controllers used in the Views.
Notes:
			
#### CSS
Content: The CSS files used by the Views.
Notes:
			
#### DatabaseCreation
Content: A series of SQL scripts used to construct a local database. Each script both creates the table named in the script and populates it with test data. 
Notes: It wouldn't hurt to ask Chitester for an updated data dump to insert into each table. I would also recommend setting up the database on a remote server instead of just working with a local one. (Might actually be required for the API to work.) We (spring 2017) spoke to Rob Hilton about setting it up on Titan and did so with minimal fuss. We(summer 2017) tried contacting Rob Hilton, however he was hard to reach, so we contacted Patrick Beck and had him help us.
*Need to clean this folder out some and move SQL scripts scattered throughout the project into it*
*Does 22_Functions_StoredProcs have all of both?*
			
#### Includes
Content: Javascript libraries used by the rest of the project.
Notes:

#### Old
Content: The old files inherited from the previous group. 
Notes: These are all the out dated .NET and NodeJS files.
			
#### Views
Content: The web pages that users will see and interact with.
Notes:
		
### Code conventions
*List code conventions here*

### Database changes
List of added tables
		Evals_DistractorTextAndScore
			Essentially adds two columns to the Distractors table. These columns separate the numeric value of the distractor and the text into two columns instead of just one. A more thorough explaination can be found below.
		Evals_UserDepartmentRoles
			This table functions as a three way association table between Users, Departments, and Roles. It is meant to be used to determine user permissions when generating reports. 
List of added stored procedures

## Next Steps

### Generating a report

We (summer 2017) focused a lot of time on trying to get the Class_Breakdown and the Pingraph web pages to pull correct data. We have the pingraph pretty much there. The scores being displayed are incorrect because of the math used to average the scores. For the Class_Breakdown page, we are really close. We can see the data is there if we go to the actual url with the CRN, semester, and year, but we are having issues saying that we are not logged in. We are going to try and place these pages on the same server as chitester and see if this solves the error.

Essentially what you need to do is use the selection flow to narrow down the courses for the graph to display. You should go through the selection flow and the send data to class_breakdown or pingraph. Class_breakdown is ready to go once the correct data is sent. All it needs is an array in the form [crn-semester-year, crn-semester-year, ...etc] and it will show all of the reports on one page. You can see it here: https://chitester1dev.weber.edu:6838/misc/weber/csevals/class_breakdown.html Also if you pass URL parameters you can display a single course: https://chitester1dev.weber.edu:6838/misc/weber/csevals/class_breakdown.html?CRN=30611&Semester=3&Year=2013
There are some comments in Controllers/Class_Breakdown.js that explain a little more. 


### Office Administrator Page
See Hand off video for additional details from spring 2017.
We (summer 2017) have created a nice accordion style page for this. It is called PermissionPage. This is pulling from the database, however we do not have tables created to allow us to save to the database.

### Box and Whisker Page

Let’s be honest…. I didn’t accomplish much. Drawing lines is proving to be a little difficult and I struggle as it is. I created BWchart.html, BWchart.css, and boxAndWhiskerChart.js. Why the difference in names? If you met me, you’d understand. I get confused and I named one way different so I wouldn’t click on all 3 to get to the one I wanted. BWchart.html was primarily copied and pasted from the previous groups code with their pinGraph.html. There were obviously a few changes, but the skeleton is basically the same. BWchart.css is exactly like pinGraph.css. No difference. boxAndWhiskerChart.js was also copied and pasted from pinGraph.js, but this code has had most of the changes. I had issues from the beginning with trying to manipulate it into a box and whisker plot. The first issue is you must click one of the zoom buttons for any lines to show up. I couldn’t figure that one out. If you can, you get a gold star. Next issue is……. MATH. The vertical lines are where they should be. In the end, we started to like each other slightly… like the step-brother you really didn’t want… but we warmed up. It’s still not perfect though. The math of the outliers needs help.



### Deployment
Reach out to Brad and Chitester for this one. Also check and see if chitester is using a different language and adjust the project early if necessary. Good luck.
