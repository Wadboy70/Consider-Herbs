import React, {useEffect, useState} from 'react';
import {Router, Route, Switch, Redirect  } from 'react-router-dom';
import Home from "./views/Home/Home";
import NotFound from "./views/NotFound";
import NavBar from "./components/Header/NavBar";
import Remedy from './views/Remedy/Remedy.js';
import Board from "./views/Chat/Board.js";
import Chat from "./views/Chat/Chat.js";
import Admin from './views/Admin/Admin.js';
import Book from './views/Book/Book.js'
import Browse from "./views/Browse/Browse.js"
import Edit from './views/Chat/Edit.js'
import Footer from "./components/Footer";
import UserHome from "./views/UserHome/UserHome.js";
import Checkout from "./views/Checkout/Checkout";
import NoAccount from "./views/NoAccount/NoAccount";
import { useAuth0 } from "./react-auth0-spa";
import "./App.css"
import { get } from 'mongoose';
import { createBrowserHistory } from 'history'

const defaultGlossary = (setResults) => {
  fetch(`http://127.0.0.1:5000/api/db/glossary/`).then(
          (response)=>{
              (response.json().then(data =>{
                  setResults(data.data);
          }))
  });
}
const searchGlossary = (e, setResults) =>{
  if (e.target.value.replace(/\s/g,'') != ''){
      fetch(`http://127.0.0.1:5000/api/db/glossary/search/${e.target.value}`).then(
          (response)=>{
              (response.json().then(data =>{
                  setResults(data.data);
              }))
      });
  }else defaultGlossary(setResults);
}
/*
const setAuthUserRole = (userId,role,config, access) => {
  let id = [config.subscriberId, config.premiumId, config.adminId];
  let newRole;
  switch(role.toLowerCase()){
    case "admin":
      newRole = config.adminId;
      break;
    case "subscriber":
      newRole = config.subscriberId;
      break;
    case "premium":
      newRole = config.premiumId;
      break;
  }

  //delete all other roles
fetch(`https://${config.domain}/api/v2/users`,{
        // "mode": 'no-cors',
        method: "DELETE",
        headers: {
          "authorization": "Bearer " + access.access_token,
          "content-type": "application/json",
        },
        body:{
          'roles': id
        }}).then(res => console.log(res.json()))
        .catch(rej=>console.log(rej)
  );

  // fetch(`https://${props.config.domain}/api/v2/users`,{
  //       headers: {authorization: "Bearer " + props.access.access_token}
  //       }).then(res => res.json().then(data => {
  //           setUserList(data);
  //           setDefaultUserList(data);
  //       })).catch(rej=>console.log(rej)
  // );
}
*/
const history = createBrowserHistory();

const App = (props) => {
  const { loading, user, isAuthenticated} = useAuth0();
  const [userRole, setUserRole] = useState("guest");
  const [access, setAccess] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const config = props.config;

  if (loading) {
    return <div>Loading...</div>;
  }

  //pages tier system
  const TheHome = isAuthenticated ? UserHome : Home;
  const TheRemedy = isAuthenticated ? Remedy : NoAccount; 
  const TheBooking = isAuthenticated ? Book : NoAccount;


  if (!access){
    fetch('http://127.0.0.1:5000/auth/access')
    .then(res=>res.json().then(data => setAccess(data)))
    .catch(reas=>console.log(reas));
  }
  if (access && isAuthenticated){
    //get the users role
    fetch(`https://${props.config.domain}/api/v2/users/${user.sub}/roles`,{
      headers: {authorization: "Bearer " + access.access_token}
    }).then(res => res.json().then(data => {
        if(data.length > 0)
          setUserRole(data[0].name.toLowerCase());
        else{
          setUserRole("subscriber");
          // setAuthUserRole(user.sub, "subscriber", config, access);
        }
    })).catch(rej=>console.log(rej));
  }
  return (
    <div>
      <NavBar isAuthenticated = {isAuthenticated} user = {user} userRole = {userRole}/>
      <Switch>
        <Route exact path="/">
         <Redirect to="/Home" />
        </Route>
        <Route exact path="/Chat" component={Board}>
        </Route>
        <Route exact path="/Chat/Post" component={Chat}>
        </Route>
        <Route path = "/Home" render = {(props) => <TheHome
          user = {user}
        />}></Route>
        <Route path = "/Admin" render = {(props) => <Admin
        defaultGlossary = {defaultGlossary}
        searchGlossary = {searchGlossary}
        access = {access}
        config = {config}
        isAuthenticated = {isAuthenticated}
        userRole = {userRole}
        />}></Route>
        <Route exact path = "/Book" render={()=>(<TheBooking selectProduct={setSelectedProduct}/>)}></Route>
        {/* Chat needs to be looked at by hosung */}
        <Route exact path = "/Chat" render = {() => <Chat
          user = {user}
          userRole = {userRole}
        />}></Route>
        <Route path = "/Chat/:pid" render = {() => <Chat
          user = {user}
          userRole = {userRole}
        />}></Route>
        <Route exact path = "/Write" component = {Edit}></Route>
        <Route path = "/Edit/:pid" component = {Edit}></Route>
        <Route exact path="/Remedy" component={TheRemedy}/>
        <Route path = "/Browse" render = {(props) => <Browse
        searchGlossary = {searchGlossary}
        defaultGlossary = {defaultGlossary}
        userRole = {userRole}
        />}></Route>
        <Route path ="/Checkout"
              render={()=> (<Checkout selectedProduct={selectedProduct}/>)}/>
        <Route component={NotFound}/>
      </Switch>
      <Footer/>
    </div>
  );
}

export default App;
