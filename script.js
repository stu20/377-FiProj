let courses = [];

// function to parse array for the purpose of the filter
function filterCourses(courseName, courseID) {
    return courses.filter((course) => {
        const nameMatch = !courseName || course.name.toLowerCase().includes(courseName);
        const idMatch = !courseID || course.course_id.toLowerCase().includes(courseID);
        return nameMatch && idMatch;
    });
}

async function mainEvent() {
    // Only accepting INST courses because that's all that we are currently interested in.
    const urlParams = new URLSearchParams({
        limit: 30,
        offset: 0,
        dept_id: "INST",
    }); // I think the API is restricting my access and only allowing me to pull 30 values at a time.
    //     Trying to see if we can offset the list to the next 30 and concatenate to the course list.
    const url = `https://api.umd.io/v0/courses?${urlParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data); // print the return to the console

    courses = data;

    const filterForm = document.getElementById("filter-form");
    const schedule = document.getElementById("schedule");
    // On submit, form filters and displays information by class and in its own box to HTML on a per item basis.
    // This way, the code is more dynamic and each course gets its own box to group all subsequent information into.
    filterForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const courseName = document.getElementById("course-name").value.trim().toLowerCase();
    const courseID = document.getElementById("course-id").value.trim().toLowerCase();
    const filteredCourses = filterCourses(courseName, courseID);
    schedule.innerHTML = "";
    filteredCourses.forEach((course) => {
        const courseElement = document.createElement("div");
        courseElement.classList.add("course");
        const courseTitle = document.createElement("h2");
        courseTitle.textContent = course.course_id;
        const courseDescription = document.createElement("p");
        courseDescription.textContent = course.name;
        courseElement.appendChild(courseTitle);
        courseElement.appendChild(courseDescription);
        schedule.appendChild(courseElement);
    });
        document.getElementById("course-name").value = "";
        document.getElementById("course-id").value = "";
        })

}

document.addEventListener('DOMContentLoaded', async () => mainEvent());