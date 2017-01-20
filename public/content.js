/* Builds table with workouts currently in database immediately upon loading page*/
(function buildTable() {
    var table = document.getElementById("workouts");
    var headerRow = document.createElement("tr");
    var header;

    //create header row
    header = document.createElement("th");
    header.textContent = "Exercise name";
    headerRow.appendChild(header);
    header = document.createElement("th");
    header.textContent = "Reps";
    headerRow.appendChild(header);
    header = document.createElement("th");
    header.textContent = "Weight";
    headerRow.appendChild(header);
    header = document.createElement("th");
    header.textContent = "lbs or kg";
    headerRow.appendChild(header);
    header = document.createElement("th");
    header.textContent = "Date";
    headerRow.appendChild(header);

    table.appendChild(headerRow);

    //create data rows
    var req = new XMLHttpRequest();
    req.open("GET", "/getTable", true);
    req.addEventListener('load',function() {
        if(req.status >= 200 && req.status < 400) {
            //array holds all rows from database
            var workoutArray = JSON.parse(req.responseText);

            //create data cells for all data except id
            workoutArray.forEach(function(workout) {
                var row = document.createElement("tr");
                var cell;
                for (var p in workout) {
                    if (p == "lbs") {
                        cell = document.createElement("td");
                        if (workout[p] == 1) {
                            cell.textContent = "lbs";
                        }
                        else {
                            cell.textContent = "kg";
                        }
                        row.appendChild(cell);
                    }
                    else if (p != "id") {
                        cell = document.createElement("td");
                        cell.textContent = workout[p];
                        row.appendChild(cell);
                    }
                }
                //create delete button
                var form = document.createElement("FORM");
                var input = document.createElement("INPUT");
                input.setAttribute("type", "hidden");
                input.setAttribute("id","deleteID");
                input.setAttribute("name","id");
                input.setAttribute("value", workout.id);
                form.appendChild(input);
                input = document.createElement("INPUT");
                input.setAttribute("type", "submit");
                input.setAttribute("id","Delete");
                input.setAttribute("name","Delete");
                input.setAttribute("value","Delete");
                form.appendChild(input);
                row.appendChild(form);

                //create edit button
                form = document.createElement("FORM");
                form.setAttribute("action","/");
                form.setAttribute("method","post");
                input = document.createElement("INPUT");
                input.setAttribute("type", "hidden");
                input.setAttribute("id","editID");
                input.setAttribute("name","id");
                input.setAttribute("value", workout.id);
                form.appendChild(input);
                input = document.createElement("INPUT");
                input.setAttribute("type", "submit");
                input.setAttribute("id","Edit");
                input.setAttribute("name","Edit");
                input.setAttribute("value","Edit");
                form.appendChild(input);
                row.appendChild(form);

                table.appendChild(row);

                var parent = document.getElementById("workouts");
                var parent2 = parent.lastElementChild;

                //delete button handler removes from table and database
                parent2.children[5].children[1].addEventListener('click',function (event) {
                    var req = new XMLHttpRequest();
                    req.open("GET", "/delete?id=" + workout.id, true);
                    req.addEventListener('load',function() {
                        if(req.status >= 200 && req.status < 400) {
                            parent.removeChild(parent2);
                        }
                        else {
                            console.log("Error in network request: " + req.statusText);
                        }
                    });
                    req.send(null);
                    event.preventDefault();
                    event.stopPropagation();
                });
            });
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(null);
}());


/* Adding new workouts */
document.getElementById('Add workout').addEventListener('click', function(event){

    //adding the lbs or kg value to database for radio buttons
    var lbs;
    for (var i = 0; i < document.getElementsByName('lbs').length; i++) {
        if (document.getElementsByName('lbs')[i].checked)
            lbs = document.getElementsByName('lbs')[i].value;
    }

    //add new workout to database and table
    var req = new XMLHttpRequest();
    var name = document.getElementById('name').value;
    var reps = document.getElementById('reps').value;
    var weight = document.getElementById('weight').value;
    var date = document.getElementById('date').value;
    req.open("GET", "/addWorkout?name="+name+"&reps="+reps+"&weight="+weight+"&lbs="+lbs+"&date="+date, true);
    req.addEventListener('load',function() {
        if(req.status >= 200 && req.status < 400) {
            //get id value from database
            var response = JSON.parse(req.responseText);
            var id = response.insertId;

            //use id to add workout to table
            var table = document.getElementById("workouts");
            req = new XMLHttpRequest();
            req.open("GET", "/getWorkout?id=" + id, true);
            req.addEventListener('load',function() {
                if (req.status >= 200 && req.status < 400) {
                    var newWorkoutArray = JSON.parse(req.responseText);
                    var newWorkout = newWorkoutArray[0];

                    //create new row in table with added workout
                    var row = document.createElement("tr");
                    var cell;
                    for (var p in newWorkout) {
                        if (p == "lbs") {
                            cell = document.createElement("td");
                            if (newWorkout[p] == 1) {
                                cell.textContent = "lbs";
                            }
                            else {
                                cell.textContent = "kg";
                            }
                            row.appendChild(cell);
                        }
                        else if (p != "id") {
                            cell = document.createElement("td");
                            cell.textContent = newWorkout[p];
                            row.appendChild(cell);
                        }
                    }

                    //create delete button
                    var form = document.createElement("FORM");
                    var input = document.createElement("INPUT");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("id","deleteID");
                    input.setAttribute("name","id");
                    input.setAttribute("value", newWorkout.id);
                    form.appendChild(input);
                    input = document.createElement("INPUT");
                    input.setAttribute("type", "submit");
                    input.setAttribute("id","Delete");
                    input.setAttribute("name","Delete");
                    input.setAttribute("value","Delete");
                    form.appendChild(input);
                    row.appendChild(form);

                    //create edit button
                    form = document.createElement("FORM");
                    form.setAttribute("action","/");
                    form.setAttribute("method","post");
                    input = document.createElement("INPUT");
                    input.setAttribute("type", "hidden");
                    input.setAttribute("id","editID");
                    input.setAttribute("name","id");
                    input.setAttribute("value", newWorkout.id);
                    form.appendChild(input);
                    input = document.createElement("INPUT");
                    input.setAttribute("type", "submit");
                    input.setAttribute("id","Edit");
                    input.setAttribute("name","Edit");
                    input.setAttribute("value","Edit");
                    form.appendChild(input);
                    row.appendChild(form);

                    table.appendChild(row);

                    var parent = document.getElementById("workouts");
                    var parent2 = parent.lastElementChild;

                    //remove workout from table and database if delete button is clicked
                    parent2.children[5].children[1].addEventListener('click',function (event) {
                        var req = new XMLHttpRequest();
                        req.open("GET", "/delete?id=" + newWorkout.id, true);
                        req.addEventListener('load',function() {
                            if(req.status >= 200 && req.status < 400) {
                                parent.removeChild(parent2);
                            }
                            else {
                                console.log("Error in network request: " + req.statusText);
                            }
                        });
                        req.send(null);
                        event.preventDefault();
                        event.stopPropagation();
                    });
                }
                else {
                    console.log("Error in network request: " + req.statusText);
                }
            });
            req.send(null);
        }
        else {
            console.log("Error in network request: " + req.statusText);
        }
    });
    req.send(null);
    event.preventDefault();
});



