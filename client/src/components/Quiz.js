import { useNavigate, useSearchParams } from "react-router-dom";
import Button from "./Button";
import Input from "./Input";
import Select from "react-select";
import React, { useEffect, useState } from "react";
import { SERVER_URL } from "../Constants";
function Quiz(props) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  let isPartner = searchParams.get("mode") == "partner";

  let [responses, setResponses] = useState({});
  let handleChange = (value, question_id) => {
    setResponses({ ...responses, [question_id]: value });
  };

  let [question, setQuestion] = useState(undefined);
  let [questionIntervals, setQuestionIntervals] = useState(undefined);
  let [questions, setQuestions] = useState(null);
  let [isValid, setIsValid] = useState(false);

  let [currentQuestionIndex, setCurrentQuestionIndex] = useState(null);

  let questionType = (question) => {
    if (!question) return null;
    if (isPartner) {
      return question.question_type_partner || question.question_type;
    } else {
      return question.question_type;
    }
  };
  let validateCurrentQuestion = () => {
    if (!question) return;
    else if (!(question.id in responses)) {
      setIsValid(false);
    } else {
      if (questionType(question) == "select-multiple") {
        let nums = Object.values(responses[question?.id]).filter(
          (item) => !isNaN(item)
        );
        let sumResponses = nums.reduce((a, b) => a + b, 0);
        let numNonzeroResponses = nums.filter((value) => value > 0).length;
        console.log("responses sum is ", sumResponses);
        setIsValid(
          question?.id in responses &&
            sumResponses == 10 &&
            numNonzeroResponses <= question.selection_range[1]
        );
      } else if (questionType(question) == "select") {
        setIsValid(!!responses[question.id].value);
      }
    }
  };

  useEffect(() => {
    console.log("questions are", questions);
    if (currentQuestionIndex !== null && questions != null) {
      console.log(
        currentQuestionIndex,
        questions,
        questions[currentQuestionIndex]
      );
      console.log("questions are", questions);
      setQuestion({
        ...questions[currentQuestionIndex],
        choices: questions[currentQuestionIndex].choices.filter(
          (item) => isPartner || item != "Partner No Preference"
        ),
      });
    }
  }, [currentQuestionIndex, questions]);

  useEffect(validateCurrentQuestion, [question, responses]);

  useEffect(() => {
    if (questions && questions.length > 0) {
      setCurrentQuestionIndex(0);
    }
  }, [questions]);

  useEffect(() => {
    fetch(SERVER_URL + "/questions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        setQuestions(res.questions);
        setQuestionIntervals(res.sections);
        console.log("set questions!");
      });
  }, []);

  function nextOrSubmit() {
    if (currentQuestionIndex == questions.length - 1) {
      fetch(SERVER_URL + "/responses/add", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ responses: responses, isPartner: isPartner }),
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            console.log("submitted quiz");
            console.log(responses);
            console.log("onsubmit func is", props.onSubmitted);
            props.onSubmitted();
          } else {
            alert(
              "Issue submitting quiz. Please contact shaya@zarkesh.org for assistance."
            );
          }
        });
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  }

  let partner_text =
    "Answer the questions below, and we will match you with a participant best suited to your expertise!";
  let participant_text =
    "Answer the questions below, and we will find you an advisor best suited for your needs!";
  useEffect(() => console.log("responses are", responses), [responses]);

  return (
    <div className="flex flex-col items-center px-4 w-full relative">
      <div className="flex flex-col flex-center w-full p-4">
        <div className="text-center w-full">
          {isPartner ? partner_text : participant_text}{" "}
          {!isPartner && <b>Your match will be able to see your responses.</b>}
        </div>
      </div>
      {questionIntervals && (
        <div className="my-4 hidden md:inline-block">
          {questionIntervals.map((item) => (
            <div className="inline-block">
              <div
                className={`float-left arrow-left${
                  currentQuestionIndex + 1 >= item.interval[0]
                    ? "-complete"
                    : ""
                }`}
              ></div>
              <div
                className={`float-left arrow-ctr${
                  currentQuestionIndex + 1 >= item.interval[0]
                    ? "-complete"
                    : ""
                }`}
              >
                {item.name}
              </div>
              <div
                className={`float-left arrow-right${
                  currentQuestionIndex + 1 >= item.interval[0]
                    ? "-complete"
                    : ""
                }`}
              ></div>
            </div>
          ))}
        </div>
      )}
      {question && (
        <div className="container">
          <div className="h-full">
            <div className="mb-4 w-full">
              <span className="text-2xl text-bold">
                {currentQuestionIndex + 1}.{" "}
                {isPartner
                  ? question.text_partner || question.text
                  : question.text}
              </span>
            </div>
            <div style={{ height: `calc(100vh - 260px)`, overflowY: "scroll" }}>
              {questionType(question) == "select-multiple" && (
                <>
                  <div
                    className="bg-red-100 px-4 py-2 rounded-lg"
                    style={{ visibility: isValid ? "hidden" : "visible" }}
                  >
                    Score up to {question.selection_range[1]} responses that add
                    up to 10 to move on to the next question!
                  </div>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 md:gap-x-8">
                    {question.choices.map((choice) => (
                      <div
                        key={question.id + choice}
                        className="flex flex-col w-full"
                      >
                        <div
                          className=" flex flex-row items-center justify-between bg-gray-100 pl-3 pr-2 my-1 rounded-lg"
                          style={{ maxWidth: "400px" }}
                        >
                          <div style={{ maxWidth: "250px" }}>{choice}</div>
                          <Input
                            value={
                              responses[question.id] &&
                              responses[question.id][choice]
                            }
                            onChange={(event) =>
                              setResponses({
                                ...responses,
                                [question.id]: {
                                  ...responses[question.id],
                                  [choice]: parseInt(event.target.value),
                                },
                              })
                            }
                            className="my-2 w-16"
                            type="number"
                            min="0"
                            max="10"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              {questionType(question) == "select" && (
                <Select
                  key={question.id}
                  value={responses[question.id]}
                  onChange={(value) => handleChange(value, question.id)}
                  isOptionDisabled={() =>
                    question.selection_range &&
                    responses[question.id]?.length >=
                      question.selection_range[1]
                  }
                  options={question.choices.map((item) => ({
                    value: item,
                    label: item,
                  }))}
                />
              )}
            </div>
          </div>
        </div>
      )}
      {questions && question && (
        <div className="my-4 flex flex-row items-center justify-between fixed bottom-3 w-screen px-8 lg:px-16">
          <Button
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            style={{
              visibility: currentQuestionIndex == 0 ? "hidden" : "visible",
            }}
          >
            Previous Question
          </Button>

          <Button disabled={!isValid} onClick={() => nextOrSubmit()}>
            {currentQuestionIndex == questions.length - 1
              ? "Submit!"
              : "Next Question"}
          </Button>
        </div>
      )}
    </div>
  );
}

export default Quiz;
