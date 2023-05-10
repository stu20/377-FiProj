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
        dept_id: "INST"
    }); // I think the API is restricting my access and only allowing me to pull 30 values at a time.
    //     Trying to see if we can offset the list to the next 30 and concatenate to the course list. I couldn't get it to work.
    const url = `https://api.umd.io/v0/courses?${urlParams.toString()}`;
    const response = await fetch(url);
    const data = await response.json();
    console.log(data); // print the return to the console

    courses = data;

    const filterForm = document.getElementById("filter-form");
    const schedule = document.getElementById("schedule");
    
    filterForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const courseName = document.getElementById("course-name").value.trim().toLowerCase();
        const courseID = document.getElementById("course-id").value.trim().toLowerCase();
        const filteredCourses = filterCourses(courseName, courseID);

        console.log(filterCourses)
        // Clears the list before every query pull
        schedule.innerHTML = "";
        // On submit, form filters and displays information by class and in its own box to HTML on a per item basis.
        // This way, the code is more dynamic and each course gets its own box to group all subsequent information into.
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
        
        // sets dimension of svg window
        var width = 960,
        height = 500;
        //creates nodes based on array filteredCourses and sizes them based on their course_id
        nodes = []

        var nodes = filteredCourses.map(function(course) {
            var radius = 6;
            if (course.course_id.startsWith("INST1")) {
            radius = 5;
            } else if (course.course_id.startsWith("INST2")) {
            radius = 12;
            } else if (course.course_id.startsWith("INST3")) {
            radius = 20;
            }
            return {
            course: course,
            radius: radius
            };
        });
        
        var root = nodes[0];
        root.radius = 0;
        root.fixed = true;

        var color = d3.scale.category10();
        // Sets gravity so that they are attracted to center of svg
        var force = d3.layout.force()
            .gravity(0.05)
            .charge(function(d, i) { return i ? 0 : -2000; })
            .nodes(nodes)
            .size([width, height]);

        force.start();
        
        var svg = d3.select("body").append("svg")
            .attr("width", width)
            .attr("height", height);
        // Allow for user to do something with the circle. 
        svg.selectAll("circle")
            .data(nodes.slice(1))
            .enter().append("circle")
            .attr("r", function(d) { return d.radius; })
            .style("fill", function(d, i) { return color(i % 3); })
            .on("mouseover", function(d, i) { 
                tooltip.transition()
                .duration(200)
                .style("opacity", .9);
                tooltip.html("<strong>Node " + i + "</strong><br/>" + courses[i].name)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
            .on("mouseout", function(d) { 
                tooltip.transition()
                .duration(500)
                .style("opacity", 0); 
            });
        // This is supposed to be a tooltip that pops up upon hover -- assuming one can even get to a node, but it wasn't working and I just left it in.
        var tooltip = d3.select("body")
            .append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);
        // Update the position of the nodes based on the mouse's position every tick
        force.on("tick", function(e) {
            var q = d3.geom.quadtree(nodes),
                i = 0,
                n = nodes.length;

            while (++i < n) q.visit(collide(nodes[i]));

            svg.selectAll("circle")
                .attr("cx", function(d) { return d.x; })
                .attr("cy", function(d) { return d.y; });
        });
        // Track position of mouse keeping gravity constant
        svg.on("mousemove", function() {
            var p1 = d3.mouse(this);
            root.px = p1[0];
            root.py = p1[1];
            force.resume();
        });
        // Give nodes collision prop
        function collide(node) {
            var r = node.radius + 16,
                nx1 = node.x - r,
                nx2 = node.x + r,
                ny1 = node.y - r,
                ny2 = node.y + r;
            return function(quad, x1, y1, x2, y2) {
                if (quad.point && (quad.point !== node)) {
                    var x = node.x - quad.point.x,
                        y = node.y - quad.point.y,
                        l = Math.sqrt(x * x + y * y),
                        r = node.radius + quad.point.radius;
                    if (l < r) {
                        l = (l - r) / l * .5;
                        node.x -= x *= l;
                        node.y -= y *= l;
                        quad.point.x += x;
                        quad.point.y += y;
                    }
                }
                return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
            };
        }
    })
}

document.addEventListener('DOMContentLoaded', async () => mainEvent());