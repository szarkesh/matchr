import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "./Button";
import Quiz from "./Quiz";
import { SERVER_URL } from "../Constants";
function QuizIntro() {
  let [isTakingQuiz, setIsTakingQuiz] = useState(false);
  let [hasTakenQuiz, setHasTakenQuiz] = useState(false);
  let [quizFinished, setQuizFinished] = useState(false);
  let [isLoading, setIsLoading] = useState(true);
  let [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    console.log("fetching");
    fetch(SERVER_URL + "/myresponses", { credentials: "include" })
      .then((res) => res.json())
      .then((res) => {
        setHasTakenQuiz(res.hasTakenQuiz);
        setIsLoading(false);
      });
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
  if (isLoading) {
    return <></>;
  }
  if (isTakingQuiz) {
    return (
      <Quiz
        onSubmitted={() => {
          setIsTakingQuiz(false);
          setQuizFinished(true);
        }}
      />
    );
  } else {
    if (hasTakenQuiz) {
      return (
        <div className="flex flex-col items-center">
          <div className="container py-10 flex flex-col justify-center items-center">
            <div className="text-xl my-4">
              Your match is pending. You'll get an email when our expert
              matchers have matched you with a{" "}
              {searchParams.get("mode") == "participant"
                ? "partner"
                : "participant"}
              !
              <div className="text-xs my-4">
                If you think there's a mistake, please contact{" "}
                <a href="mailto:shaya@zarkesh.org">shaya@zarkesh.org</a>
              </div>
            </div>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      );
    } else if (quizFinished) {
      return (
        <div className="flex flex-col items-center">
          <div className="container py-10 flex flex-col justify-center items-center">
            <div className="text-xl my-4">
              Thank you for taking the quiz! You'll get an email when our expert
              matchers have matched you with a{" "}
              {searchParams.get("mode") == "participant"
                ? "partner"
                : "participant"}
              !
            </div>
            <Link to="/">
              <Button>Back to Home</Button>
            </Link>
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
