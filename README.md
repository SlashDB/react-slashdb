# react-slashdb

---
[SlashDB](https://www.slashdb.com/), [SlashDB documentation](https://www.slashdb.com/documentation/), [demo task list app](https://github.com/SlashDB/taskapp-demo), [react-slashdb documentation](https://slashdb.github.io/react-slashdb/)
---

React-slashdb is an SDK for use in ReactJS and vanilla Javascript projects. It provides easy integration with SlashDB as a middleware solution for interaction with relational databases. The exposed methods allow for connecting to a database by providing minimal configuration information, and also provide built-in capability for state management of incoming data when using the ReactJS-geared part of the package.

Visit [SlashDB](https://www.slashdb.com/) and [SlashDB user guide](https://docs.slashdb.com/user-guide/) to learn more about SlashDB.

## Documentation

Please visit [SlashDB documentation](https://www.slashdb.com/documentation/) to learn about all methods and functions avaliable in react-slashdb. There you can find a full and descriptive information about all exposed functions and methods in the SDK. 

## Quick Start Guide 

### Set up and install

To start using react-slashdb you need to have Node.js set up on your system. Please get the LTS version of Node.js here [Node.js](https://nodejs.org/en/).

This package has a peer dependency of react and react-dom so these packages will be installed on your system as well if required. Please see [react-dom](https://www.npmjs.com/package/react-dom) and [react](https://www.npmjs.com/package/react). The SDK is split in two parts; ReactJS geared functionality and vanilla JS geared functionality, which does not require ReactJS to function.

To get started, either install the package globally using the following npm command in a terminal:

    npm install -g react-slashdb

or navigate in your file system to an existing project in which you wish to use the package and run the following command in a terminal:

    npm install react-slashdb

Once the package is installed, you can use an import stament to tap into the functionality of react-slashdb, e.g. :

    import { SlashDBProvider } from 'react-slashdb';

```SlashDBProvider``` is only one of the many functions, methods or components available from this SDK. More of them are described later in this document.

### Use in a ReactJS project

### SlashDBProvider and SlashDBContext

To set up a connection to a SlashDB server and optionally pass an API key, we need to call the component ```SlashDBProvider``` and provide some configuration parameters.  Under the hood, the ReactJS custom components and hooks used in this app call functions defined in the [SlashDB vanilla Javascript SDK].  See code below for how to use SlashDBProvider:

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

```baseUrl``` and ```dataFormatExt``` are required parameters needed to connect to the SlashDB server.  If the server allows CORS or the database doesn't require authentication, an API key is not needed. If the server doesn't allow CORS and authentication is needed, an API key must be provided. To complete authentication set up, see [auth](https://github.com/SlashDB/react-slashdb/README.md#auth) 

It is recommended to wrap the root component of your ReactJS app (in the code above, ```<App/>```) inside the ```SlashDBProvider``` so that the connection parameters are available for use down the component tree; they can be accessed in other components using the following code:

    import { useContext } from 'react';
    import { SlashDBContext } from './Context';
    .
    .
    .
    const { baseUrl, setUpOptions } = useContext(SlashDBContext);

By calling the ReactJS hook ```useContext``` with the ```SlashDBContext``` object, we can copy the connection parameters to ```{ baseUrl, setUpOptions }``` and use them as needed. 

### useSetUp()

This hook sets internal variables based on the values provided to ```SlashDBProvider``` for the connection to the SlashDB server. The SDK hooks ```useDataDiscovery``` and ```useExecuteQuery``` use this hook internally.  It is good practice to call it at the top level of a project to ensure other functionality such as ```auth.login``` works properly. See code example below: 

    import { useSetUp } from 'react-slashdb';
    .
    .
    .
    useSetUp();

### Auth

Auth is a class export of the SDK which allows for authentication with a username and password or API key.  The class is imported like so:
    
    import { auth } from 'react-slashdb';
    
It provides three methods: ```login```, ```isAuthenticated```, ```logout```   

##### auth.login(username, password, fnc) 
This method takes 3 parameters: ```username```, ```password``` and a function ```fnc``` that runs on successful authentication. When using an API key for authentication purposes, the value of ```password``` will not affect the authentication process, but a placeholder value must be provided. When using a username and password for authentication, the username and password must match a valid user entry in the SlashDB config files. The username must always match a valid user entry, regardless of whether you are using API key or not.

     auth.login(username, password, () => {
        // code to run if authentication is successful
     });

One way to use this would be to replace ```// code to run if authentication is successful``` with something like ```props.history.push('/app')``` and also have a protected route at ```/app```. In your ```ProtectedRoute.js``` component (for example), you can use the ```auth.isAuthenticated()``` method to check if the user account has logged in successfully.  See below for an example (this code also uses [react-router-dom](https://www.npmjs.com/package/react-router-dom) for routing needs).

App.js:

     ...
     <ProtectedRoute exact path="/app" component={_YourComponent_} />
     ...
     
Login.js:

     ...
     auth.login('_username_', '_password_', () => {
       props.history.push('/app');
     });
     
ProtectedRoute.js:

     ...
     (auth.isAuthenticated()) === false)
     ...
     
Don’t forget to actually import the auth module from react-slashdb. For a full code example, please see the files ```App.js```, ```Login.js``` and ```ProtectedRoute.js``` in the [demo task list app](https://github.com/SlashDB/taskapp-demo). 

##### auth.isAuthenticated()
This method simply returns a boolean value that indicates if the user is authenticated against the SlashDB server. 

##### auth.logout(fnc) 
This method logs the user out of the active session, and then executes the provided function ```fnc```.  To use: 

     auth.logout(() => {
        //your code here;
     }

This will send a logout request to the SlashDB server; if the request is successful, the provided function will run.  For a full example, look at the [demo task list app](https://github.com/SlashDB/taskapp-demo).

### Hooks for Database Interaction and Data Retrieval

The SDK exposes two custom hooks which make retrieving data and interacting with a database on a SlashDB server via GET, POST, PUT and DELETE calls simple.
The parameters specified for the ```SlashDBProvider``` and the parameters provided to ```useDataDiscovery``` are combined to construct the URL to which the request will be made. For detailed example, please see the [demo task list app]

#### useDataDiscovery(dbName, [dbTables])
```useDataDiscovery``` provides access to the Data Discovery features of SlashDB for interaction with the database.  It takes two parameters: a string containing the database name, and an array of strings containing the path to the table that you want to retrieve data from.

It returns an array that holds the requested data from the database, as well as four function references which can be used to perform GET, POST, PUT, and DELETE requests with the provided database.  Here is an example of usage:

     import { useDataDiscovery } from 'react-slashdb';
     ...
    const [data, getData, postData, putData, deleteData] = useDataDiscovery(
      '_DatabaseName_',
      ['_TableName_']
    );
    
**Return value ```data```** – an array containing the data retrieved from the requested tables.  The data can be used like any JS array, e.g. to map over and construct a group of components:

    {lists.map((list) => (
     <List
       key={list.TaskListId}
       TaskListId={list.TaskListId}
       list={list}
       getList={getList}
       putList={putList}
       deleteList={deleteList}
     />
    ))}

**Return value ```getData```** - a function reference to fetch data from the database.   Calls to this function will refresh the current value of ```data``` with new values retrieved from the database from the table that was previously provided with ```useDataDiscovery```.  Optionally, it is possible to retrieve data from a different table using this function by providing an array of strings representing the path to the different table; keep in mind that ```data``` will be overwritten with the results, so you probably don’t want to do this unless you have a special use case.   If you need to drill down into the database, use the ```useDataDiscovery``` hook again with a new set of parameters and constants, or drill down manually - the same way you would any other array or object. 
    
    getList(['TaskList', 'TaskListId', `${TaskListId}`]);
    or
    getList();

**Return value ```postData```** - a function reference to add new data to the database.   The function takes an array of strings representing the path to the resource to access, and an object containing key:value pairs to be inserted into the table as a new record.  The key:value pair names and types should conform to your database schema.

    postData(['TaskList'], {
            Name: listName ? listName : 'New List',
    })
 
**Return value ```putData```** - a function reference to update a record in the database.   The function takes an array of strings representing the path to the resource to update, and an object containing key:value pairs that specify the columns to update and the new values for the columns.  The key:value pair names and types should conform to your database schema.

    putData(['TaskList', 'TaskListId', `${TaskListId}`], { [fieldName]: `${fieldValue}` });

**Return value ```deleteData```** - a function reference to remove a record from the database.  The function takes an array of strings representing the path to the resource to delete.

    deleteData(['TaskList', 'TaskListId', `${TaskListId}`]);

The functions ```postData```, ```putData ``` and ```deleteData``` also refresh the value of ```data``` to reflect the current database state after their operations complete.   This allows state management of the database to be abstracted, removing the need to track the state of ```data``` using any ReactJS hooks like ```useEffects```.

### useExecuteQuery(httpMethod, queryName, queryParams)
```useExecuteQuery``` enables the use of the SQL Pass-Thru features of SlashDB.  Queries are created ahead of time in the SlashDB administrative control panel (Configure->Queries); this hook gives the developer the ability to execute those queries using the ReactJS SlashDB SDK [see SlashDB documentation for more on SQL Pass-Thru](https://docs.slashdb.com/user-guide/config/queries/).

This hook takes three parameters: a string which specifies what HTTP method type to use (e.g. GET, POST, etc), a string representing the query name as defined in the SlashDB Queries configuration, and an object containing key:value pairs of parameters to pass to the query. It returns the query data as an array of objects, and a function reference that allows you to execute the query as desired, with the same or different parameters.

    const [queryData, executeMyQuery] = useExecuteQuery(
            'get',
            'percent-complete',
            {
            TaskListId: `${TaskListId}`,
            }
    );
    
