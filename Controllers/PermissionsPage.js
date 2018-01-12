var app = angular.module("EvalSystem", []);
var termsSelected = []; // holds the terms that the user has selected
var departmentsSelected = []; //holds the departments that the user has selected
var coursesSelected = [];
var rolesSelected = [];
var roleIDs = 0;
var FacultyList = [];
var SelectedFaculty = "Professor Name's Permissions:";
var SelectedFacultyId = "";
var reportDisplayOption = "";
var tempDepartmentOption = "";
var tempPermSelected = "";
var indexSelected = 0;

// NOTE: This will need to be changed each semester to the path that the current group has set up for their API calls
var apiPath = "https://icarus.cs.weber.edu/~ck50991/CS4450/v1/"; //This is the path to the API calls that interface with the database.

//used in the first page of the accordian view
//the API call retrives a list of all instructors and pushed into the html select element
app.controller("FacultySelectController", function ($scope, $http) {
    $http(
        {
            url: apiPath + "instructors",
            method: "get",
            headers: { "Content-Type": "application/x-www-form-urlencoded" }
        }
    )
        .then(
        function successCallback(response) {
           
            FacultyList = response.data;
            $scope.facs = response.data;
            console.log(FacultyList);            
        },
        function errorCallback(response) {
            console.log(response);
        }
        );
    $scope.showSelectValue = function (FacultySelected) {
        
        SelectedFacultyId = FacultySelected[0];
        console.log(SelectedFacultyId);
        for (var i = 0; i < FacultyList.length; i++) {
            if (FacultyList[i].instructorID == SelectedFacultyId) {
                //console.log("Success")
                SelectedFaculty = FacultyList[i].LastName + ", " + FacultyList[i].FirstName
                //console.log(SelectedFaculty)
                //$scope.name = SelectedFaculty;
                document.getElementById("FacultyNameHeader").innerHTML = SelectedFaculty + " - Permissions:";
            }
        }
    }
});


//this is the controller for the roles on the second page of the accordian view
//the roles do not have a place in the database yet and are only stored temporarily
app.controller("RoleController", function ($scope, $http) {
        
    $scope.buildRoleList = function () {
        var Roles = document.getElementById("roleList").options;

        rolesSelected.length = 0;
        for (var i = 0; i < Roles.length; i++) {
            if (Roles[i].selected) {
                rolesSelected.push({
                    RoleId: roleIDs,
                    RolePermission: Roles[i].Permissions,
                    RoleDepartment: Roles[i].Department
                });
            }
        }
    }  

    // on click add role
    $scope.AddRole = function () {        
        console.log("Add Role Clicked");
        rolesSelected.push({
            RoleId: roleIDs,
            RolePermission: tempPermSelected,
            RoleDepartment: tempDepartmentOption
        });
        console.log(roleIDs);
        roleIDs++;
        $scope.roles = rolesSelected;
        console.log($scope.roles);
    }
    // on click remove role
    $scope.RemoveRole = function () {
        console.log("Remove Role Clicked");
        for (var i = 0; i < rolesSelected.length; i++) {
            if (rolesSelected[i].RoleId == indexSelected) {
                console.log("Removing index: "+i+" with RoleId: " +indexSelected)
                rolesSelected.splice(i, 1);
            }
        }
        //rolesSelected.splice(indexSelected, 1); 
        console.log(rolesSelected);
        $scope.roles = [];
        $scope.roles = rolesSelected;        
    }
    
    // change in role selected
    $scope.showSelectValue = function (roleListSelected) {
        indexSelected = roleListSelected;// cant figure out how to get indexOf() to work
        console.log(indexSelected);       
    }
});

/* -- Department Controller --
  Used in Pane 2
  This controller returns a list of department names only which have instructors
  It is generic, and is not dependent on any prior selections.
*/
app.controller("DeptController", function ($scope, $http) {
    $http(
        {
            method: 'GET',
            url: apiPath + 'departments'
        }
    )
        .then(
        function successCallback(response) {
            console.log(response.data); 
            $scope.depts = response.data;
            $scope.deptListSelected = $scope.depts[0].DepartmentName;//Selects the first entry automatically to prevent blank entry from appearing
        },
        function errorCallback(response) {
            console.log(response);
        }
        );
    $scope.buildDepartmentsSelected = function () {
        var departments = document.getElementById("deptList").options;

        departmentsSelected.length = 0;
        for (var i = 0; i < departments.length; i++) {
            if (departments[i].selected) {
                departmentsSelected.push({
                    DepartmentCode: departments[i].value,
                    DepartmentName: departments[i].text
                });
            }
        }

        console.log(departmentsSelected); //outputs the received data to the console for debugging purposes
    }
    $scope.showSelectValue = function (deptListSelected) {
        console.log(deptListSelected);
        tempDepartmentOption = deptListSelected;
    }
});

app.controller("PermissionsListController", function ($scope) {
    //$scope.permListSelected = document.getElementById("permList").options[0].text;//Selects the first entry automatically to prevent blank entry from appearing
    $scope.showSelectValue = function (permListSelected) {
        console.log(permListSelected);
        tempPermSelected = permListSelected;
    }
    
});



