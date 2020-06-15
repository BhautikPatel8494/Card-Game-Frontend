import React from "react";
import "../main.scss";
import { Grid } from "@material-ui/core";
import MySwal from "sweetalert2";

let dialogBoxData = {
    title: "Memory Game",
    focusConfirm: false,
    html: `
      <h3>Please signUp/ signIn to play game</h3>
      <input class="swal2-input" id="email" type="email" placeholder="Enter your email..." /><br />
      <input class="swal2-input" id="password" type="password" placeholder="Enter your password..." /><br />`,
    type: "warning",
    confirmButtonText: "Login!",
    allowOutsideClick: false,
    preConfirm: () => ({
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
    }),
};

export class HomeScreen extends React.Component {
    constructor() {
        super();
        this.clickMe = this.clickMe.bind(this);
    }
    async clickMe(email, password) {
        await fetch("http://localhost:3100/email", {
            method: "POST",
            body: JSON.stringify({ email, password }),
            headers: {
                "Content-type": "application/json; charset=UTF-8",
            },
        })
            .then((res) => res.json())
            .then(async (res) => {
                if (res.status && res.status === 404) {
                    await MySwal.fire({
                        type: "error",
                        title: "Email already exist! Please enter valid password",
                    });
                    this.userDetails();
                } else {
                    this.props.previousHistory(res);
                    this.props.handleChangeEmail(email);
                    this.props.clickEvent(res);
                }
            });
    }
    async userDetails() {
        const swalval = await MySwal.fire(dialogBoxData);
        let v = (swalval && swalval.value) || swalval.dismiss;
        if (v && v.email && v.password) {
            this.clickMe(v.email, v.password);
        } else {
            await MySwal.fire({
                type: "error",
                title: "All fields are required!!",
            });
            this.userDetails();
        }
    }
    render() {
        return (
            <Grid
                className={
                    this.props.gameStart
                        ? "homescreen homescreen--visible"
                        : "homescreen homescreen--hidden"
                }
            >
                <button
                    className="homescreen__shuffle-button "
                    onClick={() => this.userDetails()}
                >
                    Play Now!
          </button>
            </Grid>
        );
    }
}