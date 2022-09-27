/**
 * Custom React hook for ease of state management with use of SlashDB and SDK.
 */
//Import React built-in hooks to use under the hood.
import { useState, useEffect, useContext, useRef } from 'react';
//Import vanilla JS class from SDK.
//import { default as slashDB } from './slashdb';
//Import custom context for use of param passing thoughout project.
import { SlashDBContext } from './Context';
import { SlashDBClient } from '@slashdb/js-sdk/slashdbclient.js';

import { DataDiscoveryResource } from "@slashdb/js-sdk/datadiscovery.js";
import { SQLPassThruQuery } from "@slashdb/js-sdk/sqlpassthru.js";

// list of clients for use by hooks
const sdbClientList = {}
/**
 * Take values for baseUrl and setUpOptions passed to SlashDBContext via evoking.
 * SlashDBProvider at top level of user/client project and call method setUp passing
 * those params.
 */
const useSetUp = (client = 'default', host = undefined, username = undefined, apiKey = undefined, password = undefined) => {
  
  if (client === 'default') {
    if (!sdbClientList.hasOwnProperty('default')) {
      const { baseUrl, setUpOptions } = useContext(SlashDBContext);
      sdbClientList['default'] = new SlashDBClient(baseUrl, setUpOptions.username, setUpOptions.apiKey, setUpOptions.password);
    }
  }
  else {
    if (!sdbClientList.hasOwnProperty(client)) {
      sdbClientList[client] = new SlashDBClient(host, username, apiKey, password);
    }
  }
  //const client = slashDB.setUp(baseUrl, setUpOptions);
  return sdbClientList[client];
};


/**
 * Hook for use of datadiscovery feature of SlashDB.
 *
 * @param {String} database Name of database to be accessed.
 * @param {array} defaultFilterParameters Array with names of resources to be accesed i.e. table name, column name, comlumn value
 * e.g. [Album, AlbumId, 1, Artist]
 * @param {Object} queryStrParameters Query params in key value pairs format to be sent via url e.g. {limit: 29} => ?limit=29
 * @returns {array} Array with data accessed (usually whole database)
 * and GET, POST, PUT and DELETE functions for interaction with the data accessed.
 */
const useDataDiscovery = (
  database,
  resource,
  defaultFilter = '',
  client = 'default'
) => {
  //Redundant call - in case user did not call useSetUp at top level of project
  const sdbClient = sdbClientList[client];

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
 
  
  //filterParam rename
  /**
   *
   * @param {array} defaultFilterParameters Array with names of resources to be accesed i.e. table name, column name, comlumn value
   * eg. [Album, AlbumId, 1, Artist]
   * @param {Object} queryStrParameters Query params in key value pairs format to be sent via url e.g. {limit: 29} => ?limit=29
   * @param {Object} headers Any headers user may wish to pass.
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
    }
  };

  /**
   *
   * @param {array} defaultFilterParameters Array with names of resources to be accesed i.e. table name, column name, comlumn value
   * e.g. [Album, AlbumId, 1, Artist]
   * @param {Object} body Payload to be delivered.
   * @param {Object} queryStrParameters Query params in key value pairs format to be send via url eg. {limit: 29} => ?limit=29
   * @param {Object} headers Any headers user may wish to pass.
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
    }
  };

  /**
   *
   * @param {array} defaultFilterParameters Array with names of resources to be accesed i.e. table name, column name, comlumn value
   * e.g. [Album, AlbumId, 1, Artist]
   * @param {Object} body Payload to be delivered.
   * @param {Object} queryStrParameters Query params in key value pairs format to be send via url e.g. {limit: 29} => ?limit=29
   * @param {Object} headers Any headers user may wish to pass.
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
      }
    }

  /**
   *
   * @param {array} defaultFilterParameters Array with names of resources to be accesed i.e. table name, column name, comlumn value
   * e.g. [Album, AlbumId, 1, Artist]
   * @param {Object} queryStrParameters Query params in key value pairs format to be send via url e.g. {limit: 29} => ?limit=29
   * @param {*} headers Any headers user may wish to pass.
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
    }
  };


  useEffect( async () => {
    isMountedRef.current = true;
    if (isMountedRef.current) {
      try {
        const r = await dbResource.get(defaultFilter);
        handleSetData(r.data);
      }
      catch(e) {
        console.error(e);
      }
    }
    return () => (isMountedRef.current = false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [didUpdate]);

  return [data, _get, _post, _put, _delete];
};


/**
 * Function for executing query from slashDB server on a database
 *
 * @param {String} defHttpMethod GET, POST, PUT or DELETE - HTTP method to be used
 * @param {String} queryID ID/name of query as is in SlashDB server interface/config files
 * @param {Object} defParameters Params for query being executed e.g. if query requires itemID the pass object with key
 * value pair { itemID: `itemID_Value`,}.
 * @param {Object} defQueryStrParameters Query params in key value pairs format to be send via url eg. {limit: 29} => ?limit=29
 * @returns {array} [data, _executeQuery] data received as payload from response to query and function to be called for further
 * query execution
 */
const useExecuteQuery = (
  queryName,
  defaultParams,
  defHttpMethod = 'get',
  client = 'default'
) => {
  //redundant call - in case user did not call useSetUp at top level of project
  const sdbClient = sdbClientList[client];
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

export { useSetUp as default, useDataDiscovery, useExecuteQuery };
