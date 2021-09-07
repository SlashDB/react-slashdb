# react-slashdb
---
[SlashDB](https://www.slashdb.com/), [SlashDB documentation](https://www.slashdb.com/documentation/), [demo task list app](https://github.com/SlashDB/taskapp-demo), [react-slashdb documentation](https://slashdb.github.io/react-slashdb/)

---


React-slashdb is a SlashSD SDK for use in ReactJS and vanilla JS project. It allows easy integration of SlashDB as middleware solution for interaction with relational databases. Methods exposed allow for connection to database by providing minimal vital information and provides build in capability for state management of incoming data when using the ReactJS geared part of the package.

Visit [SlashDB](https://www.slashdb.com/) and [SlashDB user guide](https://docs.slashdb.com/user-guide/) to learn more about SlashDB.

## Documentation
---

Please visit [SlashDB documentation](https://www.slashdb.com/documentation/) to learn about all methods and functions avaliable in react-slashdb. There you can find a full and descriptive information about all exposed functions and methods in the SDK. 

## Quick Start Guide 
---

### Set up and install

To start using react-slashdb you will first need to have Node.js set up on your system. Please get the LTS version of Node.js from here [Node.js](https://nodejs.org/en/).

This package has a peerDependency of react and react-dom so it is assumed you have those on your system as well. Please see [react-dom](https://www.npmjs.com/package/react-dom) and [react](https://www.npmjs.com/package/react). While it is true there are functions and metrhods in this SDK which only focus on vanilla JS use if you want to get the full functionality you will need to have react and react-dom. Generaly the SDK is split in two parts ReactJS geared functionality and vanilla JS geared functionality.

To get started either install the package globaly using the following npm command in a terminal

    npm install - g react-slashdb

or navigate in your file system to a project in which you wish to use the package and run the following command in terminal 

    npm install react-slashdb
  
Now that you havew the package installed you can use an import stament to tap in the fuctionality of react-slashdb as such

    import { SlashDBProvider } from 'react-slashdb';
  
SlashDBProvider is only one of the many functions, methods or components avaliable from this SDK. To learn about all of them visit [react-slashdb documentation](https://slashdb.github.io/react-slashdb/).

### Use in a ReactJS project

#### SlashDBProvider and SlashDBContext

To set up connection to a SlashDB server and optionaly pass an API key first we need to call the component **SlashDBProvider** and pass some set up options as values. See this example for clarification. **BaseUrl** and **dataFormatExt** will always be needed to successfully connect to SlashDB server. If server allows cors or database being accessed doesn't require authentication API key is not needed. If server doesn't allow cors and authentication is neede API key should be provided. To complete authentication set up see **auth.login** below.

    import { SlashDBProvider } from './Context';
    .
    .
    .
    <SlashDBProvider
        baseUrl={'https://demo.slashdb.com/'}
        setUpOptions={{
        dataFormatExt: 'json',
        apiKey: 'API key value',
    }}
    >
      <App />
    </SlashDBProvider>

It is recomented to wrap the root component of your ReactJS app (in this case it is <App />) with the **SlashDBProvider** so that the passed values are avaliable for use down the component tree by calling the following code:

    import { useContext } from 'react';
    import { SlashDBContext } from './Context';
    .
    .
    .
    const { baseUrl, setUpOptions } = useContext(SlashDBContext);
  
By using the ReactJS hook **useContext** and passing the value of **SlashDBContext** we can set the value of { baseUrl, setUpOptions } to the values passed in the **SlashDBProvider** and use them as we need.

#### useSetUp()

All this will do is set internal variables based on the values provide in **SlashDBProvider** for connection to SlashDB server. While build in hooks **useDataDiscovery** and **useExecuteQuery** do so internaly already it is good practive to call it at a top level of project to ensure other fuctionality such as **auth.login** works properly. See code example below.

    import { useSetUp } from 'react-slashdb';
    .
    .
    .
    useSetUp();
  
#### auth

Auth is a class export of the SDK which allows for authentication with username and password for login purposes to take place. It also allow for logout to happen. We import the class as such:

    import { auth } from 'react-slashdb';
  
##### auth.login(username, password, () => {}), auth.isAuthenticated() and auth.logout(() => {})

This method takes 3 params username, password and some function to run upon successful authentication. If using API key for authentication purposes the value of password will not change the authentication result but still needs to have some value passed. If only using username and password for authentication the password needs to match the one for the user in the SlashDB config files. Username needs to match regardless if using API key or not.

    auth.login(username, password, () => {
      //your code to run if authentication returns success
    });
  
One way to use this would be to replace _//your code to run if authentication returns success_ with something like props.history.push('/app'); and also have a protected route at _/app_. In your ProtectedRoute.js(example name can be anything you wish) component to again use the **auth** by calling  **auth.isAuthenticated()** to check if authentication has taken place and if it was been successful. Here is a full example. Note this example also uses [react-router-dom](https://www.npmjs.com/package/react-router-dom) for routing needs.

  App.js

    ...
    <ProtectedRoute exact path="/app" component={_YourComponent_} />
    ...

  Login.js

    ...
    auth.login('_username_', '_password_', () => {
      props.history.push('/app');
    });

  ProtectedRoute.js

    ...
    (auth.isAuthenticated()) === false)
    ...

Do not forget to actually import the auth module from react-slashdb. For a full code example please see the files App.js, Login.js and ProtectedRoute.js in [demo task list app](https://github.com/SlashDB/taskapp-demo).

To log user out use the following:

    auth.logout(() => {
            //your code here;
    }
    
This will send a logout request to the SlashDB server if request is successful the passed function will run. Here is a example way to use it. Replace the _//your code here_ part with something like props.history.push('/'). Again for a full example in a fuctioning application refer to [demo task list app](https://github.com/SlashDB/taskapp-demo).

### hooks for database interaction and data retrival

Please see [Using hooks to interact with database via Slashdb API](https://github.com/SlashDB/taskapp-demo#using-hooks-to-interact-with-database-via-slashdb-api) and [What are useDataDiscovery and useExecuteQuery hooks?](https://github.com/SlashDB/taskapp-demo#what-are-usedatadiscovery-and-useexecutequery-hooks)

The SDK exposes two custom hooks which make retriving data and interacting with a database on a SlashDB server via GET, POST, PUT and DELETE HTTP request easy and simple. The first one is **useDataDiscovery()**.

#### useDataDiscovery()

Please see [useDataDiscovery() in-depth](https://github.com/SlashDB/taskapp-demo#usedatadiscovery)

**useDataDiscovery()** makes the SlashDB functionality of Data Discovery for interaction with database readily valiable in ReactJS project. Here is an example:

    import { useDataDiscovery } from 'react-slashdb';
    ...
    const [data, getData, postData, putData, deleteData] = useDataDiscovery(
      '_DatabaseName_',
      ['_TableName_']
    );
    
**UseDataDiscovery()** will return a param that holds the retrived data after performing a GET request to the specified resource and four functions wich can be used to perform GET, POST, PUT and DELETE request for interaction with the provided database. The params provided in **SlashDBProvider** and the params provided in **useDataDiscovery** are what is used to construct the url to which the request will be made. For detailed example, explanation and sample use please refer to [demo task list app](https://github.com/SlashDB/taskapp-demo).
 
#### useExecuteQuery()
 
Please see [useExecuteQuery() in-depth](https://github.com/SlashDB/taskapp-demo#useexecutequery)
 
**useExecuteQuery()** allows for query existing on SlashDB server to be executed.

    const [queryData, executeMyQuery] = useExecuteQuery('_HTTP_Method_', '_queryName_', {
      _param_: `_paramValue_`,
    });
    .
    .
    .
    executeMyQuery('_HTTP_Method_', '_queryName_', {
      _param_: `_paramValue_`,
    });
    .
    .
    .
    <p>This is the value returned by the query {queryData[0].NameOfKey} %</p>
 
 
