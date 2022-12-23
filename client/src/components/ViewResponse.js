import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "./Button";
import { SERVER_URL } from "../Constants";
import { userInfo } from "os";

function ViewResponse() {
  let [params, setParams] = useSearchParams();
  let [response, setResponse] = useState({ participant: {}, partner: {} });
  let [areMatched, setAreMatched] = useState(false);
  let [questionText, setQuestionText] = useState({});
  useEffect(() => {
    fetch(SERVER_URL + "/singleResponse" + window.location.search, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.type == "participant") {
          setResponse(res);
        }
      });

    fetch(SERVER_URL + "/questions", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        let text = {};
        for (let i of res.questions) {
          text[i.id] = i.text;
        }
        console.log("TEXT IS", text);
        setQuestionText(text);
      });
  }, []);

  let visualResponses = (mode, responses) => {
    console.log("responses are", mode, responses);
    return responses ? (
      Object.keys(responses).map((qid) => (
        <div key={qid}>
          <div className="text-blue-500 text-center">{questionText[qid]}</div>
          <div className="h-36">
            {Object.keys(responses[qid]).map((selection) => (
              <div key={qid + "." + selection}>
                {selection}: {responses[qid][selection]}
              </div>
            ))}
          </div>
        </div>
      ))
    ) : (
      <div>Loading...</div>
    );
  };
  return (
    <div className="flex flex-col items-center py-4">
      <div className="container">
        <div className="flex flex-row items-center space-x-8">
          <div className="text-center text-xl my-10">Survey Results</div>
        </div>
        <div className="grid grid-cols-2">
          <div>
            <div className="text-red-500 mb-4">
              Here are responses from {response.firstName} (
              <a href={"mailto:" + response.email}>{response.email}</a>)
            </div>
            {visualResponses("participant", response.responses)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewResponse;
