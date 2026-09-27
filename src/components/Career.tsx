import "./styles/Career.css";

const Career = () => {
  return (
    <div className="career-section section-container">
      <div className="career-container">
        <h2>
          My career <span>&</span>
          <br /> experience
        </h2>
        <div className="career-info">
          <div className="career-timeline">
            <div className="career-dot"></div>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Robot Designer</h4>
                <h5>PGC Airline</h5>
              </div>
              <h3>2024</h3>
            </div>
            <p>
              Created an object-avoidance floor-cleaning robot and developed its
              control code.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI Developer</h4>
                <h5>Invotech</h5>
              </div>
              <h3>2026</h3>
            </div>
            <p>
              Engineered Prademic Eye Robot, a disaster-response concept
              supporting injury detection. Worked with the Gemini API for
              automated injury analysis and real-time information workflows.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>Software Developer</h4>
                <h5>Invotech</h5>
              </div>
              <h3>2026</h3>
            </div>
            <p>
              Developed Awaargi App, a web application allowing locals to share
              and discover city events. Integrated automated email notifications
              and calendar synchronization.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI / Software Development Intern</h4>
                <h5>CodeAlpha</h5>
              </div>
              <h3>2026</h3>
            </div>
            <p>
              Completed a professional internship focused on practical software
              development and AI-based projects. Built projects involving
              chatbots, language processing, automation, and web technologies.
            </p>
          </div>
          <div className="career-info-box">
            <div className="career-info-in">
              <div className="career-role">
                <h4>AI/ML Developer Intern</h4>
                <h5>DevelopersHub</h5>
              </div>
              <h3>NOW</h3>
            </div>
            <p>
              Focused on Artificial Intelligence and Machine Learning
              development. Created projects including Iris Database Analysis,
              Trading Analysis, and RAG AI models. Developed AI/ML models, data
              analysis tools, and intelligent applications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Career;
