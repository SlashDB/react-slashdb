/**
 * Custom React hook for ease of state management with use of SlashDB and SDK.
 */
// import React built-in hooks to use under the hood.
import { useState, useEffect, useContext, useRef } from 'react';



// import custom context for retrieving primary SlashDB instance config
import { SlashDBContext } from './Context';

// required JavaScript SDK classes
import { SlashDBClient, DataDiscoveryResource, SQLPassThruQuery } from '@slashdb/js-slashdb';

// list of SlashDB clients for use by hooks
const sdbClientRegistry = {}
/**
 * Create a SlashDB client object for use with hooks and store in a local registry.  If no parameters are provided, create a client object using
 * the parameters configured with the SlashDBProvider component
 * @param {string} [instanceName] a name to identify the client in the registry; if not provided, will be named 'default'
 * @param {Object} [config] holds the setup parameter: config is an object of key value pairs.
 * @param {string} [config.host] hostname of the SlashDB instance to connect to, with protocol/port
 * @param {string} [config.apiKey] API key for the username
 * @param {Object} [config.sso] optional settings to login with Single Sign-On
 * @param {Object} [config.sso.idpId] optional identity provider id configured in SlashDB
 * @param {Object} [config.sso.redirectUri] optional redirect uri to redirect browser after sign in
 * @param {Object} [config.sso.popUp] optional flag to sign in against the identity provider with a Pop Up window (false by default)
 * @returns {SlashDBClient} a reference to the SlashDB client that was created
  */
const useSetUp = (instanceName = 'default', config = undefined) => {
  
  // // if instance already exists and host parameter is provided, warn about overwrite
  // if (sdbClientRegistry.hasOwnProperty(instanceName) && host) {
  //   console.warn(`A SlashDB client with the name '${instanceName}' already exists, overwriting`);
  // } 

  // handling for the special default instanceName 
  if (instanceName === 'default') {
    // try and get SlashDBProvider config, if it exists
    const { setUpOptions } = useContext(SlashDBContext);

    // when the default hasn't been created yet
    if (!sdbClientRegistry.hasOwnProperty('default')) {
      // if SlashDBProvider configured, create default using its config
      if (setUpOptions) {
        sdbClientRegistry['default'] = new SlashDBClient(setUpOptions);
      }
      else {
        sdbClientRegistry['default'] = new SlashDBClient(config);
      }     
    }      

    else {
      if (config) {
        // if SlashDBProvider component configured and and attempting to overwrite default, don't allow
        if (setUpOptions) {
          console.warn(`SlashDB client 'default' was previously configured with SlashDBProvider - cannot overwrite`); 
        }
        else {
          sdbClientRegistry['default'] = new SlashDBClient(config);
        }
      }
    }
    return sdbClientRegistry['default'];        
  }

  // when host parameter provided, overwrite client object
  else if (config) {
    sdbClientRegistry[instanceName] = new SlashDBClient(config);
  }
  
  return sdbClientRegistry[instanceName];
};

/**
 * Create a fetch function with SlashDB credentials, after a successful login.
 * @param {string} [instanceName] a name to identify the client in the registry; if not provided, will be named 'default'
 * @returns {fetch} a reference to the fetch client with updated credential headers.
  */
const useFetcher = (instanceName = 'default') => {
  const sdbClient = sdbClientRegistry[instanceName];

  function updateOptions(sdbClient, options = {}) {
    const update = { ...options };
  
    const headers = sdbClient.sdbConfig.getHeaders();
    update.headers = {
      ...update.headers,
      ... headers
    };
  
    return update;
  }

  function fetcher(url, options = {}){
    return fetch(url, updateOptions(sdbClient, options));
  }

  return fetcher;
};

/**
 * Hook for accessing SlashDB Data Discovery feature
 *
 * @param {string} database name of the database containing the desired resource/table
 * @param {string} resource the resource/table to discover
 * @param {string | DataDiscoveryFilter} [defaultFilter] optional string/DataDiscovery filter object containing a default filter for the resource
 * @param {string} [instanceName] optional name of SlashDB client that has been previously created with useSetUp() hook; default is 'default'
 * @returns {array} array, first element is data for given resource/table and subsequent elements are function references to execute on-demand GET/POST/PUT/DELETE calls on the resource
 */
const useDataDiscovery = (
  database,
  resource,
  defaultFilter = '',
  instanceName = 'default'
) => {
  
  const sdbClient = sdbClientRegistry[instanceName];

  const isMountedRef = useRef(null);

  const [data, setData] = useState([]);
  const [didUpdate, setDidUpdate] = useState(new Date().getTime());

  const handleSetData = (data) => {
    setData(data);
  };

  const handleUpdate = () => {
    setDidUpdate(new Date().getTime());
  };

  const dbResource = new DataDiscoveryResource(database, resource, sdbClient);
 
  
  /**
   * executes GET HTTP requests on resource
   * 
   * @param {string | DataDiscoveryFilter} [filter] optional string/DataDiscovery filter object containing a filter for the resource
   * @param {Object} [headers] object of key/value pairs containing headers for the HTTP request
   */
  const _get = async (filter, headers) => {
    filter = filter ? filter : defaultFilter;
    
    if (headers) {
      dbResource.setExtraHeaders(headers);
    }

    try {
      const r = await dbResource.get(filter);
      handleSetData(r.data);
      dbResource.extraHeaders = {};
    }
    catch(e) {
      dbResource.extraHeaders = {};
      console.error(e);
	  throw Error(e);
    }
  };

  /**
   * executes POST HTTP requests on resource
   * 
   * @param {string | Object} body payload for POST request (usually a JavaScript object)
   * @param {string | DataDiscoveryFilter} [filter] optional string/DataDiscovery filter object containing a filter for the resource
   * @param {Object} [headers] object of key/value pairs containing headers for the HTTP request
   */
  const _post = async (body, filter, headers) => {
    filter = filter ? filter : defaultFilter;

    if (headers) {
      dbResource.setExtraHeaders(headers);
    }

    try {
      await dbResource.post(body, filter)
        .then(handleUpdate);
      dbResource.extraHeaders = {};
    }
    catch(e) {
      dbResource.extraHeaders = {};
      console.error(e);
	  throw Error(e);
    }
  };

  /**
   * executes PUT HTTP requests on resource
   * 
   * @param {string | DataDiscoveryFilter} [filter] optional string/DataDiscovery filter object containing a filter for the resource
   * @param {string | Object} body payload for POST request (usually a JavaScript object) 
   * @param {Object} [headers] object of key/value pairs containing headers for the HTTP request
   */
    const _put = async (filter, body, headers) => {
      filter = filter ? filter : defaultFilter;

      if (headers) {
        dbResource.setExtraHeaders(headers);
      }

      try {
        await dbResource.put(filter, body)
          .then(handleUpdate);
        dbResource.extraHeaders = {};
      }
      catch(e) {
        dbResource.extraHeaders = {};
        console.error(e);
		throw Error(e);
      }
    }

  /**
   * executes DELETE HTTP requests on resource
   * 
   * @param {string | DataDiscoveryFilter} [filter] optional string/DataDiscovery filter object containing a filter for the resource
   * @param {Object} [headers] object of key/value pairs containing headers for the HTTP request
   */
  const _delete = async (filter, headers) => {
    filter = filter ? filter : defaultFilter;

    if (headers) {
      dbResource.setExtraHeaders(headers);
    }

    try {
      await dbResource.delete(filter)
        .then(handleUpdate);
      dbResource.extraHeaders = {};
    }
    catch(e) {
      dbResource.extraHeaders = {};
      console.error(e);
	  throw Error(e);
    }
  };


  useEffect( () => {
    isMountedRef.current = true;
    if (isMountedRef.current) {
      
      async function getData() {
        const r = await dbResource.get(defaultFilter);
        handleSetData(r.data);
      };

      try {
        getData();
      }
      catch(e) {
        console.error(e);
		throw Error(e);
      }
    }
    return () => (isMountedRef.current = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didUpdate]);

  return [data, _get, _post, _put, _delete];
};



/**
 * Hook for accessing SlashDB SQL Pass-Thru feature
 *
 * @param {string} queryName name of the query to execute
 * @param {string | SQLPassThruFilter} [defaultParams] optional string/SQLPassThruFilter filter object containing parameters for the query
 * @param {string} defHttpMethod optional parameter to set the HTTP method used by the query; default is 'get'
 * @param {string} [instanceName] optional name of SlashDB client that has been previously created with useSetUp() hook; default is 'default'
 * @returns {array} array, first element is data for given resource/table and second element is function reference to execute query on demand
 */

const useExecuteQuery = (
  queryName,
  defaultParams,
  defHttpMethod = 'get',
  instanceName = 'default'
) => {
  
  const sdbClient = sdbClientRegistry[instanceName];
  const sqlQuery = new SQLPassThruQuery(queryName, sdbClient);

  const isMountedRef = useRef(null);

  const [data, setData] = useState([{}]);

  const handleDataSet = (data) => {
    setData(data);
  };

  /**
   * Function to be used for query execution after initial useExecuteQuery has been called
   *
   * @param {String} httpMethod GET, POST, PUT or DELETE - HTTP method to be used.
   * @param {array} parameters Any params user may wish to pass for query.
   * @param {Object} queryStrParameters Query params in key value pairs format to be send via url eg. {limit: 29} => ?limit=29
   * @param {Object} headers Any headers user may wish to pass.
   */
  const _executeQuery = async (
    params,
    body,
    httpMethod = undefined,
    headers = undefined
  ) => {

    params = params ? params : defaultParams;
    httpMethod = httpMethod ? httpMethod : defHttpMethod;

    if (headers) {
      sqlQuery.setExtraHeaders(headers);
    }

    try {
      const method = httpMethod.toLowerCase();
      // post method has body as required arg in position 1, and parameter is optional
      // so flip them around.  also, post method in SQL Pass Thru doesn't accept URL parameters and a body data
      // so set the parameters arg to undefined
      if (method === 'post') {
        [params,body] = [body,params];
        body = undefined;
      }
      const r = await sqlQuery[method](params, body);
      handleDataSet(r.data);
      sqlQuery.extraHeaders = {};
    }
    catch(e) {
      sqlQuery.extraHeaders = {};
      console.error(e);
	  throw Error(e);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (isMountedRef.current) {
      _executeQuery(defaultParams);
    }
    return () => (isMountedRef.current = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defHttpMethod]);

  return [data, _executeQuery];
};

/** Helper to logout and remove SlashDB clients - used in Auth logout method
 * 
 * @param {string} [instanceName] the SlashDB client instance to log out; if undefined, all clients are logged out
*/
export function removeSdbClients(instanceName = undefined) {
  if (instanceName) {
    if (!sdbClientRegistry.hasOwnProperty(instanceName)) {
      throw Error(`Client '${instanceName}' does not exist`);
    }
    sdbClientRegistry[instanceName].logout();
    delete sdbClientRegistry[instanceName];
  }
  else {
    Object.keys(sdbClientRegistry).forEach( instanceName => {
      sdbClientRegistry[instanceName].logout();
      delete sdbClientRegistry[instanceName];
    });
  }
}

/** Helper to check client authentication status - used in Auth clientIsAuthenticated method
 * @param {string} instanceName the SlashDB client instance check
 * @returns {boolean} flag indicating if client is currently authenticated to SlashDB server
*/
export async function checkClientAuthStatus(instanceName) {
  if (!sdbClientRegistry.hasOwnProperty(instanceName)) {
    console.warn(`Client '${instanceName}' does not exist`);
    return false;
  }
  const status = await sdbClientRegistry[instanceName].isAuthenticated();
  return status;
}


export { useSetUp, useDataDiscovery, useExecuteQuery, useFetcher };
