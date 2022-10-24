# react-slashdb

---
[SlashDB](https://www.slashdb.com/), [SlashDB documentation](https://www.slashdb.com/documentation/), [demo task list app](https://github.com/SlashDB/taskapp-demo), [react-slashdb documentation](https://slashdb.github.io/react-slashdb/)
---

react-slashdb is an SDK for use in React projects. It provides easy integration with SlashDB as a middleware solution for interaction with relational databases. The exposed methods allow for connecting to a database by providing minimal configuration information, and also provide built-in capability for state management of incoming data when using the React geared part of the package.  It makes use of the [SlashDB Javascript SDK](https://github.com/SlashDB/slashdb-js).

Visit [SlashDB](https://www.slashdb.com/) and [SlashDB user guide](https://docs.slashdb.com/user-guide/) to learn more about SlashDB.

## Documentation

Check out the [SlashDB documentation](https://www.slashdb.com/documentation/) to learn about all the methods and functions used in SlashDB that are exposed by this SDK. 

## Quick Start Guide 

### Set up and install

To start using react-slashdb you need to have Node.js set up on your system. Please get the LTS version of Node.js here [Node.js](https://nodejs.org/en/).

This package has a peer dependency of react and react-dom so these packages will be installed on your system as well if required. Please see [react-dom](https://www.npmjs.com/package/react-dom) and [react](https://www.npmjs.com/package/react). The SDK also requires the [SlashDB JavaScript SDK](https://github.com/SlashDB/slashdb-js), which is also included as a dependency.

To get started, either install the package globally using the following npm command in a terminal:

    npm install -g @slashdb/react-slashdb

or navigate in your file system to an existing project in which you wish to use the package and run the following command in a terminal:

    npm install @slashdb/react-slashdb

Once the package is installed, you can use an import stament to tap into the functionality of react-slashdb, e.g. :

    import { SlashDBProvider } from '@slashdb/react-slashdb';

```SlashDBProvider``` is only one of the many functions, methods or components available from this SDK. More of them are described later in this document.

### Use in a React project

### A Simple Application
[A small demo application can be found in the demo_app folder](https://github.com/SlashDB/react-slashdb/tree/main/demo_app).


## Classes/Hooks/Functions
### SlashDBProvider and SlashDBContext

We can optionally provide the SlashDB configuration details to a React app using the ```SlashDBProvider``` component.  Under the hood, the React custom components and hooks used in an app use functions and classes defined in the [SlashDB Javascript SDK](https://github.com/SlashDB/slashdb-js).  See an example below of how to use ```SlashDBProvider```:

    import { SlashDBProvider } from '@slashdb/react-slashdb';
    .
    .
    .
    <SlashDBProvider
        baseUrl={'https://demo.slashdb.com/'}
        setUpOptions={{
        username: slashDBUserName,
        password: slashDBUserPassword,
        //apiKey: slashDBUserAPIKey
    }}
    >
      <App />
    </SlashDBProvider>

```baseUrl``` is the hostname or IP address of the SlashDB server to use with your app, including the protocol (http/https) and port number if necessary.  If the database doesn't require any authentication, set a dummy value for the username and API key.  You can use a username/password in cases where the React app and the SlashDB server are hosted on the same domain name/IP; otherwise, you'll need an API key.  If you set both a username/password and an API key, the API key will take precedence.  With username/password logins, you'll need to call the ```auth.login()``` method to get a valid session cookie from the SlashDB server.  See [auth](https://github.com/SlashDB/react-slashdb/README.md#auth) for more details.

It is recommended to wrap the root component of your React app (in the code above, ```<App/>```) inside the ```SlashDBProvider``` so that the connection parameters are available for use down the component tree; they can be accessed in other components using the following code:

    import { useContext } from 'react';
    import { SlashDBContext } from '@slashdb/react-slashdb';
    .
    .
    .
    const { baseUrl, setUpOptions } = useContext(SlashDBContext);

By calling the React hook ```useContext``` with the ```SlashDBContext``` object, we can copy the connection parameters to ```{ baseUrl, setUpOptions }``` and use them as needed. 
### useSetUp(instanceName = 'default', host = undefined, username = undefined, apiKey = undefined, password = undefined)

This hook sets internal variables based on the values provided to ```SlashDBProvider``` for the connection to the SlashDB server.  It is required to call it at or near the top level of a project to ensure other hooks such as `useDataDiscovery`, `useExecuteQuery` and the `auth.login()` method work properly. See code example below: 

    import { useSetUp } from '@slashdb/react-slashdb';
    .
    .
    .
    const sdbClient = useSetUp();

If you provide no parameters to ```useSetup```, it will check if it has been previously called; if not, it will create a [```SlashDBClient```](https://github.com/SlashDB/slashdb-js) object that holds all the configuration info from the ```SlashDBProvider``` component.  This object is returned by ```useSetup```.  If it has been called, it will return the existing ```SlashDBClient``` object.  If your app requires connections to multiple SlashDB instances with different configurations, configure the first instance using the ```SlashDBProvider``` component and the ```useSetup``` hook with no parameters.  For any additional instances, call ```useSetup``` like so:
    
    useSetUp(instanceName,host,username,apiKey,password)

where ```instanceName``` is a unique identifier for the instance (e.g. 'client2') and the host/username/apiKey/password parameters contain the SlashDB configuration  for the instance. The name given will be used when calling the ```useDataDiscovery``` or ```useExecuteQuery``` to perform transactions with the secondary SlashDB instance.  As before, a ```SlashDBClient``` object will be returned that holds this configuration info.  Calling ```useSetup``` with a name that has been given previously will return the existing ```SlashDBClient``` object for that instance.

### Auth

Auth is a class export of the SDK which allows for authentication with a username and password or API key.  The class is imported like so:
    
    import { auth } from 'react-slashdb';
    
It provides two methods: ```login```, ```logout```   

##### auth.login(username, password, sdbClient, fnc) 
This method takes 4 parameters: ```username```, ```password```, a [```SlashDBClient```](https://github.com/SlashDB/slashdb-js) object (such as the one returned by ```useSetup```, and a function ```fnc``` that runs on successful authentication. When using an API key for authentication, you can set the password to null.  When using a username and password for authentication, the username and password must match a valid user entry in the SlashDB config files. The username must always match a valid user entry, regardless of whether you are using API key or not.
    
     const sdbClient = useSetUp();
     auth.login(username, password, sdbClient, () => {
        // code to run if authentication is successful
     });

One way to use this would be to replace ```// code to run if authentication is successful``` with something like ```props.history.push('/app')``` and also have a protected route at ```/app```. In your ```ProtectedRoute.js``` component (for example), you can use the ```auth.authenticated``` property to check if the user account has logged in successfully.  See below for an example (this code also uses [react-router-dom](https://www.npmjs.com/package/react-router-dom) for routing needs).

App.js:

     ...
     <ProtectedRoute exact path="/app" component={_YourComponent_} />
     ...
     
Login.js:

     let sdbClient = useSetUp();
     ...
     auth.login('_username_', '_password_', sdbClient, () => {
       props.history.push('/app');
     });
     
ProtectedRoute.js:

     ...
     if (auth.authenticated)
     ...
     
Don’t forget to actually import the auth module from react-slashdb. For a full code example, please see the files ```App.js```, ```Login.js``` and ```ProtectedRoute.js``` in the [demo task list app](https://github.com/SlashDB/taskapp-demo). 

##### auth.logout(fnc) 
This method logs the user out of the active session, and then executes the provided function ```fnc```.  To use: 

     auth.logout(() => {
        //your code here;
     }

This will send a logout request to the SlashDB server, then the provided function will run.  For a full example, look at the [demo task list app](https://github.com/SlashDB/taskapp-demo).

This class contains the following properties:

```authenticated``` - a boolean flag that is set to true when the ```login``` method is successful

```sdbClient``` - a reference to the ```SlashDBClient``` provided to the ```login``` method, used when calling ```logout```


### Hooks for Database Interaction and Data Retrieval

The SDK exposes two custom hooks which make retrieving data and interacting with a database on a SlashDB server via GET, POST, PUT and DELETE calls simple.
The parameters specified for the ```SlashDBProvider``` and the parameters provided to ```useDataDiscovery``` are combined to construct the URL to which the request will be made. For a detailed example, please see the [demo task list app](https://github.com/SlashDB/taskapp-demo)

### useDataDiscovery(database, resource, defaultFilter = '', instanceName = 'default')
```useDataDiscovery``` provides access to the Data Discovery features of SlashDB for interaction with the database.  It takes two required parameters and two optional parameters: the ```database``` name (as configured in SlashDB), and the database ```resource``` (e.g. a table name) to transact with.  Optionally, you can provide a ```defaultFilter``` to use with GET/POST/PUT/DELETE calls (the filter can be overridden if desired).  A filter can be a SlashDB-compatible string, or a ```DataDiscoveryFilter``` object.  For more information, see the [SlashDB Data Discovery documentation](https://docs.slashdb.com/user-guide/using-slashdb/data-discovery/) and the [SlashDB JavaScript SDK](https://github.com/SlashDB/slashdb-js).

The final optional parameter, ```instanceName```, allows transactions with any additional SlashDB instances that have been registered with the app using the ```useSetUp``` hook.  

The hook returns back data from the requested resource when called, and four functions to perform GET/PUT/POST/DELETE requests.  Here's an example of usage:

     import { useDataDiscovery } from 'react-slashdb';
     ...
    const [data, getData, postData, putData, deleteData] = useDataDiscovery(
      '_DatabaseName_',
      '_TableName_',
      '_columnName_/_value_'
    );
    
**Note** - the four functions - ```getData```, ```postData```, ```putData```, ```deleteData``` - all take an optional ```filter``` parameter that allows you to override the ```defaultFilter```, in the form of a SlashDB-compatible filter or a DataDiscoveryFilter object.    They also accept passing HTTP request headers by providing a ```header``` object of key/value pairs as a parameter.  For ```getData``` and ```deleteData```, the ```header``` object is provided as a second optional parameter;  ```postData``` and ```putData``` take it as a third optional parameter.  If you need to set some, but not all, of the optional parameters (e.g. want to pass headers but don't want a filter), just set the unneeded parameter to ```undefined``` or ```null```.

**Return value ```data```** – an array containing the data retrieved from the requested resource.  The data can be used like any JS array, e.g. to map over and construct a group of components:

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

**Return value ```getData```** - ```getData(filter, headers)``` - a function reference to fetch data from the database.   Calls to this function will refresh the current value of ```data``` with new values retrieved from the database from the ```resource``` passed to ```useDataDiscovery```.  If a default filter was passed to ```useDataDiscovery```, the data will be filtered.  Keep in mind that the contents of ```data``` will be overwritten any time this function is called.  If you need to drill down into the database, you can use the ```useDataDiscovery``` hook again with a new set of parameters, or drill down manually into the record set contained in ```data```.
    
    getList('_columnName_/_value_', { _headerKey_ : _headerValue_} );
    or
    getList();

**Return value ```postData```** - ```postData(body, filter, headers)``` - a function reference to add new data to the database.   The function accepts a parameter containing the ```body``` of the POST request, an optional filter (note that cases where this filter would be set for a POST call would be rare) and optional HTTP request headers.  The data provided in the ```body``` should conform to your database schema.  Body data is expected to be a Javascript object or a JSON string by default.  You can provide CSV or XML data in the body, but must provide a request header that sets the ```Content-Type``` to the appropriate MIME type for the data.

    postData({
            column1Name: value,
            column2Name: value
    })
 
**Return value ```putData```** - ```putData(filter, body, headers)``` - a function reference to update records in the database.   The function takes an optional filter parameter, and a Javascript object or JSON string containing containing the body of the PUT request.  The data provided in the ```body``` should conform to your database schema.  As with ```postData```, you can send data in CSV/XML format by setting the ```Content-Type``` header.

    putData('_columnName_/_value_', { column1Name: value });

**Return value ```deleteData```** - ```deleteData(filter, headers)``` - a function reference to remove data from the database.  It takes an optional filter parameter, and accepts an optional header object.

    deleteData('_columnName'_/_value_');

The functions ```postData```, ```putData ``` and ```deleteData``` also refresh the value of ```data``` to reflect the current database state after their operations complete.   This allows state management of the database to be abstracted, removing the need to track the state of ```data``` using React hooks like ```useEffects```.

### useExecuteQuery(queryName, defaultParams, defHttpMethod = 'get', instanceName = 'default')
```useExecuteQuery``` enables the use of the SQL Pass-Thru features of SlashDB.  Queries are created ahead of time in the SlashDB administrative control panel (Configure->Queries); this hook gives the developer the ability to execute those queries.  See the [SlashDB documentation](https://docs.slashdb.com/user-guide/config/queries/) for more information about SQL Pass-Thru.

This hook takes two required parameters: the ```queryName``` as defined in the SlashDB instance configuration, and a ```defaultParams``` object containing key/value pairs of parameters to pass to the query.   It also has two optional parameters.  ```defHttpMethod``` sets the HTTP method to use when executing the query (can be overriden, default is GET).  The ```instanceName``` parameter works exactly the same as described for ```useDataDiscovery```.  It executes the query once and returns the record set as an array of objects, along with a function reference that allows you to execute the query as desired, with the same or different parameters.

    const [queryData, execQuery] = useExecuteQuery(
            'percent-complete',
            { TaskListId: `${TaskListId}` }
    );
    
**Return value ```queryData```** – an array containing the data retrieved from the query.  The data can be used like any JS array. 

**Return value ```execQuery```** - ```execQuery(params, body, httpMethod = undefined, headers = undefined)``` - a function to execute the query passed to ```useExecuteQuery```.  Takes a ```params``` object containing key/value pairs of parameters.  Also accepts a ```body``` parameter, for queries that are configured to use POST/PUT methods.  Note that when executing a query with the POST method, the ```params``` object will be ignored.  Setting ```httpMethod``` will override the ```defHttpMethod``` given to ```useExecuteQuery``` when calling this function - this value should be one of GET/POST/PUT/DELETE.  Finally, a ```headers``` object of key/value pairs representing HTTP request headers can be passed along with the request.
