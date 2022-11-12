import { useEffect } from "react";
let SERVER_URL = "http://localhost:5001";

function CreateMatches() {
  useEffect(() => {
    fetch(SERVER_URL + "/similarities")
      .then((res) => res.json())
      .then((res) => console.log(res));
  }, []);
  return <div></div>;
}

export default CreateMatches;
