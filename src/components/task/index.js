import { Grid, Typography, Checkbox } from '@mui/material';
import React, { useState } from 'react';
import Constants from '../../utils/Constants';

const Task = ({ id, description, isChecked, isDeleted, timestamp, contract, account }) => {
    const [checked, setChecked] = useState(isChecked);
    async function handleOnChange() {
        contract.methods.checkTask(id).send({ from: account })
            .then(tx => {
                console.log("Transaction:", tx.events);
                setChecked(!isChecked);
            })
            .catch(err => {
                console.log(err);
            });
    }
    return (
        <Grid container sx={{
            display: 'flex',
            alignItems: 'center',
            paddingLeft: 1,
            borderRadius: 10,
            borderWidth: 2,
            borderStyle: 'solid',
            borderColor: Constants.colors.lighter_theme,
            marginBottom: 1
        }}>
            <Checkbox
                checked={checked}
                onChange={() => handleOnChange()}
                sx={{
                    color: Constants.colors.pink,
                    '&.Mui-checked': {
                        color: Constants.colors.pink,
                    },
                }} />
            <Typography variant="h7" sx={{
                color: 'white',
                fontFamily: 'cursive'
            }}>
                {description}
            </Typography>
        </Grid>
    );
};

export default Task;