import React from "react";
import "../main.scss";
import {
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
} from "@material-ui/core";
import moment from "moment";

export function DialogBox(props) {
    console.log('props', props)
    return (
        <Dialog
            open={true}
            onClose={props.handleClose}
            aria-labelledby="scroll-dialog-title"
            aria-describedby="scroll-dialog-description"
        >
            <DialogTitle id="scroll-dialog-title">History</DialogTitle>
            <DialogContent>
                <Table aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">Id</TableCell>
                            <TableCell align="center">Date/Time</TableCell>
                            <TableCell align="right">Total Move</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {props.history.length ?
                            props.history.map((data, index) => {
                                return (
                                    <TableRow key={index}>
                                        <TableCell align="left">{index + 1}</TableCell>
                                        <TableCell align="center">
                                            {moment(data.timeStamp).format("MMMM Do YYYY, h:mm:ss a")}
                                        </TableCell>
                                        <TableCell align="right">{data.totalMove}</TableCell>
                                    </TableRow>
                                );
                            }) : null}
                    </TableBody>
                </Table>
            </DialogContent>
            <DialogActions>
                <Button onClick={props.handleClose} color="primary">
                    Cancel
          </Button>
            </DialogActions>
        </Dialog>
    );
}