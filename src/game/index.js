import React from "react";
import "../main.scss";
import {
  Button,
  Grid
} from "@material-ui/core";
import swal from "sweetalert";
import _ from "lodash";
import moment from "moment";
import { HomeScreen } from "../homeScreen";
import { Card } from "../card";
import { DialogBox } from "../utils/dialogBox";

const uniqueCards = ["michael", "mark", "andrew", "adam", "ahmet", "david"];
const numCardsToMatch = 2;

export class MemoryGame extends React.Component {
  constructor() {
    super();
    this.shuffleCards = this.shuffleCards.bind(this);
    this.pickCard = this.pickCard.bind(this);
    this.addWin = this.addWin.bind(this);
    this.ignoreCardClicks = false;

    this.state = {
      cards: [],
      email: null,
      selectedCards: [],
      gameStart: 1,
      open: false,
      totalMove: 0,
      history: [],
      registered: false,
    };
  }

  multiplyCards(cards, multiplier) {
    let loopTimes = multiplier - 1;
    let multiplied = cards;
    for (var i = 0; i < loopTimes; i++) {
      multiplied = _.concat(multiplied, cards);
    }

    return multiplied;
  }

  async shuffleCards(userData) {
    let cards = [];
    let pastMove = 0;
    const getCards = () => {
      let multipliedCards = this.multiplyCards(uniqueCards, numCardsToMatch);
      let shuffled = _.shuffle(multipliedCards);
      const getCard = shuffled.map(function (val) {
        return {
          type: val,
          position: "unselected",
        };
      });
      return getCard;
    }
    if (userData && userData.resumeGame && userData.cards && userData.cards.length) {
      let isContinue = false;
      await swal({
        title: 'Resume Game',
        text: "You want to continue last game ?",
        buttons: {
          cancel: true,
          confirm: true
        },
        type: 'warning',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then(async function (isConfirm) {
        if (isConfirm) {
          isContinue = true
          pastMove = userData.totalMove
        } else {
          isContinue = false
        }
      })
      if (isContinue) {
        cards = userData.cards
      } else {
        cards = getCards()
      }
    } else {
      cards = getCards()
    }

    this.setState({
      cards: cards,
      gameStart: 0,
      totalMove: pastMove,
      registered: true,
    });
  }

  changeAllPositionsOfSelected(allCards, selectedCards, newPosition) {
    for (var v of selectedCards) {
      allCards[v].position = newPosition;
    }
    return allCards;
  }

  async addWin() {
    const totalMove = this.state.totalMove;
    await fetch("/update-history", {
      method: "POST",
      body: JSON.stringify({ email: this.state.email, totalMove }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
    })
      .then((res) => res.json())
      .then((res) => {
        swal(
          "Good job!",
          `You complete this game in ${totalMove} move!`,
          "success",
          {
            button: "Play again!",
          }
        ).then((value) => {
          this.shuffleCards();
          let newHistory = this.state.history;
          newHistory.push({
            timeStamp: new Date(),
            totalMove: totalMove,
          });
          this.setState({
            totalMove: 0,
            history: newHistory,
          });
        });
      });
  }

  selectedHasSameAttribute(allCards, selectedCards, attribute) {
    let eq = allCards[selectedCards[0]][attribute];
    for (var v of selectedCards) {
      if (allCards[v][attribute] !== eq) {
        return false;
      }
    }
    return true;
  }

  checkForMatch(curCards, curSelectedCards) {
    if (this.selectedHasSameAttribute(curCards, curSelectedCards, "type")) {
      curCards = this.changeAllPositionsOfSelected(
        curCards,
        curSelectedCards,
        "removed"
      );

      let winTest = _.reduce(
        curCards,
        function (result, value, key) {
          if (result === value.position) {
            return result;
          } else {
            return false;
          }
        },
        curCards[0].position
      );

      if (winTest !== false) {
        this.addWin();
      }
    } else {
      curCards = this.changeAllPositionsOfSelected(
        curCards,
        curSelectedCards,
        "unselected"
      );
    }

    return curCards;
  }

  pickCard(index) {
    if (this.ignoreCardClicks !== true) {
      let curSelectedCards = _.concat(this.state.selectedCards, index);
      let curCards = this.state.cards;

      curCards[curSelectedCards[curSelectedCards.length - 1]].position =
        "selected";

      if (curSelectedCards.length === numCardsToMatch) {
        this.setState({
          cards: curCards,
          totalMove: this.state.totalMove + 1,
        });

        let _this = this;
        this.ignoreCardClicks = true;

        setTimeout(function () {
          curCards = _this.checkForMatch(curCards, curSelectedCards);
          curSelectedCards = [];

          _this.ignoreCardClicks = false;

          _this.setState({
            selectedCards: curSelectedCards,
            cards: curCards,
          });
        }, 750);
      } else {
        curCards[curSelectedCards[0]].position = "selected";

        this.setState({
          selectedCards: curSelectedCards,
          cards: curCards,
        });
      }
    }
  }

  handleDialog(value) {
    this.setState({
      open: value,
    });
  }

  previousHistory(data) {
    this.setState({
      history: data.history,
    });
  }

  handleChangeEmail(email) {
    this.setState({ email });
  }

  handleConfirmLogOut(email, cards, totalMove) {
    if (this.state.totalMove) {
      swal({
        title: 'Are you sure?',
        text: "You want to save this game ?",
        buttons: {
          cancel: true,
          confirm: {
            text: "Yes",
            value: "Yes"
          },
          roll: {
            text: "No",
            value: "No"
          }
        },
        type: 'warning',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
      }).then(async function (isConfirm) {
        if (isConfirm) {
          await fetch("/save-game", {
            method: "POST",
            body: JSON.stringify({ email, cards, isConfirm, totalMove }),
            headers: {
              "Content-type": "application/json; charset=UTF-8",
            },
          })
            .then((res) => res.json())
          window.location.reload()
        }
      })
    } else {
      window.location.reload()
    }
  }

  render() {
    let clickEvent = this.pickCard;
    let cardIndex = 0;
    const { registered, gameStart, totalMove, email, cards } = this.state

    return (
      <Grid className="memory-app">
        <HomeScreen
          gameStart={gameStart}
          clickEvent={this.shuffleCards}
          previousHistory={(data) => this.previousHistory(data)}
          handleChangeEmail={(data) => this.handleChangeEmail(data)}
        />
        {registered && (
          <Grid className="cards" style={{ paddingTop: 46 }}>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
              style={{ padding: 22 }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={() => this.handleDialog(true)}
              >
                History
              </Button>
              <h3> Total Move : {totalMove}</h3>
              <Button
                variant="contained"
                color="primary"
                onClick={async () => this.handleConfirmLogOut(email, cards, totalMove)}
              >
                Logout
              </Button>
            </Grid>
            {this.state.cards.map(function (thisCard, index) {
              return (
                <Card
                  index={cardIndex++}
                  key={index}
                  clickEvent={clickEvent}
                  position={thisCard.position}
                  type={thisCard.type}
                />
              );
            })}
          </Grid>
        )}
        {this.state.open && (
          <DialogBox
            handleClose={() => this.handleDialog(false)}
            history={this.state.history}
          />
        )}
      </Grid>
    );
  }
}
