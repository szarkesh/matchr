import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "./Button";
import { SERVER_URL } from "../Constants";

function ViewResponse() {
  let [params, setParams] = useSearchParams();
  let [response, setResponse] = useState({ participant: {}, partner: {} });
  let [areMatched, setAreMatched] = useState(false);
  useEffect(() => {
    fetch(SERVER_URL + "/response" + window.location.search, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("TEST RESPONSES", res);
        setResponse(res);
      });
  }, []);

  let visualResponses = (mode, responses) => {
    console.log("responses are", mode, responses);
    return responses ? (
      Object.keys(responses).map((qid) => (
        <div key={mode + " " + qid}>
          <div className="text-blue-500 text-center">{qid}</div>
          <div className="h-36">
            {Object.keys(responses[qid]).map((selection) => (
              <div>
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
            <div className="text-red-500">
              Participant: {response.firstName} ({response.email})
            </div>
            {visualResponses("participant", response.responses)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViewResponse;
