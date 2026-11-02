
import { useEffect, useState } from "react";
import "./Resources.css";

const courses = [
  {
    name: "Java",
    icon: "☕",
    description: "Learn Java programming, OOP, and core concepts.",
    resources: [
      {
        title: "Java Official Learning",
        description: "Official Java tutorials and learning material.",
        url: "https://dev.java/learn/",
        type: "Documentation",
      },
      {
        title: "Oracle Java Tutorials",
        description: "Java language fundamentals and examples.",
        url: "https://docs.oracle.com/javase/tutorial/",
        type: "Tutorial",
      },
      {
        title: "W3Schools Java",
        description: "Beginner-friendly Java examples and exercises.",
        url: "https://www.w3schools.com/java/",
        type: "Practice",
      },
      {
        title: "GeeksforGeeks Java",
        description: "Java concepts, programs, and interview preparation.",
        url: "https://www.geeksforgeeks.org/java/",
        type: "Learning",
      },
    ],
  },
  {
    name: "React",
    icon: "⚛️",
    description: "Explore React components, hooks, and projects.",
    resources: [
      {
        title: "React Official Documentation",
        description: "Learn React from its official documentation.",
        url: "https://react.dev/learn",
        type: "Documentation",
      },
      {
        title: "Vite Guide",
        description: "Learn how to create and run React projects using Vite.",
        url: "https://vite.dev/guide/",
        type: "Guide",
      },
      {
        title: "W3Schools React",
        description: "Practice React concepts with simple examples.",
        url: "https://www.w3schools.com/react/",
        type: "Tutorial",
      },
      {
        title: "React TypeScript Cheatsheets",
        description: "Useful React coding references and patterns.",
        url: "https://react.dev/reference/react",
        type: "Reference",
      },
    ],
  },
  {
    name: "SQL",
    icon: "🗄️",
    description: "Practice SQL queries, joins, subqueries, and databases.",
    resources: [
      {
        title: "MySQL Official Documentation",
        description: "Official MySQL reference and documentation.",
        url: "https://dev.mysql.com/doc/",
        type: "Documentation",
      },
      {
        title: "SQLBolt",
        description: "Interactive SQL lessons and exercises.",
        url: "https://sqlbolt.com/",
        type: "Practice",
      },
      {
        title: "W3Schools SQL",
        description: "Learn SQL commands with simple examples.",
        url: "https://www.w3schools.com/sql/",
        type: "Tutorial",
      },
      {
        title: "GeeksforGeeks SQL",
        description: "SQL concepts, queries, and interview practice.",
        url: "https://www.geeksforgeeks.org/sql/",
        type: "Learning",
      },
    ],
  },
  {
    name: "Python",
    icon: "🐍",
    description: "Learn Python fundamentals, functions, and programming.",
    resources: [
      {
        title: "Python Official Documentation",
        description: "Official Python tutorial and language reference.",
        url: "https://docs.python.org/3/tutorial/",
        type: "Documentation",
      },
      {
        title: "LearnPython",
        description: "Interactive beginner-friendly Python lessons.",
        url: "https://www.learnpython.org/",
        type: "Practice",
      },
      {
        title: "W3Schools Python",
        description: "Learn Python with examples and exercises.",
        url: "https://www.w3schools.com/python/",
        type: "Tutorial",
      },
      {
        title: "GeeksforGeeks Python",
        description: "Python programs, concepts, and problem solving.",
        url: "https://www.geeksforgeeks.org/python-programming-language/",
        type: "Learning",
      },
    ],
  },
];

function getCourseName(topic) {
  if (!topic || topic === "All Topics") {
    return "All Topics";
  }

  const normalized = topic.toLowerCase();

  if (normalized.includes("java")) return "Java";
  if (normalized.includes("react")) return "React";
  if (normalized.includes("sql") || normalized.includes("database")) {
    return "SQL";
  }
  if (normalized.includes("python")) return "Python";

  return "All Topics";
}

function Resources({ initialTopic = "All Topics" }) {
  const [selectedCourse, setSelectedCourse] = useState(
    () => getCourseName(initialTopic)
  );

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setSelectedCourse(getCourseName(initialTopic));
    setSearchTerm("");
  }, [initialTopic]);

  const visibleCourses = courses
    .filter(
      (course) =>
        selectedCourse === "All Topics" ||
        course.name === selectedCourse
    )
    .map((course) => ({
      ...course,
      resources: course.resources.filter((resource) => {
        const search = searchTerm.trim().toLowerCase();

        return (
          resource.title.toLowerCase().includes(search) ||
          resource.description.toLowerCase().includes(search) ||
          resource.type.toLowerCase().includes(search)
        );
      }),
    }))
    .filter((course) => course.resources.length > 0);

  const totalResources = visibleCourses.reduce(
    (total, course) => total + course.resources.length,
    0
  );

  return (
    <div className="resources-page">

      <div className="resources-heading">
        <span className="resources-label">
          STUDY MATERIAL
        </span>

        <h1>Learning Resources</h1>

        <p>
          Choose your course and explore useful tutorials,
          documentation, and practice websites.
        </p>
      </div>

      {/* COURSE FILTER */}
      <div className="resource-filter-section">

        <h3>Choose Your Course</h3>

        <div className="resource-course-buttons">

          {["All Topics", "Java", "React", "SQL", "Python"].map(
            (course) => (
              <button
                key={course}
                type="button"
                className={
                  selectedCourse === course
                    ? "resource-course-active"
                    : "resource-course-button"
                }
                onClick={() => {
                  setSelectedCourse(course);
                  setSearchTerm("");
                }}
              >
                {course === "All Topics"
                  ? "📚 All Topics"
                  : course === "Java"
                    ? "☕ Java"
                    : course === "React"
                      ? "⚛️ React"
                      : course === "SQL"
                        ? "🗄️ SQL"
                        : "🐍 Python"}
              </button>
            )
          )}

        </div>

      </div>

      {/* SEARCH */}
      <div className="resource-search-section">

        <input
          type="text"
          placeholder="Search learning resources..."
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search learning resources"
        />

        <span>
          {totalResources} resources available
        </span>

      </div>

      {/* COURSE-WISE RESOURCES */}
      {visibleCourses.length === 0 ? (
        <div className="resource-empty">
          <h3>No resources found</h3>
          <p>Try a different search word.</p>
        </div>
      ) : (
        visibleCourses.map((course) => (

          <section
            className="resource-course-section"
            key={course.name}
          >

            <div className="resource-course-heading">

              <div className="resource-course-icon">
                {course.icon}
              </div>

              <div>
                <h2>{course.name} Resources</h2>
                <p>{course.description}</p>
              </div>

            </div>

            <div className="resource-card-grid">

              {course.resources.map((resource) => (

                <article
                  className="resource-card"
                  key={resource.title}
                >

                  <span className="resource-type">
                    {resource.type}
                  </span>

                  <h3>{resource.title}</h3>

                  <p>{resource.description}</p>

                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open Resource →
                  </a>

                </article>

              ))}

            </div>

          </section>

        ))
      )}

    </div>
  );
}

export default Resources;
