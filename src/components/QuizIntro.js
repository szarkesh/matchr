import { useEffect, useState } from "react";
import Button from "./Button";
import Quiz from "./Quiz";
let SERVER_URL = "http://localhost:5001";
function QuizIntro() {
  let [isTakingQuiz, setIsTakingQuiz] = useState(false);
  let [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  let [quizFinished, setQuizFinished] = useState(false);
  useEffect(() => {
    fetch("/myresponses");
  }, []);
  let steps = [
    {
      value: "Take a quick, 10-minute survey.",
    },
    {
      value: "Get matched with a professional best suited for your needs.",
    },
    {
      value: "Network and see where your career goes!",
    },
  ];

  if (isTakingQuiz) {
    return <Quiz onSubmitted={() => setQuizFinished(true)} />;
  } else {
    if (hasTakenQuiz) {
      return (
        <div className="flex flex-col items-center">
          <div className="container py-10 flex flex-col justify-center items-center">
            <div className="text-xl">
              It looks like you've already taken the survey. If you think this
              is a mistake, please contact{" "}
              <a href="mailto:shaya@zarkesh.org">shaya@zarkesh.org</a>
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="flex flex-col items-center">
          <img src={require("../img/advisor.png")} width="200px" />
          <div className="container">
            {steps.map((step, i) => (
              <div className="flex flex-row my-4 items-center space-x-8">
                <div className="bg-blue-500 text-white text-4xl rounded-full w-12 h-12 flex items-center justify-center">
                  <div>{i + 1}</div>
                </div>
                <div className="text-xl">{step.value}</div>
              </div>
            ))}
          </div>
          <Button onClick={() => setIsTakingQuiz(true)}>
            Take the survey!
          </Button>
        </div>
      );
    }
  }
}

export default QuizIntro;
