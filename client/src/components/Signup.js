import Input from "./Input";
import Button from "./Button";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import React, { useState } from "react";

import { SERVER_URL } from "../Constants";
function Signup() {
  const [searchParams, setSearchParams] = useSearchParams();
  let [signupError, setSignupError] = useState("");
  let navigate = useNavigate();
  let mode = searchParams.get("mode");
  let isPartner = mode == "partner";

  let handleSubmit = (e) => {
    setSignupError("");
    e.preventDefault();
    if (!/^([\w\.\-]+)@([\w\-]+)((\.(\w){2,3})+)$/.test(e.target.email.value)) {
      setSignupError("Invalid email!");
      return;
    }
    if (
      !/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(e.target.password.value)
    ) {
      setSignupError(
        "Password must contain an uppercase letter, lower case number, and a number."
      );
      return;
    }
    if (e.target.confirm_password.value != e.target.password.value) {
      setSignupError("Password and confirmation must match!");
      return;
    }
    let user = {
      firstName: e.target.first_name.value,
      lastName: e.target.last_name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      type: isPartner ? "partner" : "participant",
    };
    fetch(SERVER_URL + "/users/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ userInfo: user }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          navigate("/quiz?mode=" + mode);
        } else {
          setSignupError(res.message);
        }
      });
  };
  return (
    <div className="container">
      <div className="flex flex-col items-center my-8">
        <div className="mt-4 mb-8">Please create an account to continue.</div>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 mb-6 md:grid-cols-2">
            <Input
              labelText="First Name"
              type="text"
              id="first_name"
              placeholder="John"
              required
            />
            <Input
              labelText="Last Name"
              type="text"
              id="last_name"
              placeholder="Smith"
              required
            />
          </div>
          <Input
            labelText="Email"
            type="text"
            id="email"
            placeholder="*******"
            required
          />
          <Input
            labelText="Password"
            type="password"
            id="password"
            placeholder="******"
            required
          />
          <Input
            labelText="Confirm Password"
            type="password"
            id="confirm_password"
            placeholder="******"
            required
          />
          <div className="flex items-start mb-4  mt-2">
            <div className="flex items-center h-5">
              <input
                id="remember"
                type="checkbox"
                value=""
                className="w-4 h-4 bg-gray-50 rounded border border-gray-300 focus:ring-3 focus:ring-blue-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-blue-600 dark:ring-offset-gray-800"
                required=""
              />
            </div>
            <label className="ml-1 text-sm font-medium text-gray-900 dark:text-gray-400">
              I agree with the{" "}
              <a
                href="#"
                className="text-blue-600 hover:underline dark:text-blue-500"
              >
                terms and conditions
              </a>
              .
            </label>
          </div>
          {signupError && (
            <div className="text-white rounded-md m-2 p-2 bg-red-400">
              {signupError}
            </div>
          )}
          <Button type="submit">Submit</Button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
