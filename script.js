
const form = document.getElementById("studentForm");

form.addEventListener("submit", function(event) {

    event.preventDefault();

    // Get student details
    const name = document.getElementById("name").value;
    const studentId = document.getElementById("studentId").value;
    const course = document.getElementById("course").value;
    const department = document.getElementById("department").value;
    const year = document.getElementById("year").value;
    const blood = document.getElementById("blood").value;

    // Display details on ID card
    document.getElementById("displayName").textContent = name;
    document.getElementById("displayId").textContent = studentId;
    document.getElementById("displayCourse").textContent = course;
    document.getElementById("displayDepartment").textContent = department;
    document.getElementById("displayYear").textContent = year;
    document.getElementById("displayBlood").textContent = blood || "Not provided";

    // Upload and display photograph
    const photo = document.getElementById("photo").files[0];

    if (photo) {
        const reader = new FileReader();

        reader.onload = function(e) {
            document.getElementById("previewPhoto").src = e.target.result;
        };

        reader.readAsDataURL(photo);
    }

});
