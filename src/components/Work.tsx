import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const projects = [
  {
    num: "01",
    title: "Saood-Bot",
    category: "AI Chatbot",
    tools: "Python, AI, NLP, Interactive Assistance",
    image: "/images/saood-bot.webp",
  },
  {
    num: "02",
    title: "Language Translation Model",
    category: "AI / NLP",
    tools: "Python, TensorFlow, NLP, Text Processing",
    image: "/images/language-translation.webp",
  },
  {
    num: "03",
    title: "School Database Chatbot",
    category: "AI / Database",
    tools: "Python, Chatbot, Database Systems, SQL",
    image: "/images/school-db-chatbot.webp",
  },
  {
    num: "04",
    title: "Iris Database Analysis",
    category: "Data Analysis / ML",
    tools: "Python, Machine Learning, Data Analysis, Pandas",
    image: "/images/iris-analysis.webp",
  },
  {
    num: "05",
    title: "Trading Analysis",
    category: "Data Analysis",
    tools: "Python, Data Analysis, Pandas, Visualization",
    image: "/images/trading-analysis.webp",
  },
  {
    num: "06",
    title: "RAG AI Models",
    category: "AI / Retrieval",
    tools: "Python, RAG, AI, Information Retrieval",
    image: "/images/rag-ai.webp",
  },
  {
    num: "07",
    title: "Virat Kohli Fan Website",
    category: "Web Development",
    tools: "HTML, CSS, JavaScript, Web Design",
    image: "/images/virat-kohli.webp",
  },
];

const Work = () => {
  useGSAP(() => {
    let translateX: number = 0;

    function setTranslateX() {
      const box = document.getElementsByClassName("work-box");
      if (!box || box.length === 0) return 0;
      const workContainer = document.querySelector(".work-container");
      if (!workContainer) return 0;
      const rectLeft = workContainer.getBoundingClientRect().left;
      const rect = box[0].getBoundingClientRect();
      const parentWidth = box[0].parentElement
        ? box[0].parentElement.getBoundingClientRect().width
        : window.innerWidth;
      let padding: number =
        parseInt(window.getComputedStyle(box[0]).padding) / 2 || 40;
      translateX = rect.width * box.length - (rectLeft + parentWidth) + padding;
      return translateX;
    }

    setTranslateX();

    let timeline = gsap.timeline({
      scrollTrigger: {
        trigger: ".work-section",
        start: "top top",
        end: "bottom top",
        scrub: 1,
        pin: true,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        id: "work",
      },
    });

    timeline.to(".work-flex", {
      x: () => -translateX,
      ease: "none",
    });

    const handleResize = () => {
      setTranslateX();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", handleResize);

    setTimeout(() => {
      setTranslateX();
      ScrollTrigger.refresh();
    }, 400);

    return () => {
      window.removeEventListener("resize", handleResize);
      timeline.kill();
      ScrollTrigger.getById("work")?.kill();
    };
  }, []);

  return (
    <div className="work-section" id="work">
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, i) => (
            <div className="work-box" key={i}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{project.num}</h3>
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage image={project.image} alt={project.title} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
