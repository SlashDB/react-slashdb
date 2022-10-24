## SlashDB React SDK Demo App

Showcases basic functionality of SlashDB React SDK features

### Installation
* Copy this folder and subfolders to a new folder and open in a shell
* Run `npm install` - _will install React and SlashDB SDK packages_
* _Optional_ - edit the file `src/App.js` and update the `host`, `username`, `apiKey` parameters for your SlashDB configuration
* Run `npm start`

### App.js Details
Here is a simple functional component that uses the SlashDB React SDK to retrieve and update data and execute queries.  The full source code is [**here**](https://github.com/SlashDB/react-slashdb/blob/main/demo_app/src/App.js).  
* First, set the configuration for SlashDB and use the `useSetup` hook to store this configuration.  Then, call the `useDataDiscovery`, and `useExecuteQuery` hooks to configure access to the resources that we need.  The `useDataDiscovery` and `useExecute` hooks return a data array and functions that we can call to interact with the data.  On any call to these functions, `useEffect` is invoked, so we don't need to worry about storing the state of the data that we are working with - the SDK will refresh the DOM for us when the functions are called and data is retrieved or modified.

```
import { useState } from 'react';
import { useSetUp, useDataDiscovery, useExecuteQuery } from '@slashdb/react-slashdb';

const SDBDemo = () => {

    // UI state values
	const [values,updateField] = useState({'mintotal':20,'maxtotal':100});	// set defaults for SQL Pass-Thru query parameters
	const [filter,updateFilter] = useState({});

	const [values,updateField] = useState({'mintotal':20,'maxtotal':100});	// set defaults for SQL Pass-Thru query parameters
	const [filter,updateFilter] = useState({});
	
	// useSetup parameters - SlashDB config
	const host = "https://demo.slashdb.com";	// set SlashDB host here
	const username = null;	// set SlashDB username here
	const apiKey = null;	// set SlashDB API key here
	
	// useSetup hook - useDataDiscovery/useExecuteQuery cannot run until this hook has been executed
	useSetUp('default', host, username, apiKey);
	
	// useDataDiscovery parameters
	const database = "Chinook";
	const resource = "Customer";
	// useDataDiscovery hook - interact with a database resource in the SlashDB instance configured with useSetup hook
	const [resourceData, getResource, postResource, putResource, deleteResource] = useDataDiscovery(database, resource);

	// useExecuteQuery parameters
	const queryName = "invoices-total-range";
	const defaultParams = 'mintotal/20/maxtotal/100';
	// useExecuteQuery hook - interact with a query that is configured in the SlashDB instance configured with useSetup hook
	const [queryData, execQuery] = useExecuteQuery(queryName, defaultParams);
```

* Then we create a few functions that will be triggered in the UI to peform operations:
```
	// sample PUT usage with filter - updates customer fields
	const updateRecord = async (e) => {
		if (values[e.target.value]) {
			const filterDef = `CustomerId/${e.target.value}`;	// create a SlashDB-compatible filter
			document.querySelector(`td#customer${e.target.value}`).innerHTML = `Working...`;
			try { 
				await putResource(filterDef, values[e.target.value]);
				document.querySelector(`td#customer${e.target.value}`).innerHTML = `Updated`;

				// remove the row key once the row values have been updated
				updateField( (values) => {
					delete values[e.target.value];
					return values;
				})
			}
			catch(error) {
				document.querySelector(`td#customer${e.target.value}`).innerHTML = `Error updating`;				
			}
		}
	}

	// sample GET usage with wildcard filter 
	const filterResults = async (e) => {
		const col = e.target.name;
		const val = e.target.value;
		const updatedFilter = {...filter, [col]:val};

		// handle null filter values
		if (! e.target.value) {
			console.log(e.target.value)
			delete(updatedFilter[col]);
		}

		let filterString = '';
		for (const f in updatedFilter) {
			filterString += `${f}/${updatedFilter[f]}*/`;	// create SlashDB-compatible filter
		}
		
		filterString = filterString.slice(0,filterString.length-1); // chop the trailing '/'
		try { 
			await getResource(filterString);
			updateFilter(updatedFilter); 		// store the updated filter state
		}
		catch(error) {
			console.log(error);
		}
	}	

	// get query parameters and execute query
	const fireQuery = (e) => {
		const mintotal = values['mintotal'];
		const maxtotal = values['maxtotal'];
		const filterDef = `mintotal/${mintotal}/maxtotal/${maxtotal}`;	// SlashDB-compatible filter
		execQuery(filterDef);
	}	
```
* Here, we display the data that we are accessing with `useDataDiscovery` and `useExecuteQuery`:
``` 
	//  data retrieval from useDataDiscovery hook
	let resourceTable = resourceData.map( record => {
		return (
			<tr key={record.CustomerId}>
				<td><input type="text" name="FirstName" defaultValue={record.FirstName} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="LastName" defaultValue={record.LastName} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="City" defaultValue={record.City} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="State" defaultValue={record.State} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>
				<td><input type="text" name="Country" defaultValue={record.Country} onChange={e => handleUpdateField(e, record.CustomerId)}/></td>					
				<td><button value={record.CustomerId} onClick={e => updateRecord(e)}>Update Record</button></td>
				<td id={`customer${record.CustomerId}`}></td>
			</tr>
		);
	})
	

	// data retrieval from useExecuteQuery hook
	let queryTable = queryData.map( (record, i) => {
		return (
			<tr key={i}>
				<td>{record.InvoiceId}</td>
				<td>{record.CustomerId}</td>
				<td>{record.InvoiceDate}</td>
				<td>{record.BillingAddress}</td>
				<td>{record.BillingCity}</td>
				<td>{record.BillingState}</td>
				<td>{record.BillingCountry}</td>
				<td>{record.BillingPostalCode}</td>
				<td>{record.Total}</td>
			</tr>
		);
	})	
	
	return ( ... ) // render tables with data
		
}
```
