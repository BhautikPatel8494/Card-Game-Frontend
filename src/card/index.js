import React from "react";
import "../main.scss";
import { Grid } from "@material-ui/core";

export class Card extends React.Component {
    constructor() {
      super();
      this.clickMe = this.clickMe.bind(this);
    }
    clickMe() {
      if (this.props.position === "unselected") {
        this.props.clickEvent(this.props.index);
      } else {
        console.log("cant click me! my position is " + this.props.position);
      }
    }
  
    render() {
      return (
        <Grid
          data-index={this.props.index}
          data-cardtype={this.props.type}
          onClick={this.clickMe}
          className={
            "card card--" + this.props.type + " card--" + this.props.position
          }
        >
          <Grid className="card__inner">
            <Grid className="card__face card__front"></Grid>
            <Grid className="card__face card__back"></Grid>
          </Grid>
        </Grid>
      );
    }
  }