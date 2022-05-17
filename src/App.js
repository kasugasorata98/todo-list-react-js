import Constants from "./utils/Constants";
import React, { useState } from 'react';
import { Button, Typography, TextField, DialogTitle, DialogContent, DialogActions, Grid, Alert, Snackbar } from "@mui/material";
import AddIcon from '@mui/icons-material/Add';
import Dialog from '@mui/material/Dialog';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import Task from "./components/task";
import Web3 from 'web3';
import TodoList from './contract/TodoList.json';

function App() {
  const [account, setAccount] = useState(null);
  const [hasMetaMask, setMetaMask] = useState(true);
  const [isDialogOpen, setDialog] = useState(false);
  const [hasAccountsListenerSet, setHasAccountsListenerSet] = useState(false);
  const [web3, setWeb3] = useState(null);
  const [networkId, setNetworkId] = useState(null);
  const [contract, setContract] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [taskDescription, setTaskDescription] = useState('');
  const [connectToWalletAlert, setConnectToWalletAlert] = useState(false);

  function addTask() {
    if (taskDescription === '') {
      setConnectToWalletAlert(true);
    }
    contract.methods.createTask(taskDescription).send({ from: account })
      .then(tx => {
        console.log(tx);
        setDialog(false);
        getLatestTask(tx.events.TaskEvent.returnValues.id);
      })
      .catch(err => {
        console.log(err);
      });
  }

  function loadWeb3() {
    window.ethereum.enable();
    let provider = window.ethereum;
    if (typeof provider !== 'undefined') {
      provider.request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          setAccount(accounts[0]);
          console.log("Set account: " + accounts[0]);
          if (!hasAccountsListenerSet) {
            window.ethereum.on('accountsChanged', function (accounts) {
              setAccount(accounts[0]);
              setTasks([]);
              console.log("Set account: " + accounts[0]);
            });
            setHasAccountsListenerSet(true);
          }
          setMetaMask(true);
          setConnectToWalletAlert(false);
          return accounts[0];
        })
        .catch(err => {
          console.log(err);
        })
        .then(async (account) => {
          if (!account) {
            return;
          }
          try {
            const web3 = new Web3(provider);
            setWeb3(web3);
            const networkId = await web3.eth.net.getId();
            setNetworkId(networkId);
            const contract = new web3.eth.Contract(
              TodoList.abi,
              TodoList.networks[networkId].address
            );
            // contract.events.TaskEvent({})
            //   .on('data', event => {
            //     console.log(event);
            //   });
            setContract(contract);
            const count = await contract.methods.counters(String(account)).call();
            for (let i = 1; i <= count; i++) {
              const res = await contract.methods.tasks(String(account), i).call();
              if (!res.isDeleted)
                setTasks(prevTasks => [...prevTasks, res]);
            }
          }
          catch (err) {
            console.log(err);
          }
        }).catch(err => {
          console.log(err);
        });
    }
    else {
      setMetaMask(false);
    }
  }

  async function getLatestTask(id) {
    try {
      const res = await contract.methods.tasks(account, id).call();
      setTasks(prevTasks => [...prevTasks, res]);
    }
    catch (err) {
      console.log(err);
    }
  }

  return (
    <Grid container sx={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: 'center',
      paddingTop: 5
    }}>
      <Snackbar open={!hasMetaMask}>
        <Alert severity="error" sx={{ width: '100%' }}>
          Please install MetaMask then refresh to connect
        </Alert>
      </Snackbar>
      <Snackbar open={connectToWalletAlert}>
        <Alert severity="error" sx={{ width: '100%' }}>
          Please connect to wallet first
        </Alert>
      </Snackbar>
      <Grid
        sx={(theme) => ({
          width: '40%',
          [theme.breakpoints.down('sm')]: {
            width: '80%',
          },
          display: 'flex',
          flexDirection: 'column'
        })}
      >
        <Typography variant="h5" sx={{
          color: 'white',
          alignSelf: 'center',
          fontWeight: '500',
          fontFamily: 'cursive',
          marginBottom: 1
        }}>
          To-do DApp
        </Typography>
        <Button
          onClick={() => {
            if (account) {
              setAccount(null);
              setTasks([]);
            }
            else
              loadWeb3();
          }}
          variant="outlined"
          sx={(theme) => ({
            color: Constants.colors.pink,
            borderColor: Constants.colors.pink,
            textTransform: 'none',
            borderWidth: 2,
            '&:hover': {
              borderColor: Constants.colors.pink
            },
          })}>{account ? 'Disconnect Wallet' : 'Connect Wallet'}</Button>
        <Typography variant="h5"
          sx={(theme) => ({
            color: 'white',
            alignSelf: 'center',
            fontWeight: '500',
            fontFamily: 'cursive',
            [theme.breakpoints.down('sm')]: {
              fontSize: 15,
            },
          })}
        >
          {account}
        </Typography>
        <Button
          sx={(theme) => ({
            borderColor: Constants.colors.lighter_theme,
            color: 'white',
            borderWidth: 2,
            '&:hover': {
              borderColor: Constants.colors.pink
            },
            marginTop: 2,
            borderRadius: 10,
            textTransform: 'none',
          })}
          variant="outlined"
          disableElevation
          onClick={() => setDialog(!isDialogOpen)}
          startIcon={<AddIcon sx={{ color: Constants.colors.pink }} />}>
          <Typography variant="h7" sx={{
            color: 'white',
            alignSelf: 'center',
            fontFamily: 'cursive'
          }}>
            Add a task
          </Typography>
        </Button>
        <Dialog
          open={isDialogOpen}
          onClose={() => {
            setDialog(!isDialogOpen);
            setTaskDescription('');
          }}
        >
          <DialogTitle
            sx={{
              fontFamily: 'cursive',
              fontSize: 18
            }}>{"What is the task?"}</DialogTitle>
          <DialogContent>
            <TextField
              sx={{
                display: 'flex',
              }}
              onChange={(e) => setTaskDescription(e.target.value)}
              multiline={true}
              variant="filled"
              label="Task" />
          </DialogContent>
          <DialogActions>
            <Button
              sx={{
                fontFamily: 'cursive',
                fontSize: 14
              }}
              onClick={() => {
                setDialog(!isDialogOpen);
                setTaskDescription('');
              }}
              color="error">Cancel</Button>
            <Button
              sx={{
                fontFamily: 'cursive',
                fontSize: 14
              }}
              onClick={() => addTask()} color="info">Confirm</Button>
          </DialogActions>
        </Dialog>
        <Typography variant="h7" sx={{
          color: 'white',
          alignSelf: 'flex-start',
          fontFamily: 'cursive',
          marginTop: 2,
          textDecoration: 'underline',
          marginBottom: 1
        }}>
          {`Tasks(${tasks.length})`}
        </Typography>
        {
          tasks.map(task => {
            if (!task.isDeleted) {
              return (
                <Task
                  key={task.id}
                  id={task.id}
                  description={task.description}
                  isChecked={task.isChecked}
                  isDeleted={task.isDeleted}
                  timestamp={task.timestamp}
                  contract={contract}
                  account={account}
                />
              );
            }
            else {
              return 0;
            }
          })
        }
      </Grid>
    </Grid >
  );
}

export default App;
