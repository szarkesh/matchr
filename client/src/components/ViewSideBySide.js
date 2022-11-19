import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Button from "./Button";
import { SERVER_URL } from "../Constants";

function ViewSideBySide() {
  let [params, setParams] = useSearchParams();
  let [responses, setResponses] = useState({ participant: {}, partner: {} });
  let [areMatched, setAreMatched] = useState(false);
  useEffect(() => {
    fetch(SERVER_URL + "/matchedResponses" + window.location.search, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((res) => {
        console.log("TEST RESPONSES", res);
        setResponses(res);
      });
  }, []);

  let createMatch = () => {
    fetch(SERVER_URL + "/match", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partner: params.get("partner"),
        participant: params.get("participant"),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setAreMatched(true);
          alert(
            "Match created! Please email the participant and partner to notify them."
          );
        }
      });
  };

  let unMatch = () => {
    fetch(SERVER_URL + "/removeMatch", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        partner: params.get("partner"),
        participant: params.get("participant"),
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setAreMatched(false);
          alert(
            "Unmatched this participant and partner! Please email the participant and partner to notify them."
          );
        }
      });
  };

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
          <Link to="/match">
            <Button>Back to all matches</Button>
          </Link>
          <div className="text-center text-xl my-10">
            Compare what the partner and participant said below
          </div>
        </div>
        <div className="grid grid-cols-2">
          <div>
            <div className="text-red-500">
              Participant: {responses.participant.firstName} (
              {responses.participant.email})
            </div>
            {visualResponses("participant", responses.participant.responses)}
          </div>
          <div>
            <div className="text-red-500">
              {" "}
              Partner: {responses.partner.firstName} ({responses.partner.email})
            </div>
            <div>{visualResponses("partner", responses.partner.responses)}</div>
          </div>
        </div>
        {!areMatched && (
          <Button onClick={() => createMatch()}>
            Match this participant and partner!
          </Button>
        )}
        {areMatched && (
          <Button onClick={() => unMatch()}>
            Unmatch this participant and partner!
          </Button>
        )}
      </div>
    </div>
  );
}

export default ViewSideBySide;
