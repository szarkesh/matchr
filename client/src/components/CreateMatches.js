import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { SERVER_URL } from "../Constants";

function CreateMatches() {
  let [similarities, setSimilarities] = useState(undefined);
  useEffect(() => {
    fetch(SERVER_URL + "/allSimilarities")
      .then((res) => res.json())
      .then((res) => {
        console.log(res);
        let rows = {};
        for (let partner of res.partners) {
          rows[partner.email] = [];
        }
        for (let pair of res.similarities.sort(
          (a, b) => a.participant - b.participant
        )) {
          rows[pair.partner].push(pair.similarity);
        }
        setSimilarities({
          ...res,
          participants: res.participants.sort((a, b) => a.email - b.email),
          rows,
        });
      });
  }, []);
  return (
    <div className="flex  flex-col items-center">
      <div className="p-4 m-4">
        Below are the scores for each (partner, participant) pair. Click on a
        cell in order to look at the responses for this pair of people and match
        or unmatch them!
      </div>
      <div className="container">
        <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          {/* {JSON.stringify(similarities.similarities)} */}
          {similarities && (
            <>
              <thead className="text-md text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400 ">
                <td>Partner name (rows), Participant name (columns)</td>
                {similarities.participants.map((x) => (
                  <td>{x.first + " " + x.last}</td>
                ))}
              </thead>
              {similarities.partners.map((partner) => (
                <tr>
                  <td>{partner.first + " " + partner.last}</td>
                  {similarities.rows[partner.email].map((score, index) => (
                    <td>
                      <Link
                        to={`/sidebyside?partner=${partner.email}&participant=${similarities.participants[index].email}`}
                      >
                        {score.toFixed(3)}
                      </Link>
                    </td>
                  ))}
                </tr>
              ))}
            </>
          )}
        </table>
      </div>
    </div>
  );
}

export default CreateMatches;
